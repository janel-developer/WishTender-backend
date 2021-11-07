const fs = require('fs');
const html = require('./html.js');
const ExchangeRateAPI = require('../../ExchangeRate-Api');

const exchangeRateAPI = new ExchangeRateAPI();
const Currency = require('../../currency');

const currency = new Currency(exchangeRateAPI);

const orderMulti = {
  _id: '60de7e383f60077c802d570b',
  seen: true,
  buyerInfo: { email: 'dangerousdashie@gmail.com', fromLine: 'd' },
  alias: '60dcc78c21664e46edc1c76d',
  noteToWisher: { message: 'love', read: null },
  session: 'IaUX7m3w2Zxc-C1UOYzrwvaTASS1MmJ0',
  processorPaymentID: 'cs_test_b13qEyaVYoNOI14DeF7CxXr0L5T3581y3H072zexIACYH4IJQUcyCi4sFL',
  exchangeRate: {
    wishTender: [{ from: 'USD', to: 'USD', value: null, type: 'connect to customer' }],
  },
  processedBy: 'Stripe',
  paid: true,
  total: { amount: 647450, currency: 'USD' },
  wishersTender: { intended: { amount: 570000, currency: 'USD' } },
  cart: {
    items: {
      '60dcc81f21664e46edc1c76f': {
        item: {
          orders: ['60de729f01cd96000476f62f', '60de733756b9f47c26c8ea64'],
          deleted: false,
          _id: '60dcc81f21664e46edc1c76f',
          itemName: 'Miu Miu Printed Shirt Dress - Farfetch',
          price: 285000,
          url:
            'https://www.farfetch.com/shopping/women/miu-miu-printed-shirt-dress-item-16761547.aspx?storeid=11251',
          currency: 'USD',
          wishlist: '60dcc78c21664e46edc1c76e',
          itemImage:
            'https://wishtender-dev.s3.amazonaws.com/images/itemImages/12017e35-8485-4a00-870f-7a6894775462.png',
          __v: 0,
        },
        qty: 2,
        price: 570000,
      },
    },
    totalQty: 2,
    totalPrice: 570000,
    alias: {
      wishlists: ['60dcc78c21664e46edc1c76e'],
      deleted: false,
      _id: '60dcc78c21664e46edc1c76d',
      handle: 'test5',
      aliasName: 'test5',
      currency: 'USD',
      handle_lowercased: 'test5',
      __v: 1,
      profileImage:
        'https://wishtender-dev.s3.amazonaws.com/images/profileImages/4bde047a-cea5-4f68-ad93-089d1eddc546.png',
    },
  },
  fees: {
    wishTender: 57000,
    stripe: {
      charge: 18806,
      connectedAccount: 1644,
      internationalTransfer: 0,
      currencyConversion: 0,
      accountDues: 0,
      total: 20450,
    },
    total: 77450,
    currency: 'USD',
  },
  createdAt: '2021-07-02T02:47:20.488Z',
  __v: 1,
  cashFlow: {
    customerCharged: {
      from: { amountBeforeFees: 570000, currency: 'USD' },
      amountBeforeFees: 570000,
      amount: 647450,
      currency: 'USD',
      exchangeRate: null,
    },
    toPlatform: {
      from: { amount: 647450, currency: 'USD' },
      amount: 647450,
      currency: 'USD',
      exchangeRate: null,
    },
    toConnect: {
      from: { amount: 570000, currency: 'USD' },
      amount: 570000,
      currency: 'USD',
      exchangeRate: null,
    },
    connectAccount: 'acct_1J8XbwPtXdHhLMUf',
  },
  paidOn: '2072-12-31T05:50:51.105Z',
  noteToTender: [[]],
};

