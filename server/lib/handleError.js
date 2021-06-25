const { info } = require('./logger');
const logger = require('./logger');

module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.log('error', err.message);
  logger.log('debug', `${err.stack.slice(0, 400)}...`);
  if (err.name === 'ApplicationError') {
    if (info.err) {
      logger.log('debug', `Application Error info.err: ${info.err.stack.slice(0, 400)}...}`);
    }
    if (info.err2) {
      // this is only used for connectAccounts.js line 188
      logger.log('debug', `Application Error info.err2: ${info.err2.stack.slice(0, 400)}...}`);
    }
    return res.status(500).send({ error: err.info.resMsg || err.message });
  }
  return res.status(500).send(err.message);
};
