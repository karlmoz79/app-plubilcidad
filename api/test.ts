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

  const apiKey = process.env.GEMINI_API_KEY;
  
  return res.status(200).json({ 
    message: "API funciona",
    hasKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 10) : "none"
  });
}
