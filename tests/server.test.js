const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const { handleSTT, handleTTS } = require('../src/api/elevenlabs');
const { handleOpenRouterRequest } = require('../src/api/openrouter');
const { handleGeminiRequest } = require('../src/api/gemini');
const { authenticateUser, verifyToken } = require('../src/utils/auth');
const { logEvent, logError } = require('../src/utils/logging');

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

describe('Server API', () => {
  beforeAll((done) => {
    server.listen(3001, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test('POST /api/stt should return text from audio', async () => {
    const audio = 'dummy_audio_data';
    const response = await request(app)
      .post('/api/stt')
      .set('Authorization', 'Bearer dummy_token')
      .send({ audio });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('text');
  });

  test('POST /api/tts should return audio from text', async () => {
    const text = 'Hello, world!';
    const voiceId = 'dummy_voice_id';
    const parameters = {};
    const response = await request(app)
      .post('/api/tts')
      .set('Authorization', 'Bearer dummy_token')
      .send({ text, voiceId, parameters });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('audio');
  });

  test('POST /api/openrouter should return response from OpenRouter', async () => {
    const data = { prompt: 'Hello, world!' };
    const response = await request(app)
      .post('/api/openrouter')
      .set('Authorization', 'Bearer dummy_token')
      .send(data);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
  });

  test('POST /api/gemini should return image and description', async () => {
    const prompt = 'Generate an image of a sunset';
    const response = await request(app)
      .post('/api/gemini')
      .set('Authorization', 'Bearer dummy_token')
      .send({ prompt });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('image');
    expect(response.body).toHaveProperty('description');
  });

  test('POST /api/auth should return token', async () => {
    const provider = 'google';
    const code = 'dummy_code';
    const response = await request(app)
      .post('/api/auth')
      .send({ provider, code });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
