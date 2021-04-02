const AWS = require('aws-sdk');
const logger = require('../logger');

const BUCKET_NAME = 'wishtender';
const IAM_USER_KEY = process.env.AWS_ACCESS_KEY_ID;
const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;
const config = {
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET,
  Bucket: BUCKET_NAME,
};

function uploadToS3(buffer, path, filename) {
  const s3bucket = new AWS.S3(config);
  const result = new Promise((res, rej) => {
    s3bucket.createBucket(() => {
      const params = {
        Bucket: BUCKET_NAME,
        Key: path + filename,
        Body: buffer,
      };

      s3bucket.upload(params, function (err, data) {
        if (err) {
          logger.log('error', err.message);
          rej(err);
        }
        logger.log('silly', 'upload to AWS successful');
        res(data);
      });
    });
  });
  return result;
}

function deleteFromS3(filepath) {
  const s3 = new AWS.S3(config);

  const params = {
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: [
        {
          Key: filepath,
        },
      ],
    },
  };
  const result = new Promise((res, rej) => {
    s3.deleteObjects(params, function (err, data) {
      if (err) {
        logger.log('error', err.message);
        rej(err);
      }
      logger.log('silly', 'delete from AWS successful');
      res(data);
    });
  });
  return result;
}

module.export = { uploadToS3, deleteFromS3 };
