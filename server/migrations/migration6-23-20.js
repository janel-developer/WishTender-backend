const mongoose = require('mongoose');
const cryptEmail = require('../lib/cryptEmail');
require('dotenv').config({ path: `${__dirname}/./../../.env` });

mongoose.connect(process.env.DEVELOPMENT_DB_DSN, { useNewUrlParser: true });

const Users = require('../models/User.Model');

(async () => {
  const results = await Users.findWithDeleted({});
  //   console.log(results);
  results.forEach(async (user) => {
    user.email = cryptEmail.encrypt(user.email);

    await user.save();
  });
})();
