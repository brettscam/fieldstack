import { useState, useMemo } from "react";
import { BRAND, FONT, STAGES, getStageStyle, formatCurrency, formatFullCurrency, daysAgo } from "../lib/design";
import Icons from "../components/Icons";
import { useOpportunities, useMutation, useEstimates } from "../lib/hooks";
import { TABLES } from "../lib/supabase";

function OpportunityCard({ opp, onEdit }) {
  const age = daysAgo(opp.CreatedDate);
  const stageStyle = getStageStyle(opp.Stage);
  return (
    <div className="fs-hover-lift" onClick={() => onEdit(opp)} style={{
      background: BRAND.white,
      borderRadius: 10,
      padding: "12px 14px",
      border: `1px solid ${BRAND.border}`,
      cursor: "pointer",
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
        {opp.Name}
      </div>
      <div style={{ fontSize: 11, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 8 }}>
        {opp.Company}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT }}>
          {formatFullCurrency(opp.Value)}
        </span>
        {opp.PropensityToClose != null && (
          <span style={{
            fontSize: 9, fontWeight: 700, fontFamily: FONT,
            color: opp.PropensityToClose >= 70 ? BRAND.green : opp.PropensityToClose >= 40 ? BRAND.amber : BRAND.textTertiary,
            background: opp.PropensityToClose >= 70 ? BRAND.greenSoft : opp.PropensityToClose >= 40 ? BRAND.amberSoft : BRAND.surface,
            padding: "1px 5px", borderRadius: 4,
          }}>{opp.PropensityToClose}%</span>
        )}
      </div>
      {opp.ExpectedClose && (
        <div style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginTop: 4 }}>
          Close: {new Date(opp.ExpectedClose).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      )}
    </div>
  );
}

