// server.js — CORS-enabled proxy to Cody AI
// Install: npm init -y && npm install express
// Requires Node 18+ for global fetch

const express = require('express');
const app     = express();
const PORT    = process.env.PORT || 3000;
const API_KEY = process.env.CODY_API_KEY;        // Your API key
const BOT_NAME = process.env.CODY_BOT_NAME;      // e.g. "Creative Bot"
let conversationId;

if (!API_KEY) {
  console.error('❌  Set CODY_API_KEY environment variable.');
  process.exit(1);
}

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// List Bots, pick by name or default to first
// GET /bots — Get all bots :contentReference[oaicite:0]{index=0}
async function fetchBotId() {
  const res = await fetch('https://getcody.ai/api/v1/bots', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  if (!res.ok) throw new Error(`Bots fetch failed: ${res.status}`);
  const { data } = await res.json();
  if (BOT_NAME) {
    const bot = data.find(b => b.name === BOT_NAME);
    if (!bot) throw new Error(`Bot named "${BOT_NAME}" not found`);
    return bot.id;
  }
  return data[0].id;
}

// Create (or reuse) a single conversation
// POST /conversations :contentReference[oaicite:1]{index=1}
async function ensureConversation() {
  if (conversationId) return conversationId;
  const botId = await fetchBotId();
  const res = await fetch('https://getcody.ai/api/v1/conversations', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ name: 'WebProxyConv', bot_id: botId })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Create convo failed: ${res.status} ${txt}`);
  }
  const { data } = await res.json();
  conversationId = data.id;
  return conversationId;
}

// Proxy endpoint for your front-end
// POST /messages :contentReference[oaicite:2]{index=2}
app.post('/api/generate', async (req, res) => {
  const { country, city, language, draft } = req.body;
  if (!draft) return res.status(400).json({ error: 'Draft is required' });

  try {
    const convId = await ensureConversation();
    const prompt = [
      // system‐style instruction
      `You are a professional travel copywriter. Write a single-paragraph Campspace listing in {language}, max 300 characters (including spaces). Make it SEO-optimized, easy to read, and free of AI clichés. Highlight the unique setting, key amenities, local attractions, sensory details, and host’s personal touch.
.
`,
      // context
      `Country: ${country}`,
      `City: ${city}`,
      ``,
      `Draft: ${draft}`
    ].join('\n');
    
    

    const msgRes = await fetch('https://getcody.ai/api/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ conversation_id: convId, content: prompt })
    });
    if (!msgRes.ok) {
      const errTxt = await msgRes.text();
      console.error('Cody API error:', errTxt);
      return res.status(msgRes.status).send(errTxt);
    }
    const { data } = await msgRes.json();
    return res.json({ content: data.content });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy listening on http://localhost:${PORT}`);
});
