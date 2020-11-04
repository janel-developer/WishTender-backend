const express = require('express');
const logger = require('../lib/logger');

const sessionRoutes = express.Router();
const countryCurrency = (countryCode) => countryData.callingCountries[countryCode].currencies[0];

module.exports = () => {
  sessionRoutes.post('/local', async (req, res, next) => {
    logger.log('silly', `adding clients local to sessions...`);
    const { countryCode } = req.body; // from extreme-ip-lookup.com
    const languageCode = req.acceptsLanguages()[0]; // from browser settings
    const currency = countryCurrency(countryCode);
    req.session.currency = currency;
    req.session.language = languageCode;
    res.send();
  });
};
