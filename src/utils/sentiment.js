const axios = require('axios');

const OPENROUTER_API_URL = 'https://api.openrouter.io';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function performSentimentAnalysis(transcripts) {
  try {
    const response = await axios.post(`${OPENROUTER_API_URL}/sentiment`, { transcripts }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });
    return response.data.sentiment;
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    throw error;
  }
}

function updateSystemPrompt(sentiment, currentPrompt) {
  let updatedPrompt = currentPrompt;

  if (sentiment === 'positive') {
    updatedPrompt += ' The user seems to be in a good mood.';
  } else if (sentiment === 'negative') {
    updatedPrompt += ' The user seems to be upset.';
  } else if (sentiment === 'neutral') {
    updatedPrompt += ' The user seems to be neutral.';
  }

  return updatedPrompt;
}

module.exports = {
  performSentimentAnalysis,
  updateSystemPrompt
};
