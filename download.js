// api/download.js - Vercel Backend for ALL VIDEO DOWNLOADER
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Using Cobalt API - best for TikTok, Instagram, YouTube etc.
    const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        vCodec: 'h264',
        vQuality: '1080',
        aFormat: 'mp3',
        isAudioOnly: false,
        isNoTTWatermark: true,
        isTTFullAudio: true,
        isAudioMuted: false,
        dubLang: false,
        disableMetadata: false
      }),
    });

    const data = await cobaltResponse.json();
    
    if (data.url) {
      return res.status(200).json({ url: data.url, picker: data.picker });
    } else if (data.status === 'error') {
      return res.status(400).json({ error: data.text || 'Failed to process' });
    } else {
      // Fallback try another instance
      const fallback = await fetch('https://co.wuk.sh/api/json', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });
      const fallbackData = await fallback.json();
      if (fallbackData.url) {
        return res.status(200).json({ url: fallbackData.url });
      }
      return res.status(400).json({ error: 'Could not process this link', details: data });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
