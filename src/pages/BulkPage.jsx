import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { loadVariations, clearVariations } from "../utils/storage";
import AdCanvas from "../components/AdCanvas";

const CATEGORIES = {
  pain: "Dolor Primero",
  outcome: "Resultado Primero",
  social: "Prueba Social",
  challenge: "Desafío Directo",
};

export default function BulkPage() {
  const [variations] = useState(loadVariations);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  const canvasRefs = useRef([]);

  useEffect(() => {
    canvasRefs.current = [];
  }, []);

  const handleDownloadZip = async () => {
    setExporting(true);
    const zip = new JSZip();
    for (let i = 0; i < variations.length; i++) {
      if (!canvasRefs.current[i]) continue;
      try {
        const dataUrl = await toPng(canvasRefs.current[i], { pixelRatio: 1 });
        const base64 = dataUrl.split(",")[1];
        const { category } = variations[i];
        zip.file(`${category}_${String(i + 1).padStart(2, "0")}.png`, base64, {
          base64: true,
        });
      } catch (err) {
        console.error(`Error exporting variation ${i}:`, err);
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `anuncios_${Date.now()}.zip`);
    setExporting(false);
  };

  const handleClear = () => {
    if (
      window.confirm(
        "¿Estás seguro? Esto borrará todas las variaciones guardadas."
      )
    ) {
      clearVariations();
      navigate("/generate");
    }
  };

  if (variations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          No hay variaciones cargadas
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            margin: "0 0 28px",
            fontSize: "14px",
            lineHeight: 1.5,
          }}
        >
          Primero genera anuncios en el Generador IA y envíalos aquí.
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate("/generate")}
          style={{ padding: "12px 28px", fontSize: "14px" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "6px", verticalAlign: "middle" }}
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Ir al Generador IA
        </button>
      </div>
    );
  }

  const grouped = Object.fromEntries(
    Object.keys(CATEGORIES).map((cat) => [
      cat,
      variations.filter((v) => v.category === cat),
    ])
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* ─── Header ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "36px",
          animation: "fadeInUp 400ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 800,
              marginBottom: "6px",
              letterSpacing: "-0.02em",
            }}
          >
            Generador Masivo
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 700,
              }}
            >
              {variations.length}
            </span>{" "}
            variaciones listas para exportar
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-primary"
            onClick={handleDownloadZip}
            disabled={exporting}
            style={{ padding: "10px 20px", fontSize: "14px" }}
          >
            {exporting ? (
              <span>
                <span className="spinner" />
                Exportando...
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Descargar ZIP
              </span>
            )}
          </button>
          <button
            className="btn-danger"
            onClick={handleClear}
            style={{ padding: "10px 20px", fontSize: "14px" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px", verticalAlign: "middle" }}
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Limpiar
          </button>
        </div>
      </div>

      {/* ─── Variations Grid ─── */}
      {Object.entries(CATEGORIES).map(([key, label]) => {
        const items = grouped[key] || [];
        if (items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: "36px" }}>
            <div className="section-heading">
              <h3 className="section-heading__title">{label}</h3>
              <span className="section-heading__count">{items.length}</span>
              <div className="section-heading__line" />
            </div>
            <div className="cards-grid">
              {items.map((variation) => {
                const globalIdx = variations.indexOf(variation);
                return (
                  <div
                    key={globalIdx}
                    className="ad-card"
                    style={{ padding: 0, cursor: "default" }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        overflow: "hidden",
                        borderRadius: "var(--radius-md, 12px)",
                      }}
                    >
                      <AdCanvas
                        {...variation}
                        ref={(el) => (canvasRefs.current[globalIdx] = el)}
                      />
                    </div>
                    <div
                      style={{
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {variation.category}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          fontWeight: 500,
                        }}
                      >
                        #{String(globalIdx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ─── Hidden canvases for export ─── */}
      <div style={{ position: "absolute", left: -9999, top: 0 }}>
        {variations.map((variation, i) => (
          <div key={i} ref={(el) => (canvasRefs.current[i] = el)}>
            <AdCanvas {...variation} />
          </div>
        ))}
      </div>
    </div>
  );
}
