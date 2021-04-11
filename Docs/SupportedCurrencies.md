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

## Currencies Supported by [ratesapi.io](https://ratesapi.io/)

I stopped using from exchangeratesapi because they started charging.
RatesApi supports all the same currencies as exchangeratesapi because they are also based on the European Central Bank.

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

If they need to be updated for some reason, you can get the currencies the RatesApi supports in two ways:

## On European Central Bank Site

1. Go [here](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
1. In the console run:

   ```javascript
   exchangeRateAPICurrencies = [];
   for (i = 0; i < 90; i++) {
     exchangeRateAPICurrencies.push(
       document.querySelector(
         '#main-wrapper > main > div.jumbo-box > div.lower > div > div > table > tbody > tr:nth-child(' +
           (i + 1) +
           ')'
       ).children[0].innerText
     );
   }
   exchangeRateAPICurrencies.push('EUR');
   exchangeRateAPICurrencies; //> this is the new array
   ```

## Through the api

1. Do a call to the api call `GET` `https://api.ratesapi.io/api/latest?base=USD`
2. Then with the data from the response:

```javascript
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
result = Object.keys(responseObject.rates).filter(onlyUnique);
```

## Stripe Payout Currencies Supported by ratesapi.io

As of today, 4/7/21, all the default currencies of the stripe payout countries are supported by ratesapi.io.

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
```

How to replicate:

```javascript
stripeCur = stripePayoutDefaultCurrencies.map((x) => Object.values(x)[0].toUpperCase());
// To get it into an array of only unique currencies

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
stripeCur = stripeCur.filter(onlyUnique);
const currenciesSupportedByBoth = stripeCur.filter((value) => ratesApiCurrencies.includes(value));

currenciesSupportedByBoth; // currencies supported by both stripe and ech
```
