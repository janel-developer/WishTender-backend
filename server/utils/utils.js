const isLocalhost = (req) => {
  if (req.get('origin')) {
    return req.get('origin').slice(0, 17) === 'http://localhost:';
  }
  if (req.headers.referer) {
    const reg = /(http:\/\/|https:\/\/)(.*)(?=\/)|(http:\/\/|https:\/\/)(.*)/g;
    const origin = req.headers.referer.match(reg)[0];
    return origin === 'localhost';
  }
  return false;
};

module.exports = { isLocalhost };
