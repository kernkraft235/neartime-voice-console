const axios = require('axios');

const GEMINI_API_URL = 'https://api.gemini.google.com';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function handleGeminiRequest(prompt) {
  try {
    const response = await axios.post(`${GEMINI_API_URL}/generate`, { prompt }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      }
    });
    const { image, description } = response.data;
    return { image, description };
  } catch (error) {
    console.error('Error in Gemini request:', error);
    throw error;
  }
}

module.exports = {
  handleGeminiRequest
};
