const { handleSTT, handleTTS, handleChunkedSTT, handleChunkedTTS } = require('../../src/api/elevenlabs');
const axios = require('axios');
jest.mock('axios');

describe('ElevenLabs API', () => {
  describe('handleSTT', () => {
    it('should return text from audio', async () => {
      const audioBlob = new Blob(['dummy_audio_data'], { type: 'audio/webm' });
      const response = { data: { text: 'Hello, world!' } };
      axios.post.mockResolvedValue(response);

      const text = await handleSTT(audioBlob);
      expect(text).toBe('Hello, world!');
    });

    it('should throw an error if STT fails', async () => {
      const audioBlob = new Blob(['dummy_audio_data'], { type: 'audio/webm' });
      axios.post.mockRejectedValue(new Error('STT Error'));

      await expect(handleSTT(audioBlob)).rejects.toThrow('STT Error');
    });
  });

  describe('handleTTS', () => {
    it('should return audio from text', async () => {
      const text = 'Hello, world!';
      const voiceId = 'dummy_voice_id';
      const parameters = {};
      const response = { data: { audio: 'dummy_audio_data' } };
      axios.post.mockResolvedValue(response);

      const audio = await handleTTS(text, voiceId, parameters);
      expect(audio).toBe('dummy_audio_data');
    });

    it('should throw an error if TTS fails', async () => {
      const text = 'Hello, world!';
      const voiceId = 'dummy_voice_id';
      const parameters = {};
      axios.post.mockRejectedValue(new Error('TTS Error'));

      await expect(handleTTS(text, voiceId, parameters)).rejects.toThrow('TTS Error');
    });
  });

  describe('handleChunkedSTT', () => {
    it('should return concatenated text from audio chunks', async () => {
      const audioChunks = [
        new Blob(['dummy_audio_data_1'], { type: 'audio/webm' }),
        new Blob(['dummy_audio_data_2'], { type: 'audio/webm' })
      ];
      const responses = [
        { data: { text: 'Hello' } },
        { data: { text: 'world!' } }
      ];
      axios.post
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1]);

      const text = await handleChunkedSTT(audioChunks);
      expect(text).toBe('Hello world!');
    });

    it('should throw an error if chunked STT fails', async () => {
      const audioChunks = [
        new Blob(['dummy_audio_data_1'], { type: 'audio/webm' }),
        new Blob(['dummy_audio_data_2'], { type: 'audio/webm' })
      ];
      axios.post.mockRejectedValue(new Error('Chunked STT Error'));

      await expect(handleChunkedSTT(audioChunks)).rejects.toThrow('Chunked STT Error');
    });
  });

  describe('handleChunkedTTS', () => {
    it('should return concatenated audio from text chunks', async () => {
      const text = 'Hello, world!';
      const voiceId = 'dummy_voice_id';
      const parameters = {};
      const responses = [
        { data: { audio: 'dummy_audio_data_1' } },
        { data: { audio: 'dummy_audio_data_2' } }
      ];
      axios.post
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1]);

      const audio = await handleChunkedTTS(text, voiceId, parameters);
      expect(audio).toBeInstanceOf(Blob);
    });

    it('should throw an error if chunked TTS fails', async () => {
      const text = 'Hello, world!';
      const voiceId = 'dummy_voice_id';
      const parameters = {};
      axios.post.mockRejectedValue(new Error('Chunked TTS Error'));

      await expect(handleChunkedTTS(text, voiceId, parameters)).rejects.toThrow('Chunked TTS Error');
    });
  });
});
