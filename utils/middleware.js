const logger = require('./logger');

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  logger.error(error.name);
  if (error.name === 'ValidationError') {
    return response.status(400).json({error: 'username length must be more than 6 characters'});
  } else if (error.name === 'CastError') {
    return response.status(401).json({error: 'invalid user'})
  }
  next(error);
};

module.exports = { errorHandler };