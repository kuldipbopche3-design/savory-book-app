
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Clock, MapPin, Calendar, Utensils, Star, Info, Smartphone, CreditCard, Banknote, Plus, Minus, ShoppingBag, X, Gift, Tag, Loader2 } from 'lucide-react';
import { ApiService } from '../services/apiService';
import { Booking, BookingStatus, TableType, PaymentMethod, Restaurant, OrderItem, MenuItem } from '../types';
import { useApp } from '../contexts/AppContext';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface BookingFormData {
  date: string;
  time: string;
  guests: number;
  tableType: TableType;
  specialRequests: string;
  name: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
}

interface Discount {
  type: string;
  amount: number;
  label: string;
}

const RestaurantDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, t } = useApp();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'reviews'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Discount Logic
  const [defaultDiscount, setDefaultDiscount] = useState<Discount>({ type: '', amount: 0, label: '' });
  const [selectedOwnerOffer, setSelectedOwnerOffer] = useState<string>(''); 

  // Cart State for Menu Ordering
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});

  useEffect(() => {
    if (id) {
       // FETCH FROM API
       ApiService.getRestaurantById(id)
        .then(data => {
            // Ensure ID is set for compat
            if(!data.id) data.id = (data as any)._id; 
            setRestaurant(data);
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  const [formData, setFormData] = useState<BookingFormData>({
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: 2,
    tableType: TableType.INDOOR,
    specialRequests: '',
    name: '',
    phone: '',
    email: '',
    paymentMethod: PaymentMethod.CASH
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone
      }));
      
      // Calculate Discount based on previous bookings via API
      ApiService.getUserBookings(user.email).then(bookings => {
         const bookingCount = bookings.length;
         if (bookingCount === 0) {
            setDefaultDiscount({ type: 'first', amount: 5, label: 'First Order 5% OFF' });
         } else {
            setDefaultDiscount({ type: 'seasonal', amount: 2, label: 'Seasonal Offer 2% OFF' });
         }
      }).catch(err => {
         console.warn("Could not fetch user history for discounts", err);
         setDefaultDiscount({ type: 'seasonal', amount: 2, label: 'Seasonal Offer 2% OFF' });
      });
    }
  }, [user]);

  if (!restaurant) {
    return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/>Loading Restaurant Details...</div>;
  }

  // Generate Time Slots: 12 PM to 11 PM
  const timeSlots = [];
  for (let i = 12; i <= 23; i++) {
    const hour = i;
    const timeSlotsArr = [`${hour}:00`];
    if(i !== 23) timeSlotsArr.push(`${hour}:30`);
    
    timeSlotsArr.forEach(ts => timeSlots.push(ts));
  }

  // --- Cart Functions ---
  const updateCart = (item: MenuItem, delta: number) => {
    setCart(prev => {
      const currentQty = prev[item.id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[item.id];
      } else {
        newCart[item.id] = newQty;
      }
      return newCart;
    });
  };

  const getSubTotal = (): number => {
    if (!restaurant) return 0;
    let total = 0;
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = restaurant.menu.find(m => m.id === itemId);
      if (item) total += item.price * Number(qty);
    });
    return total;
  };

  const getPercentageFromOffer = (offer: string): number => {
    const match = offer.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  const getFinalTotal = (): number => {
    const sub = getSubTotal();
    if (sub === 0) return 0;

    let totalDiscountPercent = 0;
    if (user && defaultDiscount.amount > 0) {
      totalDiscountPercent += defaultDiscount.amount;
    }
    if (selectedOwnerOffer) {
      totalDiscountPercent += getPercentageFromOffer(selectedOwnerOffer);
    }

    const discountAmt = (sub * totalDiscountPercent) / 100;
    return Math.round(sub - discountAmt);
  };

  const getOrderItems = (): OrderItem[] => {
    if (!restaurant) return [];
    return Object.entries(cart).map(([itemId, qty]) => {
      const item = restaurant.menu.find(m => m.id === itemId);
      return item ? { itemId, name: item.name, price: item.price, quantity: Number(qty) } : null;
    }).filter(Boolean) as OrderItem[];
  };

  // --- Submission ---

  const handleBookingInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMethod === PaymentMethod.UPI || formData.paymentMethod === PaymentMethod.CARD) {
      setShowPaymentModal(true);
    } else {
      finalizeBooking(false); // Cash payment = pending
    }
  };

  const finalizeBooking = async (paidNow: boolean) => {
    if (paidNow) {
       setIsProcessingPayment(true);
       setTimeout(() => {
          setIsProcessingPayment(false);
          submitToBackend(true);
       }, 2000);
    } else {
       submitToBackend(false);
    }
  };

  const submitToBackend = async (paidNow: boolean) => {
    const totalAmount = getFinalTotal();
    const orderItems = getOrderItems();

    const newBooking: Partial<Booking> = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      userId: user?.id || 'guest',
      
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
      tableType: formData.tableType,
      specialRequests: selectedOwnerOffer ? `${formData.specialRequests} (Coupon: ${selectedOwnerOffer})` : formData.specialRequests,
      
      status: paidNow ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
      
      items: orderItems,
      paymentMethod: formData.paymentMethod,
      totalAmount: totalAmount, 
      isPaid: paidNow
    };
    
    try {
        const result = await ApiService.createBooking(newBooking);
        navigate('/booking-success', { state: { booking: result } });
    } catch (error) {
        alert("Failed to create booking. Please try again.");
    }
  };

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(restaurant.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  // Render Menu Items helper
  const renderMenuItems = () => (
     <div className="grid gap-4 mt-4">
        {restaurant.menu && restaurant.menu.length > 0 ? (
          restaurant.menu.map((item, idx) => {
             const ownerPercent = selectedOwnerOffer ? getPercentageFromOffer(selectedOwnerOffer) : 0;
             const userPercent = defaultDiscount.amount;
             const totalPercent = ownerPercent + userPercent;
             const deduction = Math.round(item.price * (totalPercent / 100));
             const finalPrice = Math.round(item.price - deduction);

             return (
            <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
              {item.image && (
                <div className="w-full sm:w-24 h-48 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-stone-100 relative">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   {cart[item.id] > 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                        {cart[item.id]}x
                      </div>
                   )}
                </div>
              )}
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100">{item.name}</h4>
                      <span className="text-xs bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-500 mt-1 inline-block">{item.category}</span>
                    </div>
                    
                    <div className="text-right">
                       <span className="font-bold text-lg text-primary-600 dark:text-primary-400">₹{finalPrice}</span>
                       {(totalPercent > 0) && (
                          <div className="text-xs text-stone-400 line-through">₹{item.price}</div>
                       )}
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 line-clamp-2">{item.description}</p>
                  
                  {(totalPercent > 0) && (
                      <div className="mt-2 text-[10px] sm:text-xs text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300 p-1.5 rounded border border-green-100 dark:border-green-900/30 inline-block font-medium">
                         <span className="font-bold mr-1">Deal:</span> 
                         ₹{item.price} 
                         {ownerPercent > 0 && <span> - {ownerPercent}% (Coupon)</span>}
                         {userPercent > 0 && <span> - {userPercent}% ({defaultDiscount.type === 'first' ? 'First Order' : 'Seasonal'})</span>}
                      </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-3">
                  <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
                    <button 
                      onClick={() => updateCart(item, -1)}
                      className={`p-1 rounded-md transition-colors ${!cart[item.id] ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-stone-700 text-red-500'}`}
                      disabled={!cart[item.id]}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-4 text-center text-stone-900 dark:text-stone-100">{cart[item.id] || 0}</span>
                    <button 
                       onClick={() => updateCart(item, 1)}
                       className="p-1 rounded-md hover:bg-white dark:hover:bg-stone-700 text-green-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )})
        ) : (
          <p className="text-stone-500 italic">Menu currently unavailable for ordering.</p>
        )}
      </div>
  );

  const subTotal = getSubTotal();
  const finalTotal = getFinalTotal();
  const ownerDiscountPercent = selectedOwnerOffer ? getPercentageFromOffer(selectedOwnerOffer) : 0;
  const platformDiscountPercent = defaultDiscount.amount;

  return (
    <div className="relative w-full">
      {/* Banner */}
      <div className="h-48 md:h-96 relative">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-white/90 text-xs md:text-sm">
              <span className="flex items-center gap-1 bg-primary-600 px-2 py-0.5 rounded text-white font-bold">
                 <Star size={14} className="fill-white" /> {restaurant.rating}
              </span>
              <span className="flex items-center gap-1"><Utensils size={14}/> {restaurant.cuisine}</span>
              <span className="flex items-center gap-1"><Clock size={14}/> {restaurant.openingTime} - {restaurant.closingTime}</span>
              <span className="flex items-center gap-1 truncate max-w-[200px]"><MapPin size={14}/> {restaurant.address}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info & Tabs */}
        <div className="lg:col-span-2">
          
          <div className="flex border-b border-stone-200 dark:border-stone-800 mb-6 overflow-x-auto pb-1">
            {['overview', 'menu', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
                  activeTab === tab 
                  ? 'text-primary-600 dark:text-primary-500' 
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8 text-stone-700 dark:text-stone-300">
              {restaurant.offers && restaurant.offers.length > 0 && (
                 <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                       <Tag size={18} /> Available Offers
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {restaurant.offers.map((offer, idx) => (
                          <span key={idx} className="bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-orange-100 dark:border-orange-900/50">
                             {offer}
                          </span>
                       ))}
                    </div>
                 </div>
              )}

              <p className="text-lg leading-relaxed">{restaurant.description}</p>
              
              <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                  <Info size={18} /> Safety & Policies
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                   <li>Reservation is held for 15 minutes.</li>
                   <li>Rights of admission reserved.</li>
                </ul>
              </div>

               <div>
                  <h3 className="font-bold text-xl mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                     <Utensils size={20} className="text-primary-600" /> Featured Menu
                  </h3>
                  <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg flex items-center gap-3 text-sm text-primary-800 dark:text-primary-200 mb-2">
                     <ShoppingBag size={20} />
                     <span>You can add items to your order directly from here.</span>
                  </div>
                  {renderMenuItems()}
               </div>

              <div className="rounded-xl overflow-hidden shadow-sm border border-stone-200 dark:border-stone-800">
                <iframe 
                  title="Restaurant Location"
                  width="100%" 
                  height="300" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={mapSrc}
                ></iframe>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="grid gap-4">
              <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg flex items-center gap-3 text-sm text-primary-800 dark:text-primary-200 mb-4">
                <ShoppingBag size={20} />
                <span>Select items here to add them to your table reservation order.</span>
              </div>
              {renderMenuItems()}
            </div>
          )}

          {activeTab === 'reviews' && (
             <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Customer Reviews</h3>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-current" size={20} />
                    <span className="font-bold text-lg">{restaurant.rating}</span>
                    <span className="text-stone-500 text-sm">({restaurant.reviews?.length || 0} reviews)</span>
                  </div>
                </div>
                
                {restaurant.reviews && restaurant.reviews.length > 0 ? (
                  restaurant.reviews.slice().reverse().map((review, i) => (
                    <div key={review.id || i} className="p-4 border border-stone-100 dark:border-stone-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{review.user}</span>
                        <div className="flex text-yellow-500"><Star size={14} fill="currentColor"/> {review.rating}</div>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400 text-sm">"{review.comment}"</p>
                      <span className="text-xs text-stone-400 mt-2 block">{review.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 italic">No reviews yet.</p>
                )}
             </div>
          )}
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-stone-900 p-6 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
              <Calendar className="text-primary-600"/> {t.makeReservation}
            </h3>
            
            <form onSubmit={handleBookingInitiate} className="space-y-4">
              {Object.keys(cart).length > 0 && (
                <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg mb-4">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-stone-800 dark:text-stone-200">
                    <ShoppingBag size={14}/> Order Summary
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar border-b border-stone-200 dark:border-stone-700 pb-2 mb-2">
                    {getOrderItems().map(item => (
                      <div key={item.itemId} className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-xs mb-2">
                     {user && defaultDiscount.amount > 0 && (
                        <div className="flex justify-between text-green-600">
                           <span className="flex items-center gap-1"><Gift size={12}/> {defaultDiscount.label}</span>
                           <span>-{defaultDiscount.amount}%</span>
                        </div>
                     )}
                     {selectedOwnerOffer && (
                        <div className="flex justify-between text-green-600">
                           <span className="flex items-center gap-1"><Tag size={12}/> Coupon: {selectedOwnerOffer}</span>
                           <span>-{getPercentageFromOffer(selectedOwnerOffer)}%</span>
                        </div>
                     )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                     <div className="flex justify-between items-center font-bold text-lg text-stone-900 dark:text-stone-100">
                        <span>To Pay:</span>
                        <div className="flex flex-col items-end">
                           {(ownerDiscountPercent + platformDiscountPercent) > 0 ? (
                               <span className="text-sm text-green-600 font-mono mb-1">
                                  ₹{subTotal} - {(ownerDiscountPercent + platformDiscountPercent)}% = ₹{finalTotal}
                               </span>
                           ) : (
                               <span>₹{finalTotal}</span>
                           )}
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {user && restaurant.offers && restaurant.offers.length > 0 && (
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Apply Restaurant Coupon</label>
                    <select 
                       value={selectedOwnerOffer}
                       onChange={(e) => setSelectedOwnerOffer(e.target.value)}
                       className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                       <option value="">Select Coupon (Optional)</option>
                       {restaurant.offers.map((offer, i) => (
                          <option key={i} value={offer}>{offer}</option>
                       ))}
                    </select>
                    {selectedOwnerOffer && defaultDiscount.amount > 0 && (
                       <p className="text-[10px] text-green-600 mt-1">
                          * Applied on top of your {defaultDiscount.amount}% platform discount!
                       </p>
                    )}
                 </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.name}</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.phone}</label>
                   <input 
                     type="tel" 
                     required
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     placeholder="+91..."
                     className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                   />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.email}</label>
                   <input 
                     type="email" 
                     required
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     placeholder="mail@..."
                     className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                   />
                </div>
              </div>

              <div className="border-t border-stone-100 dark:border-stone-800 pt-2"></div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.date}</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.time}</label>
                    <select 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.guests}</label>
                    <select 
                      value={formData.guests}
                      onChange={(e) => setFormData({...formData, guests: Number(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n} People</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.seating}</label>
                <div className="grid grid-cols-2 gap-2">
                   {Object.values(TableType).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, tableType: type})}
                        className={`text-xs py-2 px-2 rounded border transition-colors ${
                          formData.tableType === type 
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300' 
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        {type}
                      </button>
                   ))}
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.specialReq}</label>
                 <textarea
                   rows={2}
                   value={formData.specialRequests}
                   onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                   placeholder="Allergies, birthday..."
                   className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                   name="req"
                 ></textarea>
              </div>

              <div className="border-t border-stone-100 dark:border-stone-800 pt-2"></div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">{t.payment}</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={formData.paymentMethod === PaymentMethod.CASH}
                      onChange={() => setFormData({...formData, paymentMethod: PaymentMethod.CASH})}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2">
                       <Banknote className="text-stone-500" size={18} />
                       <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{t.payAtRestaurant}</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={formData.paymentMethod === PaymentMethod.UPI}
                      onChange={() => setFormData({...formData, paymentMethod: PaymentMethod.UPI})}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2">
                       <Smartphone className="text-stone-500" size={18} />
                       <span className="text-sm font-medium text-stone-900 dark:text-stone-100">UPI (GPay / PhonePe)</span>
                    </div>
                  </label>

                   <label className="flex items-center gap-3 p-3 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={formData.paymentMethod === PaymentMethod.CARD}
                      onChange={() => setFormData({...formData, paymentMethod: PaymentMethod.CARD})}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2">
                       <CreditCard className="text-stone-500" size={18} />
                       <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Credit / Debit Card</span>
                    </div>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 mt-4"
              >
                {t.confirm}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showPaymentModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-stone-200 dark:border-stone-800">
               <div className="flex justify-end">
                  <button onClick={() => setShowPaymentModal(false)} className="text-stone-400 hover:text-stone-600"><X/></button>
               </div>
               
               <h3 className="text-xl font-bold mb-4 text-stone-900 dark:text-stone-100">{t.payNow}</h3>
               <p className="text-stone-500 mb-6 text-sm">Amount to Pay: <span className="font-bold text-stone-900 dark:text-stone-100">₹{finalTotal}</span></p>
               
               {formData.paymentMethod === PaymentMethod.UPI && restaurant?.qrCodeUrl && (
                  <div className="mb-6 flex justify-center">
                     <div className="p-2 bg-white rounded-xl shadow-md">
                        <img src={restaurant.qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                     </div>
                  </div>
               )}

               {isProcessingPayment ? (
                  <div className="flex flex-col items-center justify-center py-4">
                     <Loader2 className="animate-spin text-primary-600 mb-2" size={32} />
                     <p className="text-sm text-stone-500">Processing Payment...</p>
                  </div>
               ) : (
                  <button 
                     onClick={() => finalizeBooking(true)}
                     className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
                  >
                     Payment Completed
                  </button>
               )}
            </div>
         </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
