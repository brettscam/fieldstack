import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BRAND, FONT } from "../lib/design";
import Icons from "../components/Icons";
import { useContacts, useCompanies, useMutation } from "../lib/hooks";
import { TABLES } from "../lib/supabase";

// Fuzzy match company autocomplete for contacts
function ContactCompanyAutocomplete({ value, onChange, companies, inputStyle }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [warning, setWarning] = useState(null);

  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  }

  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    const q = value.toLowerCase();
    return companies.filter(c => c.Name.toLowerCase().includes(q) || levenshtein(c.Name.toLowerCase(), q) <= 2)
      .sort((a, b) => {
        const aExact = a.Name.toLowerCase().startsWith(q) ? 0 : 1;
        const bExact = b.Name.toLowerCase().startsWith(q) ? 0 : 1;
        return aExact - bExact;
      }).slice(0, 5);
  }, [value, companies]);

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
    if (value && !companies.some(c => c.Name === value)) {
      const close = companies.find(c => levenshtein(c.Name.toLowerCase(), value.toLowerCase()) <= 2);
      if (close) setWarning(`Did you mean "${close.Name}"?`);
      else setWarning(null);
    } else setWarning(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <input style={inputStyle} value={value}
        onChange={e => { onChange(e.target.value); setWarning(null); }}
        onFocus={() => setShowSuggestions(true)} onBlur={handleBlur}
        placeholder="Start typing..."
      />
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: BRAND.white, borderRadius: 8, border: `1px solid ${BRAND.border}`,
          boxShadow: `0 4px 12px ${BRAND.shadowMd}`, marginTop: 2, maxHeight: 160, overflowY: "auto",
        }}>
          {suggestions.map(c => (
            <div key={c.id} onMouseDown={() => { onChange(c.Name); setShowSuggestions(false); setWarning(null); }} style={{
              padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: BRAND.textPrimary, fontFamily: FONT, borderBottom: `1px solid ${BRAND.border}`,
            }} className="fs-nav-item">
              <div>{c.Name}</div>
              <div style={{ fontSize: 10, color: BRAND.textTertiary, fontWeight: 500 }}>{c.Industry}</div>
            </div>
          ))}
        </div>
      )}
      {warning && (
        <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.amber, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
          <span>⚠</span> {warning}
          <span onMouseDown={() => { const match = companies.find(c => levenshtein(c.Name.toLowerCase(), value.toLowerCase()) <= 2); if (match) { onChange(match.Name); setWarning(null); } }}
            style={{ color: BRAND.blue, cursor: "pointer", textDecoration: "underline" }}>Use it</span>
        </div>
      )}
    </div>
  );
}

