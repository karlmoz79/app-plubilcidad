# AGENTS.md - Guía para Agentes de Código

## Descripción del Proyecto

Aplicación React + Vite para generar variaciones de anuncios 1080×1080 para redes sociales usando IA (Google Gemini). 
3 páginas: Editor (`/`), Generador IA (`/generate`), Generador Masivo (`/bulk`). 
Interfaz 100% en español. Deploy en Vercel con serverless functions.

---

## Comandos

### Desarrollo
```bash
npm run dev          # Servidor de desarrollo
npm run preview     # Preview del build
```

### Build
```bash
npm run build       # Build de producción (output: dist/)
```

### Linting
```bash
npm run lint        # Ejecutar ESLint en todo el proyecto
```

### API Serverless (local)
```bash
npx vercel dev     # Servidor con API serverless (requiere Vercel CLI)
```

---

## Estilo de Código

### General
- **Idioma**: Todo el código y comentarios en español (excepto英文 para APIs externas)
- **Formato**: 2 espacios para indentación
- **Extensiones**: `.jsx` para componentes React, `.js` para utilitarios, `.ts` para API serverless

### Imports
```javascript
// React
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Componentes locales
import AdCanvas from "../components/AdCanvas";
import { saveVariations, loadVariations } from "../utils/storage";

// Estilos
import "../styles/ad.css";
```

### Componentes React
- Usar functional components con arrow functions o `function`
- Usar `forwardRef` cuando se necesite referencia al DOM
- DisplayName requerido para componentes con `forwardRef`
- Props con desestructuración
- Estilos inline para props dinámicas, CSS classes para estilos estáticos

```javascript
// Ejemplo componente
const AdCanvas = forwardRef(({ bg, accent, badge }, ref) => {
  return <div ref={ref} style={{ backgroundColor: bg }}>{badge}</div>;
});

AdCanvas.displayName = "AdCanvas";
export default AdCanvas;
```

### Naming Conventions
- **Componentes**: PascalCase (`EditorPage`, `AdCanvas`)
- **Archivos**: kebab-case (`editor-page.jsx`, `ad-canvas.jsx`)
- **Funciones/Variables**: camelCase (`handleGenerate`, `variations`)
- **Constantes**: UPPER_SNAKE_CASE para configuración global
- **CSS Classes**: kebab-case (`.btn-primary`, `.ad-canvas`)

### Estado
- Hooks de React: `useState`, `useEffect`, `useRef`, `useNavigate`
- No usar Redux ni context providers adicionales
- Persistencia: `localStorage` (clave: `adVariations`)

### Manejo de Errores
- Try-catch para operaciones asíncronas
- Mensajes de error en español para el usuario
- Console.error para logs de debugging (no en producción)

```javascript
try {
  const res = await fetch("/api/generate", {...});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error desconocido");
} catch (err) {
  setError(err.message);
}
```

### CSS
- Usar CSS custom properties (variables) del design system
- No usar frameworks (Tailwind, Bootstrap)
- Paleta de colores en `:root`:
```css
:root {
  --bg-app: #08080d;
  --accent: #6366f1;
  --text-primary: #f0f0f5;
  --text-secondary: #9393a8;
}
```

### API Serverless (Vercel)
- Archivo: `api/generate.ts` o `.mjs`
- Runtime: `nodejs18`
- Siempre verificar API key antes de usar
- CORS headers para OPTIONS preflight

---

## Estructura de Archivos

```
src/
├── components/      # Componentes reutilizables
│   ├── AdCanvas.jsx
│   ├── AdCard.jsx
│   └── Navbar.jsx
├── pages/          # Páginas路由
│   ├── EditorPage.jsx
│   ├── GeneratorPage.jsx
│   └── BulkPage.jsx
├── styles/         # CSS global y de componentes
│   ├── global.css
│   └── ad.css
├── utils/          # Funciones utilitarias
│   └── storage.js
├── App.jsx         # Router principal
└── main.jsx        # Entry point
api/
└── generate.ts     # Serverless function para Gemini
```

---

## Variables de Entorno

| Variable | Descripción | Expuesta al Frontend |
|----------|-------------|---------------------|
| `GEMINI_API_KEY` | Clave de Google Gemini | **NO** (solo en serverless) |

En desarrollo local: `.env.local` (agregar a `.gitignore`)

---

## Verificación Pre-commit

Antes de commitear:
1. `npm run lint` - Sin errores
2. `npm run build` - Build exitoso

---

## Notas Importantes

- **Sin tests** actualmente configurados
- Canvas de anuncios siempre 1080×1080 px
- Exportación PNG: `html-to-image`
- Exportación ZIP masiva: `jszip` + `file-saver`
- La API key de Gemini debe configurarse en Vercel Environment Variables
