
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, Restaurant, MenuItem, CuisineType } from '../types';
import { Calendar, Users, Check, IndianRupee, Settings, BookOpen, Plus, Trash2, Save, MapPin, AlertCircle, CheckCircle, Share2, QrCode, Upload, Tag, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ApiService } from '../services/apiService';

// --- Image Upload Component Helper ---
const ImageInput: React.FC<{ 
   value: string; 
   onChange: (val: string) => void; 
   placeholder?: string;
   label: string;
}> = ({ value, onChange, placeholder, label }) => {
   
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            onChange(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => onChange(event.target?.result as string);
            reader.readAsDataURL(blob);
            e.preventDefault(); 
          }
        }
      }
   };

   return (
      <div>
         <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{label}</label>
         <div className="flex gap-2">
            <input 
               type="text" 
               value={value}
               onChange={(e) => onChange(e.target.value)}
               onPaste={handlePaste}
               placeholder={placeholder || "Paste image (Ctrl+V) or URL..."}
               className="flex-1 w-full px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none min-w-0"
            />
            <label className="bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center shrink-0">
               <Upload size={18} className="text-stone-600 dark:text-stone-300" />
               <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
         </div>
         {value && (
            <div className="mt-2 h-24 w-24 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100">
               <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
         )}
      </div>
   );
};

