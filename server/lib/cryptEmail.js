require('dotenv').config({ path: `${__dirname}/./../../.env` });

const k = +process.env.EMAILS_KEY;

const order = (charArray, insOut, rev, decrypt) => {
  let charArrayCopy = charArray;
  const reverse = (arr) => arr.reverse();
  const turnInsideOut = (arr) => {
    const { length } = arr;
    return [...arr.slice(0, length / 2).reverse(), ...arr.slice(length / 2).reverse()];
  };
  const actions = [];
  if (rev) actions.push(reverse);
  if (insOut) actions.push(turnInsideOut);
  if (decrypt) actions.reverse();
  if (actions.length) {
    actions.forEach((func) => {
      charArrayCopy = func(charArrayCopy);
    });
  }
  return charArrayCopy;
};
const code = (charArray, key, n) => {
  const charArrayCopy = charArray;
  for (let i = 0; i < charArray.length; i += 1) {
    const c = charArray[i].charCodeAt(0);

    if (c <= n) {
      charArrayCopy[i] = String.fromCharCode((charArrayCopy[i].charCodeAt(0) + key) % n);
    }
  }
  return charArrayCopy;
};
const encrypt = (str, key = k, n = 126, decrypt = false) => {
  if (!(typeof key === 'number' && key % 1 === 0) || !(typeof key === 'number' && key % 1 === 0)) {
    console.log(typeof key);
    console.log(`encr keyeye${Object.keys(key)}`);
    throw new Error('Invalid parameters when encrypt email.');
  }
  let chars = str.toString().split('');

  if (decrypt) {
    chars = code(chars, key, n);
    const shouldReverse = chars.reduce((a, c) => c.charCodeAt(0) + a, 0) % 2 !== 0;
    const shouldTurnInsideOut =
      chars.length % 2 === 0 && chars.reduce((a, c) => c.charCodeAt(0) + a, 0) % 3 !== 0;
    chars = order(chars, shouldTurnInsideOut, shouldReverse, decrypt);
  } else {
    const shouldReverse = chars.reduce((a, c) => c.charCodeAt(0) + a, 0) % 2 == !0;
    const shouldTurnInsideOut =
      chars.length % 2 === 0 && chars.reduce((a, c) => c.charCodeAt(0) + a, 0) % 3 !== 0;
    chars = code(chars, key, n);
    chars = order(chars, shouldTurnInsideOut, shouldReverse, decrypt);
  }

  return chars.join('');
};
const defs = (str, key = k, n = 126) => {
  if (!(typeof key === 'number' && key % 1 === 0) || !(typeof key === 'number' && key % 1 === 0)) {
    console.log(typeof key);
    console.log(`defs keyeye${Object.keys(key)}`);
    throw new Error('Invalid parameters when defs email.');
  }

  return encrypt(str.toString(), n - key, n, true);
};

module.exports = {
  encrypt,
  defs,
};
