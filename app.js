require('express-async-errors');
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { MONGODB_URI } = require('./utils/config');
const logger = require('./utils/logger');
const usersRouter = require('./controllers/users');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');

(async () => {
  await mongoose.connect(MONGODB_URI);
  logger.info('Connected to MongoDB');
})();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);

app.use(middleware.errorHandler);

module.exports = app;