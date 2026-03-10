import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Only create a real client if credentials are provided;
// otherwise use a dummy placeholder to avoid crashing at import time.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder");

export function isConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Table name constants (matching SQL schema)
export const TABLES = {
  CONTACTS: "contacts",
  COMPANIES: "companies",
  OPPORTUNITIES: "opportunities",
  JOBS: "jobs",
  SCHEDULE_PHASES: "schedule_phases",
};
