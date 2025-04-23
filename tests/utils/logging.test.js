const { logEvent, logError } = require('../../src/utils/logging');
const winston = require('winston');

jest.mock('winston');

describe('logging', () => {
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    winston.createLogger.mockReturnValue(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('should log an event with info level', () => {
      const event = 'TestEvent';
      const message = 'This is a test event';

      logEvent(event, message);

      expect(mockLogger.info).toHaveBeenCalledWith(`${event}: ${message}`);
    });
  });

  describe('logError', () => {
    it('should log an error with error level', () => {
      const event = 'TestError';
      const error = new Error('This is a test error');

      logError(event, error);

      expect(mockLogger.error).toHaveBeenCalledWith(`${event}: ${error.message}`);
    });
  });
});
