const axios = require('axios');
require('dotenv').config();

const NodeCache = require('node-cache');
const { ApplicationError } = require('./Error');

const myCache = new NodeCache();

const checkCache = (key) => {
  let cache;
  if (myCache.has(key)) {
    cache = myCache.get(key); //check if time passed from key
    const now = parseInt(
      Date.now().toString().slice(0, `${cache.time_next_update_unix}`.length),
      10
    );
    if (cache.time_next_update_unix < now) {
      myCache.del(key);
      return null;
    }
    return cache;
  }
};
const storeInCache = (key, data) => {
  myCache.set(key, data);
};

class ExchangeRateAPI {
  /**
   * ratesapi.io API interface
   * @constructor
   */
  constructor() {
    this.baseURI = 'https://v6.exchangerate-api.com/v6';

    // more are supported by exchangerate-api but I'm simplifying it for now
    this.supportedCurrencies = [
      'GBP',
      'HKD',
      'IDR',
      'ILS',
      'DKK',
      'INR',
      'CHF',
      'MXN',
      'CZK',
      'SGD',
      'THB',
      'HRK',
      'EUR',
      'MYR',
      'NOK',
      'CNY',
      'BGN',
      'PHP',
      'PLN',
      'ZAR',
      'CAD',
      'ISK',
      'BRL',
      'RON',
      'NZD',
      'TRY',
      'JPY',
      'RUB',
      'KRW',
      'USD',
      'AUD',
      'HUF',
      'SEK',
    ];
  }

  /**
   * Gets the exchange rate for a currency from ratesapi.io
   * @param {String} from the starting currency
   * @param {String} to the ending currency
   * @returns {Number} the exchange rate to multiply the starting price
   */
  async getExchangeRate(from, to) {
    const cacheKey = `pair${from}${to}`;
    const cache = checkCache(cacheKey);
    if (cache) {
      return cache.conversion_rate;
    }
    const exchangeRate = await axios
      .get(`${this.baseURI}/${process.env.EXCHANGE_RATE_KEY}/pair/${from}/${to}`)
      .then((x) => {
        if (x.data.result === 'error') {
          throw new ApplicationError(
            { err: x.data['error-type'] },
            `Error getting exchange rate data.`
          );
        }
        storeInCache(cacheKey, x.data);
        return x.data.conversion_rate;
      })
      .catch((err) => {
        throw new ApplicationError({ err }, `Internal error getting exchange rate.`);
      });

    return exchangeRate;
  }

