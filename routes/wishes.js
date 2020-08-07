const express = require("express");
let Wish = require("../wish.model");
const axios = require("axios");
const cheerio = require("cheerio");
const wishRoutes = express.Router();

module.exports = (params) => {
  const { wishesService } = params;

  wishRoutes.get("/", async (req, res) => {
    const wishes = await wishesService.getData().catch(console.log);
    return res.json(wishes);
  });

  wishRoutes.route("/:id").get(async function (req, res) {
    let id = req.params.id;
    const wish = await wishesService.getWish(id).catch(console.log);
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
    wishesService.deleteWish(req.params.id, (err, wish) => {
      if (err) {
        res.send("error removing wish");
      } else {
        console.log(wish);
        res.json({ message: "wish deleted" });
      }
    });
  });

  wishRoutes.route("/delete/many").post(async function (req, res) {
    await wishesService.deleteWishes(req.body.ids);
    res.status(200).json("wishes deleted");
  });

  // wishRoutes.route("/update2/:id").post(function (req, res) {
  //   wishesService.updateWish(req.params.id, function (err, wish) {
  //     if (!wish) res.status(404).send("data is not found");
  //     else wish.wish_name = req.body.wish_name;
  //     wish
  //       .save()
  //       .then((wish) => {
  //         res.json("Wish updated!");
  //       })
  //       .catch((err) => {
  //         res.status(400).send("Update not possible");
  //       });
  //   });
  // });
  wishRoutes.route("/update/:id").post(function (req, res) {
    wishesService
      .updateWish(req.params.id, req.body)
      .then((wish) => {
        console.log("update:", wish, "<--- why undefined?");
      })
      .catch((err) => console.log("error:", err));
  });

  wishRoutes.route("/productInfo").post(async function (req, res) {
    let info = {};
    info.ogImageSrcs = [];
    info.imageSrcs = [];
    var url = req.body.url;
    await axios
      .get(url)
      .then((res) => {
        if (res.status === 200) {
          const html = res.data;
          const $ = cheerio.load(html);

          let imagesMetaTags = $('meta[property="og:image"]');
          for (const img in imagesMetaTags) {
            if (
              imagesMetaTags[img].type === "tag" &&
              imagesMetaTags[img].name === "meta"
            ) {
              info.ogImageSrcs.push($(imagesMetaTags[img]).attr("content"));
            }
          }
          let imageTags = $("img");
          for (const img in imageTags) {
            if (
              imageTags[img].type === "tag" &&
              imageTags[img].name === "img"
            ) {
              if ($(imageTags[img]).attr("src")) {
                info.imageSrcs.push($(imageTags[img]).attr("src"));
              } else if ($(imageTags[img]).attr("data-src")) {
                info.imageSrcs.push($(imageTags[img]).attr("data-src"));
              }
            }
          }

          info.imageSrcs = new Array(...new Set(info.imageSrcs)); //gets rid of duplicates

          let titleMetaTags = $('meta[property="og:title"]');
          info.title = titleMetaTags["0"]
            ? titleMetaTags["0"].attribs.content
            : null;

          let currencyMetaTags = $('meta[property="og:price:currency"]');
          info.currency = currencyMetaTags["0"]
            ? currencyMetaTags["0"].attribs.content
            : null;

          let priceMetaTags = $('meta[property="og:price:amount"]');
          info.price = priceMetaTags["0"]
            ? priceMetaTags["0"].attribs.content
            : null;

          if (!info.title || !info.currency || !info.price) {
            //--- get schema.org info----------
            let schema;
            for (const script in $("script")) {
              if ($("script")[script].type == "script") {
                if ($("script")[script].attribs.type == "application/ld+json") {
                  let data = $("script")[script].children[0].data;
                  schema = JSON.parse(data);
                }
              }
            }

            if (!info.title) {
              info.title = schema.name;
            }
            if (!info.price) {
              info.price = schema.offers.price;
            }
            if (!info.currency) {
              info.currency = schema.offers.priceCurrency;
            }
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
    console.log("info: ", info);
    res.json(info);
  });

  return wishRoutes;
};
