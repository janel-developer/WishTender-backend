const path = require('path');

module.exports = {
  apps: ['server'].map((name) => ({
    name,
    script: 'bin/www.js',
  })),
};
