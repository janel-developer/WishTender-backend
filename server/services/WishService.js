const axios = require('axios');
const scrape = require('./scrapeForProductInfo/scrapeForProductInfo');
const WishModel = require('../models/Wish.Model');
const logger = require('../lib/logger');
const ApplicationError = require('../lib/Error');
/**
 * Logic for fetching speakers information
 */
class WishesService {
  /**
   * Constructor
   * @param {*} WishModel Mongoose Schema Model
   */
  constructor() {
    this.WishModel = WishModel;
  }

  // move this somewhere else
  // eslint-disable-next-line class-methods-use-this
  async getProductInfo(url) {
    const response = await axios
      .get(url)
      .then((res) => {
        if (res.status === 200) {
          return scrape(res.data);
        }
        // logger()
        console.log('res----------------------');
        console.log(res);
        throw res.statusText;
      })
      .catch((err) => {
        if (err.response.status === 403) {
          throw new Error(
            `The store you tried to add a wish from blocks scraping. We are trying to fix this.`
          );
        }
        throw new ApplicationError({ err }, `Error getting product info`);
      });
    return response;
  }
}

module.exports = WishesService;
