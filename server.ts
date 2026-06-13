import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer configuration for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
  });

  const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // API Routes
  app.post("/api/upload", (req, res, next) => {
    console.log("POST /api/upload request received");
    next();
  }, upload.single("image"), (req: any, res) => {
    console.log("File upload attempted");
    if (!req.file) {
      console.log("No file provided in request");
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log(`File uploaded: ${req.file.filename}`);
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // Error handler for multer/api
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      console.error("Server Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
