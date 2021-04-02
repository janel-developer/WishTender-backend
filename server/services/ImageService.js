const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class ImageService {
  constructor(directory) {
    this.directory = directory;
  }

  async prepareImage(buffer, dims) {
    const filename = ImageService.filename();
    const filepath = this.filepath(filename);
    const preparedImage = await sharp(buffer).resize(dims.w, dims.h, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    });

    return { preparedImage, filepath, filename };
  }

  static filename() {
    return `${uuidv4()}.png`;
  }

  filepath(filename) {
    return `${this.directory}${filename}`;
  }
}

module.exports = ImageService;
