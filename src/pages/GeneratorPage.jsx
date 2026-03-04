import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveVariations, loadVariations } from "../utils/storage";
import AdCard from "../components/AdCard";

const CATEGORIES = {
  pain: "Dolor Primero",
  outcome: "Resultado Primero",
  social: "Prueba Social",
  challenge: "Desafío Directo",
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
      {/* ─── Header ─── */}
      <div className="page-header">
        <h2 className="page-header__title">Generador IA</h2>
        <p className="page-header__subtitle">
          Sube tu investigación de mercado y genera 12 variaciones de anuncios
        </p>
      </div>

      {/* ─── Upload Area ─── */}
      <div style={{ maxWidth: "560px", margin: "0 auto 40px" }}>
        <label className="upload-area" style={{ display: "block" }}>
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 12px",
              borderRadius: 12,
              background: "rgba(99, 102, 241, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            {file ? file.name : "Arrastra o haz clic para subir"}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Archivos .md o .txt
          </div>
          <input
            type="file"
            accept=".md,.txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {file && (
          <textarea
            className="input-field"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenido del archivo..."
            style={{
              minHeight: "180px",
              resize: "vertical",
              marginBottom: "16px",
            }}
          />
        )}

        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !content.trim()}
          style={{
            fontSize: "15px",
            padding: "14px 28px",
            width: "100%",
          }}
        >
          {loading ? (
            <span>
              <span className="spinner" />
              Generando variaciones...
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Generar 12 Variaciones
            </span>
          )}
        </button>

        {error && (
          <div
            style={{
              color: "var(--danger)",
              fontSize: "13px",
              marginTop: "12px",
              textAlign: "center",
              padding: "10px 16px",
              background: "rgba(239, 68, 68, 0.08)",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* ─── Variations Grid ─── */}
      {variations.length > 0 && (
        <>
          {Object.entries(CATEGORIES).map(([key, label]) => {
            const items = grouped[key] || [];
            if (items.length === 0) return null;
            return (
              <div key={key} style={{ marginBottom: "36px" }}>
                <div className="section-heading">
                  <h3 className="section-heading__title">{label}</h3>
                  <span className="section-heading__count">
                    {items.length}
                  </span>
                  <div className="section-heading__line" />
                </div>
                <div className="cards-grid">
                  {items.map((variation) => {
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
            );
          })}
        </>
      )}

      {/* ─── Action Bar ─── */}
      {variations.length > 0 && (
        <div className="action-bar">
          <button
            className="btn-primary"
            onClick={handleSendSelected}
            disabled={selected.size === 0}
            style={{ padding: "10px 24px" }}
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Enviar Seleccionados ({selected.size})
          </button>
          <button
            className="btn-secondary"
            onClick={handleSendAll}
            style={{ padding: "10px 24px" }}
          >
            Enviar Todos ({variations.length})
          </button>
        </div>
      )}
    </div>
  );
}