const orderSin = {
  _id: '60df4090e1e3ae89ae79e37f',
  seen: true,
  buyerInfo: { email: 'dangerousdashie@gmail.com', fromLine: 'd' },
  alias: '60dcc78c21664e46edc1c76d',
  noteToWisher: { message: 'j', read: null },
  session: 'ic4F-wM0OxY5qCFVkfyzetivHUhLXm1R',
  processorPaymentID: 'cs_test_b1HSYKld58Eut6lW8nq2w77W5pLg1CW3z3PGhna8VdP035wBjU6jeEOXMC',
  exchangeRate: {
    wishTender: [{ from: 'USD', to: 'USD', value: null, type: 'connect to customer' }],
  },
  processedBy: 'Stripe',
  paid: true,
  total: { amount: 323753, currency: 'USD' },
  wishersTender: { intended: { amount: 285000, currency: 'USD' } },
  cart: {
    items: {
      '60dcc81f21664e46edc1c76f': {
        item: {
          orders: [
            '60de729f01cd96000476f62f',
            '60de733756b9f47c26c8ea64',
            '60de75d53f60077c802d570a',
            '60de7e383f60077c802d570b',
            '60de7e383f60077c802d570b',
            '60de7e383f60077c802d570b',
            '60de7e383f60077c802d570b',
            '60de7e383f60077c802d570b',
            '60df4042441c3a0004455a3f',
          ],
          deleted: false,
          _id: '60dcc81f21664e46edc1c76f',
          itemName: 'Miu Miu Printed Shirt Dress - Farfetch',
          price: 285000,
          url:
            'https://www.farfetch.com/shopping/women/miu-miu-printed-shirt-dress-item-16761547.aspx?storeid=11251',
          currency: 'USD',
          wishlist: '60dcc78c21664e46edc1c76e',
          itemImage:
            'https://wishtender-dev.s3.amazonaws.com/images/itemImages/12017e35-8485-4a00-870f-7a6894775462.png',
          __v: 0,
        },
        qty: 1,
        price: 285000,
      },
    },
    totalQty: 1,
    totalPrice: 285000,
    alias: {
      wishlists: ['60dcc78c21664e46edc1c76e'],
      deleted: false,
      _id: '60dcc78c21664e46edc1c76d',
      handle: 'test5',
      aliasName: 'test5',
      currency: 'USD',
      handle_lowercased: 'test5',
      __v: 1,
      profileImage:
        'https://wishtender-dev.s3.amazonaws.com/images/profileImages/4bde047a-cea5-4f68-ad93-089d1eddc546.png',
    },
  },
  fees: {
    wishTender: 28500,
    stripe: {
      charge: 9419,
      connectedAccount: 834,
      internationalTransfer: 0,
      currencyConversion: 0,
      accountDues: 0,
      total: 10253,
    },
    total: 38753,
    currency: 'USD',
  },
  createdAt: '2021-07-02T16:36:32.653Z',
  __v: 2,
  cashFlow: {
    customerCharged: {
      from: { amountBeforeFees: 285000, currency: 'USD' },
      amountBeforeFees: 285000,
      amount: 323753,
      currency: 'USD',
      exchangeRate: null,
    },
    toPlatform: {
      from: { amount: 323753, currency: 'USD' },
      amount: 323753,
      currency: 'USD',
      exchangeRate: null,
    },
    toConnect: {
      from: { amount: 285000, currency: 'USD' },
      amount: 285000,
      currency: 'USD',
      exchangeRate: null,
    },
    connectAccount: 'acct_1J8XbwPtXdHhLMUf',
  },
  paidOn: '2073-01-01T09:14:05.708Z',
  noteToTender: [{ message: 'j', sent: '2021-07-02T19:34:11.866Z' }],
};

