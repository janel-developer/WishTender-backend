const axios = require('axios');
require('dotenv').config();

const NodeCache = require('node-cache');

const myCache = new NodeCache();

const checkCache = (key) => {
  let cache;
  console.log(myCache);
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
          throw new Error(`Error: ${x.data['error-type']}`);
        }
        storeInCache(cacheKey, x.data);
        return x.data.conversion_rate;
      })
      .catch((err) => {
        throw new Error(`Error: ${err}`);
      });

    return exchangeRate;
  }

  /**
   * Gets the exchange rates for a currencies from ratesapi.io
   * @param {String} baseCurrency
   * @returns {Number} the exchange rate to multiply the starting price
   */
  async getAllExchangeRates(baseCurrency) {
    const cacheKey = `latest${baseCurrency}`;
    const cache = checkCache(cacheKey);
    if (cache) {
      return cache.conversion_rates;
    }
    const exchangeRates = await axios
      .get(`${this.baseURI}/${process.env.EXCHANGE_RATE_KEY}/latest?base=${baseCurrency}`)
      .then((x) => {
        if (x.data.result === 'error') {
          throw new Error(`Error: ${x.data['error-type']}`);
        }
        storeInCache(cacheKey, x.data);
        return x.data.conversion_rates;
      })
      .catch((err) => {
        throw new Error(`Error: ${err}`);
      });

    return exchangeRates;
  }
}

module.exports = ExchangeRateAPI;
