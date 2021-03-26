const config = require('../server/config')[process.env.NODE_ENV || 'development'];
const db = require('../server/lib/db');
const logger = require('../server/lib/logger');

const port = process.env.PORT || '4000';
db.connect(config.database.dsn).then(() => {
  console.log(`Connected to MongoDB ${config.sitename}`);
});
module.exports = () => {
  const app = require('../server/app')(config);
  app.set('port', port);

  return {
    server: app
      .listen(port)
      .on('listening', () => logger.log('info', `HTTP server listening on port ${port}`)),
    app,
  };
};
