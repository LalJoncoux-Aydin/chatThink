const jwt = require('jsonwebtoken');
require('dotenv').config();

// Check user by jwt
const auth = (req: any, res: any, next: any) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ msg: 'No authentication token, authorization denied.' });
    }

    const verified = jwt.verify(token, process.env.JWT_TOKEN);

    if (!verified) {
      return res
        .status(401)
        .json({ msg: 'Token verification failed, authorization denied.' });
    }
    req.user = verified.id;
    req.token = token;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  return res;
};

module.exports = auth;
