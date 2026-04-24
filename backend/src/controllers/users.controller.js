import { supabase } from "../lib/supabaseClient.js";

export const createUsers = async (req, res) => {
  try {
    const { email, name, phone, department_id, role } = req.body;

    const DEFAULT_PASSWORD = "Temp1234"; //Temporary Password (HARDCODE) for DEMO purposes only

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { name, phone },
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const user_id = authData.user.id;

    const { error: memberError } = await supabase
      .from("user_membership")
      .insert({ user_id, department_id, role });

    if (memberError) return res.status(400).json({ error: memberError.message });

    res.status(201).json({ message: "User created", user_id, tempPassword: DEFAULT_PASSWORD });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: fetch user to ADMIN_DASHBOARD
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

// PUT /api/users/:user_id
export const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email, phone, department_id, role } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name, email, phone })
      .eq('user_id', user_id);

    if (profileError) return res.status(500).json({ error: profileError.message });

    // Update user_membership table (role + department)
    const { error: memberError } = await supabase
      .from('user_membership')
      .update({ role, department_id, updated_at: new Date().toISOString() })
      .eq('user_id', user_id);

    if (memberError) return res.status(500).json({ error: memberError.message });

    return res.status(200).json({ success: true, message: 'User updated successfully' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/users/:user_id
export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Delete from Supabase Auth (cascades to profiles if FK is set)
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);

    if (authError) return res.status(500).json({ error: authError.message });

    return res.status(200).json({ success: true, message: 'User deleted successfully' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
