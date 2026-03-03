# Plan de Implementación: App Generadora de Anuncios para Redes Sociales

> **Para Claude:** SUB-SKILL REQUERIDA: Usa `skill-executing-plans` para implementar este plan tarea por tarea.

**Objetivo:** Construir una aplicación React + Vite que genere variaciones de anuncios 1080×1080 para redes sociales usando IA, con editor visual, generación masiva y exportación ZIP de PNGs.

**Arquitectura:** SPA con React Router de 3 páginas (`/`, `/generate`, `/bulk`), Vercel Serverless Function en `api/generate.js` que actúa como proxy seguro hacia la API de Gemini. El estado de variaciones generadas persiste en `localStorage`. La exportación de imágenes usa `html-to-image` + `JSZip`.

**Tech Stack:** React 18 · React Router v6 · Vite · html-to-image · JSZip · file-saver · Vercel Serverless Functions · Google Gemini API (gemini-2.0-flash) · CSS Variables (sin frameworks CSS)

---

## CONTEXTO

Esta app es una herramienta interna para **creadores de publicidad en redes sociales** que quieren acelerar la producción de variaciones de anuncios a partir de investigación de mercado (archivos `.md` o `.txt` de Perplexity, Reddit, etc.). Todo el texto de la interfaz debe estar en **español**.

---

## RESTRICCIONES GLOBALES (Hard Constraints)

- **Seguridad:** La `GEMINI_API_KEY` **NUNCA** se expone en el frontend. Siempre viaja exclusivamente a través de `api/generate.js`.
- **Idioma:** 100% de la UI en español. Sin inglés visible al usuario final.
- **Sin frameworks CSS:** Usar CSS puro con Custom Properties (variables) para el design system. No Tailwind, no Bootstrap.
- **Fuente:** `Inter` (Google Fonts). Esta es la única excepción permitida al mandato de fuentes no genéricas, ya que el brief del cliente la especifica explícitamente.
- **Canvas fijo:** El anuncio siempre renderiza a 1080×1080 px independiente del viewport.
- **Persistencia:** Las variaciones generadas sobreviven navegación mediante `localStorage`.
- **Despliegue:** La app debe deployarse en Vercel sin configuración adicional de su parte.

---

## DESIGN SYSTEM (Aplicado a toda la app)

### Paleta de colores

```css
:root {
  /* Fondos */
  --bg-app: #08080d;
  --bg-card: rgba(255, 255, 255, 0.04);
  --bg-card-hover: rgba(255, 255, 255, 0.07);
  --bg-selected: rgba(99, 102, 241, 0.12);

  /* Texto */
  --text-primary: #f0f0f5;
  --text-secondary: #9393a8;
  --text-muted: #555568;

  /* Acento global del dashboard */
  --accent: #6366f1; /* Indigo */
  --accent-hover: #818cf8;
  --danger: #ef4444;
  --danger-hover: #f87171;

  /* Bordes */
  --border: rgba(255, 255, 255, 0.08);
  --border-selected: rgba(99, 102, 241, 0.6);

  /* Anuncio base (overrideable por variacion) */
  --ad-bg: #0a0a0f;
  --ad-accent: #6366f1;
}
```

### Tipografía

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");
body {
  font-family: "Inter", sans-serif;
}
```

### Especificación del Anuncio 1080×1080

El anuncio renderiza en un `div` de exactamente `1080px × 1080px` con:

- `background-color`: `var(--ad-bg)` + pseudo-elemento `::before` con textura de ruido SVG (opacity 0.03).
- Gradiente radial sutil: `radial-gradient(ellipse 60% 60% at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 100%)`.
- **Badge** (parte superior, centrado): pastilla con borde 1px de `var(--ad-accent)`, fondo semitransparente, texto en `var(--ad-accent)`.
- **Titular** (centrado): dos líneas — primera en `var(--text-primary)`, segunda (highlight) en `var(--ad-accent)`. Tamaño ~96px, `font-weight: 900`.
- **Subtexto**: `font-size: 28px`, `var(--text-secondary)`. Las `boldPhrases` se envuelven en `<strong>` con `color: var(--text-primary)`.
- **Mockup**: placeholder esquina inferior izquierda.
- **Logo + URL**: esquina inferior derecha.

---

## TAREA 1: Scaffolding del Proyecto

**Archivos:**

- Inicializar: `./` con Vite + React

**Paso 1: Inicializar el proyecto**

```bash
npx -y create-vite@latest ./ --template react
```

Esperado: estructura estándar Vite React creada en el directorio actual.

**Paso 2: Instalar dependencias**

```bash
npm install react-router-dom html-to-image jszip file-saver @google/generative-ai
```

Esperado: `package.json` actualizado, `node_modules/` creado.

**Paso 3: Limpiar boilerplate**

- Eliminar: `src/App.css`, `src/assets/react.svg`, `public/vite.svg`
- Vaciar contenido de: `src/App.jsx`
- Actualizar `index.html`: añadir link a Google Fonts de Inter, limpiar favicon.

**Paso 4: Crear estructura de carpetas**

```
src/
  pages/
    EditorPage.jsx
    GeneratorPage.jsx
    BulkPage.jsx
  components/
    AdCanvas.jsx
    AdCard.jsx
    Navbar.jsx
  styles/
    global.css
    ad.css
  utils/
    storage.js
    exportHelpers.js
  App.jsx
  main.jsx
