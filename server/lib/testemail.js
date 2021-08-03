const nodemailer = require('nodemailer');
require('dotenv').config();
// process.env.NODE_ENV = 'production';

// const { getMaxListeners } = require('../models/Order.Model');
// const ReceiptEmail = require('./email/ReceiptEmail');
const ThankYouEmail = require('./email/ThankYouEmail');
// const { ApplicationError } = require('./Error');
const logger = require('./logger');

class Email {
  /**
   * Constructor
   * @param {string} email
   * @param {string} pass email password
   */
  constructor(email, to, pass) {
    this.user = email;
    this.to = to;
    this.pass = pass;
  }

  // eslint-disable-next-line class-methods-use-this
  get mailOptions() {
    return {
      from: this.user,
      to: 'dangerousdashie@gmail.com',
      subject: 'notification',
      html: 'You received a new purchase in your shop.',
    };
  }

  get transporter() {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      auth: {
        user: this.user,
        pass: this.pass,
        //   pass: 'MUE7VQbz4UKj',
      },
    });

    return transporter;
  }

  send(cb) {
    this.transporter.sendMail(
      this.mailOptions,
      cb ||
        ((error, info) => {
          if (error) console.log(error);
          if (info) logger.log('silly', `message sent: ${info.messageId}`);
          this.transporter.close();
        })
    );
  }

  sendSync() {
    return new Promise((res, rej) =>
      this.transporter.sendMail(this.mailOptions, (error, info) => {
        if (error) rej(error);
        else res(info);
        this.transporter.close();
      })
    );
  }
}

// (async () => {
//   const email = new ThankYouEmail(
//     'dangerousdashie@gmail.com',
//     'Dashiell',
//     `http://localhost:4000/dashiell`,
//     'HI!!!!',
//     'https://wishtender-dev.s3.amazonaws.com/images/thankyouImageAttachments/d18deed6-b796-4b31-8234-f8681396b248.png'
//   );
//   await email.sendSync().then((inf, err) => {
//     console.log(inf, err);
//   });
// })();
// email.send();
// const email = new Email(
//   process.env.RECEIPT_EMAIL,
//   'dangerousdashie@gmail.com',
//   process.env.RECEIPT_PASSWORD
// );
// // await email.sendSync().then((inf) => inf);

// email.send();
// (async (req, res, next) => {
//   // module.exports.testEmail = async (req, res, next) => {
//   //   const email = new Email2(process.env.CONFIRM_EMAIL, process.env.CONFIRM_PASSWORD);
//   //   const email = new Email2(process.env.THANKYOU_EMAIL, process.env.THANKYOU_PASSWORD);
// })();
