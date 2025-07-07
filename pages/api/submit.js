import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const endpoint = "https://script.google.com/macros/s/AKfycbwgyBAg3rHnCVVJJoQzn8CYuq5pvzzL_aP4a2Y7Z7BjOtIAWD_XJDjr01iVFCvPvY8l/exec";

    try {
      await axios.post(endpoint, req.body);
      res.status(200).send('Success');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Failed to submit form');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
