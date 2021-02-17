// newdb is the database we drop
const url = 'mongodb://localhost:27017/test';

// create a client to mongodb
const { MongoClient } = require('mongodb');

const deseeder = () =>
  new Promise((res, rej) => {
    MongoClient.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      (err, db) => {
        if (err) {
          console.log({ err });
          throw err;
        }

        const dbTest = db.db('test');
        // print database name
        console.log(`About to deseed ${dbTest.databaseName} database`);
        // delete the database
        dbTest.dropDatabase((er, result) => {
          if (er) {
            console.log({ er });
            throw er;
          }

          console.log(`Operation Success ? ${result}`);
          res();
          // after all the operations with db, close it.
          db.close();
        });
      }
    );
  });
module.exports = deseeder;
