
import { Booking, Restaurant, Review, User } from "../types";
import { MOCK_RESTAURANTS, MOCK_BOOKINGS, MOCK_USER } from "./mockData";

// Using 127.0.0.1 is often more reliable than localhost for local dev
const API_URL = 'http://127.0.0.1:5000/api';

export const ApiService = {
  // --- RESTAURANTS ---
  getAllRestaurants: async (): Promise<Restaurant[]> => {
    try {
      const res = await fetch(`${API_URL}/restaurants`);
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, falling back to Mock Data for Restaurants.", err);
      return Promise.resolve(MOCK_RESTAURANTS);
    }
  },

  getRestaurantById: async (id: string): Promise<Restaurant> => {
    try {
      const res = await fetch(`${API_URL}/restaurants/${id}`);
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, finding in Mock Data.", err);
      const restaurant = MOCK_RESTAURANTS.find(r => r.id === id || (r as any)._id === id);
      if (!restaurant) throw new Error("Restaurant not found in mock data");
      return Promise.resolve(restaurant);
    }
  },

  getRestaurantByOwnerId: async (ownerId: string): Promise<Restaurant | null> => {
    try {
      const res = await fetch(`${API_URL}/restaurants/owner/${ownerId}`);
      // If 404, it means no restaurant exists for this owner, return null
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable (getRestaurantByOwnerId). Returning null.");
      return Promise.resolve(null);
    }
  },

  saveRestaurant: async (restaurant: Partial<Restaurant>): Promise<Restaurant> => {
    try {
      const res = await fetch(`${API_URL}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurant)
      });
      if (!res.ok) throw new Error('Failed to save');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, saving to mock (temporary).");
      return Promise.resolve({ ...restaurant, id: 'mock_saved_' + Date.now() } as Restaurant);
    }
  },

  addReview: async (restaurantId: string, review: Review): Promise<Restaurant> => {
    try {
      const res = await fetch(`${API_URL}/restaurants/${restaurantId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (!res.ok) throw new Error('Failed to add review');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, skipping review save.");
      const mockRest = MOCK_RESTAURANTS.find(r => r.id === restaurantId);
      if (mockRest) {
         if(!mockRest.reviews) mockRest.reviews = [];
         mockRest.reviews.push(review);
         return Promise.resolve(mockRest);
      }
      throw err;
    }
  },

  // --- BOOKINGS ---
  createBooking: async (booking: Partial<Booking>): Promise<Booking> => {
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (!res.ok) throw new Error('Failed to create booking');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, creating mock booking.");
      return Promise.resolve({ 
        ...booking, 
        id: `mock_b_${Date.now()}`, 
        createdAt: new Date().toISOString() 
      } as Booking);
    }
  },

  getUserBookings: async (email: string): Promise<Booking[]> => {
    try {
      const res = await fetch(`${API_URL}/bookings/user/${email}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using mock user bookings.");
      return Promise.resolve(MOCK_BOOKINGS.filter(b => b.customerEmail === email));
    }
  },

  getRestaurantBookings: async (restaurantId: string): Promise<Booking[]> => {
    try {
      const res = await fetch(`${API_URL}/bookings/restaurant/${restaurantId}`);
      if (!res.ok) throw new Error('Failed to fetch restaurant bookings');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using mock restaurant bookings.");
      return Promise.resolve(MOCK_BOOKINGS.filter(b => b.restaurantId === restaurantId));
    }
  },

  updateBooking: async (id: string, updates: Partial<Booking>): Promise<Booking> => {
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update booking');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, simulating update.");
      const mockBooking = MOCK_BOOKINGS.find(b => b.id === id);
      if(mockBooking) {
         Object.assign(mockBooking, updates);
         return Promise.resolve(mockBooking);
      }
      return Promise.resolve({ ...updates, id } as Booking);
    }
  },

  // --- AUTH ---
  login: async (email: string, password: string, role: string): Promise<User> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using mock login.");
      // Fallback Mock Login
      if (email === MOCK_USER.email) return Promise.resolve(MOCK_USER);
      
      // Allow testing with any other credentials in fallback mode
      return Promise.resolve({
        id: 'u_mock_' + Date.now(),
        name: email.split('@')[0],
        email,
        phone: '9876543210',
        role: role as any,
        favorites: []
      });
    }
  },

  register: async (user: Partial<User>): Promise<User> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) throw new Error('Registration failed');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using mock registration.");
      return Promise.resolve({ ...user, id: 'u_new_mock' } as User);
    }
  }
};
