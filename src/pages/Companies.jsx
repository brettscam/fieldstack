import { useState, useMemo } from "react";
import { BRAND, FONT, formatFullCurrency, formatCurrency, getStageStyle } from "../lib/design";
import Icons from "../components/Icons";
import { useCompanies, useOpportunities, useJobs } from "../lib/hooks";

export default function Companies() {
  const { records: companies } = useCompanies();
  const { records: opportunities } = useOpportunities();
  const { records: jobs } = useJobs();
  const [search, setSearch] = useState("");
  const [expandedCompany, setExpandedCompany] = useState(null);

  const enriched = useMemo(() => {
    return companies.map(c => {
      const compOpps = opportunities.filter(o => o.Company === c.Name);
      const compJobs = jobs.filter(j => j.Company === c.Name);
      const totalValue = compOpps.reduce((s, o) => s + (o.Value || 0), 0);
      const wonValue = compOpps.filter(o => o.Stage === "Won").reduce((s, o) => s + (o.Value || 0), 0);
      return { ...c, opps: compOpps, jobs: compJobs, totalValue, wonValue, oppCount: compOpps.length, jobCount: compJobs.length };
    }).filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.Name.toLowerCase().includes(q) || c.Industry?.toLowerCase().includes(q);
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [companies, opportunities, jobs, search]);

  return (
    <div style={{ padding: 28, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>Companies</div>
          <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
            {companies.length} companies · {formatCurrency(enriched.reduce((s, c) => s + c.totalValue, 0))} total pipeline
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: BRAND.white, borderRadius: 10,
        padding: "8px 14px", border: `1px solid ${BRAND.border}`, maxWidth: 340, marginBottom: 20,
      }}>
        <Icons.Search size={16} color={BRAND.textTertiary} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." style={{
          border: "none", outline: "none", background: "transparent",
          fontSize: 13, fontFamily: FONT, color: BRAND.textPrimary, width: "100%", fontWeight: 500,
        }} />
      </div>

      {/* Companies table */}
      <div style={{
        background: BRAND.white, borderRadius: 14, border: `1px solid ${BRAND.border}`, overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.2fr 80px 80px 100px 100px",
          padding: "12px 20px", background: BRAND.surface, borderBottom: `1px solid ${BRAND.border}`, gap: 12,
        }}>
          {["Company", "Industry", "Opps", "Jobs", "Total Value", "Won Value"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>

        {enriched.map((company, i) => (
          <div key={company.id}>
            <div
              className="fs-nav-item"
              onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
              style={{
                display: "grid", gridTemplateColumns: "2fr 1.2fr 80px 80px 100px 100px",
                padding: "14px 20px", gap: 12, alignItems: "center",
                borderBottom: `1px solid ${BRAND.border}`,
                cursor: "pointer",
                animation: `fs-fadeUp 0.3s ease ${i * 0.03}s both`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: BRAND.blueSoft,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icons.Building size={16} color={BRAND.blue} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>{company.Name}</div>
                  {company.Address && <div style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 500, marginTop: 1 }}>{company.Address}</div>}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: BRAND.textSecondary }}>{company.Industry}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{company.oppCount}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{company.jobCount}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{formatFullCurrency(company.totalValue)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.green }}>{formatFullCurrency(company.wonValue)}</div>
            </div>

            {/* Expanded detail */}
            {expandedCompany === company.id && (
              <div style={{
                padding: "16px 20px", background: BRAND.surface, borderBottom: `1px solid ${BRAND.border}`,
                animation: "fs-fadeUp 0.2s ease both",
              }}>
                {/* Opportunities */}
                {company.opps.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 8 }}>
                      Opportunities ({company.opps.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {company.opps.map(opp => {
                        const stageStyle = getStageStyle(opp.Stage);
                        return (
                          <div key={opp.id} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 14px", background: BRAND.white, borderRadius: 8,
                            border: `1px solid ${BRAND.border}`,
                          }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>{opp.Name}</div>
                              <div style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 500, marginTop: 1 }}>
                                {opp.Contact} · Created {new Date(opp.CreatedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.textPrimary }}>{formatFullCurrency(opp.Value)}</span>
                              <span style={{
                                fontSize: 10, fontWeight: 600, color: stageStyle.color,
                                background: stageStyle.bg, padding: "3px 8px", borderRadius: 6,
                              }}>{opp.Stage}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Jobs */}
                {company.jobs.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 8 }}>
                      Jobs ({company.jobs.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {company.jobs.map(job => {
                        const statusColor = job.Status === "On Track" ? BRAND.green : job.Status === "Delayed" ? BRAND.red : BRAND.amber;
                        return (
                          <div key={job.id} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 14px", background: BRAND.white, borderRadius: 8,
                            border: `1px solid ${BRAND.border}`,
                          }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>{job.Name}</div>
                              <div style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 500, marginTop: 1 }}>
                                {job.JobId} · {job.Site}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 80 }}>
                                <div style={{ flex: 1, height: 5, background: BRAND.surface, borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${job.Progress}%`, background: statusColor, borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.textSecondary }}>{job.Progress}%</span>
                              </div>
                              <span style={{
                                fontSize: 10, fontWeight: 600, color: statusColor,
                                background: statusColor + "18", padding: "3px 8px", borderRadius: 6,
                              }}>{job.Status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {company.opps.length === 0 && company.jobs.length === 0 && (
                  <div style={{ textAlign: "center", color: BRAND.textTertiary, fontSize: 13, padding: 16 }}>
                    No opportunities or jobs for this company
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
