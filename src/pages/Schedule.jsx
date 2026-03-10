import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND, FONT, formatDate } from "../lib/design";
import Icons from "../components/Icons";
import { useJobs, useSchedulePhases } from "../lib/hooks";

const JOB_COLORS = [BRAND.blue, BRAND.purple, BRAND.green, BRAND.amber, BRAND.red];

export default function Schedule() {
  const { records: jobs } = useJobs();
  const { records: allPhases, setRecords: setAllPhases } = useSchedulePhases();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [crewFilter, setCrewFilter] = useState("All");
  const [editingPhase, setEditingPhase] = useState(null);

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

  const { minDate, maxDate, totalDays, weeks } = useMemo(() => {
    if (phases.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDays: 1, weeks: [] };
    const allDates = phases.flatMap(p => [new Date(p.StartDate), new Date(p.EndDate)]);
    const min = new Date(Math.min(...allDates));
    const max = new Date(Math.max(...allDates));
    const total = Math.max(1, (max - min) / (1000 * 60 * 60 * 24));
    const w = [];
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    let d = new Date(min);
    let wi = 1;
    while (d <= max) { w.push({ label: `W${wi}`, date: new Date(d) }); d = new Date(d.getTime() + weekMs); wi++; }
    return { minDate: min, maxDate: max, totalDays: total, weeks: w };
  }, [phases]);

  const today = new Date();
  const todayOffset = ((today - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;

  const jobGroups = useMemo(() => {
    const groups = {};
    phases.forEach(p => {
      if (!groups[p.JobId]) groups[p.JobId] = [];
      groups[p.JobId].push(p);
    });
    return Object.entries(groups).map(([jobId, jobPhases]) => {
      const job = jobs.find(j => j.id === jobId);
      return {
        jobId, jobName: job?.Name || jobId,
        jobNumber: job?.JobId || "", crew: job?.Crew || "",
        status: job?.Status || "",
        phases: jobPhases.sort((a, b) => a.Order - b.Order),
      };
    });
  }, [phases, jobs]);

  const statusIcons = {
    "Completed": <Icons.Check size={12} color={BRAND.green} />,
    "In Progress": <Icons.Clock size={12} color={BRAND.blue} />,
  };

  const handleUpdatePhase = (phaseId, updates) => {
    setAllPhases(prev => prev.map(p => p.id === phaseId ? { ...p, ...updates } : p));
  };

  // Track status counts
  const onTrackCount = jobGroups.filter(g => g.status === "On Track").length;
  const delayedCount = jobGroups.filter(g => g.status === "Delayed" || g.status === "At Risk").length;

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
        {/* Job filter */}
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

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: BRAND.border }} />

        {/* Status filter */}
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

        {/* Crew filter */}
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

      {/* Timeline */}
      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
        padding: "20px 24px", overflow: "hidden",
      }}>
        {weeks.length > 0 && (
          <div style={{ display: "flex", marginLeft: 200, marginBottom: 8 }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ flex: 1, fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, textAlign: "center" }}>
                {w.label}
                <div style={{ fontSize: 9, fontWeight: 500, marginTop: 1 }}>
                  {w.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ position: "relative" }}>
          {todayOffset >= 0 && todayOffset <= 100 && (
            <div style={{
              position: "absolute",
              left: `calc(200px + ${todayOffset}% * (100% - 200px) / 100)`,
              top: -4, bottom: 0, width: 2, background: BRAND.red, opacity: 0.35, zIndex: 2,
            }}>
              <div style={{
                position: "absolute", top: -4, left: -10, fontSize: 9, fontWeight: 700, color: BRAND.red,
                background: BRAND.redSoft, padding: "1px 4px", borderRadius: 3, whiteSpace: "nowrap",
              }}>Today</div>
            </div>
          )}

          {jobGroups.map((group, gi) => {
            const jobColor = JOB_COLORS[gi % JOB_COLORS.length];
            const jobStatusColor = group.status === "On Track" ? BRAND.green : group.status === "Delayed" ? BRAND.red : BRAND.amber;
            return (
              <div key={group.jobId} style={{ marginBottom: 16 }}>
                {selectedJob === "all" && (
                  <div onClick={() => navigate(`/jobs/${group.jobId}`)} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    marginBottom: 6, cursor: "pointer", padding: "4px 0",
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: jobColor }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{group.jobName}</span>
                    <span style={{ fontSize: 11, color: BRAND.blue, fontWeight: 600 }}>{group.jobNumber}</span>
                    <span style={{ fontSize: 10, color: BRAND.textTertiary, fontWeight: 500 }}>· {group.crew}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, color: jobStatusColor,
                      background: jobStatusColor + "18", padding: "1px 6px", borderRadius: 4,
                    }}>{group.status}</span>
                  </div>
                )}

                {group.phases.map((phase, pi) => {
                  const startOffset = ((new Date(phase.StartDate) - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
                  const widthPct = Math.max(2, (phase.Duration / totalDays) * 100);
                  const isComplete = phase.Status === "Completed";
                  const isInProgress = phase.Status === "In Progress";

                  return (
                    <div key={phase.id}>
                      <div style={{
                        display: "flex", alignItems: "center", height: 36, marginBottom: 3,
                        animation: `fs-slideIn 0.3s ease ${(gi * 0.05) + (pi * 0.03)}s both`,
                      }}>
                        <div style={{ width: 200, display: "flex", alignItems: "center", gap: 6, paddingRight: 12, flexShrink: 0 }}>
                          {selectedJob === "all" && <div style={{ width: 16 }} />}
                          {/* Status toggle */}
                          <div onClick={() => {
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
                              cursor: "pointer",
                            }} onClick={() => setEditingPhase(editingPhase === phase.id ? null : phase.id)}>
                              {phase.PhaseName}
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1, position: "relative", height: "100%" }}>
                          <div onClick={() => setEditingPhase(editingPhase === phase.id ? null : phase.id)} style={{
                            position: "absolute", left: `${startOffset}%`, width: `${widthPct}%`,
                            top: 8, height: 20, borderRadius: 5,
                            background: jobColor + "18", border: `1.5px solid ${jobColor}44`,
                            overflow: "hidden", display: "flex", alignItems: "center", paddingLeft: 6,
                            cursor: "pointer",
                          }}>
                            <div style={{
                              position: "absolute", left: 0, top: 0, bottom: 0,
                              width: isComplete ? "100%" : isInProgress ? "50%" : "0%",
                              background: jobColor + "33", borderRadius: "5px 0 0 5px",
                            }} />
                            <span style={{ position: "relative", zIndex: 1, fontSize: 9, fontWeight: 700, color: jobColor }}>{phase.Duration}d</span>
                          </div>
                        </div>
                      </div>
                      {/* Inline edit */}
                      {editingPhase === phase.id && (
                        <div style={{
                          marginLeft: selectedJob === "all" ? 32 : 16, marginBottom: 8, padding: 12,
                          background: BRAND.surface, borderRadius: 8, border: `1px solid ${BRAND.border}`,
                          animation: "fs-fadeUp 0.2s ease both", display: "flex", gap: 10, alignItems: "flex-end",
                        }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, display: "block", marginBottom: 3 }}>Start</label>
                            <input type="date" defaultValue={phase.StartDate} onChange={e => handleUpdatePhase(phase.id, { StartDate: e.target.value })} style={{
                              width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
                              fontSize: 11, fontFamily: FONT, background: BRAND.white, outline: "none",
                            }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, display: "block", marginBottom: 3 }}>End</label>
                            <input type="date" defaultValue={phase.EndDate} onChange={e => handleUpdatePhase(phase.id, { EndDate: e.target.value })} style={{
                              width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
                              fontSize: 11, fontFamily: FONT, background: BRAND.white, outline: "none",
                            }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, display: "block", marginBottom: 3 }}>Status</label>
                            <select defaultValue={phase.Status} onChange={e => handleUpdatePhase(phase.id, { Status: e.target.value })} style={{
                              width: "100%", padding: "5px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
                              fontSize: 11, fontFamily: FONT, background: BRAND.white, outline: "none", cursor: "pointer",
                            }}>
                              <option>Not Started</option>
                              <option>In Progress</option>
                              <option>Completed</option>
                            </select>
                          </div>
                          <button onClick={() => setEditingPhase(null)} style={{
                            padding: "5px 10px", borderRadius: 6, border: "none",
                            background: BRAND.blue, color: BRAND.white, fontSize: 11,
                            fontWeight: 600, fontFamily: FONT, cursor: "pointer",
                          }}>Done</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

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
