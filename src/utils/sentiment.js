// Import the corrected OpenRouter request handler
const { handleOpenRouterRequest } = require('../api/openrouter');

// Consider making the model configurable via environment variable
const SENTIMENT_ANALYSIS_MODEL = process.env.SENTIMENT_MODEL || 'mistralai/mistral-7b-instruct:free'; // Use a fast model

/**
 * Performs sentiment analysis on the given text using an OpenRouter model.
 * @param {string} text - The text to analyze.
 * @returns {Promise<string>} - The sentiment ('positive', 'negative', 'neutral', or 'unknown').
 */
async function performSentimentAnalysis(text) {
  if (!text) {
    return 'neutral'; // Default sentiment for empty text
  }

  const systemPrompt = "Analyze the sentiment of the following text. Respond with only one word: 'positive', 'negative', or 'neutral'.";
  const requestData = {
    model: SENTIMENT_ANALYSIS_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ],
    max_tokens: 10, // Limit response length
    temperature: 0.1 // Low temperature for deterministic classification
  };

  try {
    const response = await handleOpenRouterRequest(requestData);

    // Extract the sentiment from the response
    const content = response?.choices?.[0]?.message?.content?.trim().toLowerCase();

    if (['positive', 'negative', 'neutral'].includes(content)) {
      return content;
    } else {
      console.warn(`Unexpected sentiment analysis response: ${content}`);
      return 'unknown'; // Return 'unknown' if parsing fails
    }
  } catch (error) {
    // Log the error using the logging utility if available, otherwise console.error
    // Assuming logError is globally accessible or passed in somehow if needed.
    // For now, just console.error.
    console.error('Error performing sentiment analysis via OpenRouter:', error);
    // Don't throw, return 'unknown' to avoid breaking flows that use this
    return 'unknown';
  }
}

/**
 * Updates a system prompt based on the detected sentiment.
 * @param {string} sentiment - The sentiment ('positive', 'negative', 'neutral', 'unknown').
 * @param {string} currentPrompt - The current system prompt.
 * @returns {string} - The updated system prompt.
 */
function updateSystemPrompt(sentiment, currentPrompt) {
  let updatedPrompt = currentPrompt;

  // Append sentiment information only if it's known and not neutral
  if (sentiment === 'positive') {
    updatedPrompt += ' (User mood seems positive)';
  } else if (sentiment === 'negative') {
    updatedPrompt += ' (User mood seems negative)';
  }
  // Optionally handle 'neutral' or 'unknown' if needed, otherwise they don't modify the prompt.

  return updatedPrompt;
}

module.exports = {
  performSentimentAnalysis,
  updateSystemPrompt
};
