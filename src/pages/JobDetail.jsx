import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BRAND, FONT, formatFullCurrency, formatDate } from "../lib/design";
import Icons from "../components/Icons";
import { useRecord, useSchedulePhases } from "../lib/hooks";
import { TABLES } from "../lib/airtable";

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

function GanttChart({ phases, jobStartDate }) {
  if (!phases.length) return (
    <div style={{ padding: 40, textAlign: "center", color: BRAND.textTertiary, fontSize: 14, fontFamily: FONT }}>
      No schedule phases defined
    </div>
  );

  const sorted = [...phases].sort((a, b) => a.Order - b.Order);
  const allDates = sorted.flatMap(p => [new Date(p.StartDate), new Date(p.EndDate)]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
  const today = new Date();
  const todayOffset = ((today - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;

  // Generate week labels
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

  const statusColors = {
    "Completed": BRAND.green,
    "In Progress": BRAND.blue,
    "Not Started": BRAND.textTertiary,
  };

  return (
    <div>
      {/* Week headers */}
      <div style={{ display: "flex", marginLeft: 140, marginBottom: 8 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{
            flex: 1, fontSize: 10, fontWeight: 600, color: BRAND.textTertiary,
            fontFamily: FONT, textAlign: "center",
          }}>
            {w.label}
            <div style={{ fontSize: 9, fontWeight: 500, marginTop: 1 }}>
              {w.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        {/* Today marker */}
        {todayOffset >= 0 && todayOffset <= 100 && (
          <div style={{
            position: "absolute",
            left: `calc(140px + ${todayOffset}% * (100% - 140px) / 100)`,
            top: -4, bottom: 0, width: 2,
            background: BRAND.red, opacity: 0.4, zIndex: 2,
          }}>
            <div style={{
              position: "absolute", top: -4, left: -10,
              fontSize: 9, fontWeight: 700, color: BRAND.red,
              background: BRAND.redSoft, padding: "1px 4px", borderRadius: 3,
              fontFamily: FONT, whiteSpace: "nowrap",
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
              display: "flex", alignItems: "center", height: 40, marginBottom: 4,
              animation: `fs-slideIn 0.35s ease ${i * 0.04}s both`,
            }}>
              {/* Phase label */}
              <div style={{
                width: 140, display: "flex", alignItems: "center", gap: 8,
                paddingRight: 12, flexShrink: 0,
              }}>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>
                    {phase.PhaseName}
                  </div>
                  <div style={{ fontSize: 10, color: statusColors[phase.Status] || BRAND.textTertiary, fontWeight: 600, fontFamily: FONT }}>
                    {phase.Status}
                  </div>
                </div>
              </div>

              {/* Bar */}
              <div style={{ flex: 1, position: "relative", height: "100%" }}>
                <div style={{
                  position: "absolute",
                  left: `${startOffset}%`,
                  width: `${widthPct}%`,
                  top: 8, height: 24, borderRadius: 6,
                  background: color + "18",
                  border: `1.5px solid ${color}44`,
                  overflow: "hidden",
                  display: "flex", alignItems: "center", paddingLeft: 8,
                }}>
                  {/* Fill */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: isComplete ? "100%" : isInProgress ? "50%" : "0%",
                    background: color + "33",
                    borderRadius: "6px 0 0 6px",
                    transition: "width 0.5s ease",
                  }} />
                  {/* Duration label */}
                  <span style={{
                    position: "relative", zIndex: 1,
                    fontSize: 10, fontWeight: 600, color: color,
                    fontFamily: FONT,
                  }}>
                    {phase.Duration}d
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { record: job, loading } = useRecord(TABLES.JOBS, jobId);
  const { records: phases } = useSchedulePhases(jobId);

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

  const statusColor = job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : BRAND.amber;

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <span onClick={() => navigate("/jobs")} style={{
          fontSize: 13, color: BRAND.blue, fontWeight: 600, cursor: "pointer",
        }}>Jobs</span>
        <Icons.ChevronRight size={14} color={BRAND.textTertiary} />
        <span style={{ fontSize: 13, color: BRAND.textSecondary, fontWeight: 600 }}>{job.JobId}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>
              {job.Name}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, fontFamily: FONT,
              color: statusColor,
              background: statusColor + "18",
              padding: "3px 10px", borderRadius: 6,
            }}>{job.Status}</span>
          </div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
            {job.JobId} · {job.Company}
          </div>
        </div>
      </div>

      {/* Info cards row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {/* Details card */}
        <div style={{
          background: BRAND.white, borderRadius: 14,
          border: `1px solid ${BRAND.border}`, padding: "20px 24px",
          flex: 1,
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
          background: BRAND.white, borderRadius: 14,
          border: `1px solid ${BRAND.border}`, padding: "20px 24px",
          flex: 1,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 16 }}>Progress</div>

          {/* Big progress ring */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke={BRAND.surface} strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={statusColor} strokeWidth="10"
                  strokeDasharray={`${(job.Progress / 100) * 314} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
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
      </div>

      {/* Schedule / Gantt */}
      <div style={{
        background: BRAND.white, borderRadius: 14,
        border: `1px solid ${BRAND.border}`, padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Schedule</div>
            <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500, marginTop: 2 }}>
              {phases.length} phases · {formatDate(job.StartDate)} → {formatDate(job.EndDate)}
            </div>
          </div>
        </div>
        <GanttChart phases={phases} jobStartDate={job.StartDate} />
      </div>
    </div>
  );
}
