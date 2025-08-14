import express from "express"
import { validateContact } from "../middleware/validation.js"
import { sendContactEmail } from "../utils/email.js"

const router = express.Router()

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */
router.post("/", validateContact, async (req, res, next) => {
  try {
    const { name, email, message } = req.body

    // Send email to admin
    await sendContactEmail(name, email, message)

    res.json({
      status: "success",
      message: "Thank you for your message. We'll get back to you soon!",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    res.status(500).json({
      status: "error",
      message: "Failed to send message. Please try again later.",
    })
  }
})

export default router
