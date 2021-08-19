const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const html = require('./scrapeHtml.js');

async function scroll(url) {
  async function autoScroll(page) {
    const doc = await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        window.scrollBy(0, document.documentElement.offsetHeight);
        setTimeout(function () {
          console.log('length', document.querySelector('ul#g-items').children.length);
        }, 5000);
      });
    });
    // const doc = await page.evaluate(async () => {
    //   await new Promise((resolve, reject) => {
    //     let totalHeight = 0;
    //     const distance = 100;
    //     const timer = setInterval(() => {
    //       const { scrollHeight } = document.body;
    //       window.scrollBy(0, distance);
    //       totalHeight += distance;

    //       if (totalHeight >= scrollHeight) {
    //         clearInterval(timer);
    //         resolve(document.documentElement.innerHTML);
    //       }
    //     }, 100);
    //   });
    // });
    // const doc = await page.evaluate(
    //   () =>
    //     new Promise((resolve) => {
    //       var scrollTop = -1;
    //       const interval = setInterval(() => {
    //         window.scrollBy(0, 100);
    //         if (document.documentElement.scrollTop !== scrollTop) {
    //           scrollTop = document.documentElement.scrollTop;
    //           return;
    //         }
    //         clearInterval(interval);
    //         resolve(document.documentElement.innerHTML);
    //       }, 10);
    //     })
    // );
    return doc;
  }

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.setViewport({
    width: 1200,
    height: 800,
  });

  const length = await autoScroll(page);
  //   const $ = cheerio.load(t);
  //   const { length } = $('ul#g-items')[0].children;
  if (length === 90) {
    console.log('success');
  } else {
    console.log(length);
  }

  // console.log(data);

  // await page.screenshot({
  //   path: 'yoursite.png',
  //   fullPage: true,
  // });

  await browser.close();
  return 'done';
}

// scroll('https://www.amazon.com/hz/wishlist/ls/3HQPGAAO6QN0X');

// get html with document.documentElement.outerHTML

const $ = cheerio.load(html);

const items = $('ul#g-items > li');

console.log(items);
wishes = [];
$('ul#g-items > li').each((i, v) => {
  wishes[i] = { price: v.attribs['data-price'] };
});
