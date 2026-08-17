import { Storage } from "@google-cloud/storage";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let storageClient = null;

const getBucket = () => {
  if (!process.env.GCP_BUCKET_NAME) {
    throw new Error("Environment variable GCP_BUCKET_NAME is not set!");
  }

  if (!storageClient) {
    const options = {};
    if (process.env.GCP_PROJECT_ID) {
      options.projectId = process.env.GCP_PROJECT_ID;
    }
    if (process.env.GCP_KEY_FILE_PATH) {
      options.keyFilename = process.env.GCP_KEY_FILE_PATH;
    }
    storageClient = new Storage(options);
  }

  return storageClient.bucket(process.env.GCP_BUCKET_NAME);
};

/**
 * Upload file buffer ke Google Cloud Storage Bucket
 * @param {Express.Multer.File} file - File dari multer
 * @returns {Promise<string|null>} - Public URL file di GCS atau null
 */
export const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    try {
      const bucket = getBucket();
      const ext = path.extname(file.originalname || "image.jpg");
      const fileName = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const blob = bucket.file(fileName);

      let bufferData = file.buffer;
      if (!bufferData && file.path && fs.existsSync(file.path)) {
        bufferData = fs.readFileSync(file.path);
      }

      if (!bufferData || bufferData.length === 0) {
        console.error("No file buffer found on req.file!");
        return resolve(null);
      }

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype || "application/octet-stream",
        metadata: {
          contentType: file.mimetype || "application/octet-stream"
        }
      });

      blobStream.on("error", (err) => {
        console.error("GCS Upload Error:", err);
        reject(err);
      });

      blobStream.on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log(`File uploaded successfully to GCS (${bufferData.length} bytes):`, publicUrl);
        resolve(publicUrl);
      });

      blobStream.end(bufferData);
    } catch (error) {
      console.error("GCS Helper Error:", error);
      reject(error);
    }
  });
};

export default uploadToGCS;
