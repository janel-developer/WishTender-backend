const express = require("express");
const app = express.Router();
let Wish = require(".././wish.model");
const axios = require("axios");
const cheerio = require("cheerio");
const wishRoutes = express.Router();

module.exports = () => {
  wishRoutes.route("/").get(function (req, res) {
    console.log("sup");
    Wish.find(function (err, wishes) {
      if (err) {
        console.log(err);
      } else {
        res.json(wishes);
      }
    });
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

  wishRoutes.route("/:id").get(function (req, res) {
    let id = req.params.id;
    Wish.findById(id, function (err, wish) {
      res.json(wish);
    });
  });

  wishRoutes.route("/add").post(function (req, res) {
    let wish = new Wish(req.body);
    wish
      .save()
      .then((wish) => {
        res.status(200).json({ wish: "wish added successfully" });
      })
      .catch((err) => {
        res.status(400).send("adding new wish failed");
      });
  });

  wishRoutes.route("/delete/:id").delete(function (req, res) {
    Wish.remove(
      {
        _id: req.params.id,
      },
      (err, wish) => {
        if (err) {
          res.send("error removing wish");
        } else {
          console.log(wish);
          res.json({ message: "wish deleted" });
        }
      }
    );
  });

  wishRoutes.route("/delete/many").post(async function (req, res) {
    console.log(req.body);
    const ids = req.body.ids;

    for (const id of ids) {
      await Wish.findByIdAndDelete(id);
    }

    res.status(200).json({ wish: "wishes deleted" });
  });
  wishRoutes.route("/ids/array").get(function (req, res) {
    Wish.find(function (err, wishes) {
      if (err) {
        console.log(err);
      } else {
        let array = [];
        wishes.forEach((x) => array.push(`${x._id}`));
        console.log(array);

        res.json(array);
      }
    });
  });

  wishRoutes.route("/update/:id").post(function (req, res) {
    Wish.findById(req.params.id, function (err, wish) {
      if (!wish) res.status(404).send("data is not found");
      else wish.wish_name = req.body.wish_name;
      wish
        .save()
        .then((wish) => {
          res.json("Wish updated!");
        })
        .catch((err) => {
          res.status(400).send("Update not possible");
        });
    });
  });

  return wishRoutes;
};
