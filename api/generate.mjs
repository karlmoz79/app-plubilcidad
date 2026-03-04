import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const config = {
  runtime: "nodejs18",
};

export default async function handler(req, res) {
  // CORS headers para todas las respuestas
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { content } = req.body || {};

  if (!content || content.trim().length < 10) {
    return res.status(400).json({
      error: "El contenido de investigación es muy corto o está vacío.",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY no configurada" });
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
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 1.0,
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
    // Distinguir errores de API key de errores internos
    const message = err?.message || "Error desconocido";
    const status = message.includes("API_KEY") ? 401 : 502;
    return res.status(status).json({ error: `Error de Gemini: ${message}` });
  }
}
