import { supabase } from "../lib/supabaseClient.js";

export const createUsers = async (req, res) => {
  try {
    const { email, name, phone, department_id, role } = req.body;
    console.log("BODY:", req.body);

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-8),
        email_confirm: true,
        user_metadata: { name, phone },
      });

    console.log(
      "AUTH RESULT:",
      JSON.stringify(authData),
      JSON.stringify(authError),
    ); // ✅

    if (authError) return res.status(400).json({ error: authError.message });

    const user_id = authData.user.id;

    const { error: memberError } = await supabase
      .from("user_membership")
      .insert({ user_id, department_id, role });

    console.log("MEMBER ERROR:", JSON.stringify(memberError)); // ✅

    if (memberError)
      return res.status(400).json({ error: memberError.message });

    res.status(201).json({ message: "User created", user_id });
  } catch (err) {
    console.log("CATCH:", err.message); // ✅
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
        .from("profiles")
        .select(`
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

// PUT: update user profile

// PUT: update user account status

// PUT: update user role --> accessibility

// DELETE: delete user profile