const orderConverted = {
  _id: '615e05d7cc25170004301bf3',
  seen: true,
  noteToTender: [],
  buyerInfo: { email: 'dangerousdashie@gmail.com', fromLine: 'Dash' },
  alias: '60e0b52734b7180004920107',
  noteToWisher: { message: 'jiji', read: null },
  session: 'phXC4Kgee-zPzv5-KI1ZBksMomclRDpo',
  processorPaymentID: 'cs_test_b1m5qiV3LqZI9sXWVA2SknagtdmhZaMZqHgzpLxiMaOmOLybDozIfRTxP2',
  exchangeRate: {
    wishTender: [
      { from: 'USD', to: 'EUR', value: 0.8635922603721683, type: 'connect to customer' },
    ],
  },
  processedBy: 'Stripe',
  paid: true,
  wishersTender: { intended: { amount: 2400, aliasCurrency: 'USD' } },
  total: { amount: 2280, currency: 'EUR' },
  cart: {
    items: {
      '61562515b741b5000446ca1f': {
        item: {
          orders: [
            '615ca4750cee9d6b4c5b4d2a',
            '615cfe94a2795e849be5b130',
            '615d002713fdf38757674b6e',
            '615d008b13fdf38757674b6f',
            '615d02411ed19288733e708c',
            '615de67dd73a5b98e6db700e',
            '615df59564021da8fe82271d',
            '615df62264021da8fe82271e',
          ],
          deleted: false,
          _id: '61562515b741b5000446ca1f',
          itemName: 'Sequin glitter bumbag | Etsy',
          price: 2400,
          url:
            'https://www.etsy.com/listing/754255175/sequin-glitter-bumbag?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=sparkly+fanny+pack&ref=sr_gallery-4-24&organic_search_click=1',
          currency: 'USD',
          wishlist: '60e0b52734b7180004920108',
          itemImage:
            'https://wishtender-dev.s3.amazonaws.com/images/itemImages/3f94090b-4f69-4ea1-aa10-bb649afcd56d.png',
          __v: 0,
        },
        qty: 1,
        price: 2400,
      },
    },
    totalQty: 1,
    totalPrice: 2400,
    alias: {
      wishlists: ['60e0b52734b7180004920108'],
      deleted: false,
      _id: '60e0b52734b7180004920107',
      handle: 'dashiell',
      aliasName: 'dashie ',
      currency: 'USD',
      handle_lowercased: 'dashiell',
      __v: 1,
      profileImage:
        'https://wishtender-dev.s3.amazonaws.com/images/profileImages/6606824b-8fee-41d2-a167-f3429060e213.png',
    },
  },
  convertedCart: {
    items: {
      '61562515b741b5000446ca1f': {
        item: {
          orders: [
            '615ca4750cee9d6b4c5b4d2a',
            '615cfe94a2795e849be5b130',
            '615d002713fdf38757674b6e',
            '615d008b13fdf38757674b6f',
            '615d02411ed19288733e708c',
            '615de67dd73a5b98e6db700e',
            '615df59564021da8fe82271d',
            '615df62264021da8fe82271e',
          ],
          deleted: false,
          _id: '61562515b741b5000446ca1f',
          itemName: 'Sequin glitter bumbag | Etsy',
          price: 2073,
          url:
            'https://www.etsy.com/listing/754255175/sequin-glitter-bumbag?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=sparkly+fanny+pack&ref=sr_gallery-4-24&organic_search_click=1',
          currency: 'USD',
          wishlist: '60e0b52734b7180004920108',
          itemImage:
            'https://wishtender-dev.s3.amazonaws.com/images/itemImages/3f94090b-4f69-4ea1-aa10-bb649afcd56d.png',
          __v: 0,
          convertedTo: 'EUR',
        },
        qty: 1,
        price: 2073,
      },
    },
    totalQty: 1,
    totalPrice: 2073,
    alias: {
      wishlists: ['60e0b52734b7180004920108'],
      deleted: false,
      _id: '60e0b52734b7180004920107',
      handle: 'dashiell',
      aliasName: 'dashie ',
      currency: 'USD',
      handle_lowercased: 'dashiell',
      __v: 1,
      profileImage:
        'https://wishtender-dev.s3.amazonaws.com/images/profileImages/6606824b-8fee-41d2-a167-f3429060e213.png',
    },
    convertedTo: 'EUR',
  },
  fees: { wishTender: 240, total: 2640, currency: 'EUR' },
  createdAt: '2021-10-06T20:23:51.955Z',
  __v: 0,
  cashFlow: {
    customerCharged: {
      from: { amountBeforeFees: 2400, currency: 'USD' },
      amountBeforeFees: 2073,
      amount: 2280,
      currency: 'EUR',
      exchangeRate: 0.8635922603721683,
    },
    toPlatform: {
      from: { amount: 2280, currency: 'EUR' },
      amount: 2605,
      currency: 'USD',
      exchangeRate: 1.14264,
    },
    toConnect: {
      from: { amount: 2369, currency: 'USD' },
      amount: 2369,
      currency: 'USD',
      exchangeRate: null,
    },
    connectAccount: 'acct_1J9EHBPq51wqD5PL',
  },
  paidOn: '2021-10-06T20:24:19Z',
};
// order.cart.alias
// order.cashFlow.customerCharged.amount

