const mongoose = require('mongoose');
const cryptEmail = require('../lib/cryptEmail');
require('dotenv').config({ path: `${__dirname}/./../../.env` });

mongoose.connect(process.env.PRODUCTION_DB_DSN, { useNewUrlParser: true });

const Users = require('../models/User.Model');

(async () => {
  const results = await Users.findWithDeleted({});
  // const user = await Users.findById('60ec90bbed21ee00041e255a');
  // console.log(user);
  // user.remove();
  //   console.log(results);
  // console.log(user.email);
  // const result = cryptEmail.defs('zausmer@gmail.com');
  // // user.email = 'zausmer@gmail.com';
  // console.log(result);
  // console.log(cryptEmail.defs(cryptEmail.encrypt('zausmer@gmail.com')));
  // user.save();
  // console.log(user.email);
  // console.log(cryptEmail.defs(cryptEmail.encrypt(user.email)));
  // console.log(cryptEmail.defs(cryptEmail.encrypt('zausmer@gmail.com')));
  // console.log(cryptEmail.defs(cryptEmail.encrypt(cryptEmail.encrypt('zausmer@gmail.com'))));
  //   // console.log(email2 === user.email);
  results.forEach(async (user) => {
    console.log('user ', user.email);
    console.log('user ', user._id);

    const unobf = cryptEmail.defs(user.email);
    user.email = unobf;
    console.log(unobf);
    user.save();
  });
})();
