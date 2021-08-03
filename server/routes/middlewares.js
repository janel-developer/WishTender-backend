const multer = require('multer');
const { sanitize, sanitizeBody, validationResult } = require('express-validator');
const { createCroppedImage } = require('../lib/canvas');
const logger = require('../lib/logger');

const upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});
const uploadLarge = multer({
  // limits: {
  //   fileSize: 8 * 1024 * 1024,
  // },
});

module.exports.upload = upload;
module.exports.uploadLarge = uploadLarge;

module.exports.handleImage = (imageService, dims) => async (req, res, next) => {
  if (!req.file) return next();

  // getting rid of this because my mime type detection is bad
  // if (req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpeg') {
  //   // should this be a 400 hundred error/validation?
  //   return next(new Error('File format is not supported'));
  // }
  try {
    req.file.storedFilename = await imageService.store(req.file.buffer, dims);
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports.cropImage = (dims) => async (req, res, next) => {
  if (!req.body.imageCrop) return next();
  req.file = await createCroppedImage(req.body.imageCrop.url, req.body.imageCrop.crop, dims);
  return next();
};

module.exports.onlyAllowInBodySanitizer = (allow) =>
  sanitizeBody('*').customSanitizer((value, { req, location, path }) => {
    if (location === 'body') {
      if (!allow.includes(path)) {
        delete req.body[path];
        return;
      }
      return value;
    }
  });
module.exports.throwIfExpressValidatorError = (req, res, next) => {
  const errors = validationResult(req).array();
  if (errors.length) {
    return res.status(400).send({ message: 'Form validation errors', errors });
  }
  return next();
};
module.exports.authLoggedIn = (req, res, next) => {
  logger.log('silly', `authorizing logged in user exists...`);
  if (!req.user) {
    return res.status(401).send(`No user logged`);
  }
  return next();
};
