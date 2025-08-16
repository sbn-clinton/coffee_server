import express from "express"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import { authenticate, authorize } from "../middleware/auth.js"
import { v4 as uuidv4 } from 'uuid';
import Stripe from "stripe";
import { sendContactEmail } from "../utils/email.js"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router()

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product").sort({ createdAt: -1 })

    res.json({
      status: "success",
      data: { orders },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
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
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product").populate("user", "name email")

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      })
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied",
      })
    }

    res.json({
      status: "success",
      data: { order },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 */

// authenticate,
// router.post("/",  async (req, res, next) => {
//   try {
//     const { items, shippingAddress, total } = req.body

//     console.log("items:", items)
//     console.log("shippingAddress:", shippingAddress)
//     console.log("total:", total)

//     // Validate and calculate order total
//     let totalAmount = 0
//     const orderItems = []

//     for (const item of items) {
//       const product = await Product.findById(item._id)

//       if (!product || !product.isActive) {
//         return res.status(400).json({
//           status: "error",
//           message: `Product ${item.product} not found or inactive`,
//         })
//       }

//       if (product.stock < item.quantity) {
//         return res.status(400).json({
//           status: "error",
//           message: `Insufficient stock for ${product.name}`,
//         })
//       }

//       const itemTotal = product.price * item.quantity
//       totalAmount += itemTotal

//       orderItems.push({
//         product: product._id,
//         quantity: item.quantity,
//         price: product.price,
//       })
//     }


//       const orderNumber = `ORD-${uuidv4().split('-')[0].toUpperCase()}`;
//              // e.g., ORD-9F8C1A
//     // Create order
   
//       const order = await Order.create({
//         // user: req.user._id,
//         items: orderItems,
//         totalAmount,
//         shippingAddress,
//         orderNumber // Add this line
//         // notes,
//       });

//     // Create Stripe payment intent
//     const paymentIntent = await createPaymentIntent(totalAmount, "usd", {
//       orderId: order._id.toString(),
//       customerName: shippingAddress.fullName,
//       customerEmail: shippingAddress.email,
//       orderNumber: order.orderNumber,
//     })

//     // Update order with payment intent ID
//     order.paymentIntentId = paymentIntent.id
//     await order.save()

//     // Populate order for response
//     await order.populate("items.product")

//     res.status(201).json({
//       status: "success",
//       message: "Order created successfully",
//       data: {
//         order,
//         clientSecret: paymentIntent.client_secret,
//       },
//     })
//   } catch (error) {
//     next(error)
//   }
// })


router.post("/", async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item._id);

      if (!product || !product.isActive) {
        return res.status(400).json({
          status: "error",
          message: `Product ${item.product} not found or inactive`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: "error",
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const orderNumber = `ORD-${uuidv4().split("-")[0].toUpperCase()}`;
    const order = await Order.create({
      items: orderItems,
      totalAmount,
      shippingAddress,
      orderNumber,
    });

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe expects amount in cents
        },
        quantity: item.quantity,
      })),
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
      customer_email: shippingAddress.email,
      success_url: "http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/checkout/cancel",
    });

    // Save the session ID for later verification if needed
    order.checkoutSessionId = session.id;
    await order.save();

    await sendContactEmail(order.shippingAddress.fullName, order.shippingAddress.email, "Order placed");

     res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: {
        order,
        checkoutUrl: session.url,
      },
    })

    // res.status(201).json({
    //   status: "success",
    //   message: "Stripe Checkout session created",
    //   data: {
    //     order,
    //     checkoutUrl: session.url,
    //   },
    // });
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, processing, shipped, delivered, cancelled]
 *               trackingNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.patch("/:id/status", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(trackingNumber && { trackingNumber }),
      },
      { new: true },
    ).populate("items.product user")

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      })
    }

    res.json({
      status: "success",
      message: "Order status updated successfully",
      data: { order },
    })
  } catch (error) {
    next(error)
  }
})

export default router
