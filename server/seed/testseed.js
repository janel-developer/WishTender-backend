// why doesn't handle_lowercased auto update  when fineOne save but it does when created and saced
const mongoose = require('mongoose');
const Alias = require('../models/Alias.Model');
const Wishlist = require('../models/Wishlist.Model');
const User = require('../models/User.Model');
const db = require('../lib/db');
const wishlistItems = require('../routes/wishlistItems');
const config = require('../config')[process.env.NODE_ENV || 'development'];

// const WishlistItem = require('../models/WishlistItem.Model');

(async () => {
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

  alias.handle = 'newNameCAPS';
  await alias.save();

  mongoose.disconnect();
})();
