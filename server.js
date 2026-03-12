require("dotenv").config();
const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/test", (req, res) => {
  res.json({
    status: "running",
    groqKeyLoaded: !!process.env.GROQ_API_KEY,
  });
});

app.post("/api/chat", (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY missing from .env" });
  }

  // Convert Anthropic-style request to Groq/OpenAI format
  const { messages, system, max_tokens } = req.body;
  const groqMessages = [];
  if (system) groqMessages.push({ role: "system", content: system });
  groqMessages.push(...messages);

  const body = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: groqMessages,
    max_tokens: max_tokens || 1000,
    temperature: 0.3,
  });

  const options = {
    hostname: "api.groq.com",
    path: "/openai/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "Authorization": `Bearer ${apiKey}`,
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = "";
    proxyRes.on("data", (chunk) => (data += chunk));
    proxyRes.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        if (!proxyRes.statusCode === 200 || parsed.error) {
          console.error("Groq error:", JSON.stringify(parsed));
          return res.status(proxyRes.statusCode).json(parsed);
        }
        // Convert Groq response back to Anthropic-style so frontend works unchanged
        const converted = {
          content: [{ type: "text", text: parsed.choices?.[0]?.message?.content || "" }]
        };
        res.json(converted);
      } catch (e) {
        res.status(500).json({ error: "Failed to parse Groq response", raw: data });
      }
    });
  });

  proxyReq.on("error", (err) => {
    console.error("Request error:", err.message);
    res.status(500).json({ error: err.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✓ Proxy running on http://localhost:${PORT}`);
  console.log(`✓ Groq API key loaded: ${!!process.env.GROQ_API_KEY}`);
  console.log(`✓ Model: llama-3.3-70b-versatile (free)`);
  console.log(`✓ Test at: http://localhost:${PORT}/test\n`);
});