const VAD = require('../../src/utils/vad');

describe('VAD', () => {
  let vad;
  let mockMediaStream;

  beforeEach(() => {
    mockMediaStream = new MediaStream();
    vad = new VAD(mockMediaStream);
  });

  afterEach(() => {
    vad = null;
    mockMediaStream = null;
  });

  describe('constructor', () => {
    it('should initialize VAD with default values', () => {
      expect(vad.speaking).toBe(false);
      expect(vad.speechThreshold).toBe(0.1);
      expect(vad.silenceThreshold).toBe(0.05);
      expect(vad.noiseReductionEnabled).toBe(true);
    });
  });

  describe('calculateRMS', () => {
    it('should calculate RMS value of the audio data', () => {
      const dataArray = new Uint8Array([128, 128, 128, 128]);
      const rms = vad.calculateRMS(dataArray);
      expect(rms).toBeCloseTo(0);
    });
  });

  describe('applyNoiseReduction', () => {
    it('should apply noise reduction to the audio data', () => {
      const dataArray = new Uint8Array([128, 128, 128, 128]);
      vad.applyNoiseReduction(dataArray);
      // Add assertions for noise reduction logic once implemented
    });
  });

  describe('on', () => {
    it('should add speech listener', () => {
      const listener = jest.fn();
      vad.on('speech', listener);
      expect(vad.speechListeners).toContain(listener);
    });

    it('should add silence listener', () => {
      const listener = jest.fn();
      vad.on('silence', listener);
      expect(vad.silenceListeners).toContain(listener);
    });
  });

  describe('setSpeechThreshold', () => {
    it('should set speech threshold', () => {
      vad.setSpeechThreshold(0.2);
      expect(vad.speechThreshold).toBe(0.2);
    });
  });

  describe('setSilenceThreshold', () => {
    it('should set silence threshold', () => {
      vad.setSilenceThreshold(0.1);
      expect(vad.silenceThreshold).toBe(0.1);
    });
  });

  describe('enableNoiseReduction', () => {
    it('should enable noise reduction', () => {
      vad.enableNoiseReduction(true);
      expect(vad.noiseReductionEnabled).toBe(true);
    });

    it('should disable noise reduction', () => {
      vad.enableNoiseReduction(false);
      expect(vad.noiseReductionEnabled).toBe(false);
    });
  });
});
