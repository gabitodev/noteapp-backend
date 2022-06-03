require('express-async-errors');
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { MONGODB_URI } = require('./utils/config');
const logger = require('./utils/logger');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const notesRouter = require('./controllers/notes');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');
const morgan = require('morgan');

(async () => {
  await mongoose.connect(MONGODB_URI);
  logger.info('Connected to MongoDB');
})();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/notes', middleware.userExtractor, notesRouter);

app.use(middleware.errorHandler);
app.use(morgan('tiny'));

module.exports = app;