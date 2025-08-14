import mongoose from "mongoose"
import { number } from "zod"

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - user
 *         - items
 *         - totalAmount
 *       properties:
 *         _id:
 *           type: string
 *         orderNumber:
 *           type: string
 *           description: Unique order number
 *         user:
 *           type: string
 *           description: User ID who placed the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: Product ID
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *         totalAmount:
 *           type: number
 *           description: Total order amount in cents
 *         status:
 *           type: string
 *           enum: [pending, paid, processing, shipped, delivered, cancelled]
 *         shippingAddress:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         paymentIntentId:
 *           type: string
 *           description: Stripe payment intent ID
 *         trackingNumber:
 *           type: string
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      street: { type: String, required: true },
      number: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      // country: { type: String, required: true },
    },
    paymentIntentId: String,
    trackingNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  },
)

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments()
    this.orderNumber = `AC${String(count + 1).padStart(6, "0")}`
  }
  next()
})

export default mongoose.model("Order", orderSchema)
