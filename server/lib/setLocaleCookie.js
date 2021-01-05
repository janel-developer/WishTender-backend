const getPreferredLocale = (acceptLanguageHeader) => {
  if (!acceptLanguageHeader.length) return '';
  const locales = acceptLanguageHeader
    .split(/(\b, \b|\b,\b|\b;q=\b)/g)
    .filter((el) => el !== ',' && el !== ', ' && el !== ';q=')
    .reduce(
      (a, c, i, arr) =>
        Number.isNaN(Number(c))
          ? [...a, { locale: c, q: Number.isNaN(Number(arr[i + 1])) ? '1' : arr[i + 1] }]
          : a,
      []
    )
    .sort((a, b) => (a.q > b.q ? -1 : 1));
  const prefLocaleWithCountry = locales.find(
    (el) => el.locale.match(/-[A-Z]{2}/g) && el.locale.match(/-[A-Z]{2}/g)
  );
  return prefLocaleWithCountry ? prefLocaleWithCountry.locale : locales[0].locale;
};

const makeLocaleObj = (locale) => {
  let countryCode = locale.match(/(?<=-)[A-Z]*/g);
  countryCode = countryCode ? countryCode[0] : null;
  let languageCode = locale.match(/[^-]*/);
  languageCode = languageCode ? languageCode[0] : null;
  return { locale, countryCode, languageCode };
};

const setLocaleCookie = (req, res, next) => {
  const cookieLocale = req.cookies.locale;
  if (!cookieLocale) {
    const locale = getPreferredLocale(req.headers['accept-language']);
    const localeObj = makeLocaleObj(locale);
    res.cookie('locale', JSON.stringify(localeObj), { maxAge: new Date() * 0.001 + 300 });
    req.locale = JSON.stringify(localeObj); // set for currency middle ware
  }
  next();
};

module.exports = setLocaleCookie;
