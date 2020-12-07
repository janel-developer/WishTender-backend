const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const path = require('path');
const fs = require('fs');

const fsunlink = util.promisify(fs.unlink);

class ImageService {
  constructor(directory) {
    this.directory = directory;
  }

  async store(buffer, dims) {
    const filename = ImageService.filename();
    const filepath = this.filepath(filename);
    await sharp(buffer)
      .resize(dims.w, dims.h, { fit: sharp.fit.inside, withoutEnlargement: true })
      .toFile(filepath);
    return filename;
  }

  async delete(filename) {
    return fsunlink(this.filepath(filename));
  }

  static filename() {
    return `${uuidv4()}.png`;
  }

  filepath(filename) {
    return path.resolve(`${this.directory}/${filename}`);
  }
}

module.exports = ImageService;
