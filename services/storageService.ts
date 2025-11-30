
import { User, Restaurant, Booking, MenuItem, Review } from '../types';
import { MOCK_RESTAURANTS, MOCK_BOOKINGS, MOCK_USER } from './mockData';

// Keys for localStorage
const KEYS = {
  USERS: 'savory_users',
  RESTAURANTS: 'savory_restaurants',
  BOOKINGS: 'savory_bookings',
  CURRENT_USER: 'savory_current_user'
};

// Helper to initialize data if empty
const initData = () => {
  if (!localStorage.getItem(KEYS.RESTAURANTS)) {
    localStorage.setItem(KEYS.RESTAURANTS, JSON.stringify(MOCK_RESTAURANTS));
  }
  if (!localStorage.getItem(KEYS.BOOKINGS)) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(MOCK_BOOKINGS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([MOCK_USER]));
  }
};

export const StorageService = {
  // --- USER OPERATIONS ---
  loginUser: (email: string, role: 'customer' | 'admin'): User | null => {
    initData();
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    // Strict check on Role to ensure we get the correct account type
    const user = users.find(u => u.email === email && u.role === role);
    return user || null;
  },

  registerUser: (user: User): User => {
    initData();
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    
    // Check if exists with SAME email AND SAME role
    const existing = users.find(u => u.email === user.email && u.role === user.role);
    if (existing) return existing;
    
    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return user;
  },

  updateUser: (updatedUser: User) => {
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
  },

  // --- RESTAURANT OPERATIONS ---
  getRestaurants: (): Restaurant[] => {
    initData();
    return JSON.parse(localStorage.getItem(KEYS.RESTAURANTS) || '[]');
  },

  getRestaurantById: (id: string): Restaurant | undefined => {
    const list = StorageService.getRestaurants();
    return list.find(r => r.id === id);
  },

  getRestaurantByOwnerId: (ownerId: string): Restaurant | undefined => {
    const list = StorageService.getRestaurants();
    return list.find(r => r.ownerId === ownerId);
  },

  saveRestaurant: (restaurant: Restaurant): void => {
    const list = StorageService.getRestaurants();
    const index = list.findIndex(r => r.id === restaurant.id);
    
    if (index >= 0) {
      list[index] = restaurant;
    } else {
      list.push(restaurant);
    }
    
    localStorage.setItem(KEYS.RESTAURANTS, JSON.stringify(list));
  },

  addRestaurantReview: (restaurantId: string, review: Review): void => {
    const list = StorageService.getRestaurants();
    const index = list.findIndex(r => r.id === restaurantId);
    
    if (index >= 0) {
      if (!list[index].reviews) list[index].reviews = [];
      list[index].reviews.push(review);
      
      // Recalculate average rating
      const total = list[index].reviews.reduce((acc, r) => acc + r.rating, 0);
      list[index].rating = parseFloat((total / list[index].reviews.length).toFixed(1));

      localStorage.setItem(KEYS.RESTAURANTS, JSON.stringify(list));
    }
  },

  // --- BOOKING OPERATIONS ---
  getBookings: (): Booking[] => {
    initData();
    return JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
  },

  getUserBookingCount: (email: string): number => {
    initData();
    const allBookings: Booking[] = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
    return allBookings.filter(b => b.customerEmail === email).length;
  },

  saveBooking: (booking: Booking): void => {
    const list = StorageService.getBookings();
    const index = list.findIndex(b => b.id === booking.id);
    
    if (index >= 0) {
      list[index] = booking;
    } else {
      list.push(booking);
    }
    
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(list));
  },

  updateBooking: (id: string, updates: Partial<Booking>): void => {
    const list = StorageService.getBookings();
    const index = list.findIndex(b => b.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updates };
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(list));
    }
  },

  deleteBooking: (id: string): void => {
    const list = StorageService.getBookings();
    const updatedList = list.filter(b => b.id !== id);
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(updatedList));
  }
};
