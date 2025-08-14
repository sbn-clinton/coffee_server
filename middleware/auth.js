import jwt from "jsonwebtoken"
import User from "../models/User.js"

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token or user not found.",
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Invalid token.",
    })
  }
}

/**
 * Middleware to authorize specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Insufficient permissions.",
      })
    }

    next()
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select("-password")

      if (user && user.isActive) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}
