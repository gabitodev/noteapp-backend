const loginRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/middleware');

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

  generateToken(response, userForToken);

  return response.status(200).send({username: user.username });
});

module.exports = loginRouter;

