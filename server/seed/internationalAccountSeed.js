const mongoose = require('mongoose');
const fs = require('fs');
const Alias = require('../models/Alias.Model');
const Wishlist = require('../models/Wishlist.Model');
const User = require('../models/User.Model');
const StripeAccountInfo = require('../models/StripeAccountInfo.Model');
const db = require('../lib/db');
const WishlistItem = require('../models/WishlistItem.Model');

const config = require('../config')[process.env.NODE_ENV || 'development'];

(async () => {
  await fs.copyFileSync(
    `${__dirname}/IMG_9495.jpeg`,
    `${__dirname}/../public/data/images/coverImages/IMG_9495.jpeg`
  );
  await fs.copyFileSync(
    `${__dirname}/IMG_9147.jpeg`,
    `${__dirname}/../public/data/images/profileImages/IMG_9147.jpeg`
  );
  await db.connect(config.database.dsn);
  const user = new User({
    username: 'DashieCan',
    email: 'dashbarkhuss@gmail.com',
    password: 'abcde123',
    confirmed: true,
    currency: 'CAD',
  });
  await user.save();
  const alias = new Alias({
    aliasName: 'Dashie Canada Lady',
    user: user._id,
    handle: 'canada',
    currency: 'CAD',
    profileImage: '/data/images/profileImages/IMG_9147.jpeg',
  });

  await alias.save();
  await user.aliases.push(alias._id);
  await user.save();

  const wishlist = await Wishlist.create({
    wishlistName: 'Canada Dashi',
    user: user._id,
    alias: alias._id,
    wishlistMessage: 'thanks for shopping ay',
    coverImage: '/data/images/coverImages/IMG_9495.jpeg',
  });

  alias.wishlists.push(wishlist._id);
  user.wishlists.push(wishlist._id);
  await wishlist.save();
  await alias.save();
  await user.save();

  const stripeAccountInfo = await StripeAccountInfo({
    user: user._id,
    stripeAccountId: 'acct_1Heou2LKojKNEaYI',
    currency: 'CAD',
  });
  user.stripeAccountInfo = stripeAccountInfo._id;

  await user.save();
  await stripeAccountInfo.save();

  const wishlistItem = await WishlistItem.create({
    itemName: 'Bottega Veneta ribbed-knit Jumper - Farfetch',
    price: '10000',
    currency: 'CAD',
    url:
      'https://www.farfetch.com/shopping/women/bottega-veneta-ribbed-knit-jumper-item-16156077.aspx?storeid=9359',
    wishlist: wishlist._id,
    itemImage: '/data/images/itemImages/ca9ffc72-9576-4750-97da-d402865ea1ff.png',
    user: user._id,
    alias: alias._id,
  });

  wishlist.wishlistItems.push(wishlistItem._id);
  await wishlist.save();
  mongoose.disconnect();
})();
