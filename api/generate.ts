export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  console.log("Request received");
  
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

  const systemPrompt = `Eres un experto en copywriting de alto impacto para publicidad en redes sociales hispanohablantes. TAREA: Genera exactamente 12 variaciones de anuncios. Distribuidas así: 3 "pain", 3 "outcome", 3 "social", 3 "challenge". DEFINICIONES: - "pain": Empieza con la frustración, el dolor o el problema del usuario. - "outcome": Empieza con el beneficio final o la transformación. - "social": Usa números, estadísticas, testimonios. - "challenge": Reta directamente al lector. REGLAS: 1. Usa el vocabulario EXACTO de la investigación. 2. Cada variación diferente de las otras 11. 3. Los titulares cortos y provocativos. 4. Cada variación con color de acento DIFERENTE. 5. Cada variación con fondo oscuro diferente. 6. NUNCA uses el mismo emoji en dos badges. 7. Las boldPhrases deben aparecer en el subtext. COLORES ACENTO: #ef4444, #f97316, #eab308, #22c55e, #6366f1, #8b5cf6, #3b82f6, #06b6d4, #ec4899, #f43f5e, #10b981, #a855f7. FONDOS: #0a0a0f, #0f0a0a, #0a0f0a, #0a0a14, #0f0f0a, #0a1014, #10080a, #080a10, #0d0a10, #0a0d10. Responde SOLO con JSON válido: {"variations:[{category,badge,headlineStart,headlineHighlight,subtext,boldPhrases:[],bg,accent}]}`;

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key exists:", !!apiKey);
  
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY no configurada" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: `Contenido:\n${content}` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 1.0,
            maxOutputTokens: 4096,
            responseSchema: {
              type: "OBJECT",
              properties: {
                variations: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      category: { type: "STRING", enum: ["pain", "outcome", "social", "challenge"] },
                      badge: { type: "STRING" },
                      headlineStart: { type: "STRING" },
                      headlineHighlight: { type: "STRING" },
                      subtext: { type: "STRING" },
                      boldPhrases: { type: "ARRAY", items: { type: "STRING" } },
                      bg: { type: "STRING" },
                      accent: { type: "STRING" }
                    },
                    required: ["category", "badge", "headlineStart", "headlineHighlight", "subtext", "boldPhrases", "bg", "accent"]
                  }
                }
              },
              required: ["variations"]
            }
          }
        })
      }
    );

    const data = await response.json();
    console.log("Response status:", response.status);

    if (!response.ok) {
      console.error("API Error:", data);
      return res.status(500).json({ error: data.error?.message || "Error de Gemini" });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Raw response:", raw?.substring(0, 200));

    if (!raw) {
      return res.status(500).json({ error: "No se recibió respuesta de Gemini" });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Gemini devolvió JSON inválido." });
    }

    const variations = Array.isArray(parsed) 
      ? parsed 
      : parsed.variations || [];

    if (!Array.isArray(variations) || variations.length === 0) {
      return res.status(500).json({ error: "No se generaron variaciones válidas." });
    }

    return res.status(200).json({ variations });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
}
