export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
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

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY no configurada" });
  }

  const systemPrompt = `Eres un experto en copywriting. Genera 12 variaciones: 3 pain, 3 outcome, 3 social, 3 challenge. Colores acento: #ef4444,#f97316,#eab308,#22c55e,#6366f1,#8b5cf6,#3b82f6,#06b6d4,#ec4899,#f43f5e,#10b981,#a855f7. Fondos: #0a0a0f,#0f0a0a,#0a0f0a,#0a0a14,#0f0f0a,#0a1014,#10080a,#080a10,#0d0a10,#0a0d10. Responde solo JSON: {"variations":[{category,badge,headlineStart,headlineHighlight,subtext,boldPhrases:[],bg,accent}]}`;

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
            maxOutputTokens: 4096
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Error de Gemini" });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      return res.status(500).json({ error: "No se recibió respuesta de Gemini" });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Gemini devolvió JSON inválido." });
    }

    const variations = Array.isArray(parsed) ? parsed : parsed.variations || [];

    if (!Array.isArray(variations) || variations.length === 0) {
      return res.status(500).json({ error: "No se generaron variaciones válidas." });
    }

    return res.status(200).json({ variations });
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
}
