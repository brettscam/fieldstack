import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BRAND, FONT, formatFullCurrency, formatDate } from "../lib/design";
import Icons from "../components/Icons";
import { useRecord, useSchedulePhases, useTeamMembers, useMilestones } from "../lib/hooks";
import { TABLES } from "../lib/supabase";

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      {Icon && <Icon size={16} color={BRAND.textTertiary} />}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, marginTop: 1 }}>{value || "—"}</div>
      </div>
    </div>
  );
}

// Editable Gantt Chart
function GanttChart({ phases, onUpdatePhase, onAddPhase }) {
  const [editingPhase, setEditingPhase] = useState(null);

  if (!phases.length) return (
    <div style={{ padding: 40, textAlign: "center", color: BRAND.textTertiary, fontSize: 14, fontFamily: FONT }}>
      No schedule phases defined
      <div style={{ marginTop: 12 }}>
        <button onClick={onAddPhase} style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: BRAND.blue, color: BRAND.white, fontSize: 13,
          fontWeight: 600, fontFamily: FONT, cursor: "pointer",
        }}>Add Phase</button>
      </div>
    </div>
  );

  const sorted = [...phases].sort((a, b) => a.Order - b.Order);
  const allDates = sorted.flatMap(p => [new Date(p.StartDate), new Date(p.EndDate)]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
  const today = new Date();
  const todayOffset = ((today - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;

  const weeks = [];
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  let d = new Date(minDate);
  let wi = 1;
  while (d <= maxDate) {
    weeks.push({ label: `W${wi}`, date: new Date(d) });
    d = new Date(d.getTime() + weekMs);
    wi++;
  }

  const phaseColors = [BRAND.blue, BRAND.purple, BRAND.green, BRAND.amber, BRAND.red, BRAND.blue, BRAND.green, BRAND.purple];
  const statusColors = { "Completed": BRAND.green, "In Progress": BRAND.blue, "Not Started": BRAND.textTertiary };

  return (
    <div>
      {/* Week headers */}
      <div style={{ display: "flex", marginLeft: 160, marginBottom: 8 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, textAlign: "center" }}>
            {w.label}
            <div style={{ fontSize: 9, fontWeight: 500, marginTop: 1 }}>
              {w.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        {todayOffset >= 0 && todayOffset <= 100 && (
          <div style={{
            position: "absolute",
            left: `calc(160px + ${todayOffset}% * (100% - 160px) / 100)`,
            top: -4, bottom: 0, width: 2, background: BRAND.red, opacity: 0.4, zIndex: 2,
          }}>
            <div style={{
              position: "absolute", top: -4, left: -10, fontSize: 9, fontWeight: 700, color: BRAND.red,
              background: BRAND.redSoft, padding: "1px 4px", borderRadius: 3, fontFamily: FONT, whiteSpace: "nowrap",
            }}>Today</div>
          </div>
        )}
        {sorted.map((phase, i) => {
          const startOffset = ((new Date(phase.StartDate) - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
          const widthPct = Math.max(2, (phase.Duration / totalDays) * 100);
          const color = phaseColors[i % phaseColors.length];
          const isComplete = phase.Status === "Completed";
          const isInProgress = phase.Status === "In Progress";

          return (
            <div key={phase.id} style={{
              display: "flex", alignItems: "center", height: 44, marginBottom: 4,
              animation: `fs-slideIn 0.35s ease ${i * 0.04}s both`,
            }}>
              <div style={{ width: 160, display: "flex", alignItems: "center", gap: 6, paddingRight: 12, flexShrink: 0 }}>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT,
                    cursor: "pointer",
                  }} onClick={() => setEditingPhase(editingPhase === phase.id ? null : phase.id)}>
                    {phase.PhaseName}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, fontFamily: FONT,
                    color: statusColors[phase.Status] || BRAND.textTertiary,
                  }}>{phase.Status}</div>
                </div>
                {/* Status toggle */}
                <div onClick={() => {
                  const nextStatus = phase.Status === "Not Started" ? "In Progress" : phase.Status === "In Progress" ? "Completed" : "Not Started";
                  onUpdatePhase(phase.id, { Status: nextStatus });
                }} style={{
                  width: 18, height: 18, borderRadius: 4, cursor: "pointer",
                  background: isComplete ? BRAND.green : isInProgress ? BRAND.blue : BRAND.surface,
                  border: `1.5px solid ${isComplete ? BRAND.green : isInProgress ? BRAND.blue : BRAND.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isComplete && <Icons.Check size={10} color={BRAND.white} />}
                  {isInProgress && <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.white }} />}
                </div>
              </div>
              <div style={{ flex: 1, position: "relative", height: "100%" }}>
                <div style={{
                  position: "absolute", left: `${startOffset}%`, width: `${widthPct}%`,
                  top: 8, height: 28, borderRadius: 6,
                  background: color + "18", border: `1.5px solid ${color}44`,
                  overflow: "hidden", display: "flex", alignItems: "center", paddingLeft: 8,
                  cursor: "pointer",
                }} onClick={() => setEditingPhase(editingPhase === phase.id ? null : phase.id)}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: isComplete ? "100%" : isInProgress ? "50%" : "0%",
                    background: color + "33", borderRadius: "6px 0 0 6px", transition: "width 0.5s ease",
                  }} />
                  <span style={{ position: "relative", zIndex: 1, fontSize: 10, fontWeight: 600, color: color, fontFamily: FONT }}>
                    {phase.Duration}d
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Edit panel inline */}
      {editingPhase && (() => {
        const phase = sorted.find(p => p.id === editingPhase);
        if (!phase) return null;
        return (
          <div style={{
            marginTop: 12, padding: 16, background: BRAND.surface, borderRadius: 10,
            border: `1px solid ${BRAND.border}`, animation: "fs-fadeUp 0.2s ease both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Edit: {phase.PhaseName}</span>
              <div onClick={() => setEditingPhase(null)} style={{ cursor: "pointer" }}><Icons.X size={16} color={BRAND.textTertiary} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, display: "block", marginBottom: 3 }}>Start Date</label>
                <input type="date" defaultValue={phase.StartDate} onChange={e => onUpdatePhase(phase.id, { StartDate: e.target.value })} style={{
                  width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
                  fontSize: 12, fontFamily: FONT, background: BRAND.white, outline: "none",
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, display: "block", marginBottom: 3 }}>End Date</label>
                <input type="date" defaultValue={phase.EndDate} onChange={e => onUpdatePhase(phase.id, { EndDate: e.target.value })} style={{
                  width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
                  fontSize: 12, fontFamily: FONT, background: BRAND.white, outline: "none",
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, display: "block", marginBottom: 3 }}>Status</label>
                <select defaultValue={phase.Status} onChange={e => onUpdatePhase(phase.id, { Status: e.target.value })} style={{
                  width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
                  fontSize: 12, fontFamily: FONT, background: BRAND.white, outline: "none", cursor: "pointer",
                }}>
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          </div>
        );
      })()}
      <button onClick={onAddPhase} style={{
        marginTop: 12, display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 8, border: `1.5px dashed ${BRAND.border}`,
        background: "transparent", color: BRAND.textTertiary, fontSize: 12,
        fontWeight: 600, fontFamily: FONT, cursor: "pointer", width: "100%", justifyContent: "center",
      }} className="fs-view-btn">
        <Icons.Plus size={14} color={BRAND.textTertiary} /> Add Phase
      </button>
    </div>
  );
}

// Team panel
function TeamSection({ members }) {
  const [messageModal, setMessageModal] = useState(false);
  const typeColors = {
    "In-House": BRAND.blue,
    "Sub-Contractor": BRAND.purple,
    "Client Rep": BRAND.green,
  };

  return (
    <div style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      padding: "20px 24px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Team</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>
            {members.length} members assigned
          </div>
        </div>
        <button onClick={() => setMessageModal(true)} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
          background: BRAND.white, fontSize: 12, fontWeight: 600, fontFamily: FONT,
          color: BRAND.blue, cursor: "pointer",
        }} className="fs-view-btn">
          <Icons.Mail size={14} color={BRAND.blue} /> Message Crew
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {members.map(m => {
          const color = typeColors[m.Type] || BRAND.textTertiary;
          const initials = m.Name.split(" ").map(n => n[0]).join("");
          return (
            <div key={m.id} style={{
              padding: "14px 16px", borderRadius: 12, border: `1px solid ${BRAND.border}`,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: color + "22", border: `2px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: color, fontFamily: FONT, flexShrink: 0,
              }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{m.Name}</div>
                <div style={{ fontSize: 11, color: BRAND.textSecondary, fontFamily: FONT, fontWeight: 500, marginTop: 1 }}>{m.Role}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, color: color,
                    background: color + "14", padding: "1px 6px", borderRadius: 4, fontFamily: FONT,
                  }}>{m.Type}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {m.Phone && (
                    <a href={`tel:${m.Phone}`} style={{ fontSize: 10, color: BRAND.blue, fontWeight: 600, fontFamily: FONT, textDecoration: "none" }}>
                      {m.Phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message modal */}
      {messageModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: FONT }} onClick={() => setMessageModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: BRAND.white, borderRadius: 16, padding: 28, width: 480, boxShadow: `0 8px 30px ${BRAND.shadowMd}`, animation: "fs-scaleIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Message Crew</div>
              <div onClick={() => setMessageModal(false)} style={{ cursor: "pointer" }}><Icons.X size={20} color={BRAND.textTertiary} /></div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>To</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {members.map(m => (
                  <span key={m.id} style={{
                    fontSize: 11, fontWeight: 600, background: BRAND.blueSoft, color: BRAND.blue,
                    padding: "3px 8px", borderRadius: 6, fontFamily: FONT,
                  }}>{m.Name}</span>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Message</label>
              <textarea placeholder="Type your message to the crew..." style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
                fontSize: 13, fontFamily: FONT, background: BRAND.surface, outline: "none", minHeight: 120, resize: "vertical",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setMessageModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`, background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.textSecondary, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setMessageModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.white, cursor: "pointer" }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Milestones & flags
function MilestonesSection({ milestones }) {
  if (!milestones.length) return null;
  const sorted = [...milestones].sort((a, b) => new Date(b.Date) - new Date(a.Date));

  return (
    <div style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      padding: "20px 24px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 16 }}>
        Activity & Milestones
      </div>
      <div style={{ position: "relative", paddingLeft: 24 }}>
        {/* Timeline line */}
        <div style={{ position: "absolute", left: 8, top: 6, bottom: 6, width: 2, background: BRAND.border }} />
        {sorted.map((ms, i) => {
          const isFlag = ms.Type === "flag";
          return (
            <div key={ms.id} style={{ display: "flex", gap: 12, marginBottom: 16, position: "relative" }}>
              <div style={{
                position: "absolute", left: -20, top: 4,
                width: 14, height: 14, borderRadius: "50%",
                background: isFlag ? BRAND.amberSoft : BRAND.greenSoft,
                border: `2px solid ${isFlag ? BRAND.amber : BRAND.green}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isFlag ? (
                  <div style={{ width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderBottom: `5px solid ${BRAND.amber}` }} />
                ) : (
                  <Icons.Check size={8} color={BRAND.green} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{ms.Title}</div>
                <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>
                  {formatDate(ms.Date)} {isFlag && <span style={{ color: BRAND.amber, fontWeight: 600 }}>· Flag</span>}
                </div>
                {ms.Notes && (
                  <div style={{ fontSize: 12, color: BRAND.textSecondary, fontFamily: FONT, marginTop: 4 }}>{ms.Notes}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mini map for job location
function JobMap({ job }) {
  if (!job.Lat || !job.Lng) return null;
  const statusColors = { "On Track": BRAND.green, "Delayed": BRAND.red, "At Risk": BRAND.amber };
  const color = statusColors[job.Status] || BRAND.blue;

  return (
    <div style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      overflow: "hidden", flex: 1,
    }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <Icons.MapPin size={14} color={BRAND.blue} />
        <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Location</span>
      </div>
      <div style={{
        height: 160, position: "relative",
        background: `linear-gradient(135deg, ${BRAND.blueSoft} 0%, ${BRAND.surface} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", inset: -12, borderRadius: "50%",
            background: color + "22", animation: "fs-pulse 2s infinite",
          }} />
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: color, border: `3px solid ${BRAND.white}`,
            boxShadow: `0 2px 8px ${color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icons.Hardhat size={16} color={BRAND.white} />
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 12, fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>
          {job.Lat.toFixed(4)}, {job.Lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}

// Add phase modal
function AddPhaseModal({ onClose, onSave, nextOrder }) {
  const [form, setForm] = useState({ PhaseName: "", StartDate: "", EndDate: "", Duration: "" });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
    fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none", background: BRAND.surface,
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: FONT }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: BRAND.white, borderRadius: 16, padding: 28, width: 400, boxShadow: `0 8px 30px ${BRAND.shadowMd}`, animation: "fs-scaleIn 0.2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Add Phase</div>
          <div onClick={onClose} style={{ cursor: "pointer" }}><Icons.X size={20} color={BRAND.textTertiary} /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Phase Name *</label>
            <input style={inputStyle} value={form.PhaseName} onChange={e => set("PhaseName", e.target.value)} placeholder="e.g., Inspection" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Start</label>
              <input style={inputStyle} type="date" value={form.StartDate} onChange={e => set("StartDate", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>End</label>
              <input style={inputStyle} type="date" value={form.EndDate} onChange={e => set("EndDate", e.target.value)} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`, background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.textSecondary, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => {
            if (!form.PhaseName || !form.StartDate || !form.EndDate) return;
            const days = Math.max(1, Math.ceil((new Date(form.EndDate) - new Date(form.StartDate)) / (1000 * 60 * 60 * 24)));
            onSave({ ...form, Duration: days, Order: nextOrder, Status: "Not Started", id: "sp_" + Math.random().toString(36).slice(2, 8) });
          }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.white, cursor: "pointer" }}>Add Phase</button>
        </div>
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { record: job, loading } = useRecord(TABLES.JOBS, jobId);
  const { records: phases, setRecords: setPhases } = useSchedulePhases(jobId);
  const { records: teamMembers } = useTeamMembers(jobId);
  const { records: milestones } = useMilestones(jobId);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule"); // schedule | team | activity

  if (loading) return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ fontSize: 14, color: BRAND.textTertiary }}>Loading...</div>
    </div>
  );

  if (!job) return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ fontSize: 14, color: BRAND.textTertiary }}>Job not found</div>
      <button onClick={() => navigate("/jobs")} style={{
        marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "none",
        background: BRAND.blue, color: BRAND.white, fontSize: 13, fontWeight: 600,
        fontFamily: FONT, cursor: "pointer",
      }}>Back to Jobs</button>
    </div>
  );

  const statusColor = job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : job.Status === "At Risk" ? BRAND.amber : BRAND.blue;
  const flagCount = milestones.filter(m => m.Type === "flag").length;

  const handleUpdatePhase = (phaseId, updates) => {
    setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, ...updates } : p));
  };

  const handleAddPhase = (newPhase) => {
    setPhases(prev => [...prev, { ...newPhase, JobId: jobId }]);
    setShowAddPhase(false);
  };

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <span onClick={() => navigate("/jobs")} style={{ fontSize: 13, color: BRAND.blue, fontWeight: 600, cursor: "pointer" }}>Jobs</span>
        <Icons.ChevronRight size={14} color={BRAND.textTertiary} />
        <span style={{ fontSize: 13, color: BRAND.textSecondary, fontWeight: 600 }}>{job.JobId}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>{job.Name}</div>
            <span style={{
              fontSize: 11, fontWeight: 600, fontFamily: FONT,
              color: statusColor, background: statusColor + "18",
              padding: "3px 10px", borderRadius: 6,
            }}>{job.Status}</span>
            {flagCount > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, fontFamily: FONT,
                color: BRAND.amber, background: BRAND.amberSoft,
                padding: "3px 8px", borderRadius: 6,
              }}>{flagCount} flag{flagCount > 1 ? "s" : ""}</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
            {job.JobId} · {job.Company}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
            background: BRAND.white, fontSize: 12, fontWeight: 600, fontFamily: FONT,
            color: BRAND.textSecondary, cursor: "pointer",
          }} className="fs-view-btn">
            <Icons.Calendar size={14} color={BRAND.textSecondary} /> Send Weekly Schedule
          </button>
        </div>
      </div>

      {/* Info cards row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {/* Details card */}
        <div style={{
          background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
          padding: "20px 24px", flex: 1,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>Details</div>
          <InfoRow label="Site" value={job.Site} icon={Icons.MapPin} />
          <InfoRow label="Crew" value={job.Crew} icon={Icons.Users} />
          <InfoRow label="Value" value={formatFullCurrency(job.Value)} icon={Icons.DollarSign} />
          <InfoRow label="Contact" value={job.Contact} icon={Icons.Contacts} />
          <InfoRow label="Start" value={formatDate(job.StartDate)} icon={Icons.Calendar} />
          <InfoRow label="End" value={formatDate(job.EndDate)} icon={Icons.Calendar} />
        </div>

        {/* Progress card */}
        <div style={{
          background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
          padding: "20px 24px", flex: 1,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 16 }}>Progress</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke={BRAND.surface} strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={statusColor} strokeWidth="10"
                  strokeDasharray={`${(job.Progress / 100) * 314} 314`}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 0.8s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: BRAND.textPrimary }}>{job.Progress}%</span>
                <span style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 600 }}>complete</span>
              </div>
            </div>
          </div>
          <InfoRow label="Current Phase" value={job.Phase} icon={Icons.Hardhat} />
          <InfoRow label="Phases Complete" value={`${phases.filter(p => p.Status === "Completed").length} of ${phases.length}`} icon={Icons.Check} />
        </div>

        {/* Location card */}
        <JobMap job={job} />
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: BRAND.white, borderRadius: 10, padding: 3, border: `1px solid ${BRAND.border}`, width: "fit-content" }}>
        {[
          { key: "schedule", label: "Schedule", icon: Icons.Timeline },
          { key: "team", label: `Team (${teamMembers.length})`, icon: Icons.Users },
          { key: "activity", label: `Activity (${milestones.length})`, icon: Icons.Clock },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 7, border: "none",
            background: activeTab === tab.key ? BRAND.blueSoft : "transparent",
            color: activeTab === tab.key ? BRAND.blue : BRAND.textSecondary,
            fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
          }}>
            <tab.icon size={14} color={activeTab === tab.key ? BRAND.blue : BRAND.textTertiary} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schedule / Gantt */}
      {activeTab === "schedule" && (
        <div style={{
          background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`, padding: "20px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Schedule</div>
              <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500, marginTop: 2 }}>
                {phases.length} phases · {formatDate(job.StartDate)} → {formatDate(job.EndDate)} · Click phases to edit
              </div>
            </div>
          </div>
          <GanttChart
            phases={phases}
            onUpdatePhase={handleUpdatePhase}
            onAddPhase={() => setShowAddPhase(true)}
          />
        </div>
      )}

      {/* Team tab */}
      {activeTab === "team" && (
        <TeamSection members={teamMembers} />
      )}

      {/* Activity tab */}
      {activeTab === "activity" && (
        <MilestonesSection milestones={milestones} />
      )}

      {showAddPhase && (
        <AddPhaseModal
          onClose={() => setShowAddPhase(false)}
          onSave={handleAddPhase}
          nextOrder={phases.length + 1}
        />
      )}
    </div>
  );
}
