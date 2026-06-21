import React from "react";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

export default function SmallCharts({ monthly = [], stats = {}, distribution = [] }) {
  return (
    <div style={{ display: "flex", gap: 12, margin: "20px 0 24px", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 260, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Monthly PnL</div>
        {monthly.length ? (
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={monthly} margin={{ top: 6, right: 4, left: 4, bottom: 6 }}>
              <Bar dataKey="r" barSize={12}>
                {monthly.map((m, i) => (
                  <Cell key={i} fill={m.r >= 0 ? "#10d496" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: "var(--muted)", fontSize: 13, padding: "18px 0" }}>No monthly data</div>
        )}
      </div>

      <div style={{ width: 240, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Win / Loss</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={[{ k: 'Wins', v: stats.wins || 0 }, { k: 'Losses', v: stats.losses || 0 }]} layout="vertical">
                <Bar dataKey="v" barSize={14}>
                  <Cell fill="#10d496" />
                  <Cell fill="#f43f5e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: 72, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.winRate ?? 0}%</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{stats.wins || 0} / {stats.losses || 0}</div>
          </div>
        </div>
      </div>
      
      {/* Small R-distribution preview */}
      <div style={{ width: 340, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>R Distribution Preview</div>
        {distribution.length ? (
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={distribution} margin={{ left: 4, right: 4 }}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 8, padding: 8, fontSize: 12 }}>
                    <div style={{ color: "var(--muted)", marginBottom: 6 }}>{d.label}</div>
                    <div style={{ fontWeight: 700 }}>{d.count} trades</div>
                    <div style={{ color: d.mid >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--mono)", marginTop: 6 }}>{d.mid >= 0 ? "+" : ""}{d.mid}R</div>
                  </div>
                );
              }} />
              <Bar dataKey="count" barSize={14}>
                {distribution.map((entry, i) => (
                  <Cell key={i} fill={entry.mid >= 0 ? "#10d496" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: "var(--muted)", fontSize: 13, padding: "18px 0" }}>Not enough trades for histogram</div>
        )}
      </div>
    </div>
  );
}
