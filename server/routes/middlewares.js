const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

module.exports.upload = upload;

module.exports.handleImage = (imageService, dims) => async (req, res, next) => {
  if (!req.file) return next();
  if (req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpeg') {
    return next(new Error('File format is not supported'));
  }
  try {
    req.file.storedFilename = await imageService.store(req.file.buffer, dims);
    return next();
  } catch (error) {
    return next(error);
  }
};
