// const MongoClient = require('mongodb');
// const User = require('../../../server/models/User.Model');
const Alias = require('../../../server/models/Alias.Model');
const Wishlist = require('../../../server/models/Wishlist.Model');
const WishlistItem = require('../../../server/models/WishlistItem.Model');
const helper = require('../../helper');

const seeder = async () => {
  // new Promise((res, rej) => {
  //   (async () => {
  try {
    //   const connection = await MongoClient.connect('mongodb://localhost:27017/test', {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //   });
    //   await connection.db('test');
    // const user = new User({
    //   email: 'yali@gmail.com',
    //   password: 'abcde123',
    //   username: 'yalicoo',
    //   confirmed: true,
    // });

    // await user.save();
    const user = await helper.createTestUser();

    // create aliases
    const alias = new Alias({
      aliasName: 'Ayal Bark-Cohen',
      user: user._id,
      handle: 'TinyJewBoy',
      currency: 'USD',
      profileImage: '/data/images/profileImages/IMG_9147.jpeg',
    });
    await alias.save();
    user.aliases.push(alias._id);

    const wishlist = await Wishlist.create({
      wishlistName: "Ayal's Wishes",
      user: user._id,
      alias: alias._id,
      wishlistMessage: 'thanks for shopping',
      coverImage: '/data/images/coverImages/IMG_9495.jpeg',
    });

    alias.wishlists.push(wishlist._id);
    user.wishlists.push(wishlist._id);
    await wishlist.save();
    await alias.save();
    await user.save();

    const wishlistItem = await WishlistItem.create({
      itemName: 'Bottega Veneta ribbed-knit Jumper - Farfetch',
      price: '18000',
      currency: 'USD',
      url:
        'https://www.farfetch.com/shopping/women/bottega-veneta-ribbed-knit-jumper-item-16156077.aspx?storeid=9359',
      wishlist: wishlist._id,
      itemImage: '/data/images/itemImages/ca9ffc72-9576-4750-97da-d402865ea1ff.png',
      user: user._id,
      alias: alias._id,
    });

    wishlist.wishlistItems.push(wishlistItem._id);
    await wishlist.save();

    return { user, alias, wishlist, wishlistItem };
  } catch (err) {
    console.log(err);
  }
  // })();
};

module.exports = seeder;
