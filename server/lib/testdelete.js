const logger = require('./logger');
const err = new Error('message to read');
const obj = { err };
logger.log('silly', obj.err.stack);
