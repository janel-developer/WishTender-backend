// //detect currency
// const agent = chai.request.agent(www);

// describe('add items to cart checkout', () => {
//   context('detect currency and language', () => {});
//   agent.post(`/session/locale`).send({ countryCode: 'UK' }).set('Accept-Language', 'en');
// });
// app.post('/locale', (req, res, next) => {
//   const countryCode = req.body.countryCode; // from extreme-ip-lookup.com
//   const languageCode = req.acceptsLanguages()[0]; // from browser settings
//   const currency = countryCurrency(countryCode);
//   req.session.currency = currency;
//   req.session.language = languageCode;
//   res.send();
// });

// // en UK
