const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { handleSTT, handleTTS } = require('../api/elevenlabs');
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
    const audio = await handleTTS(req.body.text, req.body.voiceId, req.body.parameters);
    res.json({ audio });
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
    const { image, description } = await handleGeminiRequest(req.body.prompt);
    res.json({ image, description });
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