const AdminDashboard: React.FC = () => {
  const { t, user } = useApp();
  const [activeTab, setActiveTab] = useState<'bookings' | 'restaurant' | 'menu'>('bookings');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Form states for Restaurant Editing
  const [editRest, setEditRest] = useState<Partial<Restaurant>>({
    name: '',
    description: '',
    address: '',
    image: '',
    cuisine: CuisineType.INDIAN,
    priceRange: 'Medium',
    openingTime: '09:00',
    closingTime: '22:00',
    offers: []
  });
  
  // Menu Editing State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({ name: '', price: 0, description: '', category: 'Main', image: '' });

  // Payment info states
  const [paymentInfo, setPaymentInfo] = useState({ upiId: '', qrCodeUrl: '' });

  // Offer State
  const [newOffer, setNewOffer] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
        // 1. Fetch Restaurant for this Owner
        // Use ID if available, else look up by owner
        const myRestaurant = await ApiService.getRestaurantByOwnerId(user.id);
        
        if (myRestaurant) {
            setRestaurant(myRestaurant);
            setEditRest(myRestaurant);
            setMenuItems(myRestaurant.menu || []);
            setPaymentInfo({ upiId: myRestaurant.upiId || '', qrCodeUrl: myRestaurant.qrCodeUrl || '' });
            
            // 2. Fetch Bookings for this restaurant
            const myBookings = await ApiService.getRestaurantBookings(myRestaurant.id || (myRestaurant as any)._id);
            setBookings(myBookings);
        } else {
            setRestaurant(null);
            // Initialize edit form for new restaurant
            setEditRest({
                name: '',
                description: '',
                address: '',
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
                cuisine: CuisineType.INDIAN,
                priceRange: 'Medium',
                openingTime: '10:00',
                closingTime: '23:00',
                rating: 5.0,
                offers: []
            });
            setActiveTab('restaurant'); 
        }
    } catch (e) {
        console.error(e);
        setSaveMessage({ type: 'error', text: 'Failed to load dashboard data.' });
    }
    
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
        await ApiService.updateBooking(id, { status });
        const updatedBookings = bookings.map(b => (b.id === id || (b as any)._id === id) ? { ...b, status } : b);
        setBookings(updatedBookings);
    } catch(e) {
        alert("Failed to update status");
    }
  };

  const handleMarkPaid = async (id: string) => {
    const booking = bookings.find(b => b.id === id || (b as any)._id === id);
    if (booking) {
       const newStatus = booking.status === BookingStatus.PENDING ? BookingStatus.CONFIRMED : booking.status;
       try {
           await ApiService.updateBooking(id, { isPaid: true, status: newStatus });
           const updatedBookings = bookings.map(b => (b.id === id || (b as any)._id === id) ? { ...b, isPaid: true, status: newStatus } : b);
           setBookings(updatedBookings);
       } catch (e) {
           alert("Failed to mark as paid");
       }
    }
  };

  const deleteBooking = async (id: string) => {
    // API Call to delete/cancel
    if (confirm('Are you sure you want to cancel this booking?')) {
       updateStatus(id, BookingStatus.CANCELLED);
    }
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const savedRestaurant: Partial<Restaurant> = {
        ...(restaurant || {}),
        ownerId: user.id,
        name: editRest.name || 'New Restaurant',
        description: editRest.description || '',
        address: editRest.address || '',
        image: editRest.image || '',
        cuisine: editRest.cuisine || CuisineType.INDIAN,
        priceRange: editRest.priceRange || 'Medium',
        openingTime: editRest.openingTime || '09:00',
        closingTime: editRest.closingTime || '22:00',
        rating: restaurant?.rating || 5.0,
        tables: restaurant?.tables || [],
        menu: menuItems, 
        reviews: restaurant?.reviews || [],
        upiId: paymentInfo.upiId, 
        qrCodeUrl: paymentInfo.qrCodeUrl,
        offers: editRest.offers || []
      };

      const result = await ApiService.saveRestaurant(savedRestaurant as Restaurant);
      setRestaurant(result);
      setSaveMessage({ type: 'success', text: 'Restaurant profile saved successfully!' });
      
      if (!restaurant) {
        setTimeout(() => setActiveTab('menu'), 1000); 
      }
    } catch (error) {
      console.error(error);
      setSaveMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOffer = () => {
     if (!newOffer.trim()) return;
     const updatedOffers = [...(editRest.offers || []), newOffer.trim()];
     setEditRest({ ...editRest, offers: updatedOffers });
     setNewOffer('');
  };

  const removeOffer = (index: number) => {
     const updatedOffers = [...(editRest.offers || [])];
     updatedOffers.splice(index, 1);
     setEditRest({ ...editRest, offers: updatedOffers });
  };

  const handleAddMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.image) {
      setSaveMessage({ type: 'error', text: 'Name, Price and Dish Photo are required.' });
      return;
    }
    
    const newItem: MenuItem = {
      id: `m_${Date.now()}`,
      name: newMenuItem.name,
      price: Number(newMenuItem.price),
      description: newMenuItem.description || '',
      category: newMenuItem.category || 'Main',
      image: newMenuItem.image
    };

    const updatedMenu = [...menuItems, newItem];
    setMenuItems(updatedMenu);
    
    if (restaurant) {
      // Auto save restaurant with new menu to DB
      const updatedRest = { ...restaurant, menu: updatedMenu };
      try {
          await ApiService.saveRestaurant(updatedRest);
          setRestaurant(updatedRest);
          setSaveMessage({ type: 'success', text: 'Menu item added!' });
      } catch(e) {
          setSaveMessage({ type: 'error', text: 'Failed to save menu.' });
      }
    }
    setNewMenuItem({ name: '', price: 0, description: '', category: 'Main', image: '' });
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    const updatedMenu = menuItems.filter(m => m.id !== itemId);
    setMenuItems(updatedMenu);
    if (restaurant) {
      const updatedRest = { ...restaurant, menu: updatedMenu };
      await ApiService.saveRestaurant(updatedRest);
      setRestaurant(updatedRest);
    }
  };


  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
    guests: bookings.reduce((acc, curr) => acc + (curr.status === BookingStatus.CONFIRMED ? curr.guests : 0), 0),
    revenue: bookings.reduce((acc, curr) => acc + (curr.status === BookingStatus.COMPLETED || curr.isPaid ? (curr.totalAmount || 0) : 0), 0)
  };

  const isNewBooking = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return (now - created) < 5 * 60 * 1000; 
  };

  if (isLoading) return <div className="p-12 text-center text-stone-500">Loading Admin Dashboard...</div>;

  const restaurantLink = restaurant ? `${window.location.origin}/#/restaurant/${restaurant.id || (restaurant as any)._id}` : '';
  const qrCodeApiUrl = restaurant ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(restaurantLink)}` : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            {t.dashboard}
            {restaurant && <span className="text-sm font-normal text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full whitespace-nowrap">Owner</span>}
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            {restaurant ? restaurant.name : 'Setup Your Restaurant'}
          </p>
        </div>
        
        {/* Navigation Tabs - Responsive Scrollable */}
        <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex bg-white dark:bg-stone-900 rounded-lg p-1 border border-stone-200 dark:border-stone-800 shadow-sm whitespace-nowrap">
            <button 
              onClick={() => setActiveTab('bookings')} 
              disabled={!restaurant}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
              <Calendar size={16} /> Bookings
            </button>
            <button 
              onClick={() => setActiveTab('restaurant')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'restaurant' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
              <Settings size={16} /> Restaurant Info
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              disabled={!restaurant}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'menu' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
              <BookOpen size={16} /> Menu
            </button>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {saveMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {saveMessage.text}
        </div>
      )}

      {/* --- BOOKINGS TAB --- */}
      {activeTab === 'bookings' && restaurant && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-stone-500 dark:text-stone-400 text-sm font-medium">{t.totalBookings}</h3>
                   <Calendar size={18} className="text-primary-600"/>
                </div>
                <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">{stats.total}</p>
             </div>
             <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-stone-500 dark:text-stone-400 text-sm font-medium">Active</h3>
                   <Check size={18} className="text-green-600"/>
                </div>
                <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">{stats.confirmed}</p>
             </div>
             <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-stone-500 dark:text-stone-400 text-sm font-medium">{t.guests}</h3>
                   <Users size={18} className="text-blue-600"/>
                </div>
                <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">{stats.guests}</p>
             </div>
              <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-stone-500 dark:text-stone-400 text-sm font-medium">{t.revenue}</h3>
                   <IndianRupee size={18} className="text-green-600"/>
                </div>
                <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">₹{stats.revenue.toLocaleString()}</p>
             </div>
          </div>

          {/* Booking Table */}
          <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800">
               <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Reservations & Payments</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
                <thead className="bg-stone-50 dark:bg-stone-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider min-w-[150px]">Order & Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Table</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-stone-900 divide-y divide-stone-200 dark:divide-stone-800">
                  {bookings.length === 0 ? (
                     <tr><td colSpan={6} className="px-6 py-8 text-center text-stone-500">{t.noBookings}</td></tr>
                  ) : (
                    bookings.slice().reverse().map((booking) => (
                      <tr key={booking.id || (booking as any)._id} className={`hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors ${isNewBooking(booking.createdAt) ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{booking.customerName}</div>
                             {isNewBooking(booking.createdAt) && (
                                <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">NEW</span>
                             )}
                          </div>
                          <div className="text-xs text-stone-500">{booking.customerPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-stone-900 dark:text-stone-100 whitespace-nowrap">{booking.date} <span className="text-xs text-stone-400">({booking.time})</span></div>
                          {booking.items && booking.items.length > 0 ? (
                            <div className="text-xs text-stone-600 dark:text-stone-400 mt-1 space-y-0.5 bg-stone-50 dark:bg-stone-800 p-2 rounded max-w-[200px] overflow-hidden">
                               {booking.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between truncate">
                                     <span>{item.quantity}x {item.name}</span>
                                  </div>
                               ))}
                            </div>
                          ) : (
                             <span className="text-xs text-stone-400 italic">Table reservation only</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-stone-900 dark:text-stone-100">{booking.guests} Guests</div>
                          <div className="text-xs text-stone-500">{booking.tableType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-stone-900 dark:text-stone-100">₹{booking.totalAmount || 0}</div>
                          <div className="flex items-center gap-2 mt-1">
                             <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${booking.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {booking.isPaid ? 'PAID' : 'PENDING'}
                             </div>
                             {!booking.isPaid && (
                                <button 
                                   onClick={() => handleMarkPaid(booking.id || (booking as any)._id)}
                                   className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded border border-green-200"
                                   title="Mark as Paid (Confirm Cash)"
                                >
                                   <CheckCircle size={14} />
                                </button>
                             )}
                          </div>
                          <div className="text-xs text-stone-400 mt-1">{booking.paymentMethod}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            booking.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            booking.status === BookingStatus.COMPLETED ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select 
                            value={booking.status}
                            onChange={(e) => updateStatus(booking.id || (booking as any)._id, e.target.value as BookingStatus)}
                            className="bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary-500"
                          >
                             <option value={BookingStatus.PENDING}>Pending</option>
                             <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                             <option value={BookingStatus.COMPLETED}>Completed</option>
                             <option value={BookingStatus.CANCELLED}>Cancelled</option>
                          </select>

                          {booking.status === BookingStatus.CANCELLED && (
                             <button 
                              onClick={() => deleteBooking(booking.id || (booking as any)._id)}
                              className="ml-3 text-red-500 hover:text-red-700"
                              title="Delete Record"
                             >
                                <Trash2 size={16} />
                             </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* --- RESTAURANT INFO TAB --- */}
      {activeTab === 'restaurant' && (
         <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-8 w-full">
            <h2 className="text-xl font-bold mb-6 text-stone-900 dark:text-stone-100">
               {restaurant ? 'Edit Restaurant Profile' : 'Create Your Restaurant Profile'}
            </h2>
            
            {/* QR Code Section */}
            {restaurant && (
               <div className="mb-8 bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                     <img src={qrCodeApiUrl} alt="Restaurant QR" className="w-32 h-32" />
                  </div>
                  <div className="flex-1 w-full">
                     <h3 className="font-bold text-lg flex items-center gap-2">
                        <QrCode className="text-primary-600" /> Share Restaurant
                     </h3>
                     <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
                        Customers can scan this QR code to view your restaurant page and book tables instantly.
                     </p>
                     <div className="flex items-center gap-2 w-full">
                        <input 
                           readOnly 
                           value={restaurantLink}
                           className="flex-1 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 px-3 py-2 rounded text-stone-600 dark:text-stone-400 min-w-0"
                        />
                        <a 
                           href={restaurantLink} 
                           target="_blank" 
                           rel="noreferrer"
                           className="bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 px-3 py-2 rounded text-stone-700 dark:text-stone-300 shrink-0"
                        >
                           <Share2 size={16} />
                        </a>
                     </div>
                  </div>
               </div>
            )}

            <form onSubmit={handleSaveRestaurant} className="space-y-6 w-full">
               <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Restaurant Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editRest.name} 
                    onChange={e => setEditRest({...editRest, name: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none placeholder-stone-400" 
                    placeholder="e.g. The Royal Kitchen"
                  />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Cuisine Type</label>
                    <select 
                      value={editRest.cuisine} 
                      onChange={e => setEditRest({...editRest, cuisine: e.target.value as CuisineType})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {Object.values(CuisineType).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Price Range</label>
                    <select 
                      value={editRest.priceRange} 
                      onChange={e => setEditRest({...editRest, priceRange: e.target.value as any})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {['Low', 'Medium', 'High', 'Luxury'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description</label>
                  <textarea 
                    rows={3} 
                    value={editRest.description} 
                    onChange={e => setEditRest({...editRest, description: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none placeholder-stone-400" 
                    placeholder="Describe your restaurant's vibe and food..."
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Opening Time</label>
                    <input 
                      type="time" 
                      value={editRest.openingTime} 
                      onChange={e => setEditRest({...editRest, openingTime: e.target.value})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Closing Time</label>
                    <input 
                      type="time" 
                      value={editRest.closingTime} 
                      onChange={e => setEditRest({...editRest, closingTime: e.target.value})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Location / Address</label>
                  <div className="relative">
                     <MapPin className="absolute left-3 top-2.5 text-stone-400" size={18} />
                     <input 
                       type="text" 
                       required
                       value={editRest.address}
                       onChange={e => setEditRest({...editRest, address: e.target.value})}
                       className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none" 
                       placeholder="Full address for map location"
                     />
                  </div>
               </div>

               {/* Universal Image Upload */}
               <ImageInput 
                  label="Cover Image"
                  value={editRest.image || ''}
                  onChange={(val) => setEditRest({...editRest, image: val})}
               />

               {/* Offers Management */}
               <div className="border-t border-stone-200 dark:border-stone-700 pt-6 mt-6">
                  <h3 className="font-bold text-lg mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                     <Tag size={20} className="text-orange-500" /> Offers & Discounts
                  </h3>
                  <div className="flex gap-2 mb-4">
                     <input 
                        type="text"
                        value={newOffer}
                        onChange={(e) => setNewOffer(e.target.value)}
                        placeholder="e.g. 20% OFF on Lunch"
                        className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 min-w-0"
                     />
                     <button 
                        type="button"
                        onClick={handleAddOffer}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shrink-0"
                     >
                        Add
                     </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {editRest.offers?.map((offer, idx) => (
                        <div key={idx} className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                           {offer}
                           <button type="button" onClick={() => removeOffer(idx)}><X size={14}/></button>
                        </div>
                     ))}
                     {(!editRest.offers || editRest.offers.length === 0) && (
                        <p className="text-sm text-stone-500 italic">No offers active.</p>
                     )}
                  </div>
               </div>

               {/* Payment Settings */}
               <div className="border-t border-stone-200 dark:border-stone-700 pt-6 mt-6">
                  <h3 className="font-bold text-lg mb-4 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                     <IndianRupee size={20} /> Payment Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">UPI ID</label>
                        <input 
                           type="text" 
                           value={paymentInfo.upiId}
                           onChange={e => setPaymentInfo({...paymentInfo, upiId: e.target.value})}
                           placeholder="e.g. name@upi"
                           className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                     </div>
                     <div>
                        <ImageInput 
                           label="QR Code Image"
                           value={paymentInfo.qrCodeUrl}
                           onChange={(val) => setPaymentInfo({...paymentInfo, qrCodeUrl: val})}
                           placeholder="Upload or Paste QR Code..."
                        />
                     </div>
                  </div>
               </div>

               <div className="pt-4">
                  <button 
                     type="submit" 
                     disabled={isSaving}
                     className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 w-full sm:w-auto justify-center"
                  >
                     <Save size={20} /> {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
               </div>
            </form>
         </div>
      )}

      {/* --- MENU MANAGEMENT TAB --- */}
      {activeTab === 'menu' && restaurant && (
         <div className="space-y-8">
            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
               <h3 className="font-bold text-lg mb-4 text-stone-900 dark:text-stone-100">{t.addDish}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="lg:col-span-1">
                     <label className="block text-xs font-bold text-stone-500 uppercase mb-1">{t.dishName} *</label>
                     <input 
                        type="text" 
                        value={newMenuItem.name} 
                        onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})} 
                        className="w-full p-2 border rounded bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-stone-500 uppercase mb-1">{t.dishPrice} (₹) *</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2 text-stone-500">₹</span>
                        <input 
                           type="number" 
                           value={newMenuItem.price || ''} 
                           onChange={e => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value)})} 
                           className="w-full pl-6 p-2 border rounded bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                     </div>
                  </div>
                  <div className="lg:col-span-2">
                     <ImageInput 
                        label={t.dishImage}
                        value={newMenuItem.image || ''}
                        onChange={(val) => setNewMenuItem({...newMenuItem, image: val})}
                     />
                  </div>
                  <div className="lg:col-span-3">
                     <label className="block text-xs font-bold text-stone-500 uppercase mb-1">{t.dishDesc}</label>
                     <input 
                        type="text" 
                        value={newMenuItem.description} 
                        onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})} 
                        className="w-full p-2 border rounded bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                     />
                  </div>
                  <div className="lg:col-span-1 flex gap-2">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Category</label>
                        <input 
                           type="text" 
                           value={newMenuItem.category} 
                           onChange={e => setNewMenuItem({...newMenuItem, category: e.target.value})} 
                           className="w-full p-2 border rounded bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                     </div>
                     <button 
                        onClick={handleAddMenuItem}
                        className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 rounded font-bold hover:opacity-90 flex items-center justify-center h-[42px] mt-auto shrink-0"
                     >
                        <Plus size={20} />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
               <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800">
                  <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Current Menu</h3>
               </div>
               <div className="overflow-x-auto w-full">
                  <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
                     <thead className="bg-stone-50 dark:bg-stone-800/50">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Image</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Item</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Category</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Price</th>
                           <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-stone-900 divide-y divide-stone-200 dark:divide-stone-800">
                        {menuItems.length === 0 ? (
                           <tr><td colSpan={5} className="px-6 py-8 text-center text-stone-500">No items in menu yet.</td></tr>
                        ) : (
                           menuItems.map((item, i) => (
                              <tr key={item.id || i} className="hover:bg-stone-50 dark:hover:bg-stone-800/30">
                                 <td className="px-6 py-4">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover bg-stone-100" />
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">{item.name}</div>
                                    <div className="text-xs text-stone-500 truncate max-w-xs">{item.description}</div>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">{item.category}</td>
                                 <td className="px-6 py-4 text-sm font-bold text-stone-900 dark:text-stone-100">₹{item.price}</td>
                                 <td className="px-6 py-4 text-right">
                                    <button 
                                       onClick={() => handleDeleteMenuItem(item.id)}
                                       className="text-red-500 hover:text-red-700"
                                    >
                                       <Trash2 size={18} />
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
