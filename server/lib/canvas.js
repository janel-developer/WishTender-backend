const { createCanvas, loadImage, Image } = require('canvas');
const axios = require('axios');
const sharp = require('sharp');
const { ApplicationError } = require('./Error');

module.exports.createCroppedImage = async (url, crop, dimensions, convert) => {
  console.log('canvas lin 7');
  const canvas = createCanvas(dimensions.w, dimensions.h);
  const ctx = canvas.getContext('2d');
  let img;
  try {
    if (convert) {
      console.log('canvas 13', url);

      const imageResponse = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      console.log('canvas 18', JSON.stringify(imageResponse));

      // const img = new Image(); // Create a new Image
      img = await sharp(imageResponse.data).toFormat(convert).toBuffer();
    }
    ctx.fillStyle = 'white';

    const file = await loadImage(img || url).then((image) => {
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        crop.dx || 0,
        crop.dy || 0,
        crop.dw || canvas.width,
        crop.dh || canvas.height
      );
      let ext = url.split('.').pop().split('?')[0];
      ext = convert || ext === 'jpg' ? 'jpeg' : ext;

      return { buffer: canvas.toBuffer(), mimetype: `image/${ext}` };
    });
    return file;
  } catch (err) {
    console.log('err canvas42 ', err);
    throw new ApplicationError({ err }, `Internal error cropping image.`);
  }
};
