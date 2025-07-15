// Trigger Vercel redeploy - Devesh
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

const sheetUrl = "https://script.google.com/macros/s/AKfycbzDNOMJI61FAnoz1_gzS8vIQvDaOmwLrcpkTvEhPQLye43rVjfLXTvwknhg-RF5rAZN/exec";
  const isDev = process.env.NODE_ENV !== 'production';

  try {
    if (isDev) {
      console.log("📦 Payload to Curtains Script:", req.body);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 sec

    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({ result: 'error', message: 'Invalid JSON from Google Script' });
    }

    if (data.result === 'success') {
      return res.status(200).json({ result: 'success' });
    } else {
      return res.status(500).json({
        result: 'error',
        message: data.message || 'Unknown error from Google Script'
      });
    }

  } catch (err) {
    return res.status(500).json({ result: 'error', message: err.message });
  }
}
