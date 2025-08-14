import express from "express"
import stripe from "../utils/stripe.js"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import Subscription from "../models/Subscription.js"
import { sendOrderConfirmation } from "../utils/email.js"

const router = express.Router()

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     summary: Handle Stripe webhooks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 */
router.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object)
        break

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object)
        break

      case "invoice.payment_succeeded":
        await handleSubscriptionPayment(event.data.object)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    res.status(500).json({ error: "Webhook processing failed" })
  }
})

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  const order = await Order.findOne({ paymentIntentId: paymentIntent.id }).populate("user items.product")

  if (order) {
    order.status = "paid"
    await order.save()

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
    }

    // Send confirmation email
    try {
      await sendOrderConfirmation(order.user, order)
    } catch (emailError) {
      console.error("Failed to send order confirmation:", emailError)
    }

    console.log(`Order ${order.orderNumber} payment confirmed`)
  }
}

// Handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  const order = await Order.findOne({ paymentIntentId: paymentIntent.id })

  if (order) {
    order.status = "cancelled"
    await order.save()
    console.log(`Order ${order.orderNumber} payment failed`)
  }
}

// Handle subscription payment
const handleSubscriptionPayment = async (invoice) => {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription,
  }).populate("user product")

  if (subscription) {
    // Calculate next delivery date based on frequency
    const now = new Date()
    const nextDelivery = new Date(now)

    switch (subscription.frequency) {
      case "weekly":
        nextDelivery.setDate(now.getDate() + 7)
        break
      case "biweekly":
        nextDelivery.setDate(now.getDate() + 14)
        break
      case "monthly":
        nextDelivery.setMonth(now.getMonth() + 1)
        break
    }

    subscription.nextDelivery = nextDelivery
    await subscription.save()

    console.log(`Subscription ${subscription._id} payment processed`)
  }
}

// Handle subscription cancellation
const handleSubscriptionCancelled = async (subscription) => {
  const sub = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  })

  if (sub) {
    sub.status = "cancelled"
    await sub.save()
    console.log(`Subscription ${sub._id} cancelled`)
  }
}

export default router
