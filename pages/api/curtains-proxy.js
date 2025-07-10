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
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    // If response is not valid JSON, return a helpful error
    if (!text || !text.trim().startsWith("{")) {
      return res.status(500).json({
        result: "error",
        message: "Google Script returned non-JSON: " + text.substring(0, 100),
      });
    }

    const data = JSON.parse(text);
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      result: "error",
      message: err.message || "Unknown proxy error",
    });
  }
}
