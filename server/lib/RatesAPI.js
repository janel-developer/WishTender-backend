const axios = require('axios');

class RatesApiInterface {
  /**
   * ratesapi.io API interface
   * @constructor
   */
  constructor() {
    this.baseURI = 'https://api.ratesapi.io/api';
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
      .get(`${this.baseURI}/latest?base=${from}&symbols=${to}`)
      .then((x) => x.data.rates[to])
      .catch((response) => {
        throw new Error(`Error: ${response.response.data.error}`);
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
      .get(`${this.baseURI}/latest?base=${baseCurrency}`)
      .then((x) => x.data.rates)
      .catch((response) => {
        throw new Error(`${response.response.data.error}`);
      });
    return exchangeRate;
  }
}

module.exports = RatesApiInterface;
