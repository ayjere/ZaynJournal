import React from "react";

export default function StatCard({ label, value, sub, color, mono }) {
  return (
    <div style={{
      background: "var(--bg3)", border: "1px solid var(--border)",
      borderRadius: 14, padding: "20px 22px", flex: 1, minWidth: 130,
    }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>{label}</div>
      <div style={{
        fontSize: 28, fontWeight: 800, color: color || "var(--text)",
        fontFamily: mono ? "var(--mono)" : "inherit",
        letterSpacing: -0.5,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
