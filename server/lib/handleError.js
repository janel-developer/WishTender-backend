const logger = require('./logger');

module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.log('Error:', err);
  return res.status(500).render('500', {
    title: '500',
  });
};
