const express = require('express');
const countryData = require('country-data');
const logger = require('../lib/logger');

const sessionRoutes = express.Router();

module.exports = () => {
  const countryCurrency = (countryCode) => countryData.callingCountries[countryCode].currencies[0];
  sessionRoutes.post('/locale', async (req, res, next) => {
    logger.log('silly', `adding clients locale to sessions...`);
    const { countryCode } = req.body; // from extreme-ip-lookup.com
    const languageCode = req.acceptsLanguages()[0]; // from browser settings
    const currency = countryCurrency(countryCode);
    req.session.currency = currency;
    req.session.language = languageCode;
    res.send();
  });
  return sessionRoutes;
};
