const AWS = require('aws-sdk');
const logger = require('../logger');

let BUCKET_NAME;

if (process.env.NODE_ENV === 'production') {
  BUCKET_NAME = 'wishtender';
} else if (process.env.NODE_ENV === 'development') {
  BUCKET_NAME = 'wishtender-dev';
} else {
  BUCKET_NAME = 'wishtender-test';
}
const IAM_USER_KEY =
  process.env.NODE_ENV === 'test'
    ? process.env.AWS_TEST_ACCESS_KEY_ID
    : process.env.AWS_ACCESS_KEY_ID;
const IAM_USER_SECRET =
  process.env.NODE_ENV === 'test'
    ? process.env.AWS_TEST_SECRET_ACCESS_KEY
    : process.env.AWS_SECRET_ACCESS_KEY;
const config = {
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET,
  Bucket: BUCKET_NAME,
};

async function uploadToS3(buffer, path) {
  const s3bucket = new AWS.S3(config);
  const result = await new Promise((res, rej) => {
    s3bucket.createBucket(() => {
      const params = {
        Bucket: BUCKET_NAME,
        Key: path,
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

async function deleteFromS3(filepath) {
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
  const result = await new Promise((res, rej) => {
    s3.deleteObjects(params, function (err, data) {
      if (err) {
        logger.log('error', err.message);
        return rej(err);
      }
      if (!data.Deleted.length) {
        return rej(new Error('AWS image not deleted'));
      }
      logger.log('silly', 'delete from AWS successful');
      return res(data);
    });
  });
  return result;
}
const deleteBucketS3 = async () => {
  const s3 = new AWS.S3(config);

  const params = {
    Bucket: BUCKET_NAME !== 'wishtender-test' ? null : BUCKET_NAME,
  };

  // Call S3 to delete the bucket
  s3.deleteBucket(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data);
    }
  });
};
const clearBucketS3 = async () => {
  const s3 = new AWS.S3(config);

  const params = {
    Bucket: BUCKET_NAME !== 'wishtender-test' ? null : BUCKET_NAME,
    Delete: {
      Objects: [
        {
          Key: 'images/',
        },
      ],
    },
  };
  const result = await new Promise((res, rej) => {
    s3.deleteObjects(params, function (err, data) {
      if (err) {
        logger.log('error', err.message);
        return rej(err);
      }
      if (!data.Deleted.length) {
        return rej(new Error('AWS image not deleted'));
      }
      logger.log('silly', 'deleted images folder from AWS Bucket successful');
      return res(data);
    });
  });
  return result;
};

module.exports = { uploadToS3, deleteFromS3, deleteBucketS3, clearBucketS3 };
