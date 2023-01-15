const serverless = require('serverless-http');
const mongoose = require('mongoose');

const app = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/config/logger');

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
});

module.exports.handler = serverless(app);
