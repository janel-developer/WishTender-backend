const express = require('express');

const exchangeRateRoutes = express.Router();
const ExchangeRateApiInterface = require('../lib/ExchangeRate-Api');

const dummyRates = {
  EUR: 1,
  AED: 4.25511428,
  AFN: 92.42206235,
  ALL: 121.34760705,
  AMD: 554.41,
  ANG: 2.07396993,
  AOA: 695.92563676,
  ARS: 114.44881707,
  AUD: 1.58175728,
  AWG: 2.07396993,
  AZN: 1.96398845,
  BAM: 1.95583,
  BBD: 2.31728483,
  BDT: 98.96334298,
  BGN: 1.95583,
  BHD: 0.43564955,
  BIF: 2288.39927982,
  BMD: 1.15864242,
  BND: 1.566043,
  BOB: 7.95775264,
  BRL: 6.36862676,
  BSD: 1.15864242,
  BTN: 86.59946162,
  BWP: 13.07606004,
  BYN: 2.86926526,
  BZD: 2.31728483,
  CAD: 1.44940322,
  CDF: 2286.37701527,
  CHF: 1.0727691,
  CLP: 939.44572603,
  CNY: 7.45294263,
  COP: 4348.9940486,
  CRC: 722.94586022,
  CUC: 1.15864242,
  CUP: 28.96611908,
  CVE: 110.265,
  CZK: 25.48923201,
  DJF: 205.91508901,
  DKK: 7.46038,
  DOP: 64.94824247,
  DZD: 158.79686856,
  EGP: 18.13320349,
  ERN: 17.37963626,
  ETB: 54.21095,
  FJD: 2.42650047,
  FKP: 0.85091561,
  FOK: 7.46038,
  GBP: 0.85094358,
  GEL: 3.61461729,
  GGP: 0.85091561,
  GHS: 6.99277686,
  GIP: 0.85091561,
  GMD: 60.27177106,
  GNF: 11231.13002136,
  GTQ: 8.92768773,
  GYD: 240.96092667,
  HKD: 9.00067907,
  HNL: 27.79995191,
  HRK: 7.5345,
  HTG: 113.72653072,
  HUF: 360.78887685,
  IDR: 16335.56757734,
  ILS: 3.75570272,
  IMP: 0.85091561,
  INR: 86.59972522,
  IQD: 1681.79814053,
  IRR: 48610.18798416,
  ISK: 149.17238584,
  JMD: 171.84901011,
  JOD: 0.82147747,
  JPY: 129.46722571,
  KES: 127.88566708,
  KGS: 97.95229682,
  KHR: 4698.73807016,
  KID: 1.58171099,
  KMF: 491.96775,
  KRW: 1380.22186067,
  KWD: 0.34716403,
  KYD: 0.96553496,
  KZT: 492.01053775,
  LAK: 11607.26834655,
  LBP: 1746.65344378,
  LKR: 230.79014787,
  LRD: 197.40481475,
  LSL: 17.23683619,
  LYD: 5.24341074,
  MAD: 10.47512459,
  MDL: 20.17792712,
  MGA: 4563.99349194,
  MKD: 61.695,
  MMK: 2204.47197835,
  MNT: 3289.11664911,
  MOP: 9.27069906,
  MRU: 41.70981258,
  MUR: 49.08554302,
  MVR: 17.80513875,
  MWK: 941.18417313,
  MXN: 23.92185034,
  MYR: 4.83282441,
  MZN: 74.044842,
  NAD: 17.23683619,
  NGN: 495.08269674,
  NIO: 40.62543921,
  NOK: 9.89115591,
  NPR: 138.55913859,
  NZD: 1.66876665,
  OMR: 0.44549453,
  PAB: 1.15864242,
  PEN: 4.75159037,
  PGK: 4.05328931,
  PHP: 58.39776084,
  PKR: 197.40541692,
  PLN: 4.60042227,
  PYG: 7949.71305535,
  QAR: 4.2174584,
  RON: 4.94296508,
  RSD: 117.5358341,
  RUB: 83.12143465,
  RWF: 1174.33088949,
  SAR: 4.34490906,
  SBD: 9.19261638,
  SCR: 14.92339682,
  SDG: 506.01794602,
  SEK: 10.1179513,
  SGD: 1.56606588,
  SHP: 0.85091561,
  SLL: 12181.91351523,
  SOS: 666.29479218,
  SRD: 24.75679198,
  SSP: 205.43096948,
  STN: 24.5,
  SYP: 1456.37421734,
  SZL: 17.23683619,
  THB: 39.16343503,
  TJS: 13.0480113,
  TMT: 4.04856141,
  TND: 3.2740767,
  TOP: 2.62162497,
  TRY: 10.32843798,
  TTD: 7.99779581,
  TVD: 1.58171099,
  TWD: 32.38305404,
  TZS: 2658.0848737,
  UAH: 30.45233995,
  UGX: 4129.92109981,
  USD: 1.15873311,
  UYU: 49.73067592,
  UZS: 12320.22222222,
  VES: 4.81469992,
  VND: 26256.36964715,
  VUV: 129.64380899,
  WST: 2.98930997,
  XAF: 655.957,
  XCD: 3.12833453,
  XDR: 0.81961174,
  XOF: 655.957,
  XPF: 119.332,
  YER: 289.26695021,
  ZAR: 17.23694782,
  ZMW: 19.72623029,
};
const ratesFromBase = (bs, rates) => {
  const ratesArray = Object.entries(rates);
  const indexOfBase = Object.entries(rates).findIndex((o) => o[0] === bs);
  const newRates = {};
  ratesArray.forEach((rate) => {
    newRates[rate[0]] = rate[1] / ratesArray[indexOfBase][1];
  });
  return newRates;
};
const ratesApi = new ExchangeRateApiInterface();
module.exports = () => {
  exchangeRateRoutes.route('/all').get(async (req, res, next) => {
    const { base } = req.query;
    if (process.env.NODE_ENV === 'production') {
      const rates = await ratesApi.getAllExchangeRates(base);
      return res.status(200).json({ rates });
    }

    return res.status(200).json({ rates: ratesFromBase(base, dummyRates) });
  });
  exchangeRateRoutes.route('/').get(async (req, res, next) => {
    const { base, symbols } = req.query;
    if (process.env.NODE_ENV === 'production') {
      const rate = await ratesApi.getExchangeRate(base, symbols);

      return res.status(200).json({ rate });
    }
    return res.status(200).json({ rate: ratesFromBase(base, dummyRates)[symbols] });
  });

  return exchangeRateRoutes;
};
