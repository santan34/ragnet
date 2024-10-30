const jwt = require('jsonwebtoken');
const redisClient = require('../utils/redisClient'); // Import Redis client

// Secret key for the JWT token
const secret =
  process.env.JWT_SECRET_2 || 'getishjdtrerfghuytfdcfv-i dighggytr';

// Middleware to verify the API token
const verifyApiToken = async (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers['authorization'];

  // Check if the header is present
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorised bot',
    });
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  // Check if the token is present
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorised bot',
    });
  }

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await redisClient.getValue(`blacklist_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        error: 'Token is blacklisted',
      });
    }

    // Verify the token using the secret key
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    req.botId = decoded.botId;
    console.log(req.botId);

    // Call the next middleware function
    next();
  } catch (error) {
    return res.status(401).json({ error: error });
  }
};

module.exports = verifyApiToken;