api/
  generate.js
vercel.json
.gitignore          (agregar .env.local, node_modules, dist)
```

**Paso 5: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffolding inicial del proyecto"
```

---

## TAREA 2: Design System Global (CSS)

**Archivos:**

- Crear: `src/styles/global.css`
- Crear: `src/styles/ad.css`
- Modificar: `src/main.jsx` (importar `./styles/global.css`)

**Paso 1: Crear `src/styles/global.css`**

Contenido obligatorio en este orden:

1. `@import` Google Fonts (Inter)
2. Variables CSS del design system (ver sección DESIGN SYSTEM arriba, copiar exacto)
3. Reset CSS: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
4. `body`: `font-family: 'Inter'`, `background: var(--bg-app)`, `color: var(--text-primary)`, `min-height: 100vh`
5. Clases de botones:

```css
.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: var(--accent-hover);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: transparent;
  color: var(--danger);
  border: 1.5px solid var(--danger);
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-danger:hover {
  background: var(--danger);
  color: #fff;
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-secondary:hover {
  background: var(--bg-card-hover);
}
```

6. Layout del dashboard: `#root` con `display: flex; flex-direction: column; min-height: 100vh`.

**Paso 2: Verificación**
Importar en `main.jsx` y ejecutar `npm run dev`. Confirmar fondo `#08080d`.

**Paso 3: Commit**

```bash
git add src/styles/global.css src/main.jsx && git commit -m "feat: design system global CSS"
```

---

## TAREA 3: Navbar y Enrutamiento

**Archivos:**

- Crear: `src/components/Navbar.jsx`
- Crear/Modificar: `src/App.jsx`

**Paso 1: `src/components/Navbar.jsx`**

```jsx
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
```

**Paso 2: `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import EditorPage from "./pages/EditorPage";
import GeneratorPage from "./pages/GeneratorPage";
import BulkPage from "./pages/BulkPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flex: 1, padding: "24px" }}>
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/bulk" element={<BulkPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
```

**Paso 3: Verificación**
Navegar entre las 3 rutas y confirmar que el link activo se resalta en `--accent`.

**Paso 4: Commit**

```bash
git add src/App.jsx src/components/Navbar.jsx && git commit -m "feat: navbar y enrutamiento"
```

---

## TAREA 4: Componente `AdCanvas`

**Archivos:**

- Crear: `src/components/AdCanvas.jsx`
- Crear: `src/styles/ad.css`

**Paso 1: `src/styles/ad.css`**

```css
.ad-canvas {
  width: 1080px;
  height: 1080px;
  background-color: var(--ad-bg, #0a0a0f);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  gap: 32px;
}

.ad-canvas::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

.ad-canvas::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 60% 60% at 50% 40%,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 100%
  );
  pointer-events: none;
}

.ad-badge {
  border: 1px solid var(--ad-accent, #6366f1);
  background: rgba(99, 102, 241, 0.08);
  color: var(--ad-accent, #6366f1);
  padding: 8px 20px;
  border-radius: 100px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.02em;
  z-index: 1;
}

.ad-headline {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  line-height: 1.05;
  z-index: 1;
}

.ad-headline-start {
  font-size: 96px;
  font-weight: 900;
  color: #f0f0f5;
}

.ad-headline-highlight {
  font-size: 96px;
  font-weight: 900;
  color: var(--ad-accent, #6366f1);
}

.ad-subtext {
  font-size: 28px;
  color: #9393a8;
  text-align: center;
  max-width: 860px;
  line-height: 1.5;
  z-index: 1;
}

.ad-footer {
  position: absolute;
  bottom: 60px;
  left: 60px;
  right: 60px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 1;
}

.ad-mockup {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 18px;
}

.ad-logo {
  text-align: right;
  color: rgba(255, 255, 255, 0.3);
  font-size: 20px;
  font-weight: 600;
}
```

