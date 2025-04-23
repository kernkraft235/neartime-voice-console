const axios = require('axios');

// Correct base URL for Generative Language API
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = 'gemini-pro'; // Default model to use

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY environment variable not set. Gemini API calls will fail.');
}

/**
 * Sends a request to the Google Gemini API to generate content based on a prompt.
 * Note: This implementation focuses on text generation. The original code's expectation
 * of returning an 'image' and 'description' is not standard for this endpoint.
 *
 * @param {string} prompt - The text prompt for content generation.
 * @param {string} [model=DEFAULT_MODEL] - The specific Gemini model to use (e.g., 'gemini-pro').
 * @returns {Promise<string>} - The generated text content.
 */
async function handleGeminiRequest(prompt, model = DEFAULT_MODEL) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured.');
  if (!prompt) throw new Error('Prompt cannot be empty.');

  const apiUrl = `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
    // Add generationConfig here if needed (e.g., temperature, maxOutputTokens)
    // generationConfig: {
    //   temperature: 0.7,
    //   maxOutputTokens: 1024,
    // }
  };

  try {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract the generated text from the response
    // Handle cases where response might be structured differently or lack candidates
    const candidates = response.data?.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
      // Assuming the first part of the first candidate contains the text
      return candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response structure:', response.data);
      throw new Error('Failed to parse content from Gemini response.');
    }

  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Error in Gemini request:', errorMessage);
    // Rethrow a more specific error if possible
    throw new Error(`Gemini API request failed: ${errorMessage}`);
  }
}

module.exports = {
  handleGeminiRequest
};
