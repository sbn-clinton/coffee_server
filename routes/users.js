import express from "express"
import User from "../models/User.js"
import { authenticate } from "../middleware/auth.js"
import { body, validationResult } from "express-validator"

const router = express.Router()

// Validation middleware for profile updates
const validateProfileUpdate = [
  body("name").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("phone").optional().trim().isMobilePhone().withMessage("Please provide a valid phone number"),
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
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get("/profile", authenticate, async (req, res) => {
  res.json({
    status: "success",
    data: { user: req.user },
  })
})

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/profile", authenticate, validateProfileUpdate, async (req, res, next) => {
  try {
    const allowedUpdates = ["name", "phone", "address", "preferences"]
    const updates = {}

    // Filter allowed updates
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })

    res.json({
      status: "success",
      message: "Profile updated successfully",
      data: { user },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/users/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.patch("/change-password", authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "New password must be at least 6 characters long",
      })
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password")

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      status: "success",
      message: "Password changed successfully",
    })
  } catch (error) {
    next(error)
  }
})

export default router
