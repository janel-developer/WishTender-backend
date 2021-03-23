## exchangeratesapi.io

### Supported Currencies

```javascript
// as of 3/23/21
exchangeRateAPICurrencies = [
  'USD',
  'JPY',
  'BGN',
  'CZK',
  'DKK',
  'GBP',
  'HUF',
  'PLN',
  'RON',
  'SEK',
  'CHF',
  'ISK',
  'NOK',
  'HRK',
  'RUB',
  'TRY',
  'AUD',
  'BRL',
  'CAD',
  'CNY',
  'HKD',
  'IDR',
  'ILS',
  'INR',
  'KRW',
  'MXN',
  'MYR',
  'NZD',
  'PHP',
  'SGD',
  'THB',
  'ZAR',
  'EUR',
];
```

### Get Updated Supported Currencies

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

## Stripe Payout Currencies Supported by exchangeratesapi.io

As of today, 3/23/21, all the default currencies of the stripe payout countries are supported by exchangeratesapi.io.

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
const currenciesSupportedByBoth = stripeCur.filter((value) =>
  exchangeRateAPICurrencies.includes(value)
);

currenciesSupportedByBoth; // currencies supported by both stripe and ech
```
