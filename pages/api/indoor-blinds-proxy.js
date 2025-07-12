export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const sheetUrl = "https://script.google.com/macros/s/AKfycbyoJqooQOmPZJvCN5w2zNOoN8O9ynBrIdrtRZHEjD9JWUwzNll2i1N_7I6_ZEanwhg2/exec";
  const isDev = process.env.NODE_ENV !== 'production';

  try {
    if (isDev) {
      console.log("📦 Forwarding payload to Google Apps Script:", req.body);
      console.log("🔗 Google Script URL:", sheetUrl);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Invalid JSON returned from Google Script:", text);
      return res.status(500).json({ result: 'error', message: 'Invalid JSON from Google Script' });
    }

    if (data.result === 'success') {
      return res.status(200).json({ result: 'success' });
    } else {
      return res.status(500).json({
        result: 'error',
        message: data?.message || 'Unknown error returned from Google Script'
      });
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("⏱️ Google Script request timed out.");
      return res.status(504).json({
        result: 'error',
        message: 'Request to Google Script timed out.'
      });
    }

    console.error("❌ Proxy Error:", error);
    return res.status(500).json({
      result: 'error',
      message: error.message || 'Unknown proxy error'
    });
  }
}
