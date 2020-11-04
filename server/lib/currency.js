const countryData = require('country-data');
const fx = require('money');

/**
 * Currency helper
 * @constructor
 * @param {Object} exchangeRateInterface an api interface for an exchange rate api site
 */
function CurrencyHelper(exchangeRateInterface) {
  this.exchangeRateInterface = exchangeRateInterface;
  this.countryData = countryData;
  this.fx = fx;

  /**
   * Gets the exchange rate for a currency from an api
   * @param {String} from the starting currency
   * @param {String} to the ending currency
   * @returns {Number} the exchange rate to multiply the starting price
   */
  this.getExchangeRate = async function getExchangeRate(from, to) {
    const exchangeRate = await this.exchangeRateInterface.getExchangeRate(from, to);

    return exchangeRate;
  };

  /**
   * Gets the exchange rates for a currencies from an api
   * @param {String} [baseCurrency='USD'] optional. default 'USD'.
   * @returns {Number} the exchange rate to multiply the starting price
   */
  this.getAllExchangeRates = async function getAllExchangeRates(baseCurrency = 'USD') {
    const exchangeRate = await this.exchangeRateInterface.getAllExchangeRates(baseCurrency);
    return exchangeRate;
  };

  /**
   * Get rates and update this.rates
   * @param {String} [baseCurrency='USD'] optional. default 'USD'.
   * @returns {Boolean} object with updated and rates
   */
  this.getAndUpdateRates = async function getAndUpdateRates(baseCurrency = 'USD') {
    const rates = await this.getAllExchangeRates(baseCurrency);
    this.rates = rates;
    return this.rates;
  };

  /**
   * Convert smallest unit of currency to the proper decimals
   * @param {Number} smallestUnit the amount of the smallest unit of currency (ex: USD- amount of pennies)
   * @param {String} currency the 3 letter code for the currency. ex: 'USD'
   */
  this.smallestUnitToStandard = function smallestUnitToStandard(smallestUnit, currency) {
    const { currencies } = this.countryData;
    const multiplier = 10 ** -currencies[currency].decimals;
    return smallestUnit * multiplier;
  };

  /**
   * Convert smallest unit of currency to the formatted price
   * @param {Number} smallestUnit the amount of the smallest unit of currency (ex: USD- amount of pennies)
   * @param {String} languageCode ex: en-US
   * @param {String} currency the 3 letter code for the currency. ex: 'USD'
   */
  this.smallestUnitToFormatted = function smallestUnitToFormatted(
    smallestUnit,
    languageCode,
    currency
  ) {
    const standard = this.smallestUnitToStandard(smallestUnit, currency);
    const formatted = this.formatCurrency(standard, languageCode, currency);
    return formatted;
  };

  /**
   * Convert currency to the smallest unit
   * @param {*} price
   * @param {String} currency the 3 letter code for the currency. ex: 'USD'
   */
  this.priceToSmallestUnit = function priceToSmallestUnit(price, currency) {
    const { currencies } = this.countryData;
    const multiplier = 10 ** currencies[currency].decimals;
    return fx(price)._v * multiplier;
  };

  /**
   * Gives the price in the correct currency formatting
   * @param {*} price
   * @param {String} languageCode ex: en-US
   * @param {String} currency ex: USD
   *
   * @returns {String} formatted price
   */
  this.formatCurrency = function formatCurrency(price, languageCode, currency) {
    return new Intl.NumberFormat(languageCode, {
      style: 'currency',
      currency,
    }).format(price);
  };

  /**
   * Convert a price to another currency
   * @param {Number} price
   * @param {String} from the starting currency
   * @param {String} to the desired currency
   */
  this.convert = function convert(price, from, to) {
    this.fx.rates = this.rates;
    return this.fx(price).from(from).to(to);
  };
}

module.exports = CurrencyHelper;
