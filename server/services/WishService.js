const axios = require('axios');
const {
  scroll,
  scrape,
  scrapeAWCategories,
  scrapeAmazonWishlist,
} = require('./scrapeForProductInfo/scrapeForProductInfo');
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
        // console.log('gerer', res);
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

  // eslint-disable-next-line class-methods-use-this
  async scroll(url) {
    const res = await scroll(url);
    return res;
  }

  // eslint-disable-next-line class-methods-use-this
  async getAmazonInfo(url) {
    const categories = await axios
      .get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
        },
      })
      .then(async (res) => {
        if (res.status === 200) {
          const cat = scrapeAWCategories(res.data);
          return cat;
        }
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

    const wishlists = await new Promise((resolve) => {
      const scraped = [];
      categories.forEach(async (cat) => {
        const info = await scrapeAmazonWishlist(cat.url, cat.title);
        scraped.push(info);
        if (scraped.length === categories.length) resolve(scraped);
      });
    });

    return wishlists;
  }
}

module.exports = WishesService;
