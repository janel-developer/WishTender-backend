const { info } = require('./logger');
const logger = require('./logger');
const { ApplicationError } = require('./Error');

module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const a = ApplicationError;
  console.log(a);
  logger.log('error', err.message);
  logger.log('debug', `${err.stack.slice(0, 400)}...`);
  if (err.constructor.name === 'ApplicationError') {
    if (err.info.err) {
      logger.log('debug', `Application Error info.err: ${err.info.err.stack.slice(0, 400)}...}`);
    }
    if (err.info.err2) {
      // this is only used for connectAccounts.js line 188
      logger.log('debug', `Application Error info.err2: ${err.info.err2.stack.slice(0, 400)}...}`);
    }
    return res.status(500).send(err.info.resMsg || err.message);
  }
  return res.status(500).send(err.message);
};