**Paso 2: `src/components/AdCanvas.jsx`**

```jsx
import { forwardRef } from "react";
import "../styles/ad.css";

const AdCanvas = forwardRef(
  (
    {
      bg,
      accent,
      badge,
      headlineStart,
      headlineHighlight,
      subtext,
      boldPhrases = [],
    },
    ref,
  ) => {
    const renderSubtext = () => {
      let result = subtext || "";
      boldPhrases.forEach((phrase) => {
        if (phrase) {
          result = result.replace(
            new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
            `<strong style="color:#f0f0f5">${phrase}</strong>`,
          );
        }
      });
      return { __html: result };
    };

    return (
      <div
        ref={ref}
        className="ad-canvas"
        style={{ "--ad-bg": bg, "--ad-accent": accent }}
      >
        <div className="ad-canvas-noise" />
        {badge && <div className="ad-badge">{badge}</div>}
        <div className="ad-headline">
          <span className="ad-headline-start">{headlineStart}</span>
          <span className="ad-headline-highlight">{headlineHighlight}</span>
        </div>
        <p className="ad-subtext" dangerouslySetInnerHTML={renderSubtext()} />
        <div className="ad-footer">
          <div className="ad-mockup">Mockup</div>
          <div className="ad-logo">
            <div>🎯 AdGen</div>
            <div style={{ fontSize: 16, opacity: 0.6 }}>adgen.app</div>
          </div>
        </div>
      </div>
    );
  },
);

AdCanvas.displayName = "AdCanvas";
export default AdCanvas;
```

**Paso 3: Verificación**
Instanciar `<AdCanvas>` con props de prueba en una página temporal y confirmar que renderiza 1080×1080.

**Paso 4: Commit**

```bash
git add src/components/AdCanvas.jsx src/styles/ad.css && git commit -m "feat: componente AdCanvas 1080x1080"
```

---

## TAREA 5: Página `/` — Editor de Plantilla

**Archivo:** `src/pages/EditorPage.jsx`

**Paso 1: Estado inicial del editor**

```javascript
const [ad, setAd] = useState({
  bg: "#0a0a0f",
  accent: "#6366f1",
  badge: "🚀 Nuevo",
  headlineStart: "Deja de",
  headlineHighlight: "perder tiempo",
  subtext: "La solución que necesitas para escalar tu negocio sin estrés.",
  boldPhrases: ["escalar tu negocio", "sin estrés"],
});
```

**Paso 2: Layout del editor — dos columnas**

- **Col izquierda (controles):** inputs para cada campo del anuncio. `boldPhrases` como textarea donde el usuario escribe frases separadas por coma, que se parsea al cambiar (`value.split(',').map(s => s.trim())`).
- **Col derecha (preview):** `<AdCanvas>` con todas las props de `ad`, escalado visualmente al 50% via `transform: scale(0.5); transform-origin: top left;` dentro de un wrapper con `overflow: hidden`.

**Paso 3: Exportación PNG**

```javascript
import { toPng } from "html-to-image";
import { useRef } from "react";

const canvasRef = useRef(null);

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
```

**Paso 4: Verificación**

- Cambiar color de acento y verificar que el preview se actualiza en tiempo real.
- Hacer click en "Exportar PNG" y verificar que descarga un archivo de 1080×1080.

**Paso 5: Commit**

```bash
git add src/pages/EditorPage.jsx && git commit -m "feat: página editor con preview en tiempo real y exportación PNG"
```

---

## TAREA 6: Función Serverless `api/generate.js` (Gemini)

**Archivo:** `api/generate.js`

> **Nota sobre el SDK:** La función usa `@google/generative-ai` (ya instalado en Tarea 1) importado con `require` (CommonJS) porque las Vercel Serverless Functions se ejecutan en Node.js sin ESM por defecto. Se usa el modelo `gemini-2.0-flash` por su velocidad y bajo costo, ideal para generación masiva.

```javascript
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { content } = req.body;
  if (!content || content.trim().length < 10) {
    return res.status(400).json({
      error: "El contenido de investigación es muy corto o está vacío.",
    });
  }

  // ── System Prompt ──────────────────────────────────────────────────────────
  const systemPrompt = `
