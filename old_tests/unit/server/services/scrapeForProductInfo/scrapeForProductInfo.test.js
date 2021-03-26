const chai = require('chai');
chai.use(require('chai-as-promised'));
const scrape = require('../../../../../server/services/scrapeForProductInfo/scrapeForProductInfo');
const htmls = require('./htmls.js');
const { logger } = require('../../../../helper');

const { should, expect } = chai;

function logInfo(productInfo) {
  logger.log(
    'debug',
    `
    ${
      productInfo.title && productInfo.title.length > 38
        ? `${productInfo.title.slice(0, 40)}...`
        : productInfo.title
    }
    ${productInfo.currency}
    ${productInfo.price}
    ${productInfo.currency}
    ${
      productInfo.imageSrcs && productInfo.imageSrcs.length
        ? `${productInfo.imageSrcs[0].slice(0, 40)}...`
        : productInfo.imageSrcs
    }
    
    `
  );
}
describe('scrapeForProductInfo', async () => {
  context('scrape a link with no info', () => {
    it('should return an object with currency, title, price, imageSrcs', async () => {
      const productInfo = scrape(htmls.noInfo);
      expect(productInfo)
        .to.be.an('object')
        .and.to.have.keys(['currency', 'imageSrcs', 'price', 'title']);
      logInfo(productInfo);
    });
  });

  context('scrape farfetch', () => {
    let productInfo;
    it('should return an info object', async () => {
      productInfo = scrape(htmls.farfetch);
      expect(productInfo)
        .to.be.an('object')
        .and.to.have.keys(['currency', 'imageSrcs', 'price', 'title']);
      logInfo(productInfo);
    });
    it('should have a populated title', () => {
      expect(productInfo.title).to.not.equal(null);
    });
    it('should have a populated currency', () => {
      expect(productInfo.currency).to.not.equal(null);
    });
    it('should have a populated price', () => {
      expect(productInfo.price).to.not.equal(null);
    });
    it('should have a populated imageSrcs', () => {
      expect(productInfo.imageSrcs).to.not.equal(null);
    });
  });

  context('scrape william sonoma', () => {
    let productInfo;
    it('should return an info object', async () => {
      productInfo = scrape(htmls.williamSonoma);
      expect(productInfo)
        .to.be.an('object')
        .and.to.have.keys(['currency', 'imageSrcs', 'price', 'title']);
      logInfo(productInfo);
    });
    it('should have a populated title', () => {
      expect(productInfo.title).to.not.equal(null);
    });
    it('should have a populated currency', () => {
      expect(productInfo.currency).to.not.equal(null);
    });
    it('should have a populated price', () => {
      expect(productInfo.price).to.not.equal(null);
    });
    it('should have a populated imageSrcs', () => {
      expect(productInfo.imageSrcs).to.not.equal(null);
    });
  });

  context('scrape Amazon one price', () => {
    let productInfo;
    it('should get product info object', async () => {
      productInfo = scrape(htmls.amazon);
      expect(productInfo)
        .to.be.an('object')
        .and.to.have.keys(['currency', 'imageSrcs', 'price', 'title']);
      logInfo(productInfo);
    });
    it('should have a populated title', () => {
      expect(productInfo.title).to.not.equal(null);
    });
    it('should have a populated currency', () => {
      expect(productInfo.currency).to.not.equal(null);
    });
    it('should have a populated price', () => {
      expect(productInfo.price).to.not.equal(null);
    });
    it('should have a populated imageSrcs', () => {
      expect(productInfo.imageSrcs).to.not.equal(null);
    });
  });

  context('scrape Amazon link with a price range', () => {
    let productInfo;
    it('should get product info object', async () => {
      productInfo = scrape(htmls.amazonPriceRange);
      expect(productInfo)
        .to.be.an('object')
        .and.to.have.keys(['currency', 'imageSrcs', 'price', 'title']);
      logInfo(productInfo);
    });
    it('should have a populated title', () => {
      expect(productInfo.title).to.not.equal(null);
    });
    it('should have a populated imageSrcs', () => {
      expect(productInfo.imageSrcs).to.not.equal(null);
    });
    it('should have a populated price', () => {
      expect(productInfo.price).to.not.equal(null);
    });
  });

  context('scrape Ebay', () => {
    let productInfo;
    it('should get product info object', async () => {
      productInfo = scrape(htmls.ebay);
      expect(productInfo)
        .to.be.an('object')
        .and.to.have.keys(['currency', 'imageSrcs', 'price', 'title']);
      logInfo(productInfo);
    });
    it('should have a populated title', () => {
      expect(productInfo.title).to.not.equal(null);
    });
    // it('should have a populated currency', () => {
    //   expect(productInfo.currency).to.not.equal(null);
    // });
    it('should have a populated price', () => {
      expect(productInfo.price).to.not.equal(null);
    });
    it('should have a populated imageSrcs', () => {
      expect(productInfo.imageSrcs).to.not.equal(null);
    });
  });

  context('scrape Etsy', () => {
    let productInfo;
    it('should get product info object', async () => {
      productInfo = scrape(htmls.etsy);
      expect(productInfo)
        .to.be.an('object')
        .and.to.have.keys(['currency', 'imageSrcs', 'price', 'title']);
      logInfo(productInfo);
    });
    it('should have a populated title', () => {
      expect(productInfo.title).to.not.equal(null);
    });
    it('should have a populated currency', () => {
      expect(productInfo.currency).to.not.equal(null);
    });
    it('should have a populated price', () => {
      expect(productInfo.price).to.not.equal(null);
    });
    it('should have a populated imageSrcs', () => {
      expect(productInfo.imageSrcs).to.not.equal(null);
    });
  });
  context('scrape Kion', () => {
    let productInfo;
    it('should get product info object', async () => {
      productInfo = scrape(htmls.kion);
      expect(productInfo)
        .to.be.an('object')
        .and.to.have.keys(['currency', 'imageSrcs', 'price', 'title']);
      logInfo(productInfo);
    });
    it('should have a populated title', () => {
      expect(productInfo.title).to.not.equal(null);
    });
    it('should have a populated currency', () => {
      expect(productInfo.currency).to.not.equal(null);
    });
    it('should have a populated price', () => {
      expect(productInfo.price).to.not.equal(null);
    });
    it('should have a populated imageSrcs', () => {
      expect(productInfo.imageSrcs).to.not.equal(null);
    });
  });
});
