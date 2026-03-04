import { useRef, useState, useEffect } from "react";
import AdCanvas from "./AdCanvas";

const CATEGORY_COLORS = {
  pain: { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171", border: "rgba(239, 68, 68, 0.25)" },
  outcome: { bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80", border: "rgba(34, 197, 94, 0.25)" },
  social: { bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.25)" },
  challenge: { bg: "rgba(249, 115, 22, 0.12)", text: "#fb923c", border: "rgba(249, 115, 22, 0.25)" },
};

const CATEGORY_LABELS = {
  pain: "Dolor",
  outcome: "Resultado",
  social: "Social",
  challenge: "Desafío",
};

export default function AdCard({ variation, selected, onToggle, readOnly = false }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Usar requestAnimationFrame para evitar errores de ResizeObserver loop limit exceeded
    const observer = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
        const w = entries[0].contentRect.width;
        if (w > 0) {
          setScale(w / 1080);
        }
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cardClasses = ["ad-card", selected && "ad-card--selected", readOnly && "ad-card--readonly"]
    .filter(Boolean)
    .join(" ");

  const cat = CATEGORY_COLORS[variation.category] || CATEGORY_COLORS.pain;
  const catLabel = CATEGORY_LABELS[variation.category] || variation.category;

  return (
    <div className={cardClasses} onClick={!readOnly ? onToggle : undefined}>
      {/* ─── Full-width preview ─── */}
      <div className="ad-card__preview" ref={containerRef}>
        <div
          className="ad-card__preview-inner"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          <AdCanvas {...variation} />
        </div>
      </div>

      {/* ─── Card info bar ─── */}
      <div className="ad-card__info">
        <div className="ad-card__info-left">
          {!readOnly && (
            <input
              type="checkbox"
              className="ad-card__checkbox"
              checked={selected}
              onChange={onToggle}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Seleccionar variación ${variation.category}`}
            />
          )}
          <span
            className="ad-card__badge"
            style={{
              background: cat.bg,
              color: cat.text,
              borderColor: cat.border,
            }}
          >
            {catLabel}
          </span>
        </div>
      </div>

      {/* ─── Headline truncated ─── */}
      <p className="ad-card__headline">
        {variation.headlineStart}{" "}
        <span style={{ color: variation.accent || "var(--accent)" }}>
          {variation.headlineHighlight}
        </span>
      </p>
    </div>
  );
}
