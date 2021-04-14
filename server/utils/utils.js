const isLocalhost = (req) => {
  if (req.get('origin')) {
    return req.get('origin').slice(0, 17) === 'http://localhost:';
  }
  if (req.headers.referer) {
    const reg = /(?<=http:\/\/|https:\/\/)(.*)(?=\/)|(?<=http:\/\/|https:\/\/)(.*)/g;
    const origin = req.headers.referer.match(reg)[0];
    return origin.slice(0, 9) === 'localhost';
  }
  return false;
};

const getLocalhostOrigin = (req) => {
  if (req.get('origin')) {
    return req.get('origin').slice(7, 21);
  }
  if (req.headers.referer) {
    const reg = /(?<=http:\/\/|https:\/\/)(.*)(?=\/)|(?<=http:\/\/|https:\/\/)(.*)/g;
    const origin = req.headers.referer.match(reg)[0];
    return origin;
  }
};

const getAcceptableDomain = (req) => {
  let domain = 'wishtender.com';
  if (isLocalhost(req) && process.env.NODE_ENV !== 'production') {
    // domain = 'localhost';
    domain = '';
  } else if (
    req.get('user-agent').slice(0, 15) === 'node-superagent' &&
    process.env.NODE_ENV === 'test'
  ) {
    domain = '';
  }
  return domain;
};

module.exports = { isLocalhost, getAcceptableDomain };
