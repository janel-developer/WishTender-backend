const express = require('express');

const wishRoutes = express.Router();
const WishService = require('../services/WishService');

const wishService = new WishService();

module.exports = () => {
  wishRoutes.get('/', async (req, res) => {
    let wishes;
    try {
      console.log(wishService);
      wishes = await wishService.getData().catch((x) => {
        throw x;
      });
    } catch (err) {
      wishes = err;
    }
    return res.json(wishes);
  });

  wishRoutes.route('/:id').get(async function (req, res) {
    const { id } = req.params;
    const wish = await wishService
      .getWish(id)
      .then((x) => {
        console.log('good:', x);
        return x;
      })
      .catch((err) => {
        console.log('oops', err.message);
        return err;
      });
    res.json(wish);
  });

  wishRoutes.route('/add').post(function (req, res) {
    wishService
      .addWish(req.body)
      .then((wish) => {
        res.status(200).json({ wish: `wish added successfully: ${wish}` });
      })
      .catch((err) => {
        res.status(400).send(`adding new wish failed:${err}`);
      });
  });

  wishRoutes.route('/delete/:id').delete(function (req, res) {
    console.log('wish route');
    wishService.deleteWish(req.params.id, (err, wish) => {
      if (err) {
        res.send('error removing wish');
      } else {
        console.log(wish);
        res.json({ message: 'wish deleted', wish });
      }
    });
  });

  wishRoutes.route('/delete/many').post(async function (req, res) {
    await wishService.deleteWishes(req.body.ids);
    res.status(200).json('wishes deleted');
  });

  wishRoutes.route('/update/:id').post(async function (req, res) {
    const wishUpdateResult = await wishService.updateWish(req.params.id, req.body);

    res.send(wishUpdateResult);
  });

  wishRoutes.route('/productInfo').post(async function (req, res) {
    const info = await wishService.getProductInfo(req.body.url);
    res.json(info);
  });

  return wishRoutes;
};
