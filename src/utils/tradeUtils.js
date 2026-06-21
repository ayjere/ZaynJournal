import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export function calcStats(trades) {
  const completed = trades.filter(t => ["Win","Loss","BE"].includes(t.result));
  const wins = trades.filter(t => t.result === "Win");
  const losses = trades.filter(t => t.result === "Loss");
  const misses = trades.filter(t => t.result === "Miss");

  const totalR = completed.reduce((sum, t) => {
    if (t.result === "Win") return sum + (parseFloat(t.rr) || 0);
    if (t.result === "Loss") return sum - (parseFloat(t.rr) || 0);
    return sum;
  }, 0);

  const winRate = completed.length ? (wins.length / completed.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((s,t) => s + (parseFloat(t.rr)||0), 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s,t) => s + (parseFloat(t.rr)||0), 0) / losses.length : 0;
  const expectancy = winRate/100 * avgWin - (1 - winRate/100) * avgLoss;
  const profitFactor = losses.length && avgLoss > 0
    ? (wins.length * avgWin) / (losses.length * avgLoss)
    : wins.length > 0 ? Infinity : 0;

  const bestTrade = wins.length ? Math.max(...wins.map(t => parseFloat(t.rr)||0)) : 0;
  const worstTrade = losses.length ? Math.max(...losses.map(t => parseFloat(t.rr)||0)) : 0;

  return {
    total: trades.length,
    completed: completed.length,
    wins: wins.length,
    losses: losses.length,
    misses: misses.length,
    totalR: +totalR.toFixed(2),
    winRate: +winRate.toFixed(1),
    avgWin: +avgWin.toFixed(2),
    avgLoss: +avgLoss.toFixed(2),
    expectancy: +expectancy.toFixed(2),
    profitFactor: isFinite(profitFactor) ? +profitFactor.toFixed(2) : "∞",
    bestTrade,
    worstTrade,
  };
}

export function buildEquityCurve(trades) {
  const sorted = [...trades]
    .filter(t => ["Win","Loss","BE"].includes(t.result))
    .sort((a,b) => new Date(a.date) - new Date(b.date));

  let r = 0;
  return [{ date: "Start", r: 0 }, ...sorted.map(t => {
    if (t.result === "Win") r += parseFloat(t.rr) || 0;
    else if (t.result === "Loss") r -= parseFloat(t.rr) || 0;
    return { date: t.date, r: +r.toFixed(2), result: t.result };
  })];
}

export function buildPnLCalendar(trades, month) {
  const start = startOfMonth(parseISO(month + "-01"));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  return days.map(day => {
    const key = format(day, "yyyy-MM-dd");
    const dayTrades = trades.filter(t => t.date === key && ["Win","Loss","BE"].includes(t.result));
    const r = dayTrades.reduce((sum, t) => {
      if (t.result === "Win") return sum + (parseFloat(t.rr)||0);
      if (t.result === "Loss") return sum - (parseFloat(t.rr)||0);
      return sum;
    }, 0);
    return { date: key, day: day.getDate(), r: +r.toFixed(2), count: dayTrades.length, trades: dayTrades };
  });
}

export function buildMonthlyPnL(trades) {
  const map = {};
  trades.filter(t => ["Win","Loss","BE"].includes(t.result)).forEach(t => {
    const m = (t.date || '').slice(0,7); // yyyy-mm
    if (!map[m]) map[m] = 0;
    if (t.result === "Win") map[m] += parseFloat(t.rr)||0;
    else if (t.result === "Loss") map[m] -= parseFloat(t.rr)||0;
  });
  return Object.keys(map).sort().map(k => ({ month: k, r: +map[k].toFixed(2) }));
}

export function buildRDistribution(trades, binSize = 0.5) {
  const vals = trades.filter(t => ["Win","Loss","BE"].includes(t.result)).map(t => {
    const v = parseFloat(t.rr) || 0;
    return t.result === 'Loss' ? -Math.abs(v) : v;
  });
  if (!vals.length) return [];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const start = Math.floor(min / binSize) * binSize;
  const end = Math.ceil(max / binSize) * binSize;
  const bins = [];
  for (let b = start; b <= end; b = +(b + binSize).toFixed(10)) {
    bins.push({ low: b, high: +(b + binSize).toFixed(10), mid: +(b + binSize / 2).toFixed(2), count: 0 });
  }
  vals.forEach(v => {
    const idx = Math.min(bins.length - 1, Math.max(0, Math.floor((v - start) / binSize)));
    bins[idx].count++;
  });
  return bins.map(b => ({ label: `${b.low.toFixed(1)}–${b.high.toFixed(1)}`, count: b.count, mid: b.mid }));
}

export function groupBy(trades, key) {
  const map = {};
  trades.forEach(t => {
    const k = t[key] || "Unknown";
    if (!map[k]) map[k] = { label: k, wins: 0, losses: 0, totalR: 0, count: 0 };
    map[k].count++;
    if (t.result === "Win") { map[k].wins++; map[k].totalR += parseFloat(t.rr)||0; }
    if (t.result === "Loss") { map[k].losses++; map[k].totalR -= parseFloat(t.rr)||0; }
    if (t.result === "BE") {}
  });
  return Object.values(map).map(g => ({
    ...g,
    totalR: +g.totalR.toFixed(2),
    winRate: g.wins + g.losses > 0 ? +((g.wins/(g.wins+g.losses))*100).toFixed(0) : 0
  })).sort((a,b) => b.count - a.count);
}

export function exportCSV(trades) {
  const headers = ["Date","Pair","Session","Setup","Direction","TF","Result","R","Emotion","Notes","MissedReason"];
  const rows = trades.map(t => [
    t.date, t.pair, t.session, t.setup, t.direction, t.tf,
    t.result, t.rr, t.emotion, `"${(t.notes||"").replace(/"/g,'""')}"`,
    `"${(t.missed_reason||"").replace(/"/g,'""')}"`
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `trading-journal-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
}
