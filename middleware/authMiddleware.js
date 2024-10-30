const jwt = require('jsonwebtoken');

//Secret key for the jwt token
const secret = process.env.JWT_SECRET || 'getishjdty-uc565gtduf-fv';

//middleware to verify the api token
const verifyToken = (req, res, next) => {
  // get the authorization header
  const authHeader = req.headers['authorization'];
  //Check if the authorization header is present
  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorised user',
    });
    return;
  }
  //extract the token from the header
  const token = authHeader.split(' ')[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorised user',
    });
  }
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    console.log(req.userId);
    next();
  } catch (error) {
    return res.status(401).json({ error: error });
  }
};
module.exports = verifyToken;
