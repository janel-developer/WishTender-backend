/**
 * Logic for fetching speakers information
 */
class WishesService {
  /**
   * Constructor
   * @param {*} datafile Path to a JSOn file that contains the speakers data
   */
  constructor(WishModel) {
    this.WishModel = WishModel;
  }

  /**
   * Returns a list of speakers name and short name
   */
  async getNames() {
    const data = await this.getData();

    // We are using map() to transform the array we get into another one
    return data.map((speaker) => {
      return { name: speaker.name, shortname: speaker.shortname };
    });
  }

  /**
   * Get all artwork
   */
  async getAllArtwork() {
    const data = await this.getData();

    // Array.reduce() is used to traverse all speakers and
    // create an array that contains all artwork
    const artwork = data.reduce((acc, elm) => {
      if (elm.artwork) {
        // eslint-disable-next-line no-param-reassign
        acc = [...acc, ...elm.artwork];
      }
      return acc;
    }, []);
    return artwork;
  }

  async deleteWish(id, callBack) {
    this.WishModel.remove(
      {
        _id: id,
      },
      callBack
    );
  }
  async deleteWishes(ids) {
    for (const id of ids) {
      await this.WishModel.findByIdAndDelete(id, function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log("Deleted : ", docs);
        }
      });
    }
  }
  async updateWish(id, body) {
    let wishResponse;
    await this.WishModel.findById(id, callBack)
      .then((x) => {
        console.log("end find", x);
        wishResponse = x;
        console.log("wishResponse:", wishResponse);
      })
      .catch((err) => console.log(err));

    async function callBack(err, wish) {
      if (wish) return { err: "data not found" };
      else wish.wish_name = body.wish_name;
      console.log("wish callback before save");
      wish
        .save()
        .then((wish) => {
          console.log("wish callback after save");
          console.log("set wishresponse");
          wishResponse = wish;
        })
        .catch((err) => {
          console.log(err);
        });
    }

    //see what happens with you throw from call back
    //"end find" happens before "should be after wish"

    console.log("should be after seting wish response");
    return wishResponse;
  }
  //   async updateWish(id, callBack) {
  //     this.WishModel.findById(id, callBack);
  //   }

  /**
   * Get wish information provided an id
   * @param {*} id
   */
  async getWish(id) {
    const wish = this.WishModel.findById(id, function (err, wish) {
      return wish;
    });

    if (!wish) return null;
    return wish;
  }

  /**
   * Add a wish
   */
  async addWish(wishInfo) {
    const wish = new this.WishModel(wishInfo);
    return wish.save();
  }

  /**
   * Fetches wishes data from the database
   */
  async getData() {
    const data = await this.WishModel.find(function (err, wishes) {
      if (err) {
        console.log(err);
        return err;
      } else {
        return wishes;
      }
    }).catch(console.log); //for database
    return data;
  }
}

module.exports = WishesService;
