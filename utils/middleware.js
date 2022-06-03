const logger = require('./logger');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  logger.error(error.name);
  if (error.name === 'ValidationError') {
    return response.status(400).json({error: 'username length must be more than 6 characters'});
  } else if (error.name === 'CastError') {
    return response.status(401).json({error: 'invalid user'})
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({error: 'invalid token'})
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({error: 'invalid token'})
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' });
  }
  next(error);
};


const generateToken = (response, userForToken) => {
  const token = jwt.sign(
    userForToken, 
    process.env.SECRET,
    { expiresIn: 60*60 }
  );
  return response.cookie('token', token, {
    expires: new Date(Date.now() + 3600000),
    secure: false,
    httpOnly: true
  });
};

const userExtractor = async (request, response, next) => {
  const token = request.cookies.token || null;
  if (!token) {
    return response.status(401).json('invalid token');
  } 
  const decodedToken = jwt.verify(token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  request.user = user;
  next();
};

module.exports = { errorHandler, userExtractor, generateToken };