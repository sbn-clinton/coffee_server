import express from "express"
import User from "../models/User.js"
import Product from "../models/Product.js"
import Order from "../models/Order.js"
import BlogPost from "../models/BlogPost.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Apply admin authentication to all routes
router.use(authenticate, authorize("admin"))

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get("/dashboard", async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, lowStockProducts] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["paid", "processing", "shipped", "delivered"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find().populate("user", "name email").populate("items.product", "name").sort({ createdAt: -1 }).limit(10),
      Product.find({ stock: { $lt: 10 }, isActive: true })
        .select("name stock")
        .sort({ stock: 1 }),
    ])

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0

    res.json({
      status: "success",
      data: {
        statistics: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: revenue,
        },
        recentOrders,
        lowStockProducts,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get("/users", async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const users = await User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await User.countDocuments()

    res.json({
      status: "success",
      data: {
        users,
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
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get("/orders", async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(filter)

    res.json({
      status: "success",
      data: {
        orders,
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
 * /api/admin/products:
 *   get:
 *     summary: Get all products including inactive (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/products", async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const products = await Product.find().populate("images").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await Product.countDocuments()

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
 * /api/admin/blog:
 *   get:
 *     summary: Get all blog posts including drafts (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully
 */
router.get("/blog", async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const posts = await BlogPost.find()
      .populate("author", "name")
      .populate("featuredImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await BlogPost.countDocuments()

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

export default router
