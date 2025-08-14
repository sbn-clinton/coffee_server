import mongoose from "mongoose"
import dotenv from "dotenv"

// Import models
import User from "../models/User.js"
import Product from "../models/Product.js"
import Order from "../models/Order.js"
import Subscription from "../models/Subscription.js"
import BlogPost from "../models/BlogPost.js"

// Load environment variables
dotenv.config()

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  }
}

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({})
    await Product.deleteMany({})
    await Order.deleteMany({})
    await Subscription.deleteMany({})
    await BlogPost.deleteMany({})
    console.log("🗑️  Cleared existing data")
  } catch (error) {
    console.error("Error clearing database:", error)
  }
}

// Seed Users
const seedUsers = async () => {
  try {
    const users = [
      {
        name: "Admin User",
        email: "admin.artisancoffee@email.com",
        password: "admin123",
        role: "admin",
        phone: "+1-555-0101",
        // address: {
        //   street: "123 Admin Street",
        //   city: "Seattle",
        //   state: "WA",
        //   zipCode: "98101",
        //   country: "USA",
        // },
        // preferences: {
        //   roastType: ["medium", "dark"],
        //   origins: ["Ethiopia", "Colombia"],
        // },
        // stripeCustomerId: "cus_admin123",
        isActive: true,
      },
      // {
      //   name: "John Smith",
      //   email: "john.smith@email.com",
      //   password: "password123",
      //   role: "customer",
      //   phone: "+1-555-0102",
      //   address: {
      //     street: "456 Coffee Lane",
      //     city: "Portland",
      //     state: "OR",
      //     zipCode: "97201",
      //     country: "USA",
      //   },
      //   preferences: {
      //     roastType: ["light", "medium"],
      //     origins: ["Ethiopia", "Kenya"],
      //   },
      //   stripeCustomerId: "cus_john123",
      //   isActive: true,
      // },
      // {
      //   name: "Sarah Johnson",
      //   email: "sarah.johnson@email.com",
      //   password: "password123",
      //   role: "customer",
      //   phone: "+1-555-0103",
      //   address: {
      //     street: "789 Brew Avenue",
      //     city: "San Francisco",
      //     state: "CA",
      //     zipCode: "94102",
      //     country: "USA",
      //   },
      //   preferences: {
      //     roastType: ["dark", "espresso"],
      //     origins: ["Brazil", "Guatemala"],
      //   },
      //   stripeCustomerId: "cus_sarah123",
      //   isActive: true,
      // },
      // {
      //   name: "Mike Davis",
      //   email: "mike.davis@email.com",
      //   password: "password123",
      //   role: "customer",
      //   phone: "+1-555-0104",
      //   address: {
      //     street: "321 Roast Road",
      //     city: "Austin",
      //     state: "TX",
      //     zipCode: "73301",
      //     country: "USA",
      //   },
      //   preferences: {
      //     roastType: ["medium"],
      //     origins: ["Colombia", "Costa Rica"],
      //   },
      //   stripeCustomerId: "cus_mike123",
      //   isActive: true,
      // },
      // {
      //   name: "Emily Chen",
      //   email: "emily.chen@email.com",
      //   password: "password123",
      //   role: "customer",
      //   phone: "+1-555-0105",
      //   address: {
      //     street: "654 Bean Boulevard",
      //     city: "Denver",
      //     state: "CO",
      //     zipCode: "80201",
      //     country: "USA",
      //   },
      //   preferences: {
      //     roastType: ["light"],
      //     origins: ["Ethiopia", "Panama"],
      //   },
      //   stripeCustomerId: "cus_emily123",
      //   isActive: true,
      // },
    ]

    const createdUsers = await User.create(users)
    console.log(`✅ Created ${createdUsers.length} users`)
    return createdUsers
  } catch (error) {
    console.error("Error seeding users:", error)
    return []
  }
}