const converteds = [
  {
    _id: '60df942c4fce90a2793a6672',
    seen: true,
    buyerInfo: { email: 'dangerousdashie@gmail.com', fromLine: 'd' },
    alias: '60dcc78c21664e46edc1c76d',
    noteToWisher: { message: 'thanks!', read: null },
    session: 'MHRmvED_Bz8BxLVQqolfst9yYkJBmgT9',
    processorPaymentID: 'cs_test_b17k2OAsIOeizGpvxdfw97IT3V9bHZZtBFUTHxL3zskH1Gywhn27N6kMhh',
    exchangeRate: {
      wishTender: [
        { from: 'USD', to: 'AUD', value: 1.3356484573260317, type: 'connect to customer' },
      ],
    },
    processedBy: 'Stripe',
    paid: true,
    total: { amount: 16500, currency: 'AUD' },
    wishersTender: { intended: { amount: 15000, currency: 'AUD' } },
    cart: {
      items: {
        '60df8f5f4fce90a2793a6671': {
          item: {
            orders: [],
            deleted: false,
            _id: '60df8f5f4fce90a2793a6671',
            itemName: 'Ashley Williams crystal-embellished Drop Earrings - Farfetch',
            price: 5000,
            url:
              'https://www.farfetch.com/shopping/women/ashley-williams-crystal-embellished-drop-earrings-item-16064267.aspx?storeid=9359',
            currency: 'USD',
            wishlist: '60dcc78c21664e46edc1c76e',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/e602e496-0444-4b46-aa57-36eee1a9c089.png',
            __v: 0,
          },
          qty: 1,
          price: 5000,
        },
        '60df6c75ec10b6000477f02c': {
          item: {
            orders: ['60df72e932d36e9ca2da9d6e', '60df81b0831e21a20817c780'],
            deleted: false,
            _id: '60df6c75ec10b6000477f02c',
            itemName: 'Bottega Veneta car-print short-sleeved Shirt - Farfetch',
            price: 10000,
            url:
              'https://www.farfetch.com/shopping/women/bottega-veneta-car-print-short-sleeved-shirt-item-16907899.aspx?storeid=10503',
            currency: 'USD',
            wishlist: '60dcc78c21664e46edc1c76e',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/0bb89dae-b14c-487f-a08c-a5feb6015d65.png',
            __v: 0,
          },
          qty: 1,
          price: 10000,
        },
      },
      totalQty: 2,
      totalPrice: 15000,
      alias: {
        wishlists: ['60dcc78c21664e46edc1c76e'],
        deleted: false,
        _id: '60dcc78c21664e46edc1c76d',
        handle: 'test5',
        aliasName: 'test5',
        currency: 'USD',
        handle_lowercased: 'test5',
        __v: 1,
        profileImage:
          'https://wishtender-dev.s3.amazonaws.com/images/profileImages/4bde047a-cea5-4f68-ad93-089d1eddc546.png',
      },
    },
    convertedCart: {
      items: {
        '60df8f5f4fce90a2793a6671': {
          item: {
            orders: [],
            deleted: false,
            _id: '60df8f5f4fce90a2793a6671',
            itemName: 'Ashley Williams crystal-embellished Drop Earrings - Farfetch',
            price: 6678,
            url:
              'https://www.farfetch.com/shopping/women/ashley-williams-crystal-embellished-drop-earrings-item-16064267.aspx?storeid=9359',
            currency: 'USD',
            wishlist: '60dcc78c21664e46edc1c76e',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/e602e496-0444-4b46-aa57-36eee1a9c089.png',
            __v: 0,
            convertedTo: 'AUD',
          },
          qty: 1,
          price: 6678,
        },
        '60df6c75ec10b6000477f02c': {
          item: {
            orders: ['60df72e932d36e9ca2da9d6e', '60df81b0831e21a20817c780'],
            deleted: false,
            _id: '60df6c75ec10b6000477f02c',
            itemName: 'Bottega Veneta car-print short-sleeved Shirt - Farfetch',
            price: 13356,
            url:
              'https://www.farfetch.com/shopping/women/bottega-veneta-car-print-short-sleeved-shirt-item-16907899.aspx?storeid=10503',
            currency: 'USD',
            wishlist: '60dcc78c21664e46edc1c76e',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/0bb89dae-b14c-487f-a08c-a5feb6015d65.png',
            __v: 0,
            convertedTo: 'AUD',
          },
          qty: 1,
          price: 13356,
        },
      },
      totalQty: 2,
      totalPrice: 20034,
      alias: {
        wishlists: ['60dcc78c21664e46edc1c76e'],
        deleted: false,
        _id: '60dcc78c21664e46edc1c76d',
        handle: 'test5',
        aliasName: 'test5',
        currency: 'USD',
        handle_lowercased: 'test5',
        __v: 1,
        profileImage:
          'https://wishtender-dev.s3.amazonaws.com/images/profileImages/4bde047a-cea5-4f68-ad93-089d1eddc546.png',
      },
      convertedTo: 'AUD',
    },
    fees: { wishTender: 1500, total: 16500, currency: 'AUD' },
    createdAt: '2021-07-02T22:33:16.634Z',
    __v: 2,
    cashFlow: {
      customerCharged: {
        from: { amountBeforeFees: 15000, currency: 'USD' },
        amountBeforeFees: 20034,
        amount: 22037,
        currency: 'AUD',
        exchangeRate: 1.3356484573260317,
      },
      toPlatform: {
        from: { amount: 22037, currency: 'AUD' },
        amount: 16288,
        currency: 'USD',
        exchangeRate: 0.739109,
      },
      toConnect: {
        from: { amount: 14807, currency: 'USD' },
        amount: 14807,
        currency: 'USD',
        exchangeRate: null,
      },
      connectAccount: 'acct_1J8XbwPtXdHhLMUf',
    },
    paidOn: '2073-01-01T21:06:43.282Z',
    noteToTender: [{ message: 'omg', sent: '2021-07-02T22:34:43.693Z' }],
  },
  {
    _id: '60df9fe0f43f5d0004529d06',
    seen: true,
    buyerInfo: { email: 'dangerousdashie@gmail.com', fromLine: 'Dash' },
    alias: '60df9aa1dbcca1000421e3a8',
    noteToWisher: { message: 'mate', read: null },
    session: '9EessOqhVeu1khFMPtdMFx6EFb5dWAv0',
    processorPaymentID: 'cs_test_b1JffBcstwc25ojepkAQiL7JNGwXpmH7uTiaZxoeMIwRM8YnCWaCvHzuk1',
    exchangeRate: {
      wishTender: [
        { from: 'USD', to: 'AUD', value: 1.3356484573260317, type: 'connect to customer' },
      ],
    },
    processedBy: 'Stripe',
    paid: true,
    total: { amount: 27500, currency: 'AUD' },
    wishersTender: { intended: { amount: 25000, currency: 'AUD' } },
    cart: {
      items: {
        '60df9b9adbcca1000421e3ab': {
          item: {
            orders: ['60df9dbedbcca1000421e3ae'],
            deleted: false,
            _id: '60df9b9adbcca1000421e3ab',
            itemName: 'Fendi Pleated high-waisted Shorts - Farfetch',
            price: 10000,
            url:
              'https://www.farfetch.com/shopping/women/fendi-pleated-high-waisted-shorts-item-16366888.aspx?storeid=9671',
            currency: 'USD',
            wishlist: '60df9aa1dbcca1000421e3a9',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/9420335c-a824-420a-a5a6-c935eb618795.png',
            __v: 0,
          },
          qty: 1,
          price: 10000,
        },
        '60df9afadbcca1000421e3aa': {
          item: {
            orders: ['60df9dbedbcca1000421e3ae'],
            deleted: false,
            _id: '60df9afadbcca1000421e3aa',
            itemName: 'Off-White GREY SNAP DENIM TSHIRT DRESS GREY NO COL - Farfetch',
            price: 15000,
            url:
              'https://www.farfetch.com/shopping/women/off-white-grey-snap-denim-tshirt-dress-grey-no-col-item-16868612.aspx?storeid=12572',
            currency: 'USD',
            wishlist: '60df9aa1dbcca1000421e3a9',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/0428cd8d-e098-40ed-ae45-577487bf5758.png',
            __v: 0,
          },
          qty: 1,
          price: 15000,
        },
      },
      totalQty: 2,
      totalPrice: 25000,
      alias: {
        wishlists: ['60df9aa1dbcca1000421e3a9'],
        deleted: false,
        _id: '60df9aa1dbcca1000421e3a8',
        handle: 'dash',
        aliasName: 'dashie',
        currency: 'USD',
        handle_lowercased: 'dash',
        __v: 1,
        profileImage:
          'https://wishtender-dev.s3.amazonaws.com/images/profileImages/62fc6d64-4426-4d32-8218-b2a51d62e2ab.png',
      },
    },
    convertedCart: {
      items: {
        '60df9b9adbcca1000421e3ab': {
          item: {
            orders: ['60df9dbedbcca1000421e3ae'],
            deleted: false,
            _id: '60df9b9adbcca1000421e3ab',
            itemName: 'Fendi Pleated high-waisted Shorts - Farfetch',
            price: 13356,
            url:
              'https://www.farfetch.com/shopping/women/fendi-pleated-high-waisted-shorts-item-16366888.aspx?storeid=9671',
            currency: 'USD',
            wishlist: '60df9aa1dbcca1000421e3a9',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/9420335c-a824-420a-a5a6-c935eb618795.png',
            __v: 0,
            convertedTo: 'AUD',
          },
          qty: 1,
          price: 13356,
        },
        '60df9afadbcca1000421e3aa': {
          item: {
            orders: ['60df9dbedbcca1000421e3ae'],
            deleted: false,
            _id: '60df9afadbcca1000421e3aa',
            itemName: 'Off-White GREY SNAP DENIM TSHIRT DRESS GREY NO COL - Farfetch',
            price: 20035,
            url:
              'https://www.farfetch.com/shopping/women/off-white-grey-snap-denim-tshirt-dress-grey-no-col-item-16868612.aspx?storeid=12572',
            currency: 'USD',
            wishlist: '60df9aa1dbcca1000421e3a9',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/0428cd8d-e098-40ed-ae45-577487bf5758.png',
            __v: 0,
            convertedTo: 'AUD',
          },
          qty: 1,
          price: 20035,
        },
      },
      totalQty: 2,
      totalPrice: 33391,
      alias: {
        wishlists: ['60df9aa1dbcca1000421e3a9'],
        deleted: false,
        _id: '60df9aa1dbcca1000421e3a8',
        handle: 'dash',
        aliasName: 'dashie',
        currency: 'USD',
        handle_lowercased: 'dash',
        __v: 1,
        profileImage:
          'https://wishtender-dev.s3.amazonaws.com/images/profileImages/62fc6d64-4426-4d32-8218-b2a51d62e2ab.png',
      },
      convertedTo: 'AUD',
    },
    fees: { wishTender: 2500, total: 27500, currency: 'AUD' },
    createdAt: '2021-07-02T23:23:12.627Z',
    __v: 2,
    cashFlow: {
      customerCharged: {
        from: { amountBeforeFees: 25000, currency: 'USD' },
        amountBeforeFees: 33391,
        amount: 36730,
        currency: 'AUD',
        exchangeRate: 1.3356484573260317,
      },
      toPlatform: {
        from: { amount: 36730, currency: 'AUD' },
        amount: 27147,
        currency: 'USD',
        exchangeRate: 0.739109,
      },
      toConnect: {
        from: { amount: 24680, currency: 'USD' },
        amount: 24680,
        currency: 'USD',
        exchangeRate: null,
      },
      connectAccount: 'acct_1J8vUuPtCE6if3M7',
    },
    paidOn: '2073-01-01T22:46:27.440Z',
    noteToTender: [{ message: 'thank you', sent: '2021-07-02T23:31:14.849Z' }],
  },
  {
    _id: '60e607b78d56bc0004417da6',
    seen: false,
    buyerInfo: { email: 'dangerousdashie@gmail.com', fromLine: 'Dash ' },
    alias: '60df9aa1dbcca1000421e3a8',
    noteToWisher: { message: 'Hi', read: null },
    session: 'wNxCAb7fAaf2cPHhv5YO3CVmctHyfg4p',
    processorPaymentID: 'cs_test_b1sqklcD4VjXa7W25E3s8HEWho7Ld9FE5ZW4cSjHvimP9ipu5sQpBgXs6U',
    exchangeRate: {
      wishTender: [
        { from: 'USD', to: 'BRL', value: 5.1020408163265305, type: 'connect to customer' },
      ],
    },
    processedBy: 'Stripe',
    paid: true,
    total: { amount: 27500, currency: 'BRL' },
    wishersTender: { intended: { amount: 25000, currency: 'BRL' } },
    cart: {
      items: {
        '60df9afadbcca1000421e3aa': {
          item: {
            orders: ['60df9dbedbcca1000421e3ae', '60df9fe0f43f5d0004529d06'],
            deleted: false,
            _id: '60df9afadbcca1000421e3aa',
            itemName: 'Off-White GREY SNAP DENIM TSHIRT DRESS GREY NO COL - Farfetch',
            price: 15000,
            url:
              'https://www.farfetch.com/shopping/women/off-white-grey-snap-denim-tshirt-dress-grey-no-col-item-16868612.aspx?storeid=12572',
            currency: 'USD',
            wishlist: '60df9aa1dbcca1000421e3a9',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/0428cd8d-e098-40ed-ae45-577487bf5758.png',
            __v: 0,
          },
          qty: 1,
          price: 15000,
        },
        '60df9b9adbcca1000421e3ab': {
          item: {
            orders: ['60df9dbedbcca1000421e3ae', '60df9fe0f43f5d0004529d06'],
            deleted: false,
            _id: '60df9b9adbcca1000421e3ab',
            itemName: 'Fendi Pleated high-waisted Shorts - Farfetch',
            price: 10000,
            url:
              'https://www.farfetch.com/shopping/women/fendi-pleated-high-waisted-shorts-item-16366888.aspx?storeid=9671',
            currency: 'USD',
            wishlist: '60df9aa1dbcca1000421e3a9',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/9420335c-a824-420a-a5a6-c935eb618795.png',
            __v: 0,
          },
          qty: 1,
          price: 10000,
        },
      },
      totalQty: 2,
      totalPrice: 25000,
      alias: {
        wishlists: ['60df9aa1dbcca1000421e3a9'],
        deleted: false,
        _id: '60df9aa1dbcca1000421e3a8',
        handle: 'dash',
        aliasName: 'dashie',
        currency: 'USD',
        handle_lowercased: 'dash',
        __v: 1,
        profileImage:
          'https://wishtender-dev.s3.amazonaws.com/images/profileImages/62fc6d64-4426-4d32-8218-b2a51d62e2ab.png',
      },
    },
    convertedCart: {
      items: {
        '60df9afadbcca1000421e3aa': {
          item: {
            orders: ['60df9dbedbcca1000421e3ae', '60df9fe0f43f5d0004529d06'],
            deleted: false,
            _id: '60df9afadbcca1000421e3aa',
            itemName: 'Off-White GREY SNAP DENIM TSHIRT DRESS GREY NO COL - Farfetch',
            price: 76531,
            url:
              'https://www.farfetch.com/shopping/women/off-white-grey-snap-denim-tshirt-dress-grey-no-col-item-16868612.aspx?storeid=12572',
            currency: 'USD',
            wishlist: '60df9aa1dbcca1000421e3a9',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/0428cd8d-e098-40ed-ae45-577487bf5758.png',
            __v: 0,
            convertedTo: 'BRL',
          },
          qty: 1,
          price: 76531,
        },
        '60df9b9adbcca1000421e3ab': {
          item: {
            orders: ['60df9dbedbcca1000421e3ae', '60df9fe0f43f5d0004529d06'],
            deleted: false,
            _id: '60df9b9adbcca1000421e3ab',
            itemName: 'Fendi Pleated high-waisted Shorts - Farfetch',
            price: 51020,
            url:
              'https://www.farfetch.com/shopping/women/fendi-pleated-high-waisted-shorts-item-16366888.aspx?storeid=9671',
            currency: 'USD',
            wishlist: '60df9aa1dbcca1000421e3a9',
            itemImage:
              'https://wishtender-dev.s3.amazonaws.com/images/itemImages/9420335c-a824-420a-a5a6-c935eb618795.png',
            __v: 0,
            convertedTo: 'BRL',
          },
          qty: 1,
          price: 51020,
        },
      },
      totalQty: 2,
      totalPrice: 127551,
      alias: {
        wishlists: ['60df9aa1dbcca1000421e3a9'],
        deleted: false,
        _id: '60df9aa1dbcca1000421e3a8',
        handle: 'dash',
        aliasName: 'dashie',
        currency: 'USD',
        handle_lowercased: 'dash',
        __v: 1,
        profileImage:
          'https://wishtender-dev.s3.amazonaws.com/images/profileImages/62fc6d64-4426-4d32-8218-b2a51d62e2ab.png',
      },
      convertedTo: 'BRL',
    },
    fees: { wishTender: 2500, total: 27500, currency: 'BRL' },
    createdAt: '2021-07-07T19:59:51.962Z',
    __v: 1,
    cashFlow: {
      customerCharged: {
        from: { amountBeforeFees: 25000, currency: 'USD' },
        amountBeforeFees: 127551,
        amount: 140306,
        currency: 'BRL',
        exchangeRate: 5.1020408163265305,
      },
      toPlatform: {
        from: { amount: 140306, currency: 'BRL' },
        amount: 26848,
        currency: 'USD',
        exchangeRate: 0.191356,
      },
      toConnect: {
        from: { amount: 24408, currency: 'USD' },
        amount: 24408,
        currency: 'USD',
        exchangeRate: null,
      },
      connectAccount: 'acct_1J8vUuPtCE6if3M7',
    },
    paidOn: '2021-07-07T20:00:16Z',
    noteToTender: [[]],
  },
];

