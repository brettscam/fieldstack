import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND, FONT, getStageStyle, formatCurrency } from "../lib/design";
import Icons from "../components/Icons";
import { useJobs, useOpportunities, useSchedulePhases } from "../lib/hooks";

function MetricCard({ label, value, change, trend, sub, index }) {
  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white,
      borderRadius: 14,
      padding: "20px 22px",
      border: `1px solid ${BRAND.border}`,
      flex: 1,
      minWidth: 0,
      animation: `fs-fadeUp 0.4s ease ${index * 0.08}s both`,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, letterSpacing: -0.5 }}>
          {value}
        </span>
        {change && (
          <span style={{
            display: "flex", alignItems: "center", gap: 2,
            fontSize: 12, fontWeight: 600,
            color: trend === "up" ? BRAND.green : BRAND.textTertiary,
            fontFamily: FONT,
          }}>
            {trend === "up" && <Icons.ArrowUp size={12} color={BRAND.green} />}
            {change}
          </span>
        )}
        {sub && (
          <span style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>{sub}</span>
        )}
      </div>
    </div>
  );
}

function PipelineSummary({ opportunities }) {
  const navigate = useNavigate();
  const stages = useMemo(() => {
    const grouped = {};
    opportunities.forEach(opp => {
      if (!grouped[opp.Stage]) grouped[opp.Stage] = { items: [], total: 0 };
      grouped[opp.Stage].items.push(opp);
      grouped[opp.Stage].total += opp.Value || 0;
    });
    return ["Lead", "Qualified", "Proposal Sent", "Won"].map(stage => ({
      stage,
      ...getStageStyle(stage),
      count: grouped[stage]?.items.length || 0,
      value: formatCurrency(grouped[stage]?.total || 0),
      items: (grouped[stage]?.items || []).slice(0, 3),
    }));
  }, [opportunities]);

  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white,
      borderRadius: 14,
      border: `1px solid ${BRAND.border}`,
      padding: "20px 22px",
      animation: "fs-fadeUp 0.5s ease 0.3s both",
      flex: 2,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Pipeline</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>
            {opportunities.length} opportunities · {formatCurrency(opportunities.reduce((s, o) => s + (o.Value || 0), 0))} total
          </div>
        </div>
        <button onClick={() => navigate("/pipeline")} style={{
          background: BRAND.surface, border: `1px solid ${BRAND.border}`,
          borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600,
          color: BRAND.textSecondary, fontFamily: FONT, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          View All <Icons.ChevronRight size={14} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {stages.map((stage, si) => (
          <div key={stage.stage} style={{
            flex: 1, minWidth: 180,
            animation: `fs-scaleIn 0.35s ease ${0.35 + si * 0.07}s both`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 10, padding: "0 2px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{stage.stage}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: stage.color,
                  background: stage.bg, borderRadius: 6,
                  padding: "1px 7px", fontFamily: FONT,
                }}>{stage.count}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>{stage.value}</span>
            </div>
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              background: BRAND.surface, borderRadius: 10,
              padding: 8, minHeight: 120,
            }}>
              {stage.items.map((item) => (
                <div key={item.id} className="fs-hover-lift" style={{
                  background: BRAND.white,
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: `1px solid ${BRAND.border}`,
                  cursor: "pointer",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
                    {item.Name}
                  </div>
                  <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 8 }}>
                    {item.Company}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>
                      {formatCurrency(item.Value)}
                    </span>
                  </div>
                </div>
              ))}
              {stage.count === 0 && (
                <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT }}>
                  No opportunities
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayJobs({ jobs }) {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const activeJobs = jobs.filter(j => j.Status !== "Completed");

  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white,
      borderRadius: 14,
      border: `1px solid ${BRAND.border}`,
      padding: "20px 22px",
      animation: "fs-fadeUp 0.5s ease 0.4s both",
      flex: 1,
      minWidth: 300,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>Today's Jobs</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>{today}</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 30, height: 30, borderRadius: 8, cursor: "pointer",
        }} className="fs-view-btn" onClick={() => navigate("/jobs")}>
          <Icons.ChevronRight size={16} />
        </div>
      </div>
      {activeJobs.slice(0, 5).map((job, i) => (
        <div key={job.id} className="fs-hover-lift" onClick={() => navigate(`/jobs/${job.id}`)} style={{
          padding: "14px 16px",
          borderRadius: 12,
          border: `1px solid ${BRAND.border}`,
          marginBottom: i < activeJobs.length - 1 ? 10 : 0,
          cursor: "pointer",
          animation: `fs-slideIn 0.4s ease ${0.5 + i * 0.08}s both`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.blue, fontFamily: FONT }}>{job.JobId}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, fontFamily: FONT,
              color: job.Status === "On Track" ? BRAND.green : BRAND.red,
              background: job.Status === "On Track" ? BRAND.greenSoft : BRAND.redSoft,
              padding: "2px 8px", borderRadius: 6,
            }}>{job.Status}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 3 }}>
            {job.Name}
          </div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 10 }}>
            {job.Site} · {job.Crew}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              flex: 1, height: 6, background: BRAND.surface,
              borderRadius: 3, overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${job.Progress}%`,
                background: job.Status === "Delayed"
                  ? `linear-gradient(90deg, ${BRAND.red}, ${BRAND.amber})`
                  : `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueMuted})`,
                borderRadius: 3,
                animation: `fs-barGrow 0.8s ease ${0.6 + i * 0.1}s both`,
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textSecondary, fontFamily: FONT, minWidth: 30, textAlign: "right" }}>
              {job.Progress}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 6 }}>
            Phase: {job.Phase}
          </div>
        </div>
      ))}
    </div>
  );
}

function GanttPreview({ jobs, schedulePhases }) {
  const navigate = useNavigate();
  // Show the first job's schedule as preview
  const firstJob = jobs[0];
  if (!firstJob) return null;
  const phases = schedulePhases.filter(p => p.JobId === firstJob.id);
  if (phases.length === 0) return null;

  // Calculate date range
  const allDates = phases.flatMap(p => [new Date(p.StartDate), new Date(p.EndDate)]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
  const today = new Date();
  const todayOffset = Math.max(0, Math.min(100, ((today - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100));

  // Generate week labels
  const weeks = [];
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  let d = new Date(minDate);
  let wi = 1;
  while (d <= maxDate) {
    weeks.push(`W${wi}`);
    d = new Date(d.getTime() + weekMs);
    wi++;
  }

  const phaseColors = [BRAND.blue, BRAND.purple, BRAND.green, BRAND.amber, BRAND.red, BRAND.blue, BRAND.green, BRAND.purple];

  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white, borderRadius: 14,
      border: `1px solid ${BRAND.border}`, padding: "20px 22px",
      animation: "fs-fadeUp 0.5s ease 0.5s both", overflow: "hidden",
      cursor: "pointer",
    }} onClick={() => navigate(`/jobs/${firstJob.id}`)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{firstJob.Name} Timeline</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>
            {firstJob.JobId} · {weeks.length} week build
          </div>
        </div>
      </div>
      {/* Week headers */}
      <div style={{ display: "flex", marginLeft: 100, marginBottom: 6 }}>
        {weeks.map(w => (
          <div key={w} style={{ flex: 1, fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, textAlign: "center" }}>{w}</div>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        {/* Today marker */}
        <div style={{
          position: "absolute", left: `calc(100px + ${todayOffset}% * 0.01 * (100% - 100px))`,
          top: 0, bottom: 0, width: 2,
          background: BRAND.red, opacity: 0.3, zIndex: 1,
        }} />
        {phases.sort((a, b) => a.Order - b.Order).map((phase, i) => {
          const startOffset = ((new Date(phase.StartDate) - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
          const widthPct = (phase.Duration / totalDays) * 100;
          const color = phaseColors[i % phaseColors.length];
          const isComplete = phase.Status === "Completed";
          const isInProgress = phase.Status === "In Progress";

          return (
            <div key={phase.id} style={{
              display: "flex", alignItems: "center", height: 32, marginBottom: 4,
              animation: `fs-slideIn 0.35s ease ${0.55 + i * 0.04}s both`,
            }}>
              <div style={{
                width: 100, fontSize: 11, fontWeight: 600, color: BRAND.textSecondary,
                fontFamily: FONT, paddingRight: 12, textAlign: "right", flexShrink: 0,
              }}>{phase.PhaseName}</div>
              <div style={{ flex: 1, position: "relative", height: "100%" }}>
                <div style={{
                  position: "absolute",
                  left: `${startOffset}%`,
                  width: `${widthPct}%`,
                  top: 6, height: 20, borderRadius: 6,
                  background: color + "22",
                  border: `1.5px solid ${color}55`,
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: isComplete ? "100%" : isInProgress ? "50%" : "0%",
                    background: color + "44",
                    borderRadius: "6px 0 0 6px",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { records: jobs, loading: loadingJobs } = useJobs();
  const { records: opportunities, loading: loadingOpps } = useOpportunities();
  const { records: schedulePhases } = useSchedulePhases();

  const metrics = useMemo(() => {
    const activeJobs = jobs.filter(j => j.Status !== "Completed");
    const totalPipeline = opportunities.reduce((s, o) => s + (o.Value || 0), 0);
    const wonOpps = opportunities.filter(o => o.Stage === "Won");
    const closedOpps = opportunities.filter(o => o.Stage === "Won" || o.Stage === "Lost");
    const winRate = closedOpps.length > 0 ? Math.round((wonOpps.length / closedOpps.length) * 100) : 0;
    return [
      { label: "Active Jobs", value: String(activeJobs.length), change: "", trend: "neutral" },
      { label: "Pipeline Value", value: formatCurrency(totalPipeline), change: "", trend: "neutral" },
      { label: "Win Rate", value: `${winRate}%`, change: "", trend: "neutral" },
      { label: "Open Opps", value: String(opportunities.filter(o => o.Stage !== "Won" && o.Stage !== "Lost").length), sub: "active", change: "", trend: "neutral" },
    ];
  }, [jobs, opportunities]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const activeCrews = [...new Set(jobs.filter(j => j.Status !== "Completed").map(j => j.Crew))].length;

  return (
    <div style={{ padding: 28 }}>
      {/* Page title */}
      <div style={{ marginBottom: 24, animation: "fs-fadeUp 0.3s ease both" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, letterSpacing: -0.3 }}>
          {greeting}, Smithers
        </div>
        <div style={{ fontSize: 13, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 4 }}>
          {todayStr} · {activeCrews} active crew{activeCrews !== 1 ? "s" : ""} today
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        {metrics.map((m, i) => <MetricCard key={m.label} {...m} index={i} />)}
      </div>

      {/* Main content */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <PipelineSummary opportunities={opportunities} />
        <TodayJobs jobs={jobs} />
      </div>

      {/* Timeline */}
      <GanttPreview jobs={jobs} schedulePhases={schedulePhases} />
    </div>
  );
}
