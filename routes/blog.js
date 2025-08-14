import express from "express"
import BlogPost from "../models/BlogPost.js"
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js"
import { body, validationResult } from "express-validator"
import upload from "../config/multer.js" // Assuming you have a file upload middleware

const router = express.Router()

// Validation middleware for blog posts
const validateBlogPost = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("body").trim().isLength({ min: 50 }).withMessage("Body must be at least 50 characters"),
  body("excerpt").optional().trim().isLength({ max: 300 }).withMessage("Excerpt cannot exceed 300 characters"),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      })
    }
    next()
  },
]

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get published blog posts
 *     tags: [Blog]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully
 */
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { isPublished: true }

    if (req.query.search) {
      filter.$text = { $search: req.query.search }
    }

    const posts = await BlogPost.find(filter)
      .populate("author", "name")
      .populate("featuredImage")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await BlogPost.countDocuments(filter)

    res.json({
      status: "success",
      data: {
        posts,
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
 * /api/blog/{slug}:
 *   get:
 *     summary: Get blog post by slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *       404:
 *         description: Blog post not found
 */
router.get("/:slug", async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      isPublished: true,
    })
      .populate("author", "name")
      .populate("featuredImage")

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Blog post not found",
      })
    }

    res.json({
      status: "success",
      data: { post },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Create a new blog post (Admin only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogPost'
 *     responses:
 *       201:
 *         description: Blog post created successfully
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("image"), // handle single image upload
  validateBlogPost,
  async (req, res, next) => {
    try {
      let tags = [];

      // Parse tags from request
      if (req.body.tags) {
        if (typeof req.body.tags === "string") {
          try {
            // Try parsing JSON string from Postman like '["tag1", "tag2"]'
            tags = JSON.parse(req.body.tags);
          } catch {
            // Or fallback to comma-separated string
            tags = req.body.tags.split(",").map((tag) => tag.trim());
          }
        } else if (Array.isArray(req.body.tags)) {
          tags = req.body.tags;
        }
      }

      const postData = {
        title: req.body.title,
        body: req.body.body,
        excerpt: req.body.excerpt,
        tags,
        author: req.user._id,
        isPublished: req.body.isPublished === "true" || req.body.isPublished === true,
      };

      if (postData.isPublished) {
        postData.publishedAt = new Date();
      }

      // Add image if uploaded
      if (req.file) {
        postData.image = {
          fileName: req.file.originalname,
          data: req.file.buffer,
          mimetype: req.file.mimetype,
          size: req.file.size,
        };
      }

      const post = await BlogPost.create(postData);
      await post.populate("author", "name");

      res.status(201).json({
        status: "success",
        message: "Blog post created successfully",
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Update blog post (Admin only)
 *     tags: [Blog]
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
 *         description: Blog post updated successfully
 */
router.put("/:id", authenticate, authorize("admin"), validateBlogPost, async (req, res, next) => {
  try {
    const updateData = { ...req.body }

    // Set publishedAt if publishing for the first time
    if (req.body.isPublished) {
      const existingPost = await BlogPost.findById(req.params.id)
      if (existingPost && !existingPost.isPublished) {
        updateData.publishedAt = new Date()
      }
    }

    const post = await BlogPost.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "name")

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Blog post not found",
      })
    }

    res.json({
      status: "success",
      message: "Blog post updated successfully",
      data: { post },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete blog post (Admin only)
 *     tags: [Blog]
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
 *         description: Blog post deleted successfully
 */
router.delete("/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id)

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Blog post not found",
      })
    }

    res.json({
      status: "success",
      message: "Blog post deleted successfully",
    })
  } catch (error) {
    next(error)
  }
})

export default router
