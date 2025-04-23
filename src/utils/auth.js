const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// --- Environment Variable Checks ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

if (!GOOGLE_CLIENT_ID) {
  console.warn('GOOGLE_CLIENT_ID environment variable not set. Google authentication will fail.');
}
if (!JWT_SECRET) {
  console.warn('JWT_SECRET environment variable not set. Token verification will fail.');
  // Potentially throw an error here in production environments
  // throw new Error('JWT_SECRET environment variable is required.');
}

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

/**
 * Authenticates a user based on the provider and code/token.
 * @param {string} provider - The authentication provider (e.g., 'google').
 * @param {string} idToken - The ID token received from the provider (for Google).
 * @returns {Promise<string>} - A JWT for the authenticated user.
 */
const authenticateUser = async (provider, idToken) => {
  let token;
  switch (provider) {
    case 'google':
      if (!googleClient) throw new Error('Google Client ID not configured.');
      token = await authenticateWithGoogle(idToken);
      break;
    // Add more providers here if needed
    default:
      throw new Error('Unsupported provider');
  }
  return token;
};

/**
 * Verifies a Google ID token and generates a local JWT.
 * @param {string} idToken - The Google ID token.
 * @returns {Promise<string>} - A local JWT.
 */
const authenticateWithGoogle = async (idToken) => {
  if (!JWT_SECRET) throw new Error('JWT Secret not configured.');
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google ID token payload.');
    }
    const userId = payload['sub']; // Google User ID
    // Generate your application's JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    return token;
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    throw new Error('Google authentication failed.');
  }
};

/**
 * Express middleware to verify the JWT from the Authorization header.
 */
const verifyToken = (req, res, next) => {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not set, cannot verify token.');
    return res.status(500).json({ error: 'Authentication configuration error.' });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided or invalid format' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }
    // Attach user ID to the request object
    req.userId = decoded.userId;
    next();
  });
};

module.exports = {
  authenticateUser,
  verifyToken,
};
