import { useState } from "react";
import { PASSWORD, AUTH_KEY } from "../utils/constants";

export default function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit() {
    if (pw === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)",
      backgroundImage: "radial-gradient(ellipse at 50% 0%, #1a1a3e 0%, transparent 60%)",
    }}>
      <div style={{
        width: 360, padding: "44px 40px",
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        animation: shake ? "shake 0.4s ease" : "none",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #6366f1, #10d496)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 16px",
          }}>📈</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
            Trading Journal
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Enter your password to continue</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              fontSize: 15, padding: "12px 16px",
              borderColor: error ? "var(--red)" : undefined,
            }}
            autoFocus
          />
          {error && (
            <div style={{ color: "var(--red)", fontSize: 12, marginTop: 6, paddingLeft: 4 }}>
              Incorrect password. Try again.
            </div>
          )}
        </div>

        <button onClick={handleSubmit} style={{
          width: "100%", padding: "13px",
          background: "linear-gradient(135deg, #6366f1, #818cf8)",
          border: "none", borderRadius: 10,
          color: "#fff", fontWeight: 700, fontSize: 15,
          letterSpacing: 0.3,
          transition: "opacity 0.15s",
        }}>
          Enter Journal
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}
