
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Import Models
const { Restaurant, Booking, User } = require('./models');

// Database Connection
// Using 127.0.0.1 instead of localhost avoids some Node/Mongo version conflicts
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/savorybook')
  .then(() => console.log("✅ Database Connected (Kitchen is Open!)"))
  .catch((err) => console.log("❌ Database Error:", err));

// --- SEED DATA ---
const SEED_RESTAURANTS = [
  {
    name: 'The Golden Harvest',
    cuisine: 'Italian',
    description: 'Authentic rustic Italian cuisine with a focus on farm-to-table ingredients. Famous for our truffle pasta and wood-fired pizzas.',
    priceRange: 'High',
    rating: 4.8,
    address: '123 Olive Grove, Mumbai',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    openingTime: '11:00',
    closingTime: '23:00',
    offers: ['FLAT 10% OFF'],
    tables: [
      { id: 't1', name: 'Table 1', capacity: 2, type: 'Indoor', isAvailable: true },
      { id: 't2', name: 'Table 2', capacity: 4, type: 'Indoor', isAvailable: true },
    ],
    menu: [
      { id: 'm1', name: 'Truffle Pasta', price: 850, description: 'Fresh tagliatelle with black truffle', category: 'Main', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop' },
      { id: 'm2', name: 'Bruschetta', price: 350, description: 'Tomatoes, basil, garlic', category: 'Starter', image: 'https://images.unsplash.com/photo-1572695157363-bc31c9602289?q=80&w=800&auto=format&fit=crop' }
    ],
    reviews: [
      { id: 'r1', user: 'Rahul K.', rating: 5, comment: 'Amazing food! Best pasta in Mumbai.', date: '2023-10-01' }
    ]
  },
  {
    name: 'Spice Route',
    cuisine: 'Indian',
    description: 'A culinary journey through the spices of India. Experience the heat and flavor of authentic curries.',
    priceRange: 'Medium',
    rating: 4.5,
    address: '45 Curry Lane, Delhi',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=800&auto=format&fit=crop',
    openingTime: '12:00',
    closingTime: '23:00',
    offers: ['15% OFF'],
    menu: [
      { id: 'm3', name: 'Butter Chicken', price: 550, description: 'Rich tomato gravy', category: 'Main', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop' },
      { id: 'm4', name: 'Garlic Naan', price: 120, description: 'Buttery bread', category: 'Side', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop' }
    ]
  },
  {
    name: 'Sakura Gardens',
    cuisine: 'Japanese',
    description: 'Tranquil Japanese dining with a beautiful koi pond. Offering Omakase and fresh sashimi.',
    priceRange: 'Luxury',
    rating: 4.9,
    address: '88 Cherry Blossom Way, Bangalore',
    image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=800&auto=format&fit=crop',
    openingTime: '17:00',
    closingTime: '23:00',
    offers: ['10% OFF'],
    tables: [{ id: 't7', name: 'Counter', capacity: 2, type: 'Bar', isAvailable: true }],
    menu: [],
    reviews: [{ id: 'r3', user: 'Kenji', rating: 5, comment: 'Freshest Sushi!', date: '2023-11-01' }]
  },
  {
    name: 'El Camino',
    cuisine: 'Mexican',
    description: 'Vibrant street-style tacos and crafted margaritas. Lively atmosphere perfect for groups.',
    priceRange: 'Low',
    rating: 4.3,
    address: '22 Fiesta Blvd, Goa',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop',
    openingTime: '11:00',
    closingTime: '01:00',
    offers: ['FREE DRINK']
  },
  {
    name: 'Le Petit Bistro',
    cuisine: 'French',
    description: 'Cozy french bistro with classic dishes and a curated wine list.',
    priceRange: 'Medium',
    rating: 4.6,
    address: '10 Rue de Paris, Pondicherry',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=800&auto=format&fit=crop',
    openingTime: '08:00',
    closingTime: '22:00',
    offers: ['5% OFF']
  },
  {
    name: 'Dragon Palace',
    cuisine: 'Chinese',
    description: 'Traditional Dim Sum and spicy Schezwan dishes in an elegant setting.',
    priceRange: 'Medium',
    rating: 4.4,
    address: '88 Dragon St, Kolkata',
    image: 'https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?q=80&w=800&auto=format&fit=crop',
    openingTime: '11:00',
    closingTime: '23:00',
    offers: ['10% OFF'],
    menu: [{ id: 'm5', name: 'Dim Sum Basket', price: 450, description: 'Mixed dumplings', category: 'Starter', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c423c?q=80&w=800&auto=format&fit=crop' }]
  },
  {
    name: 'Tandoori Nights',
    cuisine: 'Indian',
    description: 'Open air rooftop restaurant serving the best kebabs in town.',
    priceRange: 'Medium',
    rating: 4.7,
    address: 'Rooftop 4, Hyderabad',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=800&auto=format&fit=crop',
    openingTime: '18:00',
    closingTime: '01:00',
    offers: ['20% OFF']
  },
  {
    name: 'Burger Joint',
    cuisine: 'American',
    description: 'Gourmet burgers and hand-spun milkshakes.',
    priceRange: 'Low',
    rating: 4.2,
    address: 'Sector 29, Gurgaon',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=800&auto=format&fit=crop',
    openingTime: '11:00',
    closingTime: '23:00',
    offers: ['COMBO OFFER']
  },
  {
    name: 'Olive & Oregano',
    cuisine: 'Mediterranean',
    description: 'Fresh hummus, falafel, and grilled meats.',
    priceRange: 'High',
    rating: 4.6,
    address: 'Jubilee Hills, Hyderabad',
    image: 'https://images.unsplash.com/photo-1544124499-58912cbddad9?q=80&w=800&auto=format&fit=crop',
    openingTime: '12:00',
    closingTime: '23:00',
    offers: ['10% OFF']
  },
  {
    name: 'Bangkok Street',
    cuisine: 'Thai',
    description: 'Spicy, sour, sweet and salty flavors of Thailand.',
    priceRange: 'Medium',
    rating: 4.5,
    address: 'Indiranagar, Bangalore',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop',
    openingTime: '12:00',
    closingTime: '23:00',
    offers: ['15% OFF']
  }
];

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send("SavoryBook API is Running!");
});

// Seed Route - Run this to populate DB
app.get('/api/seed', async (req, res) => {
  try {
    await Restaurant.deleteMany({});
    const createdRestaurants = await Restaurant.insertMany(SEED_RESTAURANTS);
    res.send({ message: 'Database Seeded Successfully', count: createdRestaurants.length });
  } catch (err) {
    res.status(500).send({ error: "Seeding Failed", details: err.message });
  }
});

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // In production, use bcrypt for password comparison
    const user = await User.findOne({ email, password, role });
    
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RESTAURANT ROUTES ---

app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/restaurants/owner/:ownerId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.params.ownerId });
    // If not found, returning 404 is valid, handled by frontend
    if (!restaurant) return res.status(404).json({ error: "Not found" });
    res.json(restaurant); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/restaurants', async (req, res) => {
  try {
    const data = req.body;
    let restaurant;

    if (data._id || data.id) {
      // Update existing
      const id = data._id || data.id;
      // Exclude _id from update payload to avoid immutable field error
      delete data._id;
      restaurant = await Restaurant.findByIdAndUpdate(id, data, { new: true });
    } else {
      // Create new
      restaurant = new Restaurant(data);
      await restaurant.save();
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/restaurants/:id/review', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Not found" });
    
    restaurant.reviews.push(req.body);
    
    // Recalculate rating
    const total = restaurant.reviews.reduce((acc, r) => acc + r.rating, 0);
    restaurant.rating = parseFloat((total / restaurant.reviews.length).toFixed(1));
    
    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BOOKING ROUTES ---

app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/user/:email', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerEmail: req.params.email });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/restaurant/:restaurantId', async (req, res) => {
  try {
    const bookings = await Booking.find({ restaurantId: req.params.restaurantId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log(`🌱 To seed database, visit http://127.0.0.1:${PORT}/api/seed`);
});
