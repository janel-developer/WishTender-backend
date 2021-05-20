# Supported Currencies

## Stripe Payout Countries and Default Currencies

More info on getting these [values](https://github.com/DashBarkHuss/100-days-of-code/blob/master/post-log-2021.mdupdate-2-23-2)

```javascript
stripePayoutDefaultCurrencies = [
  { AU: 'aud' },
  { AT: 'eur' },
  { BE: 'eur' },
  { BG: 'bgn' },
  { CA: 'cad' },
  { CY: 'eur' },
  { CZ: 'eur' },
  { DK: 'dkk' },
  { EE: 'eur' },
  { FI: 'eur' },
  { FR: 'eur' },
  { DE: 'eur' },
  { GR: 'eur' },
  { HK: 'hkd' },
  { IE: 'eur' },
  { IT: 'eur' },
  { LV: 'eur' },
  { LT: 'eur' },
  { LU: 'eur' },
  { MT: 'eur' },
  { NL: 'eur' },
  { NZ: 'nzd' },
  { NO: 'nok' },
  { PL: 'pln' },
  { PT: 'eur' },
  { RO: 'ron' },
  { SG: 'sgd' },
  { SK: 'eur' },
  { SI: 'eur' },
  { ES: 'eur' },
  { SE: 'sek' },
  { CH: 'eur' },
  { GB: 'gbp' },
  { US: 'usd' },
];
```

## Currencies supported by [exchangerate-api.com](https://www.exchangerate-api.com/docs/supported-currencies)

I stopped using ratesapi because they shut down. So now I'm using the free version of exchangerate-api. They give 1.5K API Requests p/m which is the highest I've seen for a free version. But they only update once per day and they aren't

They have a lot of currencies.

To simplify things, I will still support only the currencies ones ratesapi.io supported. In the future I will look to support more currencies.

## ratesapi.io

```javascript
ratesApiCurrencies = [
  'GBP',
  'HKD',
  'IDR',
  'ILS',
  'DKK',
  'INR',
  'CHF',
  'MXN',
  'CZK',
  'SGD',
  'THB',
  'HRK',
  'EUR',
  'MYR',
  'NOK',
  'CNY',
  'BGN',
  'PHP',
  'PLN',
  'ZAR',
  'CAD',
  'ISK',
  'BRL',
  'RON',
  'NZD',
  'TRY',
  'JPY',
  'RUB',
  'KRW',
  'USD',
  'AUD',
  'HUF',
  'SEK',
];
```

## exchangerate-api

"AED",
"AFN",
"ALL",
"AMD",
"ANG",
"AOA",
"ARS",
"AUD",
"AWG",
"AZN",
"BAM",
"BBD",
"BDT",
"BGN",
"BHD",
"BIF",
"BMD",
"BND",
"BOB",
"BRL",
"BSD",
"BTN",
"BWP",
"BYN",
"BZD",
"CAD",
"CDF",
"CHF",
"CLP",
"CNY",
"COP",
"CRC",
"CUC",
"CUP",
"CVE",
"CZK",
"DJF",
"DKK",
"DOP",
"DZD",
"EGP",
"ERN",
"ETB",
"EUR",
"FJD",
"FKP",
"FOK",
"GBP",
"GEL",
"GGP",
"GHS",
"GIP",
"GMD",
"GNF",
"GTQ",
"GYD",
"HKD",
"HNL",
"HRK",
"HTG",
"HUF",
"IDR",
"ILS",
"IMP",
"INR",
"IQD",
"IRR",
"ISK",
"JMD",
"JOD",
"JPY",
"KES",
"KGS",
"KHR",
"KID",
"KMF",
"KRW",
"KWD",
"KYD",
"KZT",
"LAK",
"LBP",
"LKR",
"LRD",
"LSL",
"LYD",
"MAD",
"MDL",
"MGA",
"MKD",
"MMK",
"MNT",
"MOP",
"MRU",
"MUR",
"MVR",
"MWK",
"MXN",
"MYR",
"MZN",
"NAD",
"NGN",
"NIO",
"NOK",
"NPR",
"NZD",
"OMR",
"PAB",
"PEN",
"PGK",
"PHP",
"PKR",
"PLN",
"PYG",
"QAR",
"RON",
"RSD",
"RUB",
"RWF",
"SAR",
"SBD",
"SCR",
"SDG",
"SEK",
"SGD",
"SHP",
"SLL",
"SOS",
"SRD",
"SSP",
"STN",
"SYP",
"SZL",
"THB",
"TJS",
"TMT",
"TND",
"TOP",
"TRY",
"TTD",
"TVD",
"TWD",
"TZS",
"UAH",
"UGX",
"USD",
"UYU",
"UZS",
"VES",
"VND",
"VUV",
"WST",
"XAF",
"XCD",
"XDR",
"XOF",
"XPF",
"YER",
"ZAR"
])

````

## Stripe Payout Currencies Supported by exchangerate-api.com

As of today, 5/19/21, all the default currencies of the stripe payout countries are supported by exchangerate-api.com

WishTender must be able to convert gift prices to USD in order to calculate gift card note length. So WishTender can only support cross border connect accounts which our exchange rate API supports.

```javascript
currenciesSupportedByBoth = [
  'AUD',
  'EUR',
  'BGN',
  'CAD',
  'DKK',
  'HKD',
  'NZD',
  'NOK',
  'PLN',
  'RON',
  'SGD',
  'SEK',
  'GBP',
  'USD',
];
````

How to replicate:

```javascript
stripeCur = stripePayoutDefaultCurrencies.map((x) => Object.values(x)[0].toUpperCase());
// To get it into an array of only unique currencies

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
stripeCur = stripeCur.filter(onlyUnique);
const currenciesSupportedByBoth = stripeCur.filter((value) =>
  exchangeRateApiCurrencies.includes(value)
);

currenciesSupportedByBoth; // currencies supported by both stripe and ech
```