  /**
   * Gets the exchange rates for a currencies from ratesapi.io
   * @param {String} baseCurrency
   * @returns {Number} the exchange rate to multiply the starting price
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllExchangeRates(baseCurrency) {
    const cacheKey = `latest${baseCurrency}`;
    const cache = checkCache(cacheKey);
    if (cache) {
      return cache.conversion_rates;
    }
    const exchangeRates = await axios
      .get(`${this.baseURI}/${process.env.EXCHANGE_RATE_KEY}/latest/${baseCurrency}`)
      .then((x) => {
        if (x.data.result === 'error') {
          throw new ApplicationError(
            { err: x.data['error-type'] },
            `Error getting exchange rate data.`
          );
        }
        storeInCache(cacheKey, x.data);
        return x.data.conversion_rates;
      })
      .catch((err) => {
        throw new ApplicationError({ err }, `Internal error getting exchange rate.`);
      });
    // const exchangeRates = {
    //   USD: 1,
    //   AED: 3.6725,
    //   AFN: 78.8135,
    //   ALL: 100.5632,
    //   AMD: 520.4377,
    //   ANG: 1.79,
    //   AOA: 649.9246,
    //   ARS: 94.2797,
    //   AUD: 1.2895,
    //   AWG: 1.79,
    //   AZN: 1.699,
    //   BAM: 1.5987,
    //   BBD: 2,
    //   BDT: 84.7581,
    //   BGN: 1.5989,
    //   BHD: 0.376,
    //   BIF: 1968.0341,
    //   BMD: 1,
    //   BND: 1.3234,
    //   BOB: 6.8865,
    //   BRL: 5.3217,
    //   BSD: 1,
    //   BTN: 72.7609,
    //   BWP: 10.6709,
    //   BYN: 2.5069,
    //   BZD: 2,
    //   CAD: 1.2071,
    //   CDF: 1986.8072,
    //   CHF: 0.8969,
    //   CLP: 734.2754,
    //   CNY: 6.3926,
    //   COP: 3728.5697,
    //   CRC: 617.4314,
    //   CUC: 1,
    //   CUP: 25.75,
    //   CVE: 90.1287,
    //   CZK: 20.8599,
    //   DJF: 177.721,
    //   DKK: 6.098,
    //   DOP: 56.9867,
    //   DZD: 133.2991,
    //   EGP: 15.6638,
    //   ERN: 15,
    //   ETB: 42.9737,
    //   EUR: 0.8174,
    //   FJD: 2.0294,
    //   FKP: 0.7065,
    //   FOK: 6.098,
    //   GBP: 0.7065,
    //   GEL: 3.2681,
    //   GGP: 0.7065,
    //   GHS: 5.7788,
    //   GIP: 0.7065,
    //   GMD: 51.5564,
    //   GNF: 9827.5049,
    //   GTQ: 7.709,
    //   GYD: 211.4905,
    //   HKD: 7.7654,
    //   HNL: 24.0179,
    //   HRK: 6.1586,
    //   HTG: 89.7679,
    //   HUF: 287.2175,
    //   IDR: 14332.7197,
    //   ILS: 3.2603,
    //   IMP: 0.7065,
    //   INR: 72.7613,
    //   IQD: 1458.0984,
    //   IRR: 42017.2002,
    //   ISK: 121.3205,
    //   JMD: 149.4672,
    //   JOD: 0.709,
    //   JPY: 109.0416,
    //   KES: 107.5933,
    //   KGS: 83.5194,
    //   KHR: 4068.4343,
    //   KID: 1.2895,
    //   KMF: 402.1257,
    //   KRW: 1117.7024,
    //   KWD: 0.2996,
    //   KYD: 0.8333,
    //   KZT: 427.8435,
    //   LAK: 9429.5351,
    //   LBP: 1507.5,
    //   LKR: 198.1162,
    //   LRD: 171.5329,
    //   LSL: 13.7974,
    //   LYD: 4.4454,
    //   MAD: 8.8103,
    //   MDL: 17.653,
    //   MGA: 3743.9844,
    //   MKD: 50.1693,
    //   MMK: 1599.1215,
    //   MNT: 2848.2202,
    //   MOP: 7.9983,
    //   MRU: 36.4742,
    //   MUR: 40.3696,
    //   MVR: 15.403,
    //   MWK: 796.7413,
    //   MXN: 19.8875,
    //   MYR: 4.1414,
    //   MZN: 60.3526,
    //   NAD: 13.7974,
    //   NGN: 424.1693,
    //   NIO: 34.9283,
    //   NOK: 8.3362,
    //   NPR: 116.4174,
    //   NZD: 1.3731,
    //   OMR: 0.3845,
    //   PAB: 1,
    //   PEN: 3.8278,
    //   PGK: 3.5105,
    //   PHP: 48.1455,
    //   PKR: 154.6545,
    //   PLN: 3.6823,
    //   PYG: 6708.9779,
    //   QAR: 3.64,
    //   RON: 4.0218,
    //   RSD: 96.0193,
    //   RUB: 73.52,
    //   RWF: 1000.4792,
    //   SAR: 3.75,
    //   SBD: 7.8831,
    //   SCR: 16.483,
    //   SDG: 416.5522,
    //   SEK: 8.3005,
    //   SGD: 1.3234,
    //   SHP: 0.7065,
    //   SLL: 10239.2719,
    //   SOS: 578.0885,
    //   SRD: 14.1422,
    //   SSP: 177.6422,
    //   STN: 20.0259,
    //   SYP: 1600.3788,
    //   SZL: 13.7974,
    //   THB: 31.2887,
    //   TJS: 11.3492,
    //   TMT: 3.4967,
    //   TND: 2.7091,
    //   TOP: 2.2349,
    //   TRY: 8.4488,
    //   TTD: 6.7941,
    //   TVD: 1.2895,
    //   TWD: 27.8,
    //   TZS: 2315.7856,
    //   UAH: 27.5133,
    //   UGX: 3544.5062,
    //   UYU: 44.0048,
    //   UZS: 10610.9589,
    //   VES: 3062467.1813,
    //   VND: 23090.2186,
    //   VUV: 107.4959,
    //   WST: 2.5166,
    //   XAF: 536.1676,
    //   XCD: 2.7,
    //   XDR: 0.6922,
    //   XOF: 536.1676,
    //   XPF: 97.5399,
    //   YER: 249.2567,
    //   ZAR: 13.7976,
    //   ZMW: 22.4638,
    // };

    return exchangeRates;
  }
}

module.exports = ExchangeRateAPI;
