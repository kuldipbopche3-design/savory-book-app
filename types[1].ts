
export enum CuisineType {
  ITALIAN = 'Italian',
  CHINESE = 'Chinese',
  INDIAN = 'Indian',
  MEXICAN = 'Mexican',
  AMERICAN = 'American',
  FRENCH = 'French',
  JAPANESE = 'Japanese',
  MEDITERRANEAN = 'Mediterranean',
  THAI = 'Thai',
  FUSION = 'Fusion'
}

export enum TableType {
  INDOOR = 'Indoor',
  OUTDOOR = 'Outdoor',
  BAR = 'Bar',
  PRIVATE = 'Private Room'
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed'
}

export enum PaymentMethod {
  CASH = 'Cash',
  UPI = 'UPI (GPay/PhonePe)',
  CARD = 'Credit/Debit Card'
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  type: TableType;
  isAvailable: boolean;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string; // Optional
  category: string;
  image: string; // Mandatory for new items, but keeping type flexible for legacy data
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Restaurant {
  id: string;
  ownerId?: string; // Links restaurant to an admin user
  name: string;
  description: string;
  cuisine: CuisineType;
  priceRange: 'Low' | 'Medium' | 'High' | 'Luxury';
  rating: number;
  address: string;
  image: string;
  tables: Table[];
  menu: MenuItem[];
  reviews: Review[];
  openingTime: string; // e.g., "09:00"
  closingTime: string; // e.g., "22:00"
  upiId?: string;
  qrCodeUrl?: string;
  offers?: string[]; // Array of offer strings e.g. ["10% OFF", "20% OFF"]
}

export interface Booking {
  id: string;
  restaurantId: string;
  restaurantName: string; 
  userId: string;
  
  // Customer Details
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  tableType: TableType;
  specialRequests?: string;
  status: BookingStatus;
  
  // Orders
  items?: OrderItem[];

  // Payment
  paymentMethod: PaymentMethod;
  totalAmount: number; // Actual sum of items
  isPaid: boolean;

  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  favorites: string[]; 
  role: 'customer' | 'admin';
  password?: string;
}