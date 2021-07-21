const nodemailer = require('nodemailer');
const ReceiptEmail = require('./email/ReceiptEmail');
const ThankYouEmail = require('./email/ThankYouEmail');
const { ApplicationError } = require('./Error');
const logger = require('./logger');

class Email2 {
  /**
   * Constructor
   * @param {string} email
   * @param {string} pass email password
   * @param {string} from `"some name"<some@email.com>`
   * @param {string} to `some@email.com`
   * @param {string} subject
   * @param {string} html The Html for the email
   */
  constructor(email, pass) {
    this.user = email;
    this.pass = pass;
  }

  // eslint-disable-next-line class-methods-use-this
  get mailOptions() {
    return {
      from: this.user,
      to: 'dangerousdashie@gmail.com',
      subject: 'email',
      html: 'Embedded image: <img src="cid:unique@kreata.ee"/>',
      attachments: [
        {
          filename: 'image.png',
          path:
            'https://wishtender.s3.us-east-2.amazonaws.com/images/coverImages/0ab49471-74d2-4944-9d27-ed27869f302d.png',
          cid: 'unique@kreata.ee', //same cid value as in the html img src
        },
      ],
    };
  }

  get transporter() {
    let transporter;
    if (process.env.NODE_ENV !== 'production') {
      logger.log('debug', 'email sending through zoho');
      logger.log('debug', `Message: ${this.html}`);
      transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
          user: this.user,
          pass: this.pass,
          //   pass: 'MUE7VQbz4UKj',
        },
      });
    } else {
      logger.log('debug', 'email sending through ethereal');
      logger.log('debug', `Message: ${this.html}`);
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.TEST_EMAIL,
          //   pass: 'MUE7VQbz4UKj',
          pass: process.env.TEST_PASSWORD,
        },
      });
    }
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

(async (req, res, next) => {
  // module.exports.testEmail = async (req, res, next) => {
  //   const email = new Email2(process.env.CONFIRM_EMAIL, process.env.CONFIRM_PASSWORD);
  //   const email = new Email2(process.env.THANKYOU_EMAIL, process.env.THANKYOU_PASSWORD);
  const email = new Email2(process.env.RECEIPT_EMAIL, process.env.RECEIPT_PASSWORD);
  try {
    const info = await email.sendSync().then((inf) => inf);
    if (info) {
      console.log(info);
    }
  } catch (err) {
    console.log(err);
    // return next(
    //   new ApplicationError({ err }, `Couldn't send receipt to tender because of an internal error.`)
    // );
  }
  // email.send();
})();
