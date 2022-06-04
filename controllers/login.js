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
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(
    userForToken, 
    process.env.SECRET,
    { expiresIn: 60*60 }
  );

  return response
    .cookie('token', token, {
      expires: new Date(Date.now() + 3600000),
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    })
    .status(200)
    .json({message: 'Logged in successfully'})
});

module.exports = loginRouter;

