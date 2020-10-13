const nodemailer = require('nodemailer');

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
    if (process.env.NODE_ENV === 'production') {
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

  send() {
    this.transporter.sendMail(this.mailOptions, (error, info) => {
      if (error) return console.log(error);
      console.log('message sent', info.messageId);
    });
  }
}

module.exports = Email;
