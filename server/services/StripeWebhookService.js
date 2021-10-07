const stripe = require('stripe')(
  process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);

// left off
// still need to change old payment object
const chargeSucceeded = async (req,res,next) => {
  const req.stripeExpandedSession = await stripe.checkout.sessions.retrieve(req.query.session_id, {
    expand: ['payment_intent.charges.data'],
  });
  const chargeId = req.stripeExpandedSession.payment_intent.charges.data[0].id;
  const charge = await stripe.charges.retrieve(chargeId, {
    expand: [
      'balance_transaction',
      'transfer.balance_transaction',
      'transfer.destination_payment.balance_transaction',
    ],
  });

  const toPlatform = {
    from: { amount: charge.amount, currency: charge.currency.toUpperCase() },
    amount: charge.balance_transaction.amount,
    currency: charge.balance_transaction.currency.toUpperCase(),
    exchangeRate: charge.balance_transaction.exchange_rate,
  };
  const toConnect = {
    from: {
      amount: charge.transfer.destination_payment.amount,
      currency: charge.transfer.destination_payment.currency.toUpperCase(),
    },
    amount: charge.transfer.destination_payment.balance_transaction.amount,
    currency: charge.transfer.destination_payment.balance_transaction.currency.toUpperCase(),
    exchangeRate: charge.transfer.destination_payment.balance_transaction.exchange_rate,
  };

  // eslint-disable-next-line camelcase
  const { session_id, alias_id } = req.query;

  let alias;

  // update user account fee due
  const order = await orderService.getOrder({ processorPaymentID: session_id });
  const customerCharged = {
    from: { amountBeforeFees: order.cart.totalPrice, currency: order.cart.alias.currency },
    amountBeforeFees: order.convertedCart ? order.convertedCart.totalPrice : order.cart.totalPrice,
    amount: charge.amount,
    currency: charge.currency.toUpperCase(),
    exchangeRate: order.exchangeRate.wishTender.find((e) => e.type === 'connect to customer').value,
  };
  // to prevent this request from going through twice
  if (!order.paid) {
    // add the stripe exchange rate
    order.paid = true;
    const time = new Date(req.stripeExpandedSession.payment_intent.charges.data[0].created * 1000);
    order.paidOn = time;
    order.expireAt = undefined;
    // order.wishersTender.sent = amountToWisher;
    order.cashFlow = {
      customerCharged,
      toPlatform,
      toConnect,
      connectAccount: charge.destination,
    };

    // what is this for?
    order.exchangeRate.stripe = [
      {
        from: req.stripeExpandedSession.currency.toUpperCase(),
        to: toPlatform.currency,
        value: toPlatform.exchangeRate,
        type: 'customer to platform',
      },
      {
        from: 'USD',
        to: toConnect.currency.toUpperCase(),
        value: toConnect.exchangeRate,
        type: 'platform to connect',
      },
      {
        from: toConnect.currency.toUpperCase(),
        to: req.stripeExpandedSession.currency.toUpperCase(),
        value: 1 / (toConnect.exchangeRate * toPlatform.exchangeRate),
        type: 'connect to customer',
      },
    ];
    await order.save();
    // add order number to items
    // orders.cart.items.
    let itemsUpdated = 0;

    const items = Object.keys(order.cart.items);
    await new Promise((resolve) => {
      items.forEach(async (itemId) => {
        await WishlistItem.update({ _id: itemId }, { $push: { orders: order } });
        itemsUpdated += 1;
        if (itemsUpdated === items.length) resolve();
      });
    });
    // wishlistItemService.updateWishlistItem()

    // removing because this was a crazy idea
    // if (order.fees.stripe.accountDues === 200) {
    //   alias = await AliasModel.findOne({ _id: alias_id })
    //     .populate({
    //       path: 'user',
    //       model: 'User',
    //       populate: {
    //         path: 'stripeAccountInfo',
    //         model: 'StripeAccountInfo',
    //       },
    //     })
    //     .exec();
    //   let inThirtyDays = new Date(time);
    //   inThirtyDays = new Date(inThirtyDays.setDate(inThirtyDays.getDate() + 30));
    //   alias.user.stripeAccountInfo.accountFees = {
    //     due: inThirtyDays,
    //     lastAccountFeePaid: time,
    //     accountFeesPaid: [...alias.user.stripeAccountInfo.accountFees.accountFeesPaid, time],
    //   };

    //   await alias.user.stripeAccountInfo.save();
    // } else {
    alias = await AliasModel.findOne({ _id: alias_id })
      .populate({
        path: 'user',
        model: 'User',
      })
      .exec();
    // }
    // send receipt to notify gifter
    try {
      const receiptEmail = new ReceiptEmail(order);
      const info = await receiptEmail.sendSync().then((inf) => inf);
      if (info) {
        console.log(info);
      }
    } catch (err) {
      return next(
        new ApplicationError(
          { err },
          `Couldn't send receipt to tender because of an internal error.`
        )
      );
    }

    // send notification email to notify wisher
    const wishersEmail = alias.user.email;
    try {
      const tenderReceivedEmail = new TenderReceivedEmail(order, wishersEmail);
      const info = await tenderReceivedEmail.sendSync().then((inf) => inf);
      if (info) {
        console.log(info);
      }
    } catch (err) {
      return next(
        new ApplicationError(
          { err },
          `Couldn't send notification to wisher because of an internal error.`
        )
      );
    }
  }
  const session = await Session.findOne({ _id: order.session });
  if (session) {
    const jsonSession = JSON.parse(session.session);
    if (jsonSession.cart && Object.keys(jsonSession.cart.aliasCarts).length <= 1) {
      delete jsonSession.cart;
      session.session = JSON.stringify(jsonSession);
    } else if (jsonSession.cart) {
      delete jsonSession.cart.aliasCarts[alias_id];
      session.session = JSON.stringify(jsonSession);
    }
    await session.save();
  }
  // // if the order was paid??
  // if (!alias) {
  //   alias = await AliasModel.findOne({ _id: alias_id })
  //     .populate({
  //       path: 'user',
  //       model: 'User',
  //     })
  //     .exec();
  // }
};
module.exports = { chargeSucceeded };
