import multer from "multer";

// Gunakan memoryStorage agar file disimpan sebagai Buffer (file.buffer) di memori
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limit 5MB
});

export default upload;
