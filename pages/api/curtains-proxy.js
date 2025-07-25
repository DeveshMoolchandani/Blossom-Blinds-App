export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const sheetUrl = "https://script.google.com/macros/s/AKfycbzP309gzQrQAcxMW3NkfsXoR5ieipdYZ6JZ75O6DtJJfVg1EXpV97DvgQVBH2u--e8J/exec";

  try {
    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    console.log("🔍 Raw response from Google Script:", text);

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        result: 'error',
        message: 'Invalid JSON from Google Script',
        raw: text
      });
    }

  } catch (error) {
    console.error("❌ Server error while calling Google Script:", error);
    return res.status(500).json({
      result: 'error',
      message: error.message
    });
  }
}
