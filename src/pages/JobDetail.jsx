import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BRAND, FONT, formatFullCurrency, formatDate } from "../lib/design";
import Icons from "../components/Icons";
import { useRecord, useSchedulePhases, useTeamMembers, useMilestones } from "../lib/hooks";
import { TABLES } from "../lib/supabase";

function InfoRow({ label, value, icon: Icon, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: onClick ? "pointer" : "default" }}>
      {Icon && <Icon size={16} color={onClick ? BRAND.blue : BRAND.textTertiary} />}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: onClick ? BRAND.blue : BRAND.textPrimary, fontFamily: FONT, marginTop: 1 }}>{value || "—"}</div>
      </div>
    </div>
  );
}

// ============================================
// TIME HORIZON PRESETS
// ============================================
const TIME_HORIZONS = [
  { key: "1w", label: "1 Week", days: 7 },
  { key: "2w", label: "2 Weeks", days: 14 },
  { key: "1m", label: "Month", days: 30 },
  { key: "1q", label: "Quarter", days: 90 },
  { key: "6m", label: "6 Months", days: 182 },
  { key: "1y", label: "Year", days: 365 },
  { key: "all", label: "All", days: 0 },
];

function getTimeColumns(viewMin, viewMax, horizonKey) {
  const cols = [];
  const totalDays = Math.max(1, (viewMax - viewMin) / (1000 * 60 * 60 * 24));

  if (totalDays <= 14) {
    // Day columns
    let d = new Date(viewMin);
    while (d <= viewMax) {
      cols.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        sub: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: new Date(d),
      });
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    }
  } else if (totalDays <= 90) {
    // Week columns
    let d = new Date(viewMin);
    let wi = 1;
    while (d <= viewMax) {
      cols.push({
        label: `W${wi}`,
        sub: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: new Date(d),
      });
      d = new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000);
      wi++;
    }
  } else if (totalDays <= 365) {
    // Month columns
    let d = new Date(viewMin);
    d.setDate(1);
    while (d <= viewMax) {
      cols.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        sub: d.getFullYear().toString(),
        date: new Date(d),
      });
      d.setMonth(d.getMonth() + 1);
    }
  } else {
    // Quarter columns
    let d = new Date(viewMin);
    d.setDate(1);
    d.setMonth(Math.floor(d.getMonth() / 3) * 3);
    while (d <= viewMax) {
      const q = Math.floor(d.getMonth() / 3) + 1;
      cols.push({
        label: `Q${q}`,
        sub: d.getFullYear().toString(),
        date: new Date(d),
      });
      d.setMonth(d.getMonth() + 3);
    }
  }
  return cols;
}

