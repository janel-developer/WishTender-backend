const fs = require('fs');
const logger = require('../lib/logger');

const deleteImage = (oldImageFile) => {
  const publicDir = `${__dirname}/../public`;
  fs.unlink(`${publicDir}${oldImageFile}`, (err) => {
    if (err) {
      logger.log('silly', `Old image NOT deleted: ${err}`);
    } else {
      logger.log('silly', `Deleted old image: ${oldImageFile.slice(0, 10)}...`);
    }
  });
};

module.exports = { deleteImage };
