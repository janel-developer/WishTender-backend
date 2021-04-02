// to run this file in bash
// $ AWS_ACCESS_KEY_ID=<key> AWS_SECRET_ACCESS_KEY=<secret_key> node s3_upload.js
const fs = require('fs');
const AWS = require('aws-sdk');

const BUCKET_NAME = 'wishtender';
const IAM_USER_KEY = process.env.AWS_ACCESS_KEY_ID;
const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;
console.log(IAM_USER_KEY, IAM_USER_SECRET);
function uploadToS3(filepath) {
  // Configure the file stream and obtain the upload parameters

  const fileStream = fs.createReadStream(filepath);
  fileStream.on('error', (err) => {
    console.log('File Error', err);
  });

  const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME,
  });
  s3bucket.createBucket(() => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `images/coverImages/IMG${(Math.random() * 10000).toString().slice(0, 4)}`, // there's a better random num generator for this - uuid
      Body: fileStream,
    };
    s3bucket.upload(params, function (err, data) {
      if (err) {
        console.log('error in callback');
        console.log(err);
      }
      console.log('success');
      console.log(data);
    });
  });
}

uploadToS3(
  '/Users/dashiellbarkhuss/Documents/gift_registry_business_idea/react app/backend/server/public/data/images/coverImages/default_coverimage2.jpg'
);
