import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND, FONT, formatDate } from "../lib/design";
import Icons from "../components/Icons";
import { useJobs, useSchedulePhases, useMilestones } from "../lib/hooks";

const JOB_COLORS = [BRAND.blue, BRAND.purple, BRAND.green, BRAND.amber, BRAND.red];

const TIME_HORIZONS = [
  { key: "1w", label: "1 Week", days: 7 },
  { key: "2w", label: "2 Weeks", days: 14 },
  { key: "1m", label: "Month", days: 30 },
  { key: "1q", label: "Quarter", days: 90 },
  { key: "6m", label: "6 Months", days: 182 },
  { key: "1y", label: "Year", days: 365 },
  { key: "all", label: "All", days: 0 },
];

function getTimeColumns(viewMin, viewMax) {
  const cols = [];
  const totalDays = Math.max(1, (viewMax - viewMin) / (1000 * 60 * 60 * 24));
  if (totalDays <= 14) {
    let d = new Date(viewMin);
    while (d <= viewMax) {
      cols.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), sub: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), date: new Date(d) });
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    }
  } else if (totalDays <= 90) {
    let d = new Date(viewMin); let wi = 1;
    while (d <= viewMax) {
      cols.push({ label: `W${wi}`, sub: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), date: new Date(d) });
      d = new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000); wi++;
    }
  } else if (totalDays <= 365) {
    let d = new Date(viewMin); d.setDate(1);
    while (d <= viewMax) {
      cols.push({ label: d.toLocaleDateString("en-US", { month: "short" }), sub: d.getFullYear().toString(), date: new Date(d) });
      d.setMonth(d.getMonth() + 1);
    }
  } else {
    let d = new Date(viewMin); d.setDate(1); d.setMonth(Math.floor(d.getMonth() / 3) * 3);
    while (d <= viewMax) {
      cols.push({ label: `Q${Math.floor(d.getMonth() / 3) + 1}`, sub: d.getFullYear().toString(), date: new Date(d) });
      d.setMonth(d.getMonth() + 3);
    }
  }
  return cols;
}

