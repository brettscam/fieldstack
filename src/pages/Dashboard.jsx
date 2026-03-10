import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND, FONT, getStageStyle, formatCurrency, formatFullCurrency } from "../lib/design";
import Icons from "../components/Icons";
import { useJobs, useOpportunities, useSchedulePhases, useSalesTargets } from "../lib/hooks";

// Side detail panel — slides in from right
function DetailPanel({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      display: "flex", justifyContent: "flex-end",
    }}>
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)",
      }} onClick={onClose} />
      <div style={{
        position: "relative", width: 480, maxWidth: "90vw", background: BRAND.white,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column",
        animation: "fs-slideInRight 0.25s ease both", fontFamily: FONT,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: `1px solid ${BRAND.border}`,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>{title}</span>
          <div onClick={onClose} style={{ cursor: "pointer", padding: 4 }}>
            <Icons.X size={20} color={BRAND.textTertiary} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, trend, sub, index, icon: Icon, color, onClick, count }) {
  return (
    <div className="fs-hover-lift" onClick={onClick} style={{
      background: BRAND.white,
      borderRadius: 14,
      padding: "20px 22px",
      border: `1px solid ${BRAND.border}`,
      flex: 1,
      minWidth: 0,
      animation: `fs-fadeUp 0.4s ease ${index * 0.08}s both`,
      cursor: onClick ? "pointer" : "default",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Colored accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: color || BRAND.blue,
        borderRadius: "14px 14px 0 0",
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </div>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: (color || BRAND.blue) + "14",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={16} color={color || BRAND.blue} />
          </div>
        )}
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
      {onClick && (
        <div style={{ fontSize: 11, color: BRAND.blue, fontWeight: 600, marginTop: 6, fontFamily: FONT }}>
          Click to drill in →
        </div>
      )}
    </div>
  );
}