// Seed Products
const seedProducts = async () => {
  try {
    const products = [
      {
        name: "Ethiopian Yirgacheffe",
        description:
          "A bright and floral coffee with distinct citrus notes and wine-like acidity. This single-origin coffee from the Yirgacheffe region offers a clean, tea-like body with hints of lemon and bergamot. Perfect for pour-over brewing methods.",
        origin: "Ethiopia",
        roastType: "light",
        price: 1899, // $18.99 in cents
        stock: 45,
        category: "single-origin",
        tags: ["floral", "citrus", "bright", "wine-like", "clean"],
        image: "/images/coffee1.jpg",
        weight: 340, // 12 oz in grams
        isActive: true,
        stripeProductId: "prod_ethiopian_yirgacheffe",
        stripePriceId: "price_ethiopian_yirgacheffe",
      },
      {
        name: "Colombian Supremo",
        description:
          "A well-balanced medium roast with rich chocolate and caramel notes. This premium Colombian coffee offers a full body with low acidity and a smooth, sweet finish. Ideal for espresso or drip coffee.",
        origin: "Colombia",
        roastType: "medium",
        price: 1699, // $16.99
        stock: 62,
        category: "single-origin",
        tags: ["chocolate", "caramel", "balanced", "smooth", "sweet"],
        weight: 340,
        image: "/images/coffee2.jpg",
        isActive: true,
        stripeProductId: "prod_colombian_supremo",
        stripePriceId: "price_colombian_supremo",
      },
      {
        name: "French Roast Blend",
        description:
          "A bold and intense dark roast blend with smoky, robust flavors. This blend combines beans from Central and South America, roasted to perfection for a rich, full-bodied cup with minimal acidity.",
        origin: "Blend (Central & South America)",
        roastType: "dark",
        price: 1599, // $15.99
        stock: 38,
        category: "blend",
        image: "/images/coffee3.jpg",
        tags: ["bold", "smoky", "robust", "full-bodied", "intense"],
        weight: 340,
        isActive: true,
        stripeProductId: "prod_french_roast",
        stripePriceId: "price_french_roast",
      },
      {
        name: "Guatemalan Antigua",
        description:
          "A complex medium-dark roast with spicy and smoky undertones. Grown in the volcanic soil of Antigua, this coffee offers a full body with hints of chocolate, spice, and a subtle smokiness.",
        origin: "Guatemala",
        roastType: "medium",
        price: 1799, // $17.99
        stock: 29,
        image: "/images/coffee4.jpg",
        category: "single-origin",
        tags: ["spicy", "smoky", "complex", "volcanic", "chocolate"],
        weight: 340,
        isActive: true,
        stripeProductId: "prod_guatemalan_antigua",
        stripePriceId: "price_guatemalan_antigua",
      },
      {
        name: "Espresso Blend Supreme",
        description:
          "A carefully crafted espresso blend designed for the perfect shot. This blend combines Brazilian, Colombian, and Italian roasting techniques to create a rich crema with balanced sweetness and low acidity.",
        origin: "Blend (Brazil & Colombia)",
        roastType: "espresso",
        price: 1999, // $19.99
        stock: 55,
        category: "blend",
        image: "/images/coffee5.jpg",
        tags: ["espresso", "crema", "balanced", "sweet", "rich"],
        weight: 340,
        isActive: true,
        stripeProductId: "prod_espresso_supreme",
        stripePriceId: "price_espresso_supreme",
      },
      {
        name: "Kenyan AA",
        description:
          "A bright and wine-like coffee with black currant and citrus notes. This high-grade Kenyan coffee offers exceptional clarity and complexity with a medium body and vibrant acidity.",
        origin: "Kenya",
        roastType: "light",
        price: 2099, // $20.99
        stock: 33,
        category: "single-origin",
        image: "/images/coffee6.jpg",
        tags: ["wine-like", "black-currant", "citrus", "bright", "complex"],
        weight: 340,
        isActive: true,
        stripeProductId: "prod_kenyan_aa",
        stripePriceId: "price_kenyan_aa",
      },
      {
        name: "Brazilian Santos",
        description:
          "A smooth and nutty medium roast with chocolate undertones. This Brazilian coffee offers a well-rounded flavor profile with low acidity and a creamy body, perfect for everyday drinking.",
        origin: "Brazil",
        roastType: "medium",
        price: 1499, // $14.99
        stock: 71,
        category: "single-origin",
        image: "/images/coffee7.jpg",
        tags: ["smooth", "nutty", "chocolate", "creamy", "everyday"],
        weight: 340,
        isActive: true,
        stripeProductId: "prod_brazilian_santos",
        stripePriceId: "price_brazilian_santos",
      },
      {
        name: "Decaf Colombian",
        description:
          "A full-flavored decaffeinated coffee that doesn't compromise on taste. Using the Swiss Water Process, this Colombian decaf maintains the original flavor profile with rich, smooth characteristics.",
        origin: "Colombia",
        roastType: "medium",
        price: 1799, // $17.99
        stock: 24,
        category: "decaf",
        image: "/images/coffee8.jpg",
        tags: ["decaf", "swiss-water", "full-flavor", "smooth", "rich"],
        weight: 340,
        isActive: true,
        stripeProductId: "prod_decaf_colombian",
        stripePriceId: "price_decaf_colombian",
      },
      {
        name: "Holiday Spice Blend",
        description:
          "A seasonal blend with warm spices and festive flavors. This limited-time offering combines medium roast beans with natural cinnamon, nutmeg, and vanilla notes for a cozy, holiday-inspired cup.",
        origin: "Blend (Various)",
        roastType: "medium",
        price: 1899, // $18.99
        stock: 18,
        category: "seasonal",
        image: "/images/coffee9.jpg",
        tags: ["seasonal", "spiced", "cinnamon", "vanilla", "festive"],
        weight: 340,
        isActive: true,
        stripeProductId: "prod_holiday_spice",
        stripePriceId: "price_holiday_spice",
      },
      {
        name: "Costa Rican Tarrazú",
        description:
          "A bright and clean coffee with citrus and floral notes. Grown in the high altitudes of the Tarrazú region, this coffee offers excellent acidity balance with a medium body and crisp finish.",
        origin: "Costa Rica",
        roastType: "light",
        price: 1999, // $19.99
        stock: 41,
        category: "single-origin",
        tags: ["bright", "clean", "citrus", "floral", "high-altitude"],
        weight: 340,
        isActive: true,
        stripeProductId: "prod_costa_rican_tarrazu",
        stripePriceId: "price_costa_rican_tarrazu",
      },
    ]

    const createdProducts = await Product.create(products)
    console.log(`✅ Created ${createdProducts.length} products`)
    return createdProducts
  } catch (error) {
    console.error("Error seeding products:", error)
    return []
  }
}

