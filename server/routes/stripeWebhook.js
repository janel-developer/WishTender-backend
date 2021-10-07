const express = require('express');
const webhookRoutes = express.Router();

module.exports = () => {
  webhookRoutes.post('/', (req, res, next) => {
    if (req.body.type === 'charge.succeeded') {
      return res.status(200).send();
    }
    return res.status(200).send();
    // 'transfer.created'
    //     transfer.created [evt_3JhkaeLLBOhef2QN158OQW3b]
    // 2021-10-06 19:37:01   --> customer.created [evt_1JhkbYLLBOhef2QNctAL6VC5]
    // 2021-10-06 19:37:01   --> payment_intent.succeeded [evt_3JhkaeLLBOhef2QN1xpynOMF]
    // 2021-10-06 19:37:01   --> charge.succeeded [evt_3JhkaeLLBOhef2QN1zjYgt6z]
    // 2021-10-06 19:37:02   --> connect payment.created [evt_1JhkbZPq51wqD5PLAfKq0Iej]
    // 2021-10-06 19:37:02   --> checkout.session.completed [evt_1JhkbZLLBOhef2QNbUX7w0XA]
    // 2021-10-06 19:37:02   --> customer.updated
    return res.status(400).send();
  });
  return webhookRoutes;
};
