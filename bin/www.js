const config = require('../server/config')[process.env.NODE_ENV || 'development'];
const app = require('../server/app')(config);
const db = require('../server/lib/db');

const port = process.env.PORT || '4000';
app.set('port', port);

db.connect(config.database.dsn)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on Port: ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
