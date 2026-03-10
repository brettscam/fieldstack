import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BRAND, FONT, formatFullCurrency, formatDate, getStageStyle, STAGES } from "../lib/design";
import Icons from "../components/Icons";
import { useOpportunities, useJobs, useEstimates, useContacts, useMutation } from "../lib/hooks";
import { TABLES } from "../lib/supabase";

function InfoRow({ label, value, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {Icon && <Icon size={16} color={onClick ? BRAND.blue : BRAND.textTertiary} />}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, fontFamily: FONT }}>{label}</div>
        <div style={{
          fontSize: 13, fontWeight: 600, fontFamily: FONT, marginTop: 1,
          color: onClick ? BRAND.blue : BRAND.textPrimary,
          textDecoration: onClick ? "none" : "none",
        }}>
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

export default function OpportunityDetail() {
  const { oppId } = useParams();
  const navigate = useNavigate();
  const { records: opportunities } = useOpportunities();
  const { records: jobs } = useJobs();
  const { records: contacts } = useContacts();
  const { records: estimates } = useEstimates(oppId);
  const { update } = useMutation(TABLES.OPPORTUNITIES);
  const [editingStage, setEditingStage] = useState(false);

  const opp = useMemo(() => opportunities.find(o => o.id === oppId), [opportunities, oppId]);
  const relatedJobs = useMemo(() => jobs.filter(j => j.OpportunityId === oppId || j.Company === opp?.Company), [jobs, oppId, opp]);
  const contact = useMemo(() => contacts.find(c => c.Name === opp?.Contact), [contacts, opp]);
  const estimate = estimates[0];

  if (!opp) {
    return (
      <div style={{ padding: 28, fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div onClick={() => navigate(-1)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: BRAND.blue }}>
            <Icons.ChevronLeft size={16} color={BRAND.blue} /> Back
          </div>
        </div>
        <div style={{ padding: 60, textAlign: "center", color: BRAND.textTertiary, fontSize: 14 }}>Opportunity not found</div>
      </div>
    );
  }

  const stageStyle = getStageStyle(opp.Stage);
  const daysToClose = opp.ExpectedClose ? Math.ceil((new Date(opp.ExpectedClose) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, animation: "fs-fadeUp 0.3s ease both" }}>
        <div onClick={() => navigate("/pipeline")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: BRAND.blue }}>
          <Icons.ChevronLeft size={16} color={BRAND.blue} /> Pipeline
        </div>
        <Icons.ChevronRight size={14} color={BRAND.textTertiary} />
        <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.textSecondary }}>{opp.Name}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, animation: "fs-fadeUp 0.3s ease 0.05s both" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>{opp.Name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: stageStyle.color,
              background: stageStyle.bg, padding: "4px 12px", borderRadius: 6,
            }}>{opp.Stage}</span>
            {opp.PropensityToClose != null && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: opp.PropensityToClose >= 70 ? BRAND.green : opp.PropensityToClose >= 40 ? BRAND.amber : BRAND.textTertiary,
              }}>{opp.PropensityToClose}% likely to close</span>
            )}
            {daysToClose != null && (
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: daysToClose < 0 ? BRAND.red : daysToClose < 14 ? BRAND.amber : BRAND.textTertiary,
              }}>
                {daysToClose < 0 ? `${Math.abs(daysToClose)}d overdue` : `${daysToClose}d to close`}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setEditingStage(!editingStage)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: BRAND.white, border: `1px solid ${BRAND.border}`,
            borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600,
            fontFamily: FONT, color: BRAND.textSecondary, cursor: "pointer",
          }}>
            <Icons.Edit size={14} color={BRAND.textSecondary} /> Edit Stage
          </button>
        </div>
      </div>

      {/* Stage editor */}
      {editingStage && (
        <div style={{
          display: "flex", gap: 6, marginBottom: 20, padding: 12, background: BRAND.surface,
          borderRadius: 12, border: `1px solid ${BRAND.border}`, animation: "fs-fadeUp 0.2s ease both",
        }}>
          {STAGES.map(s => (
            <button key={s.key} onClick={async () => {
              await update(opp.id, { Stage: s.key });
              setEditingStage(false);
              window.location.reload();
            }} style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
              background: opp.Stage === s.key ? s.color + "22" : BRAND.white,
              color: opp.Stage === s.key ? s.color : BRAND.textSecondary,
              fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
              borderWidth: 1, borderStyle: "solid", borderColor: opp.Stage === s.key ? s.color + "44" : BRAND.border,
            }}>{s.key}</button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 20 }}>
        {/* Left column — Details */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Key Metrics */}
          <div style={{
            display: "flex", gap: 14, animation: "fs-fadeUp 0.3s ease 0.1s both",
          }}>
            <div className="fs-hover-lift" style={{
              flex: 1, background: BRAND.white, borderRadius: 14, padding: "20px 22px",
              border: `1px solid ${BRAND.border}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Deal Value</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.textPrimary }}>{formatFullCurrency(opp.Value)}</div>
            </div>
            <div className="fs-hover-lift" style={{
              flex: 1, background: BRAND.white, borderRadius: 14, padding: "20px 22px",
              border: `1px solid ${BRAND.border}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Weighted Value</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.green }}>
                {formatFullCurrency((opp.Value || 0) * ((opp.PropensityToClose || 30) / 100))}
              </div>
            </div>
            <div className="fs-hover-lift" style={{
              flex: 1, background: BRAND.white, borderRadius: 14, padding: "20px 22px",
              border: `1px solid ${BRAND.border}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Expected Close</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.textPrimary }}>
                {opp.ExpectedClose ? formatDate(opp.ExpectedClose) : "Not set"}
              </div>
            </div>
          </div>

          {/* Details card */}
          <div className="fs-hover-lift" style={{
            background: BRAND.white, borderRadius: 14, padding: "20px 22px",
            border: `1px solid ${BRAND.border}`, animation: "fs-fadeUp 0.3s ease 0.15s both",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <InfoRow
                label="Company" value={opp.Company} icon={Icons.Building}
                onClick={() => navigate(`/companies?highlight=${encodeURIComponent(opp.Company)}`)}
              />
              <InfoRow
                label="Contact" value={opp.Contact} icon={Icons.Contacts}
                onClick={() => navigate(`/contacts?search=${encodeURIComponent(opp.Contact)}`)}
              />
              <InfoRow label="Created" value={formatDate(opp.CreatedDate)} icon={Icons.Calendar} />
              <InfoRow label="Expected Close" value={formatDate(opp.ExpectedClose)} icon={Icons.Clock} />
            </div>
            {opp.Notes && (
              <div style={{ marginTop: 12, padding: "12px 14px", background: BRAND.surface, borderRadius: 10, border: `1px solid ${BRAND.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary, marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 13, color: BRAND.textSecondary, lineHeight: 1.5 }}>{opp.Notes}</div>
              </div>
            )}
          </div>

          {/* Estimate */}
          <div className="fs-hover-lift" style={{
            background: BRAND.white, borderRadius: 14, padding: "20px 22px",
            border: `1px solid ${BRAND.border}`, animation: "fs-fadeUp 0.3s ease 0.2s both",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Estimate / Bid</div>
              {estimate && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: estimate.Status === "Approved" ? BRAND.green : BRAND.amber,
                  background: estimate.Status === "Approved" ? BRAND.greenSoft : BRAND.amberSoft,
                  padding: "3px 10px", borderRadius: 6,
                }}>{estimate.Status}</span>
              )}
            </div>
            {estimate ? (
              <>
                <div style={{ background: BRAND.surface, borderRadius: 12, overflow: "hidden", border: `1px solid ${BRAND.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 14px", borderBottom: `1px solid ${BRAND.border}`, background: BRAND.white }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase" }}>Item</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase" }}>Type</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase", textAlign: "right" }}>Cost</span>
                  </div>
                  {estimate.Items.map((item, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 14px", borderBottom: i < estimate.Items.length - 1 ? `1px solid ${BRAND.border}` : "none" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary }}>{item.description}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: item.type === "Sub-Contractor" ? BRAND.purple : BRAND.blue }}>
                        {item.type}{item.vendor ? ` · ${item.vendor}` : ""}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, textAlign: "right" }}>{formatFullCurrency(item.cost)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: `2px solid ${BRAND.border}`, marginTop: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary }}>{formatFullCurrency(estimate.Total)}</span>
                </div>
              </>
            ) : (
              <div style={{ padding: 30, textAlign: "center", color: BRAND.textTertiary, fontSize: 13, background: BRAND.surface, borderRadius: 10 }}>
                No estimate created yet
              </div>
            )}
          </div>
        </div>

        {/* Right column — Contact + Related */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Contact Card */}
          {contact && (
            <div className="fs-hover-lift" onClick={() => navigate(`/contacts?search=${encodeURIComponent(contact.Name)}`)} style={{
              background: BRAND.white, borderRadius: 14, padding: "20px 22px",
              border: `1px solid ${BRAND.border}`, cursor: "pointer",
              animation: "fs-fadeUp 0.3s ease 0.1s both",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>Primary Contact</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: BRAND.white,
                }}>
                  {contact.Name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary }}>{contact.Name}</div>
                  <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500 }}>{contact.Role}</div>
                </div>
              </div>
              {contact.Email && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Icons.Mail size={13} color={BRAND.textTertiary} />
                  <span style={{ fontSize: 12, color: BRAND.textSecondary, fontWeight: 500 }}>{contact.Email}</span>
                </div>
              )}
              {contact.Phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icons.Phone size={13} color={BRAND.textTertiary} />
                  <span style={{ fontSize: 12, color: BRAND.textSecondary, fontWeight: 500 }}>{contact.Phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Related Jobs */}
          <div className="fs-hover-lift" style={{
            background: BRAND.white, borderRadius: 14, padding: "20px 22px",
            border: `1px solid ${BRAND.border}`,
            animation: "fs-fadeUp 0.3s ease 0.15s both",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>Related Jobs</div>
            {relatedJobs.length > 0 ? relatedJobs.map(job => {
              const statusColor = job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : BRAND.amber;
              return (
                <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="fs-hover-lift" style={{
                  padding: "10px 12px", borderRadius: 10, border: `1px solid ${BRAND.border}`,
                  marginBottom: 8, cursor: "pointer",
                  borderLeft: `3px solid ${statusColor}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.blue }}>{job.JobId}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: statusColor,
                      background: statusColor + "18", padding: "2px 6px", borderRadius: 4,
                    }}>{job.Status}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>{job.Name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 4, background: BRAND.surface, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${job.Progress}%`, background: statusColor, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: BRAND.textSecondary }}>{job.Progress}%</span>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: 20, textAlign: "center", color: BRAND.textTertiary, fontSize: 13, background: BRAND.surface, borderRadius: 10 }}>
                No jobs linked yet
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="fs-hover-lift" style={{
            background: BRAND.white, borderRadius: 14, padding: "20px 22px",
            border: `1px solid ${BRAND.border}`,
            animation: "fs-fadeUp 0.3s ease 0.2s both",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>Activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.green, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary }}>Created</div>
                  <div style={{ fontSize: 11, color: BRAND.textTertiary }}>{formatDate(opp.CreatedDate)}</div>
                </div>
              </div>
              {opp.Stage !== "Lead" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.blue, marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary }}>Moved to {opp.Stage}</div>
                    <div style={{ fontSize: 11, color: BRAND.textTertiary }}>Current stage</div>
                  </div>
                </div>
              )}
              {opp.ExpectedClose && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: daysToClose < 0 ? BRAND.red : BRAND.amber,
                    marginTop: 4, flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.textPrimary }}>
                      {daysToClose < 0 ? "Overdue" : "Expected Close"}
                    </div>
                    <div style={{ fontSize: 11, color: BRAND.textTertiary }}>{formatDate(opp.ExpectedClose)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
