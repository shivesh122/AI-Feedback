import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, metrics } = req.body;

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (!metrics) {
    return res.status(400).json({ error: 'Metrics JSON is required' });
  }

  try {
    const prompt = `Act as a supportive kids’ learning coach. Provide short, positive feedback for parents based on these metrics: ${JSON.stringify(metrics)}`;

    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await geminiResponse.json();
    const feedbackText = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback generated.';

    res.status(200).json({ feedback: feedbackText });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate feedback', details: err.message });
  }
}