const mongoose = require('mongoose');
const cryptEmail = require('../lib/cryptEmail');
require('dotenv').config({ path: `${__dirname}/./../../.env` });

// mongoose.connect(process.env.PRODUCTION_DB_DSN, { useNewUrlParser: true });
// mongoose.connect(process.env.DEVELOPMENT_DB_DSN, { useNewUrlParser: true });

const Users = require('../models/User.Model');
const Orders = require('../models/Order.Model');
const WishlistItem = require('../models/WishlistItem.Model');

// (async () => {
// const results = await Users.findWithDeleted({});

// results.reduce(async (a, order) => {
//   a.then(async () => {
//     if (order.noteToTender && results.noteToTender.length !== undefined) {
//       return Promise.resolve(a);
//     }

//     order.noteToTender = [results.noteToTender];
//     order.save();
//     const res = await Orders.find({ _id: order._id });
//     return Promise.resolve([...a, res]);
//   });
// }, Promise.resolve(null));

// const getProm = async (order) => {
//   const prom = new Promise((res) => {
//     (async () => {
//       // if (
//       //   order.noteToTender &&
//       //   order.noteToTender.length !== undefined && // is an array
//       //   (order.noteToTender.length === 0 || order.noteToTender[0].length === undefined) // is not array
//       // ) {
//       //   return res(order);
//       // }
//       // if (order.noteToTender && order.noteToTender[0] && order.noteToTender[0].length) {
//       //   order.noteToTender = [...order.noteToTender[0]];
//       // }
//       // if (order.noteToTender && order.noteToTender.length === undefined) {
//       //   order.noteToTender = [order.noteToTender];
//       // }
//       order.total.amount = order.cashFlow.customerCharged.amount;

//       order.total.currency = order.cashFlow.customerCharged.currency;

//       // await order.save();
//       const newOrder = await Orders.find({ _id: order._id });
//       return res(newOrder[0]);
//     })();
//   });
//   return prom;
// };
// (async () => {
//   const orders = await Orders.find({});
//   const converted = orders.filter((order) => order.convertedCart);

//   const prom = converted.reduce(
//     (prevPr, order, i) =>
//       prevPr.then((acc) =>
//         getProm(order).then((resp) => {
//           console.log('some action', i);
//           return [...acc, resp];
//         })
//       ),
//     Promise.resolve([])
//   );
//   prom.then(async (l) => {
//     console.log(l);
//   });
// })();
// (async () => {
//   const results = await Users.find({})
//     .populate({
//       path: 'stripeAccountInfo',
//       model: 'StripeAccountInfo',
//     })
//     .populate({
//       path: 'alias',
//       model: 'Alias',
//     })
//     .exec();
//   const prob = results.filter((u) => {
//     if (
//       (u.stripeAccountInfo &&
//         u.stripeAccountInfo.stripeAccountId &&
//         !u.stripeAccountInfo.activated) ||
//       !u.stripeAccountInfo
//     ) {
//       return true;
//     }
//     return false;
//   });
//   console.log(prob);
// })();
// (async () => {
//   const results = await Users.find({});

//   console.log(results);
// })();

// (async () => {
//   const orders = await Orders.find({});

//   // find all with converted cart
//   const converted = orders.filter((order) => order.convertedCart);

//   converted;

//   console.log(prob);
// })();
// (async () => {
//   const wishlists = await WishlistItem.find({});

//   // find all with converted cart
//   const cat = wishlists.filter((wishlist) => wishlist.category);
//   cat.forEach(async (list) => {
//     list.categories = [...list.categories, list.category];
//     await list.save();
//   });

//   console.log(cat);
// })();
