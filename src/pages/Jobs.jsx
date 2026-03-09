import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND, FONT, formatFullCurrency } from "../lib/design";
import Icons from "../components/Icons";
import { useJobs, useMutation } from "../lib/hooks";
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

function NewJobModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    Name: "", Site: "", Company: "", Contact: "", Crew: "",
    Value: "", StartDate: "", EndDate: "", Phase: "Pre-Construction",
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
        background: BRAND.white, borderRadius: 16, padding: 28, width: 480,
        boxShadow: `0 8px 30px ${BRAND.shadowMd}`, animation: "fs-scaleIn 0.2s ease",
      }}>
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
              <input style={inputStyle} value={form.Company} onChange={e => set("Company", e.target.value)} />
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
          <button onClick={onClose} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
            background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.textSecondary, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => {
            if (!form.Name) return;
            const jobNum = String(Math.floor(Math.random() * 9000) + 1000);
            onSave({
              ...form,
              Value: parseFloat(form.Value) || 0,
              JobId: `JOB-2026-${jobNum}`,
              Status: "On Track",
              Progress: 0,
              Phase: "Pre-Construction",
            });
          }} style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.white, cursor: "pointer",
          }}>Create Job</button>
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const { records: jobs, refresh } = useJobs();
  const { create } = useMutation(TABLES.JOBS);
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = jobs;
    if (statusFilter !== "All") list = list.filter(j => j.Status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        j.Name?.toLowerCase().includes(q) ||
        j.JobId?.toLowerCase().includes(q) ||
        j.Site?.toLowerCase().includes(q) ||
        j.Crew?.toLowerCase().includes(q)
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

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>Jobs</div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
            {jobs.length} total · {jobs.filter(j => j.Status !== "Completed").length} active
          </div>
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

      {/* Job Grid */}
      <div style={{
        background: BRAND.white,
        borderRadius: 14,
        border: `1px solid ${BRAND.border}`,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "110px 2fr 1.5fr 100px 80px 90px 110px",
          padding: "12px 20px",
          background: BRAND.surface,
          borderBottom: `1px solid ${BRAND.border}`,
          gap: 12,
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
            cursor: "pointer",
            gap: 12,
            alignItems: "center",
            animation: `fs-fadeUp 0.3s ease ${i * 0.03}s both`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.blue }}>{job.JobId}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>{job.Name}</div>
              <div style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 500, marginTop: 1 }}>{job.Company}</div>
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

      {showNew && <NewJobModal onClose={() => setShowNew(false)} onSave={handleCreate} />}
    </div>
  );
}
