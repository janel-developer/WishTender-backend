const config = require('../server/config')[process.env.NODE_ENV || 'development'];
const app = require('../server/app')(config);
const db = require('../server/lib/db');
const logger = require('../server/lib/logger');
const axios = require('axios');

const port = process.env.PORT || '4000';
app.set('port', port);
db.connect(config.database.dsn)
  .then(() => {
    console.log(`Connected to MongoDB ${config.sitename}`);
    app
      .listen(port)
      .on('listening', () => logger.log('info', `HTTP server listening on port ${port}`));
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = app;
