import express from "express"
import Subscription from "../models/Subscription.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import { authenticate } from "../middleware/auth.js"
import { createSubscription, cancelSubscription } from "../utils/stripe.js"

const router = express.Router()

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get user's subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).populate("product").sort({ createdAt: -1 })

    res.json({
      status: "success",
      data: { subscriptions },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - frequency
 *             properties:
 *               product:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [weekly, biweekly, monthly]
 *               quantity:
 *                 type: number
 *                 default: 1
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       201:
 *         description: Subscription created successfully
 */
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { product: productId, frequency, quantity = 1, shippingAddress } = req.body

    // Validate product
    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(400).json({
        status: "error",
        message: "Product not found or inactive",
      })
    }

    // Ensure user has Stripe customer ID
    const user = await User.findById(req.user._id)
    if (!user.stripeCustomerId) {
      return res.status(400).json({
        status: "error",
        message: "Stripe customer not found. Please contact support.",
      })
    }

    // Create Stripe subscription (you'll need to create price IDs for subscription products)
    const stripeSubscription = await createSubscription(
      user.stripeCustomerId,
      product.stripePriceId, // You'll need to set this when creating products
      {
        userId: user._id.toString(),
        productId: product._id.toString(),
        frequency,
      },
    )

    // Create subscription in database
    const subscription = await Subscription.create({
      user: user._id,
      product: product._id,
      frequency,
      quantity,
      stripeSubscriptionId: stripeSubscription.id,
      shippingAddress: shippingAddress || user.address,
    })

    await subscription.populate("product")

    res.status(201).json({
      status: "success",
      message: "Subscription created successfully",
      data: {
        subscription,
        clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/subscriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel a subscription
 *     tags: [Subscriptions]
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
 *         description: Subscription cancelled successfully
 */
router.patch("/:id/cancel", authenticate, async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "Subscription not found",
      })
    }

    // Check ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Access denied",
      })
    }

    // Cancel in Stripe
    await cancelSubscription(subscription.stripeSubscriptionId)

    // Update status
    subscription.status = "cancelled"
    await subscription.save()

    res.json({
      status: "success",
      message: "Subscription cancelled successfully",
      data: { subscription },
    })
  } catch (error) {
    next(error)
  }
})

export default router
