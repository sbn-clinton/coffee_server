import express from "express"
import Product from "../models/Product.js"
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js"
import { validateProduct } from "../middleware/validation.js"
import  upload  from "../config/multer.js"

const router = express.Router()

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: roastType
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    const filter = { isActive: true }

    if (req.query.category) {
      filter.category = req.query.category
    }

    if (req.query.roastType) {
      filter.roastType = req.query.roastType
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search }
    }

    // Get products with pagination
    const products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)


    const total = await Product.countDocuments(filter)

    res.json({
      status: "success",
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product || !product.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      })
    }

    res.json({
      status: "success",
      data: { product },
    })
  } catch (error) {
    next(error)
  }
})

// Route: GET /products/:id/image
router.get("/:id/image", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.image || !product.image.data) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.set({
      "Content-Type": product.image.mimetype,
      "Access-Control-Allow-Origin": "http://localhost:3000", // or "*"
      "Cross-Origin-Resource-Policy": "cross-origin", // <-- important for images
    });

    res.send(product.image.data);
  } catch (error) {
    next(error);
  }
});



/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       403:
 *         description: Access denied
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  validateProduct,
  async (req, res, next) => {
    try {
      const {
        name,
        description,
        origin,
        roastType,
        price,
        stock,
        category,
        tags,
        weight,
      } = req.body;

      // Normalize tags into an array
      let parsedTags = [];
      if (tags) {
        if (Array.isArray(tags)) {
          parsedTags = tags;
        } else if (typeof tags === "string") {
          try {
            // Try JSON parsing first
            const jsonParsed = JSON.parse(tags);
            if (Array.isArray(jsonParsed)) {
              parsedTags = jsonParsed;
            } else {
              parsedTags = tags.split(",").map(t => t.trim());
            }
          } catch {
            // Fallback: treat as comma-separated string
            parsedTags = tags.split(",").map(t => t.trim());
          }
        }
      }

      const image = req.file
        ? {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            data: req.file.buffer,
          }
        : null;

      const product = await Product.create({
        name,
        description,
        origin,
        roastType,
        price,
        stock,
        category,
        tags: parsedTags,
        weight,
        image: image,
      });

      res.status(201).json({
        status: "success",
        message: "Product created successfully",
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
);



/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put(
  "/:id",
  upload.single("image"),
  authenticate,
  authorize("admin"),
  validateProduct,
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Products not found",
        });
      }

      // Update text fields
      Object.assign(product, req.body);

      // If an image file is uploaded, update the image data
      if (req.file) {
        product.image = {
          data: req.file.buffer,      // if using memory storage
          mimetype: req.file.mimetype,
          filename: req.file.originalname,
          size: req.file.size,
        };
      }

      await product.save();

      res.json({
        status: "success",
        message: "Product updated successfully",
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
);


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete("/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      })
    }

    res.json({
      status: "success",
      message: "Product deleted successfully",
    })
  } catch (error) {
    next(error)
  }
})

export default router
