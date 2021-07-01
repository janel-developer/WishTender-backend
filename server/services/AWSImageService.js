const ImageService = require('./ImageService');
const { uploadToS3, deleteFromS3 } = require('../lib/s3/s3');
const logger = require('../lib/logger');

class AWSImageService extends ImageService {
  async store(buffer, dims) {
    const { preparedImage, filepath, filename } = await this.prepareImage(buffer, dims);
    await uploadToS3(preparedImage, filepath);
    return filename;
  }

  // async delete(filename) {
  //   const result = await deleteFromS3(this.filepath(filename));
  //   return result;
  // }

  async delete(path) {
    let deleteFile;
    if (path.slice(0, 6) === 'https:') {
      deleteFile = path.split(this.directory)[1];
    } else {
      deleteFile = path;
    }
    const result = await deleteFromS3(this.filepath(deleteFile));
    logger.log('silly', `deleted ${result.Deleted.Key}`);
  }

  filepathToStore(filename) {
    let bucketEnding;

    if (process.env.NODE_ENV === 'production') {
      bucketEnding = '';
    } else if (process.env.NODE_ENV === 'development') {
      bucketEnding = '-dev';
    } else {
      bucketEnding = '-test';
    }
    return `https://wishtender${bucketEnding}.s3.amazonaws.com/${this.filepath(filename)}`;
  }
}

module.exports = AWSImageService;
