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

  async delete(path) {
    let deleteFunc;
    if (path.slice(0, 5) === '/data') {
      deleteFunc = this.deleteByPath;
    } else {
      deleteFunc = this.deleteFilename;
    }
    await deleteFunc(path);
  }

  async deleteFilename(filename) {
    return fsunlink(`${__dirname}/../public/data/${this.filepath(filename)}`);
  }

  // eslint-disable-next-line class-methods-use-this
  async deleteByPath(path) {
    return fsunlink(`${__dirname}/../public${path}`);
  }

  filepathToStore(filename) {
    return `/data/${this.filepath(filename)}`;
  }
}

module.exports = FSImageService;
