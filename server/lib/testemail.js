const nodemailer = require('nodemailer');
const ReceiptEmail = require('./email/ReceiptEmail');
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
      html: 'sending email',
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

module.exports.testEmail = async () => {
  //   const email = new Email2(process.env.CONFIRM_EMAIL, process.env.CONFIRM_PASSWORD);
  //   const email = new Email2(process.env.THANKYOU_EMAIL, process.env.THANKYOU_PASSWORD);
  const email = new Email2(process.env.RECEIPT_EMAIL, process.env.RECEIPT_PASSWORD);
  try {
    const receiptEmail = new ReceiptEmail({});
    const info = await receiptEmail.sendSync().then((inf) => inf);
    if (info) {
      console.log(info);
    }
  } catch (err) {
    console.log(err);
  }
  //   email.send();
};
