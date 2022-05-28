const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;
  const userExist = await User.findOne({ username });

  // Validations
  const hasNumber = /\d/;
  const hasSpecialCharacters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (userExist) {
    return response.status(400).json({error: 'username already exist'});
  } else if (!(username && password)) {
    return response.status(400).json({error: 'username and password are required'});
  } else if (!hasNumber.test(password)) {
    return response.status(400).json({error: 'password requires at leats 1 number'});
  } else if (!hasSpecialCharacters.test(password)) {
    return response.status(400).json({error: 'password requires at leats 1 special character'});
  }

  // password hash
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // User creation in MongoDB
  const user = new User({
    username,
    name,
    passwordHash
  });

  // Send user 
  const savedUser = await user.save();
  return response.status(201).json(savedUser);
});

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id);
  response.status(200).json(user);
});

module.exports = usersRouter;