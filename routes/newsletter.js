import express from "express"
import { validateNewsletter } from "../middleware/validation.js"
import NewsletterSubscriber from "../models/NewsletterSubscriber.js" // assuming Mongoose
const router = express.Router()

/**
 * @swagger
 * /api/newsletter:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Subscription successful
 *       400:
 *         description: Validation error or duplicate subscription
 */

router.post("/", validateNewsletter, async (req, res) => {
  const { email } = req.body
  console.log("Email:", req.body)
  try {
    const existing = await NewsletterSubscriber.findOne({ email })
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "You are already subscribed to the newsletter",
      })
    }

    await NewsletterSubscriber.create({ email })

    res.json({
      status: "success",
      message: "You have successfully subscribed to the newsletter",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    })
  }
})

export default router
