import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import AdCanvas from "../components/AdCanvas";

export default function EditorPage() {
  const [ad, setAd] = useState({
    bg: "#0a0a0f",
    accent: "#6366f1",
    badge: "Nuevo",
    headlineStart: "Deja de",
    headlineHighlight: "perder tiempo",
    subtext: "La solución que necesitas para escalar tu negocio sin estrés.",
    boldPhrases: ["escalar tu negocio", "sin estrés"],
  });

  const [boldInput, setBoldInput] = useState(
    "escalar tu negocio, sin estrés"
  );

  const canvasRef = useRef(null);

  const handleBoldChange = (value) => {
    setBoldInput(value);
    const phrases = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setAd((prev) => ({ ...prev, boldPhrases: phrases }));
  };

  const handleExport = async () => {
    try {
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 1 });
      const link = document.createElement("a");
      link.download = "anuncio.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error exportando:", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: "32px", height: "100%" }}>
      {/* ─── Panel de edición ─── */}
      <div
        style={{
          width: "320px",
          flexShrink: 0,
          animation: "fadeInUp 400ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          Editor de Plantilla
        </h2>

        <label className="input-label">Color de fondo</label>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input
            type="color"
            value={ad.bg}
            onChange={(e) => setAd({ ...ad, bg: e.target.value })}
            style={{
              width: "100%",
              height: "40px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              background: "var(--bg-card)",
              padding: "4px",
            }}
          />
        </div>

        <label className="input-label">Color de acento</label>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input
            type="color"
            value={ad.accent}
            onChange={(e) => setAd({ ...ad, accent: e.target.value })}
            style={{
              width: "100%",
              height: "40px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              background: "var(--bg-card)",
              padding: "4px",
            }}
          />
        </div>

        <label className="input-label">Badge</label>
        <input
          type="text"
          className="input-field"
          value={ad.badge}
          onChange={(e) => setAd({ ...ad, badge: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <label className="input-label">Titular (parte 1)</label>
        <input
          type="text"
          className="input-field"
          value={ad.headlineStart}
          onChange={(e) => setAd({ ...ad, headlineStart: e.target.value })}
          style={{ marginBottom: "16px" }}
        />

        <label className="input-label">Titular (highlight)</label>
        <input
          type="text"
          className="input-field"
          value={ad.headlineHighlight}
          onChange={(e) =>
            setAd({ ...ad, headlineHighlight: e.target.value })
          }
          style={{ marginBottom: "16px" }}
        />

        <label className="input-label">Subtexto</label>
        <textarea
          className="input-field"
          value={ad.subtext}
          onChange={(e) => setAd({ ...ad, subtext: e.target.value })}
          style={{ marginBottom: "16px", minHeight: "80px", resize: "vertical" }}
        />

        <label className="input-label">
          Frases en negrita (separadas por coma)
        </label>
        <input
          type="text"
          className="input-field"
          value={boldInput}
          onChange={(e) => handleBoldChange(e.target.value)}
          style={{ marginBottom: "20px" }}
        />

        <button
          className="btn-primary"
          onClick={handleExport}
          style={{ width: "100%", padding: "12px 20px", fontSize: "14px" }}
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
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar PNG
        </button>
      </div>

      {/* ─── Preview del anuncio ─── */}
      <div
        style={{
          flex: 1,
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          overflow: "auto",
          animation: "fadeInUp 500ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            transform: "scale(0.5)",
            transformOrigin: "top left",
            width: "1080px",
            height: "1080px",
            overflow: "hidden",
            borderRadius: "12px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ width: "1080px", height: "1080px" }}>
            <AdCanvas ref={canvasRef} {...ad} />
          </div>
        </div>
      </div>
    </div>
  );
}