// Seed Orders
// const seedOrders = async (users, products) => {
//   try {
//     if (users.length === 0 || products.length === 0) {
//       console.log("⚠️  Skipping orders - no users or products available")
//       return []
//     }

//     const orders = [
//       {
//         user: users[1]._id, // John Smith
//         items: [
//           {
//             product: products[0]._id, // Ethiopian Yirgacheffe
//             quantity: 2,
//             price: products[0].price,
//           },
//           {
//             product: products[1]._id, // Colombian Supremo
//             quantity: 1,
//             price: products[1].price,
//           },
//         ],
//         totalAmount: products[0].price * 2 + products[1].price, // $54.97
//         status: "delivered",
//         shippingAddress: {
//           name: "John Smith",
//           street: "456 Coffee Lane",
//           city: "Portland",
//           state: "OR",
//           zipCode: "97201",
//           country: "USA",
//         },
//         paymentIntentId: "pi_john_order_001",
//         trackingNumber: "AC1234567890",
//         notes: "Please leave at front door",
//       },
//       {
//         user: users[2]._id, // Sarah Johnson
//         items: [
//           {
//             product: products[4]._id, // Espresso Blend Supreme
//             quantity: 3,
//             price: products[4].price,
//           },
//         ],
//         totalAmount: products[4].price * 3, // $59.97
//         status: "shipped",
//         shippingAddress: {
//           name: "Sarah Johnson",
//           street: "789 Brew Avenue",
//           city: "San Francisco",
//           state: "CA",
//           zipCode: "94102",
//           country: "USA",
//         },
//         paymentIntentId: "pi_sarah_order_001",
//         trackingNumber: "AC1234567891",
//         notes: "Signature required",
//       },
//       {
//         user: users[3]._id, // Mike Davis
//         items: [
//           {
//             product: products[1]._id, // Colombian Supremo
//             quantity: 1,
//             price: products[1].price,
//           },
//           {
//             product: products[6]._id, // Brazilian Santos
//             quantity: 2,
//             price: products[6].price,
//           },
//         ],
//         totalAmount: products[1].price + products[6].price * 2, // $46.97
//         status: "processing",
//         shippingAddress: {
//           name: "Mike Davis",
//           street: "321 Roast Road",
//           city: "Austin",
//           state: "TX",
//           zipCode: "73301",
//           country: "USA",
//         },
//         paymentIntentId: "pi_mike_order_001",
//         notes: "Rush delivery requested",
//       },
//       {
//         user: users[4]._id, // Emily Chen
//         items: [
//           {
//             product: products[5]._id, // Kenyan AA
//             quantity: 1,
//             price: products[5].price,
//           },
//           {
//             product: products[9]._id, // Costa Rican Tarrazú
//             quantity: 1,
//             price: products[9].price,
//           },
//         ],
//         totalAmount: products[5].price + products[9].price, // $40.98
//         status: "paid",
//         shippingAddress: {
//           name: "Emily Chen",
//           street: "654 Bean Boulevard",
//           city: "Denver",
//           state: "CO",
//           zipCode: "80201",
//           country: "USA",
//         },
//         paymentIntentId: "pi_emily_order_001",
//         notes: "Gift wrapping requested",
//       },
//       {
//         user: users[1]._id, // John Smith (second order)
//         items: [
//           {
//             product: products[7]._id, // Decaf Colombian
//             quantity: 1,
//             price: products[7].price,
//           },
//         ],
//         totalAmount: products[7].price, // $17.99
//         status: "pending",
//         shippingAddress: {
//           name: "John Smith",
//           street: "456 Coffee Lane",
//           city: "Portland",
//           state: "OR",
//           zipCode: "97201",
//           country: "USA",
//         },
//         paymentIntentId: "pi_john_order_002",
//         notes: "Regular delivery",
//       },
//     ]

