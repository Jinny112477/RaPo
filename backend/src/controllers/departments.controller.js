import { supabase } from "../lib/supabaseClient.js";

export const getDepartments = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("department_id, department_name")
      .order("department_name", { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        error: "Fetch departments failed",
        detail: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Fetch departments failed",
      detail: err.message,
    });
  }
};
