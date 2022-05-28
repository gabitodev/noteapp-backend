const logger = require('./logger');

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  if (error.name === 'ValidationError') {
    response.status(400).json({error: 'username length must be more than 6 characters'})
  }
  next(error);
};

module.exports = { errorHandler };