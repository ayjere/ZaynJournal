import { NavLink } from "react-router-dom";
import { AUTH_KEY } from "../utils/constants";

const links = [
  { to: "/", icon: "⬛", label: "Dashboard" },
  { to: "/log", icon: "✚", label: "Log Trade" },
  { to: "/history", icon: "☰", label: "History" },
  { to: "/calendar", icon: "◫", label: "Calendar" },
  { to: "/analytics", icon: "◈", label: "Analytics" },
];

export default function Sidebar({ onLogout, onSeedData, onClearData }) {
  return (
    <aside style={{
      width: 220, minHeight: "100vh",
      background: "var(--bg2)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg, #6366f1, #10d496)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>📈</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: -0.3 }}>Genius</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Trading Journal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 9,
              marginBottom: 2,
              textDecoration: "none",
              color: isActive ? "var(--text)" : "var(--muted)",
              background: isActive ? "var(--bg3)" : "transparent",
              fontWeight: isActive ? 600 : 400,
              fontSize: 13,
              transition: "all 0.12s",
              borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
            })}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Dev actions + Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)", display: "grid", gap: 8 }}>
        {onSeedData && (
          <button onClick={onSeedData} style={{ padding: "8px", borderRadius: 8, border: "1px dashed var(--border2)", background: "transparent", color: "var(--muted)", fontSize: 13 }}>Seed Data</button>
        )}
        {onClearData && (
          <button onClick={onClearData} style={{ padding: "8px", borderRadius: 8, border: "1px dashed var(--border2)", background: "transparent", color: "var(--muted)", fontSize: 13 }}>Clear Data</button>
        )}
        <button onClick={onLogout} style={{
          width: "100%", padding: "9px 12px",
          background: "transparent", border: "1px solid var(--border2)",
          borderRadius: 9, color: "var(--muted)", fontSize: 13,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>⏻</span> Lock Journal
        </button>
      </div>
    </aside>
  );
}
