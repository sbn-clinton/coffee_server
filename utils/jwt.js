import jwt from "jsonwebtoken"

/**
 * Generate JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}
