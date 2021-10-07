const { createCanvas, loadImage, Image } = require('canvas');
const axios = require('axios');
const sharp = require('sharp');
const { ApplicationError } = require('./Error');

module.exports.createCroppedImage = async (url, crop, dimensions, convert) => {
  console.log('canvas lin 7', dimensions.w, dimensions.h);
  const canvas = createCanvas(dimensions.w, dimensions.h);
  console.log('canvas 9');

  const ctx = canvas.getContext('2d');
  let img;
  console.log('canvas 14', convert);

  try {
    if (convert) {
      console.log('canvas 17', url);

      const imageResponse = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      console.log('canvas 18', JSON.stringify(imageResponse));

      // const img = new Image(); // Create a new Image
      img = await sharp(imageResponse.data).toFormat(convert).toBuffer();
    }
    console.log('canvas 17', url);
    console.log('canvas 29', img);
    // tsting
    // url = 'http://httpstat.us/200?sleep=10000';

    ctx.fillStyle = 'white';

    const file = await loadImage(img || url).then((image) => {
      console.log('canvas 32', image);

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
      console.log('canvas 46');

      let ext = url.split('.').pop().split('?')[0];
      console.log('canvas 48', ext);

      ext = convert || ext === 'jpg' ? 'jpeg' : ext;
      console.log('canvas 51');

      return { buffer: canvas.toBuffer(), mimetype: `image/${ext}` };
    });
    return file;
  } catch (err) {
    console.log('err canvas42 ', err);
    throw new ApplicationError({ err }, `Internal error cropping image.`);
  }
};
