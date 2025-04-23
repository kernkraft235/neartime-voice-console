const axios = require('axios');

const OPENROUTER_API_URL = 'https://api.openrouter.io';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function sendRequestToOpenRouter(data) {
  try {
    const response = await axios.post(`${OPENROUTER_API_URL}/request`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in OpenRouter request:', error);
    throw error;
  }
}

async function handleChunkedResponse(data) {
  try {
    const responseChunks = [];
    const response = await sendRequestToOpenRouter(data);
    const chunks = response.match(/.{1,100}/g); // Split response into chunks of 100 characters
    for (const chunk of chunks) {
      responseChunks.push(chunk);
    }
    return responseChunks.join(' ');
  } catch (error) {
    console.error('Error in chunked response:', error);
    throw error;
  }
}

async function fetchAvailableModels() {
  try {
    const response = await axios.get(`${OPENROUTER_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });
    return response.data.models;
  } catch (error) {
    console.error('Error fetching models from OpenRouter:', error);
    throw error;
  }
}

async function fetchModelParameters(modelId) {
  try {
    const response = await axios.get(`${OPENROUTER_API_URL}/models/${modelId}/parameters`, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });
    return response.data.parameters;
  } catch (error) {
    console.error('Error fetching model parameters from OpenRouter:', error);
    throw error;
  }
}

module.exports = {
  sendRequestToOpenRouter,
  handleChunkedResponse,
  fetchAvailableModels,
  fetchModelParameters
};
