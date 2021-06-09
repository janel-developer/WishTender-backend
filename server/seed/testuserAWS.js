const mongoose = require('mongoose');
const fs = require('fs');
const Alias = require('../models/Alias.Model');
const Wishlist = require('../models/Wishlist.Model');
const User = require('../models/User.Model');
const StripeAccountInfo = require('../models/StripeAccountInfo.Model');
const db = require('../lib/db');
const WishlistItem = require('../models/WishlistItem.Model');

const config = require('../config')[process.env.NODE_ENV || 'development'];

// const ImageService =
//   process.env.NODE_ENV === 'production' || process.env.REMOTE || process.env.AWS
//     ? require('../services/AWSImageService')
//     : require('../services/FSImageService');
const ImageService = require('../services/AWSImageService');

const profileImageService = new ImageService(`images/profileImages/`);
const coverImageService = new ImageService(`images/coverImages/`);
const itemImageService = new ImageService(`images/itemImages/`);

(async () => {
  const uploadToS3GetLink = async (filename, dims, imageService) => {
    const buffer = await fs.readFileSync(`${__dirname}/${filename}`);
    const awsFileName = await imageService.store(buffer, dims);
    const awsLink = imageService.filepathToStore(awsFileName);
    return awsLink;
  };
  const coverAwsLink = await uploadToS3GetLink(
    `IMG_9495.jpeg`,
    { h: 180, w: 600 },
    coverImageService
  );
  const profileAwsLink = await uploadToS3GetLink(
    `IMG_9147.jpeg`,
    { h: 300, w: 300 },
    profileImageService
  );
  const itemAwsLink = await uploadToS3GetLink(
    `IMG_9147.jpeg`,
    { h: 300, w: 300 },
    itemImageService
  );

  await db.connect(config.database.dsn);
  const user = new User({
    username: 'Dashie',
    email: 'seed@gmail.com',
    password: 'abcde123',
    confirmed: true,
    currency: 'USD',
  });
  try {
    await user.save();
  } catch (err) {
    console.log(err.message);
    return;
  }
  const alias = new Alias({
    aliasName: 'Dashie Bark-Huss',
    user: user._id,
    handle: 'deleteaccount',
    currency: 'USD',
    profileImage: profileAwsLink,
  });

  await alias.save();
  await user.aliases.push(alias._id);
  await user.save();

  const wishlist = await Wishlist.create({
    wishlistName: "Dashie's Wishes",
    user: user._id,
    alias: alias._id,
    wishlistMessage: 'thanks for shopping',
    coverImage: coverAwsLink,
  });

  alias.wishlists.push(wishlist._id);
  user.wishlists.push(wishlist._id);
  await wishlist.save();
  await alias.save();
  await user.save();

  const stripeAccountInfo = await StripeAccountInfo({
    activated: true,
    user: user._id,
    stripeAccountId: 'acct_1InTZcPxNpAz2186',
    currency: 'USD',
  });
  user.stripeAccountInfo = stripeAccountInfo._id;

  await user.save();
  await stripeAccountInfo.save();

  const wishlistItem = await WishlistItem.create({
    itemName: 'Bottega Veneta ribbed-knit Jumper - Farfetch',
    price: '18000',
    currency: 'USD',
    url:
      'https://www.farfetch.com/shopping/women/bottega-veneta-ribbed-knit-jumper-item-16156077.aspx?storeid=9359',
    wishlist: wishlist._id,
    itemImage: itemAwsLink,
    user: user._id,
    alias: alias._id,
  });

  wishlist.wishlistItems.push(wishlistItem._id);
  await wishlist.save();
  mongoose.disconnect();
})();
