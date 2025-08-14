import { body, validationResult } from "express-validator"

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

/**
 * User registration validation
 */
export const validateRegistration = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
]

/**
 * User login validation
 */
export const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

/**
 * Product validation
 */
export const validateProduct = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("price")
    .toFloat() // convert string to number
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("stock")
    .toInt() // convert string to integer
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("weight")
    .toInt() // convert string to integer
    .isInt({ min: 1 })
    .withMessage("Weight must be at least 1 gram"),

  handleValidationErrors,
];

/**
 * Contact form validation
 */
export const validateContact = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("message").trim().isLength({ min: 10, max: 1000 }).withMessage("Message must be between 10 and 1000 characters"),
  handleValidationErrors,
]


export const validateNewsletter = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  handleValidationErrors,
]