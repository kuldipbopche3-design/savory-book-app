import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Users, MapPin } from 'lucide-react';
import { Booking } from '../types';

const { useLocation, Link } = ReactRouterDOM as any;

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const booking = location.state?.booking as Booking;

  if (!booking) {
    return <div className="p-10 text-center">No booking information found. <Link to="/" className="text-primary-600">Go Home</Link></div>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-8 border border-stone-200 dark:border-stone-800 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Booking Confirmed!</h2>
        <p className="text-stone-600 dark:text-stone-400 mb-8">
          Your table at <span className="font-semibold text-primary-600 dark:text-primary-400">{booking.restaurantName}</span> has been reserved.
        </p>

        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-6 mb-8 text-left space-y-4">
           <div className="flex items-center gap-3">
             <Calendar className="text-stone-400 w-5 h-5" />
             <span className="text-stone-800 dark:text-stone-200 font-medium">{booking.date}</span>
           </div>
           <div className="flex items-center gap-3">
             <Clock className="text-stone-400 w-5 h-5" />
             <span className="text-stone-800 dark:text-stone-200 font-medium">{booking.time}</span>
           </div>
           <div className="flex items-center gap-3">
             <Users className="text-stone-400 w-5 h-5" />
             <span className="text-stone-800 dark:text-stone-200 font-medium">{booking.guests} Guests ({booking.tableType})</span>
           </div>
           {booking.specialRequests && (
             <div className="text-sm text-stone-500 italic border-t border-stone-200 dark:border-stone-700 pt-3 mt-3">
               Note: {booking.specialRequests}
             </div>
           )}
        </div>

        <div className="space-y-3">
          <Link to="/profile" className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            View My Bookings
          </Link>
          <Link to="/" className="block w-full bg-transparent border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-medium py-3 px-4 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;