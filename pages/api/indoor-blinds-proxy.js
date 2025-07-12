export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log("📦 Forwarding Indoor Blinds payload to Google Apps Script:", req.body);

    const sheetUrl = "https://script.google.com/macros/s/AKfycbyoJqooQOmPZJvCN5w2zNOoN8O9ynBrIdrtRZHEjD9JWUwzNll2i1N_7I6_ZEanwhg2/exec";

    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Invalid JSON from Google Script:", text);
      return res.status(500).json({ result: 'error', message: 'Invalid JSON from Google Script' });
    }

    if (data && data.result === 'success') {
      return res.status(200).json({ result: 'success' });
    } else {
      return res.status(500).json({
        result: 'error',
        message: data?.message || 'Unknown error from script'
      });
    }

  } catch (error) {
    console.error("❌ Proxy Error:", error);
    return res.status(500).json({
      result: 'error',
      message: error.message || 'Unknown proxy error'
    });
  }
}
