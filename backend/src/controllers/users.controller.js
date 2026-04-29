import { supabase } from "../lib/supabaseClient.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// Password generator
const generateTempPassword = () => {
  return crypto.randomBytes(6).toString("base64"); // ~8-10 chars
};

// POST: create user
export const createUsers = async (req, res) => {
  try {
    const { email, name, phone, department_id, role } = req.body;

    if (!email || !name || !department_id || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data: existingUser } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const tempPassword = generateTempPassword();

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name, phone },
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const user_id = authData.user.id;

    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id,
      email,
      name,
      phone,
      password_change: false,
      login_attempts: 0,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(user_id);
      return res.status(400).json({ error: profileError.message });
    }

    const { error: memberError } = await supabase
      .from("user_membership")
      .upsert({ user_id, department_id, role });

    if (memberError) {
      await supabase.auth.admin.deleteUser(user_id);
      return res.status(400).json({ error: memberError.message });
    }

    try {
      await sendEmail({
        to: email,
        subject: "Your Account Created",
        //เดะมาแก้เนื้อหาใน email อีกที🔴
        text: `
            Hello ${name},

            Your account has been created.

            Email: ${email}
            Temporary Password: ${tempPassword}

            Please login and change your password immediately.
        `,
      });
    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError);
    }

    return res.status(201).json({
      message: "User created successfully",
      user_id,
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// GET: fetch user to ADMIN_DASHBOARD
export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from("profiles").select(`
            user_id,
            email,
            phone,
            name,
            user_membership (
                department_id,
                role,
                departments (
                    department_id,
                    department_name
                )
            )
        `);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/:user_id
export const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email, phone, department_id, role } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      user_id,
      { email },
    );

    if (authError) {
      return res.status(500).json({ error: authError.message });
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name, email, phone })
      .eq("user_id", user_id);

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    const { error: memberError } = await supabase
      .from("user_membership")
      .upsert({
        user_id,
        department_id,
        role,
        updated_at: new Date().toISOString(),
      });

    if (memberError) {
      return res.status(500).json({ error: memberError.message });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/users/:user_id
export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Delete from Supabase Auth (cascades to profiles if FK is set)
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);

    if (authError) return res.status(500).json({ error: authError.message });

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// CHECK IF FIRST TIME LOGIN
const checkFirstLogin = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("password_change")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (!profile.password_change) {
    router.push("/change-password");
  } else {
    router.push("/dashboard");
  }
};
