// pages/api/submit.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const endpoint = "https://script.google.com/macros/s/AKfycbzP309gzQrQAcxMW3NkfsXoR5ieipdYZ6JZ75O6DtJJfVg1EXpV97DvgQVBH2u--e8J/exec";

    try {
      const response = await axios.post(endpoint, req.body);

      if (response.data?.result === "success") {
        return res.status(200).json({ result: "success" });
      } else {
        const msg = response.data?.message || "Unknown error from Google Script";
        console.error("❌ Google Apps Script returned error:", msg);
        return res.status(500).json({ result: "error", message: msg });
      }

    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message || "Unknown network or script error";
      console.error("❌ Submission error (catch block):", errorMsg);
      return res.status(500).json({ result: "error", message: errorMsg });
    }

  } else {
    return res.status(405).json({ result: "error", message: "Method Not Allowed" });
  }
}
