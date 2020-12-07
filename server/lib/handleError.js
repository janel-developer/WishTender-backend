const logger = require('./logger');

module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.log('error', err.message);
  logger.log('debug', `${err.stack.slice(0, 400)}...`);
  if (err.name === 'ApplicationError')
    return res.status(500).send({ error: err.info.resMsg || err.message });
  return res.status(500).send(err);
};
