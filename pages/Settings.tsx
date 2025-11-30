import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Moon, Sun, Globe, LogOut, Phone, ShieldCheck, 
  User, ChevronRight, HelpCircle, AlertTriangle, Utensils 
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Language } from '../services/translations';

const { useNavigate } = ReactRouterDOM as any;

const Settings: React.FC = () => {
  const { 
    user, logout, language, setLanguage, 
    isDarkMode, toggleTheme, t 
  } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Removed window.confirm to ensure the button works immediately on all devices
    logout();
    navigate('/');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleSupportCall = () => {
    window.location.href = "tel:+919876543210";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 mb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
        <div className="flex items-center gap-2">
            <div className="bg-primary-100 dark:bg-primary-900/50 p-1.5 rounded-lg">
                <Utensils size={20} className="text-primary-600 dark:text-primary-500" />
            </div>
            <span className="text-xl font-serif font-bold text-primary-800 dark:text-primary-500 tracking-wide">
                WindGC
            </span>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
        <h2 className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 text-sm font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
          Account
        </h2>
        
        {user ? (
          <div className="p-6 flex items-center gap-4">
             <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                {user.name.charAt(0)}
             </div>
             <div className="flex-1">
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{user.name}</h3>
                <p className="text-stone-500 text-sm">{user.email}</p>
                <span className="text-xs font-bold bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-400 mt-1 inline-block uppercase">
                  {user.role === 'admin' ? 'Owner Account' : 'Customer Account'}
                </span>
             </div>
          </div>
        ) : (
          <div className="p-6 text-center">
             <p className="text-stone-500 mb-4">You are not logged in.</p>
             <button 
               onClick={() => navigate('/login')}
               className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700"
             >
               Login / Register
             </button>
          </div>
        )}
        
        {/* Owner Login Switch */}
        <div className="border-t border-stone-200 dark:border-stone-800">
           <button 
             onClick={() => navigate('/login')}
             className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-left"
           >
              <div className="flex items-center gap-3">
                 <ShieldCheck className="text-stone-400" size={20} />
                 <div>
                    <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">Partner / Owner Login</span>
                    <span className="block text-xs text-stone-500">Manage your restaurant business</span>
                 </div>
              </div>
              <ChevronRight size={16} className="text-stone-400" />
           </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
        <h2 className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 text-sm font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
          Preferences
        </h2>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors border-b border-stone-200 dark:border-stone-800"
        >
           <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="text-purple-500" size={20} /> : <Sun className="text-orange-500" size={20} />}
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">App Theme</span>
           </div>
           <span className="text-sm text-stone-500 flex items-center gap-2">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
           </span>
        </button>

        {/* Language Selector */}
        <div className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
           <div className="flex items-center gap-3">
              <Globe className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Language</span>
           </div>
           <select 
             value={language}
             onChange={handleLanguageChange}
             className="bg-stone-100 dark:bg-stone-800 border-none rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
           >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="mr">मराठी (Marathi)</option>
           </select>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
        <h2 className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 text-sm font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
          Support
        </h2>
        <button 
          onClick={handleSupportCall}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        >
           <div className="flex items-center gap-3">
              <Phone className="text-green-500" size={20} />
              <div>
                 <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">Customer Support</span>
                 <span className="block text-xs text-stone-500">Call us for help with bookings</span>
              </div>
           </div>
           <ChevronRight size={16} className="text-stone-400" />
        </button>
         <button 
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors border-t border-stone-200 dark:border-stone-800"
        >
           <div className="flex items-center gap-3">
              <HelpCircle className="text-stone-500" size={20} />
              <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">Help & FAQ</span>
           </div>
           <ChevronRight size={16} className="text-stone-400" />
        </button>
      </div>

      {/* Logout Zone */}
      {user && (
        <div className="mt-8 pb-8">
           <button 
             type="button"
             onClick={handleLogout}
             className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
           >
              <LogOut size={20} /> Log Out
           </button>
           <p className="text-center text-xs text-stone-400 mt-4">
              Version 1.2.0 • WindGC Technologies
           </p>
        </div>
      )}
    </div>
  );
};

export default Settings;