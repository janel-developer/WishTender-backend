const ImageService = require('./ImageService');
const { uploadToS3, deleteFromS3 } = require('../lib/s3/s3');

class AWSImageService extends ImageService {
  async store(buffer, dims) {
    const { preparedImage, filepath, filename } = await this.prepareImage(buffer, dims);
    await uploadToS3(preparedImage, filepath, filename);
    return filename;
  }

  async delete(filename) {
    const result = await deleteFromS3(this.filepath(filename));
    return result;
  }

  filepathToStore(filename) {
    return `https://wishtender.s3.amazonaws.com/${this.filepath(filename)}`;
  }
}

module.exports = AWSImageService;