//     const createdOrders = await Order.create(orders)
//     console.log(`✅ Created ${createdOrders.length} orders`)
//     return createdOrders
//   } catch (error) {
//     console.error("Error seeding orders:", error)
//     return []
//   }
// }

// Seed Subscriptions
// const seedSubscriptions = async (users, products) => {
//   try {
//     if (users.length === 0 || products.length === 0) {
//       console.log("⚠️  Skipping subscriptions - no users or products available")
//       return []
//     }

//     const subscriptions = [
//       {
//         user: users[1]._id, // John Smith
//         product: products[0]._id, // Ethiopian Yirgacheffe
//         frequency: "monthly",
//         quantity: 2,
//         status: "active",
//         stripeSubscriptionId: "sub_john_monthly_001",
//         nextDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//         shippingAddress: {
//           name: "John Smith",
//           street: "456 Coffee Lane",
//           city: "Portland",
//           state: "OR",
//           zipCode: "97201",
//           country: "USA",
//         },
//       },
//       {
//         user: users[2]._id, // Sarah Johnson
//         product: products[4]._id, // Espresso Blend Supreme
//         frequency: "biweekly",
//         quantity: 1,
//         status: "active",
//         stripeSubscriptionId: "sub_sarah_biweekly_001",
//         nextDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
//         shippingAddress: {
//           name: "Sarah Johnson",
//           street: "789 Brew Avenue",
//           city: "San Francisco",
//           state: "CA",
//           zipCode: "94102",
//           country: "USA",
//         },
//       },
//       {
//         user: users[3]._id, // Mike Davis
//         product: products[1]._id, // Colombian Supremo
//         frequency: "weekly",
//         quantity: 1,
//         status: "active",
//         stripeSubscriptionId: "sub_mike_weekly_001",
//         nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
//         shippingAddress: {
//           name: "Mike Davis",
//           street: "321 Roast Road",
//           city: "Austin",
//           state: "TX",
//           zipCode: "73301",
//           country: "USA",
//         },
//       },
//       {
//         user: users[4]._id, // Emily Chen
//         product: products[5]._id, // Kenyan AA
//         frequency: "monthly",
//         quantity: 1,
//         status: "paused",
//         stripeSubscriptionId: "sub_emily_monthly_001",
//         nextDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//         shippingAddress: {
//           name: "Emily Chen",
//           street: "654 Bean Boulevard",
//           city: "Denver",
//           state: "CO",
//           zipCode: "80201",
//           country: "USA",
//         },
//       },
//     ]

