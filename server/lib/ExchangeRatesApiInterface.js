const axios = require('axios');

class ExchangeRateApiInterface {
  /**
   * api.exchangeratesapi.io API interface
   * @constructor
   */
  constructor() {
    this.baseURI = 'https://api.exchangeratesapi.io';
  }

  /**
   * Gets the exchange rate for a currency from api.exchangeratesapi.io
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
   * Gets the exchange rates for a currencies from api.exchangeratesapi.io
   * @param {String} baseCurrency
   * @returns {Number} the exchange rate to multiply the starting price
   */
  async getAllExchangeRates(baseCurrency) {
    const exchangeRate = await axios
      .get(`${this.baseURI}/latest?base=${baseCurrency}`)
      .then((x) => x.data.rates)
      .catch((response) => {
        throw new Error(`Error: ${response.response.data.error}`);
      });
    return exchangeRate;
  }
}

module.exports = ExchangeRateApiInterface;
