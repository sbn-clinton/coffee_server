import express from "express"
import User from "../models/User.js"
import { generateToken } from "../utils/jwt.js"
import { authenticate } from "../middleware/auth.js"
import { validateRegistration, validateLogin } from "../middleware/validation.js"
import { createStripeCustomer } from "../utils/stripe.js"
import  upload  from "../config/multer.js"

const router = express.Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/register", upload.none(), validateRegistration, async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists with this email",
      })
    }

    // Create user
    const user = await User.create({ name, email, password })

    // Create Stripe customer
    // try {
    //   const stripeCustomer = await createStripeCustomer(user)
    //   user.stripeCustomerId = stripeCustomer.id
    //   await user.save()
    // } catch (stripeError) {
    //   console.error("Stripe customer creation failed:", stripeError)
    //   // Continue without Stripe customer - can be created later
    // }

    // Generate token
    const token = generateToken({ id: user._id })

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", upload.none(), validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password")

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      })
    }

    // Generate token
    const token = generateToken({ id: user._id })

    // Remove password from response
    user.password = undefined

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticate, async (req, res) => {
  res.json({
    status: "success",
    data: {
      user: req.user,
    },
  })
})

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (client-side token removal)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", (req, res) => {
  res.json({
    status: "success",
    message: "Logout successful",
  })
})

export default router
