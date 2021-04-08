const axios = require('axios');

class ExchangeRateApiInterface {
  /**
   * api.exchangeratesapi.io API interface
   * @constructor
   */
  constructor() {
    this.baseURI = 'https://api.exchangeratesapi.io';
    this.supportedCurrencies = [
      // is this necessary? it will not be in sync with actual api and you can probably figure it out from an api call
      // https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html x=[]; for (i = 0; i < 90; i++) {x.push(document.querySelector("#main-wrapper > main > div.jumbo-box > div.lower > div > div > table > tbody > tr:nth-child("+(i+1)+")").children[0].innerText)}
      'EUR',
      'USD',
      'JPY',
      'BGN',
      'CZK',
      'CZK',
      'DKK',
      'GBP',
      'HUF',
      'PLN',
      'RON',
      'SEK',
      'CHF',
      'ISK',
      'NOK',
      'HRK',
      'RUB',
      'TRY',
      'AUD',
      'BRL',
      'CAD',
      'CNY',
      'HKD',
      'IDR',
      'ILS',
      'INR',
      'KRW',
      'MXN',
      'MYR',
      'NZD',
      'PHP',
      'SGD',
      'THB',
      'ZAR',
    ];
  }

  /**
   * Gets the exchange rate for a currency from api.exchangeratesapi.io
   * @param {String} from the starting currency
   * @param {String} to the ending currency
   * @returns {Number} the exchange rate to multiply the starting price
   */
  async getExchangeRate(from, to) {
    const exchangeRate = await axios
      .get(
        `${this.baseURI}/latest?latest?access_key=${process.env.EXCHANGE_RATE_KEY}&base=${from}&symbols=${to}`
      )
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
      .get(
        `${this.baseURI}/latest?access_key=${process.env.EXCHANGE_RATE_KEY}&base=${baseCurrency}`
      )
      .then((x) => x.data.rates)
      .catch((response) => {
        throw new Error(`${response.response.data.error}`);
      });
    return exchangeRate;
  }
}

module.exports = ExchangeRateApiInterface;
