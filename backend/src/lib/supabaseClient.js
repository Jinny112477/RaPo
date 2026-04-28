import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY:", supabaseKey?.slice(0, 40));

export const supabase = createClient(supabaseUrl, supabaseKey);
