import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { calcStats, buildEquityCurve, buildMonthlyPnL, buildRDistribution } from "../utils/tradeUtils";
import { format } from "date-fns";
import StatCard from "../components/StatCard";
import SmallCharts from "../components/SmallCharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "var(--bg3)", border: "1px solid var(--border2)",
      borderRadius: 8, padding: "8px 12px", fontSize: 12,
    }}>
      <div style={{ color: "var(--muted)", marginBottom: 2 }}>{d.date}</div>
      <div style={{
        color: d.r >= 0 ? "var(--green)" : "var(--red)",
        fontFamily: "var(--mono)", fontWeight: 600,
      }}>
        {d.r >= 0 ? "+" : ""}{d.r}R
      </div>
    </div>
  );
};

export default function Dashboard({ trades }) {
  const stats = useMemo(() => calcStats(trades), [trades]);
  const curve = useMemo(() => buildEquityCurve(trades), [trades]);
  const monthly = useMemo(() => buildMonthlyPnL(trades), [trades]);
  const distribution = useMemo(() => buildRDistribution(trades, 0.5), [trades]);
  const recentTrades = [...trades].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,5);

  const rColor = stats.totalR >= 0 ? "var(--green)" : "var(--red)";

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Dashboard</h1>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard
          label="Total R"
          value={`${stats.totalR >= 0 ? "+" : ""}${stats.totalR}R`}
          sub={`${stats.completed} closed trades`}
          color={rColor} mono
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate}%`}
          sub={`${stats.wins}W · ${stats.losses}L · ${stats.misses} missed`}
          color="var(--yellow)"
        />
        <StatCard
          label="Expectancy"
          value={`${stats.expectancy >= 0 ? "+" : ""}${stats.expectancy}R`}
          sub="Per trade avg"
          color={stats.expectancy >= 0 ? "var(--green)" : "var(--red)"} mono
        />
        <StatCard
          label="Profit Factor"
          value={stats.profitFactor}
          sub={`Avg win ${stats.avgWin}R / loss ${stats.avgLoss}R`}
          color="var(--blue)"
        />
      </div>

      {/* Equity Curve */}
      <div style={{
        background: "var(--bg3)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "24px 24px 16px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Equity Curve</div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>Cumulative R over time</div>
          </div>
          <div style={{
            fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18,
            color: rColor,
          }}>
            {stats.totalR >= 0 ? "+" : ""}{stats.totalR}R
          </div>
        </div>
        {curve.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={curve}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stats.totalR >= 0 ? "#10d496" : "#f43f5e"} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={stats.totalR >= 0 ? "#10d496" : "#f43f5e"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#6b6b90", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b6b90", fontSize: 11 }} axisLine={false} tickLine={false} width={35} tickFormatter={v => `${v}R`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="var(--border2)" strokeDasharray="4 4" />
              <Area
                type="monotone" dataKey="r"
                stroke={stats.totalR >= 0 ? "#10d496" : "#f43f5e"}
                strokeWidth={2}
                fill="url(#rGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>
            Log trades to see your equity curve
          </div>
        )}
      </div>

      {/* Recent Trades */}
      
      {/* Small charts row */}
      <div style={{ display: "flex", gap: 12, margin: "20px 0 24px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Monthly PnL</div>
          {monthly.length ? (
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={monthly} margin={{ top: 6, right: 4, left: 4, bottom: 6 }}>
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
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
                <BarChart data={[{ k: 'Wins', v: stats.wins }, { k: 'Losses', v: stats.losses }]} layout="vertical" margin={{ left: 0, right: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="k" hide />
                  <Bar dataKey="v" barSize={14}>
                    <Cell fill="#10d496" />
                    <Cell fill="#f43f5e" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: 72, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.winRate}%</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{stats.wins} / {stats.losses}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{
        background: "var(--bg3)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "22px 24px",
      }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recent Trades</div>
        {recentTrades.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
            No trades yet. Start logging.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date","Pair","Setup","Direction","Result","R"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, paddingBottom: 10, paddingRight: 16 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTrades.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "11px 16px 11px 0", fontSize: 13, color: "var(--muted)" }}>{t.date}</td>
                  <td style={{ padding: "11px 16px 11px 0", fontWeight: 600, fontFamily: "var(--mono)", fontSize: 13 }}>{t.pair}</td>
                  <td style={{ padding: "11px 16px 11px 0", fontSize: 13 }}>{t.setup}</td>
                  <td style={{ padding: "11px 16px 11px 0", fontSize: 13 }}>
                    <span style={{ color: t.direction === "Long" ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                      {t.direction === "Long" ? "▲" : "▼"} {t.direction}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px 11px 0" }}>
                    <ResultBadge result={t.result} />
                  </td>
                  <td style={{
                    padding: "11px 0 11px 0",
                    fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13,
                    color: t.result === "Win" ? "var(--green)" : t.result === "Loss" ? "var(--red)" : "var(--muted)",
                  }}>
                    {t.result === "Win" ? `+${t.rr}R` : t.result === "Loss" ? `-${t.rr}R` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function ResultBadge({ result }) {
  const map = {
    Win: { bg: "#10d49622", color: "#10d496" },
    Loss: { bg: "#f43f5e22", color: "#f43f5e" },
    BE: { bg: "#fbbf2422", color: "#fbbf24" },
    Miss: { bg: "#6b6b9022", color: "#8b8bb0" },
    Running: { bg: "#38bdf822", color: "#38bdf8" },
  };
  const s = map[result] || map.Miss;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 8px",
      borderRadius: 5, background: s.bg, color: s.color,
    }}>{result}</span>
  );
}