// Phase detail popover for schedule view
function PhasePopover({ phase, color, job, onClose, onUpdatePhase, style: posStyle }) {
  const statusColors = { "Completed": BRAND.green, "In Progress": BRAND.blue, "Not Started": BRAND.textTertiary };
  const stColor = statusColors[phase.Status] || BRAND.textTertiary;
  return (
    <div data-popover style={{
      position: "absolute", zIndex: 100, background: BRAND.white, borderRadius: 12,
      boxShadow: `0 8px 30px rgba(0,0,0,0.15)`, border: `1px solid ${BRAND.border}`,
      width: 300, animation: "fs-scaleIn 0.15s ease both", ...posStyle,
    }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BRAND.border}`, borderTop: `3px solid ${color}`, borderRadius: "12px 12px 0 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{phase.PhaseName}</div>
            {job && <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, marginTop: 2 }}>{job.Name} · {job.Crew}</div>}
            <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: stColor, background: stColor + "18", padding: "2px 8px", borderRadius: 4, fontFamily: FONT }}>{phase.Status}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: color, fontFamily: FONT }}>{phase.Duration}d</span>
            </div>
          </div>
          <div onClick={onClose} style={{ cursor: "pointer", padding: 2 }}><Icons.X size={16} color={BRAND.textTertiary} /></div>
        </div>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 2 }}>Start</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{formatDate(phase.StartDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 2 }}>End</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{formatDate(phase.EndDate)}</div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 4 }}>Change Status</div>
          <div style={{ display: "flex", gap: 4 }}>
            {["Not Started", "In Progress", "Completed"].map(s => (
              <button key={s} onClick={() => { onUpdatePhase(phase.id, { Status: s }); onClose(); }} style={{
                flex: 1, padding: "5px 6px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                fontFamily: FONT, cursor: "pointer", border: "none",
                background: phase.Status === s ? (statusColors[s] || BRAND.textTertiary) + "22" : BRAND.surface,
                color: phase.Status === s ? (statusColors[s] || BRAND.textTertiary) : BRAND.textSecondary,
              }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, fontWeight: 600, color: BRAND.textTertiary, display: "block", marginBottom: 2 }}>Start</label>
            <input type="date" defaultValue={phase.StartDate} onChange={e => onUpdatePhase(phase.id, { StartDate: e.target.value })} style={{
              width: "100%", padding: "4px 6px", borderRadius: 5, border: `1px solid ${BRAND.border}`,
              fontSize: 11, fontFamily: FONT, background: BRAND.surface, outline: "none",
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, fontWeight: 600, color: BRAND.textTertiary, display: "block", marginBottom: 2 }}>End</label>
            <input type="date" defaultValue={phase.EndDate} onChange={e => onUpdatePhase(phase.id, { EndDate: e.target.value })} style={{
              width: "100%", padding: "4px 6px", borderRadius: 5, border: `1px solid ${BRAND.border}`,
              fontSize: 11, fontFamily: FONT, background: BRAND.surface, outline: "none",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Schedule() {
  const { records: jobs } = useJobs();
  const { records: allPhases, setRecords: setAllPhases } = useSchedulePhases();
  const { records: allMilestones } = useMilestones();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [crewFilter, setCrewFilter] = useState("All");
  const [horizon, setHorizon] = useState("all");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [showCustom, setShowCustom] = useState(false);
  const [popover, setPopover] = useState(null);
  const containerRef = useRef(null);

  const activeJobs = useMemo(() => jobs.filter(j => j.Status !== "Completed"), [jobs]);
  const crews = useMemo(() => ["All", ...new Set(jobs.map(j => j.Crew).filter(Boolean))], [jobs]);

  const phases = useMemo(() => {
    let list = allPhases;
    if (selectedJob !== "all") list = list.filter(p => p.JobId === selectedJob);
    if (statusFilter !== "All") list = list.filter(p => p.Status === statusFilter);
    if (crewFilter !== "All") {
      const jobIds = jobs.filter(j => j.Crew === crewFilter).map(j => j.id);
      list = list.filter(p => jobIds.includes(p.JobId));
    }
    return list;
  }, [allPhases, selectedJob, statusFilter, crewFilter, jobs]);

  // Compute view range from data + horizon
  const dataMin = useMemo(() => {
    if (phases.length === 0) return new Date();
    return new Date(Math.min(...phases.map(p => new Date(p.StartDate))));
  }, [phases]);
  const dataMax = useMemo(() => {
    if (phases.length === 0) return new Date();
    return new Date(Math.max(...phases.map(p => new Date(p.EndDate))));
  }, [phases]);

  const today = new Date();
  let viewMin, viewMax;
  if (horizon === "all") { viewMin = dataMin; viewMax = dataMax; }
  else if (horizon === "custom" && customRange.start && customRange.end) { viewMin = new Date(customRange.start); viewMax = new Date(customRange.end); }
  else {
    const preset = TIME_HORIZONS.find(h => h.key === horizon);
    if (preset && preset.days > 0) {
      const halfDays = preset.days / 2;
      viewMin = new Date(today.getTime() - halfDays * 0.3 * 24 * 60 * 60 * 1000);
      viewMax = new Date(today.getTime() + halfDays * 1.7 * 24 * 60 * 60 * 1000);
      if (viewMin > dataMin) viewMin = new Date(Math.min(viewMin.getTime(), dataMin.getTime()));
      if (viewMax < dataMax) viewMax = new Date(Math.max(viewMax.getTime(), dataMax.getTime()));
    } else { viewMin = dataMin; viewMax = dataMax; }
  }

  const totalDays = Math.max(1, (viewMax - viewMin) / (1000 * 60 * 60 * 24));
  const todayOffset = ((today - viewMin) / (1000 * 60 * 60 * 24)) / totalDays * 100;
  const columns = getTimeColumns(viewMin, viewMax);
  const LABEL_W = 200;

  const jobGroups = useMemo(() => {
    const groups = {};
    phases.forEach(p => { if (!groups[p.JobId]) groups[p.JobId] = []; groups[p.JobId].push(p); });
    return Object.entries(groups).map(([jobId, jobPhases]) => {
      const job = jobs.find(j => j.id === jobId);
      return { jobId, jobName: job?.Name || jobId, jobNumber: job?.JobId || "", crew: job?.Crew || "", status: job?.Status || "", phases: jobPhases.sort((a, b) => a.Order - b.Order) };
    });
  }, [phases, jobs]);

  const handleUpdatePhase = (phaseId, updates) => {
    setAllPhases(prev => prev.map(p => p.id === phaseId ? { ...p, ...updates } : p));
  };

  const handlePillClick = (e, phase) => {
    e.stopPropagation();
    if (popover?.phaseId === phase.id) { setPopover(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    setPopover({
      phaseId: phase.id,
      x: Math.min(rect.left - (containerRect?.left || 0), (containerRect?.width || 600) - 320),
      y: rect.bottom - (containerRect?.top || 0) + 4,
    });
  };

  useEffect(() => {
    const handler = (e) => { if (popover && !e.target.closest("[data-popover]")) setPopover(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popover]);

  const onTrackCount = jobGroups.filter(g => g.status === "On Track").length;
  const delayedCount = jobGroups.filter(g => g.status === "Delayed" || g.status === "At Risk").length;

  // Milestones in view
  const visibleMilestones = useMemo(() => {
    return allMilestones.filter(ms => {
      const d = new Date(ms.Date);
      if (d < viewMin || d > viewMax) return false;
      if (selectedJob !== "all" && ms.JobId !== selectedJob) return false;
      return true;
    });
  }, [allMilestones, viewMin, viewMax, selectedJob]);

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>Schedule</div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
            {activeJobs.length} active jobs · {phases.length} phases
            {onTrackCount > 0 && <span style={{ fontSize: 10, fontWeight: 600, color: BRAND.green, background: BRAND.greenSoft, padding: "2px 6px", borderRadius: 4 }}>{onTrackCount} on track</span>}
            {delayedCount > 0 && <span style={{ fontSize: 10, fontWeight: 600, color: BRAND.red, background: BRAND.redSoft, padding: "2px 6px", borderRadius: 4 }}>{delayedCount} delayed/at risk</span>}
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={() => setSelectedJob("all")} style={{
            padding: "6px 14px", borderRadius: 8,
            background: selectedJob === "all" ? BRAND.blueSoft : BRAND.white,
            color: selectedJob === "all" ? BRAND.blue : BRAND.textSecondary,
            fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
            border: `1px solid ${selectedJob === "all" ? BRAND.blue + "33" : BRAND.border}`,
          }}>All Jobs</button>
          {activeJobs.map((job, i) => (
            <button key={job.id} onClick={() => setSelectedJob(job.id)} style={{
              padding: "6px 14px", borderRadius: 8,
              background: selectedJob === job.id ? JOB_COLORS[i % JOB_COLORS.length] + "18" : BRAND.white,
              color: selectedJob === job.id ? JOB_COLORS[i % JOB_COLORS.length] : BRAND.textSecondary,
              fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
              border: `1px solid ${selectedJob === job.id ? JOB_COLORS[i % JOB_COLORS.length] + "33" : BRAND.border}`,
            }}>{job.Name}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: BRAND.border }} />
        <div style={{ display: "flex", gap: 3, background: BRAND.white, borderRadius: 8, padding: 2, border: `1px solid ${BRAND.border}` }}>
          {["All", "Not Started", "In Progress", "Completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: "5px 10px", borderRadius: 6, border: "none",
              background: statusFilter === s ? BRAND.blueSoft : "transparent",
              color: statusFilter === s ? BRAND.blue : BRAND.textSecondary,
              fontSize: 11, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, background: BRAND.white, borderRadius: 8, padding: 2, border: `1px solid ${BRAND.border}` }}>
          {crews.map(c => (
            <button key={c} onClick={() => setCrewFilter(c)} style={{
              padding: "5px 10px", borderRadius: 6, border: "none",
              background: crewFilter === c ? BRAND.purpleSoft : "transparent",
              color: crewFilter === c ? BRAND.purple : BRAND.textSecondary,
              fontSize: 11, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Timeline card */}
      <div ref={containerRef} style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        padding: "20px 24px", overflow: "hidden", position: "relative",
      }} onClick={() => setPopover(null)}>

        {/* Time horizon toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, marginRight: 4 }}>View:</div>
          <div style={{ display: "flex", gap: 2, background: BRAND.surface, borderRadius: 8, padding: 2, border: `1px solid ${BRAND.border}` }}>
            {TIME_HORIZONS.map(h => (
              <button key={h.key} onClick={(e) => { e.stopPropagation(); setHorizon(h.key); setShowCustom(false); }} style={{
                padding: "4px 10px", borderRadius: 6, border: "none",
                background: horizon === h.key ? BRAND.white : "transparent",
                boxShadow: horizon === h.key ? `0 1px 3px ${BRAND.shadow}` : "none",
                color: horizon === h.key ? BRAND.blue : BRAND.textSecondary,
                fontSize: 11, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
              }}>{h.label}</button>
            ))}
            <button onClick={(e) => { e.stopPropagation(); setShowCustom(!showCustom); setHorizon("custom"); }} style={{
              padding: "4px 10px", borderRadius: 6, border: "none",
              background: horizon === "custom" ? BRAND.white : "transparent",
              boxShadow: horizon === "custom" ? `0 1px 3px ${BRAND.shadow}` : "none",
              color: horizon === "custom" ? BRAND.blue : BRAND.textSecondary,
              fontSize: 11, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
            }}>Custom</button>
          </div>
          {showCustom && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", animation: "fs-fadeUp 0.15s ease both" }} onClick={e => e.stopPropagation()}>
              <input type="date" value={customRange.start} onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))} style={{
                padding: "4px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`, fontSize: 11, fontFamily: FONT, background: BRAND.white, outline: "none",
              }} />
              <span style={{ fontSize: 11, color: BRAND.textTertiary }}>→</span>
              <input type="date" value={customRange.end} onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))} style={{
                padding: "4px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`, fontSize: 11, fontFamily: FONT, background: BRAND.white, outline: "none",
              }} />
            </div>
          )}
          {/* Legend */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {[{ label: "Completed", color: BRAND.green }, { label: "In Progress", color: BRAND.blue }, { label: "Not Started", color: BRAND.textTertiary }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 9, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
            {visibleMilestones.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 7, height: 7, transform: "rotate(45deg)", background: BRAND.amber }} />
                <span style={{ fontSize: 9, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>Milestone</span>
              </div>
            )}
          </div>
        </div>

        {/* Column headers */}
        {columns.length > 0 && (
          <div style={{ display: "flex", marginLeft: LABEL_W, marginBottom: 6 }}>
            {columns.map((col, i) => (
              <div key={i} style={{ flex: 1, fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, textAlign: "center", minWidth: 0 }}>
                <div>{col.label}</div>
                <div style={{ fontSize: 9, fontWeight: 500, marginTop: 1, color: BRAND.textTertiary + "99" }}>{col.sub}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ position: "relative" }}>
          {/* Grid lines */}
          {columns.map((_, i) => (
            <div key={i} style={{
              position: "absolute", left: `calc(${LABEL_W}px + ${(i / columns.length) * 100}% * (100% - ${LABEL_W}px) / 100%)`,
              top: 0, bottom: 0, width: 1, background: BRAND.border + "66", zIndex: 0,
            }} />
          ))}

          {/* Today marker */}
          {todayOffset >= 0 && todayOffset <= 100 && (
            <div style={{
              position: "absolute",
              left: `calc(${LABEL_W}px + ${todayOffset}% * (100% - ${LABEL_W}px) / 100)`,
              top: -4, bottom: 0, width: 2, background: BRAND.red, opacity: 0.4, zIndex: 3,
            }}>
              <div style={{
                position: "absolute", top: -4, left: -14, fontSize: 9, fontWeight: 700, color: BRAND.red,
                background: BRAND.redSoft, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap",
              }}>Today</div>
            </div>
          )}

          {/* Milestone markers */}
          {visibleMilestones.map(ms => {
            const msOffset = ((new Date(ms.Date) - viewMin) / (1000 * 60 * 60 * 24)) / totalDays * 100;
            const isFlag = ms.Type === "flag";
            return (
              <div key={ms.id} title={`${ms.Title}\n${formatDate(ms.Date)}`} style={{
                position: "absolute",
                left: `calc(${LABEL_W}px + ${msOffset}% * (100% - ${LABEL_W}px) / 100)`,
                top: -2, zIndex: 4, transform: "translateX(-50%)",
              }}>
                <div style={{
                  width: 9, height: 9, transform: "rotate(45deg)",
                  background: isFlag ? BRAND.amber : BRAND.green,
                  border: `1.5px solid ${BRAND.white}`,
                  boxShadow: `0 1px 3px ${isFlag ? BRAND.amber : BRAND.green}44`,
                  cursor: "pointer",
                }} />
              </div>
            );
          })}

          {jobGroups.map((group, gi) => {
            const jobColor = JOB_COLORS[gi % JOB_COLORS.length];
            const jobStatusColor = group.status === "On Track" ? BRAND.green : group.status === "Delayed" ? BRAND.red : BRAND.amber;
            const job = jobs.find(j => j.id === group.jobId);
            return (
              <div key={group.jobId} style={{ marginBottom: 14 }}>
                {selectedJob === "all" && (
                  <div onClick={() => navigate(`/jobs/${group.jobId}`)} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    marginBottom: 6, cursor: "pointer", padding: "4px 0",
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: jobColor }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{group.jobName}</span>
                    <span style={{ fontSize: 11, color: BRAND.blue, fontWeight: 600 }}>{group.jobNumber}</span>
                    <span style={{ fontSize: 10, color: BRAND.textTertiary, fontWeight: 500 }}>· {group.crew}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: jobStatusColor, background: jobStatusColor + "18", padding: "1px 6px", borderRadius: 4 }}>{group.status}</span>
                  </div>
                )}

                {group.phases.map((phase, pi) => {
                  const phaseStart = new Date(phase.StartDate);
                  const phaseEnd = new Date(phase.EndDate);
                  const clampStart = new Date(Math.max(phaseStart, viewMin));
                  const clampEnd = new Date(Math.min(phaseEnd, viewMax));
                  if (clampStart >= viewMax || clampEnd <= viewMin) return null;

                  const startOffset = ((clampStart - viewMin) / (1000 * 60 * 60 * 24)) / totalDays * 100;
                  const endOffset = ((clampEnd - viewMin) / (1000 * 60 * 60 * 24)) / totalDays * 100;
                  const widthPct = Math.max(1.5, endOffset - startOffset);
                  const isComplete = phase.Status === "Completed";
                  const isInProgress = phase.Status === "In Progress";

                  return (
                    <div key={phase.id} style={{
                      display: "flex", alignItems: "center", height: 36, marginBottom: 2,
                      animation: `fs-slideIn 0.3s ease ${(gi * 0.05) + (pi * 0.03)}s both`,
                    }}>
                      <div style={{ width: LABEL_W, display: "flex", alignItems: "center", gap: 6, paddingRight: 12, flexShrink: 0 }}>
                        {selectedJob === "all" && <div style={{ width: 16 }} />}
                        <div onClick={(e) => {
                          e.stopPropagation();
                          const next = phase.Status === "Not Started" ? "In Progress" : phase.Status === "In Progress" ? "Completed" : "Not Started";
                          handleUpdatePhase(phase.id, { Status: next });
                        }} style={{
                          width: 16, height: 16, borderRadius: 3, cursor: "pointer", flexShrink: 0,
                          background: isComplete ? BRAND.green : isInProgress ? BRAND.blue : BRAND.white,
                          border: `1.5px solid ${isComplete ? BRAND.green : isInProgress ? BRAND.blue : BRAND.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {isComplete && <Icons.Check size={8} color={BRAND.white} />}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{
                            fontSize: 11, fontWeight: 600, color: BRAND.textPrimary,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{phase.PhaseName}</div>
                        </div>
                      </div>
                      <div style={{ flex: 1, position: "relative", height: "100%" }}>
                        <div data-popover onClick={(e) => handlePillClick(e, phase)} style={{
                          position: "absolute", left: `${startOffset}%`, width: `${widthPct}%`,
                          top: 8, height: 20, borderRadius: 5,
                          background: jobColor + "18", border: `1.5px solid ${jobColor}44`,
                          overflow: "hidden", display: "flex", alignItems: "center", paddingLeft: 6,
                          cursor: "pointer", transition: "box-shadow 0.15s ease",
                          boxShadow: popover?.phaseId === phase.id ? `0 2px 8px ${jobColor}33` : "none",
                        }}>
                          <div style={{
                            position: "absolute", left: 0, top: 0, bottom: 0,
                            width: isComplete ? "100%" : isInProgress ? "50%" : "0%",
                            background: jobColor + "33", borderRadius: "5px 0 0 5px",
                          }} />
                          <span style={{ position: "relative", zIndex: 1, fontSize: 9, fontWeight: 700, color: jobColor }}>{phase.Duration}d</span>
                          {widthPct > 8 && (
                            <span style={{
                              position: "relative", zIndex: 1, fontSize: 8, fontWeight: 500, color: jobColor + "AA", fontFamily: FONT,
                              marginLeft: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {new Date(phase.StartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Popover */}
          {popover && (() => {
            const phase = allPhases.find(p => p.id === popover.phaseId);
            if (!phase) return null;
            const gi = jobGroups.findIndex(g => g.phases.some(p => p.id === phase.id));
            const job = jobs.find(j => j.id === phase.JobId);
            return (
              <PhasePopover
                phase={phase}
                color={JOB_COLORS[gi >= 0 ? gi % JOB_COLORS.length : 0]}
                job={job}
                onClose={() => setPopover(null)}
                onUpdatePhase={handleUpdatePhase}
                style={{ left: Math.max(0, popover.x), top: popover.y }}
              />
            );
          })()}

          {phases.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: BRAND.textTertiary, fontSize: 14 }}>
              No schedule data matches your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
