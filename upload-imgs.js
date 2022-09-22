const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

// Modify
const S3_ENDPOINT = "sfo3.digitaloceanspaces.com";
const S3_BUCKET = "tof-builds";
const S3_KEY = "3BNAB5VUNFESPIMIKK6D";
const S3_SECRET = "RgBEoZsJ19pSkHjbYk+oaI9b17E+r8IQEN5MDifgluc";
const ROOT_FOLDER = "./images";

const EXT_IGNORE = [".zip", ".webp"];
const PUBLIC_ACL = "public-read";

const UPLOADED_PATH = path.join(__dirname, "_content", "uploaded_images.json");
const UPLOADED_IMAGES = require(UPLOADED_PATH);

// console.log(UPLOADED_IMAGES);

const spacesEndpoint = new AWS.Endpoint(S3_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: S3_KEY,
  secretAccessKey: S3_SECRET,
});

function checkExt(filename) {
  let check = true;
  for (const ext of EXT_IGNORE) {
    if (filename.endsWith(ext)) {
      check = false;
      break;
    }
  }

  return check;
}

function getFiles(dir, files_) {
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    if (!checkExt(files[i])) {
      continue;
    }

    var name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }

  return files_;
}

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

function uploadFileToS3(filename) {
  return new Promise((resolve, reject) => {
    const body = fs.readFileSync(filename);
    const size = getFilesizeInBytes(filename);
    if (size > 1000) {
      var params = {
        Bucket: S3_BUCKET,
        Key: filename.replace(ROOT_FOLDER + "/", ""),
        Body: body,
        ACL: PUBLIC_ACL,
      };

      console.info(`Uploading [${filename}]...`);

      s3.putObject(params, (err) => {
        if (err) {
          reject(err);
        } else {
          UPLOADED_IMAGES.push(filename);
          resolve(filename);
        }
      });
    } else {
      console.warn(`${filename} won't be uploaded, might be a broken image`);
      reject("File is broken");
    }
  });
}

async function readFiles(files) {
  console.log("Uploading...");
  const erroredFiles = [];
  let count = 1;
  for (const file of files) {
    // console.info(`File ${count}/${files.length}...`);
    try {
      if (!UPLOADED_IMAGES.includes(file)) {
        await uploadFileToS3(file);
      }
    } catch (err) {
      erroredFiles.push({ file: file, error: err });
    }

    count++;
  }

  console.log("FILES ERROR", erroredFiles);

  fs.writeFileSync(UPLOADED_PATH, JSON.stringify(UPLOADED_IMAGES));

  return "Done!";
}

var files = getFiles(ROOT_FOLDER);

readFiles(files).then((msg) => {
  console.info(msg);
});
