const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1'; // Correct base URL
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000'; // Optional: For identification
const APP_NAME = process.env.APP_NAME || 'NearTimeVoiceConsole'; // Optional: For identification

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY environment variable not set. OpenRouter API calls will fail.');
}

/**
 * Sends a chat completion request to the OpenRouter API.
 * @param {object} data - The request payload (e.g., { model: '...', messages: [...] }).
 * @returns {Promise<object>} - The API response data.
 */
async function handleOpenRouterRequest(data) {
  if (!OPENROUTER_API_KEY) throw new Error('OpenRouter API key not configured.');
  try {
    const response = await axios.post(`${OPENROUTER_API_URL}/chat/completions`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL, // Recommended header
        'X-Title': APP_NAME      // Recommended header
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in OpenRouter request:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Fetches the list of available models from the OpenRouter API.
 * @returns {Promise<Array>} - An array of available models.
 */
async function fetchAvailableModels() {
  if (!OPENROUTER_API_KEY) throw new Error('OpenRouter API key not configured.');
  try {
    const response = await axios.get(`${OPENROUTER_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });
    // The actual model data is in response.data.data
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching models from OpenRouter:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Removed handleChunkedResponse as it was flawed and likely unnecessary.
// Removed fetchModelParameters as the endpoint doesn't exist in OpenRouter API.

module.exports = {
  handleOpenRouterRequest, // Renamed from sendRequestToOpenRouter
  fetchAvailableModels
};
