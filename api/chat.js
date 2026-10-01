require("dotenv").config();

const SYSTEM_PROMPT = `PASTE THE SYSTEM PROMPT FROM SYSTEM_PROMPT.md HERE`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server is missing GROQ_API_KEY" });

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing messages" });
  }

  // keep only the last 10 messages, trimmed, valid roles only
  const clean = messages
    .slice(-10)
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 500) }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
        temperature: 0.5,
        max_tokens: 250,
      }),
    });
    const data = await r.json().catch(() => null);
    if (!r.ok || !data) {
      return res.status(502).json({ error: (data && data.error && data.error.message) || "AI request failed" });
    }
    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    const timedOut = err.name === "AbortError";
    return res.status(timedOut ? 504 : 500).json({ error: timedOut ? "The AI took too long to respond" : err.message });
  } finally {
    clearTimeout(timer);
  }
};