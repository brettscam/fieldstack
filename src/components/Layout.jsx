import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BRAND, FONT, formatCurrency } from "../lib/design";
import Icons from "./Icons";
import { useJobs, useContacts, useOpportunities, useCompanies } from "../lib/hooks";

const NAV_ITEMS = [
  { icon: Icons.Dashboard, label: "Dashboard", path: "/" },
  { icon: Icons.Pipeline, label: "Pipeline", path: "/pipeline" },
  { icon: Icons.Jobs, label: "Jobs", path: "/jobs" },
  { icon: Icons.Building, label: "Companies", path: "/companies" },
  { icon: Icons.Contacts, label: "Contacts", path: "/contacts" },
  { icon: Icons.Calendar, label: "Schedule", path: "/schedule" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      width: 232,
      height: "100%",
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
        {(() => {
          const isSettingsActive = location.pathname === "/settings";
          return (
            <div className="fs-nav-item" onClick={() => navigate("/settings")} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              background: isSettingsActive ? BRAND.blueSoft : "transparent",
            }}>
              <Icons.Settings size={20} color={isSettingsActive ? BRAND.blue : BRAND.textSecondary} />
              <span style={{ fontSize: 14, fontWeight: isSettingsActive ? 600 : 500, color: isSettingsActive ? BRAND.blue : BRAND.textSecondary, fontFamily: FONT }}>Settings</span>
            </div>
          );
        })()}
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

function GlobalSearchResults({ query, onClose, onNavigate }) {
  const { records: jobs } = useJobs();
  const { records: contacts } = useContacts();
  const { records: opportunities } = useOpportunities();
  const { records: companies } = useCompanies();

  const results = useMemo(() => {
    if (!query || query.length < 2) return { jobs: [], contacts: [], opportunities: [], companies: [] };
    const q = query.toLowerCase();
    return {
      jobs: jobs.filter(j =>
        j.Name?.toLowerCase().includes(q) || j.JobId?.toLowerCase().includes(q) ||
        j.Site?.toLowerCase().includes(q) || j.Company?.toLowerCase().includes(q)
      ).slice(0, 4),
      contacts: contacts.filter(c =>
        c.Name?.toLowerCase().includes(q) || c.Email?.toLowerCase().includes(q) ||
        c.Company?.toLowerCase().includes(q)
      ).slice(0, 4),
      opportunities: opportunities.filter(o =>
        o.Name?.toLowerCase().includes(q) || o.Company?.toLowerCase().includes(q) ||
        o.Contact?.toLowerCase().includes(q)
      ).slice(0, 4),
      companies: companies.filter(c =>
        c.Name?.toLowerCase().includes(q) || c.Industry?.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  }, [query, jobs, contacts, opportunities, companies]);

  const totalResults = results.jobs.length + results.contacts.length + results.opportunities.length + results.companies.length;

  if (totalResults === 0) {
    return (
      <div style={{
        position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
        background: BRAND.white, borderRadius: 12, border: `1px solid ${BRAND.border}`,
        boxShadow: `0 8px 24px ${BRAND.shadowMd}`, padding: 20, zIndex: 999,
        textAlign: "center", color: BRAND.textTertiary, fontSize: 13, fontFamily: FONT,
      }}>
        No results for "{query}"
      </div>
    );
  }

  const Section = ({ title, icon: Icon, items, renderItem }) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px" }}>
          <Icon size={12} color={BRAND.textTertiary} />
          <span style={{ fontSize: 10, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</span>
        </div>
        {items.map(renderItem)}
      </div>
    );
  };

  return (
    <div style={{
      position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
      background: BRAND.white, borderRadius: 12, border: `1px solid ${BRAND.border}`,
      boxShadow: `0 8px 24px ${BRAND.shadowMd}`, maxHeight: 400, overflowY: "auto",
      zIndex: 999, padding: "8px 0", animation: "fs-fadeUp 0.15s ease both",
    }}>
      <Section title="Jobs" icon={Icons.Jobs} items={results.jobs} renderItem={(job) => (
        <div key={job.id} onClick={() => { onNavigate(`/jobs/${job.id}`); onClose(); }} className="fs-nav-item" style={{
          padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{job.Name}</div>
            <div style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>{job.JobId} · {job.Site}</div>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 600,
            color: job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : BRAND.amber,
            background: (job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : BRAND.amber) + "18",
            padding: "2px 6px", borderRadius: 4,
          }}>{job.Status}</span>
        </div>
      )} />
      <Section title="Opportunities" icon={Icons.Pipeline} items={results.opportunities} renderItem={(opp) => (
        <div key={opp.id} onClick={() => { onNavigate(`/opportunities/${opp.id}`); onClose(); }} className="fs-nav-item" style={{
          padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{opp.Name}</div>
            <div style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>{opp.Company}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{formatCurrency(opp.Value)}</span>
        </div>
      )} />
      <Section title="Contacts" icon={Icons.Contacts} items={results.contacts} renderItem={(contact) => (
        <div key={contact.id} onClick={() => { onNavigate(`/contacts?search=${encodeURIComponent(contact.Name)}`); onClose(); }} className="fs-nav-item" style={{
          padding: "8px 12px", cursor: "pointer",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{contact.Name}</div>
          <div style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>{contact.Company} · {contact.Role}</div>
        </div>
      )} />
      <Section title="Companies" icon={Icons.Building} items={results.companies} renderItem={(company) => (
        <div key={company.id} onClick={() => { onNavigate(`/companies?highlight=${encodeURIComponent(company.Name)}`); onClose(); }} className="fs-nav-item" style={{
          padding: "8px 12px", cursor: "pointer",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{company.Name}</div>
          <div style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>{company.Industry}</div>
        </div>
      )} />
    </div>
  );
}

function TopBar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }} ref={searchRef}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: BRAND.surface, borderRadius: 10,
          padding: "8px 16px", width: 320,
          border: `1px solid ${showResults && searchQuery.length >= 2 ? BRAND.blue : BRAND.border}`,
          transition: "border-color 0.15s ease",
        }}>
          <Icons.Search size={16} color={BRAND.textTertiary} />
          <input
            placeholder="Search jobs, contacts, sites..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => { if (searchQuery.length >= 2) setShowResults(true); }}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, fontFamily: FONT, color: BRAND.textPrimary, width: "100%",
              fontWeight: 500,
            }}
          />
          {searchQuery && (
            <div onClick={() => { setSearchQuery(""); setShowResults(false); }} style={{ cursor: "pointer" }}>
              <Icons.X size={14} color={BRAND.textTertiary} />
            </div>
          )}
        </div>
        {showResults && searchQuery.length >= 2 && (
          <GlobalSearchResults
            query={searchQuery}
            onClose={() => { setShowResults(false); setSearchQuery(""); }}
            onNavigate={(path) => navigate(path)}
          />
        )}
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
      </div>
    </div>
  );
}

export default function Layout({ children, user, onSignOut }) {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: BRAND.surface,
      fontFamily: FONT,
      overflow: "hidden",
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
