const { handleSTT, handleTTS, handleChunkedSTT, handleChunkedTTS } = require('../src/api/elevenlabs');
const { sendRequestToOpenRouter, handleChunkedResponse } = require('../src/api/openrouter');
const { handleGeminiRequest } = require('../src/api/gemini');
const { VAD } = require('../src/utils/vad');
const { OAuth } = require('../src/utils/auth');
const { Logger } = require('../src/utils/logging');

describe('Client Tests', () => {
  test('Voice Interaction Controls', () => {
    // Test start, stop, pause, and resume buttons
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton');

    expect(startButton).not.toBeNull();
    expect(stopButton).not.toBeNull();
    expect(pauseButton).not.toBeNull();
    expect(resumeButton).not.toBeNull();
  });

  test('Voice ID Selection', () => {
    // Test voice ID dropdown
    const voiceIdSelect = document.getElementById('voiceId');
    expect(voiceIdSelect).not.toBeNull();
  });

  test('Parameter Adjustments', () => {
    // Test pitch, speed, and volume sliders
    const pitchInput = document.getElementById('pitch');
    const speedInput = document.getElementById('speed');
    const volumeInput = document.getElementById('volume');

    expect(pitchInput).not.toBeNull();
    expect(speedInput).not.toBeNull();
    expect(volumeInput).not.toBeNull();
  });

  test('Transcription and Response Display', () => {
    // Test transcription and response text elements
    const transcriptionText = document.getElementById('transcriptionText');
    const responseText = document.getElementById('responseText');

    expect(transcriptionText).not.toBeNull();
    expect(responseText).not.toBeNull();
  });

  test('WebSocket Communication', () => {
    // Test WebSocket connection and message handling
    const socket = new WebSocket('ws://localhost:3000');
    socket.addEventListener('open', () => {
      expect(socket.readyState).toBe(WebSocket.OPEN);
    });

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('text');
    });
  });

  test('Voice Activity Detection (VAD)', () => {
    // Test VAD functionality
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaStreamSource = audioContext.createMediaStreamSource(new MediaStream());
    const vad = new VAD(mediaStreamSource);

    expect(vad).toHaveProperty('on');
    expect(vad).toHaveProperty('start');
    expect(vad).toHaveProperty('calculateRMS');
  });

  test('OAuth-based Authentication', () => {
    // Test OAuth authentication
    const auth = new OAuth();
    expect(auth).toHaveProperty('authenticate');
    expect(auth).toHaveProperty('verifyToken');
  });

  test('Logging', () => {
    // Test logging functionality
    const logger = new Logger();
    expect(logger).toHaveProperty('log');
    expect(logger).toHaveProperty('error');
  });
});
