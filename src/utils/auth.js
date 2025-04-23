const jwt = require('jsonwebtoken');
const axios = require('axios');

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticateUser = async (provider, code) => {
  let token;
  switch (provider) {
    case 'google':
      token = await authenticateWithGoogle(code);
      break;
    // Add more providers here if needed
    default:
      throw new Error('Unsupported provider');
  }
  return token;
};

const authenticateWithGoogle = async (code) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: code,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userId = payload['sub'];
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

module.exports = {
  authenticateUser,
  verifyToken,
};
