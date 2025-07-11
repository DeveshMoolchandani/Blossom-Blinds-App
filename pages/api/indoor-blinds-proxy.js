export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwyfc1yWqACSL8CvhT3WFbInDEgYal77aShA4yKaX6AGkN5yq5Er3lokIciS5gSySPg/exec", {
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
      return res.status(500).json({ result: 'error', message: 'Invalid JSON from Google Script' });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      result: 'error',
      message: error.message || 'Unknown proxy error'
    });
  }
}
