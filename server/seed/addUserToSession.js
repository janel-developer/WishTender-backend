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

  // add the user to the session replace with desired user id as string { user: '123456' }
  const userID = '123456';
  const sessionJson = JSON.parse(s.session);
  sessionJson.passport = { user: userID };
  s.session = JSON.stringify(sessionJson);
  await s.save();

  console.log(`User ${userID} added to session`);
  mongoose.disconnect();
})();
