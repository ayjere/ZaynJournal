import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { groupBy, calcStats, buildEquityCurve, buildRDistribution } from "../utils/tradeUtils";

function BreakdownTable({ title, data }) {
  if (!data.length) return null;
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{title}</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Name","Trades","W","L","Win%","Total R"].map(h => (
              <th key={h} style={{ textAlign: "left", fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, paddingBottom: 10, paddingRight: 16 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.label} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ ...td, fontWeight: 600, fontFamily: "var(--mono)" }}>{row.label}</td>
              <td style={td}>{row.count}</td>
              <td style={{ ...td, color: "var(--green)" }}>{row.wins}</td>
              <td style={{ ...td, color: "var(--red)" }}>{row.losses}</td>
              <td style={td}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 5, background: "var(--bg2)", borderRadius: 3, overflow: "hidden", maxWidth: 80 }}>
                    <div style={{ height: "100%", width: `${row.winRate}%`, background: row.winRate >= 50 ? "var(--green)" : "var(--red)", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: row.winRate >= 50 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{row.winRate}%</span>
                </div>
              </td>
              <td style={{ ...td, fontFamily: "var(--mono)", fontWeight: 700, color: row.totalR >= 0 ? "var(--green)" : "var(--red)" }}>
                {row.totalR >= 0 ? "+" : ""}{row.totalR}R
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ color: payload[0].value >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--mono)", fontWeight: 600 }}>
        {payload[0].value >= 0 ? "+" : ""}{payload[0].value}R
      </div>
    </div>
  );
};

export default function Analytics({ trades }) {
  const completed = useMemo(() => trades.filter(t => ["Win","Loss","BE"].includes(t.result)), [trades]);
  const stats = useMemo(() => calcStats(completed), [completed]);
  const equity = useMemo(() => buildEquityCurve(completed), [completed]);
  const bySetup = useMemo(() => groupBy(completed, "setup"), [completed]);
  const byPair = useMemo(() => groupBy(trades.filter(t => ["Win","Loss","BE"].includes(t.result)), "pair"), [trades]);
  const bySession = useMemo(() => groupBy(trades.filter(t => ["Win","Loss","BE"].includes(t.result)), "session"), [trades]);
  const byDirection = useMemo(() => groupBy(trades.filter(t => ["Win","Loss","BE"].includes(t.result)), "direction"), [trades]);
  const byEmotion = useMemo(() => groupBy(trades.filter(t => ["Win","Loss","BE"].includes(t.result)), "emotion"), [trades]);

  const chartData = bySetup.map(s => ({ name: s.label, r: s.totalR }));
  const distribution = useMemo(() => buildRDistribution(completed, 0.5), [completed]);

  if (trades.length === 0) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Analytics</h1>
        <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 60, textAlign: "center" }}>Log trades to see analytics.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Analytics</h1>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>Performance breakdown by setup, pair, session</div>
      </div>

      {/* Setup R chart */}
      {chartData.length > 0 && (
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 24px 16px", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>R by Setup</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: "#6b6b90", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b6b90", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}R`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="r" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.r >= 0 ? "#10d496" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* R distribution histogram */}
      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>R Distribution (per trade)</div>
        {distribution.length ? (
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ left: 6, right: 6 }}>
                <XAxis dataKey="label" tick={{ fill: "#6b6b90", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6b6b90", fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 8, padding: 8, fontSize: 12 }}>
                      <div style={{ color: "var(--muted)", marginBottom: 6 }}>{label}</div>
                      <div style={{ fontWeight: 700 }}>{d.count} trades</div>
                      <div style={{ color: d.mid >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--mono)", marginTop: 6 }}>{d.mid >= 0 ? "+" : ""}{d.mid}R</div>
                    </div>
                  );
                }} />
                <Bar dataKey="count" barSize={26} radius={[6,6,0,0]}>
                  {distribution.map((entry, i) => (
                    <Cell key={i} fill={entry.mid >= 0 ? "#10d496" : "#f43f5e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Not enough data to show distribution.</div>
        )}
      </div>

      {/* Summary stats + equity curve */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { k: "total", label: "Trades", fmt: v => v },
            { k: "completed", label: "Completed", fmt: v => v },
            { k: "wins", label: "Wins", fmt: v => v },
            { k: "losses", label: "Losses", fmt: v => v },
            { k: "winRate", label: "Win %", fmt: v => `${v}%` },
            { k: "totalR", label: "Total R", fmt: v => `${v}R` },
            { k: "expectancy", label: "Expectancy", fmt: v => `${v}R` },
            { k: "avgWin", label: "Avg Win", fmt: v => `${v}R` },
            { k: "avgLoss", label: "Avg Loss", fmt: v => `${v}R` },
          ].map(s => (
            <div key={s.k} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--mono)" }}>{s.fmt(stats[s.k])}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Equity Curve</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={equity} margin={{ left: 0, right: 0, top: 6, bottom: 6 }}>
              <XAxis dataKey="date" tick={{ fill: "#6b6b90", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b6b90", fontSize: 11 }} axisLine={false} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,120,0.04)" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="r" stroke="#10d496" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <BreakdownTable title="By Setup" data={bySetup} />
      <BreakdownTable title="By Pair" data={byPair} />
      <BreakdownTable title="By Session" data={bySession} />
      <BreakdownTable title="By Direction" data={byDirection} />
      {byEmotion.length > 0 && <BreakdownTable title="By Emotion / Psychology" data={byEmotion} />}
    </div>
  );
}

const td = { padding: "11px 16px 11px 0", fontSize: 13 };
