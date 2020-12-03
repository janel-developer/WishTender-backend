const mongoose = require('mongoose');

const { Schema } = mongoose;

const SessionSchema = new Schema({ session: String, _id: String }, { strict: false });
const Session = mongoose.model('sessions', SessionSchema, 'sessions');
(async () => {
  await mongoose.connect('mongodb://localhost/development', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  });

  // find the first session in the database
  const sessions = await Session.find({});
  const s = sessions[0];

  // alternatively find the session by id
  // const s = await Session.findOne({ _id: process.env.ID });

  // delete the user from the session
  const sessionJson = JSON.parse(s.session);
  delete sessionJson.passport;
  s.session = JSON.stringify(sessionJson);
  await s.save();

  console.log(`User deleted from to session`);
  mongoose.disconnect();
})();
