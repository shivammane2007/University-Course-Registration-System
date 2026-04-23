const authService = require('./auth.service');
const asyncWrapper = require('../../utils/asyncWrapper');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const loginController = asyncWrapper(async (req, res) => {
  const { user_id, password, role } = req.body;
  if (!user_id || !password || !role) {
    return sendError(res, 'user_id, password, and role are required', [], 400);
  }
  const result = await authService.login(user_id, password, role);
  return sendSuccess(res, result, 'Login successful');
});

const refreshController = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  return sendSuccess(res, result, 'Token refreshed');
});

const logoutController = asyncWrapper(async (req, res) => {
  // Stateless JWT: client-side clearing is sufficient. 
  // For production, maintain a server-side blacklist.
  return sendSuccess(res, null, 'Logged out successfully');
});

module.exports = { loginController, refreshController, logoutController };
