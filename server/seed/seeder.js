const mongoose = require('mongoose');
const fs = require('fs');
const Alias = require('../models/Alias.Model');
const Wishlist = require('../models/Wishlist.Model');
const User = require('../models/User.Model');
const db = require('../lib/db');
const wishlistItems = require('../routes/wishlistItems');
const config = require('../config')[process.env.NODE_ENV || 'development'];

// const WishlistItem = require('../models/WishlistItem.Model');

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
    username: 'Dashie',
    email: 'dangerousdashie@gmail.com',
    password: 'abcde123',
    confirmed: true,
  });
  await user.save();
  const alias = new Alias({
    aliasName: 'Dashie Bark-Huss',
    user: user._id,
    handle: 'DangerousDashie',
    profileImage: '/data/images/profileImages/IMG_9147.jpeg',
  });

  await alias.save();
  await user.aliases.push(alias._id);
  await user.save();

  const wishlist = await Wishlist.create({
    wishlistName: "Dashie's Wishes",
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

  // const wishlistItems = WishlistItem({
  //   itemName: 'Kion Colostrum',
  //   price: 54.95,
  //   currency: 'USD',
  //   url: 'https://getkion.com/collections/gut-health/products/kion-colostrum',
  //   image: '/data/images/wishlistItemImages/kdkjfkjskfsjk.webp'
  // });

  await wishlist.save();
  mongoose.disconnect();
})();
