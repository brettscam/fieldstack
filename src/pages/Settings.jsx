import { useState } from "react";
import { BRAND, FONT } from "../lib/design";
import Icons from "../components/Icons";
import { isConfigured } from "../lib/supabase";

// ============================================
// Settings / Admin Panel
// ============================================

const TABS = [
  { key: "general", label: "General", icon: Icons.Settings },
  { key: "users", label: "Users & Roles", icon: Icons.Users },
  { key: "integrations", label: "Integrations", icon: Icons.Grid },
  { key: "notifications", label: "Notifications", icon: Icons.Bell },
  { key: "data", label: "Data & Storage", icon: Icons.Building },
];

// Mock workspace users
const MOCK_USERS = [
  { id: "u001", name: "Smithers", email: "smithers@fieldstack.app", role: "Admin", status: "Active", lastActive: "2026-03-10T09:30:00", avatar: "SM" },
  { id: "u002", name: "Rachel Stone", email: "rstone@apexdev.com", role: "Project Manager", status: "Active", lastActive: "2026-03-10T08:15:00", avatar: "RS" },
  { id: "u003", name: "Tom Bradley", email: "tbradley@bradleyelectric.com", role: "Field User", status: "Active", lastActive: "2026-03-09T16:30:00", avatar: "TB" },
  { id: "u004", name: "Luis Garza", email: "lgarza@fieldstack.app", role: "Field User", status: "Active", lastActive: "2026-03-10T07:45:00", avatar: "LG" },
  { id: "u005", name: "Sam Ortega", email: "sortega@fieldstack.app", role: "Field User", status: "Invited", lastActive: null, avatar: "SO" },
];

const ROLES = ["Admin", "Project Manager", "Field User", "View Only"];

const INTEGRATIONS = [
  { id: "int-supabase", name: "Supabase", description: "Database & auth backend", icon: "DB", color: BRAND.green, status: isConfigured() ? "connected" : "not_connected", category: "Database" },
  { id: "int-quickbooks", name: "QuickBooks", description: "Accounting & invoicing sync", icon: "QB", color: "#2CA01C", status: "available", category: "Accounting" },
  { id: "int-google", name: "Google Workspace", description: "Calendar, Drive, and Gmail sync", icon: "G", color: "#4285F4", status: "available", category: "Productivity" },
  { id: "int-slack", name: "Slack", description: "Team notifications and alerts", icon: "SL", color: "#4A154B", status: "available", category: "Communication" },
  { id: "int-mapbox", name: "Mapbox", description: "Interactive job site maps", icon: "MB", color: "#4264FB", status: "available", category: "Maps" },
  { id: "int-stripe", name: "Stripe", description: "Payment processing", icon: "ST", color: "#635BFF", status: "available", category: "Payments" },
  { id: "int-twilio", name: "Twilio", description: "SMS notifications to field crews", icon: "TW", color: "#F22F46", status: "available", category: "Communication" },
  { id: "int-dropbox", name: "Dropbox", description: "Document & photo storage", icon: "DX", color: "#0061FF", status: "available", category: "Storage" },
];

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: color,
      background: color + "18", padding: "2px 8px", borderRadius: 4, fontFamily: FONT,
    }}>{label}</span>
  );
}

// ============================================
// General Tab
// ============================================
function GeneralTab() {
  const [companyName, setCompanyName] = useState("FieldStack Demo");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
    fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none",
    background: BRAND.white,
  };
  const selectStyle = { ...inputStyle, cursor: "pointer" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4, fontFamily: FONT };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
        Workspace Settings
      </div>
      <div style={{ fontSize: 13, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 24 }}>
        Configure your organization details and preferences
      </div>

      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        padding: "24px 28px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 16 }}>
          Organization
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Company Name</label>
            <input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Timezone</label>
            <select style={selectStyle} value={timezone} onChange={e => setTimezone(e.target.value)}>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Denver">Mountain (MT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Currency</label>
            <select style={selectStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="GBP">GBP (&pound;)</option>
              <option value="EUR">EUR (&euro;)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date Format</label>
            <select style={selectStyle} value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        <button style={{
          marginTop: 20, padding: "10px 20px", borderRadius: 8, border: "none",
          background: BRAND.blue, color: BRAND.white, fontSize: 13, fontWeight: 600,
          fontFamily: FONT, cursor: "pointer",
        }}>Save Changes</button>
      </div>

      {/* Connection Status */}
      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        padding: "24px 28px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 16 }}>
          System Status
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: isConfigured() ? BRAND.green : BRAND.amber }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>Database</span>
            </div>
            <Badge label={isConfigured() ? "Connected" : "Demo Mode"} color={isConfigured() ? BRAND.green : BRAND.amber} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.green }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>Authentication</span>
            </div>
            <Badge label={isConfigured() ? "Supabase Auth" : "Mock Auth"} color={isConfigured() ? BRAND.green : BRAND.amber} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.green }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>Deployment</span>
            </div>
            <Badge label="Vercel Ready" color={BRAND.green} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Users & Roles Tab
