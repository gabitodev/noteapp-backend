const loginRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username });

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash);

  if (!(username &&  passwordCorrect)) {
    return response.status(401).json({error: 'invalid username or password'});
  };

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });

  const refreshToken = jwt.sign(userForToken, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

  response.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 8.64e+7),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  });

  await User.findByIdAndUpdate(user._id, {refreshToken: refreshToken}, {new: true});

  return response.status(200).json({accessToken, username: user.username});
});

module.exports = loginRouter;

