import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import dotenv from "dotenv"

import connectDB from "./config/database.js"
import errorHandler from "./middleware/errorHandler.js"

// Route imports
import authRoutes from "./routes/auth.js"
import newsletterRoutes from "./routes/newsletter.js"
import userRoutes from "./routes/users.js"
import productRoutes from "./routes/products.js"
import orderRoutes from "./routes/orders.js"
import subscriptionRoutes from "./routes/subscriptions.js"
import blogRoutes from "./routes/blog.js"
import contactRoutes from "./routes/contact.js"
import adminRoutes from "./routes/admin.js"
import uploadRoutes from "./routes/upload.js"
import webhookRoutes from "./routes/webhooks.js"
import { body } from "express-validator"

// Load environment variables
dotenv.config()

const app = express()

// Connect to MongoDB
connectDB()

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

// CORS configuration
app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use("/api/webhooks", express.raw({ type: "application/json" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}



// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Artisan Coffee Roaster API",
      version: "1.0.0",
      description: "Complete backend API for artisan coffee e-commerce platform",
      contact: {
        name: "API Support",
        email: "support@artisancoffee.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./models/*.js"],
}

const specs = swaggerJsdoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/subscriptions", subscriptionRoutes)
app.use("/api/blog", blogRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/webhooks", webhookRoutes)
app.use("/api/newsletter", newsletterRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  })
})

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`)
})

export default app
