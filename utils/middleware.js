const logger = require('./logger');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const errorHandler = (error, request, response, next) => {
  logger.error('error name: ', error.name);
  logger.error('error message:', error.message);
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

const userExtractor = async (request, response, next) => {
  const token = request.cookies.token;
  if (!token) {
    return response.status(403).end();
  } 
  const decodedToken = jwt.verify(token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  request.user = user;
  return next();
};

module.exports = { errorHandler, userExtractor };