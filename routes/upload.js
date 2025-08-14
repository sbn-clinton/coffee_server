import express from "express"
import multer from "multer"
import { GridFSBucket } from "mongodb"
import mongoose from "mongoose"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload an image file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file or upload error
 */
router.post("/image", authenticate, authorize("admin"), upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      })
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    })

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        contentType: req.file.mimetype,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      },
    })

    uploadStream.end(req.file.buffer)

    uploadStream.on("finish", () => {
      res.json({
        status: "success",
        message: "Image uploaded successfully",
        data: {
          fileId: uploadStream.id,
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          size: req.file.size,
        },
      })
    })

    uploadStream.on("error", (error) => {
      next(error)
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/upload/image/{id}:
 *   get:
 *     summary: Get uploaded image by ID
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image retrieved successfully
 *       404:
 *         description: Image not found
 */
router.get("/image/:id", async (req, res, next) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    })

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id))

    downloadStream.on("file", (file) => {
      res.set("Content-Type", file.metadata.contentType)
      res.set("Content-Length", file.length)
    })

    downloadStream.on("error", () => {
      res.status(404).json({
        status: "error",
        message: "Image not found",
      })
    })

    downloadStream.pipe(res)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/upload/image/{id}:
 *   delete:
 *     summary: Delete uploaded image (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Image not found
 */
router.delete("/image/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    })

    await bucket.delete(new mongoose.Types.ObjectId(req.params.id))

    res.json({
      status: "success",
      message: "Image deleted successfully",
    })
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        status: "error",
        message: "Image not found",
      })
    }
    next(error)
  }
})

export default router
