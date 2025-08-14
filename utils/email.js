import nodemailer from "nodemailer"

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email
 */
export const sendEmail = async (options) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: `Artisan Coffee <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("Email error:", error)
    throw error
  }
}

/**
 * Send contact form email
 */
export const sendContactEmail = async (name, email, message) => {
  const subject = `New Contact Form Submission from ${name}`
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br>")}</p>
  `

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject,
    html,
  })
}

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = async (user, order) => {
  const subject = `Order Confirmation - ${order.orderNumber}`
  const html = `
    <h2>Thank you for your order!</h2>
    <p>Hi ${user.name},</p>
    <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
    <p><strong>Total:</strong> $${(order.totalAmount / 100).toFixed(2)}</p>
    <p>We'll send you another email when your order ships.</p>
    <p>Thank you for choosing Artisan Coffee!</p>
  `

  await sendEmail({
    to: user.email,
    subject,
    html,
  })
}
