import { useState, useEffect, useRef } from "react";

// FieldStack Design System — Google-inspired, soft, clean, rounded
// Brand palette, typography, iconography, and core UX patterns
const BRAND = {
  // Primary
  blue: "#4285F4",
  blueSoft: "#E8F0FE",
  blueHover: "#3367D6",
  blueMuted: "#A8C7FA",
  // Accent
  green: "#34A853",
  greenSoft: "#E6F4EA",
  amber: "#FBBC04",
  amberSoft: "#FEF7E0",
  red: "#EA4335",
  redSoft: "#FCE8E6",
  purple: "#A142F4",
  purpleSoft: "#F3E8FD",
  // Neutrals
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

// --- SVG ICON COMPONENTS ---
const Icons = {
  Dashboard: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  ),
  Pipeline: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 2 5-8" />
    </svg>
  ),
  Jobs: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  Contacts: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
    </svg>
  ),
  Calendar: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  ),
  Timeline: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="8" height="4" rx="1" />
      <rect x="7" y="10" width="10" height="4" rx="1" />
      <rect x="5" y="16" width="12" height="4" rx="1" />
    </svg>
  ),
  Settings: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Search: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  Bell: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Plus: ({ size = 20, color = BRAND.white }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  ChevronDown: ({ size = 16, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Grid: ({ size = 18, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Kanban: ({ size = 18, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="16" rx="1" />
      <rect x="10" y="3" width="5" height="10" rx="1" />
      <rect x="17" y="3" width="5" height="13" rx="1" />
    </svg>
  ),
  MoreH: ({ size = 18, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="5" cy="12" r="1" fill={color} />
      <circle cx="12" cy="12" r="1" fill={color} />
      <circle cx="19" cy="12" r="1" fill={color} />
    </svg>
  ),
  ArrowUp: ({ size = 14, color = BRAND.green }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  Hardhat: ({ size = 20, color = BRAND.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h20M4 18v-3a8 8 0 0116 0v3" />
      <path d="M12 3v4" />
    </svg>
  ),
};

// --- FONT IMPORT ---
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector('link[href*="Nunito"]')) document.head.appendChild(fontLink);

const FONT = "'Nunito', 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif";

// --- ANIMATION KEYFRAMES ---
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes fs-fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fs-slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  @keyframes fs-scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  @keyframes fs-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes fs-barGrow { from { width:0%; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .fs-hover-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .fs-hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px ${BRAND.shadow}; }
  .fs-nav-item { transition: background 0.15s ease, color 0.15s ease; }
  .fs-nav-item:hover { background: ${BRAND.surfaceHover}; }
  .fs-view-btn { transition: all 0.15s ease; }
  .fs-view-btn:hover { background: ${BRAND.surfaceHover}; }
  input::placeholder { color: ${BRAND.textTertiary}; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: ${BRAND.borderStrong}; border-radius: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
`;
if (!document.querySelector("style[data-fs]")) {
  styleTag.setAttribute("data-fs", "1");
  document.head.appendChild(styleTag);
}

// --- DATA ---
const PIPELINE_DATA = [
  { stage: "Lead", color: BRAND.purple, softColor: BRAND.purpleSoft, count: 12, value: "$284K", items: [
    { name: "Martinez Residence", company: "Martinez Family", value: "$42,000", days: 3 },
    { name: "Oakwood Fence Install", company: "Oakwood HOA", value: "$18,500", days: 7 },
    { name: "Downtown Loft Remodel", company: "Vertex Properties", value: "$96,000", days: 1 },
  ]},
  { stage: "Qualified", color: BRAND.blue, softColor: BRAND.blueSoft, count: 8, value: "$520K", items: [
    { name: "Hillcrest HVAC Overhaul", company: "Hillcrest Medical", value: "$134,000", days: 5 },
    { name: "River Walk Landscaping", company: "City of Millbrook", value: "$67,000", days: 12 },
  ]},
  { stage: "Proposal Sent", color: BRAND.amber, softColor: BRAND.amberSoft, count: 5, value: "$312K", items: [
    { name: "Beacon St. Security System", company: "Beacon Condos", value: "$28,000", days: 4 },
    { name: "Elm Park AV Install", company: "Elm Park School", value: "$156,000", days: 8 },
  ]},
  { stage: "Won", color: BRAND.green, softColor: BRAND.greenSoft, count: 3, value: "$198K", items: [
    { name: "Sunset Ridge Build-Out", company: "Apex Development", value: "$142,000", days: 0 },
  ]},
];

const TODAY_JOBS = [
  { id: "JOB-2026-0038", name: "Sunset Ridge Build-Out", site: "1420 Sunset Ridge Dr", crew: "Team Alpha", phase: "Foundation", progress: 35, status: "On Track" },
  { id: "JOB-2026-0035", name: "Beacon St. Security", site: "88 Beacon St, Unit 4", crew: "Team Bravo", phase: "Wiring", progress: 72, status: "On Track" },
  { id: "JOB-2026-0031", name: "River Walk Phase 2", site: "River Walk Park, Sec B", crew: "Team Charlie", phase: "Grading", progress: 15, status: "Delayed" },
];

const METRICS = [
  { label: "Active Jobs", value: "14", change: "+2", trend: "up" },
  { label: "Pipeline Value", value: "$1.31M", change: "+12%", trend: "up" },
  { label: "Win Rate", value: "68%", change: "+4%", trend: "up" },
  { label: "Due This Week", value: "7", change: "", trend: "neutral", sub: "milestones" },
];

const NAV_ITEMS = [
  { icon: Icons.Dashboard, label: "Dashboard", active: true },
  { icon: Icons.Pipeline, label: "Pipeline" },
  { icon: Icons.Jobs, label: "Jobs" },
  { icon: Icons.Contacts, label: "Contacts" },
  { icon: Icons.Calendar, label: "Schedule" },
  { icon: Icons.Timeline, label: "Timeline" },
];

// --- COMPONENTS ---
function Sidebar({ activeNav, onNav }) {
  return (
    <div style={{
      width: 232,
      minHeight: "100vh",
      background: BRAND.white,
      borderRight: `1px solid ${BRAND.border}`,
      display: "flex",
      flexDirection: "column",
      fontFamily: FONT,
      padding: "0",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${BRAND.blue} 0%, #6EA8FE 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Icons.Hardhat size={18} color={BRAND.white} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: BRAND.textPrimary, letterSpacing: -0.3 }}>
          FieldStack
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: "4px 10px", flex: 1 }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = activeNav === i;
          return (
            <div
              key={item.label}
              className="fs-nav-item"
              onClick={() => onNav(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
                background: isActive ? BRAND.blueSoft : "transparent",
                marginBottom: 2,
                animation: `fs-slideIn 0.3s ease ${i * 0.04}s both`,
              }}
            >
              <item.icon size={20} color={isActive ? BRAND.blue : BRAND.textSecondary} />
              <span style={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? BRAND.blue : BRAND.textSecondary,
                fontFamily: FONT,
              }}>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px 16px", borderTop: `1px solid ${BRAND.border}` }}>
        <div className="fs-nav-item" style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 10, cursor: "pointer",
        }}>
          <Icons.Settings size={20} color={BRAND.textSecondary} />
          <span style={{ fontSize: 14, fontWeight: 500, color: BRAND.textSecondary, fontFamily: FONT }}>Settings</span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 12px 4px",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.blue} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: BRAND.white, fontFamily: FONT,
          }}>SM</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>Smithers</div>
            <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div style={{
      height: 60,
      background: BRAND.white,
      borderBottom: `1px solid ${BRAND.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      fontFamily: FONT,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: BRAND.surface, borderRadius: 10,
          padding: "8px 16px", width: 320,
          border: `1px solid ${BRAND.border}`,
        }}>
          <Icons.Search size={16} color={BRAND.textTertiary} />
          <input placeholder="Search jobs, contacts, sites..." style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: 13, fontFamily: FONT, color: BRAND.textPrimary, width: "100%",
            fontWeight: 500,
          }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ViewSwitcher />
        <div style={{ width: 1, height: 24, background: BRAND.border, margin: "0 10px" }} />
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative",
        }} className="fs-view-btn">
          <Icons.Bell size={20} color={BRAND.textSecondary} />
          <div style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8, borderRadius: "50%",
            background: BRAND.red, border: `2px solid ${BRAND.white}`,
          }} />
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: BRAND.blue, color: BRAND.white,
          border: "none", borderRadius: 10, padding: "8px 16px",
          fontSize: 13, fontWeight: 600, fontFamily: FONT,
          cursor: "pointer", marginLeft: 8,
          boxShadow: `0 1px 3px ${BRAND.shadow}`,
          transition: "background 0.15s ease",
        }} onMouseEnter={e => e.currentTarget.style.background = BRAND.blueHover}
           onMouseLeave={e => e.currentTarget.style.background = BRAND.blue}>
          <Icons.Plus size={16} color={BRAND.white} />
          New Job
        </button>
      </div>
    </div>
  );
}

