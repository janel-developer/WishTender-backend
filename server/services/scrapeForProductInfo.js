const cheerio = require("cheerio");

/**
 * Constructor
 * @param {*} html Response data from an html request
 */
function scrape(html) {
  let info = {};
  const $ = cheerio.load(html);
  const attribsMissing = () => {
    return !info.title || !info.currency || !info.price;
  };

  //images------------------------------------------

  let imagesMetaTags = $('meta[property="og:image"]');
  const imageSrcs = [];
  for (const img in imagesMetaTags) {
    if (
      imagesMetaTags[img].type === "tag" &&
      imagesMetaTags[img].name === "meta"
    ) {
      imageSrcs.push($(imagesMetaTags[img]).attr("content"));
    }
  }
  let imageTags = $("img");
  for (const img in imageTags) {
    if (imageTags[img].type === "tag" && imageTags[img].name === "img") {
      if ($(imageTags[img]).attr("src")) {
        imageSrcs.push($(imageTags[img]).attr("src"));
      } else if ($(imageTags[img]).attr("data-src")) {
        imageSrcs.push($(imageTags[img]).attr("data-src"));
      }
    }
  }

  info.imageSrcs = new Array(...new Set(imageSrcs)); //gets rid of duplicates

  //title--<title>--&-og:title------------------------------------------

  let titleMetaTags = $('meta[property="og:title"]');
  let titleTags = $("title");

  const titleMetaTagText = (() => {
    if (titleMetaTags)
      if (titleMetaTags.attribs)
        if (titleMetaTags.attribs) return titleMetaTags.attribs.content;

    return null;
  })();

  setInfo({ title: titleMetaTagText });
  setInfo({ title: titleTags.text() });

  //currency--og:price:currency----------------------------------------

  const currencyMetaTags = $('meta[property="og:price:currency"]');
  const currencyMetaTagsText = currencyMetaTags["0"]
    ? currencyMetaTags["0"].attribs.content
    : null;
  setInfo({
    currency: currencyMetaTagsText,
  });

  //price--og:price:amount----------------------------------------

  const priceMetaTags = $('meta[property="og:price:amount"]');
  const priceMetaTagsText = priceMetaTags["0"]
    ? priceMetaTags["0"].attribs.content
    : null;

  setInfo({
    price: priceMetaTagsText,
  });

  if (attribsMissing()) {
    //--- get schema.org info----------
    const schema = getSchema();

    if (schema) {
      setInfo({ title: schema.name });

      if (schema.offers)
        setInfo({
          price: schema.offers.price,
          currency: schema.offers.priceCurrency,
        });
    }
  }
  /**
   * Constructor
   * @param {Object} newInfo Info object
   */
  function setInfo(newInfo) {
    for (const attr in newInfo) {
      if (!info[attr] && newInfo[attr]) {
        info[attr] = newInfo[attr];
      }
    }
  }
  function getSchema() {
    for (const script in $("script")) {
      if ($("script")[script].type == "script") {
        if ($("script")[script].attribs.type == "application/ld+json") {
          let data = $("script")[script].children[0].data;
          return JSON.parse(data);
        }
      }
      return null;
    }
  }
  return info;
}

module.exports = scrape;
