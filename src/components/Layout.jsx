import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BRAND, FONT } from "../lib/design";
import Icons from "./Icons";

const NAV_ITEMS = [
  { icon: Icons.Dashboard, label: "Dashboard", path: "/" },
  { icon: Icons.Pipeline, label: "Pipeline", path: "/pipeline" },
  { icon: Icons.Jobs, label: "Jobs", path: "/jobs" },
  { icon: Icons.Contacts, label: "Contacts", path: "/contacts" },
  { icon: Icons.Calendar, label: "Schedule", path: "/schedule" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      width: 232,
      minHeight: "100vh",
      background: BRAND.white,
      borderRight: `1px solid ${BRAND.border}`,
      display: "flex",
      flexDirection: "column",
      fontFamily: FONT,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
      }} onClick={() => navigate("/")}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `linear-gradient(135deg, ${BRAND.blue} 0%, #6EA8FE 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icons.Hardhat size={18} color={BRAND.white} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: BRAND.textPrimary, letterSpacing: -0.3 }}>
          FieldStack
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: "4px 10px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <div
              key={item.label}
              className="fs-nav-item"
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
                background: isActive ? BRAND.blueSoft : "transparent",
                marginBottom: 2,
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

function TopBar({ title, subtitle, actions }) {
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
      flexShrink: 0,
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
        {actions}
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: BRAND.surface,
      fontFamily: FONT,
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
