import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Modify
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET = process.env.S3_BUCKET;
const S3_KEY = process.env.S3_KEY;
const S3_SECRET = process.env.S3_SECRET;
const PUBLIC_ACL = 'public-read';

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_KEY,
    secretAccessKey: S3_SECRET,
  },
});

// File upload configuration
const ROOT_FOLDER = './images';
const ALLOWED_EXTENSIONS = ['.png', '.webp', '.jpg'];

// Uploaded images tracking
const UPLOAD_TRACKER_FILE = path.join(
  __dirname,
  '_content',
  'uploaded_images.json'
);
let uploadedFiles = [];
if (fs.existsSync(UPLOAD_TRACKER_FILE)) {
  const trackerFileData = fs.readFileSync(UPLOAD_TRACKER_FILE);
  uploadedFiles = JSON.parse(trackerFileData);
}

function isFileAlreadyUploaded(filePath) {
  return uploadedFiles.includes(filePath);
}

async function uploadFile(filePath) {
  const fileContent = fs.readFileSync(filePath);
  const fileKey = filePath.replace(ROOT_FOLDER + '/', '');

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
    Body: fileContent,
    ACL: PUBLIC_ACL,
  });

  try {
    await s3Client.send(command);
    uploadedFiles.push(filePath);
    console.log(`Uploaded ${filePath}`);
    return true;
  } catch (err) {
    console.error(chalk.red(`Error uploading ${filePath}: ${err}`));
    return false;
  }
}

async function uploadFilesRecursively(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      await uploadFilesRecursively(filePath);
    } else {
      const extension = path.extname(filePath).toLowerCase();
      if (
        ALLOWED_EXTENSIONS.includes(extension) &&
        !isFileAlreadyUploaded(filePath)
      ) {
        await uploadFile(filePath);
      }
    }
  }
}

async function uploadImages() {
  console.log(chalk.dim('Uploading files...'));
  await uploadFilesRecursively(ROOT_FOLDER);
  fs.writeFileSync(UPLOAD_TRACKER_FILE, JSON.stringify(uploadedFiles));
  console.log(chalk.green('Done uploading files'));
}

uploadImages();
