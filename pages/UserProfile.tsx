
import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus, Review } from '../types';
import { Clock, Calendar, Users, Star, MessageSquare } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '../services/apiService';
import { useApp } from '../contexts/AppContext';

const { Link } = ReactRouterDOM as any;

const UserProfile: React.FC = () => {
  const { user, t } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewModal, setReviewModal] = useState<{bookingId: string, restaurantId: string} | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (user && user.email) {
        try {
            const data = await ApiService.getUserBookings(user.email);
            setBookings(data);
        } catch (error) {
            console.error(error);
        }
    }
  };

  const cancelBooking = async (id: string) => {
    // In production, we'd call an API endpoint. Here we update status locally via API call
    try {
        // NOTE: Mongo uses _id. We're assuming 'id' is mapped or passed correctly.
        await ApiService.updateBooking(id, { status: BookingStatus.CANCELLED });
        loadBookings();
    } catch (e) {
        alert("Failed to cancel booking");
    }
  };

  const openReviewModal = (booking: Booking) => {
    setReviewModal({ bookingId: booking.id, restaurantId: booking.restaurantId });
    setReviewForm({ rating: 5, comment: '' });
  };

  const submitReview = async () => {
    if (!reviewModal || !user) return;

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      user: user.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toISOString().split('T')[0]
    };

    try {
        await ApiService.addReview(reviewModal.restaurantId, newReview);
        alert(t.reviewSubmitted);
        setReviewModal(null);
    } catch (e) {
        alert("Failed to submit review");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">My Profile</h1>
        <p className="text-stone-500 dark:text-stone-400">Manage your reservations and preferences.</p>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
           <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Upcoming & Past Reservations</h2>
           <Link to="/search" className="text-primary-600 text-sm font-medium hover:underline">New Booking</Link>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {bookings.length === 0 ? (
            <div className="p-10 text-center text-stone-500">
              <Calendar className="mx-auto h-12 w-12 text-stone-300 mb-3" />
              <p>You have no bookings yet.</p>
              <Link to="/search" className="text-primary-600 font-medium mt-2 inline-block">Find a restaurant</Link>
            </div>
          ) : (
            bookings.slice().reverse().map(booking => (
              <div key={booking.id || (booking as any)._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{booking.restaurantName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      booking.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      booking.status === BookingStatus.COMPLETED ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-stone-600 dark:text-stone-400 mt-2">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {booking.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {booking.time}</span>
                    <span className="flex items-center gap-1"><Users size={14}/> {booking.guests} Guests</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {(booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED) && (
                        <button 
                            onClick={() => openReviewModal(booking)}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-primary-200 dark:border-primary-800"
                        >
                            <MessageSquare size={16} /> {t.writeReview}
                        </button>
                    )}
                    {booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.COMPLETED && (
                        <button 
                          onClick={() => cancelBooking(booking.id || (booking as any)._id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-800">
               <h3 className="text-xl font-bold mb-4 text-stone-900 dark:text-stone-100">{t.writeReview}</h3>
               
               <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Rating</label>
                  <div className="flex gap-2">
                     {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          onClick={() => setReviewForm({...reviewForm, rating: star})}
                          className={`focus:outline-none transition-colors ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-stone-300'}`}
                        >
                           <Star size={24} fill="currentColor" />
                        </button>
                     ))}
                  </div>
               </div>

               <div className="mb-6">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Comment</label>
                  <textarea 
                     rows={4}
                     value={reviewForm.comment}
                     onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                     className="w-full p-3 border rounded-lg bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-primary-500 outline-none"
                     placeholder={t.reviewPlaceholder}
                  ></textarea>
               </div>

               <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setReviewModal(null)}
                    className="px-4 py-2 text-stone-600 dark:text-stone-400 font-medium hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                  >
                     {t.cancel}
                  </button>
                  <button 
                    onClick={submitReview}
                    className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-md"
                  >
                     {t.submitReview}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default UserProfile;
