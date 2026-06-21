import { useState, useMemo } from "react";
import { format, parseISO, addMonths, subMonths } from "date-fns";
import { buildPnLCalendar } from "../utils/tradeUtils";

export default function Calendar({ trades }) {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));

  const days = useMemo(() => buildPnLCalendar(trades, month), [trades, month]);

  const monthDate = parseISO(month + "-01");
  const firstDow = monthDate.getDay(); // 0=Sun
  const totalR = days.reduce((s, d) => s + d.r, 0);
  const tradeDays = days.filter(d => d.count > 0).length;
  const winDays = days.filter(d => d.r > 0).length;
  const lossDays = days.filter(d => d.r < 0).length;

  const maxAbs = Math.max(...days.map(d => Math.abs(d.r)), 0.01);

  const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  function cellColor(r) {
    if (r === 0) return "transparent";
    const intensity = Math.min(Math.abs(r) / maxAbs, 1);
    if (r > 0) return `rgba(16,212,150,${0.12 + intensity * 0.35})`;
    return `rgba(244,63,94,${0.12 + intensity * 0.35})`;
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>P&amp;L Calendar</h1>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Daily performance heatmap</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setMonth(format(subMonths(monthDate,1),"yyyy-MM"))} style={navBtn}>‹</button>
          <div style={{ fontSize: 15, fontWeight: 700, minWidth: 140, textAlign: "center" }}>
            {format(monthDate, "MMMM yyyy")}
          </div>
          <button onClick={() => setMonth(format(addMonths(monthDate,1),"yyyy-MM"))} style={navBtn}>›</button>
        </div>
      </div>

      {/* Month summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Month R", value: `${totalR >= 0 ? "+" : ""}${totalR.toFixed(1)}R`, color: totalR >= 0 ? "var(--green)" : "var(--red)" },
          { label: "Trade Days", value: tradeDays, color: "var(--text)" },
          { label: "Green Days", value: winDays, color: "var(--green)" },
          { label: "Red Days", value: lossDays, color: "var(--red)" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--bg3)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "14px 20px", flex: 1, minWidth: 100,
          }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "var(--mono)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", overflow: "hidden" }}>
        {/* DOW Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
          {DOW.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {/* Empty cells before month start */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={"empty" + i} style={{ height: 80 }} />
          ))}

          {days.map(day => (
            <div key={day.date} style={{
              height: 80, borderRadius: 10,
              background: day.count > 0 ? cellColor(day.r) : "var(--bg2)",
              border: `1px solid ${day.count > 0 ? (day.r > 0 ? "#10d49633" : day.r < 0 ? "#f43f5e33" : "var(--border)") : "var(--border)"}`,
              padding: "8px 10px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              position: "relative",
            }}>
              <div style={{ fontSize: 11, color: day.count > 0 ? "var(--text)" : "var(--muted2)", fontWeight: day.count > 0 ? 600 : 400 }}>{day.day}</div>
              {day.count > 0 && (
                <>
                  <div style={{
                    fontSize: 14, fontWeight: 800, fontFamily: "var(--mono)",
                    color: day.r > 0 ? "var(--green)" : day.r < 0 ? "var(--red)" : "var(--yellow)",
                  }}>
                    {day.r > 0 ? "+" : ""}{day.r.toFixed(1)}R
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{day.count} trade{day.count !== 1 ? "s" : ""}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trade list for month */}
      {days.some(d => d.count > 0) && (
        <div style={{ marginTop: 24, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Trades This Month</div>
          {days.filter(d => d.count > 0).map(day => (
            <div key={day.date} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 600 }}>{day.date}</div>
              {day.trades.map(t => (
                <div key={t.id} style={{
                  display: "flex", gap: 12, alignItems: "center",
                  padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13,
                }}>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, minWidth: 70 }}>{t.pair}</span>
                  <span style={{ color: "var(--muted)" }}>{t.setup}</span>
                  <span style={{ color: t.direction==="Long"?"var(--green)":"var(--red)", fontSize: 12 }}>{t.direction==="Long"?"▲":"▼"} {t.direction}</span>
                  <span style={{
                    marginLeft: "auto", fontFamily: "var(--mono)", fontWeight: 700,
                    color: t.result==="Win"?"var(--green)":t.result==="Loss"?"var(--red)":"var(--muted)",
                  }}>
                    {t.result==="Win"?`+${t.rr}R`:t.result==="Loss"?`-${t.rr}R`:"BE"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const navBtn = {
  width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border2)",
  background: "transparent", color: "var(--text)", fontSize: 18, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
