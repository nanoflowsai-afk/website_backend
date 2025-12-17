import { Router } from "express";
import type { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

type UploadFile = {
  mimetype: string;
  originalname?: string;
  buffer?: Buffer;
};

const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const DOCUMENT_MIMES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const upload = multer({
  storage: multer.memoryStorage(), // ensure file.buffer is available
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req: Request, file: UploadFile, cb: (error: Error | null, acceptFile: boolean) => void) => {
    const allowedMimes = [...IMAGE_MIMES, ...DOCUMENT_MIMES];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: images (jpeg/png/webp/gif) or documents (pdf/doc/docx)."), false);
    }
  },
});
const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure uploads directory exists on startup
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch((err) => {
  console.error("Failed to create uploads directory:", err);
});

router.post("/", (req, res) => {
  // Wrap multer to surface validation errors as JSON instead of default HTML
  upload.single("file")(req, res, async (err: any) => {
    if (err) {
      console.error("Upload validation error:", err);
      return res.status(400).json({ error: err.message || "Invalid upload" });
    }

    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "File is required" });
      if (!file.buffer) return res.status(400).json({ error: "Uploaded file buffer missing" });

      const ext = (file.originalname?.split(".").pop() || "bin").toLowerCase();
      const name = crypto.randomBytes(8).toString("hex");
      const filename = `${name}.${ext}`;

      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const filePath = path.join(UPLOAD_DIR, filename);
      await fs.writeFile(filePath, file.buffer);

      const url = `/uploads/${filename}`;
      res.json({ url });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
});

export default router;
