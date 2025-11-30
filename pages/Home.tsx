
import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { ApiService } from '../services/apiService';
import { searchRestaurantsWithAI } from '../services/geminiService';
import { useApp } from '../contexts/AppContext';
import { Restaurant } from '../types';

const { useNavigate } = ReactRouterDOM as any;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, user } = useApp();
  const [aiQuery, setAiQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResults, setAiResults] = useState<string[] | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [activeOfferFilter, setActiveOfferFilter] = useState<string | null>(null);

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
     "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop", 
     "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop"
  ];

  useEffect(() => {
    // PRODUCTION: Fetch from Backend API via Service
    const fetchRestaurants = async () => {
      try {
        const data = await ApiService.getAllRestaurants();
        setRestaurants(data);
      } catch (err) {
        console.error("Failed to load restaurants", err);
        // Fallback or empty state handled in UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
    
    // Auto slide hero
    const timer = setInterval(() => {
       setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsSearching(true);
    setActiveOfferFilter(null); 
    try {
      const ids = await searchRestaurantsWithAI(aiQuery, restaurants);
      setAiResults(ids);
    } catch (err) {
      const lower = aiQuery.toLowerCase();
      const filtered = restaurants
        .filter(r => r.name.toLowerCase().includes(lower) || r.cuisine.toLowerCase().includes(lower))
        .map(r => r.id);
      setAiResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setAiQuery('');
    setAiResults(null);
    setActiveOfferFilter(null);
  };

  const handleOfferClick = (offerTitle: string) => {
    setActiveOfferFilter(offerTitle);
    setAiResults(null); 
    document.getElementById('rest-list')?.scrollIntoView({behavior: 'smooth'});
  };

  // Filter Logic
  let displayedRestaurants = restaurants;
  
  if (aiResults) {
     // NOTE: Mongo uses _id, but frontend types use id. 
     // We handle this loosely for now.
     displayedRestaurants = restaurants.filter(r => aiResults.includes(r.id) || aiResults.includes((r as any)._id));
  } else if (activeOfferFilter) {
     if (activeOfferFilter.includes('FLAT 10%')) {
         displayedRestaurants = restaurants;
     } else if (activeOfferFilter.includes('SEASON OFF')) {
         displayedRestaurants = restaurants; 
     } else {
         displayedRestaurants = restaurants.filter(r => 
            r.offers?.some(o => o.includes(activeOfferFilter))
         );
     }
  }

  const offers = [
    { id: 1, title: 'FLAT 10% OFF', subtitle: 'On your first order', color: 'bg-orange-500', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800' },
    { id: 2, title: '5% SEASON OFF', subtitle: 'Limited time deal', color: 'bg-green-600', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800' },
    { id: 3, title: '20% OFF', subtitle: 'Partner Specials', color: 'bg-purple-600', img: 'https://images.unsplash.com/photo-1563729768647-d3c9dd645a91?q=80&w=800' }
  ];

  return (
    <div className="pb-12 bg-stone-50 dark:bg-stone-950">
      
      {/* Hero / Header Section */}
      <div className="bg-white dark:bg-stone-900 shadow-sm pb-6 rounded-b-3xl mb-6 overflow-hidden relative group">
         <div className="relative h-64 md:h-80 w-full mb-6">
            {heroImages.map((img, idx) => (
               <div 
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
               >
                  <img src={img} alt="Hero" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="max-w-7xl mx-auto px-4 w-full text-center">
                         <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                           Hi {user ? user.name.split(' ')[0] : 'Guest'}, Dine Anytime!
                         </h1>
                         <p className="text-stone-200 text-lg drop-shadow-md">Explore the best food & drinks near you.</p>
                      </div>
                  </div>
               </div>
            ))}
            
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
               {heroImages.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-white/50'}`} />
               ))}
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4">
            <form onSubmit={handleAiSearch} className="relative shadow-lg rounded-xl overflow-hidden -mt-12 mb-8 z-10">
               <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Search 'Italian', 'Spicy', 'Near me'..."
                  className="w-full p-4 pl-12 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none"
               />
               <Search className="absolute left-4 top-4 text-stone-400" size={20} />
            </form>

            <div className="mb-2">
               <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Offers For You</h3>
               </div>
               <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {offers.map(offer => (
                     <div 
                        key={offer.id} 
                        onClick={() => handleOfferClick(offer.title)}
                        className="min-w-[280px] h-40 rounded-2xl relative overflow-hidden shadow-md group cursor-pointer hover:scale-105 transition-transform"
                     >
                        <img src={offer.img} className="w-full h-full object-cover" alt="offer" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center px-6">
                           <span className={`text-xs font-bold text-white px-2 py-1 rounded w-fit mb-2 ${offer.color}`}>{offer.title}</span>
                           <h4 className="text-white font-bold text-lg">{offer.subtitle}</h4>
                           <span className="text-stone-300 text-xs mt-1 flex items-center gap-1">Tap to View <ArrowRight size={12}/></span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Main Content List */}
      <div id="rest-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
             {aiResults ? `Found ${displayedRestaurants.length} results` : (activeOfferFilter ? `Restaurants with ${activeOfferFilter}` : t.featured)}
           </h2>
           {(aiResults || activeOfferFilter) && (
              <button onClick={clearSearch} className="text-primary-600 text-sm font-bold">Show All</button>
           )}
        </div>

        {isLoading ? (
           <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-primary-600" size={40} />
              <span className="ml-3 text-stone-500">Loading restaurants from server...</span>
           </div>
        ) : displayedRestaurants.length === 0 ? (
           <div className="text-center p-12 bg-white dark:bg-stone-900 rounded-xl border border-dashed border-stone-300 dark:border-stone-700">
              <p className="text-stone-500">No restaurants found.</p>
              <button onClick={clearSearch} className="mt-2 text-primary-600 font-bold hover:underline">Clear Filters</button>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {displayedRestaurants.map((restaurant) => (
               // Use _id from Mongo if id is missing
               <RestaurantCard key={restaurant.id || (restaurant as any)._id} data={{...restaurant, id: restaurant.id || (restaurant as any)._id}} />
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default Home;
