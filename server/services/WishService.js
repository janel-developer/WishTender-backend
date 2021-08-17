const axios = require('axios');
const scrape = require('./scrapeForProductInfo/scrapeForProductInfo');
const WishModel = require('../models/Wish.Model');
const logger = require('../lib/logger');
const { ApplicationError } = require('../lib/Error');
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

  // eslint-disable-next-line class-methods-use-this
  async scrapeHTML(html) {
    return scrape(html);
  }

  // move this somewhere else
  // eslint-disable-next-line class-methods-use-this
  async getProductInfo(url) {
    const response = await axios
      .get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
        },
      })
      .then((res) => {
        if (res.status === 200) {
          return scrape(res.data);
        }
        // logger()
        console.log('scrape res----------------------');
        console.log(res);
        throw res.statusText;
      })
      .catch((err) => {
        if (err.response.status === 403 || err.response.status === 503) {
          throw new Error(
            `The store you tried to add a wish from blocks scraping. Download our Chrome extension that will allow you to add products from these sites. It can be found at wishtender.com/extension`
          );
        }
        throw new ApplicationError({ err }, `Error getting product info`);
      });
    return response;
  }
}

module.exports = WishesService;