// ============================================
// Phase detail popover
// ============================================
function PhasePopover({ phase, color, teamMembers, onClose, onUpdatePhase, style: posStyle }) {
  const statusColors = { "Completed": BRAND.green, "In Progress": BRAND.blue, "Not Started": BRAND.textTertiary };
  const stColor = statusColors[phase.Status] || BRAND.textTertiary;
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  return (
    <div style={{
      position: "absolute", zIndex: 100,
      background: BRAND.white, borderRadius: 12, padding: 0,
      boxShadow: `0 8px 30px rgba(0,0,0,0.15)`, border: `1px solid ${BRAND.border}`,
      width: 320, animation: "fs-scaleIn 0.15s ease both",
      ...posStyle,
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px", borderBottom: `1px solid ${BRAND.border}`,
        borderTop: `3px solid ${color}`, borderRadius: "12px 12px 0 0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{phase.PhaseName}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
              <span style={{
                fontSize: 10, fontWeight: 600, color: stColor,
                background: stColor + "18", padding: "2px 8px", borderRadius: 4, fontFamily: FONT,
              }}>{phase.Status}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: color, fontFamily: FONT }}>{phase.Duration}d</span>
            </div>
          </div>
          <div onClick={onClose} style={{ cursor: "pointer", padding: 2 }}><Icons.X size={16} color={BRAND.textTertiary} /></div>
        </div>
      </div>

      {/* Content */}
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

        {/* Assigned To */}
        <div style={{ marginBottom: 12, position: "relative" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, marginBottom: 4 }}>Assigned To</div>
          <div onClick={(e) => { e.stopPropagation(); setShowAssignMenu(!showAssignMenu); }} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
            background: BRAND.surface, borderRadius: 8, cursor: "pointer",
            border: `1px solid ${BRAND.border}`,
          }}>
            {phase.AssignedTo ? (
              <>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700, color: BRAND.white, flexShrink: 0,
                }}>{phase.AssignedTo.split(" ").map(n => n[0]).join("")}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, flex: 1 }}>{phase.AssignedTo}</span>
                <div onClick={(e) => { e.stopPropagation(); onUpdatePhase(phase.id, { AssignedTo: null }); }} style={{ cursor: "pointer" }}>
                  <Icons.X size={12} color={BRAND.textTertiary} />
                </div>
              </>
            ) : (
              <>
                <Icons.Plus size={14} color={BRAND.textTertiary} />
                <span style={{ fontSize: 11, fontWeight: 500, color: BRAND.textTertiary, fontFamily: FONT }}>Assign someone</span>
              </>
            )}
          </div>
          {showAssignMenu && teamMembers && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 200,
              background: BRAND.white, borderRadius: 10, border: `1px solid ${BRAND.border}`,
              boxShadow: `0 4px 16px ${BRAND.shadowMd}`, maxHeight: 180, overflowY: "auto",
            }}>
              {teamMembers.map(m => (
                <div key={m.id} onClick={(e) => { e.stopPropagation(); onUpdatePhase(phase.id, { AssignedTo: m.Name }); setShowAssignMenu(false); }}
                  className="fs-nav-item" style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
                    background: phase.AssignedTo === m.Name ? BRAND.blueSoft : "transparent",
                  }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: BRAND.white,
                  }}>{m.Name.split(" ").map(n => n[0]).join("")}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{m.Name}</div>
                    <div style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>{m.Role}</div>
                  </div>
                  {phase.AssignedTo === m.Name && <Icons.Check size={14} color={BRAND.blue} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick status change */}
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

        {/* Edit dates inline */}
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

