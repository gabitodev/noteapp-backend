const refreshRouter = require('express').Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

refreshRouter.get('/', async (request, response) => {
  const cookies = request.cookies;

  if (!cookies?.refreshToken) return response.sendStatus(401);

  const refreshToken = cookies.refreshToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    return response.sendStatus(401);
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  if (decoded.username !== user.username) return response.sendStatus(403);

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });

  return response.status(200).json({ accessToken, username: user.username });
});

module.exports = refreshRouter;