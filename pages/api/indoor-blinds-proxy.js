export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log("📦 Forwarding Indoor Blinds payload to Google Apps Script:", req.body);

    const response = await fetch("https://script.google.com/macros/s/AKfycbwQa6HIIV60r_cI4gjul6rvmBwsfPkDiIJzWWN3elajJ2PdI9chygnoiRmbjBd0B8o/exec", {
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
      return res.status(500).json({ result: 'error', message: '❌ Invalid JSON from Google Script' });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      result: 'error',
      message: error.message || '❌ Unknown proxy error'
    });
  }
}