//     const createdSubscriptions = await Subscription.create(subscriptions)
//     console.log(`✅ Created ${createdSubscriptions.length} subscriptions`)
//     return createdSubscriptions
//   } catch (error) {
//     console.error("Error seeding subscriptions:", error)
//     return []
//   }
// }

// Seed Blog Posts
const seedBlogPosts = async (users) => {
  try {
    if (users.length === 0) {
      console.log("⚠️  Skipping blog posts - no users available")
      return []
    }

    const adminUser = users.find((user) => user.role === "admin")
    if (!adminUser) {
      console.log("⚠️  Skipping blog posts - no admin user available")
      return []
    }

    const blogPosts = [
      {
        title: "The Art of Coffee Roasting: A Journey from Bean to Cup",
        body: `
# The Art of Coffee Roasting: A Journey from Bean to Cup

Coffee roasting is both an art and a science, requiring skill, patience, and a deep understanding of how heat transforms the humble green coffee bean into the aromatic, flavorful coffee we love.

## The Roasting Process

The roasting process involves applying heat to green coffee beans, causing a series of chemical reactions that develop the flavors, aromas, and colors we associate with coffee. During roasting, the beans undergo several stages:

### 1. Drying Phase
The beans lose moisture and begin to turn yellow. This phase typically lasts 4-8 minutes and is crucial for even roasting.

### 2. First Crack
Around 385°F (196°C), the beans expand and crack audibly. This marks the beginning of light roast territory.

### 3. Development Phase
Between first and second crack, the roaster has the most control over flavor development. This is where the magic happens.

### 4. Second Crack
At approximately 435°F (224°C), a second, quieter crack occurs, indicating the onset of darker roast levels.

## Roast Levels and Their Characteristics

- **Light Roast**: Bright acidity, floral and fruity notes, light brown color
- **Medium Roast**: Balanced flavor, moderate acidity, medium brown color
- **Dark Roast**: Bold, smoky flavors, low acidity, dark brown to black color

## Our Roasting Philosophy

At Artisan Coffee, we believe in highlighting the unique characteristics of each origin while ensuring consistency in every batch. Our master roasters use their expertise to bring out the best in every bean.

*Happy brewing!*
        `,
        excerpt:
          "Discover the intricate process of coffee roasting and how we transform green beans into the perfect cup of coffee.",
        author: adminUser._id,
        tags: ["roasting", "coffee", "education", "process", "beans"],
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        title: "Single Origin vs. Blends: Understanding Coffee Varieties",
        body: `
# Single Origin vs. Blends: Understanding Coffee Varieties

When choosing coffee, you'll often encounter two main categories: single origin and blends. Understanding the difference can help you make better choices for your taste preferences.

## Single Origin Coffee

Single origin coffee comes from one specific region, farm, or even a single lot within a farm. These coffees showcase the unique characteristics of their terroir.

### Benefits of Single Origin:
- **Unique flavor profiles** that reflect the specific growing conditions
- **Traceability** - you know exactly where your coffee comes from
- **Seasonal variety** - different harvests bring different flavors
- **Educational** - learn about different coffee regions

### Popular Single Origins:
- **Ethiopian Yirgacheffe**: Bright, floral, wine-like
- **Colombian Supremo**: Balanced, chocolatey, smooth
- **Kenyan AA**: Wine-like, black currant, bright acidity

## Coffee Blends

Blends combine beans from multiple origins to create a consistent flavor profile year-round.

### Benefits of Blends:
- **Consistency** - same great taste every time
- **Complexity** - combining different beans creates layered flavors
- **Balance** - roasters can balance acidity, body, and sweetness
- **Value** - often more affordable than premium single origins

### Our Signature Blends:
- **Espresso Blend Supreme**: Perfect for espresso with rich crema
- **French Roast Blend**: Bold and smoky for dark roast lovers
- **Holiday Spice Blend**: Seasonal blend with warm spices

## Which Should You Choose?

The choice between single origin and blends comes down to personal preference:

- Choose **single origin** if you enjoy exploring different flavors and learning about coffee regions
- Choose **blends** if you prefer consistency and balanced flavors

*Try both and discover what you love!*
        `,
        excerpt:
          "Learn the differences between single origin coffees and blends, and discover which type suits your taste preferences.",
        author: adminUser._id,
        tags: ["single-origin", "blends", "coffee-education", "varieties", "taste"],
        isPublished: true,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
      {
        title: "Brewing Methods: Finding Your Perfect Cup",
        body: `
# Brewing Methods: Finding Your Perfect Cup

The way you brew your coffee can dramatically impact its taste. Each brewing method extracts different compounds from the coffee, resulting in unique flavor profiles.

## Pour Over Methods

### V60
The Hario V60 produces a clean, bright cup that highlights the coffee's acidity and floral notes.

**Best for**: Light to medium roasts, single origins
**Grind**: Medium-fine
**Brew time**: 2-4 minutes

### Chemex
The Chemex uses thick filters that remove oils and sediment, creating a very clean cup.

**Best for**: Light roasts, floral coffees
**Grind**: Medium-coarse
**Brew time**: 4-6 minutes

## Immersion Methods

### French Press
Full immersion brewing creates a full-bodied cup with more oils and sediment.

**Best for**: Dark roasts, bold flavors
**Grind**: Coarse
**Brew time**: 4 minutes

### AeroPress
Combines immersion and pressure for a clean, full-bodied cup.

**Best for**: All roast levels, versatile
**Grind**: Fine to medium
**Brew time**: 1-2 minutes

## Espresso

Espresso uses pressure to extract coffee quickly, creating a concentrated shot with crema.

**Best for**: Espresso blends, medium to dark roasts
**Grind**: Fine
**Brew time**: 25-30 seconds

## Cold Brew

Cold water extraction over 12-24 hours creates a smooth, low-acid concentrate.

**Best for**: Any roast level, hot weather
**Grind**: Very coarse
**Brew time**: 12-24 hours

## Tips for Better Brewing

1. **Use fresh, quality water** - coffee is 98% water
2. **Measure your coffee** - use a 1:15 to 1:17 ratio (coffee to water)
3. **Grind just before brewing** - for maximum freshness
4. **Control water temperature** - 195-205°F (90-96°C) for most methods
5. **Time your extraction** - different methods require different brew times

*Experiment and find your perfect brewing method!*
        `,
        excerpt: "Explore different coffee brewing methods and learn how to make the perfect cup at home.",
        author: adminUser._id,
        tags: ["brewing", "methods", "pour-over", "espresso", "french-press", "guide"],
        isPublished: true,
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      },
      {
        title: "Coffee Storage: Keeping Your Beans Fresh",
        body: `
# Coffee Storage: Keeping Your Beans Fresh

Proper storage is crucial for maintaining the quality and flavor of your coffee beans. Here's everything you need to know about keeping your coffee fresh.

## The Enemies of Coffee

Coffee's main enemies are:
- **Air (Oxygen)**: Causes oxidation and staling
- **Light**: Breaks down compounds and affects flavor
- **Heat**: Accelerates the staling process
- **Moisture**: Can cause mold and off-flavors

## Best Storage Practices

### 1. Use Airtight Containers
Store your coffee in airtight containers to minimize exposure to oxygen. Glass jars with rubber seals or specialized coffee canisters work well.

### 2. Keep It Cool and Dark
Store coffee in a cool, dark place like a pantry. Avoid storing near heat sources like stoves or in direct sunlight.

### 3. Don't Refrigerate or Freeze
Contrary to popular belief, refrigerating or freezing coffee can introduce moisture and odors. Room temperature storage is best.

### 4. Buy Whole Beans
Whole beans stay fresh longer than ground coffee. Grind only what you need for each brew.

### 5. Buy in Small Quantities
Coffee is best consumed within 2-4 weeks of the roast date. Buy only what you'll use in that timeframe.

## Storage Timeline

- **Whole beans**: Best within 2-4 weeks of roast date
- **Ground coffee**: Best within 1-2 weeks of grinding
- **Opened bag**: Use within 1-2 weeks
- **Unopened bag**: Follow roast date guidelines

## Signs Your Coffee Has Gone Stale

- Lack of aroma when you open the bag
- Flat, dull taste
- No crema on espresso
- Beans look oily (for light/medium roasts)

## Our Packaging

At Artisan Coffee, we use one-way valve bags that allow CO2 to escape while preventing oxygen from entering. This keeps your coffee fresh from roastery to cup.

*Fresh coffee makes all the difference!*
        `,
        excerpt: "Learn the best practices for storing coffee beans to maintain freshness and flavor.",
        author: adminUser._id,
        tags: ["storage", "freshness", "coffee-care", "tips", "quality"],
        isPublished: true,
        publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
      },
      {
        title: "Sustainable Coffee: Our Commitment to Ethical Sourcing",
        body: `
# Sustainable Coffee: Our Commitment to Ethical Sourcing

At Artisan Coffee, we believe that great coffee should not only taste amazing but also support the farmers and communities that grow it. Our commitment to sustainability goes beyond just the cup.

## What Is Sustainable Coffee?

Sustainable coffee encompasses three main pillars:

### Environmental Sustainability
- **Shade-grown coffee** that preserves biodiversity
- **Organic farming** practices that protect soil and water
- **Carbon-neutral** shipping and roasting processes
- **Minimal packaging** waste

### Social Sustainability
- **Fair wages** for coffee farmers
- **Community development** programs
- **Education and healthcare** support
- **Gender equality** initiatives

### Economic Sustainability
- **Direct trade** relationships with farmers
- **Premium prices** for quality coffee
- **Long-term contracts** that provide stability
- **Investment** in farm improvements

## Our Sourcing Practices

### Direct Relationships
We work directly with coffee farmers and cooperatives, cutting out middlemen to ensure more money goes to the growers.

### Quality Premiums
We pay above-market prices for exceptional quality, incentivizing farmers to invest in better practices.

### Farm Visits
Our team regularly visits our partner farms to maintain relationships and ensure quality standards.

### Transparency
We provide detailed information about the origin of each coffee, including farm names and farmer stories.

## Certifications We Support

- **Fair Trade**: Ensures fair wages and working conditions
- **Organic**: Promotes environmental sustainability
- **Rainforest Alliance**: Protects ecosystems and communities
- **Bird Friendly**: Preserves bird habitats through shade-grown coffee

## The Impact of Your Purchase

When you buy our coffee, you're supporting:
- **50+ coffee farming families** across 8 countries
- **3 community schools** in coffee-growing regions
- **Clean water projects** in rural communities
- **Reforestation efforts** that have planted 10,000+ trees

## Looking Forward

Our sustainability goals for the next five years include:
- Achieving carbon-neutral operations
- Supporting 100 farming families
- Funding 5 new community projects
- Reducing packaging waste by 50%

*Every cup makes a difference. Thank you for choosing sustainable coffee.*
        `,
        excerpt:
          "Discover our commitment to sustainable and ethical coffee sourcing practices that benefit farmers and the environment.",
        author: adminUser._id,
        tags: ["sustainability", "ethical-sourcing", "fair-trade", "environment", "community"],
        isPublished: true,
        publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      },
      {
        title: "Coffee Cupping: How We Taste and Evaluate Coffee",
        body: `
# Coffee Cupping: How We Taste and Evaluate Coffee

Coffee cupping is the standardized method used by coffee professionals to evaluate and score coffee. It's how we ensure quality and consistency in every batch we roast.

## What Is Coffee Cupping?

Cupping is a systematic approach to tasting coffee that allows for objective evaluation of different coffees. It involves specific protocols for brewing, tasting, and scoring coffee.

## The Cupping Process

### 1. Preparation
- Grind coffee to a specific coarseness
- Use a 1:18 coffee-to-water ratio
- Heat water to 200°F (93°C)
- Use identical cups for each sample

### 2. Dry Fragrance
Before adding water, we smell the dry grounds to evaluate the coffee's aroma.

### 3. Wet Aroma
After adding hot water, we smell the coffee again to assess how the aroma changes.

### 4. Breaking the Crust
After 4 minutes, we break the crust of grounds that forms on top and inhale the released aromas.

### 5. Tasting
We use special cupping spoons to slurp the coffee, aerating it to spread it across our palate.

## What We Evaluate

### Aroma
The smell of the coffee, both dry and wet

### Flavor
The overall taste impression of the coffee

### Aftertaste
The lingering flavors after swallowing

### Acidity
The bright, tangy quality that adds liveliness

### Body
The weight and texture of the coffee in your mouth

### Balance
How well all the flavor components work together

### Sweetness
The pleasant, sugar-like taste

### Clean Cup
The absence of off-flavors or defects

### Uniformity
Consistency across multiple cups of the same coffee

### Overall
The cupper's personal preference and overall impression

## Scoring System

We use the Specialty Coffee Association's 100-point scale:
- **90-100**: Outstanding
- **85-89.99**: Excellent
- **80-84.99**: Very Good
- **Below 80**: Not specialty grade

## Why Cupping Matters

Cupping helps us:
- **Maintain quality** across all our coffees
- **Develop roast profiles** that highlight each coffee's best qualities
- **Select the best beans** from our suppliers
- **Ensure consistency** batch after batch
- **Identify defects** before coffee reaches customers

## Try Cupping at Home

You can try basic cupping at home:
1. Grind coffee coarsely
2. Add hot water (not boiling)
3. Wait 4 minutes
4. Break the crust and smell
5. Taste with a spoon, slurping loudly
6. Note your impressions

*Cupping helps us bring you the best coffee possible!*
        `,
        excerpt:
          "Learn about the professional coffee cupping process and how we evaluate and score our coffees for quality.",
        author: adminUser._id,
        tags: ["cupping", "quality-control", "tasting", "evaluation", "professional"],
        isPublished: false, // Draft post
        publishedAt: null,
      },
    ]

    const createdBlogPosts = await BlogPost.create(blogPosts)
    console.log(`✅ Created ${createdBlogPosts.length} blog posts`)
    return createdBlogPosts
  } catch (error) {
    console.error("Error seeding blog posts:", error)
    return []
  }
}

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...")

    await connectDB()
    await clearDatabase()

    const users = await seedUsers()
    // const products = await seedProducts()
    // const orders = await seedOrders(users, products)
    // const subscriptions = await seedSubscriptions(users, products)
    // const blogPosts = await seedBlogPosts(users)

    console.log("\n📊 Seeding Summary:")
    console.log(`👥 Users: ${users.length}`)
    // console.log(`☕ Products: ${products.length}`)
    // console.log(`📦 Orders: ${orders.length}`)
    // console.log(`🔄 Subscriptions: ${subscriptions.length}`)
    // console.log(`📝 Blog Posts: ${blogPosts.length}`)

    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📋 Test Credentials:")
    console.log("Admin: admin@artisancoffee.com / admin123")
    console.log("Customer: john.smith@email.com / password123")
    console.log("Customer: sarah.johnson@email.com / password123")

    process.exit(0)
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

// Run the seed script
seedDatabase()
