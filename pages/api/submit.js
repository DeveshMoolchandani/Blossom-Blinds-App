import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const endpoint = "https://script.google.com/macros/s/AKfycbzP309gzQrQAcxMW3NkfsXoR5ieipdYZ6JZ75O6DtJJfVg1EXpV97DvgQVBH2u--e8J/exec";

  try {
    const response = await axios.post(endpoint, req.body);

    // Debug log the raw response for troubleshooting
    console.log("🔍 Google Script Response:", response.data);

    if (response.data?.result === "success") {
      return res.status(200).send('✅ Google Sheet submission successful');
    } else {
      const msg = response.data?.message || 'No error message from Google Apps Script';
      return res.status(500).send(`❌ Submission error: ${msg}`);
    }

  } catch (error) {
    console.error("❌ Network/Script error:", error.response?.data || error.message);
    return res.status(500).send(`❌ Submission failed: ${error.response?.data || error.message}`);
  }
}