function ContactModal({ contact, onClose, onSave, companies }) {
  const isEdit = Boolean(contact?.id);
  const [form, setForm] = useState({
    Name: contact?.Name || "",
    Email: contact?.Email || "",
    Phone: contact?.Phone || "",
    Company: contact?.Company || "",
    Role: contact?.Role || "",
    Notes: contact?.Notes || "",
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
    fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none",
    background: BRAND.surface,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: FONT,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BRAND.white, borderRadius: 16, padding: 28, width: 440,
        boxShadow: `0 8px 30px ${BRAND.shadowMd}`, animation: "fs-scaleIn 0.2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>
            {isEdit ? "Edit Contact" : "New Contact"}
          </div>
          <div onClick={onClose} style={{ cursor: "pointer" }}><Icons.X size={20} color={BRAND.textTertiary} /></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Name *</label>
            <input style={inputStyle} value={form.Name} onChange={e => set("Name", e.target.value)} placeholder="Full name" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Email</label>
              <input style={inputStyle} type="email" value={form.Email} onChange={e => set("Email", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Phone</label>
              <input style={inputStyle} value={form.Phone} onChange={e => set("Phone", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Company</label>
              <ContactCompanyAutocomplete value={form.Company} onChange={v => set("Company", v)} companies={companies} inputStyle={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Role</label>
              <input style={inputStyle} value={form.Role} onChange={e => set("Role", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Notes</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.Notes} onChange={e => set("Notes", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
            background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.textSecondary, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => { if (form.Name) onSave(form, contact?.id); }} style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.white, cursor: "pointer",
          }}>{isEdit ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Contacts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { records: contacts, refresh } = useContacts();
  const { records: companies } = useCompanies();
  const { create, update, remove } = useMutation(TABLES.CONTACTS);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [search, setSearch] = useState("");

  // Auto-fill search from URL param
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c =>
      c.Name?.toLowerCase().includes(q) ||
      c.Company?.toLowerCase().includes(q) ||
      c.Email?.toLowerCase().includes(q) ||
      c.Role?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const handleSave = async (fields, id) => {
    if (id) {
      await update(id, fields);
    } else {
      await create(fields);
    }
    setShowModal(false);
    setEditContact(null);
    refresh();
  };

  const handleDelete = async (id) => {
    await remove(id);
    refresh();
  };

  // Group by company
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(c => {
      const co = c.Company || "No Company";
      if (!groups[co]) groups[co] = [];
      groups[co].push(c);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const initials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const avatarColors = [BRAND.blue, BRAND.green, BRAND.purple, BRAND.amber, BRAND.red];

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>Contacts</div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
            {contacts.length} contacts · {[...new Set(contacts.map(c => c.Company))].length} companies
          </div>
        </div>
        <button onClick={() => { setEditContact(null); setShowModal(true); }} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: BRAND.blue, color: BRAND.white,
          border: "none", borderRadius: 10, padding: "8px 16px",
          fontSize: 13, fontWeight: 600, fontFamily: FONT,
          cursor: "pointer", boxShadow: `0 1px 3px ${BRAND.shadow}`,
        }}>
          <Icons.Plus size={16} color={BRAND.white} />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: BRAND.white, borderRadius: 10,
        padding: "8px 14px", border: `1px solid ${BRAND.border}`, maxWidth: 360,
        marginBottom: 20,
      }}>
        <Icons.Search size={16} color={BRAND.textTertiary} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." style={{
          border: "none", outline: "none", background: "transparent",
          fontSize: 13, fontFamily: FONT, color: BRAND.textPrimary, width: "100%", fontWeight: 500,
        }} />
      </div>

      {/* Contact list grouped by company */}
      {grouped.map(([company, companyContacts]) => (
        <div key={company} style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 10, padding: "0 4px",
          }}>
            <Icons.Building size={14} color={BRAND.blue} />
            <span onClick={() => navigate(`/companies?highlight=${encodeURIComponent(company)}`)} style={{ fontSize: 13, fontWeight: 700, color: BRAND.blue, cursor: "pointer" }}>{company}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: BRAND.textTertiary,
              background: BRAND.surface, borderRadius: 6, padding: "1px 7px",
            }}>{companyContacts.length}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {companyContacts.map((contact, ci) => (
              <div key={contact.id} className="fs-hover-lift" style={{
                background: BRAND.white, borderRadius: 12,
                border: `1px solid ${BRAND.border}`, padding: "16px 18px",
                cursor: "pointer",
                animation: `fs-fadeUp 0.3s ease ${ci * 0.03}s both`,
              }} onClick={() => { setEditContact(contact); setShowModal(true); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${avatarColors[ci % avatarColors.length]}, ${avatarColors[(ci + 2) % avatarColors.length]})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: BRAND.white, flexShrink: 0,
                  }}>{initials(contact.Name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary }}>{contact.Name}</div>
                    <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500 }}>{contact.Role}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  {contact.Email && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icons.Mail size={13} color={BRAND.textTertiary} />
                      <span style={{ fontSize: 12, color: BRAND.textSecondary, fontWeight: 500 }}>{contact.Email}</span>
                    </div>
                  )}
                  {contact.Phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icons.Phone size={13} color={BRAND.textTertiary} />
                      <span style={{ fontSize: 12, color: BRAND.textSecondary, fontWeight: 500 }}>{contact.Phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{
          padding: 60, textAlign: "center", color: BRAND.textTertiary, fontSize: 14, fontWeight: 500,
          background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        }}>
          No contacts found
        </div>
      )}

      {showModal && (
        <ContactModal
          contact={editContact}
          onClose={() => { setShowModal(false); setEditContact(null); }}
          onSave={handleSave}
          companies={companies}
        />
      )}
    </div>
  );
}
