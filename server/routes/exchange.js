const express = require('express');

const exchangeRateRoutes = express.Router();
const ExchangeRateApiInterface = require('../lib/ExchangeRate-Api');

const ratesApi = new ExchangeRateApiInterface();
module.exports = () => {
  exchangeRateRoutes.route('/all').get(async (req, res, next) => {
    const { base } = req.query;
    const rates = await ratesApi.getAllExchangeRates(base);
    res.status(200).json({ rates });
  });
  exchangeRateRoutes.route('/').get(async (req, res, next) => {
    const { base, symbols } = req.query;
    const rate = await ratesApi.getExchangeRate(base, symbols);
    res.status(200).json({ rate });
  });

  return exchangeRateRoutes;
};
