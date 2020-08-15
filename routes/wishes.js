const express = require("express");
const wishRoutes = express.Router();

module.exports = (params) => {
  const wishesService = params;

  wishRoutes.get("/", async (req, res) => {
    let wishes;
    try {
      console.log(wishesService);
      wishes = await wishesService.getData().catch((x) => {
        throw x;
      });
    } catch (err) {
      wishes = err;
    }
    return res.json(wishes);
  });

  wishRoutes.route("/:id").get(async function (req, res) {
    let id = req.params.id;
    const wish = await wishesService
      .getWish(id)
      .then((x) => {
        console.log("good:", x);
        return x;
      })
      .catch((err) => {
        console.log("oops", err.message);
        return err;
      });
    res.json(wish);
  });

  wishRoutes.route("/add").post(function (req, res) {
    wishesService
      .addWish(req.body)
      .then((wish) => {
        res.status(200).json({ wish: "wish added successfully" });
      })
      .catch((err) => {
        res.status(400).send("adding new wish failed");
      });
  });

  wishRoutes.route("/delete/:id").delete(function (req, res) {
    console.log("wish route");
    wishesService.deleteWish(req.params.id, (err, wish) => {
      if (err) {
        res.send("error removing wish");
      } else {
        console.log(wish);
        res.json({ message: "wish deleted", wish });
      }
    });
  });

  wishRoutes.route("/delete/many").post(async function (req, res) {
    await wishesService.deleteWishes(req.body.ids);
    res.status(200).json("wishes deleted");
  });

  wishRoutes.route("/update/:id").post(async function (req, res) {
    const wishUpdateResult = await wishesService.updateWish(
      req.params.id,
      req.body
    );

    res.send(wishUpdateResult);
  });

  wishRoutes.route("/productInfo").post(async function (req, res) {
    const info = await wishesService.getProductInfo(req.body.url);
    res.json(info);
  });

  return wishRoutes;
};
