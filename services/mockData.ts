
import { Restaurant, CuisineType, TableType, Booking, User, BookingStatus, PaymentMethod } from '../types';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'The Golden Harvest',
    cuisine: CuisineType.ITALIAN,
    description: 'Authentic rustic Italian cuisine with a focus on farm-to-table ingredients. Famous for our truffle pasta and wood-fired pizzas.',
    priceRange: 'High',
    rating: 4.8,
    address: '123 Olive Grove, Mumbai',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    openingTime: '11:00',
    closingTime: '23:00',
    offers: ['FLAT 10% OFF'],
    tables: [
      { id: 't1', name: 'Table 1', capacity: 2, type: TableType.INDOOR, isAvailable: true },
      { id: 't2', name: 'Table 2', capacity: 4, type: TableType.INDOOR, isAvailable: true },
    ],
    menu: [
      { id: 'm1', name: 'Truffle Pasta', price: 850, description: 'Fresh tagliatelle with black truffle', category: 'Main', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop' },
      { id: 'm2', name: 'Bruschetta', price: 350, description: 'Tomatoes, basil, garlic', category: 'Starter', image: 'https://images.unsplash.com/photo-1572695157363-bc31c9602289?q=80&w=800&auto=format&fit=crop' }
    ],
    reviews: [
      { id: 'r1', user: 'Rahul K.', rating: 5, comment: 'Amazing food! Best pasta in Mumbai.', date: '2023-10-01' },
      { id: 'r1b', user: 'Sarah J.', rating: 4, comment: 'Great ambiance, slightly pricey.', date: '2023-10-05' }
    ]
  },
  {
    id: '2',
    name: 'Spice Route',
    cuisine: CuisineType.INDIAN,
    description: 'A culinary journey through the spices of India. Experience the heat and flavor of authentic curries.',
    priceRange: 'Medium',
    rating: 4.5,
    address: '45 Curry Lane, Delhi',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=800&auto=format&fit=crop',
    openingTime: '12:00',
    closingTime: '23:00',
    offers: ['15% OFF'],
    tables: [
      { id: 't5', name: 'Table A', capacity: 6, type: TableType.INDOOR, isAvailable: true },
    ],
    menu: [
      { id: 'm3', name: 'Butter Chicken', price: 550, description: 'Rich tomato gravy', category: 'Main', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop' },
      { id: 'm4', name: 'Garlic Naan', price: 120, description: 'Buttery bread', category: 'Side', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop' }
    ],
    reviews: [
      { id: 'r2', user: 'Amit S.', rating: 5, comment: 'Authentic taste.', date: '2023-09-12' }
    ]
  },
  {
    id: '3',
    name: 'Sakura Gardens',
    cuisine: CuisineType.JAPANESE,
    description: 'Tranquil Japanese dining with a beautiful koi pond. Offering Omakase and fresh sashimi.',
    priceRange: 'Luxury',
    rating: 4.9,
    address: '88 Cherry Blossom Way, Bangalore',
    image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=800&auto=format&fit=crop',
    openingTime: '17:00',
    closingTime: '23:00',
    offers: ['10% OFF'],
    tables: [
      { id: 't7', name: 'Counter', capacity: 2, type: TableType.BAR, isAvailable: true },
    ],
    menu: [],
    reviews: [{ id: 'r3', user: 'Kenji', rating: 5, comment: 'Freshest Sushi!', date: '2023-11-01' }]
  },
  {
    id: '4',
    name: 'El Camino',
    cuisine: CuisineType.MEXICAN,
    description: 'Vibrant street-style tacos and crafted margaritas. Lively atmosphere perfect for groups.',
    priceRange: 'Low',
    rating: 4.3,
    address: '22 Fiesta Blvd, Goa',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop',
    openingTime: '11:00',
    closingTime: '01:00',
    offers: ['FREE DRINK'],
    tables: [],
    menu: [],
    reviews: []
  },
  {
    id: '5',
    name: 'Le Petit Bistro',
    cuisine: CuisineType.FRENCH,
    description: 'Cozy french bistro with classic dishes and a curated wine list.',
    priceRange: 'Medium',
    rating: 4.6,
    address: '10 Rue de Paris, Pondicherry',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=800&auto=format&fit=crop',
    openingTime: '08:00',
    closingTime: '22:00',
    offers: ['5% OFF'],
    tables: [],
    menu: [],
    reviews: []
  },
  {
    id: '6',
    name: 'Dragon Palace',
    cuisine: CuisineType.CHINESE,
    description: 'Traditional Dim Sum and spicy Schezwan dishes in an elegant setting.',
    priceRange: 'Medium',
    rating: 4.4,
    address: '88 Dragon St, Kolkata',
    image: 'https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?q=80&w=800&auto=format&fit=crop',
    openingTime: '11:00',
    closingTime: '23:00',
    offers: ['10% OFF'],
    tables: [],
    menu: [{ id: 'm5', name: 'Dim Sum Basket', price: 450, description: 'Mixed dumplings', category: 'Starter', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c423c?q=80&w=800&auto=format&fit=crop' }],
    reviews: [{ id: 'r6', user: 'Priya', rating: 4, comment: 'Good food, slow service.', date: '2023-10-10' }]
  },
  {
    id: '7',
    name: 'Tandoori Nights',
    cuisine: CuisineType.INDIAN,
    description: 'Open air rooftop restaurant serving the best kebabs in town.',
    priceRange: 'Medium',
    rating: 4.7,
    address: 'Rooftop 4, Hyderabad',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=800&auto=format&fit=crop',
    openingTime: '18:00',
    closingTime: '01:00',
    offers: ['20% OFF'],
    tables: [],
    menu: [],
    reviews: []
  },
  {
    id: '8',
    name: 'Burger Joint',
    cuisine: CuisineType.AMERICAN,
    description: 'Gourmet burgers and hand-spun milkshakes.',
    priceRange: 'Low',
    rating: 4.2,
    address: 'Sector 29, Gurgaon',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=800&auto=format&fit=crop',
    openingTime: '11:00',
    closingTime: '23:00',
    offers: ['COMBO OFFER'],
    tables: [],
    menu: [],
    reviews: []
  },
  {
    id: '9',
    name: 'Olive & Oregano',
    cuisine: CuisineType.MEDITERRANEAN,
    description: 'Fresh hummus, falafel, and grilled meats.',
    priceRange: 'High',
    rating: 4.6,
    address: 'Jubilee Hills, Hyderabad',
    image: 'https://images.unsplash.com/photo-1544124499-58912cbddad9?q=80&w=800&auto=format&fit=crop',
    openingTime: '12:00',
    closingTime: '23:00',
    offers: ['10% OFF'],
    tables: [],
    menu: [],
    reviews: []
  },
  {
    id: '10',
    name: 'Bangkok Street',
    cuisine: CuisineType.THAI,
    description: 'Spicy, sour, sweet and salty flavors of Thailand.',
    priceRange: 'Medium',
    rating: 4.5,
    address: 'Indiranagar, Bangalore',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop',
    openingTime: '12:00',
    closingTime: '23:00',
    offers: ['15% OFF'],
    tables: [],
    menu: [],
    reviews: []
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Vikram Singh',
  email: 'vikram@example.com',
  phone: '+91 98765 43210',
  favorites: ['1'],
  role: 'customer'
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    restaurantId: '1',
    restaurantName: 'The Golden Harvest',
    userId: 'u1',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram@example.com',
    customerPhone: '9876543210',
    date: '2023-11-15',
    time: '19:00',
    guests: 2,
    tableType: TableType.INDOOR,
    status: BookingStatus.COMPLETED,
    paymentMethod: PaymentMethod.CARD,
    totalAmount: 2500,
    isPaid: true,
    createdAt: '2023-11-10T10:00:00Z'
  }
];
