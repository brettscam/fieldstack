import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND, FONT, formatFullCurrency } from "../lib/design";
import Icons from "../components/Icons";
import { useJobs, useCompanies, useMutation } from "../lib/hooks";
import { TABLES } from "../lib/supabase";

function StatusBadge({ status }) {
  const styles = {
    "On Track": { color: BRAND.green, bg: BRAND.greenSoft },
    "Delayed": { color: BRAND.red, bg: BRAND.redSoft },
    "At Risk": { color: BRAND.amber, bg: BRAND.amberSoft },
    "Completed": { color: BRAND.blue, bg: BRAND.blueSoft },
    "On Hold": { color: BRAND.textTertiary, bg: BRAND.surfaceHover },
  };
  const s = styles[status] || styles["On Hold"];
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, fontFamily: FONT,
      color: s.color, background: s.bg,
      padding: "3px 10px", borderRadius: 6,
    }}>{status}</span>
  );
}

// Fuzzy match company autocomplete for jobs
function JobCompanyAutocomplete({ value, onChange, companies, inputStyle }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    const q = value.toLowerCase();
    return companies.filter(c => c.Name.toLowerCase().includes(q)).slice(0, 5);
  }, [value, companies]);

  return (
    <div style={{ position: "relative" }}>
      <input style={inputStyle} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Start typing..."
      />
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: BRAND.white, borderRadius: 8, border: `1px solid ${BRAND.border}`,
          boxShadow: `0 4px 12px ${BRAND.shadowMd}`, marginTop: 2, maxHeight: 160, overflowY: "auto",
        }}>
          {suggestions.map(c => (
            <div key={c.id} onMouseDown={() => { onChange(c.Name); setShowSuggestions(false); }} style={{
              padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: BRAND.textPrimary, fontFamily: FONT, borderBottom: `1px solid ${BRAND.border}`,
            }} className="fs-nav-item">
              <div>{c.Name}</div>
              <div style={{ fontSize: 10, color: BRAND.textTertiary, fontWeight: 500 }}>{c.Industry}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewJobModal({ onClose, onSave, companies }) {
  const [form, setForm] = useState({
    Name: "", Site: "", Company: "", Contact: "", Crew: "",
    Value: "", StartDate: "", EndDate: "", Phase: "Pre-Construction",
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
    fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none", background: BRAND.surface,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: FONT }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: BRAND.white, borderRadius: 16, padding: 28, width: 480, boxShadow: `0 8px 30px ${BRAND.shadowMd}`, animation: "fs-scaleIn 0.2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>New Job</div>
          <div onClick={onClose} style={{ cursor: "pointer" }}><Icons.X size={20} color={BRAND.textTertiary} /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Job Name *</label>
            <input style={inputStyle} value={form.Name} onChange={e => set("Name", e.target.value)} placeholder="e.g., Sunset Ridge Build-Out" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Site Address</label>
            <input style={inputStyle} value={form.Site} onChange={e => set("Site", e.target.value)} placeholder="1420 Sunset Ridge Dr" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Company</label>
              <JobCompanyAutocomplete value={form.Company} onChange={v => set("Company", v)} companies={companies} inputStyle={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Crew</label>
              <input style={inputStyle} value={form.Crew} onChange={e => set("Crew", e.target.value)} placeholder="Team Alpha" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Value ($)</label>
              <input style={inputStyle} type="number" value={form.Value} onChange={e => set("Value", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Start Date</label>
              <input style={inputStyle} type="date" value={form.StartDate} onChange={e => set("StartDate", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>End Date</label>
              <input style={inputStyle} type="date" value={form.EndDate} onChange={e => set("EndDate", e.target.value)} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`, background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.textSecondary, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => {
            if (!form.Name) return;
            const jobNum = String(Math.floor(Math.random() * 9000) + 1000);
            onSave({ ...form, Value: parseFloat(form.Value) || 0, JobId: `JOB-2026-${jobNum}`, Status: "On Track", Progress: 0, Phase: "Pre-Construction" });
          }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.white, cursor: "pointer" }}>Create Job</button>
        </div>
      </div>
    </div>
  );
}

// Map view component
function MapView({ jobs }) {
  const navigate = useNavigate();
  const activeJobs = jobs.filter(j => j.Lat && j.Lng);
  // Simple visual map representation using positioned dots
  const bounds = useMemo(() => {
    if (activeJobs.length === 0) return { minLat: 30.2, maxLat: 30.4, minLng: -97.8, maxLng: -97.7 };
    const lats = activeJobs.map(j => j.Lat);
    const lngs = activeJobs.map(j => j.Lng);
    const padding = 0.02;
    return {
      minLat: Math.min(...lats) - padding, maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding, maxLng: Math.max(...lngs) + padding,
    };
  }, [activeJobs]);

  const statusColors = {
    "On Track": BRAND.green,
    "Delayed": BRAND.red,
    "At Risk": BRAND.amber,
    "Completed": BRAND.blue,
    "On Hold": BRAND.textTertiary,
  };

  return (
    <div style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      overflow: "hidden", marginBottom: 20,
    }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <Icons.MapPin size={16} color={BRAND.blue} />
        <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Job Locations</span>
        <span style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>{activeJobs.length} active sites</span>
      </div>
      <div style={{
        position: "relative", height: 280,
        background: `linear-gradient(135deg, ${BRAND.blueSoft} 0%, ${BRAND.surface} 50%, ${BRAND.greenSoft} 100%)`,
      }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <div key={`h${f}`} style={{ position: "absolute", left: 0, right: 0, top: `${f * 100}%`, borderTop: `1px dashed ${BRAND.border}` }} />
        ))}
        {[0.25, 0.5, 0.75].map(f => (
          <div key={`v${f}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${f * 100}%`, borderLeft: `1px dashed ${BRAND.border}` }} />
        ))}
        {activeJobs.map(job => {
          const x = ((job.Lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
          const y = ((bounds.maxLat - job.Lat) / (bounds.maxLat - bounds.minLat)) * 100;
          const color = statusColors[job.Status] || BRAND.blue;
          return (
            <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} style={{
              position: "absolute",
              left: `${Math.max(5, Math.min(90, x))}%`,
              top: `${Math.max(5, Math.min(90, y))}%`,
              transform: "translate(-50%, -50%)",
              cursor: "pointer", zIndex: 2,
            }}>
              {/* Pulse ring */}
              <div style={{
                position: "absolute", inset: -6, borderRadius: "50%",
                background: color + "22", animation: "fs-pulse 2s infinite",
              }} />
              {/* Pin */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: color, border: `3px solid ${BRAND.white}`,
                boxShadow: `0 2px 8px ${color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icons.Hardhat size={12} color={BRAND.white} />
              </div>
              {/* Label */}
              <div style={{
                position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)",
                background: BRAND.white, borderRadius: 6, padding: "3px 8px",
                boxShadow: `0 1px 4px ${BRAND.shadow}`, whiteSpace: "nowrap",
                border: `1px solid ${BRAND.border}`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{job.Name}</div>
                <div style={{ fontSize: 9, color: color, fontWeight: 600, fontFamily: FONT }}>{job.Status} · {job.Progress}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Jobs() {
  const { records: jobs, refresh } = useJobs();
  const { records: companies } = useCompanies();
  const { create } = useMutation(TABLES.JOBS);
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table | map

  const filtered = useMemo(() => {
    let list = jobs;
    if (statusFilter !== "All") list = list.filter(j => j.Status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        j.Name?.toLowerCase().includes(q) ||
        j.JobId?.toLowerCase().includes(q) ||
        j.Site?.toLowerCase().includes(q) ||
        j.Crew?.toLowerCase().includes(q) ||
        j.Company?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, statusFilter, search]);

  const handleCreate = async (fields) => {
    await create(fields);
    setShowNew(false);
    refresh();
  };

  const statuses = ["All", "On Track", "Delayed", "At Risk", "Completed", "On Hold"];
  const delayedCount = jobs.filter(j => j.Status === "Delayed").length;
  const atRiskCount = jobs.filter(j => j.Status === "At Risk").length;

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>Jobs</div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
            {jobs.length} total · {jobs.filter(j => j.Status !== "Completed").length} active
            {delayedCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.red, background: BRAND.redSoft, padding: "2px 8px", borderRadius: 6 }}>
                {delayedCount} delayed
              </span>
            )}
            {atRiskCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.amber, background: BRAND.amberSoft, padding: "2px 8px", borderRadius: 6 }}>
                {atRiskCount} at risk
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", gap: 2, background: BRAND.surface, borderRadius: 8, padding: 2, border: `1px solid ${BRAND.border}` }}>
            <button onClick={() => setViewMode("table")} style={{
              padding: "6px 10px", borderRadius: 6, border: "none",
              background: viewMode === "table" ? BRAND.white : "transparent",
              boxShadow: viewMode === "table" ? `0 1px 3px ${BRAND.shadow}` : "none",
              cursor: "pointer", display: "flex", alignItems: "center",
            }}><Icons.Grid size={16} color={viewMode === "table" ? BRAND.blue : BRAND.textTertiary} /></button>
            <button onClick={() => setViewMode("map")} style={{
              padding: "6px 10px", borderRadius: 6, border: "none",
              background: viewMode === "map" ? BRAND.white : "transparent",
              boxShadow: viewMode === "map" ? `0 1px 3px ${BRAND.shadow}` : "none",
              cursor: "pointer", display: "flex", alignItems: "center",
            }}><Icons.MapPin size={16} color={viewMode === "map" ? BRAND.blue : BRAND.textTertiary} /></button>
          </div>
          <button onClick={() => setShowNew(true)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: BRAND.blue, color: BRAND.white,
            border: "none", borderRadius: 10, padding: "8px 16px",
            fontSize: 13, fontWeight: 600, fontFamily: FONT,
            cursor: "pointer", boxShadow: `0 1px 3px ${BRAND.shadow}`,
          }}>
            <Icons.Plus size={16} color={BRAND.white} />
            New Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: BRAND.white, borderRadius: 10,
          padding: "8px 14px", border: `1px solid ${BRAND.border}`, flex: 1, maxWidth: 300,
        }}>
          <Icons.Search size={16} color={BRAND.textTertiary} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: 13, fontFamily: FONT, color: BRAND.textPrimary, width: "100%", fontWeight: 500,
          }} />
        </div>
        <div style={{ display: "flex", gap: 4, background: BRAND.white, borderRadius: 10, padding: 3, border: `1px solid ${BRAND.border}` }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: "6px 12px", borderRadius: 7, border: "none",
              background: statusFilter === s ? BRAND.blueSoft : "transparent",
              color: statusFilter === s ? BRAND.blue : BRAND.textSecondary,
              fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
              transition: "all 0.15s ease",
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Map view */}
      {viewMode === "map" && <MapView jobs={filtered} />}

      {/* Job Grid */}
      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "110px 2fr 1.5fr 100px 80px 90px 110px",
          padding: "12px 20px", background: BRAND.surface,
          borderBottom: `1px solid ${BRAND.border}`, gap: 12,
        }}>
          {["Job ID", "Name", "Site", "Crew", "Progress", "Value", "Status"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        {filtered.map((job, i) => (
          <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="fs-nav-item" style={{
            display: "grid",
            gridTemplateColumns: "110px 2fr 1.5fr 100px 80px 90px 110px",
            padding: "14px 20px",
            borderBottom: i < filtered.length - 1 ? `1px solid ${BRAND.border}` : "none",
            cursor: "pointer", gap: 12, alignItems: "center",
            animation: `fs-fadeUp 0.3s ease ${i * 0.03}s both`,
            borderLeft: `3px solid ${job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : job.Status === "At Risk" ? BRAND.amber : BRAND.blue}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.blue }}>{job.JobId}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>{job.Name}</div>
              <div onClick={(e) => { e.stopPropagation(); navigate(`/companies?highlight=${encodeURIComponent(job.Company)}`); }} style={{ fontSize: 11, color: BRAND.blue, fontWeight: 500, marginTop: 1, cursor: "pointer" }}>{job.Company}</div>
            </div>
            <div style={{ fontSize: 12, color: BRAND.textSecondary, fontWeight: 500 }}>{job.Site}</div>
            <div style={{ fontSize: 12, color: BRAND.textSecondary, fontWeight: 500 }}>{job.Crew}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ flex: 1, height: 5, background: BRAND.surface, borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${job.Progress}%`, borderRadius: 3,
                  background: job.Status === "Delayed" ? BRAND.red : BRAND.blue,
                }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textSecondary, minWidth: 28 }}>{job.Progress}%</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>{formatFullCurrency(job.Value)}</div>
            <StatusBadge status={job.Status} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: BRAND.textTertiary, fontSize: 14, fontWeight: 500 }}>
            No jobs found
          </div>
        )}
      </div>

      {showNew && <NewJobModal onClose={() => setShowNew(false)} onSave={handleCreate} companies={companies} />}
    </div>
  );
}