// ============================================
function UsersTab() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "Field User" });

  const roleColors = {
    Admin: BRAND.red,
    "Project Manager": BRAND.blue,
    "Field User": BRAND.green,
    "View Only": BRAND.textTertiary,
  };

  const handleInvite = () => {
    if (!inviteForm.email || !inviteForm.name) return;
    const newUser = {
      id: "u_" + Math.random().toString(36).slice(2, 8),
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      status: "Invited",
      lastActive: null,
      avatar: inviteForm.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
    };
    setUsers(prev => [...prev, newUser]);
    setInviteForm({ email: "", name: "", role: "Field User" });
    setShowInvite(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
    fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none",
    background: BRAND.white,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
            Users & Roles
          </div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontFamily: FONT }}>
            Manage who has access and what they can do
          </div>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 18px", borderRadius: 8, border: "none",
          background: BRAND.blue, color: BRAND.white, fontSize: 13,
          fontWeight: 600, fontFamily: FONT, cursor: "pointer",
        }}>
          <Icons.Plus size={16} color={BRAND.white} /> Invite User
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div style={{
          background: BRAND.white, borderRadius: 14, border: `1.5px solid ${BRAND.blue}44`,
          padding: "20px 24px", marginBottom: 20, animation: "fs-fadeUp 0.15s ease both",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 14 }}>
            Invite a Team Member
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4, fontFamily: FONT }}>Full Name</label>
              <input style={inputStyle} value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4, fontFamily: FONT }}>Email</label>
              <input style={inputStyle} type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="john@company.com" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4, fontFamily: FONT }}>Role</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
            <button onClick={() => setShowInvite(false)} style={{
              padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
              background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT,
              color: BRAND.textSecondary, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={handleInvite} style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT,
              color: BRAND.white, cursor: "pointer",
            }}>Send Invite</button>
          </div>
        </div>
      )}

      {/* Role descriptions */}
      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        padding: "18px 24px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Role Permissions
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { role: "Admin", desc: "Full access — manage users, settings, billing, and all data" },
            { role: "Project Manager", desc: "Manage jobs, schedule, assignments, and team" },
            { role: "Field User", desc: "View jobs, submit photos, update phase status" },
            { role: "View Only", desc: "Read-only access to dashboard and reports" },
          ].map(r => (
            <div key={r.role} style={{
              padding: "10px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
              background: BRAND.surface,
            }}>
              <Badge label={r.role} color={roleColors[r.role]} />
              <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, marginTop: 6, lineHeight: 1.3 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User list */}
      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 2fr 120px 100px 140px 80px",
          padding: "12px 20px", background: BRAND.surface,
          borderBottom: `1px solid ${BRAND.border}`, gap: 12,
        }}>
          {["Name", "Email", "Role", "Status", "Last Active", ""].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: FONT }}>{h}</div>
          ))}
        </div>
        {users.map((user, i) => (
          <div key={user.id} style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 120px 100px 140px 80px",
            padding: "14px 20px", gap: 12, alignItems: "center",
            borderBottom: i < users.length - 1 ? `1px solid ${BRAND.border}` : "none",
            animation: `fs-fadeUp 0.2s ease ${i * 0.03}s both`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: `linear-gradient(135deg, ${roleColors[user.role]}, ${roleColors[user.role]}88)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: BRAND.white, fontFamily: FONT,
              }}>{user.avatar}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{user.name}</span>
            </div>
            <div style={{ fontSize: 12, color: BRAND.textSecondary, fontFamily: FONT }}>{user.email}</div>
            <div>
              <select value={user.role} onChange={e => {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: e.target.value } : u));
              }} style={{
                padding: "4px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
                fontSize: 11, fontFamily: FONT, fontWeight: 600, background: BRAND.surface,
                color: roleColors[user.role], cursor: "pointer", outline: "none",
              }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Badge
                label={user.status}
                color={user.status === "Active" ? BRAND.green : BRAND.amber}
              />
            </div>
            <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT }}>
              {user.lastActive ? new Date(user.lastActive).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Pending"}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={{
                padding: "4px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
                background: BRAND.white, fontSize: 10, fontWeight: 600, fontFamily: FONT,
                color: BRAND.textSecondary, cursor: "pointer",
              }} className="fs-view-btn">Edit</button>
              {user.role !== "Admin" && (
                <button onClick={() => setUsers(prev => prev.filter(u => u.id !== user.id))} style={{
                  padding: "4px 8px", borderRadius: 6, border: `1px solid ${BRAND.redSoft}`,
                  background: BRAND.white, fontSize: 10, fontWeight: 600, fontFamily: FONT,
                  color: BRAND.red, cursor: "pointer",
                }} className="fs-view-btn">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Integrations Tab
// ============================================
function IntegrationsTab() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const toggleConnect = (id) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, status: i.status === "connected" ? "not_connected" : "connected" } : i
    ));
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
        Integrations
      </div>
      <div style={{ fontSize: 13, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 24 }}>
        Connect your tools to streamline workflows
      </div>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {cat}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {integrations.filter(i => i.category === cat).map(integration => (
              <div key={integration.id} style={{
                background: BRAND.white, borderRadius: 14, border: `1px solid ${integration.status === "connected" ? integration.color + "44" : BRAND.border}`,
                padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: integration.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: integration.color, fontFamily: FONT,
                  flexShrink: 0,
                }}>{integration.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{integration.name}</span>
                    {integration.status === "connected" && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.green }} />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 10, lineHeight: 1.3 }}>
                    {integration.description}
                  </div>
                  <button onClick={() => toggleConnect(integration.id)} style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    fontFamily: FONT, cursor: "pointer",
                    border: integration.status === "connected" ? `1px solid ${BRAND.border}` : "none",
                    background: integration.status === "connected" ? BRAND.white : integration.color,
                    color: integration.status === "connected" ? BRAND.textSecondary : BRAND.white,
                  }}>
                    {integration.status === "connected" ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Notifications Tab
// ============================================
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailDigest: true, phaseComplete: true, flagAdded: true,
    newAssignment: true, photoUploaded: false, scheduleChange: true,
    weeklyReport: true, dailySummary: false,
  });

  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const Toggle = ({ checked, onToggle }) => (
    <div onClick={onToggle} style={{
      width: 40, height: 22, borderRadius: 11, cursor: "pointer",
      background: checked ? BRAND.blue : BRAND.border,
      position: "relative", transition: "background 0.2s ease",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: BRAND.white,
        position: "absolute", top: 2,
        left: checked ? 20 : 2,
        transition: "left 0.2s ease",
        boxShadow: `0 1px 3px ${BRAND.shadow}`,
      }} />
    </div>
  );

  const notifItems = [
    { key: "phaseComplete", label: "Phase completed", desc: "When a schedule phase is marked complete" },
    { key: "flagAdded", label: "Flag / issue raised", desc: "When a flag or delay is reported on a job" },
    { key: "newAssignment", label: "New assignment", desc: "When you're assigned to a phase or task" },
    { key: "photoUploaded", label: "Photo check-in", desc: "When a field photo is submitted" },
    { key: "scheduleChange", label: "Schedule change", desc: "When phase dates are modified" },
  ];

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
        Notifications
      </div>
      <div style={{ fontSize: 13, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 24 }}>
        Control how you receive alerts and updates
      </div>

      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        padding: "24px 28px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 16 }}>
          Email Preferences
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BRAND.border}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>Daily digest</div>
            <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, marginTop: 1 }}>Summary of all activity each morning</div>
          </div>
          <Toggle checked={prefs.dailySummary} onToggle={() => toggle("dailySummary")} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>Weekly report</div>
            <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, marginTop: 1 }}>Pipeline and job progress summary every Monday</div>
          </div>
          <Toggle checked={prefs.weeklyReport} onToggle={() => toggle("weeklyReport")} />
        </div>
      </div>

      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        padding: "24px 28px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 16 }}>
          In-App Notifications
        </div>
        {notifItems.map((item, i) => (
          <div key={item.key} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0",
            borderBottom: i < notifItems.length - 1 ? `1px solid ${BRAND.border}` : "none",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{item.label}</div>
              <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, marginTop: 1 }}>{item.desc}</div>
            </div>
            <Toggle checked={prefs[item.key]} onToggle={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Data & Storage Tab
// ============================================
function DataTab() {
  const demoMode = !isConfigured();

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
        Data & Storage
      </div>
      <div style={{ fontSize: 13, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 24 }}>
        Database connection, exports, and storage configuration
      </div>

      {/* Connection card */}
      <div style={{
        background: BRAND.white, borderRadius: 14,
        border: `1px solid ${demoMode ? BRAND.amber + "44" : BRAND.green + "44"}`,
        padding: "24px 28px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: demoMode ? BRAND.amberSoft : BRAND.greenSoft,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: demoMode ? BRAND.amber : BRAND.green, fontFamily: FONT,
          }}>DB</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>
              Supabase Database
            </div>
            <Badge label={demoMode ? "Demo Mode — Using Mock Data" : "Connected"} color={demoMode ? BRAND.amber : BRAND.green} />
          </div>
        </div>

        {demoMode ? (
          <div style={{
            padding: 16, borderRadius: 10, background: BRAND.amberSoft + "44",
            border: `1px solid ${BRAND.amber}22`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 6 }}>
              Running in Demo Mode
            </div>
            <div style={{ fontSize: 12, color: BRAND.textSecondary, fontFamily: FONT, lineHeight: 1.5 }}>
              The app is using built-in sample data. To connect a real database, set these environment variables:
            </div>
            <div style={{
              marginTop: 10, padding: "10px 14px", borderRadius: 8,
              background: BRAND.textPrimary, fontFamily: "'Menlo', 'Monaco', monospace",
              fontSize: 11, color: BRAND.green, lineHeight: 1.8,
            }}>
              VITE_SUPABASE_URL=https://your-project.supabase.co<br />
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </div>
            <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, marginTop: 8 }}>
              Then run the SQL schema from <span style={{ fontFamily: "'Menlo', monospace", color: BRAND.blue }}>supabase/schema.sql</span> in your Supabase dashboard.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div style={{ padding: 12, borderRadius: 8, background: BRAND.surface }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>Tables</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>5</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: BRAND.surface }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>RLS Policies</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>20</div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: BRAND.surface }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>Indexes</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>8</div>
            </div>
          </div>
        )}
      </div>

      {/* Export / Seed */}
      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        padding: "24px 28px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 16 }}>
          Data Management
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={{
            padding: "10px 18px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
            background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }} className="fs-view-btn">
            <Icons.Grid size={14} color={BRAND.textSecondary} /> Export All Data (CSV)
          </button>
          <button style={{
            padding: "10px 18px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
            background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }} className="fs-view-btn">
            <Icons.Timeline size={14} color={BRAND.textSecondary} /> Seed Demo Data
          </button>
          <button style={{
            padding: "10px 18px", borderRadius: 8, border: `1px solid ${BRAND.redSoft}`,
            background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.red, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }} className="fs-view-btn">
            <Icons.Trash size={14} color={BRAND.red} /> Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Settings Page
// ============================================
export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ display: "flex", gap: 28 }}>
        {/* Settings sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3, marginBottom: 20 }}>
            Settings
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <div key={tab.key} onClick={() => setActiveTab(tab.key)} className="fs-nav-item" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  background: isActive ? BRAND.blueSoft : "transparent",
                }}>
                  <tab.icon size={16} color={isActive ? BRAND.blue : BRAND.textTertiary} />
                  <span style={{
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    color: isActive ? BRAND.blue : BRAND.textSecondary, fontFamily: FONT,
                  }}>{tab.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "integrations" && <IntegrationsTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "data" && <DataTab />}
        </div>
      </div>
    </div>
  );
}
