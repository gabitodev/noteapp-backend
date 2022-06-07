const logoutRouter = require('express').Router();
const User = require('../models/user');

logoutRouter.get('/', async (request, response) => {
  const cookies = request.cookies;

  if (!cookies?.refreshToken) return response.sendStatus(401);

  const refreshToken = cookies.refreshToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    return response.clearCookie('refreshToken', {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    });
  }

  response.clearCookie('refreshToken', {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  });

  await User.findByIdAndUpdate(user._id, { refreshToken: null }, { new: true });

  return response.sendStatus(204);
});

module.exports = logoutRouter;