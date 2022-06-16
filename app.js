require('express-async-errors');
require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MONGODB_URI } = require('./utils/config');
const logger = require('./utils/logger');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const notesRouter = require('./controllers/notes');
const logoutRouter = require('./controllers/logout');
const refreshRouter = require('./controllers/refresh');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');
const morgan = require('morgan');

(async () => {
  await mongoose.connect(MONGODB_URI);
  logger.info('Connected to MongoDB');
})();

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('tiny'));

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/refresh', refreshRouter);
app.use('/api/notes', middleware.userExtractor, notesRouter);

app.use(middleware.errorHandler);

module.exports = app;