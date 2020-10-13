const { expect } = require('chai');
const Email = require('../../../../../server/lib/email/Email');

describe('email', () => {
  context('send Email', () => {
    it('should send email but this doesnt check anything', async function () {
      this.timeout(10000); // email takes longer than 2000ms default time out
      const email = new Email(
        'dangerousdashie@gmail.com',
        'password',
        'somename<dangerousdashie@gmail.com>',
        'dangerousdashie@gmail.com',
        'test mail',
        '<h1>HI</h1>supp!'
      );
      const result = await new Promise((res, rej) => {
        email.transporter.sendMail(email.mailOptions, async (err, info) => {
          if (err) res(err);
          res(info);
        });
      });
      expect(result).to.be.not.an('Error');
    });
  });
});
