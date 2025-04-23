const { sendRequestToOpenRouter, handleChunkedResponse } = require('../../src/api/openrouter');
const axios = require('axios');
jest.mock('axios');

describe('OpenRouter API', () => {
  describe('sendRequestToOpenRouter', () => {
    it('should return response data from OpenRouter', async () => {
      const requestData = { prompt: 'Hello, world!' };
      const response = { data: { text: 'Hello, user!' } };
      axios.post.mockResolvedValue(response);

      const result = await sendRequestToOpenRouter(requestData);
      expect(result).toEqual(response.data);
    });

    it('should throw an error if OpenRouter request fails', async () => {
      const requestData = { prompt: 'Hello, world!' };
      axios.post.mockRejectedValue(new Error('OpenRouter Error'));

      await expect(sendRequestToOpenRouter(requestData)).rejects.toThrow('OpenRouter Error');
    });
  });

  describe('handleChunkedResponse', () => {
    it('should return concatenated response chunks from OpenRouter', async () => {
      const requestData = { prompt: 'Hello, world!' };
      const response = { data: 'Hello, user! How are you today?' };
      axios.post.mockResolvedValue(response);

      const result = await handleChunkedResponse(requestData);
      expect(result).toBe('Hello, user! How are you today?');
    });

    it('should throw an error if chunked response handling fails', async () => {
      const requestData = { prompt: 'Hello, world!' };
      axios.post.mockRejectedValue(new Error('Chunked Response Error'));

      await expect(handleChunkedResponse(requestData)).rejects.toThrow('Chunked Response Error');
    });
  });
});
