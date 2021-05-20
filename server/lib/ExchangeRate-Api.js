const axios = require('axios');
require('dotenv').config();

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
    const exchangeRate = await axios
      .get(`${this.baseURI}/${process.env.EXCHANGE_RATE_KEY}/pair/${from}/${to}`)
      .then((x) => {
        if (x.data.result === 'error') {
          throw new Error(`Error: ${x.data['error-type']}`);
        }
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
    const exchangeRate = await axios
      .get(`${this.baseURI}/${process.env.EXCHANGE_RATE_KEY}/latest?base=${baseCurrency}`)
      .then((x) => {
        if (x.data.result === 'error') {
          throw new Error(`Error: ${x.data['error-type']}`);
        }
        //   "time_next_update_unix": 1585353700, caching should be from here because services use it too we can cache this https://www.geeksforgeeks.org/how-to-access-cache-data-in-node-js/
        return x.data.conversion_rates;
      })
      .catch((err) => {
        throw new Error(`Error: ${err}`);
      });
    return exchangeRate;
  }
}

module.exports = ExchangeRateAPI;
