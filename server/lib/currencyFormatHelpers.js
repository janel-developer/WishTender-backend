const currencyInfo = (currency, locale = 'en') => {
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).formatToParts('1000');

  let separator;
  let decimal;
  let decimalPlaces;
  let symbol;
  parts.forEach((p) => {
    switch (p.type) {
      case 'group':
        separator = p.value;
        break;
      case 'decimal':
        decimal = p.value;
        break;
      case 'fraction':
        decimalPlaces = p.value.length;
        break;
      case 'currency':
        symbol = p.value;
        break;
      default:
      // code block
    }
  });
  const info = { separator, decimal, decimalPlaces, symbol };
  return info;
};

module.exports = { currencyInfo };
