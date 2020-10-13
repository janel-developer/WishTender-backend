// It is GET method, you have to write like that
//    app.get('/confirmation/:email/:token',confirmEmail)

// It is GET method, you have to write like that
//    app.get('/confirmation/:email/:token',confirmEmail)
const Token = require('../models/Token.Model');
const User = require('../models/User.Model');

exports.confirmEmail = function (req, res, next) {
  Token.findOne({ token: req.params.token }, function (err, token) {
    // token is not found into database i.e. token may have expired
    if (!token) {
      return res.status(400).send({
        msg:
          'Your verification link may have expired. Please click on resend for verify your Email.',
      });
    }
    // if token is found then check valid user

    User.findOne({ _id: token.user, email: req.params.email }, function (err, user) {
      // not valid user
      if (!user) {
        return res
          .status(401)
          .send({ msg: 'We were unable to find a user for this verification. Please SignUp!' });
      }
      // user is already verified
      if (user.confirmed) {
        return res.status(200).send('User has been already verified. Please Login');
      }
      // verify user

      // change isVerified to true
      user.confirmed = true;
      user.save(function (err) {
        // error occur
        if (err) {
          return res.status(500).send({ msg: err.message });
        }
        // account successfully verified

        return res.status(200).send('Your account has been successfully verified');
      });
    });
  });
};
