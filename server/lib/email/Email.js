const nodemailer = require('nodemailer');
const logger = require('../logger');

class Email {
  /**
   * Constructor
   * @param {string} email
   * @param {string} pass email password
   * @param {string} from `"some name"<some@email.com>`
   * @param {string} to `some@email.com`
   * @param {string} subject
   * @param {string} html The Html for the email
   */
  constructor(email, pass, from, to, subject, html) {
    this.user = email;
    this.pass = pass;
    this.subject = subject;
    this.from = from;
    this.to = to;
    this.html = html;
  }

  get mailOptions() {
    return {
      from: this.from,
      to: this.to,
      subject: this.subject,
      html: this.html,
    };
  }

  get transporter() {
    let transporter;
    if (
      process.env.NODE_ENV === 'production' ||
      (process.env.NODE_ENV === 'development' && process.env.REMOTE === 'true')
    ) {
      logger.log('debug', 'email sending through zoho');
      logger.log('debug', `Message: ${this.html}`);
      transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
          user: this.user,
          pass: this.pass,
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

module.exports = Email;
