// pages/api/submit.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const endpoint = "https://script.google.com/macros/s/AKfycbzP309gzQrQAcxMW3NkfsXoR5ieipdYZ6JZ75O6DtJJfVg1EXpV97DvgQVBH2u--e8J/exec";

    try {
      const response = await axios.post(endpoint, req.body);

      if (response.data.result === "success") {
        return res.status(200).send('✅ Google Sheet submission successful');
      } else {
        console.error("❌ Google Apps Script returned error:", response.data.message);
        return res.status(500).send(`❌ Submission error: ${response.data.message}`);
      }

    } catch (error) {
      console.error("❌ Submission error (catch block):", error.response?.data || error.message);
      return res.status(500).send('❌ Submission failed (network or script error)');
    }

  } else {
    return res.status(405).send('Method Not Allowed');
  }
}
