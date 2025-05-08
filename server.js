const express = require('express');
const path    = require('path');
const fetch   = global.fetch;
const app     = express();
const PORT    = process.env.PORT || 3000;
const API_KEY = process.env.CODY_API_KEY;
const BOT_NAME = process.env.CODY_BOT_NAME;
let conversationId;

if (!API_KEY) {
  console.error('❌  Set CODY_API_KEY environment variable.');
  process.exit(1);
}

// 1️⃣ Statische Dateien aus /public
app.use(express.static(path.join(__dirname, 'public')));

// 2️⃣ JSON-Parsing
app.use(express.json());

// 3️⃣ Optional: CORS für Frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 4️⃣ Hilfsfunktionen für Cody-Konversation
async function fetchBotId() {
  const res = await fetch('https://getcody.ai/api/v1/bots', {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  const { data } = await res.json();
  if (BOT_NAME) {
    const bot = data.find(b => b.name === BOT_NAME);
    if (!bot) throw new Error(`Bot "${BOT_NAME}" not found`);
    return bot.id;
  }
  return data[0].id;
}
async function ensureConversation() {
  if (conversationId) return conversationId;
  const botId = await fetchBotId();
  const res = await fetch('https://getcody.ai/api/v1/conversations', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ name: 'WebProxyConv', bot_id: botId })
  });
  const { data } = await res.json();
  conversationId = data.id;
  return conversationId;
}

// 5️⃣ Proxy-Endpoint
app.post('/api/generate', async (req, res) => {
  const { country, city, language, draft } = req.body;
  if (!draft) return res.status(400).json({ error: 'Draft is required' });
  try {
    const convId = await ensureConversation();
    const prompt = [
      `You are a professional travel copywriter...`,
      `Country: ${country}`,
      `City: ${city}`,
      `Draft: ${draft}`
    ].join('\n');
    const msgRes = await fetch('https://getcody.ai/api/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ conversation_id: convId, content: prompt })
    });
    const { data } = await msgRes.json();
    return res.json({ content: data.content });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 6️⃣ Catch-all (Express 5+ benötigt '/*')
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});