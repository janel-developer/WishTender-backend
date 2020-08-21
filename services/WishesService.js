const axios = require('axios');
const scrape = require('./scrapeForProductInfo');

/**
 * Logic for fetching speakers information
 */
class WishesService {
  /**
   * Constructor
   * @param {*} WishModel Mongoose Schema Model
   */
  constructor(WishModel) {
    this.WishModel = WishModel;
  }

  /**
   * Fetches wishes data from the database
   */
  async getData() {
    const data = await this.WishModel.find((err, wishes) => {
      if (err) {
        console.log(err);
        return err;
      }
      return wishes;
    }).catch(console.log); // for database
    return data;
  }

  /**
   * Get wish information provided an id
   * @param {*} id
   */
  async getWish(id) {
    const response = await this.WishModel.findById(id, (err, wish) => {
      if (err) {
        return err.message;
      }
      return wish;
    });
    return response;
  }

  /**
   * Add a wish
   */
  async addWish(wishInfo) {
    const wish = new this.WishModel(wishInfo);
    console.log({ wish, wishInfo });
    return wish.save();
  }

  async deleteWish(id, callBack) {
    this.WishModel.deleteOne(
      {
        _id: id,
      },
      callBack
    );
  }

  async deleteWishes(ids) {
    // fix all this eslint stuff later---------------------------------------
    // eslint-disable-next-line no-restricted-syntax
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await this.WishModel.findByIdAndDelete(id, function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log('Deleted : ', docs);
        }
      });
    }
  }

  async updateWish(id, body) {
    const wishResponse = await this.WishModel.findByIdAndUpdate(id, body, {
      new: true,
    })
      .then((result) => `Wish Updated: ${result}`)
      .catch((error) => `Error updating your wish: ${error.reason.message}`);

    return wishResponse;
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