function ViewSwitcher() {
  const [active, setActive] = useState(0);
  const views = [
    { icon: Icons.Dashboard, label: "Dashboard" },
    { icon: Icons.Grid, label: "Grid" },
    { icon: Icons.Kanban, label: "Kanban" },
    { icon: Icons.Calendar, label: "Calendar" },
    { icon: Icons.Timeline, label: "Timeline" },
  ];
  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: BRAND.surface, borderRadius: 10,
      padding: 3, border: `1px solid ${BRAND.border}`,
    }}>
      {views.map((v, i) => (
        <div
          key={v.label}
          className="fs-view-btn"
          onClick={() => setActive(i)}
          title={v.label}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 30, borderRadius: 8, cursor: "pointer",
            background: active === i ? BRAND.white : "transparent",
            boxShadow: active === i ? `0 1px 3px ${BRAND.shadow}` : "none",
          }}
        >
          <v.icon size={16} color={active === i ? BRAND.blue : BRAND.textTertiary} />
        </div>
      ))}
    </div>
  );
}

function MetricCard({ data, index }) {
  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white,
      borderRadius: 14,
      padding: "20px 22px",
      border: `1px solid ${BRAND.border}`,
      flex: 1,
      minWidth: 0,
      animation: `fs-fadeUp 0.4s ease ${index * 0.08}s both`,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        {data.label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, letterSpacing: -0.5 }}>
          {data.value}
        </span>
        {data.change && (
          <span style={{
            display: "flex", alignItems: "center", gap: 2,
            fontSize: 12, fontWeight: 600,
            color: data.trend === "up" ? BRAND.green : BRAND.textTertiary,
            fontFamily: FONT,
          }}>
            {data.trend === "up" && <Icons.ArrowUp size={12} color={BRAND.green} />}
            {data.change}
          </span>
        )}
        {data.sub && (
          <span style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>{data.sub}</span>
        )}
      </div>
    </div>
  );
}