// ============================================
// Enhanced Gantt Chart with time horizons
// ============================================
function GanttChart({ phases, milestones, teamMembers, onUpdatePhase, onAddPhase }) {
  const [horizon, setHorizon] = useState("all");
  const [popover, setPopover] = useState(null); // { phaseId, x, y }
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [showCustom, setShowCustom] = useState(false);
  const containerRef = useRef(null);

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
  const dataMin = new Date(Math.min(...allDates));
  const dataMax = new Date(Math.max(...allDates));

  // Calculate view range based on horizon
  const today = new Date();
  let viewMin, viewMax;

  if (horizon === "all") {
    viewMin = dataMin;
    viewMax = dataMax;
  } else if (horizon === "custom" && customRange.start && customRange.end) {
    viewMin = new Date(customRange.start);
    viewMax = new Date(customRange.end);
  } else {
    const preset = TIME_HORIZONS.find(h => h.key === horizon);
    if (preset && preset.days > 0) {
      // Center around today, with some bias toward past
      const halfDays = preset.days / 2;
      viewMin = new Date(today.getTime() - halfDays * 0.3 * 24 * 60 * 60 * 1000);
      viewMax = new Date(today.getTime() + halfDays * 1.7 * 24 * 60 * 60 * 1000);
      // Clamp to data range with some padding
      if (viewMin > dataMin) viewMin = new Date(Math.min(viewMin.getTime(), dataMin.getTime()));
      if (viewMax < dataMax) viewMax = new Date(Math.max(viewMax.getTime(), dataMax.getTime()));
    } else {
      viewMin = dataMin;
      viewMax = dataMax;
    }
  }

  const totalDays = Math.max(1, (viewMax - viewMin) / (1000 * 60 * 60 * 24));
  const todayOffset = ((today - viewMin) / (1000 * 60 * 60 * 24)) / totalDays * 100;

  const columns = getTimeColumns(viewMin, viewMax, horizon);
  const phaseColors = [BRAND.blue, BRAND.purple, BRAND.green, BRAND.amber, BRAND.red, BRAND.blue, BRAND.green, BRAND.purple];
  const statusColors = { "Completed": BRAND.green, "In Progress": BRAND.blue, "Not Started": BRAND.textTertiary };

  const LABEL_W = 160;

  const handlePillClick = (e, phase) => {
    e.stopPropagation();
    if (popover?.phaseId === phase.id) {
      setPopover(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      const x = rect.left - (containerRect?.left || 0);
      const y = rect.bottom - (containerRect?.top || 0) + 4;
      setPopover({ phaseId: phase.id, x: Math.min(x, (containerRect?.width || 600) - 340), y });
    }
  };

  // Close popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popover && !e.target.closest("[data-popover]")) setPopover(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popover]);

  return (
    <div ref={containerRef} style={{ position: "relative" }} onClick={() => setPopover(null)}>
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
              transition: "all 0.15s ease",
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

        {/* Custom date range picker */}
        {showCustom && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", animation: "fs-fadeUp 0.15s ease both" }} onClick={e => e.stopPropagation()}>
            <input type="date" value={customRange.start} onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))} style={{
              padding: "4px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
              fontSize: 11, fontFamily: FONT, background: BRAND.white, outline: "none",
            }} />
            <span style={{ fontSize: 11, color: BRAND.textTertiary }}>→</span>
            <input type="date" value={customRange.end} onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))} style={{
              padding: "4px 8px", borderRadius: 6, border: `1px solid ${BRAND.border}`,
              fontSize: 11, fontFamily: FONT, background: BRAND.white, outline: "none",
            }} />
          </div>
        )}

        {/* Legend */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          {[{ label: "Completed", color: BRAND.green }, { label: "In Progress", color: BRAND.blue }, { label: "Not Started", color: BRAND.textTertiary }].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
          {milestones?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, transform: "rotate(45deg)", background: BRAND.amber }} />
              <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>Milestone</span>
            </div>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "flex", marginLeft: LABEL_W, marginBottom: 6 }}>
        {columns.map((col, i) => (
          <div key={i} style={{
            flex: 1, fontSize: 10, fontWeight: 600, color: BRAND.textTertiary,
            fontFamily: FONT, textAlign: "center", minWidth: 0,
          }}>
            <div>{col.label}</div>
            <div style={{ fontSize: 9, fontWeight: 500, marginTop: 1, color: BRAND.textTertiary + "99" }}>{col.sub}</div>
          </div>
        ))}
      </div>

      {/* Grid background + today marker + milestones + rows */}
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
            top: -4, bottom: 0, width: 2, background: BRAND.red, opacity: 0.5, zIndex: 3,
          }}>
            <div style={{
              position: "absolute", top: -4, left: -14,
              fontSize: 9, fontWeight: 700, color: BRAND.red,
              background: BRAND.redSoft, padding: "1px 5px", borderRadius: 3,
              fontFamily: FONT, whiteSpace: "nowrap",
            }}>Today</div>
          </div>
        )}

        {/* Milestone markers */}
        {milestones?.filter(ms => {
          const msDate = new Date(ms.Date);
          return msDate >= viewMin && msDate <= viewMax;
        }).map(ms => {
          const msOffset = ((new Date(ms.Date) - viewMin) / (1000 * 60 * 60 * 24)) / totalDays * 100;
          const isFlag = ms.Type === "flag";
          return (
            <div key={ms.id} title={`${ms.Title}\n${formatDate(ms.Date)}\n${ms.Notes || ""}`} style={{
              position: "absolute",
              left: `calc(${LABEL_W}px + ${msOffset}% * (100% - ${LABEL_W}px) / 100)`,
              top: -2, zIndex: 4, transform: "translateX(-50%)",
            }}>
              <div style={{
                width: 10, height: 10, transform: "rotate(45deg)",
                background: isFlag ? BRAND.amber : BRAND.green,
                border: `1.5px solid ${BRAND.white}`,
                boxShadow: `0 1px 4px ${isFlag ? BRAND.amber : BRAND.green}44`,
                cursor: "pointer",
              }} />
            </div>
          );
        })}

        {/* Phase rows */}
        {sorted.map((phase, i) => {
          const phaseStart = new Date(phase.StartDate);
          const phaseEnd = new Date(phase.EndDate);
          // Clamp to view range
          const clampStart = new Date(Math.max(phaseStart, viewMin));
          const clampEnd = new Date(Math.min(phaseEnd, viewMax));
          if (clampStart >= viewMax || clampEnd <= viewMin) return null; // Out of view

          const startOffset = ((clampStart - viewMin) / (1000 * 60 * 60 * 24)) / totalDays * 100;
          const endOffset = ((clampEnd - viewMin) / (1000 * 60 * 60 * 24)) / totalDays * 100;
          const widthPct = Math.max(1.5, endOffset - startOffset);
          const color = phaseColors[i % phaseColors.length];
          const isComplete = phase.Status === "Completed";
          const isInProgress = phase.Status === "In Progress";
          const stColor = statusColors[phase.Status] || BRAND.textTertiary;

          return (
            <div key={phase.id} style={{
              display: "flex", alignItems: "center", height: 44, marginBottom: 2,
              animation: `fs-slideIn 0.3s ease ${i * 0.03}s both`,
              position: "relative",
            }}>
              {/* Label area */}
              <div style={{ width: LABEL_W, display: "flex", alignItems: "center", gap: 6, paddingRight: 12, flexShrink: 0 }}>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{phase.PhaseName}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 1 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: 1, background: stColor,
                    }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: stColor, fontFamily: FONT }}>{phase.Status}</span>
                  </div>
                </div>
                {/* Status toggle */}
                <div onClick={(e) => {
                  e.stopPropagation();
                  const nextStatus = phase.Status === "Not Started" ? "In Progress" : phase.Status === "In Progress" ? "Completed" : "Not Started";
                  onUpdatePhase(phase.id, { Status: nextStatus });
                }} style={{
                  width: 18, height: 18, borderRadius: 4, cursor: "pointer",
                  background: isComplete ? BRAND.green : isInProgress ? BRAND.blue : BRAND.surface,
                  border: `1.5px solid ${isComplete ? BRAND.green : isInProgress ? BRAND.blue : BRAND.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {isComplete && <Icons.Check size={10} color={BRAND.white} />}
                  {isInProgress && <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.white }} />}
                </div>
              </div>

              {/* Bar area */}
              <div style={{ flex: 1, position: "relative", height: "100%" }}>
                <div data-popover onClick={(e) => handlePillClick(e, phase)} style={{
                  position: "absolute",
                  left: `${startOffset}%`,
                  width: `${widthPct}%`,
                  top: 8, height: 28, borderRadius: 6,
                  background: color + "18",
                  border: `1.5px solid ${color}55`,
                  overflow: "hidden",
                  display: "flex", alignItems: "center", paddingLeft: 8, gap: 6,
                  cursor: "pointer",
                  transition: "box-shadow 0.15s ease",
                  boxShadow: popover?.phaseId === phase.id ? `0 2px 8px ${color}33` : "none",
                }}>
                  {/* Fill */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: isComplete ? "100%" : isInProgress ? "50%" : "0%",
                    background: color + "33", borderRadius: "6px 0 0 6px",
                    transition: "width 0.5s ease",
                  }} />
                  {/* Duration */}
                  <span style={{ position: "relative", zIndex: 1, fontSize: 10, fontWeight: 700, color: color, fontFamily: FONT }}>
                    {phase.Duration}d
                  </span>
                  {/* Date range on wider bars */}
                  {widthPct > 8 && (
                    <span style={{
                      position: "relative", zIndex: 1, fontSize: 9, fontWeight: 500, color: color + "AA", fontFamily: FONT,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {new Date(phase.StartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(phase.EndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Popover */}
        {popover && (() => {
          const phase = sorted.find(p => p.id === popover.phaseId);
          if (!phase) return null;
          const i = sorted.indexOf(phase);
          return (
            <PhasePopover
              phase={phase}
              color={phaseColors[i % phaseColors.length]}
              teamMembers={teamMembers}
              onClose={() => setPopover(null)}
              onUpdatePhase={onUpdatePhase}
              style={{ left: Math.max(0, popover.x), top: popover.y }}
            />
          );
        })()}
      </div>

      {/* Add phase button */}
      <button onClick={(e) => { e.stopPropagation(); onAddPhase(); }} style={{
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
  const typeColors = { "In-House": BRAND.blue, "Sub-Contractor": BRAND.purple, "Client Rep": BRAND.green };

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
                <span style={{
                  fontSize: 9, fontWeight: 600, color: color,
                  background: color + "14", padding: "1px 6px", borderRadius: 4, fontFamily: FONT,
                  display: "inline-block", marginTop: 6,
                }}>{m.Type}</span>
                {m.Phone && (
                  <div style={{ marginTop: 6 }}>
                    <a href={`tel:${m.Phone}`} style={{ fontSize: 10, color: BRAND.blue, fontWeight: 600, fontFamily: FONT, textDecoration: "none" }}>
                      {m.Phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
                  <span key={m.id} style={{ fontSize: 11, fontWeight: 600, background: BRAND.blueSoft, color: BRAND.blue, padding: "3px 8px", borderRadius: 6, fontFamily: FONT }}>{m.Name}</span>
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
        <div style={{ position: "absolute", left: 8, top: 6, bottom: 6, width: 2, background: BRAND.border }} />
        {sorted.map(ms => {
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

// Mini map
function JobMap({ job }) {
  if (!job.Lat || !job.Lng) return null;
  const statusColors = { "On Track": BRAND.green, "Delayed": BRAND.red, "At Risk": BRAND.amber };
  const color = statusColors[job.Status] || BRAND.blue;
  return (
    <div style={{ background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`, overflow: "hidden", flex: 1 }}>
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
          <div style={{ position: "absolute", inset: -12, borderRadius: "50%", background: color + "22", animation: "fs-pulse 2s infinite" }} />
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: color, border: `3px solid ${BRAND.white}`,
            boxShadow: `0 2px 8px ${color}44`, display: "flex", alignItems: "center", justifyContent: "center",
          }}><Icons.Hardhat size={16} color={BRAND.white} /></div>
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
  const [form, setForm] = useState({ PhaseName: "", StartDate: "", EndDate: "" });
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
  const [activeTab, setActiveTab] = useState("schedule");

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
          <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>
            <span style={{ color: BRAND.textTertiary }}>{job.JobId} · </span>
            <span onClick={() => navigate(`/companies?highlight=${encodeURIComponent(job.Company)}`)} style={{ color: BRAND.blue, cursor: "pointer" }}>{job.Company}</span>
          </div>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
          background: BRAND.white, fontSize: 12, fontWeight: 600, fontFamily: FONT,
          color: BRAND.textSecondary, cursor: "pointer",
        }} className="fs-view-btn">
          <Icons.Calendar size={14} color={BRAND.textSecondary} /> Send Weekly Schedule
        </button>
      </div>

      {/* Info cards row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`, padding: "20px 24px", flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>Details</div>
          <InfoRow label="Site" value={job.Site} icon={Icons.MapPin} />
          <InfoRow label="Crew" value={job.Crew} icon={Icons.Users} />
          <InfoRow label="Value" value={formatFullCurrency(job.Value)} icon={Icons.DollarSign} />
          <InfoRow label="Contact" value={job.Contact} icon={Icons.Contacts} onClick={() => navigate(`/contacts?search=${encodeURIComponent(job.Contact)}`)} />
          <InfoRow label="Start" value={formatDate(job.StartDate)} icon={Icons.Calendar} />
          <InfoRow label="End" value={formatDate(job.EndDate)} icon={Icons.Calendar} />
        </div>

        <div style={{ background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`, padding: "20px 24px", flex: 1 }}>
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
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: BRAND.textPrimary }}>{job.Progress}%</span>
                <span style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 600 }}>complete</span>
              </div>
            </div>
          </div>
          <InfoRow label="Current Phase" value={job.Phase} icon={Icons.Hardhat} />
          <InfoRow label="Phases Complete" value={`${phases.filter(p => p.Status === "Completed").length} of ${phases.length}`} icon={Icons.Check} />
        </div>

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

      {activeTab === "schedule" && (
        <div style={{ background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Schedule</div>
              <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500, marginTop: 2 }}>
                {phases.length} phases · {formatDate(job.StartDate)} → {formatDate(job.EndDate)} · Click any bar for details
              </div>
            </div>
          </div>
          <GanttChart
            phases={phases}
            milestones={milestones}
            teamMembers={teamMembers}
            onUpdatePhase={handleUpdatePhase}
            onAddPhase={() => setShowAddPhase(true)}
          />
        </div>
      )}

      {activeTab === "team" && <TeamSection members={teamMembers} />}
      {activeTab === "activity" && <MilestonesSection milestones={milestones} />}

      {showAddPhase && (
        <AddPhaseModal onClose={() => setShowAddPhase(false)} onSave={handleAddPhase} nextOrder={phases.length + 1} />
      )}
    </div>
  );
}
