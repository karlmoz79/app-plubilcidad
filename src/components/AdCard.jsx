import AdCanvas from "./AdCanvas";

export default function AdCard({ variation, selected, onToggle, scale = 0.2 }) {
  return (
    <div
      onClick={onToggle}
      style={{
        border: selected
          ? "2px solid var(--border-selected)"
          : "1px solid var(--border)",
        background: selected ? "var(--bg-selected)" : "var(--bg-card)",
        borderRadius: "12px",
        padding: "12px",
        cursor: "pointer",
        transition: "all 0.15s",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 1080 * scale,
          height: 1080 * scale,
          overflow: "hidden",
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: 1080,
            height: 1080,
          }}
        >
          <AdCanvas {...variation} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
        <span
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            textTransform: "capitalize",
          }}
        >
          {variation.category}
        </span>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 4,
          lineHeight: 1.3,
        }}
      >
        {variation.headlineStart} {variation.headlineHighlight}
      </p>
    </div>
  );
}
