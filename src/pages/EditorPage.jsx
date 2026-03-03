import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import AdCanvas from "../components/AdCanvas";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontSize: "14px",
  fontFamily: "inherit",
  marginBottom: "16px",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: "6px",
};

export default function EditorPage() {
  const [ad, setAd] = useState({
    bg: "#0a0a0f",
    accent: "#6366f1",
    badge: "🚀 Nuevo",
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
    <div style={{ display: "flex", gap: "40px", height: "100%" }}>
      <div style={{ width: "340px", flexShrink: 0 }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          Editor de Plantilla
        </h2>

        <label style={labelStyle}>Color de fondo</label>
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
            marginBottom: "16px",
          }}
        />

        <label style={labelStyle}>Color de acento</label>
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
            marginBottom: "16px",
          }}
        />

        <label style={labelStyle}>Badge</label>
        <input
          type="text"
          value={ad.badge}
          onChange={(e) => setAd({ ...ad, badge: e.target.value })}
          style={inputStyle}
        />

        <label style={labelStyle}>Titular (parte 1)</label>
        <input
          type="text"
          value={ad.headlineStart}
          onChange={(e) => setAd({ ...ad, headlineStart: e.target.value })}
          style={inputStyle}
        />

        <label style={labelStyle}>Titular (highlight)</label>
        <input
          type="text"
          value={ad.headlineHighlight}
          onChange={(e) =>
            setAd({ ...ad, headlineHighlight: e.target.value })
          }
          style={inputStyle}
        />

        <label style={labelStyle}>Subtexto</label>
        <textarea
          value={ad.subtext}
          onChange={(e) => setAd({ ...ad, subtext: e.target.value })}
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
        />

        <label style={labelStyle}>Frases en negrita (separadas por coma)</label>
        <input
          type="text"
          value={boldInput}
          onChange={(e) => handleBoldChange(e.target.value)}
          style={inputStyle}
        />

        <button
          className="btn-primary"
          onClick={handleExport}
          style={{ width: "100%", marginTop: "8px" }}
        >
          📥 Exportar PNG
        </button>
      </div>

      <div
        style={{
          flex: 1,
          background: "var(--bg-card)",
          borderRadius: "12px",
          padding: "24px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <div
          style={{
            transform: "scale(0.5)",
            transformOrigin: "top left",
            width: "1080px",
            height: "1080px",
            overflow: "hidden",
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
