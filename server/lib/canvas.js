const { createCanvas, loadImage } = require('canvas');

module.exports.createCroppedImage = async (url, crop, dimensions) => {
  const canvas = createCanvas(dimensions.w, dimensions.h);
  const ctx = canvas.getContext('2d');

  const file = await loadImage(url).then((image) => {
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    let ext = url.split('.').pop().split('?')[0];
    ext = ext === 'jpg' ? 'jpeg' : ext;

    return { buffer: canvas.toBuffer(), mimetype: `image/${ext}` };
  });
  return file;
};
