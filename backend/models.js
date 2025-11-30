
const mongoose = require('mongoose');

// 1. Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  ownerId: String, // Links to a User
  name: { type: String, required: true },
  cuisine: String,
  description: String,
  priceRange: String,
  rating: { type: Number, default: 0 },
  address: String,
  image: String,
  openingTime: String,
  closingTime: String,
  upiId: String,
  qrCodeUrl: String,
  offers: [String],
  // Sub-documents for Menu and Tables
  menu: [{
    id: String,
    name: String,
    price: Number,
    description: String,
    category: String,
    image: String
  }],
  tables: [{
    id: String,
    name: String,
    capacity: Number,
    type: String,
    isAvailable: Boolean
  }],
  reviews: [{
    id: String,
    user: String,
    rating: Number,
    comment: String,
    date: String
  }]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// 2. Booking Schema
const bookingSchema = new mongoose.Schema({
  restaurantId: String,
  restaurantName: String,
  userId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  date: String,
  time: String,
  guests: Number,
  tableType: String,
  specialRequests: String,
  status: { type: String, default: 'Pending' }, // Pending, Confirmed, Cancelled
  items: Array, // Order items
  paymentMethod: String,
  totalAmount: Number,
  isPaid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 3. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In real production, hash this!
  phone: String,
  location: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  favorites: [String]
});

// Export Models
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Restaurant, Booking, User };
