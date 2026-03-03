import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveVariations, loadVariations } from "../utils/storage";
import AdCard from "../components/AdCard";

const CATEGORIES = {
  pain: "Dolor Primero",
  outcome: "Resultado Primero",
  social: "Prueba Social",
  challenge: "Desafio Directo",
};

const textareaStyle = {
  width: "100%",
  minHeight: "200px",
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontSize: "14px",
  fontFamily: "inherit",
  padding: "12px",
  resize: "vertical",
  marginBottom: "16px",
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

export default function GeneratorPage() {
  const [file, setFile] = useState(null);
  const [content, setContent] = useState("");
  const [variations, setVariations] = useState(loadVariations());
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target.result);
    reader.readAsText(f);
  };

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      saveVariations(data.variations);
      setVariations(data.variations);
      setSelected(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (index) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const handleSendSelected = () => {
    const toSend = variations.filter((_, i) => selected.has(i));
    saveVariations(toSend);
    navigate("/bulk");
  };

  const handleSendAll = () => {
    saveVariations(variations);
    navigate("/bulk");
  };

  const grouped = Object.fromEntries(
    Object.keys(CATEGORIES).map((cat) => [
      cat,
      variations.filter((v) => v.category === cat),
    ])
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>
          Generador IA
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Sube tu investigación de mercado y genera 12 variaciones de anuncios
        </p>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto 32px" }}>
        <label
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
            padding: "14px 28px",
            cursor: "pointer",
          }}
        >
          📁 Subir Archivo
          <input
            type="file"
            accept=".md,.txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {file && (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "13px",
              marginTop: "8px",
            }}
          >
            {file.name}
          </p>
        )}

        {file && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenido del archivo..."
            style={textareaStyle}
          />
        )}

        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !content.trim()}
          style={{
            fontSize: "16px",
            padding: "14px 28px",
            width: "100%",
          }}
        >
          {loading ? (
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginRight: "8px",
                }}
              />
              Generando...
            </span>
          ) : (
            "✨ Generar 12 Variaciones"
          )}
        </button>

        {error && (
          <p
            style={{
              color: "var(--danger)",
              fontSize: "14px",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </div>

      {variations.length > 0 && (
        <>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <div key={key} style={sectionStyle}>
              <h3 style={sectionTitleStyle}>
                {label} ({grouped[key]?.length || 0})
              </h3>
              <div style={gridStyle}>
                {grouped[key]?.map((variation, idx) => {
                  const globalIdx = variations.indexOf(variation);
                  return (
                    <AdCard
                      key={globalIdx}
                      variation={variation}
                      selected={selected.has(globalIdx)}
                      onToggle={() => toggleSelection(globalIdx)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {variations.length > 0 && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "rgba(8,8,13,0.9)",
            backdropFilter: "blur(10px)",
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "32px",
          }}
        >
          <button
            className="btn-primary"
            onClick={handleSendSelected}
            disabled={selected.size === 0}
          >
            📤 Enviar Seleccionados ({selected.size})
          </button>
          <button className="btn-secondary" onClick={handleSendAll}>
            📤 Enviar Todos ({variations.length})
          </button>
        </div>
      )}
    </div>
  );
}
