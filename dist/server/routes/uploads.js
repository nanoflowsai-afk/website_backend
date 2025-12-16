import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
const upload = multer();
const router = Router();
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
router.post("/", upload.single("file"), async (req, res) => {
    var _a;
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: "File is required" });
        const ext = (((_a = file.originalname) === null || _a === void 0 ? void 0 : _a.split(".").pop()) || "bin").toLowerCase();
        const name = crypto.randomBytes(8).toString("hex");
        const filename = `${name}.${ext}`;
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        const filePath = path.join(UPLOAD_DIR, filename);
        await fs.writeFile(filePath, file.buffer);
        const url = `/uploads/${filename}`;
        res.json({ url });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});
export default router;
//# sourceMappingURL=uploads.js.map