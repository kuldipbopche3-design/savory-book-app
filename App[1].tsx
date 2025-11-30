
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import BookingSuccess from './pages/BookingSuccess';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import RestaurantCard from './components/RestaurantCard';
import { AppProvider, useApp } from './contexts/AppContext';
import { Search } from 'lucide-react';
import { ApiService } from './services/apiService';
import { Restaurant } from './types';

const { HashRouter, Routes, Route, Navigate, useSearchParams } = ReactRouterDOM as any;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = React.useState(initialQuery);
  const [allRestaurants, setAllRestaurants] = React.useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // PRODUCTION: Fetch from API
    const fetchRestaurants = async () => {
      try {
        const data = await ApiService.getAllRestaurants();
        setAllRestaurants(data);
      } catch (e) {
        console.error("Failed to fetch restaurants in search", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(val ? { q: val } : {});
  };

  const filteredRestaurants = allRestaurants.filter(r => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    
    // Check name, cuisine, address, description
    if (r.name.toLowerCase().includes(q)) return true;
    if (r.cuisine.toLowerCase().includes(q)) return true;
    if (r.address.toLowerCase().includes(q)) return true;
    if (r.description.toLowerCase().includes(q)) return true;
    
    // Check offers
    if (r.offers?.some(o => o.toLowerCase().includes(q))) return true;

    // Check menu items
    if (r.menu?.some(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))) return true;

    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-stone-900 dark:text-stone-100">Explore Restaurants</h1>
        <div className="relative max-w-2xl">
           <input 
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search for restaurant, cuisine, or dish..."
              className="w-full py-3 pl-12 pr-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              autoFocus={!initialQuery}
           />
           <Search className="absolute left-4 top-3.5 text-stone-400" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-stone-500">Loading restaurants...</p>
        </div>
      ) : filteredRestaurants.length === 0 ? (
         <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-xl border border-dashed border-stone-300 dark:border-stone-700">
            <Search className="mx-auto h-12 w-12 text-stone-300 mb-3" />
            <p className="text-stone-500">No matches found for "{query}".</p>
            <button onClick={() => {setQuery(''); setSearchParams({})}} className="mt-2 text-primary-600 font-medium hover:underline">Clear Search</button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(r => (
            <RestaurantCard key={r.id || (r as any)._id} data={{...r, id: r.id || (r as any)._id}} />
          ))}
        </div>
      )}
    </div>
  )
}

const ProtectedRoute: React.FC<{ children: React.ReactElement, requiredRole?: 'admin' | 'customer' }> = ({ children, requiredRole }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      <Route path="/booking-success" element={<BookingSuccess />} />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
