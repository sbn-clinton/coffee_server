import mongoose from "mongoose"

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogPost:
 *       type: object
 *       required:
 *         - title
 *         - body
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           description: Blog post title
 *         slug:
 *           type: string
 *           description: URL-friendly version of title
 *         body:
 *           type: string
 *           description: Blog post content
 *         excerpt:
 *           type: string
 *           description: Short description
 *         author:
 *           type: string
 *           description: Author ID
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         featuredImage:
 *           type: string
 *           description: Featured image file ID
 *         isPublished:
 *           type: boolean
 *           default: false
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    body: {
      type: String,
      required: [true, "Body content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [String],
    image: {
      fileName: String,
      data: Buffer, // Raw binary data
      mimetype: String,
      size: Number,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Generate slug from title
blogPostSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }
  next()
})

// Index for search
blogPostSchema.index({ title: "text", body: "text", tags: "text" })

export default mongoose.model("BlogPost", blogPostSchema)
