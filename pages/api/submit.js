import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const endpoint = "https://script.google.com/macros/s/AKfycbwgyBAg3rHnCVVJJoQzn8CYuq5pvzzL_aP4a2Y7Z7BjOtIAWD_XJDjr01iVFCvPvY8l/exec";

    try {
      const response = await axios.post(endpoint, req.body);
      const result = response.data;

      if (result.result === 'success') {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({
          success: false,
          message: result.message || 'Unknown failure from Google Apps Script',
        });
      }
    } catch (error) {
      console.error('❌ Axios error:', error.message);
      res.status(500).json({ success: false, message: 'Failed to reach Google Apps Script' });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
