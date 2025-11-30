import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Home, Search, Calendar, LayoutDashboard, Settings, 
  Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Coffee, Utensils, ChevronLeft
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const { Link, useLocation, useNavigate } = ReactRouterDOM as any;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState('');
  
  const isAdmin = user?.role === 'admin';

  // Define main navigation paths where the back button should be HIDDEN.
  // These correspond to the "Menu Sections" (tabs) of the app.
  const mainNavPaths = ['/', '/search', '/profile', '/settings', '/admin'];
  const isMainPage = mainNavPaths.includes(location.pathname);

  const navItems = isAdmin ? [
    { label: t.dashboard, path: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ] : [
    { label: t.home, path: '/', icon: <Home size={20} /> },
    { label: t.explore, path: '/search', icon: <Search size={20} /> },
    { label: t.myBookings, path: '/profile', icon: <Calendar size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearch)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300 w-full overflow-x-hidden">
      {/* Navbar (Header) */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm w-full transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            
            {/* Logo Section - Left Aligned */}
            <div className="flex items-center flex-shrink-0 z-50 gap-1">
              {!isMainPage && (
                 <button 
                   onClick={() => navigate(-1)} 
                   className="p-1 -ml-2 mr-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                   title="Go Back"
                 >
                    <ChevronLeft size={24} />
                 </button>
              )}
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-xl md:text-2xl font-serif font-bold text-primary-800 dark:text-primary-500 tracking-wide whitespace-nowrap">
                  WindGC
                </span>
                {isAdmin && (
                  <span className="ml-2 text-[10px] md:text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Admin
                  </span>
                )}
              </Link>
            </div>

            {/* Navbar Search Section */}
            <div className="flex-1 max-w-lg hidden md:block mx-4">
              <form onSubmit={handleNavSearch} className="relative group">
                <input 
                  type="text" 
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search..." 
                  className="w-full bg-stone-100 dark:bg-stone-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
                <Search className="absolute left-3 top-2.5 text-stone-400 group-hover:text-primary-500 transition-colors" size={18} />
              </form>
            </div>

            {/* Desktop Navigation - Right Aligned */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path 
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-stone-800' 
                    : 'text-stone-600 dark:text-stone-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center gap-4 border-l border-stone-200 dark:border-stone-700 pl-4 ml-2">
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-300 flex flex-col items-end leading-tight">
                    <span>{user.name}</span>
                    <span className="text-xs text-primary-600 font-bold uppercase">{user.role === 'admin' ? 'Owner' : 'Customer'}</span>
                  </span>
                </div>
              ) : (
                <Link 
                   to="/login"
                   className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all active:scale-95 ml-2"
                >
                   Login
                </Link>
              )}
            </div>

            {/* Mobile Header Actions - Right Aligned */}
            <div className="flex items-center md:hidden gap-2">
               {/* Login Button or Settings Icon */}
               {user ? (
                 <Link 
                   to="/settings" 
                   className={`p-2 rounded-full transition-colors ${
                     location.pathname === '/settings' 
                     ? 'bg-primary-50 text-primary-600 dark:bg-stone-800 dark:text-primary-400' 
                     : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                   }`}
               >
                    <Settings size={22} />
                 </Link>
               ) : (
                 <Link 
                   to="/login"
                   className="ml-1 bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-sm active:scale-95 transition-transform whitespace-nowrap"
                 >
                   Login
                 </Link>
               )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar - Fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 z-50 pb-safe safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="flex justify-around items-center h-16 px-2">
              {navItems.slice(0, 4).map((item) => (
                 <Link 
                   key={item.path}
                   to={item.path}
                   className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${
                      location.pathname === item.path 
                      ? 'text-primary-600 dark:text-primary-500' 
                      : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                   }`}
                 >
                    {/* Clone element to adjust size if needed, or render directly */}
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                    <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                 </Link>
              ))}
           </div>
      </div>

      {/* Main Content Wrapper */}
      <main className="flex-grow pb-24 md:pb-0 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>

      {/* Footer - Visible on Mobile and Desktop */}
      <footer className="bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 mt-12 py-12 mb-20 md:mb-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-stone-600 dark:text-stone-400">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-xl font-bold text-primary-700 dark:text-primary-500 mb-4 flex items-center gap-2">
                 <div className="bg-primary-100 dark:bg-primary-900/50 p-1.5 rounded-lg">
                    <Utensils size={20} className="text-primary-600 dark:text-primary-500" />
                 </div>
                 WindGC
              </h3>
              <p className="text-sm leading-relaxed mb-6">
                {t.findTable}
              </p>
              <div className="flex gap-4">
                 <a href="#" className="p-2 bg-white dark:bg-stone-800 rounded-full hover:text-blue-600 transition-colors shadow-sm"><Facebook size={18} /></a>
                 <a href="#" className="p-2 bg-white dark:bg-stone-800 rounded-full hover:text-pink-600 transition-colors shadow-sm"><Instagram size={18} /></a>
                 <a href="#" className="p-2 bg-white dark:bg-stone-800 rounded-full hover:text-blue-400 transition-colors shadow-sm"><Twitter size={18} /></a>
                 <a href="#" className="p-2 bg-white dark:bg-stone-800 rounded-full hover:text-red-600 transition-colors shadow-sm"><Youtube size={18} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-stone-900 dark:text-stone-100 font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-primary-600 transition-colors">Home</Link></li>
                <li><Link to="/search" className="hover:text-primary-600 transition-colors">Explore Menu</Link></li>
                <li><Link to="/profile" className="hover:text-primary-600 transition-colors">My Orders</Link></li>
                <li><Link to="/settings" className="hover:text-primary-600 transition-colors">Settings</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-stone-900 dark:text-stone-100 font-bold mb-4 uppercase text-sm tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary-600 transition-colors">Contact Us</Link></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-stone-900 dark:text-stone-100 font-bold mb-4 uppercase text-sm tracking-wider">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                   <MapPin size={18} className="shrink-0 text-primary-600" />
                   <span>123 Food Street, Flavor Town, India 400001</span>
                </li>
                <li className="flex items-center gap-3">
                   <Phone size={18} className="shrink-0 text-primary-600" />
                   <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-3">
                   <Mail size={18} className="shrink-0 text-primary-600" />
                   <span>support@windgc.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-stone-200 dark:border-stone-800 mt-10 pt-6 text-center text-xs text-stone-500">
             &copy; {new Date().getFullYear()} WindGC Dining. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;