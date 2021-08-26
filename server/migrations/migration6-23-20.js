const mongoose = require('mongoose');
const cryptEmail = require('../lib/cryptEmail');
require('dotenv').config({ path: `${__dirname}/./../../.env` });

mongoose.connect(process.env.PRODUCTION_DB_DSN, { useNewUrlParser: true });
// mongoose.connect(process.env.DEVELOPMENT_DB_DSN, { useNewUrlParser: true });

const Users = require('../models/User.Model');
const Orders = require('../models/Order.Model');

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

const getProm = async (order) => {
  const prom = new Promise((res) => {
    (async () => {
      if (
        order.noteToTender &&
        order.noteToTender.length !== undefined && // is an array
        order.noteToTender[0].length === undefined // is not array
      ) {
        return res(order);
      }
      if (order.noteToTender && order.noteToTender[0] && order.noteToTender[0].length) {
        order.noteToTender = [...order.noteToTender[0]];
      }
      if (order.noteToTender && order.noteToTender.length === undefined) {
        order.noteToTender = [order.noteToTender];
      }
      await order.save();
      const newOrder = await Orders.find({ _id: order._id });
      return res(newOrder[0]);
    })();
  });
  return prom;
};
// (async () => {
//   const results = await Orders.find({});
//   const prom = results.reduce((prevPr, order, i) => {
//     console.log(order);
//     return prevPr.then((acc) =>
//       getProm(order).then((resp) => {
//         console.log('some action', i);
//         return [...acc, resp];
//       })
//     );
//   }, Promise.resolve([]));
//   prom.then(async (l) => {
//     console.log(l);
//   });
// })();
