// server.js
const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;
const API_KEY = process.env.CODY_API_KEY;
const BOT_NAME = process.env.CODY_BOT_NAME;
let conversationId;

if (!API_KEY) {
  console.error('❌  Set CODY_API_KEY environment variable.');
  process.exit(1);
}

// serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

//  CORS for local‐dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// proxy endpoint
app.post('/api/generate', async (req, res) => {
  const { country, city, language, draft } = req.body;
  if (!draft) return res.status(400).json({ error: 'Draft is required' });

  try {
    // fetchBotId() & ensureConversation()
    const convId = await ensureConversation(); // from your original code
    const prompt = [ /* … build your prompt … */ ].join('\n');
    
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
      throw new Error(errTxt || msgRes.statusText);
    }
    const { data } = await msgRes.json();
    res.json({ content: data.content });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

// → index.html
// ✅ string wildcard
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
