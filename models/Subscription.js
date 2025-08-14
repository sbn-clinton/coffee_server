import mongoose from "mongoose"

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       required:
 *         - user
 *         - product
 *         - frequency
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *           description: User ID
 *         product:
 *           type: string
 *           description: Product ID
 *         frequency:
 *           type: string
 *           enum: [weekly, biweekly, monthly]
 *         quantity:
 *           type: number
 *           default: 1
 *         status:
 *           type: string
 *           enum: [active, paused, cancelled]
 *         stripeSubscriptionId:
 *           type: string
 *         nextDelivery:
 *           type: string
 *           format: date-time
 *         shippingAddress:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    frequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
    },
    nextDelivery: Date,
    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Subscription", subscriptionSchema)
