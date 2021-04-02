const util = require('util');
const fs = require('fs');
const ImageService = require('./ImageService');

const fsunlink = util.promisify(fs.unlink);

class FSImageService extends ImageService {
  async store(buffer, dims) {
    const { preparedImage, filepath, filename } = await this.prepareImage(buffer, dims);
    await preparedImage.toFile(`${__dirname}/../public/data/${filepath}`);
    return filename;
  }

  async delete(filename) {
    return fsunlink(`${__dirname}/../public/data/${this.filepath(filename)}`);
  }

  filepathToStore(filename) {
    return `/data/${this.filepath(filename)}`;
  }
}

module.exports = FSImageService;