Eres un experto en copywriting de alto impacto para publicidad en redes sociales hispanohablantes.

TAREA: Genera exactamente 12 variaciones de anuncios.
Distribuidas así: 3 "pain", 3 "outcome", 3 "social", 3 "challenge"

DEFINICIONES:
- "pain": Empieza con la frustración, el dolor o el problema del usuario. Crudo y empático.
- "outcome": Empieza con el beneficio final o la transformación que obtendrá el usuario.
- "social": Usa números, estadísticas, testimonios implícitos o señales de autoridad.
- "challenge": Reta directamente al lector. Provoca, incomoda, desafía su status quo.

REGLAS CRÍTICAS (incumplir cualquiera invalida el output):
1. Usa el vocabulario EXACTO de la investigación. No limpies ni profesionalices el lenguaje. Mantenlo crudo y casual.
2. Cada una de las 12 variaciones debe sentirse completamente diferente de las otras 11.
3. Los titulares deben ser cortos (máximo 6 palabras por parte) y provocativos. Sin titulares genéricos.
4. Cada variación DEBE tener un color de acento DIFERENTE. No repitas colores. Usa valores hex de colores vibrantes.
5. Cada variación DEBE tener un fondo oscuro ligeramente diferente (variaciones sutiles del negro/azul oscuro).
6. NUNCA uses el mismo emoji en dos badges.
7. Las boldPhrases deben ser exactamente palabras o frases que aparecen en el subtext.

COLORES SUGERIDOS PARA ACENTOS (usa variaciones y no repitas):
Rojo/Naranja: #ef4444, #f97316, #fb923c
Amarillo:     #eab308, #f59e0b, #fbbf24
Verde:        #22c55e, #10b981, #4ade80
Azul/Morado:  #6366f1, #8b5cf6, #a855f7, #3b82f6, #06b6d4
Rosa:         #ec4899, #f43f5e

FONDOS OSCUROS SUGERIDOS (usa variaciones únicas por variación):
#0a0a0f, #0f0a0a, #0a0f0a, #0a0a14, #0f0f0a, #0a1014, #10080a, #080a10, #0d0a10, #0a0d10
`;

  // ── Schema JSON de respuesta estructurada ──────────────────────────────────
  // Gemini soporta respuesta JSON con schema definido mediante generationConfig.
  // Esto garantiza el formato sin necesidad de parsear texto libre.
  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      variations: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            category: {
              type: SchemaType.STRING,
              enum: ["pain", "outcome", "social", "challenge"],
            },
            badge: { type: SchemaType.STRING },
            headlineStart: { type: SchemaType.STRING },
            headlineHighlight: { type: SchemaType.STRING },
            subtext: { type: SchemaType.STRING },
            boldPhrases: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            bg: { type: SchemaType.STRING },
            accent: { type: SchemaType.STRING },
          },
          required: [
            "category",
            "badge",
            "headlineStart",
            "headlineHighlight",
            "subtext",
            "boldPhrases",
            "bg",
            "accent",
          ],
        },
      },
    },
    required: ["variations"],
  };

  // ── Llamada a Gemini ───────────────────────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 1.0, // Máxima creatividad permitida por Gemini Flash
        maxOutputTokens: 4096,
      },
    });

    const result = await model.generateContent(
      `Contenido de investigación de mercado:\n\n${content}`,
    );

    const raw = result.response.text();

    // ── Parseo y normalización ──────────────────────────────────────────────
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res
        .status(500)
        .json({ error: "Gemini devolvió un formato JSON inválido." });
    }

    // El schema garantiza { variations: [...] }, pero se normaliza por si acaso
    const variations = Array.isArray(parsed)
      ? parsed
      : parsed.variations || parsed[Object.keys(parsed)[0]] || [];

    if (!Array.isArray(variations) || variations.length === 0) {
      return res
        .status(500)
        .json({ error: "No se generaron variaciones válidas." });
    }

    return res.status(200).json({ variations });
  } catch (err) {
    // Distinguir errores de API de Gemini de errores internos
    const message = err?.message || "Error desconocido";
    const status = message.includes("API_KEY") ? 401 : 502;
    return res.status(status).json({ error: `Error de Gemini: ${message}` });
  }
}
```

**Paso de verificación local**

