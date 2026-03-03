import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        gap: "8px",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(8,8,13,0.8)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <span
        style={{
          color: "var(--text-primary)",
          fontWeight: 700,
          marginRight: "auto",
        }}
      >
        🎯 AdGen
      </span>
      {[
        { to: "/", label: "Editor" },
        { to: "/generate", label: "Generador IA" },
        { to: "/bulk", label: "Generador Masivo" },
      ].map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          style={({ isActive }) => ({
            color: isActive ? "var(--accent)" : "var(--text-secondary)",
            textDecoration: "none",
            fontWeight: 500,
            padding: "6px 14px",
            borderRadius: "6px",
            background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
            transition: "all 0.15s",
          })}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
