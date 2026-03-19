export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, systemPrompt } = req.body || {};
  if (!messages?.length) return res.status(400).json({ error: 'messages required' });

  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'GROQ_API_KEY not set' });

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt || 'Tu Elx AI hai. Hinglish mein 1-2 sentences mein reply karo.' },
          ...messages
        ],
        max_tokens: 180,
        temperature: 0.8
      })
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Groq error:', err);
      return res.status(500).json({ error: 'Groq API error' });
    }

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Kuch samajh nahi aaya, phir bolo!';
    return res.status(200).json({ reply });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}