```bash
# Crear archivo local de variables (NO subir a git — verificar que está en .gitignore)
echo "GEMINI_API_KEY=AIza..." > .env.local

# Probar con Vercel CLI (incluye las variables de .env.local automáticamente)
npx vercel dev

# En otra terminal, enviar request de prueba
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"content": "Los usuarios se quejan de que no pueden dormir bien. Muchos mencionan ansiedad, estrés laboral y pantallas antes de dormir."}'
```

Esperado: JSON con `{ "variations": [...] }` — array de 12 objetos con los campos correctos.

**Commit:**

```bash
git add api/generate.js && git commit -m "feat: serverless function con Gemini 2.0 Flash y schema JSON estructurado"
```

---

## TAREA 7: Utilities y Componente `AdCard`

**Archivos:**

- Crear: `src/utils/storage.js`
- Crear: `src/components/AdCard.jsx`

**Paso 1: `src/utils/storage.js`**

```javascript
const STORAGE_KEY = "adVariations";

export const saveVariations = (variations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(variations));
  } catch (err) {
    console.error("Error guardando en localStorage:", err);
  }
};

export const loadVariations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const clearVariations = () => {
  localStorage.removeItem(STORAGE_KEY);
};
```

**Paso 2: `src/components/AdCard.jsx`**

Muestra una tarjeta con mini-preview del anuncio + checkbox de selección:

```jsx
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
      {/* Mini-preview del canvas (escalar visualmente) */}
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

      {/* Metadata */}
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
```

**Commit:**

```bash
git add src/utils/storage.js src/components/AdCard.jsx && git commit -m "feat: storage utils y componente AdCard con selección visual"
```

---

## TAREA 8: Página `/generate` — Generador IA

**Archivo:** `src/pages/GeneratorPage.jsx`

**Estructura de estado:**

```javascript
const [file, setFile] = useState(null); // File object
const [content, setContent] = useState(""); // Contenido editable del archivo
const [variations, setVariations] = useState(loadVariations());
const [selected, setSelected] = useState(new Set());
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

**Flujo de carga de archivo:**

```javascript
const handleFileChange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  setFile(f);
  const reader = new FileReader();
  reader.onload = (ev) => setContent(ev.target.result);
  reader.readAsText(f);
};
```

**Llamada a la API:**

```javascript
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
```

**Agrupación por categoría:**

```javascript
const CATEGORIES = {
  pain: "Dolor Primero",
  outcome: "Resultado Primero",
  social: "Prueba Social",
  challenge: "Desafio Directo",
};

const grouped = Object.fromEntries(
  Object.keys(CATEGORIES).map((cat) => [
    cat,
    variations.filter((v) => v.category === cat),
  ]),
);
```

**Envío al generador masivo:**

```javascript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

const handleSendSelected = () => {
  const toSend = variations.filter((_, i) => selected.has(i));
  saveVariations(toSend);
  navigate("/bulk");
};

const handleSendAll = () => {
  saveVariations(variations);
  navigate("/bulk");
};
```

**Render del UI:**

1. Botón "📁 Subir Archivo" prominente (`.btn-primary` con `font-size: 16px`, padding mayor).
2. Nombre del archivo bajo el botón si `file !== null`.
3. Textarea editable del contenido si `file !== null`.
4. Botón "✨ Generar 12 Variaciones" con spinner mientras `loading`.
5. Error en rojo si `error !== ''`.
6. Las 4 secciones de variaciones con `<AdCard>` dentro de un grid de 3 columnas.
7. Barra sticky inferior con "Enviar Seleccionados" y "Enviar Todos".

**Commit:**

```bash
git add src/pages/GeneratorPage.jsx && git commit -m "feat: página generador IA completa"
```

---

## TAREA 9: Página `/bulk` — Generador Masivo

**Archivo:** `src/pages/BulkPage.jsx`

**Estado vacío:**

```javascript
const variations = loadVariations();

if (variations.length === 0) {
  return (
    <div style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>📭</div>
      <h2>No hay variaciones cargadas</h2>
      <p style={{ color: "var(--text-secondary)", margin: "12px 0 24px" }}>
        Primero genera anuncios en el Generador IA y envíalos aquí.
      </p>
      <button className="btn-primary" onClick={() => navigate("/generate")}>
        Ir al Generador IA
      </button>
    </div>
  );
}
```

**Exportación ZIP:**

```javascript
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// canvasRefs es un array de useRef() creado dinámicamente con variations.map(() => useRef(null))
// Nota: el array de refs debe crearse estáticamente usando un ref único por variación

