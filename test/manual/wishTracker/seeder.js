const mongoose = require('mongoose');
const Alias = require('../../../server/models/Alias.Model');
const Order = require('../../../server/models/Order.Model');
const Wishlist = require('../../../server/models/Wishlist.Model');
const WishlistItem = require('../../../server/models/WishlistItem.Model');
const helper = require('../../helper');
const StripeAccountInfo = require('../../../server/models/StripeAccountInfo.Model');

const seeder = async () => {
  try {
    const user = await helper.createTestUser();
    user.currency = 'USD';
    await user.save();

    const alias = new Alias({
      aliasName: 'Ayal Bark-Cohen',
      user: user._id,
      handle: 'TinyJewBoy',
      currency: 'USD',
      profileImage: '/data/images/profileImages/IMG_9147.jpeg',
    });
    await alias.save();
    user.aliases.push(alias._id);

    const wishlist = await Wishlist.create({
      wishlistName: "Ayal's Wishes",
      user: user._id,
      alias: alias._id,
      wishlistMessage: 'thanks for shopping',
      coverImage: '/data/images/coverImages/IMG_9495.jpeg',
    });

    alias.wishlists.push(wishlist._id);
    user.wishlists.push(wishlist._id);
    await wishlist.save();
    await alias.save();
    await user.save();

    const wishlistItem = await WishlistItem.create({
      itemName: 'Bottega Veneta ribbed-knit Jumper - Farfetch',
      price: '18000',
      currency: 'USD',
      url:
        'https://www.farfetch.com/shopping/women/bottega-veneta-ribbed-knit-jumper-item-16156077.aspx?storeid=9359',
      wishlist: wishlist._id,
      itemImage: '/data/images/itemImages/ca9ffc72-9576-4750-97da-d402865ea1ff.png',
      user: user._id,
      alias: alias._id,
    });

    const wishlistItem2 = await WishlistItem.create({
      itemName: 'Regular Rise 7/8 Legging in Takara Shine',
      price: 9500,
      url: 'https://www.carbon38.com/product/7-8-length-takara-legging-black',
      currency: 'USD',
      itemImage: '/data/images/itemImages/e6be41e7-f714-4944-9e51-1231a39cce8e.png',
      user: user._id,
      alias: alias._id,
      wishlist: wishlist._id,
    });
    const wishlistItem3 = await WishlistItem.create({
      itemName: 'Lisa Von Tang Dress',
      price: 69400,
      url:
        'https://www.farfetch.com/shopping/women/lisa-von-tang-embellished-celestial-motif-mini-dress-item-16047421.aspx?fsb=1?storeid=13150',
      currency: 'USD',
      itemImage: '/data/images/itemImages/e5da9722-0f3b-4a15-b89f-d281706263a6.png',
      user: user._id,
      alias: alias._id,
      wishlist: wishlist._id,
    });

    wishlist.wishlistItems.push(wishlistItem._id);
    wishlist.wishlistItems.push(wishlistItem2._id);
    wishlist.wishlistItems.push(wishlistItem3._id);
    await wishlist.save();

    // dates-----------
    const createDate = (daysFrom, date) => {
      const newDate = date ? new Date(date) : new Date();
      newDate.setDate(newDate.getDate() + daysFrom);
      return newDate.toISOString();
      // return mongoose.Types.ISODate(newDate.toISOString());
    };
    const gift1Purchased = createDate(-7);
    const gift2Purchased = createDate(-1);
    const thirtyDays = createDate(30, gift1Purchased);

    // stripe-----------
    const stripeInfo = await StripeAccountInfo.create({
      accountFees: {
        due: thirtyDays,
        lastAccountFeePaid: gift1Purchased,
        accountFeesPaid: [gift1Purchased],
      },
      activated: true,
      user: user._id,
      stripeAccountId: 'acct_1IELeKQ7N8PzQ4Mk',
      currency: 'USD',
      created_at: createDate(-40),
      updatedAt: gift2Purchased,
    });

    await stripeInfo.save();
    user.stripeAccountInfo = stripeInfo._id;
    await user.save();

    // orders-----------
    const items2 = {};
    items2[wishlistItem2._id.toString()] = {
      item: {
        _id: wishlistItem2._id.toString(),
        itemName: 'Regular Rise 7/8 Legging in Takara Shine',
        price: 9500,
        url: 'https://www.carbon38.com/product/7-8-length-takara-legging-black',
        currency: 'USD',
        wishlist: wishlist._id.toString(),
        itemImage: '/data/images/itemImages/e6be41e7-f714-4944-9e51-1231a39cce8e.png',
        __v: 0,
      },
      qty: 1,
      price: 9500,
    };
    const items3 = {};
    items3[wishlistItem3._id.toString()] = {
      item: {
        _id: wishlistItem3._id.toString(),
        itemName: 'Lisa Von Tang Dress',
        price: 69400,
        url:
          'https://www.farfetch.com/shopping/women/lisa-von-tang-embellished-celestial-motif-mini-dress-item-16047421.aspx?fsb=1?storeid=13150',
        currency: 'USD',
        wishlist: wishlist._id.toString(),
        itemImage: '/data/images/itemImages/e5da9722-0f3b-4a15-b89f-d281706263a6.png',
        __v: 0,
      },
      qty: 1,
      price: 69400,
    };
    const items3Converted = {};
    items3Converted[wishlistItem3._id.toString()] = {
      item: {
        _id: wishlistItem3._id.toString(),
        itemName: 'Lisa Von Tang Dress',
        price: 73334,
        url:
          'https://www.farfetch.com/shopping/women/lisa-von-tang-embellished-celestial-motif-mini-dress-item-16047421.aspx?fsb=1?storeid=13150',
        currency: 'USD',
        wishlist: wishlist._id.toString(),
        itemImage: '/data/images/itemImages/e5da9722-0f3b-4a15-b89f-d281706263a6.png',
        __v: 0,
      },
      qty: 1,
      price: 73334,
    };

    const aliasCartDisplay = {
      wishlists: [alias.wishlists],
      _id: alias._id,
      aliasName: alias.aliasName,
      handle: alias.handle,
      currency: 'USD',
      profileImage: '/data/images/profileImages/4799addd-6a31-4cff-b154-c40fac1abf65.png',
      handle_lowercased: alias.handle_lowercased,
      __v: 1,
    };
    const orders = [
      {
        buyerInfo: {
          email: 'dangerousdashie@gmail.com',
          fromLine: 'dash',
        },
        alias: alias._id,
        noteToWisher: 'You inspire me!',
        processorPaymentID: 'cs_test_b1DXjsz4m2qn8ZLcmH0iCF5kH7OatvSwT6CVCEOXjkKh35yr4yg1Kts7Hn',
        exchangeRate: {
          wishTender: [
            {
              from: 'USD',
              to: 'USD',
              value: null,
              type: 'connect to customer',
            },
          ],
        },
        processedBy: 'Stripe',
        paid: true,
        total: {
          amount: 11053,
          currency: 'USD',
        },
        wishersTender: {
          intended: {
            amount: 9500,
            currency: 'USD',
          },
        },
        cart: {
          items: items2,
          totalQty: 1,
          totalPrice: 9500,
          alias: aliasCartDisplay,
        },
        fees: {
          wishTender: 950,
          stripe: {
            charge: 351,
            connectedAccount: 53,
            internationalTransfer: 0,
            currencyConversion: 0,
            accountDues: 200,
            total: 603,
          },
          total: 1553,
          currency: 'USD',
        },
        createdAt: gift1Purchased,
        __v: 0,
        cashFlow: {
          customerCharged: {
            from: {
              amountBeforeFees: 9500,
              currency: 'USD',
            },
            amountBeforeFees: 9500,
            amount: 11053,
            currency: 'USD',
            exchangeRate: null,
          },
          toPlatform: {
            from: {
              amount: 11053,
              currency: 'USD',
            },
            amount: 11053,
            currency: 'USD',
            exchangeRate: null,
          },
          toConnect: {
            from: {
              amount: 9500,
              currency: 'USD',
            },
            amount: 9500,
            currency: 'USD',
            exchangeRate: null,
          },
          connectAccount: stripeInfo.stripeAccountId,
        },
        paidOn: gift1Purchased,
      },
      {
        buyerInfo: {
          email: 'dangerousdashie@gmail.com',
          fromLine: 'agadashi tofu',
        },
        alias: alias._id,
        noteToWisher: 'Konichiwa',
        processorPaymentID: 'cs_test_b1OvuuHZYof4AQfP8MlSvZaBwwIFeQybWn3hcBDQpS6ri0utOhK2Jh7v8b',
        exchangeRate: {
          wishTender: [
            {
              from: 'USD',
              to: 'JPY',
              value: 105.66865300839447,
              type: 'connect to customer',
            },
          ],
        },
        processedBy: 'Stripe',
        paid: true,
        total: {
          amount: 84440,
          currency: 'JPY',
        },
        wishersTender: {
          intended: {
            amount: 73334,
            currency: 'JPY',
          },
        },
        cart: {
          items: items3,
          totalQty: 1,
          totalPrice: 69400,
          alias: aliasCartDisplay,
        },
        convertedCart: {
          items: items3Converted,
          totalQty: 1,
          totalPrice: 73334,
          alias: aliasCartDisplay,
          convertedTo: 'JPY',
        },
        fees: {
          wishTender: 7333,
          stripe: {
            charge: 2480,
            connectedAccount: 238,
            internationalTransfer: 0,
            currencyConversion: 844,
            accountDues: 211,
            total: 3773,
          },
          total: 11106,
          currency: 'JPY',
        },
        createdAt: gift2Purchased,
        __v: 0,
        cashFlow: {
          customerCharged: {
            from: {
              amountBeforeFees: 69400,
              currency: 'USD',
            },
            amountBeforeFees: 73334,
            amount: 84440,
            currency: 'JPY',
            exchangeRate: 105.66865300839447,
          },
          toPlatform: {
            from: {
              amount: 84440,
              currency: 'JPY',
            },
            amount: 79059,
            currency: 'USD',
            exchangeRate: 0.936277,
          },
          toConnect: {
            from: {
              amount: 68661,
              currency: 'USD',
            },
            amount: 68661,
            currency: 'USD',
            exchangeRate: null,
          },
          connectAccount: stripeInfo.stripeAccountId,
        },
        paidOn: gift2Purchased,
      },
    ];
    const order1 = new Order(orders[0]);
    const order2 = new Order(orders[1]);
    await order1.save();
    await order2.save();

    return {
      user,
      alias,
      wishlist,
      wishlistItem,
      wishlistItem2,
      wishlistItem3,
      stripeInfo,
      order1,
      order2,
    };
  } catch (err) {
    console.log(err);
  }
};

module.exports = seeder;
