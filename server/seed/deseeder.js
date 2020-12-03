// newdb is the database we drop
const url = 'mongodb://localhost:27017/development';

// create a client to mongodb
const { MongoClient } = require('mongodb');

// make client connect to mongo service
MongoClient.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, db) => {
    console.log({ err });
    if (err) throw err;
    console.log('Connected to Database!');
    const dbDev = db.db('development');
    // print database name
    console.log(`db: ${dbDev}`);
    // print database name
    console.log(`db object points to the database : ${dbDev.databaseName}`);
    // delete the database
    dbDev.dropDatabase((er, result) => {
      console.log(`Error : ${er}`);
      if (er) throw er;
      console.log(`Operation Success ? ${result}`);
      // after all the operations with db, close it.
      db.close();
    });
  }
);
