const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require('axios');
const html = require('./scrapeHtml.js');

require('dotenv').config({ path: `${__dirname}/./../../.env` });

const toDotDecimal = (price) =>
  parseFloat(price.replace(/(,|\.)([0-9]{3})/g, `$2`).replace(/(,|\.)/, '.'));
const toSmallestUnit = (price, currency) => {
  const dotDec = toDotDecimal(price);
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
  })
    .formatToParts(dotDec)
    .reduce((a, c) => {
      if (c.type === 'integer' || c.type === 'fraction') return a + c.value;
      return a;
    }, '');
};
const formatPrice = (val, cur) => toSmallestUnit(val, cur);

const getProductImage = async (url) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const image = await page.evaluate(() => {
    const img = document.querySelector('#imgBlkFront');
    return {
      url: img.src,
      crop: {
        x: 0, // sx
        y: 0, // sy
        width: img.naturalWidth, // sw
        height: img.naturalHeight, // sh
        dx: (300 - (300 / img.naturalHeight) * img.naturalWidth) / 2, // dx
        dy: 0, // dy
        dw: (300 / img.naturalHeight) * img.naturalWidth, // dw
        dh: 300, // dh
      },
    };
  });
  await browser.close();

  return image;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const $ = cheerio.load(html);
// set these
const currency = 'USD';
const wishlist = '60e0b52734b7180004920108';
const category = $('#profile-list-name')[0].children[0].data;
const itemEls = $('ul#g-items > li');
const amount = 2;
// const amount = itemEls.length;
let items = [];
let itemsAdded = 0;
const itemElArr = [];
itemEls.each((i, v) => {
  itemElArr[i] = v;
});

const getItemInfo = async (el) => {
  const prom = new Promise((res) => {
    (async () => {
      const {
        title,
      } = el.children[0].children[3].children[1].children[0].children[3].children[5].children[0].children[1].children[1].children[1].children[1].children[1].children[1].attribs;
      let subtitle = '';
      try {
        subtitle = ` ${el.children[0].children[3].children[1].children[0].children[3].children[5].children[0].children[1].children[1].children[1].children[1].children[3].children[0].data.trim()}`;
      } catch (err) {
        console.log('no subtitle');
      }
      //   const price = el.children[0].children[3].children[1].children[0].children[3].children[5].children[0].children[1].children[1].children[1].children[3].children[3].children[1].children[1].children[0].children[0].data.slice(1)
      const price = formatPrice(el.attribs['data-price'], currency);
      const url = `https://www.amazon.com/${el.children[0].children[3].children[1].children[0].children[3].children[5].children[0].children[1].children[1].children[1].children[1].children[1].children[1].attribs.href}`;
      const imageCrop = await getProductImage(url);
      const item = {
        imageCrop,
        wishlist,
        price,
        itemName: title + subtitle,
        category,
        url,
        currency,
        batch: '8-19-8-30',
      };
      res(item);
    })();
  });
  return prom;
};
(async () => {
  items = itemElArr
    .slice(0, amount)
    .reduce(
      (prevPr, currentItemEl) =>
        prevPr.then((acc) => getItemInfo(currentItemEl).then((resp) => [...acc, resp])),
      Promise.resolve([])
    );
  items.then(async (itms) => {
    await axios('http://localhost:4000/api/wishlistItems/multi', {
      method: 'post',
      data: { wishlist, items: itms, site: 'amazon', code: process.env.MASTER_KEY },
    });
  });
})();
