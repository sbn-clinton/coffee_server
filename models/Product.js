import mongoose from "mongoose"

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         origin:
 *           type: string
 *           description: Coffee origin country
 *         roastType:
 *           type: string
 *           enum: [light, medium, dark, espresso]
 *         price:
 *           type: number
 *           description: Price in cents
 *         stock:
 *           type: number
 *           description: Available quantity
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image file IDs
 *         category:
 *           type: string
 *           enum: [single-origin, blend, decaf, seasonal]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         weight:
 *           type: number
 *           description: Weight in grams
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    origin: {
      type: String,
      required: [true, "Coffee origin is required"],
      trim: true,
    },
    roastType: {
      type: String,
      required: [true, "Roast type is required"],
      enum: ["light", "medium", "dark", "espresso"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
     // Updated to store image directly with metadata
    image: {
      data: Buffer, // Raw binary data
      filename: { type: String },
      size: { type: Number },
      mimetype: { type: String },
    },
    
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["single-origin", "blend", "decaf", "seasonal"],
    },
    tags: [String],
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [1, "Weight must be at least 1 gram"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stripeProductId: String,
    stripePriceId: String,
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
productSchema.index({ name: "text", description: "text", origin: "text" })

export default mongoose.model("Product", productSchema)
