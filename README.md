# Artisan Coffee Roaster Backend API

A complete, production-ready backend API for an artisan coffee roaster e-commerce platform built with Node.js, Express.js, MongoDB, and Stripe integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: Full CRUD operations with image upload support
- **Order Processing**: Complete order lifecycle with Stripe payment integration
- **Subscription Service**: Recurring coffee subscriptions with Stripe
- **Blog System**: Content management for blog posts
- **File Upload**: Image handling with MongoDB GridFS
- **Email Integration**: Automated emails for orders and contact forms
- **Admin Dashboard**: Comprehensive admin panel with statistics
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Rate limiting, CORS, helmet, input validation
- **Testing Ready**: Postman collection included

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Stripe account for payments
- Email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd artisan-coffee-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Fill in your environment variables in `.env`:
   \`\`\`env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/artisan-coffee
   JWT_SECRET=your-super-secret-jwt-key
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_EMAIL=admin@artisancoffee.com
   FRONTEND_URL=http://localhost:3000
   \`\`\`

4. **Start MongoDB**
   \`\`\`bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud service
   \`\`\`

5. **Run the application**
   \`\`\`bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🗂️ Project Structure

\`\`\`
├── config/
│   ├── database.js          # MongoDB connection
│   └── gridfs.js           # GridFS configuration
├── controllers/            # Route controllers (if needed)
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Global error handling
│   └── validation.js       # Input validation
├── models/
│   ├── User.js             # User model
│   ├── Product.js          # Product model
│   ├── Order.js            # Order model
│   ├── Subscription.js     # Subscription model
│   └── BlogPost.js         # Blog post model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── products.js         # Product routes
│   ├── orders.js           # Order routes
│   ├── subscriptions.js    # Subscription routes
│   ├── blog.js             # Blog routes
│   ├── contact.js          # Contact form
│   ├── upload.js           # File upload
│   ├── webhooks.js         # Stripe webhooks
│   ├── users.js            # User management
│   └── admin.js            # Admin routes
├── utils/
│   ├── jwt.js              # JWT utilities
│   ├── email.js            # Email utilities
│   └── stripe.js           # Stripe utilities
├── uploads/                # Temporary file storage
├── server.js               # Main application file
├── package.json
├── .env.example
├── postman_collection.json # Postman API collection
└── README.md
\`\`\`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### User Roles
- **customer**: Regular users who can place orders and manage their profile
- **admin**: Full access to all resources and admin panel

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status (Admin)

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription
- `PATCH /api/subscriptions/:id/cancel` - Cancel subscription

### Blog
- `GET /api/blog` - Get published blog posts
- `GET /api/blog/:slug` - Get blog post by slug
- `POST /api/blog` - Create blog post (Admin)
- `PUT /api/blog/:id` - Update blog post (Admin)
- `DELETE /api/blog/:id` - Delete blog post (Admin)

### File Upload
- `POST /api/upload/image` - Upload image (Admin)
- `GET /api/upload/image/:id` - Get uploaded image
- `DELETE /api/upload/image/:id` - Delete image (Admin)

### Contact
- `POST /api/contact` - Submit contact form

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products
- `GET /api/admin/blog` - Get all blog posts

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## 💳 Stripe Integration

The API integrates with Stripe for:
- One-time payments for orders
- Recurring subscriptions
- Webhook handling for payment events

### Setup Stripe
1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints in Stripe dashboard
4. Add webhook URL: `https://yourdomain.com/api/webhooks/stripe`

## 📧 Email Configuration

Configure email settings for:
- Order confirmations
- Contact form submissions
- Admin notifications

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `EMAIL_PASS`

## 🧪 Testing

Import the Postman collection (`postman_collection.json`) to test all endpoints:

1. Open Postman
2. Import the collection file
3. Set the `base_url` variable to your server URL
4. Register/login to get an auth token
5. Test all endpoints

## 🚀 Deployment

### Heroku Deployment

1. **Create Heroku app**
   \`\`\`bash
   heroku create your-app-name
   \`\`\`

2. **Set environment variables**
   \`\`\`bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   # ... set all other environment variables
   \`\`\`

3. **Deploy**
   \`\`\`bash
   git push heroku main
   \`\`\`

### Other Platforms

The app is ready for deployment on:
- **Render**: Use the included `package.json` scripts
- **Railway**: Deploy directly from GitHub
- **DigitalOcean App Platform**: Use the build and run commands
- **AWS/GCP**: Deploy using Docker or serverless functions

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation using express-validator
- **Password Hashing**: bcrypt for secure password storage
- **JWT**: Secure token-based authentication
- **Environment Variables**: Sensitive data protection

## 🤝 Frontend Integration

This backend is designed to work seamlessly with Next.js frontends:

\`\`\`javascript
// Example API call from Next.js
const response = await fetch('http://localhost:5000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
\`\`\`

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@artisancoffee.com or create an issue in the repository.

---

**Happy Coding! ☕**
\`\`\`

```file="Procfile"
web: node server.js