function PipelineKanban() {
  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white,
      borderRadius: 14,
      border: `1px solid ${BRAND.border}`,
      padding: "20px 22px",
      animation: "fs-fadeUp 0.5s ease 0.3s both",
      flex: 2,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Pipeline</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>28 opportunities · $1.31M total</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{
            background: BRAND.surface, border: `1px solid ${BRAND.border}`,
            borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600,
            color: BRAND.textSecondary, fontFamily: FONT, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            All Stages <Icons.ChevronDown size={14} />
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {PIPELINE_DATA.map((stage, si) => (
          <div key={stage.stage} style={{
            flex: 1, minWidth: 180,
            animation: `fs-scaleIn 0.35s ease ${0.35 + si * 0.07}s both`,
          }}>
            {/* Stage header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 10, padding: "0 2px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{stage.stage}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: stage.color,
                  background: stage.softColor, borderRadius: 6,
                  padding: "1px 7px", fontFamily: FONT,
                }}>{stage.count}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>{stage.value}</span>
            </div>
            {/* Cards */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              background: BRAND.surface, borderRadius: 10,
              padding: 8, minHeight: 120,
            }}>
              {stage.items.map((item, ii) => (
                <div key={ii} className="fs-hover-lift" style={{
                  background: BRAND.white,
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: `1px solid ${BRAND.border}`,
                  cursor: "pointer",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 8 }}>
                    {item.company}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{item.value}</span>
                    {item.days > 0 && (
                      <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>{item.days}d ago</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayJobs() {
  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white,
      borderRadius: 14,
      border: `1px solid ${BRAND.border}`,
      padding: "20px 22px",
      animation: "fs-fadeUp 0.5s ease 0.4s both",
      flex: 1,
      minWidth: 300,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Today's Jobs</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>March 9, 2026</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 30, height: 30, borderRadius: 8, cursor: "pointer",
        }} className="fs-view-btn">
          <Icons.MoreH size={16} />
        </div>
      </div>
      {TODAY_JOBS.map((job, i) => (
        <div key={job.id} className="fs-hover-lift" style={{
          padding: "14px 16px",
          borderRadius: 12,
          border: `1px solid ${BRAND.border}`,
          marginBottom: i < TODAY_JOBS.length - 1 ? 10 : 0,
          cursor: "pointer",
          animation: `fs-slideIn 0.4s ease ${0.5 + i * 0.08}s both`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.blue, fontFamily: FONT }}>{job.id}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, fontFamily: FONT,
              color: job.status === "On Track" ? BRAND.green : BRAND.red,
              background: job.status === "On Track" ? BRAND.greenSoft : BRAND.redSoft,
              padding: "2px 8px", borderRadius: 6,
            }}>{job.status}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 3 }}>
            {job.name}
          </div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 10 }}>
            {job.site} · {job.crew}
          </div>
          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              flex: 1, height: 6, background: BRAND.surface,
              borderRadius: 3, overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${job.progress}%`,
                background: job.status === "Delayed"
                  ? `linear-gradient(90deg, ${BRAND.red}, ${BRAND.amber})`
                  : `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueMuted})`,
                borderRadius: 3,
                animation: `fs-barGrow 0.8s ease ${0.6 + i * 0.1}s both`,
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textSecondary, fontFamily: FONT, minWidth: 30, textAlign: "right" }}>
              {job.progress}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 6 }}>
            Phase: {job.phase}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniSchedule() {
  const phases = [
    { name: "Site Prep", start: 0, width: 15, color: BRAND.blue },
    { name: "Foundation", start: 12, width: 20, color: BRAND.purple },
    { name: "Framing", start: 30, width: 25, color: BRAND.green },
    { name: "Electrical", start: 38, width: 18, color: BRAND.amber },
    { name: "Plumbing", start: 42, width: 16, color: BRAND.red },
    { name: "Drywall", start: 55, width: 20, color: BRAND.blue },
    { name: "Finishes", start: 72, width: 22, color: BRAND.green },
    { name: "Punch List", start: 90, width: 10, color: BRAND.purple },
  ];
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white,
      borderRadius: 14,
      border: `1px solid ${BRAND.border}`,
      padding: "20px 22px",
      animation: "fs-fadeUp 0.5s ease 0.5s both",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Sunset Ridge Timeline</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>JOB-2026-0038 · 12 week build · May 1 start</div>
        </div>
      </div>
      {/* Week headers */}
      <div style={{ display: "flex", marginLeft: 100, marginBottom: 6 }}>
        {weeks.map(w => (
          <div key={w} style={{ flex: 1, fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, textAlign: "center" }}>{w}</div>
        ))}
      </div>
      {/* Gantt rows */}
      <div style={{ position: "relative" }}>
        {/* Today marker */}
        <div style={{
          position: "absolute", left: `calc(100px + ${(35 / 100) * (100 - (100 * 100 / (100 + 100)))}%)`,
          top: 0, bottom: 0, width: 2,
          background: BRAND.red, opacity: 0.3, zIndex: 1,
          marginLeft: `${35 * ((100 - 100 * 100 / (100 + 100 + 20)))}%`,
        }} />
        {phases.map((phase, i) => (
          <div key={phase.name} style={{
            display: "flex", alignItems: "center", height: 32, marginBottom: 4,
            animation: `fs-slideIn 0.35s ease ${0.55 + i * 0.04}s both`,
          }}>
            <div style={{
              width: 100, fontSize: 11, fontWeight: 600, color: BRAND.textSecondary,
              fontFamily: FONT, paddingRight: 12, textAlign: "right", flexShrink: 0,
            }}>{phase.name}</div>
            <div style={{ flex: 1, position: "relative", height: "100%" }}>
              <div style={{
                position: "absolute",
                left: `${phase.start}%`,
                width: `${phase.width}%`,
                top: 6,
                height: 20,
                borderRadius: 6,
                background: phase.color + "22",
                border: `1.5px solid ${phase.color}55`,
                display: "flex",
                alignItems: "center",
                paddingLeft: 8,
                animation: `fs-barGrow 0.6s ease ${0.6 + i * 0.05}s both`,
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: i < 3 ? `${Math.min(100, (35 - phase.start) / phase.width * 100)}%` : "0%",
                  background: phase.color + "44",
                  borderRadius: "6px 0 0 6px",
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN APP ---
export default function FieldStackDesign() {
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: BRAND.surface,
      fontFamily: FONT,
    }}>
      <Sidebar activeNav={activeNav} onNav={setActiveNav} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {/* Page title */}
          <div style={{ marginBottom: 24, animation: "fs-fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, letterSpacing: -0.3 }}>
              Good morning, Smithers
            </div>
            <div style={{ fontSize: 13, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 4 }}>
              Monday, March 9, 2026 · 3 active crews today · 7 milestones this week
            </div>
          </div>

          {/* Metrics row */}
          <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            {METRICS.map((m, i) => <MetricCard key={m.label} data={m} index={i} />)}
          </div>

          {/* Main content */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <PipelineKanban />
            <TodayJobs />
          </div>

          {/* Timeline */}
          <MiniSchedule />
        </div>
      </div>
    </div>
  );
}