function NewOppModal({ stage, onClose, onSave }) {
  const [form, setForm] = useState({ Name: "", Company: "", Contact: "", Value: "", Stage: stage, ExpectedClose: "", Notes: "" });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
    fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none", background: BRAND.surface,
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: FONT }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: BRAND.white, borderRadius: 16, padding: 28, width: 420, boxShadow: `0 8px 30px ${BRAND.shadowMd}`, animation: "fs-scaleIn 0.2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>New Opportunity</div>
          <div onClick={onClose} style={{ cursor: "pointer" }}><Icons.X size={20} color={BRAND.textTertiary} /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Name *</label>
            <input style={inputStyle} value={form.Name} onChange={e => set("Name", e.target.value)} placeholder="e.g., Johnson Kitchen Remodel" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Company</label>
              <input style={inputStyle} value={form.Company} onChange={e => set("Company", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Contact</label>
              <input style={inputStyle} value={form.Contact} onChange={e => set("Contact", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Value ($)</label>
              <input style={inputStyle} type="number" value={form.Value} onChange={e => set("Value", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Expected Close</label>
              <input style={inputStyle} type="date" value={form.ExpectedClose} onChange={e => set("ExpectedClose", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Stage</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.Stage} onChange={e => set("Stage", e.target.value)}>
              {STAGES.filter(s => s.key !== "Lost").map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Notes</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.Notes} onChange={e => set("Notes", e.target.value)} placeholder="Job details, scope notes..." />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`, background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.textSecondary, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { if (!form.Name) return; onSave({ ...form, Value: parseFloat(form.Value) || 0, CreatedDate: new Date().toISOString().slice(0, 10) }); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.white, cursor: "pointer" }}>Create</button>
        </div>
      </div>
    </div>
  );
}

// AI Email nudge modal
function EmailNudgeModal({ opp, onClose }) {
  const subject = `Following up: ${opp.Name}`;
  const body = `Hi ${opp.Contact?.split(" ")[0] || "there"},\n\nI wanted to check in on the ${opp.Name} project. We're excited about the opportunity to work together on this.\n\nAre you available for a quick call this week to discuss next steps? We'd love to keep the momentum going and ensure we're aligned on timeline and scope.\n\nLooking forward to hearing from you.\n\nBest regards,\nSmithers\nFieldStack`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: FONT }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: BRAND.white, borderRadius: 16, padding: 28, width: 520, boxShadow: `0 8px 30px ${BRAND.shadowMd}`, animation: "fs-scaleIn 0.2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>AI Check-in Email</div>
            <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500, marginTop: 2 }}>Auto-generated nudge for {opp.Contact}</div>
          </div>
          <div onClick={onClose} style={{ cursor: "pointer" }}><Icons.X size={20} color={BRAND.textTertiary} /></div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>To</label>
          <div style={{ padding: "8px 12px", borderRadius: 8, background: BRAND.surface, border: `1px solid ${BRAND.border}`, fontSize: 13, fontWeight: 500, color: BRAND.textPrimary }}>
            {opp.Contact} &lt;{opp.Contact?.toLowerCase().replace(/\s/g, ".") || "contact"}@email.com&gt;
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Subject</label>
          <input defaultValue={subject} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}`, fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none", background: BRAND.surface }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Message</label>
          <textarea defaultValue={body} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}`, fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none", background: BRAND.surface, minHeight: 180, resize: "vertical", lineHeight: 1.5 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`, background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.textSecondary, cursor: "pointer" }}>Cancel</button>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT, color: BRAND.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.Mail size={14} color={BRAND.white} /> Send Email
          </button>
        </div>
      </div>
    </div>
  );
}

// Estimate / Bid detail panel
function EstimatePanel({ opp, onClose }) {
  const { records: estimates } = useEstimates(opp.id);
  const estimate = estimates[0];
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, display: "flex", justifyContent: "flex-end",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: 520, maxWidth: "90vw", background: BRAND.white,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column",
        animation: "fs-slideInRight 0.25s ease both", fontFamily: FONT,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${BRAND.border}` }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Estimate: {opp.Name}</span>
          <div onClick={onClose} style={{ cursor: "pointer", padding: 4 }}><Icons.X size={20} color={BRAND.textTertiary} /></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {estimate ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textSecondary, marginBottom: 12 }}>{estimate.Name}</div>
              <div style={{ background: BRAND.surface, borderRadius: 12, overflow: "hidden", border: `1px solid ${BRAND.border}`, marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}`, background: BRAND.white }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase" }}>Item</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase" }}>Type</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase", textAlign: "right" }}>Cost</span>
                </div>
                {estimate.Items.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 14px", borderBottom: i < estimate.Items.length - 1 ? `1px solid ${BRAND.border}` : "none" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary }}>{item.description}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: item.type === "Sub-Contractor" ? BRAND.purple : BRAND.blue,
                    }}>{item.type}{item.vendor ? ` · ${item.vendor}` : ""}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, textAlign: "right" }}>{formatFullCurrency(item.cost)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: `2px solid ${BRAND.border}` }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary }}>{formatFullCurrency(estimate.Total)}</span>
              </div>
              <div style={{
                display: "inline-block", fontSize: 11, fontWeight: 600,
                color: estimate.Status === "Approved" ? BRAND.green : BRAND.amber,
                background: estimate.Status === "Approved" ? BRAND.greenSoft : BRAND.amberSoft,
                padding: "3px 10px", borderRadius: 6, marginTop: 8,
              }}>{estimate.Status}</div>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: BRAND.textTertiary, fontSize: 13 }}>
              No estimate created yet for this opportunity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Scatter plot — bubble chart by close date and value
