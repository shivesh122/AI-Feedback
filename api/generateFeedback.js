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

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return res.status(geminiResponse.status).json({ error: 'Gemini API error', details: errText });
    }

    const result = await geminiResponse.json();
    console.log("Gemini raw response:", JSON.stringify(result, null, 2));
    let feedbackText = "No feedback generated.";
    if (result?.candidates?.length) {
      feedbackText = result.candidates[0]?.content?.parts?.map(p => p.text).join(" ");
    }

    res.status(200).json({ feedback: feedbackText });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