// Close date heatmap — months across top, stages down the side
function CloseHeatmap({ opportunities }) {
  const months = ["Mar", "Apr", "May", "Jun", "Jul"];
  const stages = ["Lead", "Qualified", "Proposal Sent", "Negotiation"];

  const data = useMemo(() => {
    const grid = {};
    stages.forEach(s => {
      grid[s] = {};
      months.forEach(m => { grid[s][m] = { count: 0, value: 0 }; });
    });
    opportunities.forEach(opp => {
      if (opp.Stage === "Won" || opp.Stage === "Lost") return;
      if (!opp.ExpectedClose) return;
      const d = new Date(opp.ExpectedClose);
      const m = d.toLocaleDateString("en-US", { month: "short" });
      if (grid[opp.Stage] && grid[opp.Stage][m]) {
        grid[opp.Stage][m].count++;
        grid[opp.Stage][m].value += opp.Value || 0;
      }
    });
    return grid;
  }, [opportunities]);

  const maxVal = useMemo(() => {
    let max = 0;
    stages.forEach(s => months.forEach(m => {
      if (data[s]?.[m]?.value > max) max = data[s][m].value;
    }));
    return max || 1;
  }, [data]);

  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      padding: "20px 22px", animation: "fs-fadeUp 0.5s ease 0.35s both",
      flex: 1, minWidth: 300,
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
        Close Date Heatmap
      </div>
      <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 16 }}>
        Expected close by month & stage
      </div>

      {/* Header row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8, paddingLeft: 100 }}>
        {months.map(m => (
          <div key={m} style={{
            flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700,
            color: BRAND.textTertiary, fontFamily: FONT,
          }}>{m}</div>
        ))}
      </div>

      {stages.map(stage => {
        const stageStyle = getStageStyle(stage);
        return (
          <div key={stage} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
            <div style={{
              width: 100, fontSize: 11, fontWeight: 600, color: BRAND.textSecondary,
              fontFamily: FONT, textAlign: "right", paddingRight: 8, flexShrink: 0,
            }}>{stage}</div>
            {months.map(m => {
              const cell = data[stage]?.[m] || { count: 0, value: 0 };
              const intensity = cell.value / maxVal;
              return (
                <div key={m} style={{
                  flex: 1, height: 36, borderRadius: 6,
                  background: cell.count > 0
                    ? stageStyle.color + (Math.round(intensity * 200 + 20)).toString(16).padStart(2, "0")
                    : BRAND.surface,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${cell.count > 0 ? stageStyle.color + "33" : BRAND.border}`,
                  transition: "all 0.2s ease",
                }}>
                  {cell.count > 0 && (
                    <>
                      <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>
                        {cell.count}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: BRAND.textSecondary, fontFamily: FONT }}>
                        {formatCurrency(cell.value)}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function PipelineSummary({ opportunities, onOppClick }) {
  const navigate = useNavigate();
  const stages = useMemo(() => {
    const grouped = {};
    opportunities.forEach(opp => {
      if (!grouped[opp.Stage]) grouped[opp.Stage] = { items: [], total: 0 };
      grouped[opp.Stage].items.push(opp);
      grouped[opp.Stage].total += opp.Value || 0;
    });
    return ["Lead", "Qualified", "Proposal Sent", "Negotiation", "Won"].map(stage => ({
      stage,
      ...getStageStyle(stage),
      count: grouped[stage]?.items.length || 0,
      value: formatCurrency(grouped[stage]?.total || 0),
      items: (grouped[stage]?.items || []).slice(0, 3),
    }));
  }, [opportunities]);

  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      padding: "20px 22px", animation: "fs-fadeUp 0.5s ease 0.3s both", flex: 2,
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

      {/* Pipeline value bar */}
      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 16, background: BRAND.surface }}>
        {stages.map(s => {
          const total = opportunities.reduce((sum, o) => sum + (o.Value || 0), 0) || 1;
          const grouped = opportunities.filter(o => o.Stage === s.stage);
          const stageTotal = grouped.reduce((sum, o) => sum + (o.Value || 0), 0);
          return (
            <div key={s.stage} style={{
              width: `${(stageTotal / total) * 100}%`,
              background: s.color,
              transition: "width 0.5s ease",
            }} />
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
        {stages.map((stage, si) => (
          <div key={stage.stage} style={{
            flex: 1, minWidth: 150,
            animation: `fs-scaleIn 0.35s ease ${0.35 + si * 0.07}s both`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 8, padding: "0 2px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{stage.stage}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: stage.color,
                  background: stage.bg, borderRadius: 6,
                  padding: "1px 6px", fontFamily: FONT,
                }}>{stage.count}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>{stage.value}</span>
            </div>
            <div style={{
              display: "flex", flexDirection: "column", gap: 6,
              background: BRAND.surface, borderRadius: 10,
              padding: 6, minHeight: 90,
              borderLeft: `3px solid ${stage.color}`,
            }}>
              {stage.items.map((item) => (
                <div key={item.id} className="fs-hover-lift" onClick={() => onOppClick(item)} style={{
                  background: BRAND.white,
                  borderRadius: 8,
                  padding: "10px 12px",
                  border: `1px solid ${BRAND.border}`,
                  cursor: "pointer",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 3 }}>
                    {item.Name}
                  </div>
                  <div style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 6 }}>
                    {item.Company}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>
                      {formatCurrency(item.Value)}
                    </span>
                    {item.PropensityToClose != null && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, fontFamily: FONT,
                        color: item.PropensityToClose >= 70 ? BRAND.green : item.PropensityToClose >= 40 ? BRAND.amber : BRAND.textTertiary,
                        background: item.PropensityToClose >= 70 ? BRAND.greenSoft : item.PropensityToClose >= 40 ? BRAND.amberSoft : BRAND.surface,
                        padding: "1px 5px", borderRadius: 4,
                      }}>{item.PropensityToClose}%</span>
                    )}
                  </div>
                </div>
              ))}
              {stage.count === 0 && (
                <div style={{ padding: 12, textAlign: "center", fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT }}>
                  None
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayJobs({ jobs, onJobClick }) {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const activeJobs = jobs.filter(j => j.Status !== "Completed");

  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      padding: "20px 22px", animation: "fs-fadeUp 0.5s ease 0.4s both",
      flex: 1, minWidth: 300,
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
        <div key={job.id} className="fs-hover-lift" onClick={() => onJobClick ? onJobClick(job) : navigate(`/jobs/${job.id}`)} style={{
          padding: "14px 16px",
          borderRadius: 12,
          border: `1px solid ${BRAND.border}`,
          marginBottom: i < activeJobs.length - 1 ? 10 : 0,
          cursor: "pointer",
          animation: `fs-slideIn 0.4s ease ${0.5 + i * 0.08}s both`,
          borderLeft: `3px solid ${job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : BRAND.amber}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.blue, fontFamily: FONT }}>{job.JobId}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, fontFamily: FONT,
              color: job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : BRAND.amber,
              background: job.Status === "On Track" ? BRAND.greenSoft : job.Status === "Delayed" ? BRAND.redSoft : BRAND.amberSoft,
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

// Sales Funnel — shows conversion from Lead → Won
function SalesFunnel({ opportunities, onStageClick }) {
  const stages = ["Lead", "Qualified", "Proposal Sent", "Negotiation", "Won"];
  const funnelData = useMemo(() => {
    return stages.map(stage => {
      const items = opportunities.filter(o => o.Stage === stage);
      const value = items.reduce((s, o) => s + (o.Value || 0), 0);
      return { stage, count: items.length, value, items };
    });
  }, [opportunities]);

  const maxCount = Math.max(1, ...funnelData.map(d => d.count));
  const maxWidth = 100;

  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      padding: "20px 22px", flex: 1, minWidth: 300,
      animation: "fs-fadeUp 0.5s ease 0.3s both",
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
        Sales Funnel
      </div>
      <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 20 }}>
        Pipeline conversion by stage
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {funnelData.map((d, i) => {
          const stageStyle = getStageStyle(d.stage);
          const widthPct = Math.max(20, (d.count / maxCount) * maxWidth);
          const conversionRate = i > 0 && funnelData[i - 1].count > 0
            ? Math.round((d.count / funnelData[i - 1].count) * 100) : null;
          return (
            <div key={d.stage} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {i > 0 && conversionRate != null && (
                <div style={{
                  fontSize: 10, fontWeight: 700, color: conversionRate >= 50 ? BRAND.green : BRAND.amber,
                  fontFamily: FONT, marginBottom: 2,
                }}>
                  {conversionRate}% conversion
                </div>
              )}
              <div
                onClick={() => onStageClick && onStageClick(d.stage, d.items)}
                style={{
                  width: `${widthPct}%`,
                  padding: "10px 16px",
                  background: stageStyle.color + "14",
                  borderRadius: 8,
                  border: `1.5px solid ${stageStyle.color}33`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="fs-hover-lift"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: stageStyle.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{d.stage}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{d.count}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>{formatCurrency(d.value)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion summary */}
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 16,
        padding: "10px 14px", background: BRAND.surface, borderRadius: 10,
        border: `1px solid ${BRAND.border}`,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 }}>Overall Conversion</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.green, fontFamily: FONT }}>
            {funnelData[0].count > 0 ? Math.round((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100) : 0}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 }}>Won Value</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.green, fontFamily: FONT }}>
            {formatCurrency(funnelData[funnelData.length - 1].value)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 }}>Avg Deal Size</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>
            {opportunities.length > 0 ? formatCurrency(opportunities.reduce((s, o) => s + (o.Value || 0), 0) / opportunities.length) : "$0"}
          </div>
        </div>
      </div>
    </div>
  );
}

// Planned vs Actual — bar chart comparing monthly targets to actual revenue
function PlannedVsActual({ salesTargets, opportunities }) {
  const chartData = useMemo(() => {
    return salesTargets.map(t => {
      const monthDate = new Date(t.Month + "-01");
      const monthLabel = monthDate.toLocaleDateString("en-US", { month: "short" });
      const isFuture = monthDate > new Date();
      // For current month, sum won opps that closed in this month
      const monthWon = opportunities
        .filter(o => o.Stage === "Won" && o.ExpectedClose && o.ExpectedClose.startsWith(t.Month))
        .reduce((s, o) => s + (o.Value || 0), 0);
      const actual = t.Actual || monthWon;
      const pct = t.Target > 0 ? Math.round((actual / t.Target) * 100) : 0;
      return { ...t, monthLabel, actual, pct, isFuture };
    });
  }, [salesTargets, opportunities]);

  const maxVal = Math.max(1, ...chartData.flatMap(d => [d.Target, d.actual]));
  const barMaxH = 140;

  // YTD totals
  const ytdTarget = chartData.reduce((s, d) => s + (d.Target || 0), 0);
  const ytdActual = chartData.filter(d => !d.isFuture).reduce((s, d) => s + (d.actual || 0), 0);
  const ytdPct = ytdTarget > 0 ? Math.round((ytdActual / ytdTarget) * 100) : 0;

  return (
    <div className="fs-hover-lift" style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      padding: "20px 22px", flex: 1, minWidth: 300,
      animation: "fs-fadeUp 0.5s ease 0.35s both",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>
            Planned vs Actual
          </div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>
            Monthly revenue against targets
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, fontFamily: FONT,
          color: ytdPct >= 90 ? BRAND.green : ytdPct >= 70 ? BRAND.amber : BRAND.red,
          background: (ytdPct >= 90 ? BRAND.green : ytdPct >= 70 ? BRAND.amber : BRAND.red) + "18",
          padding: "3px 10px", borderRadius: 6,
        }}>YTD {ytdPct}%</div>
      </div>

      {/* Bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 16, height: barMaxH, paddingBottom: 24, position: "relative" }}>
        {/* Baseline */}
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, borderTop: `1px dashed ${BRAND.border}` }} />

        {chartData.map((d, i) => {
          const targetH = (d.Target / maxVal) * (barMaxH - 24);
          const actualH = (d.actual / maxVal) * (barMaxH - 24);
          return (
            <div key={d.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: barMaxH - 24 }}>
                {/* Target bar */}
                <div style={{
                  width: 16, height: targetH, borderRadius: "4px 4px 0 0",
                  background: BRAND.border,
                  animation: `fs-barGrow 0.6s ease ${0.1 + i * 0.06}s both`,
                }} title={`Target: ${formatFullCurrency(d.Target)}`} />
                {/* Actual bar */}
                <div style={{
                  width: 16, height: actualH, borderRadius: "4px 4px 0 0",
                  background: d.pct >= 100 ? BRAND.green : d.pct >= 80 ? BRAND.blue : d.pct >= 50 ? BRAND.amber : d.isFuture ? BRAND.border + "66" : BRAND.red,
                  animation: `fs-barGrow 0.6s ease ${0.15 + i * 0.06}s both`,
                }} title={`Actual: ${formatFullCurrency(d.actual)}`} />
              </div>
              <div style={{ marginTop: 6, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{d.monthLabel}</div>
                {!d.isFuture && d.actual > 0 && (
                  <div style={{
                    fontSize: 9, fontWeight: 700, fontFamily: FONT, marginTop: 1,
                    color: d.pct >= 100 ? BRAND.green : d.pct >= 80 ? BRAND.blue : BRAND.red,
                  }}>{d.pct}%</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend + YTD summary */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 12, padding: "10px 14px", background: BRAND.surface,
        borderRadius: 10, border: `1px solid ${BRAND.border}`,
      }}>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: BRAND.border }} />
            <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>Target</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: BRAND.blue }} />
            <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>Actual</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div>
            <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>YTD Target: </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{formatCurrency(ytdTarget)}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>YTD Actual: </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: ytdPct >= 90 ? BRAND.green : BRAND.red, fontFamily: FONT }}>{formatCurrency(ytdActual)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { records: jobs } = useJobs();
  const { records: opportunities } = useOpportunities();
  const { records: schedulePhases } = useSchedulePhases();
  const { records: salesTargets } = useSalesTargets();
  const [panel, setPanel] = useState(null); // { type, data }

  const metrics = useMemo(() => {
    const activeJobs = jobs.filter(j => j.Status !== "Completed");
    const totalPipeline = opportunities.reduce((s, o) => s + (o.Value || 0), 0);
    const wonOpps = opportunities.filter(o => o.Stage === "Won");
    const closedOpps = opportunities.filter(o => o.Stage === "Won" || o.Stage === "Lost");
    const winRate = closedOpps.length > 0 ? Math.round((wonOpps.length / closedOpps.length) * 100) : 0;
    const openOpps = opportunities.filter(o => o.Stage !== "Won" && o.Stage !== "Lost");
    const weightedPipeline = openOpps.reduce((s, o) => s + (o.Value || 0) * ((o.PropensityToClose || 30) / 100), 0);
    return {
      activeJobs: { label: "Active Jobs", value: String(activeJobs.length), icon: Icons.Jobs, color: BRAND.blue, data: activeJobs },
      pipeline: { label: "Pipeline Value", value: formatCurrency(totalPipeline), sub: `${formatCurrency(weightedPipeline)} weighted`, icon: Icons.DollarSign, color: BRAND.green, data: opportunities },
      winRate: { label: "Win Rate", value: `${winRate}%`, sub: `${wonOpps.length} of ${closedOpps.length}`, icon: Icons.ArrowUp, color: BRAND.amber },
      openOpps: { label: "Open Opps", value: String(openOpps.length), sub: "active", icon: Icons.Pipeline, color: BRAND.purple, data: openOpps },
    };
  }, [jobs, opportunities]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const activeCrews = [...new Set(jobs.filter(j => j.Status !== "Completed").map(j => j.Crew))].length;

  const openPanel = (type, data) => setPanel({ type, data });

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
        {Object.entries(metrics).map(([key, m], i) => (
          <MetricCard
            key={key}
            {...m}
            index={i}
            onClick={m.data ? () => openPanel(key, m.data) : undefined}
          />
        ))}
      </div>

      {/* Pipeline + Heatmap row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <PipelineSummary opportunities={opportunities} onOppClick={(opp) => openPanel("opp", opp)} />
      </div>

      {/* Funnel + Planned vs Actual row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <SalesFunnel opportunities={opportunities} onStageClick={(stage, items) => openPanel("openOpps", items)} />
        <PlannedVsActual salesTargets={salesTargets} opportunities={opportunities} />
      </div>

      {/* Heatmap + Today's Jobs row */}
      <div style={{ display: "flex", gap: 16 }}>
        <CloseHeatmap opportunities={opportunities} />
        <TodayJobs jobs={jobs} onJobClick={(job) => navigate(`/jobs/${job.id}`)} />
      </div>

      {/* Drill-in Side Panel */}
      {panel && panel.type === "activeJobs" && (
        <DetailPanel title="Active Jobs" onClose={() => setPanel(null)}>
          {panel.data.map(job => (
            <div key={job.id} onClick={() => { setPanel(null); navigate(`/jobs/${job.id}`); }} className="fs-hover-lift" style={{
              padding: "14px 16px", borderRadius: 12, border: `1px solid ${BRAND.border}`,
              marginBottom: 10, cursor: "pointer",
              borderLeft: `3px solid ${job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : BRAND.amber}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.blue, fontFamily: FONT }}>{job.JobId}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, fontFamily: FONT,
                  color: job.Status === "On Track" ? BRAND.green : BRAND.red,
                  background: job.Status === "On Track" ? BRAND.greenSoft : BRAND.redSoft,
                  padding: "2px 8px", borderRadius: 6,
                }}>{job.Status}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{job.Name}</div>
              <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, marginTop: 2 }}>{job.Site} · {job.Crew}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <div style={{ flex: 1, height: 5, background: BRAND.surface, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${job.Progress}%`, background: BRAND.blue, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textSecondary, fontFamily: FONT }}>{job.Progress}%</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, fontFamily: FONT, marginTop: 6 }}>
                Value: {formatFullCurrency(job.Value)} · Phase: {job.Phase}
              </div>
            </div>
          ))}
        </DetailPanel>
      )}

      {panel && panel.type === "openOpps" && (
        <DetailPanel title="Open Opportunities" onClose={() => setPanel(null)}>
          {panel.data.map(opp => {
            const stageStyle = getStageStyle(opp.Stage);
            return (
              <div key={opp.id} className="fs-hover-lift" onClick={() => { setPanel(null); navigate(`/opportunities/${opp.id}`); }} style={{
                padding: "14px 16px", borderRadius: 12, border: `1px solid ${BRAND.border}`,
                marginBottom: 10, cursor: "pointer",
                borderLeft: `3px solid ${stageStyle.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>{opp.Name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, fontFamily: FONT,
                    color: stageStyle.color, background: stageStyle.bg,
                    padding: "2px 8px", borderRadius: 6,
                  }}>{opp.Stage}</span>
                </div>
                <div style={{ fontSize: 12, fontFamily: FONT, marginTop: 2 }}>
                  <span onClick={(e) => { e.stopPropagation(); setPanel(null); navigate(`/companies?highlight=${encodeURIComponent(opp.Company)}`); }} style={{ color: BRAND.blue, cursor: "pointer" }}>{opp.Company}</span>
                  <span style={{ color: BRAND.textTertiary }}> · </span>
                  <span onClick={(e) => { e.stopPropagation(); setPanel(null); navigate(`/contacts?search=${encodeURIComponent(opp.Contact)}`); }} style={{ color: BRAND.blue, cursor: "pointer" }}>{opp.Contact}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{formatFullCurrency(opp.Value)}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {opp.PropensityToClose != null && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: FONT,
                        color: opp.PropensityToClose >= 70 ? BRAND.green : opp.PropensityToClose >= 40 ? BRAND.amber : BRAND.textTertiary,
                      }}>{opp.PropensityToClose}% likely</span>
                    )}
                    {opp.ExpectedClose && (
                      <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT }}>
                        Close: {new Date(opp.ExpectedClose).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </DetailPanel>
      )}

      {panel && panel.type === "pipeline" && (
        <DetailPanel title="Pipeline Breakdown" onClose={() => setPanel(null)}>
          {["Lead", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"].map(stage => {
            const stageStyle = getStageStyle(stage);
            const items = panel.data.filter(o => o.Stage === stage);
            const total = items.reduce((s, o) => s + (o.Value || 0), 0);
            if (items.length === 0) return null;
            return (
              <div key={stage} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: stageStyle.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{stage}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>{items.length} · {formatFullCurrency(total)}</span>
                </div>
                {items.map(opp => (
                  <div key={opp.id} onClick={() => { setPanel(null); navigate(`/opportunities/${opp.id}`); }} style={{
                    padding: "8px 12px", marginBottom: 4, borderRadius: 8,
                    background: BRAND.surface, fontSize: 12, fontFamily: FONT,
                    display: "flex", justifyContent: "space-between",
                    cursor: "pointer",
                  }} className="fs-hover-lift">
                    <span style={{ fontWeight: 600, color: BRAND.blue }}>{opp.Name}</span>
                    <span style={{ fontWeight: 700, color: BRAND.textPrimary }}>{formatFullCurrency(opp.Value)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </DetailPanel>
      )}

      {panel && panel.type === "opp" && (
        <DetailPanel title={panel.data.Name} onClose={() => setPanel(null)}>
          {(() => {
            const opp = panel.data;
            const stageStyle = getStageStyle(opp.Stage);
            return (
              <div>
                <div style={{
                  display: "inline-block", fontSize: 11, fontWeight: 600, fontFamily: FONT,
                  color: stageStyle.color, background: stageStyle.bg,
                  padding: "3px 10px", borderRadius: 6, marginBottom: 16,
                }}>{opp.Stage}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>Company</div>
                    <div onClick={() => { setPanel(null); navigate(`/companies?highlight=${encodeURIComponent(opp.Company)}`); }} style={{ fontSize: 14, fontWeight: 600, color: BRAND.blue, fontFamily: FONT, cursor: "pointer" }}>{opp.Company}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>Contact</div>
                    <div onClick={() => { setPanel(null); navigate(`/contacts?search=${encodeURIComponent(opp.Contact)}`); }} style={{ fontSize: 14, fontWeight: 600, color: BRAND.blue, fontFamily: FONT, cursor: "pointer" }}>{opp.Contact}</div>
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>Value</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>{formatFullCurrency(opp.Value)}</div>
                    </div>
                    {opp.PropensityToClose != null && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>Propensity</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: opp.PropensityToClose >= 70 ? BRAND.green : BRAND.amber, fontFamily: FONT }}>{opp.PropensityToClose}%</div>
                      </div>
                    )}
                  </div>
                  {opp.ExpectedClose && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>Expected Close</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT }}>
                        {new Date(opp.ExpectedClose).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  )}
                  {opp.Notes && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>Notes</div>
                      <div style={{ fontSize: 13, color: BRAND.textSecondary, fontFamily: FONT }}>{opp.Notes}</div>
                    </div>
                  )}
                </div>
                <button onClick={() => { setPanel(null); navigate(`/opportunities/${opp.id}`); }} style={{
                  width: "100%", padding: "10px", borderRadius: 10, border: "none",
                  background: BRAND.blue, color: BRAND.white, fontSize: 13,
                  fontWeight: 600, fontFamily: FONT, cursor: "pointer",
                }}>View Full Details</button>
              </div>
            );
          })()}
        </DetailPanel>
      )}
    </div>
  );
}
