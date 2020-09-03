const cheerio = require('cheerio');

/**
 *
 * @param {*} html Response data from an html request
 */
function scrape(html) {
  const info = { currency: null, price: null, imageSrcs: null, title: null };
  /**
   *
   * @param {Object} newInfo Info object
   */
  function setInfo(newInfo) {
    Object.keys(newInfo).forEach((key) => {
      if (!info[key] && newInfo[key] && newInfo[key].length) {
        info[key] = newInfo[key];
      }
    });
  }
  const $ = cheerio.load(html);
  /**
   * Returns schema data
   *
   */
  // william sonoma
  function getSchema() {
    try {
      const scriptTags = $('script');
      const scriptObjectKeys = Object.keys(scriptTags).filter(
        (key) => scriptTags[key].type === 'script'
      );
      const schemaTagKey = scriptObjectKeys.filter(
        (key) => scriptTags[key].attribs.type === 'application/ld+json'
      )[0];
      const { data } = scriptTags[schemaTagKey].children[0];
      return JSON.parse(data);
    } catch (err) {
      return {};
    }
  }
  /**
   * Returns the cerberus price and currency object.
   * @constructor
   */
  // amazon
  function getCerberusData() {
    if ($('#cerberus-data-metrics').length === 0) return {};
    const cerberusData = {};
    const attribs = $('#cerberus-data-metrics').attr();
    const currency = attribs['data-asin-currency-code'];
    const price = attribs['data-asin-price'];
    cerberusData.currency = currency;
    cerberusData.price = price;
    return cerberusData;
  }
  /**
   * Returns an object with the first price based on regex
   */
  function getPriceRegex() {
    try {
      const arrayOfPrices = $(html)
        .text()
        .match(/(\d+\.\d{2,2})/g);
      return { price: arrayOfPrices[0] };
    } catch (err) {
      return {};
    }
  }
  /**
   * Returns true if any attributes are missing
   *
   * @attribs {array} array of strings with attributes,
   * defaults to info keys
   */
  const attribsMissing = (attribs = Object.keys(info)) =>
    attribs.some((attrib) => !info[attrib] || !info[attrib].length);
  // images------------------------------------------

  const imagesMetaTags = $('meta[property="og:image"]');
  const imageSrcs = [];
  Object.keys(imagesMetaTags).forEach((key) => {
    if (imagesMetaTags[key].type === 'tag' && imagesMetaTags[key].name === 'meta') {
      imageSrcs.push($(imagesMetaTags[key]).attr('content'));
    }
  });

  const imageTags = $('img');
  Object.keys(imageTags).forEach((key) => {
    if (imageTags[key].type === 'tag' && imageTags[key].name === 'img') {
      if ($(imageTags[key]).attr('src')) {
        imageSrcs.push($(imageTags[key]).attr('src'));
      } else if ($(imageTags[key]).attr('data-src')) {
        imageSrcs.push($(imageTags[key]).attr('data-src'));
      }
    }
  });

  info.imageSrcs = new Array(...new Set(imageSrcs)); //gets rid of duplicates

  // title--<title>--&-og:title------------------------------------------

  const titleMetaTags = $('meta[property="og:title"]');
  const titleTags = $('title');

  const titleMetaTagText = (() => {
    if (titleMetaTags) {
      if (titleMetaTags[0]) if (titleMetaTags[0].attribs) return titleMetaTags[0].attribs.content;
    }

    return null;
  })();

  setInfo({ title: titleMetaTagText });
  setInfo({ title: titleTags.text() });

  // currency--og:price:currency----------------------------------------

  const currencyMetaTags = $('meta[property="og:price:currency"]');
  const currencyMetaTagsText = currencyMetaTags['0'] ? currencyMetaTags['0'].attribs.content : null;
  setInfo({
    currency: currencyMetaTagsText,
  });

  // price--og:price:amount----------------------------------------

  const priceMetaTags = $('meta[property="og:price:amount"]');
  const priceMetaTagsText = priceMetaTags['0'] ? priceMetaTags['0'].attribs.content : null;

  setInfo({
    price: priceMetaTagsText,
  });

  if (attribsMissing()) {
    // --- get schema.org info----------
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

  if (attribsMissing(['price', 'currency'])) {
    const cerberusData = getCerberusData();
    setInfo(cerberusData);
  }

  if (attribsMissing(['price'])) {
    const cerberusData = getCerberusData();
    setInfo(cerberusData);
  }

  if (attribsMissing(['price'])) {
    setInfo(getPriceRegex());
  }

  if (info.currency) info.currency.trim();

  if (info.price) info.price.trim();

  if (info.title) info.title.trim();

  return info;
}
// const htmls = require('../../../test/unit/server/services/scrapeForProductInfo/htmls.js');
// scrape(htmls.kion);
module.exports = scrape;
