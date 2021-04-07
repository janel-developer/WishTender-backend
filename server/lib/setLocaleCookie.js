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
  let countryCode = locale.match(/(?<=-)[A-Z|a-z]*/g);
  countryCode = countryCode ? countryCode[0].toUpperCase() : null;
  let languageCode = locale.match(/[^-]*/);
  languageCode = languageCode ? languageCode[0] : null;
  return { locale, countryCode, languageCode };
};

const setLocaleCookie = (req, res, next) => {
  const cookieLocale = req.cookies.locale;
  if (!cookieLocale && req.headers['accept-language']) {
    const locale = getPreferredLocale(req.headers['accept-language']);
    const localeObj = makeLocaleObj(locale);
    res.cookie('locale', JSON.stringify(localeObj), {
      maxAge: new Date() * 0.001 + 300,
      domain:
        req.get('origin').slice(0, 17) === 'http://localhost:' ? 'localhost' : 'wishtender.com',
      secure: !!(process.env.NODE_ENV === 'production' || process.env.REMOTE),
      sameSite: process.env.NODE_ENV === 'production' || process.env.REMOTE ? 'none' : true,
    });
    req.locale = JSON.stringify(localeObj); // set for currency middle ware
  }
  next();
};

module.exports = setLocaleCookie;
