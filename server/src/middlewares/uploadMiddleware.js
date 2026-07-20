import path from "node:path";
import multer from "multer";
import { AppError } from "../shared/errors/AppError.js";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain"
]);

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const uploadMessageFile = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError("File type is not allowed", 400));
      return;
    }

    cb(null, true);
  }
}).single("file");

export const uploadImageFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!imageMimeTypes.has(file.mimetype)) {
      cb(new AppError("Please select a JPEG, PNG, GIF, or WebP image", 400));
      return;
    }
    cb(null, true);
  }
}).single("file");

export function buildAttachment(file) {
  const publicPath = `/uploads/${path.basename(file.path)}`;

  return {
    url: publicPath,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  };
}
