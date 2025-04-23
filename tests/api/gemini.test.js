const { handleGeminiRequest } = require('../../src/api/gemini');
const axios = require('axios');
jest.mock('axios');

describe('Gemini API', () => {
  describe('handleGeminiRequest', () => {
    it('should return image and description from prompt', async () => {
      const prompt = 'Generate an image of a sunset over the ocean';
      const response = { data: { image: 'dummy_image_data', description: 'A beautiful sunset over the ocean' } };
      axios.post.mockResolvedValue(response);

      const result = await handleGeminiRequest(prompt);
      expect(result).toEqual({ image: 'dummy_image_data', description: 'A beautiful sunset over the ocean' });
    });

    it('should throw an error if Gemini request fails', async () => {
      const prompt = 'Generate an image of a sunset over the ocean';
      axios.post.mockRejectedValue(new Error('Gemini Error'));

      await expect(handleGeminiRequest(prompt)).rejects.toThrow('Gemini Error');
    });
  });
});
