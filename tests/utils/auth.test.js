const { authenticateUser, verifyToken } = require('../../src/utils/auth');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

jest.mock('jsonwebtoken');
jest.mock('google-auth-library');

describe('auth', () => {
  let mockGoogleClient;

  beforeEach(() => {
    mockGoogleClient = new OAuth2Client();
    jest.spyOn(mockGoogleClient, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub: 'test-user-id' }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should authenticate user with Google and return token', async () => {
      const code = 'test-code';
      const token = 'test-token';
      jwt.sign.mockReturnValue(token);

      const result = await authenticateUser('google', code);

      expect(mockGoogleClient.verifyIdToken).toHaveBeenCalledWith({
        idToken: code,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(result).toBe(token);
    });

    it('should throw an error for unsupported provider', async () => {
      await expect(authenticateUser('unsupported', 'test-code')).rejects.toThrow(
        'Unsupported provider'
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify token and call next middleware', () => {
      const token = 'test-token';
      const req = { headers: { authorization: token } };
      const res = {};
      const next = jest.fn();
      const decoded = { userId: 'test-user-id' };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, decoded);
      });

      verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET, expect.any(Function));
      expect(req.userId).toBe(decoded.userId);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', () => {
      const req = { headers: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', () => {
      const token = 'test-token';
      const req = { headers: { authorization: token } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Failed to authenticate token'), null);
      });

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to authenticate token' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
