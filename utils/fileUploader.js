import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-provider-env';
import { configDotenv } from 'dotenv';
import multer from 'multer';
import multerS3, { AUTO_CONTENT_TYPE } from 'multer-s3';

configDotenv();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

export const fileUploader = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, callback) => {
      const dir = process.env.AWS_S3_BUCKET_UPLOAD_DIR;
      callback(null, `${dir}/attachment_${Date.now().toString()}`);
    },
    acl: 'public-read-write',
    contentType: AUTO_CONTENT_TYPE,
  }),
});

export const deleteFile = async (key) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }),
  );
};
