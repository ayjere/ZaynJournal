import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { STORAGE_KEY, AUTH_KEY } from "./utils/constants";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import LogTrade from "./pages/LogTrade";
import History from "./pages/History";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";

export default function App() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(AUTH_KEY));
  const [trades, setTrades] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  function handleSave(trade, isEdit) {
    setTrades(prev => isEdit
      ? prev.map(t => t.id === trade.id ? trade : t)
      : [trade, ...prev]
    );
  }

  function handleDelete(id) {
    setTrades(prev => prev.filter(t => t.id !== id));
  }

  function seedSampleData() {
    const sample = [
      {
        id: Date.now().toString(), date: format(new Date(), "yyyy-MM-dd"), pair: "EURUSD",
        session: "London", setup: "CRT", direction: "Long", tf: "1H", result: "Win",
        rr: 1.8, emotion: "Confident", notes: "Sample winning trade", missed_reason: "", confluences: "HTF OB"
      },
      {
        id: (Date.now()+1).toString(), date: format(new Date(), "yyyy-MM-dd"), pair: "XAUUSD",
        session: "New York", setup: "FVG", direction: "Short", tf: "4H", result: "Loss",
        rr: 1.0, emotion: "Nervous", notes: "Sample losing trade", missed_reason: "", confluences: "Liquidity Grab"
      }
    ];
    setTrades(prev => [...sample, ...prev]);
  }

  function clearAllData() {
    if (!window.confirm("Clear all trades? This cannot be undone.")) return;
    setTrades([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar onLogout={handleLogout} onSeedData={seedSampleData} onClearData={clearAllData} />
        <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh", background: "var(--bg)" }}>
          <Routes>
            <Route path="/" element={<Dashboard trades={trades} />} />
            <Route path="/log" element={<LogTrade trades={trades} onSave={handleSave} />} />
            <Route path="/history" element={<History trades={trades} onDelete={handleDelete} />} />
            <Route path="/calendar" element={<Calendar trades={trades} />} />
            <Route path="/analytics" element={<Analytics trades={trades} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
