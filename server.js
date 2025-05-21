// server.js
import express from 'express';
import path    from 'path';

const app  = express();
const PORT = process.env.PORT || 3000;
const API_KEY  = process.env.CODY_API_KEY;
const BOT_NAME = process.env.CODY_BOT_NAME || '';

if (!API_KEY) {
  console.error('No API Key set');
  process.exit(1);
}

// Serve static files from /public
app.use(express.static(path.join(process.cwd(), 'public')));

// JSON parsing + (optional) CORS
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Helpers to fetch bot ID andsingle convo
let conversationId;
async function fetchBotId() {
  const res = await fetch('https://getcody.ai/api/v1/bots', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  if (!res.ok) throw new Error(`fetch bots failed ${res.status}`);
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
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ name: 'WebProxyConv', bot_id: botId })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`create convo failed ${res.status}: ${txt}`);
  }
  const { data } = await res.json();
  conversationId = data.id;
  return conversationId;
}

// proxy
app.post('/api/generate', async (req, res) => {
  const { country, city, language, draft } = req.body;
  if (!draft) return res.status(400).json({ error: 'Draft is required' });
  try {
    const convId = await ensureConversation();
    const prompt = [
    `You are a professional travel copywriter.

    Write a Campspace listing description in ${language}.

    The text must be between 100 and 650 characters, with 650 characters MAX.

    It must be SEO-optimized, easy to read, and free of AI clichés.

    Highlight the setting, amenities, local attractions, and include sensory details.

    Add a little bit of information based on the city where the Campspace is located.

    Do NOT mention the host, their personality, or anything about the local culture.

    Do NOT mention features of the campspace (f.E Fireplace, toilets) that are not mentioned by the draft.

    Use simple language, short sentences, and avoid complicated words or structures.

    No profanities, sexual terms, or inappropriate content.

    Filter out personal information: phone numbers, adresses, e-mails etc.

    Write the entire text in ${language} – do not use English in non-English texts.
    
    Write the Description of the campspace itself in one paragraph and add tourist information (what is near the campspace, activities) in a second shorter paragraph`,
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
      body: JSON.stringify({
        conversation_id: convId,
        content: prompt
      })
    });

    if (!msgRes.ok) {
      const errText = await msgRes.text();
      throw new Error(`Cody API error: ${msgRes.status} ${errText}`);
    }

    const { data } = await msgRes.json();
    res.json({ content: data.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// listen to port
app.listen(PORT, () => {
  console.log(`🚀 Running on port ${PORT}`);
});
