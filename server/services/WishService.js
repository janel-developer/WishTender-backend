const axios = require('axios');
const scrape = require('./scrapeForProductInfo/scrapeForProductInfo');
const WishModel = require('../models/Wish.Model');

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
    console.log('sup');
    const response = await axios
      .get(url)
      .then((res) => {
        if (res.status === 200) {
          return scrape(res.data);
        }
        console.log('res----------------------');
        console.log(res);
        throw res.statusText;
      })
      .catch((err) => {
        console.log(err);
        return `Error getting product info: ${err}`;
      });
    return response;
  }
}

module.exports = WishesService;
