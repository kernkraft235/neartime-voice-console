const axios = require('axios');

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

async function handleSTT(audioBlob) {
  try {
    const response = await axios.post(`${ELEVENLABS_API_URL}/stt`, audioBlob, {
      headers: {
        'Content-Type': 'audio/webm',
        'Authorization': `Bearer ${ELEVENLABS_API_KEY}`
      }
    });
    return response.data.text;
  } catch (error) {
    console.error('Error in STT:', error);
    throw error;
  }
}

async function handleTTS(text, voiceId, parameters) {
  try {
    const response = await axios.post(`${ELEVENLABS_API_URL}/tts`, {
      text,
      voiceId,
      parameters
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ELEVENLABS_API_KEY}`
      }
    });
    return response.data.audio;
  } catch (error) {
    console.error('Error in TTS:', error);
    throw error;
  }
}

async function handleChunkedSTT(audioChunks) {
  try {
    const transcriptions = [];
    for (const chunk of audioChunks) {
      const text = await handleSTT(chunk);
      transcriptions.push(text);
    }
    return transcriptions.join(' ');
  } catch (error) {
    console.error('Error in chunked STT:', error);
    throw error;
  }
}

async function handleChunkedTTS(text, voiceId, parameters) {
  try {
    const chunks = text.match(/.{1,100}/g); // Split text into chunks of 100 characters
    const audioChunks = [];
    for (const chunk of chunks) {
      const audio = await handleTTS(chunk, voiceId, parameters);
      audioChunks.push(audio);
    }
    return new Blob(audioChunks, { type: 'audio/webm' });
  } catch (error) {
    console.error('Error in chunked TTS:', error);
    throw error;
  }
}

module.exports = {
  handleSTT,
  handleTTS,
  handleChunkedSTT,
  handleChunkedTTS
};
