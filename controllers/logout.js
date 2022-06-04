const logoutRouter = require('express').Router();

logoutRouter.post('/', async (request, response) => {
  return response
    .clearCookie('token')
    .status(200)
    .json({ message: 'Successfully logged out' });
});

module.exports = logoutRouter;