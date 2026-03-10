import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabaseClient = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.warn("Supabase init failed, using mock data:", e.message);
}

export const supabase = supabaseClient;

export function isConfigured() {
  // Demo mode forces mock data even if Supabase is configured
  if (typeof localStorage !== "undefined" && localStorage.getItem("fieldstack_demo") === "1") {
    return false;
  }
  return supabaseClient !== null;
}

// Table name constants (matching SQL schema)
export const TABLES = {
  CONTACTS: "contacts",
  COMPANIES: "companies",
  OPPORTUNITIES: "opportunities",
  JOBS: "jobs",
  SCHEDULE_PHASES: "schedule_phases",
  TEAM_MEMBERS: "team_members",
  MILESTONES: "milestones",
  ESTIMATES: "estimates",
  PROGRESS_PHOTOS: "progress_photos",
  AUDIT_LOG: "audit_log",
  SALES_TARGETS: "sales_targets",
};
