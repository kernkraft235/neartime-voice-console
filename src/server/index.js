const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { handleSTT, handleTTS, getVoices } = require('../api/elevenlabs');
const { handleOpenRouterRequest } = require('../api/openrouter');
const { handleGeminiRequest } = require('../api/gemini');
const { authenticateUser, verifyToken } = require('../utils/auth');
const { logEvent, logError } = require('../utils/logging');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());

app.post('/api/stt', verifyToken, async (req, res) => {
  try {
    const text = await handleSTT(req.body.audio);
    res.json({ text });
  } catch (error) {
    logError('STT Error', error);
    res.status(500).json({ error: 'STT Error' });
  }
});

app.post('/api/tts', verifyToken, async (req, res) => {
  try {
    // Pass voice_settings instead of parameters
    const audioBuffer = await handleTTS(req.body.text, req.body.voiceId, req.body.voice_settings);
    // Send the audio buffer directly with the correct content type
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (error) {
    logError('TTS Error', error);
    res.status(500).json({ error: 'TTS Error' });
  }
});

app.post('/api/openrouter', verifyToken, async (req, res) => {
  try {
    const response = await handleOpenRouterRequest(req.body);
    res.json(response);
  } catch (error) {
    logError('OpenRouter Error', error);
    res.status(500).json({ error: 'OpenRouter Error' });
  }
});

app.post('/api/gemini', verifyToken, async (req, res) => {
  try {
    // handleGeminiRequest now returns only the generated text string
    const generatedText = await handleGeminiRequest(req.body.prompt);
    // Return the text in a standard 'text' field
    res.json({ text: generatedText });
  } catch (error) {
    logError('Gemini Error', error);
    res.status(500).json({ error: 'Gemini Error' });
  }
});

app.post('/api/auth', async (req, res) => {
  try {
    const token = await authenticateUser(req.body.provider, req.body.code);
    res.json({ token });
  } catch (error) {
    logError('Authentication Error', error);
    res.status(500).json({ error: 'Authentication Error' });
  }
});

// New endpoint to fetch ElevenLabs voices
app.get('/api/elevenlabs/voices', verifyToken, async (req, res) => {
  try {
    const voicesData = await getVoices();
    res.json(voicesData); // Send the full voices data structure
  } catch (error) {
    logError('ElevenLabs Voices Error', error);
    res.status(500).json({ error: 'Error fetching ElevenLabs voices' });
  }
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    logEvent('WebSocket Message', message);
    // Handle WebSocket messages here
  });

  ws.on('close', () => {
    logEvent('WebSocket Closed');
  });

  ws.on('error', (error) => {
    logError('WebSocket Error', error);
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
