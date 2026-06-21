import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PAIRS, SETUPS, SESSIONS, RESULTS, DIRECTIONS, EMOTIONS, TIMEFRAMES } from "../utils/constants";
import { format } from "date-fns";

const empty = {
  date: format(new Date(), "yyyy-MM-dd"),
  pair: "XAUUSD", session: "London", setup: "CRT",
  direction: "Long", tf: "1H", result: "Win",
  rr: "", sl: "", tp: "", emotion: "Confident",
  notes: "", missed_reason: "", confluences: "",
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6, fontWeight: 600 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function LogTrade({ trades, onSave }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const [form, setForm] = useState({ ...empty });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editId) {
      const t = trades.find(x => x.id === editId);
      if (t) setForm({ ...t });
    }
  }, [editId, trades]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = k => ({ value: form[k] || "", onChange: e => set(k, e.target.value) });

  function handleSave() {
    if (!form.date || !form.pair) return;
    const trade = {
      ...form,
      id: editId || Date.now().toString(),
      rr: parseFloat(form.rr) || 0,
    };
    onSave(trade, !!editId);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate("/history"); }, 900);
  }

  const isMiss = form.result === "Miss";

  return (
    <div style={{ padding: "28px 32px", maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
          {editId ? "Edit Trade" : "Log Trade"}
        </h1>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>Record your trade details and notes</div>
      </div>

      <div style={{
        background: "var(--bg3)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "28px",
      }}>
        {/* Section: Trade Info */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
            Trade Info
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Field label="Date">
              <input type="date" {...inp("date")} />
            </Field>
            <Field label="Pair">
              <select {...inp("pair")}>
                {PAIRS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Session">
              <select {...inp("session")}>
                {SESSIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Setup">
              <select {...inp("setup")}>
                {SETUPS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Direction">
              <div style={{ display: "flex", gap: 8 }}>
                {DIRECTIONS.map(d => (
                  <button key={d} onClick={() => set("direction", d)} style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid",
                    borderColor: form.direction === d ? (d === "Long" ? "var(--green)" : "var(--red)") : "var(--border2)",
                    background: form.direction === d ? (d === "Long" ? "#10d49622" : "#f43f5e22") : "var(--bg2)",
                    color: form.direction === d ? (d === "Long" ? "var(--green)" : "var(--red)") : "var(--muted)",
                    fontWeight: 700, fontSize: 13,
                  }}>{d === "Long" ? "▲ Long" : "▼ Short"}</button>
                ))}
              </div>
            </Field>
            <Field label="Timeframe">
              <select {...inp("tf")}>
                {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Section: Outcome */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
            Outcome
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Field label="Result">
              <select {...inp("result")}>
                {RESULTS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            {!isMiss && (
              <Field label={form.result === "Loss" ? "R Risked (e.g. 1)" : "R Gained (e.g. 2)"}>
                <input type="number" step="0.1" min="0" placeholder={form.result === "Win" ? "2" : "1"} {...inp("rr")} />
              </Field>
            )}
            {isMiss && (
              <Field label="Why Missed">
                <input type="text" placeholder="Hesitation, not at screen..." {...inp("missed_reason")} />
              </Field>
            )}
            <Field label="Emotion">
              <select {...inp("emotion")}>
                {EMOTIONS.map(e => <option key={e}>{e}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Section: Notes */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
            Notes & Analysis
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Confluences (what confirmed the trade)">
              <textarea rows={3} placeholder="e.g. HTF OB + FVG + session kill zone..." {...inp("confluences")} style={{ resize: "vertical" }} />
            </Field>
            <Field label="Trade Notes / Lessons">
              <textarea rows={3} placeholder="Execution quality, emotions, what you'd do differently..." {...inp("notes")} style={{ resize: "vertical" }} />
            </Field>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleSave} style={{
            padding: "12px 32px", borderRadius: 10, border: "none",
            background: saved ? "var(--green)" : "linear-gradient(135deg, #6366f1, #818cf8)",
            color: "#fff", fontWeight: 700, fontSize: 14,
            transition: "all 0.2s", minWidth: 160,
          }}>
            {saved ? "✓ Saved!" : editId ? "Update Trade" : "Save Trade"}
          </button>
          <button onClick={() => navigate(-1)} style={{
            padding: "12px 24px", borderRadius: 10,
            border: "1px solid var(--border2)", background: "transparent",
            color: "var(--muted)", fontSize: 14,
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
