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

const getProductImage = async (url, i) => {
  console.log('getting product image', i);
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
  console.log('got image');

  return image;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const $ = cheerio.load(html);
// set these
const currency = 'USD';
// const wishlist = '60e0b52734b7180004920108';
const wishlist = '60de32e756c14400041aa2e9';
// const wishlist = '611c06c27f58690004740444'; //synnerangel
const category = $('#profile-list-name')[0].children[0].data;
const additionalMoney = 500; // $5.00
const itemEls = $('ul#g-items > li');
// const amount = 2;
const amount = itemEls.length;
// let items = [];

const getItemInfo = (el, i) => {
  console.log('get item info ', i);
  const elToCheerio = $(itemEls[0]);
  const itemId = elToCheerio[0].attribs['data-itemid'];
  const itemName = `#itemName_${elToCheerio[0].attribs['data-itemid']}`;
  let { title } = elToCheerio.find(`#itemName_${itemId}`)[0].attribs;
  let subtitle = '';
  try {
    subtitle = elToCheerio
      .find(`#item-byline-${$(itemEls[0])[0].attribs['data-itemid']}`)[0]
      .children[0].data.trim();
  } catch (err) {
    subtitle = '';
  }
  title = `${title} ${subtitle}`;
  const url = `https://www.amazon.com${elToCheerio.find(itemName)[0].attribs.href}`;
  //   const price = el.children[0].children[3].children[1].children[0].children[3].children[5].children[0].children[1].children[1].children[1].children[3].children[3].children[1].children[1].children[0].children[0].data.slice(1)
  const price = formatPrice(el.attribs['data-price'], currency);
  // const imageCrop = await getProductImage(url, i);

  // temporary and is replaced in later function
  const imageCrop = { url, i };
  const item = {
    imageCrop,
    wishlist,
    price: (parseFloat(price) + additionalMoney).toString(),
    itemName: title + subtitle,
    category,
    url,
    currency,
    batch: '8-21-1-23',
  };
  return item;
};

let itemInfo = [];
itemEls.each((i, v) => {
  itemInfo[i] = getItemInfo(v, i);
});

itemInfo = itemInfo.slice(0, amount);
const getItemImage = async (url, i) => {
  const prom = new Promise((res) => {
    (async () => {
      console.log('getting product image', i);
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url);

      const imageCropObj = await page.evaluate(() => {
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
      console.log('got image');

      res(imageCropObj);
    })();
  });
  return prom;
};

(async () => {
  const prom = itemInfo.reduce(
    (prevPr, currentItemInfo, i) =>
      prevPr.then((acc) =>
        getItemImage(currentItemInfo.url, i).then((resp) => {
          itemInfo[i].imageCrop = resp;
        })
      ),
    Promise.resolve([])
  );
  prom.then(async () => {
    // await axios('https://api.wishtender.com/api/wishlistItems/multi', {
    await axios('http://localhost:4000/api/wishlistItems/multi', {
      method: 'post',
      data: { wishlist, items: itemInfo, site: 'amazon', code: process.env.MASTER_KEY },
    })
      .then((rs) => {
        console.log(rs);
      })
      .catch((err) => {
        console.log(err);
      });
  });
})();
