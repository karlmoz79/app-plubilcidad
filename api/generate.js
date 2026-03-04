// Vercel Serverless Function — Generador de variaciones de anuncios
// Usa Gemini REST API directamente (sin SDK)

export const config = {
    maxDuration: 60,
};

export default async function handler(request, response) {
    // CORS headers
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        return response.status(200).end();
    }

    if (request.method !== "POST") {
        return response.status(405).json({ error: "Método no permitido" });
    }

    let body;
    try {
        body = request.body;
    } catch {
        return response.status(400).json({ error: "Body inválido" });
    }

    const content = body?.content || "";

    if (!content || content.trim().length < 10) {
        return response.status(400).json({
            error: "El contenido de investigación es muy corto o está vacío.",
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return response.status(500).json({ error: "GEMINI_API_KEY no configurada en Vercel" });
    }

    const systemPrompt = `Eres un experto en copywriting de alto impacto para publicidad en redes sociales hispanohablantes.

TAREA: Genera exactamente 12 variaciones de anuncios.
Distribuidas así: 3 "pain", 3 "outcome", 3 "social", 3 "challenge"

DEFINICIONES:
- "pain": Empieza con la frustración, el dolor o el problema del usuario. Crudo y empático.
- "outcome": Empieza con el beneficio final o la transformación que obtendrá el usuario.
- "social": Usa números, estadísticas, testimonios implícitos o señales de autoridad.
- "challenge": Reta directamente al lector. Provoca, incomoda, desafía su status quo.

REGLAS CRÍTICAS:
1. Usa el vocabulario EXACTO de la investigación.
2. Cada variación debe sentirse completamente diferente.
3. Titulares cortos (máximo 6 palabras) y provocativos.
4. Cada variación DEBE tener un color de acento DIFERENTE (hex vibrante).
5. Cada variación DEBE tener un fondo oscuro ligeramente diferente.
6. NUNCA uses el mismo emoji en dos badges.
7. Las boldPhrases deben ser palabras que aparecen en el subtext.

Responde SOLO con JSON: {"variations":[{"category":"...","badge":"...","headlineStart":"...","headlineHighlight":"...","subtext":"...","boldPhrases":["..."],"bg":"#...","accent":"#..."}]}`;

    try {
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: "Contenido de investigación de mercado:\n\n" + content }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 1.0,
                    maxOutputTokens: 4096,
                },
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return response.status(502).json({ error: data.error?.message || "Error de Gemini API" });
        }

        const raw = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

        if (!raw) {
            return response.status(500).json({ error: "No se recibió respuesta de Gemini" });
        }

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            return response.status(500).json({ error: "Gemini devolvió JSON inválido." });
        }

        const variations = Array.isArray(parsed) ? parsed : (parsed.variations || []);

        if (!Array.isArray(variations) || variations.length === 0) {
            return response.status(500).json({ error: "No se generaron variaciones válidas." });
        }

        return response.status(200).json({ variations });
    } catch (err) {
        return response.status(502).json({ error: "Error de Gemini: " + (err.message || "desconocido") });
    }
}
