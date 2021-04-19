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
const getPhoneDomain = (req) => {
  const reg = /(?<=http:\/\/|https:\/\/)(.*)(?=:)/g;
  const origin = req.headers.referer.match(reg)[0];
  return origin;
};

const isPhoneDebugging = (req) =>
  req.headers['user-agent'] &&
  req.headers['user-agent'].match('iPhone') &&
  process.env.NODE_ENV !== 'production';

const getAcceptableDomain = (req) => {
  let domain = 'wishtender.com';
  if (isLocalhost(req) && process.env.NODE_ENV !== 'production') {
    // domain = 'localhost';
    domain = '';
  } else if (
    req.get('user-agent') &&
    req.get('user-agent').slice(0, 14) === 'PostmanRuntime' &&
    process.env.NODE_ENV !== 'production'
  ) {
    domain = '';
  } else if (
    req.get('user-agent') &&
    req.get('user-agent').slice(0, 15) === 'node-superagent' &&
    process.env.NODE_ENV === 'test'
  ) {
    domain = '';
  } else if (isPhoneDebugging(req)) {
    domain = getPhoneDomain(req);
  }
  return domain;
};

module.exports = { isLocalhost, getAcceptableDomain, isPhoneDebugging, getPhoneDomain };
