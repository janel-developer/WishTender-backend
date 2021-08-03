const Email = require('./Email');
require('dotenv').config();

class ThankYouEmail extends Email {
  /**
   * Constructor
   * @param {string} to email `some@email.com`
   * @param {string} aliasName The wisher's alias name
   * @param {string} aliasUrl The wisher's alias's profile page or wishlist url
   * @param {string} thankYouMessage thank you text from the wisher
   * @param {string} imageURL url of the image to attach
   */
  constructor(to, aliasName, aliasUrl, thankYouMessage, imageURL) {
    const pass = process.env.THANKYOU_PASSWORD;
    const email = process.env.THANKYOU_EMAIL;
    const date = new Date();
    const from = `WishTender Wishlist <${email}>`;
    const subject = `Thank You from ${aliasName} ${date.getMonth()}/${date.getDate()}`;
    const html = `<h3> You received a "Thank You" message from <a href = '${aliasUrl}'>${aliasName}</a> for your gift on <a href = '${aliasUrl}'>WishTender</a>.</h3> <p> Replies to this message will send to WishTender support.</p> <p>Thank you message:</p>
    <div style = "float:left; width: 80%;
    maxWidth: 400px;">${
      thankYouMessage &&
      `<div  style="color: white;
    background: rgb(1, 133, 169);
    width: 100%;
    border-radius: ${imageURL ? '20px 20px 0px 0px' : '20px 20px 20px 0'};
    padding: 10px;
    margin-top: 20px;
    font-weight: 700;
    box-sizing: border-box;">${thankYouMessage}</div>`
    }
    ${
      imageURL
        ? `<img style="width: 100%; border-radius: ${
            thankYouMessage ? '0px 0px 20px 0px' : '20px 20px 20px 0'
          };"
         src="cid:attachedImage123456" />`
        : ''
    }
    </div>`;
    super(email, pass, from, to, subject, html);
    this.imageURL = imageURL;
  }

  get mailOptions() {
    const opts = {
      from: this.from,
      to: this.to,
      subject: this.subject,
      html: this.html,
    };
    if (this.imageURL)
      opts.attachments = [
        {
          filename: 'image.png',
          path: this.imageURL,
          cid: 'attachedImage123456',
        },
      ];
    return opts;
  }
}

module.exports = ThankYouEmail;

// const Email = require('./Email');
// require('dotenv').config();

// class ThankYouEmail extends Email {
//   /**
//    * Constructor
//    * @param {string} to email `some@email.com`
//    * @param {string} aliasName The wisher's alias name
//    * @param {string} aliasUrl The wisher's alias's profile page or wishlist url
//    * @param {string} thankYouMessage thank you text from the wisher
//    * @param {string} imageURL url of the image to attach
//    */
//   constructor(to, aliasName, aliasUrl, thankYouMessage, imageURL) {
//     const pass = process.env.THANKYOU_PASSWORD;
//     const email = process.env.THANKYOU_EMAIL;
//     const from = `WishTender Wishlist <${email}>`;
//     const subject = `Thank You from ${aliasName}`;
//     const cidId = Math.floor(100000 + Math.random() * 900000);
//     const html = `<h3> You received a "Thank You" message from <a href = '${aliasUrl}'>${aliasName}</a> for your gift.</h3> <p> Replies to this message will send to WishTender support.</p> <p>Thank you message:</p>
//     <p  style="color: white;
//     background: rgb(1, 133, 169);
//     width: 80%;
//     float: left;
//     border-radius: ${imageURL ? '20px 20px 0px 0px' : '20px 20px 20px 0'};
//     padding: 10px;
//     margin-top: 20px;
//     font-weight: 700;">"${thankYouMessage}"</p>
//     ${
//       imageURL
//         ? `<img style="float: left; width: 80%; border-radius: ${
//             thankYouMessage ? '0px 0px 0px 20px' : '20px 20px 20px 0'
//           };
//          src="cid:attachedImage${cidId}" />`
//         : ''
//     }
//     `;
//     super(email, pass, from, to, subject, html);
//     this.imageURL = imageURL;
//     this.cidId = cidId;
//   }

//   get mailOptions() {
//     const opts = {
//       from: this.from,
//       to: this.to,
//       subject: this.subject,
//       html: this.html,
//       // messageId: Math.floor(100000 + Math.random() * 900000),
//       references: [],
//     };
//     if (this.imageURL)
//       opts.attachments = [
//         {
//           filename: 'image.png',
//           path: this.imageURL,
//           cid: `attachedImage${this.cidId}`,
//         },
//       ];
//     return opts;
//   }
// }

// module.exports = ThankYouEmail;
