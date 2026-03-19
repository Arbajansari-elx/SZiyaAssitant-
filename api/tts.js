export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text, voiceId } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  const KEY = process.env.ELEVENLABS_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });

  const vid = voiceId || '21m00Tcm4TlvDq8ikWAM'; // Rachel

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('ElevenLabs error:', err);
      return res.status(500).json({ error: 'TTS API error' });
    }

    const audioBuffer = await r.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'TTS server error' });
  }
}