const messedUp = {
  _id: '61874d6afba8b8000491d3c7',
  seen: false,
  noteToTender: [],
  buyerInfo: { email: 'dangerousdashie@gmail.com', fromLine: 'Dash' },
  alias: '60df9aa1dbcca1000421e3a8',
  noteToWisher: { message: 'Yay!', read: null },
  session: 'vvGUxoU6_SK5IKUtEkTrjZ8ju_kPvUqS',
  processorPaymentID: 'cs_test_b1Zcy5Mdw44ruvnsXl4dMoMHzvLC6UzQ2tnEkhXZu71IXglGZ1BqWace3Z',
  exchangeRate: {
    wishTender: [
      { from: 'USD', to: 'AUD', value: 1.3522717733064582, type: 'connect to customer' },
    ],
  },
  processedBy: 'Stripe',
  paid: true,
  wishersTender: { intended: { amount: 35000, aliasCurrency: 'USD' } },
  total: { amount: 52063, currency: 'AUD' },
  cart: {
    items: {
      '60df9b9adbcca1000421e3ab': {
        item: {
          categories: [],
          orders: [
            '60df9dbedbcca1000421e3ae',
            '60df9fe0f43f5d0004529d06',
            '60e607b78d56bc0004417da6',
            '60e6081d8d56bc0004417da7',
            '615de2ef1b5bdd00044ed1d2',
            '615de5061b5bdd00044ed1d3',
            '61873a1b71da117c8a6f2242',
          ],
          deleted: false,
          _id: '60df9b9adbcca1000421e3ab',
          itemName: 'Fendi Pleated high-waisted Shorts - Farfetch',
          price: 10000,
          url:
            'https://www.farfetch.com/shopping/women/fendi-pleated-high-waisted-shorts-item-16366888.aspx?storeid=9671',
          currency: 'USD',
          wishlist: '60df9aa1dbcca1000421e3a9',
          itemImage:
            'https://wishtender-dev.s3.amazonaws.com/images/itemImages/9420335c-a824-420a-a5a6-c935eb618795.png',
          __v: 0,
        },
        qty: 2,
        price: 20000,
      },
      '60df9afadbcca1000421e3aa': {
        item: {
          categories: [],
          orders: [
            '60df9dbedbcca1000421e3ae',
            '60df9fe0f43f5d0004529d06',
            '60e607248d56bc0004417da4',
            '60e607b78d56bc0004417da6',
          ],
          deleted: false,
          _id: '60df9afadbcca1000421e3aa',
          itemName: 'Off-White GREY SNAP DENIM TSHIRT DRESS GREY NO COL - Farfetch',
          price: 15000,
          url:
            'https://www.farfetch.com/shopping/women/off-white-grey-snap-denim-tshirt-dress-grey-no-col-item-16868612.aspx?storeid=12572',
          currency: 'USD',
          wishlist: '60df9aa1dbcca1000421e3a9',
          itemImage:
            'https://wishtender-dev.s3.amazonaws.com/images/itemImages/0428cd8d-e098-40ed-ae45-577487bf5758.png',
          __v: 0,
        },
        qty: 1,
        price: 15000,
      },
    },
    totalQty: 3,
    totalPrice: 35000,
    alias: {
      wishlists: ['60df9aa1dbcca1000421e3a9'],
      deleted: false,
      _id: '60df9aa1dbcca1000421e3a8',
      handle: 'dash',
      aliasName: 'dashie',
      currency: 'USD',
      handle_lowercased: 'dash',
      __v: 1,
      profileImage:
        'https://wishtender-dev.s3.amazonaws.com/images/profileImages/62fc6d64-4426-4d32-8218-b2a51d62e2ab.png',
    },
  },
  convertedCart: {
    items: {
      '60df9b9adbcca1000421e3ab': {
        item: {
          categories: [],
          orders: [
            '60df9dbedbcca1000421e3ae',
            '60df9fe0f43f5d0004529d06',
            '60e607b78d56bc0004417da6',
            '60e6081d8d56bc0004417da7',
            '615de2ef1b5bdd00044ed1d2',
            '615de5061b5bdd00044ed1d3',
            '61873a1b71da117c8a6f2242',
          ],
          deleted: false,
          _id: '60df9b9adbcca1000421e3ab',
          itemName: 'Fendi Pleated high-waisted Shorts - Farfetch',
          price: 13523,
          url:
            'https://www.farfetch.com/shopping/women/fendi-pleated-high-waisted-shorts-item-16366888.aspx?storeid=9671',
          currency: 'USD',
          wishlist: '60df9aa1dbcca1000421e3a9',
          itemImage:
            'https://wishtender-dev.s3.amazonaws.com/images/itemImages/9420335c-a824-420a-a5a6-c935eb618795.png',
          __v: 0,
          convertedTo: 'AUD',
        },
        qty: 2,
        price: 27046,
      },
      '60df9afadbcca1000421e3aa': {
        item: {
          categories: [],
          orders: [
            '60df9dbedbcca1000421e3ae',
            '60df9fe0f43f5d0004529d06',
            '60e607248d56bc0004417da4',
            '60e607b78d56bc0004417da6',
          ],
          deleted: false,
          _id: '60df9afadbcca1000421e3aa',
          itemName: 'Off-White GREY SNAP DENIM TSHIRT DRESS GREY NO COL - Farfetch',
          price: 20284,
          url:
            'https://www.farfetch.com/shopping/women/off-white-grey-snap-denim-tshirt-dress-grey-no-col-item-16868612.aspx?storeid=12572',
          currency: 'USD',
          wishlist: '60df9aa1dbcca1000421e3a9',
          itemImage:
            'https://wishtender-dev.s3.amazonaws.com/images/itemImages/0428cd8d-e098-40ed-ae45-577487bf5758.png',
          __v: 0,
          convertedTo: 'AUD',
        },
        qty: 1,
        price: 20284,
      },
    },
    totalQty: 3,
    totalPrice: 47330,
    alias: {
      wishlists: ['60df9aa1dbcca1000421e3a9'],
      deleted: false,
      _id: '60df9aa1dbcca1000421e3a8',
      handle: 'dash',
      aliasName: 'dashie',
      currency: 'USD',
      handle_lowercased: 'dash',
      __v: 1,
      profileImage:
        'https://wishtender-dev.s3.amazonaws.com/images/profileImages/62fc6d64-4426-4d32-8218-b2a51d62e2ab.png',
    },
    convertedTo: 'AUD',
  },
  fees: { wishTender: 3500, total: 38500, currency: 'AUD' },
  createdAt: '2021-11-07T03:52:10.426Z',
  __v: 0,
  cashFlow: {
    customerCharged: {
      from: { amountBeforeFees: 35000, currency: 'USD' },
      amountBeforeFees: 47330,
      amount: 52063,
      currency: 'AUD',
      exchangeRate: 1.3522717733064582,
    },
    toPlatform: {
      from: { amount: 52063, currency: 'AUD' },
      amount: 38115,
      currency: 'USD',
      exchangeRate: 0.732102,
    },
    toConnect: {
      from: { amount: 34650, currency: 'USD' },
      amount: 34650,
      currency: 'USD',
      exchangeRate: null,
    },
    connectAccount: 'acct_1J8vUuPtCE6if3M7',
  },
  paidOn: '2021-11-07T03:52:21Z',
};
const order = messedUp; // messedUp orderMulti orderSin orderConverted oconverteds
const fee = currency.smallestUnitToFormatted(
  order.cashFlow.customerCharged.amount - order.cashFlow.customerCharged.amountBeforeFees,
  'en',
  order.cashFlow.customerCharged.currency
);
const totalPrice = currency.smallestUnitToFormatted(
  order.cashFlow.customerCharged.amount,
  'en',
  order.cashFlow.customerCharged.currency
);
const items = Object.values(order.convertedCart ? order.convertedCart.items : order.cart.items);

// format the price
items.forEach((item) => {
  item.price = currency.smallestUnitToFormatted(
    item.price,
    'en',
    order.cashFlow.customerCharged.currency
  );
});
const email = html(order.cart.alias, items, order.cart.totalQty, totalPrice, fee);
fs.writeFile('43453554424email.html', email, function (err) {
  if (err) throw err;
  console.log('Saved!');
});
