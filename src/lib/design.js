// FieldStack Design System — shared constants
export const BRAND = {
  blue: "#4285F4",
  blueSoft: "#E8F0FE",
  blueHover: "#3367D6",
  blueMuted: "#A8C7FA",
  green: "#34A853",
  greenSoft: "#E6F4EA",
  amber: "#FBBC04",
  amberSoft: "#FEF7E0",
  red: "#EA4335",
  redSoft: "#FCE8E6",
  purple: "#A142F4",
  purpleSoft: "#F3E8FD",
  white: "#FFFFFF",
  surface: "#F8FAFB",
  surfaceHover: "#F1F3F4",
  border: "#E8EAED",
  borderStrong: "#DADCE0",
  textPrimary: "#202124",
  textSecondary: "#5F6368",
  textTertiary: "#9AA0A6",
  shadow: "rgba(60, 64, 67, 0.08)",
  shadowMd: "rgba(60, 64, 67, 0.15)",
};

export const FONT = "'Nunito', 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif";

// Stage definitions for pipeline
export const STAGES = [
  { key: "Lead", color: BRAND.purple, softColor: BRAND.purpleSoft },
  { key: "Qualified", color: BRAND.blue, softColor: BRAND.blueSoft },
  { key: "Proposal Sent", color: BRAND.amber, softColor: BRAND.amberSoft },
  { key: "Negotiation", color: BRAND.red, softColor: BRAND.redSoft },
  { key: "Won", color: BRAND.green, softColor: BRAND.greenSoft },
  { key: "Lost", color: BRAND.textTertiary, softColor: BRAND.surfaceHover },
];

// Job statuses
export const JOB_STATUSES = ["On Track", "Delayed", "At Risk", "Completed", "On Hold"];

// Helper to get stage colors
export function getStageStyle(stageName) {
  const stage = STAGES.find(s => s.key === stageName) || STAGES[0];
  return { color: stage.color, bg: stage.softColor };
}

// Format currency
export function formatCurrency(val) {
  if (typeof val === "string") val = parseFloat(val.replace(/[^0-9.]/g, ""));
  if (!val || isNaN(val)) return "$0";
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

// Format full currency
export function formatFullCurrency(val) {
  if (typeof val === "string") val = parseFloat(val.replace(/[^0-9.]/g, ""));
  if (!val || isNaN(val)) return "$0";
  return `$${val.toLocaleString()}`;
}

// Date helpers
export function daysAgo(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
