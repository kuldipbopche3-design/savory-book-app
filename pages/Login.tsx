
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { User as UserIcon, ShieldCheck, MapPin, Phone, Mail, KeyRound, AlertTriangle } from 'lucide-react';
import { ApiService } from '../services/apiService';
import { User } from '../types';

const { useNavigate } = ReactRouterDOM as any;

const Login: React.FC = () => {
  const { setUser, t } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // OTP State (Kept for visual flow, but backend uses password)
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  const initiateAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validation
    if (!formData.email || !formData.password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    // If login, we go straight to verification for this UI flow
    // In production, you might want to call an endpoint here
    setShowOtp(true);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate OTP verification
    if (otp !== '1234') {
      setErrorMsg("Invalid OTP. Please try '1234'.");
      return;
    }

    try {
        if (isRegistering) {
          const newUser: Partial<User> = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            password: formData.password,
            favorites: [],
            role: role
          };
          
          const registered = await ApiService.register(newUser);
          setUser(registered);
          navigate(role === 'admin' ? '/admin' : '/');
        } else {
          // Login Logic via API
          const existingUser = await ApiService.login(formData.email, formData.password, role);
          setUser(existingUser);
          navigate(role === 'admin' ? '/admin' : '/');
        }
    } catch (error: any) {
        setErrorMsg(error.message || "Authentication failed");
        setShowOtp(false);
        setOtp('');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden border border-stone-200 dark:border-stone-800">
        
        {/* Header Tabs */}
        {!showOtp && (
          <div className="flex text-center border-b border-stone-200 dark:border-stone-800">
            <button 
              type="button"
              onClick={() => { setRole('customer'); setErrorMsg(null); }}
              className={`flex-1 py-4 font-bold text-sm transition-colors ${role === 'customer' ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserIcon size={18} /> {t.customerLogin}
              </div>
            </button>
            <button 
              type="button"
              onClick={() => { setRole('admin'); setErrorMsg(null); }}
              className={`flex-1 py-4 font-bold text-sm transition-colors ${role === 'admin' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={18} /> {t.adminLogin}
              </div>
            </button>
          </div>
        )}

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {showOtp 
                ? 'Enter Verification Code' 
                : (isRegistering ? (role === 'customer' ? 'Join SavoryBook' : 'Partner Registration') : (role === 'customer' ? 'Welcome Back' : 'Owner Portal'))}
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              {showOtp 
                ? `We sent a code to ${formData.email}` 
                : (role === 'customer' 
                  ? (isRegistering ? 'Create your foodie profile' : 'Login to manage bookings') 
                  : (isRegistering ? 'Register your restaurant business' : 'Manage your restaurant & orders'))}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          {!showOtp ? (
            <form onSubmit={initiateAuth} className="space-y-4">
              
              {/* Extended fields for registration */}
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon size={18} className="absolute left-3 top-3 text-stone-400" />
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Verma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-3 text-stone-400" />
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Location / City</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-3 text-stone-400" />
                      <input 
                        type="text" 
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Mumbai, Andheri West"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t.email}</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-stone-400" />
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <button 
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-bold shadow-md transition-colors flex items-center justify-center gap-2 mt-4 ${
                  role === 'customer' 
                    ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                    : 'bg-stone-800 hover:bg-stone-900 text-white'
                }`}
              >
                {isRegistering ? 'Get OTP' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">One Time Password</label>
                  <div className="relative">
                     <KeyRound size={18} className="absolute left-3 top-3 text-stone-400" />
                     <input 
                        type="text" 
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="1234"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-primary-500 outline-none tracking-widest text-center text-xl font-mono"
                     />
                  </div>
                  <p className="text-xs text-stone-500 mt-2 text-center">Use code <span className="font-bold">1234</span> for testing</p>
               </div>

               <button 
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-bold shadow-md transition-colors bg-green-600 hover:bg-green-700 text-white"
              >
                Verify & {isRegistering ? 'Register' : 'Login'}
              </button>
              
              <button 
                 type="button" 
                 onClick={() => setShowOtp(false)}
                 className="w-full text-stone-500 text-sm hover:underline"
              >
                 Go Back
              </button>
            </form>
          )}

          {!showOtp && (
            <div className="mt-6 text-center text-sm text-stone-500">
              {isRegistering ? "Already have an account?" : t.notMember} 
              <button 
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }}
                className="ml-1 text-primary-600 font-bold hover:underline focus:outline-none"
              >
                {isRegistering ? t.signIn : t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
