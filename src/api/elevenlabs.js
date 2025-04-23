const axios = require('axios');

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.warn('ELEVENLABS_API_KEY environment variable not set. ElevenLabs API calls will fail.');
}

/**
 * Handles Speech-to-Text (STT) request using ElevenLabs API.
 * NOTE: Verify the '/stt' endpoint and request format against official ElevenLabs documentation.
 * ElevenLabs is primarily known for TTS, and their STT offering might differ.
 * @param {Blob} audioBlob - The audio data as a Blob.
 * @returns {Promise<string>} - The transcribed text.
 */
async function handleSTT(audioBlob) {
  if (!ELEVENLABS_API_KEY) throw new Error('ElevenLabs API key not configured.');
  try {
    // TODO: Verify this endpoint and request structure with ElevenLabs documentation
    const response = await axios.post(`${ELEVENLABS_API_URL}/stt`, audioBlob, {
      headers: {
        'Content-Type': audioBlob.type || 'audio/webm', // Use Blob type or default
        'xi-api-key': ELEVENLABS_API_KEY // Use xi-api-key header
      },
      responseType: 'json' // Expect JSON response for STT
    });
    // TODO: Verify response structure based on actual API behavior
    return response.data.text;
  } catch (error) {
    console.error('Error in ElevenLabs STT:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Handles Text-to-Speech (TTS) request using ElevenLabs API.
 * @param {string} text - The text to synthesize.
 * @param {string} voiceId - The ID of the voice to use.
 * @param {object} [voice_settings] - Optional voice settings (stability, similarity_boost, etc.).
 * @param {string} [model_id] - Optional model ID (defaults to eleven_multilingual_v2).
 * @returns {Promise<Buffer>} - The synthesized audio data as a Buffer.
 */
async function handleTTS(text, voiceId, voice_settings = null, model_id = 'eleven_multilingual_v2') {
  if (!ELEVENLABS_API_KEY) throw new Error('ElevenLabs API key not configured.');
  if (!voiceId) throw new Error('Voice ID is required for TTS.');

  try {
    const requestBody = {
      text: text,
      model_id: model_id,
    };
    if (voice_settings) {
      requestBody.voice_settings = voice_settings;
    }

    const response = await axios.post(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Accept': 'audio/mpeg' // Request MP3 audio
      },
      responseType: 'arraybuffer' // Expect raw audio data
    });
    return Buffer.from(response.data); // Return audio as Buffer
  } catch (error) {
    console.error('Error in ElevenLabs TTS:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Fetches the list of available voices from the ElevenLabs API.
 * @returns {Promise<object>} - The list of voices.
 */
async function getVoices() {
  if (!ELEVENLABS_API_KEY) throw new Error('ElevenLabs API key not configured.');
  try {
    const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });
    return response.data; // Contains a 'voices' array
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = {
  handleSTT,
  handleTTS,
  getVoices
};
