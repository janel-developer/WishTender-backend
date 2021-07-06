const mongoose = require('mongoose');
const cryptEmail = require('../lib/cryptEmail');
require('dotenv').config({ path: `${__dirname}/./../../.env` });

mongoose.connect(process.env.DEVELOPMENT_DB_DSN, { useNewUrlParser: true });

const Users = require('../models/User.Model');

(async () => {
  // const results = await Users.findWithDeleted({});
  // const user = await Users.findById('60e48529ad64150004b17fa1');
  console.log(user);
  user.remove();
  //   console.log(results);
  // results.forEach(async (user) => {
  // console.log('user ', user.email);
  // const email = cryptEmail.defs(user.email);
  // console.log(email);
  // });
})();