const handleDownloadZip = async () => {
  setExporting(true);
  const zip = new JSZip();
  for (let i = 0; i < variations.length; i++) {
    if (!canvasRefs[i].current) continue;
    const dataUrl = await toPng(canvasRefs[i].current, { pixelRatio: 1 });
    const base64 = dataUrl.split(",")[1];
    const { category } = variations[i];
    zip.file(`${category}_${String(i + 1).padStart(2, "0")}.png`, base64, {
      base64: true,
    });
  }
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `anuncios_${Date.now()}.zip`);
  setExporting(false);
};
```

> **Nota sobre los refs:** Crear los refs con `useRef([])` y rellenarlos dinámicamente en el render: `ref={el => (canvasRefs.current[i] = el)}`. Los `AdCanvas` para exportación se renderizan off-screen con `position: absolute; left: -9999px; top: 0;`.

**Botón limpiar:**

```javascript
const handleClear = () => {
  if (
    window.confirm(
      "¿Estás seguro? Esto borrará todas las variaciones guardadas.",
    )
  ) {
    clearVariations();
    navigate("/generate");
  }
};
// Render: <button className="btn-danger" onClick={handleClear}>🗑️ Limpiar Variaciones</button>
```

**Layout:**

- Variaciones agrupadas por categoría (mismas 4 secciones, grid de 3 columnas, sin checkboxes).
- Botón principal "⬇️ Descargar Todas como ZIP" arriba del todo.
- Botón "🗑️ Limpiar Variaciones" (`.btn-danger`) en esquina superior derecha o al final.

**Commit:**

```bash
git add src/pages/BulkPage.jsx && git commit -m "feat: página bulk con exportación ZIP y estado vacío"
```

---

## TAREA 10: Configuración Vercel + Polish Final

**Archivos:**

- Crear: `vercel.json`
- Modificar: varios componentes (ajustes de UX)

**Paso 1: `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

**Paso 2: Checklist de polish (verificar cada item):**

- [ ] `AdCard` seleccionada: `border: 2px solid var(--border-selected)` + `background: var(--bg-selected)` + `transition: all 0.15s`.
- [ ] Botón "Subir Archivo": `font-size: 16px`, padding `14px 28px`, ícono `📁` visible.
- [ ] Nombre del archivo: visible bajo el botón en `var(--text-secondary)`, tamaño 13px.
- [ ] Textarea de contenido: `min-height: 200px`, `background: var(--bg-card)`, `border: 1px solid var(--border)`, `color: var(--text-primary)`, `resize: vertical`, `border-radius: 8px`, `padding: 12px`.
- [ ] Estado "Generando...": button deshabilitado + spinner CSS (animación `spin` 1s lineal infinito en un borde circular).
- [ ] Botón "Limpiar Variaciones": clase `.btn-danger`, suficientemente grande para no perderse.
- [ ] Los `AdCanvas` para ZIP: `position: absolute; left: -9999px; top: 0` (NO `display: none`).
- [ ] Build sin errores: `npm run build` completa exitosamente.

**Paso 3: Build final y verificación**

```bash
npm run build
```

Esperado: `dist/` generado sin errores ni warnings críticos.

**Commit final:**

```bash
git add -A && git commit -m "feat: configuración vercel y polish final de UX"
```

---

## ORDEN DE EJECUCIÓN

```
Tarea 1 → Tarea 2 → Tarea 3 → Tarea 4 → Tarea 5 → Tarea 6 → Tarea 7 → Tarea 8 → Tarea 9 → Tarea 10
```

Cada tarea = un commit atómico. No mezclar tareas en un mismo commit.

---

## VARIABLES DE ENTORNO

| Variable           | Configuración                  | Expuesta al frontend |
| ------------------ | ------------------------------ | -------------------- |
| `GEMINI_API_KEY`   | Vercel > Environment Variables | ❌ Nunca             |
| (desarrollo local) | `.env.local` (en `.gitignore`) | ❌ Nunca             |

---

## DESPLIEGUE EN VERCEL

1. Push del repositorio a GitHub.
2. Importar proyecto en [vercel.com](https://vercel.com).
3. En _Settings > Environment Variables_, agregar `GEMINI_API_KEY`.
4. Deploy. El `vercel.json` maneja automáticamente rutas SPA y API.

---

## REFERENCIA RÁPIDA DE COMANDOS

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo
npx vercel dev       # Servidor con API serverless (requiere Vercel CLI)
npm run build        # Build de producción
npm run preview      # Preview del build
```
