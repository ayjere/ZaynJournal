import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ResultBadge } from "./Dashboard";
import { exportCSV } from "../utils/tradeUtils";
import { PAIRS, SETUPS, RESULTS } from "../utils/constants";

export default function History({ trades, onDelete }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ pair: "", setup: "", result: "", search: "" });
  const [deleteId, setDeleteId] = useState(null);
  const [sort, setSort] = useState("date_desc");

  const filtered = useMemo(() => {
    let t = [...trades];
    if (filters.pair) t = t.filter(x => x.pair === filters.pair);
    if (filters.setup) t = t.filter(x => x.setup === filters.setup);
    if (filters.result) t = t.filter(x => x.result === filters.result);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      t = t.filter(x => (x.notes||"").toLowerCase().includes(q) || (x.pair||"").toLowerCase().includes(q));
    }
    if (sort === "date_desc") t.sort((a,b) => new Date(b.date)-new Date(a.date));
    if (sort === "date_asc") t.sort((a,b) => new Date(a.date)-new Date(b.date));
    if (sort === "r_desc") t.sort((a,b) => (b.result==="Win"?b.rr:-b.rr)-(a.result==="Win"?a.rr:-a.rr));
    return t;
  }, [trades, filters, sort]);

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>History</h1>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>{filtered.length} of {trades.length} trades</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => exportCSV(trades)} style={{
            padding: "9px 18px", borderRadius: 9, border: "1px solid var(--border2)",
            background: "transparent", color: "var(--muted)", fontSize: 13,
          }}>⬇ Export CSV</button>
          <button onClick={() => navigate("/log")} style={{
            padding: "9px 18px", borderRadius: 9, border: "none",
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            color: "#fff", fontWeight: 700, fontSize: 13,
          }}>+ Log Trade</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "var(--bg3)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "16px 20px", marginBottom: 20,
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
      }}>
        <input
          placeholder="Search notes or pair..."
          value={filters.search} onChange={e => setF("search", e.target.value)}
          style={{ width: 200 }}
        />
        <select value={filters.pair} onChange={e => setF("pair", e.target.value)} style={{ width: 130 }}>
          <option value="">All Pairs</option>
          {PAIRS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filters.setup} onChange={e => setF("setup", e.target.value)} style={{ width: 140 }}>
          <option value="">All Setups</option>
          {SETUPS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.result} onChange={e => setF("result", e.target.value)} style={{ width: 120 }}>
          <option value="">All Results</option>
          {RESULTS.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 150, marginLeft: "auto" }}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="r_desc">Best R First</option>
        </select>
        {(filters.pair||filters.setup||filters.result||filters.search) && (
          <button onClick={() => setFilters({ pair:"",setup:"",result:"",search:"" })} style={{
            padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border2)",
            background: "transparent", color: "var(--muted)", fontSize: 12,
          }}>Clear</button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "60px 0", fontSize: 14 }}>
          {trades.length === 0 ? "No trades yet. Hit + Log Trade to start." : "No trades match your filters."}
        </div>
      ) : (
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
                {["Date","Pair","Session","Setup","Dir","TF","Result","R","Emotion","Actions"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: 11, color: "var(--muted)",
                    fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
                    padding: "12px 16px",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < filtered.length-1 ? "1px solid var(--border)" : "none" }}>
                  <td style={td}>{t.date}</td>
                  <td style={{ ...td, fontWeight: 700, fontFamily: "var(--mono)" }}>{t.pair}</td>
                  <td style={{ ...td, color: "var(--muted)" }}>{t.session}</td>
                  <td style={td}>{t.setup}</td>
                  <td style={td}>
                    <span style={{ color: t.direction === "Long" ? "var(--green)" : "var(--red)", fontWeight: 600, fontSize: 12 }}>
                      {t.direction === "Long" ? "▲" : "▼"} {t.direction}
                    </span>
                  </td>
                  <td style={{ ...td, color: "var(--muted)", fontFamily: "var(--mono)" }}>{t.tf}</td>
                  <td style={td}><ResultBadge result={t.result} /></td>
                  <td style={{ ...td, fontFamily: "var(--mono)", fontWeight: 700, color: t.result==="Win"?"var(--green)":t.result==="Loss"?"var(--red)":"var(--muted)" }}>
                    {t.result==="Win"?`+${t.rr}R`:t.result==="Loss"?`-${t.rr}R`:"—"}
                  </td>
                  <td style={{ ...td, color: "var(--muted)", fontSize: 12 }}>{t.emotion || "—"}</td>
                  <td style={{ ...td }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => navigate(`/log?edit=${t.id}`)} style={actionBtn}>Edit</button>
                      {deleteId === t.id ? (
                        <>
                          <button onClick={() => { onDelete(t.id); setDeleteId(null); }} style={{ ...actionBtn, color: "var(--red)", borderColor: "var(--red)" }}>Confirm</button>
                          <button onClick={() => setDeleteId(null)} style={actionBtn}>✕</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteId(t.id)} style={{ ...actionBtn, color: "var(--muted2)" }}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes drawer — show notes for rows */}
      {filtered.some(t => t.notes || t.confluences || t.missed_reason) && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Trade Notes</div>
          {filtered.filter(t => t.notes || t.confluences || t.missed_reason).map(t => (
            <div key={t.id + "_notes"} style={{
              background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "14px 18px", marginBottom: 10,
              borderLeft: `3px solid ${t.result==="Win"?"var(--green)":t.result==="Loss"?"var(--red)":"var(--muted2)"}`,
            }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12, color: "var(--muted)" }}>
                <span style={{ fontFamily: "var(--mono)", color: "var(--text)", fontWeight: 700 }}>{t.pair}</span>
                <span>{t.date}</span>
                <span>{t.setup}</span>
                <ResultBadge result={t.result} />
              </div>
              {t.confluences && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ color: "var(--muted)", fontSize: 11 }}>CONFLUENCES: </span>{t.confluences}</div>}
              {t.notes && <div style={{ fontSize: 13, color: "var(--muted)" }}><span style={{ color: "var(--muted)", fontSize: 11 }}>NOTES: </span>{t.notes}</div>}
              {t.missed_reason && <div style={{ fontSize: 13, color: "var(--yellow)" }}><span style={{ fontSize: 11 }}>MISSED: </span>{t.missed_reason}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const td = { padding: "12px 16px", fontSize: 13 };
const actionBtn = {
  padding: "4px 10px", fontSize: 11, borderRadius: 6,
  border: "1px solid var(--border2)", background: "transparent",
  color: "var(--text)",
};
