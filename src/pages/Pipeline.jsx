import { useState, useMemo } from "react";
import { BRAND, FONT, STAGES, getStageStyle, formatCurrency, formatFullCurrency, daysAgo } from "../lib/design";
import Icons from "../components/Icons";
import { useOpportunities, useMutation } from "../lib/hooks";
import { TABLES } from "../lib/supabase";

function OpportunityCard({ opp, onEdit }) {
  const age = daysAgo(opp.CreatedDate);
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
        {age > 0 && (
          <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: FONT, fontWeight: 500 }}>{age}d ago</span>
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
    fontSize: 13, fontFamily: FONT, fontWeight: 500, color: BRAND.textPrimary, outline: "none",
    background: BRAND.surface,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: FONT,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BRAND.white, borderRadius: 16, padding: "28px", width: 420,
        boxShadow: `0 8px 30px ${BRAND.shadowMd}`, animation: "fs-scaleIn 0.2s ease",
      }}>
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
              <input style={inputStyle} value={form.Company} onChange={e => set("Company", e.target.value)} placeholder="Company name" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Contact</label>
              <input style={inputStyle} value={form.Contact} onChange={e => set("Contact", e.target.value)} placeholder="Contact name" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: BRAND.textSecondary, display: "block", marginBottom: 4 }}>Value ($)</label>
              <input style={inputStyle} type="number" value={form.Value} onChange={e => set("Value", e.target.value)} placeholder="0" />
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
          <button onClick={onClose} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${BRAND.border}`,
            background: BRAND.white, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.textSecondary, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => {
            if (!form.Name) return;
            onSave({ ...form, Value: parseFloat(form.Value) || 0, CreatedDate: new Date().toISOString().slice(0, 10) });
          }} style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: BRAND.blue, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            color: BRAND.white, cursor: "pointer",
          }}>Create</button>
        </div>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { records: opportunities, refresh } = useOpportunities();
  const { create } = useMutation(TABLES.OPPORTUNITIES);
  const [showNewOpp, setShowNewOpp] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);

  const stages = useMemo(() => {
    const activeStages = STAGES.filter(s => s.key !== "Lost");
    return activeStages.map(s => {
      const items = opportunities.filter(o => o.Stage === s.key);
      const total = items.reduce((sum, o) => sum + (o.Value || 0), 0);
      return { ...s, items, count: items.length, total };
    });
  }, [opportunities]);

  const totalValue = opportunities.reduce((s, o) => s + (o.Value || 0), 0);

  const handleCreate = async (fields) => {
    await create(fields);
    setShowNewOpp(null);
    refresh();
  };

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>Pipeline</div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
            {opportunities.length} opportunities · {formatCurrency(totalValue)} total value
          </div>
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

      {/* Pipeline value bar */}
      <div style={{
        display: "flex", height: 8, borderRadius: 4, overflow: "hidden",
        marginBottom: 24, background: BRAND.surface,
      }}>
        {stages.map(s => (
          <div key={s.key} style={{
            width: totalValue > 0 ? `${(s.total / totalValue) * 100}%` : "0%",
            background: s.color,
            transition: "width 0.5s ease",
          }} />
        ))}
      </div>

      {/* Kanban columns */}
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
        {stages.map((stage) => (
          <div key={stage.key} style={{ flex: 1, minWidth: 220 }}>
            {/* Column header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12, padding: "0 2px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{stage.key}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: stage.color,
                  background: stage.softColor, borderRadius: 6,
                  padding: "1px 7px",
                }}>{stage.count}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary }}>
                {formatCurrency(stage.total)}
              </span>
            </div>

            {/* Cards container */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              background: BRAND.surface, borderRadius: 12,
              padding: 8, minHeight: 200,
            }}>
              {stage.items.map(opp => (
                <OpportunityCard key={opp.id} opp={opp} onEdit={setSelectedOpp} />
              ))}

              {/* Add card button */}
              <div onClick={() => setShowNewOpp(stage.key)} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px", borderRadius: 8, cursor: "pointer",
                border: `1.5px dashed ${BRAND.border}`, color: BRAND.textTertiary,
                fontSize: 12, fontWeight: 600, transition: "all 0.15s ease",
              }} className="fs-view-btn">
                <Icons.Plus size={14} color={BRAND.textTertiary} />
                Add
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNewOpp && <NewOppModal stage={showNewOpp} onClose={() => setShowNewOpp(null)} onSave={handleCreate} />}
    </div>
  );
}
