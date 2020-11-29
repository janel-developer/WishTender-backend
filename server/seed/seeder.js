const mongoose = require('mongoose');
const Alias = require('../models/Alias.Model');
const Wishlist = require('../models/Wishlist.Model');
const User = require('../models/User.Model');
const db = require('../lib/db');
const config = require('../config')[process.env.NODE_ENV || 'development'];

console.log(process.env.NODE_ENV);
// const WishlistItem = require('../models/WishlistItem.Model');

(async () => {
  await db.connect(config.database.dsn);
  console.log(User);
  const user = await User.create({
    username: 'Dashie',
    email: 'dangerousdashie@gmail.com',
    password: 'abcde123',
    confirmed: true,
  });

  const alias = await Alias.create({
    aliasName: 'Dashie Bark-Huss',
    user: user._id,
    handle: 'dangerousdashie',
    profilePicture: '/data/images/profileImages/IMG_9495.jpeg',
  });

  const wishlist = await Wishlist.create({
    wishlistName: "Dashie's Wishes",
    user: user._id,
    alias: alias._id,
    coverImage: '/data/images/profileImages/IMG_9147.jpeg',
  });

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
