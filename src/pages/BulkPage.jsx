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
  challenge: "Desafio Directo",
};

const sectionStyle = {
  marginBottom: "32px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: 600,
  color: "var(--text-primary)",
  marginBottom: "16px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
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
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>📭</div>
        <h2>No hay variaciones cargadas</h2>
        <p style={{ color: "var(--text-secondary)", margin: "12px 0 24px" }}>
          Primero genera anuncios en el Generador IA y envíalos aquí.
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate("/generate")}
        >
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>
            Generador Masivo
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            {variations.length} variaciones listas para exportar
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn-primary"
            onClick={handleDownloadZip}
            disabled={exporting}
            style={{ fontSize: "16px", padding: "12px 24px" }}
          >
            {exporting ? "⏳ Exportando..." : "⬇️ Descargar Todas como ZIP"}
          </button>
          <button
            className="btn-danger"
            onClick={handleClear}
            style={{ fontSize: "16px", padding: "12px 24px" }}
          >
            🗑️ Limpiar Variaciones
          </button>
        </div>
      </div>

      {Object.entries(CATEGORIES).map(([key, label]) => (
        <div key={key} style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            {label} ({grouped[key]?.length || 0})
          </h3>
          <div style={gridStyle}>
            {grouped[key]?.map((variation, idx) => {
              const globalIdx = variations.indexOf(variation);
              return (
                <div key={globalIdx}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      overflow: "hidden",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <AdCanvas
                      {...variation}
                      ref={(el) => (canvasRefs.current[globalIdx] = el)}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      textTransform: "capitalize",
                    }}
                  >
                    {variation.category}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
        }}
      >
        {variations.map((variation, i) => (
          <div key={i} ref={(el) => (canvasRefs.current[i] = el)}>
            <AdCanvas {...variation} />
          </div>
        ))}
      </div>
    </div>
  );
}
