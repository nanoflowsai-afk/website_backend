import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const DOCUMENT_MIMES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer({
    storage: multer.memoryStorage(), // ensure file.buffer is available
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        const allowedMimes = [...IMAGE_MIMES, ...DOCUMENT_MIMES];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Allowed: images (jpeg/png/webp/gif) or documents (pdf/doc/docx)."));
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
    upload.single("file")(req, res, async (err) => {
        var _a;
        if (err) {
            console.error("Upload validation error:", err);
            return res.status(400).json({ error: err.message || "Invalid upload" });
        }
        try {
            const file = req.file;
            if (!file)
                return res.status(400).json({ error: "File is required" });
            if (!file.buffer)
                return res.status(400).json({ error: "Uploaded file buffer missing" });
            // CHECK: If Cloudinary creds are present, use Cloudinary
            const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET;
            if (useCloudinary) {
                // Upload to Cloudinary
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: "nanoflows_uploads",
                    resource_type: "auto", // Automatically detect image vs raw (doc)
                }, (error, result) => {
                    if (error || !result) {
                        console.error("Cloudinary upload error:", error);
                        return res.status(500).json({ error: "Cloud upload failed" });
                    }
                    res.json({ url: result.secure_url });
                });
                uploadStream.end(file.buffer);
            }
            else {
                // Fallback: Local Filesystem
                console.warn("Cloudinary credentials missing. Falling back to local storage (ephemeral on some platforms).");
                const ext = (((_a = file.originalname) === null || _a === void 0 ? void 0 : _a.split(".").pop()) || "bin").toLowerCase();
                const name = crypto.randomBytes(8).toString("hex");
                const filename = `${name}.${ext}`;
                await fs.mkdir(UPLOAD_DIR, { recursive: true });
                const filePath = path.join(UPLOAD_DIR, filename);
                await fs.writeFile(filePath, file.buffer);
                const url = `/uploads/${filename}`;
                res.json({ url });
            }
        }
        catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ error: "Upload failed" });
        }
    });
});
export default router;
//# sourceMappingURL=uploads.js.map