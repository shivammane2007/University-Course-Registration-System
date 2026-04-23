const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', [], 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, entity_id }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired.', [], 401);
    }
    return sendError(res, 'Invalid token.', [], 401);
  }
};

module.exports = verifyToken;
