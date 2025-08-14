import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * Create Stripe customer
 */
export const createStripeCustomer = async (user) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    })

    return customer
  } catch (error) {
    console.error("Stripe customer creation error:", error)
    throw error
  }
}

/**
 * Create payment intent
 */
export const createPaymentIntent = async (amount, currency = "usd", metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return paymentIntent
  } catch (error) {
    console.error("Payment intent creation error:", error)
    throw error
  }
}

/**
 * Create subscription
 */
export const createSubscription = async (customerId, priceId, metadata = {}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    })

    return subscription
  } catch (error) {
    console.error("Subscription creation error:", error)
    throw error
  }
}

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return subscription
  } catch (error) {
    console.error("Subscription cancellation error:", error)
    throw error
  }
}

export default stripe
