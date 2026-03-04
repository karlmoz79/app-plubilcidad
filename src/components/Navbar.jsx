import { NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Editor" },
  { to: "/generate", label: "Generador IA" },
  { to: "/bulk", label: "Generador Masivo" },
];

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "14px 24px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(8, 8, 13, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginRight: "auto",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span
          style={{
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "-0.01em",
          }}
        >
          AdGen
        </span>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            style={({ isActive }) => ({
              color: isActive ? "#fff" : "var(--text-secondary)",
              textDecoration: "none",
              fontWeight: isActive ? 600 : 500,
              fontSize: "13px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: isActive
                ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(124,58,237,0.15))"
                : "transparent",
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