function ScatterPlot({ opportunities }) {
  const openOpps = opportunities.filter(o => o.Stage !== "Won" && o.Stage !== "Lost" && o.ExpectedClose);

  const { minDate, maxDate, maxVal } = useMemo(() => {
    if (openOpps.length === 0) return { minDate: new Date(), maxDate: new Date(), maxVal: 1 };
    const dates = openOpps.map(o => new Date(o.ExpectedClose).getTime());
    const vals = openOpps.map(o => o.Value || 0);
    return {
      minDate: new Date(Math.min(...dates)),
      maxDate: new Date(Math.max(...dates)),
      maxVal: Math.max(...vals) || 1,
    };
  }, [openOpps]);

  const totalDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));

  // Generate month labels
  const months = useMemo(() => {
    const result = [];
    const d = new Date(minDate);
    d.setDate(1);
    while (d <= maxDate) {
      result.push(new Date(d));
      d.setMonth(d.getMonth() + 1);
    }
    return result;
  }, [minDate, maxDate]);

  return (
    <div style={{
      background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`,
      padding: "20px 22px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, fontFamily: FONT, marginBottom: 4 }}>
        Pipeline Scatter
      </div>
      <div style={{ fontSize: 12, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500, marginBottom: 16 }}>
        Bubble size = deal value · X = close date · Y = propensity to close
      </div>
      <div style={{ position: "relative", height: 220, background: BRAND.surface, borderRadius: 10, border: `1px solid ${BRAND.border}`, overflow: "hidden" }}>
        {/* Y-axis labels */}
        {[100, 75, 50, 25, 0].map(v => (
          <div key={v} style={{
            position: "absolute", left: 0, top: `${(1 - v / 100) * 100}%`,
            width: "100%", borderTop: `1px dashed ${BRAND.border}`, zIndex: 1,
          }}>
            <span style={{ position: "absolute", left: 4, top: -8, fontSize: 9, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 600 }}>{v}%</span>
          </div>
        ))}
        {/* Month labels */}
        {months.map(m => {
          const offset = ((m - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
          return (
            <div key={m.toISOString()} style={{
              position: "absolute", left: `${Math.min(offset, 95)}%`, bottom: 4,
              fontSize: 9, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 600, zIndex: 1,
            }}>
              {m.toLocaleDateString("en-US", { month: "short" })}
            </div>
          );
        })}
        {/* Bubbles */}
        {openOpps.map(opp => {
          const x = ((new Date(opp.ExpectedClose) - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
          const y = (opp.PropensityToClose || 30);
          const size = Math.max(20, Math.min(60, (opp.Value / maxVal) * 50 + 16));
          const stageStyle = getStageStyle(opp.Stage);
          return (
            <div key={opp.id} title={`${opp.Name}\n${formatFullCurrency(opp.Value)}\n${opp.PropensityToClose || 30}% likely`} style={{
              position: "absolute",
              left: `calc(${Math.max(5, Math.min(90, x))}% - ${size / 2}px)`,
              top: `calc(${Math.max(5, Math.min(85, 100 - y))}% - ${size / 2}px)`,
              width: size, height: size, borderRadius: "50%",
              background: stageStyle.color + "33",
              border: `2px solid ${stageStyle.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 2, cursor: "pointer",
              transition: "all 0.3s ease",
            }}>
              <span style={{ fontSize: Math.max(8, size * 0.2), fontWeight: 700, color: stageStyle.color, fontFamily: FONT }}>
                {formatCurrency(opp.Value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { records: opportunities, refresh } = useOpportunities();
  const { create } = useMutation(TABLES.OPPORTUNITIES);
  const [showNewOpp, setShowNewOpp] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // kanban | list
  const [stageFilter, setStageFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [emailOpp, setEmailOpp] = useState(null);
  const [estimateOpp, setEstimateOpp] = useState(null);

  const stages = useMemo(() => {
    const activeStages = STAGES.filter(s => s.key !== "Lost");
    return activeStages.map(s => {
      const items = opportunities.filter(o => o.Stage === s.key);
      const total = items.reduce((sum, o) => sum + (o.Value || 0), 0);
      return { ...s, items, count: items.length, total };
    });
  }, [opportunities]);

  const totalValue = opportunities.reduce((s, o) => s + (o.Value || 0), 0);
  const weightedValue = opportunities.filter(o => o.Stage !== "Won" && o.Stage !== "Lost")
    .reduce((s, o) => s + (o.Value || 0) * ((o.PropensityToClose || 30) / 100), 0);

  const filteredList = useMemo(() => {
    let list = opportunities;
    if (stageFilter !== "All") list = list.filter(o => o.Stage === stageFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.Name?.toLowerCase().includes(q) ||
        o.Company?.toLowerCase().includes(q) ||
        o.Contact?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [opportunities, stageFilter, search]);

  const handleCreate = async (fields) => {
    await create(fields);
    setShowNewOpp(null);
    refresh();
  };

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>Pipeline</div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
            {opportunities.length} opportunities · {formatCurrency(totalValue)} total · {formatCurrency(weightedValue)} weighted
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", gap: 2, background: BRAND.surface, borderRadius: 8, padding: 2, border: `1px solid ${BRAND.border}` }}>
            <button onClick={() => setViewMode("kanban")} style={{
              padding: "6px 10px", borderRadius: 6, border: "none",
              background: viewMode === "kanban" ? BRAND.white : "transparent",
              boxShadow: viewMode === "kanban" ? `0 1px 3px ${BRAND.shadow}` : "none",
              cursor: "pointer", display: "flex", alignItems: "center",
            }}><Icons.Kanban size={16} color={viewMode === "kanban" ? BRAND.blue : BRAND.textTertiary} /></button>
            <button onClick={() => setViewMode("list")} style={{
              padding: "6px 10px", borderRadius: 6, border: "none",
              background: viewMode === "list" ? BRAND.white : "transparent",
              boxShadow: viewMode === "list" ? `0 1px 3px ${BRAND.shadow}` : "none",
              cursor: "pointer", display: "flex", alignItems: "center",
            }}><Icons.Grid size={16} color={viewMode === "list" ? BRAND.blue : BRAND.textTertiary} /></button>
          </div>
          <button onClick={() => setShowNewOpp("Lead")} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: BRAND.blue, color: BRAND.white,
            border: "none", borderRadius: 10, padding: "8px 16px",
            fontSize: 13, fontWeight: 600, fontFamily: FONT,
            cursor: "pointer", boxShadow: `0 1px 3px ${BRAND.shadow}`,
          }}>
            <Icons.Plus size={16} color={BRAND.white} />
            New Opportunity
          </button>
        </div>
      </div>

      {/* Filters for list view */}
      {viewMode === "list" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: BRAND.white, borderRadius: 10,
            padding: "8px 14px", border: `1px solid ${BRAND.border}`, flex: 1, maxWidth: 300,
          }}>
            <Icons.Search size={16} color={BRAND.textTertiary} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pipeline..." style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, fontFamily: FONT, color: BRAND.textPrimary, width: "100%", fontWeight: 500,
            }} />
          </div>
          <div style={{ display: "flex", gap: 4, background: BRAND.white, borderRadius: 10, padding: 3, border: `1px solid ${BRAND.border}` }}>
            {["All", ...STAGES.map(s => s.key)].map(s => (
              <button key={s} onClick={() => setStageFilter(s)} style={{
                padding: "5px 10px", borderRadius: 6, border: "none",
                background: stageFilter === s ? BRAND.blueSoft : "transparent",
                color: stageFilter === s ? BRAND.blue : BRAND.textSecondary,
                fontSize: 11, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline value bar */}
      <div style={{
        display: "flex", height: 8, borderRadius: 4, overflow: "hidden",
        marginBottom: 20, background: BRAND.surface,
      }}>
        {stages.map(s => (
          <div key={s.key} style={{
            width: totalValue > 0 ? `${(s.total / totalValue) * 100}%` : "0%",
            background: s.color, transition: "width 0.5s ease",
          }} />
        ))}
      </div>

      {/* Scatter plot */}
      <ScatterPlot opportunities={opportunities} />

      {/* Kanban view */}
      {viewMode === "kanban" && (
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
          {stages.map((stage) => (
            <div key={stage.key} style={{ flex: 1, minWidth: 220 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 12, padding: "0 2px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{stage.key}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: stage.color,
                    background: stage.softColor, borderRadius: 6, padding: "1px 7px",
                  }}>{stage.count}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary }}>{formatCurrency(stage.total)}</span>
              </div>
              <div style={{
                display: "flex", flexDirection: "column", gap: 8,
                background: BRAND.surface, borderRadius: 12, padding: 8, minHeight: 200,
                borderTop: `3px solid ${stage.color}`,
              }}>
                {stage.items.map(opp => (
                  <OpportunityCard key={opp.id} opp={opp} onEdit={setSelectedOpp} />
                ))}
                <div onClick={() => setShowNewOpp(stage.key)} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: 10, borderRadius: 8, cursor: "pointer",
                  border: `1.5px dashed ${BRAND.border}`, color: BRAND.textTertiary,
                  fontSize: 12, fontWeight: 600,
                }} className="fs-view-btn">
                  <Icons.Plus size={14} color={BRAND.textTertiary} /> Add
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div style={{
          background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`, overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1fr 90px 90px 100px 80px",
            padding: "12px 20px", background: BRAND.surface,
            borderBottom: `1px solid ${BRAND.border}`, gap: 12,
          }}>
            {["Name", "Company", "Contact", "Value", "Close", "Stage", "Actions"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
            ))}
          </div>
          {filteredList.map((opp, i) => {
            const stageStyle = getStageStyle(opp.Stage);
            return (
              <div key={opp.id} style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr 1fr 90px 90px 100px 80px",
                padding: "12px 20px", gap: 12, alignItems: "center",
                borderBottom: i < filteredList.length - 1 ? `1px solid ${BRAND.border}` : "none",
                animation: `fs-fadeUp 0.3s ease ${i * 0.02}s both`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>{opp.Name}</div>
                  {opp.PropensityToClose != null && (
                    <div style={{ fontSize: 10, fontWeight: 600, color: opp.PropensityToClose >= 70 ? BRAND.green : opp.PropensityToClose >= 40 ? BRAND.amber : BRAND.textTertiary, marginTop: 1 }}>
                      {opp.PropensityToClose}% likely to close
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: BRAND.textSecondary }}>{opp.Company}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: BRAND.textSecondary }}>{opp.Contact}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{formatFullCurrency(opp.Value)}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: BRAND.textSecondary }}>
                  {opp.ExpectedClose ? new Date(opp.ExpectedClose).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: stageStyle.color,
                  background: stageStyle.bg, padding: "3px 8px", borderRadius: 6,
                  display: "inline-block", textAlign: "center",
                }}>{opp.Stage}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setEmailOpp(opp)} title="AI Email Nudge" style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px solid ${BRAND.border}`,
                    background: BRAND.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }} className="fs-view-btn">
                    <Icons.Mail size={13} color={BRAND.blue} />
                  </button>
                  <button onClick={() => setEstimateOpp(opp)} title="View Estimate" style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px solid ${BRAND.border}`,
                    background: BRAND.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }} className="fs-view-btn">
                    <Icons.DollarSign size={13} color={BRAND.green} />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredList.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: BRAND.textTertiary, fontSize: 14 }}>No opportunities found</div>
          )}
        </div>
      )}

      {showNewOpp && <NewOppModal stage={showNewOpp} onClose={() => setShowNewOpp(null)} onSave={handleCreate} />}
      {emailOpp && <EmailNudgeModal opp={emailOpp} onClose={() => setEmailOpp(null)} />}
      {estimateOpp && <EstimatePanel opp={estimateOpp} onClose={() => setEstimateOpp(null)} />}
    </div>
  );
}
