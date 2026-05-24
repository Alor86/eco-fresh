import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [role, setRole] = useState<'consumer' | 'farmer'>('consumer');
  const [isSignUp, setIsSignUp] = useState(true);
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Farmer Specific States (shown on sign-up)
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  
  // Validation / Error states
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && !fullName.trim()) {
      setError('Please provide your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isSignUp && role === 'farmer' && !farmName.trim()) {
      setError('Please provide your Farm Name');
      return;
    }

    // Success response
    const mockUser: User = {
      id: 'usr_' + Date.now().toString(36),
      name: fullName.trim() || email.split('@')[0],
      email: email.trim(),
      role: role,
      farmDetails: role === 'farmer' ? {
        farmName: farmName.trim() || `${fullName || 'Harvest'} Pastures`,
        location: location.trim() || 'Verdant Valley, OR',
        story: story.trim() || 'Growing fresh organic food for our local community with absolute transparency.',
      } : undefined
    };

    onSuccess(mockUser);
  };

  // Pre-fill fields for easy evaluation and clicking
  const demoClick = (type: 'demo_consumer' | 'demo_farmer') => {
    if (type === 'demo_consumer') {
      setRole('consumer');
      setIsSignUp(false);
      setEmail('alex@example.com');
      setPassword('password123');
    } else {
      setRole('farmer');
      setIsSignUp(false);
      setEmail('silas@acresandoak.com');
      setPassword('password123');
    }
  };

  return (
    <div className="h-full w-full bg-brand-bg flex flex-col justify-between items-center font-sans antialiased text-on-background select-none overflow-y-auto scrollbar-none">
      
      {/* Auth Hero Section with dynamic image */}
      <div className="relative w-full h-[200px] overflow-hidden shadow-md flex-shrink-0">
        <img 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Lush agricultural harvest"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlRPU34iqRyt4SC1sSXyjmF0tQIiT2ngOXCeUY1pL-Glq-JvGun_VcNTlkSuuyv86D6OOS565WX6putJtCdsSfeHoIAiFf2-QA_ajEyhTTL1PiPl2-Ha47NTLE2ZTkI2hoQUVI62SlufR87aLX8LSelDEco25wBgGUquekwjanibcnqsTltrx7H5NEhcoxiufFM7URA4vfqFfkDKbDZhQuOmkABn-20qxcCCJO8iA-WXOVGipDcdHKNTpe7pDxa6p0fCNRpEU9wvq4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
        
        {/* Absolute header logo */}
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display font-extrabold text-[36px] tracking-tight text-white drop-shadow-md text-center"
            id="brand-header"
          >
            Harvest Direct
          </motion.h1>
          <p className="text-white/90 text-sm font-medium tracking-wide">TERRA DIRECT INITIATIVE</p>
        </div>
      </div>

      {/* Main interactive form card */}
      <main className="w-full bg-white shadow-xl flex-grow flex flex-col justify-between -mt-8 relative z-10 p-5 pb-8">
        
        {/* Intro */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-900 tracking-tight" id="join-harvest-heading">
            {isSignUp ? 'Join the Harvest' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isSignUp 
              ? 'Connect directly with local farmers and fresh produce.' 
              : 'Sign in to access your farm products or fresh food purchases.'}
          </p>
        </div>

        {/* Demo helpers */}
        <div className="mb-6 bg-green-50/70 border border-green-100 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-green-800 uppercase tracking-wider">Fast Demo Accounts:</span>
          <div className="flex gap-2">
            <button
              onClick={() => demoClick('demo_consumer')}
              id="demo-consumer-btn"
              className="flex-1 text-xs py-1.5 px-2 bg-white hover:bg-green-100 border border-green-200 rounded-lg font-medium text-green-800 shadow-sm transition-all"
            >
              Consumer (Demo)
            </button>
            <button
              onClick={() => demoClick('demo_farmer')}
              id="demo-farmer-btn"
              className="flex-1 text-xs py-1.5 px-2 bg-white hover:bg-green-100 border border-green-200 rounded-lg font-medium text-green-800 shadow-sm transition-all"
            >
              Farmer (Demo)
            </button>
          </div>
        </div>

        {/* Dynamic sliding Role Toggle */}
        <div className="relative bg-gray-100 p-1 rounded-full flex mb-6 h-11 items-center justify-between border border-gray-200">
          {/* Animated pills */}
          <div className="absolute top-1 bottom-1 left-1 right-1 pointer-events-none">
            <motion.div 
              layout 
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="h-full w-1/2 bg-brand-primary rounded-full shadow-sm"
              style={{
                marginLeft: role === 'farmer' ? '50%' : '0%'
              }}
            />
          </div>
          
          <button 
            type="button"
            id="role-consumer-toggle"
            onClick={() => setRole('consumer')}
            className={`relative z-10 w-1/2 text-center py-2 text-sm font-semibold transition-colors duration-200 ${
              role === 'consumer' ? 'text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Consumer
          </button>
          
          <button 
            type="button"
            id="role-farmer-toggle"
            onClick={() => setRole('farmer')}
            className={`relative z-10 w-1/2 text-center py-2 text-sm font-semibold transition-colors duration-200 ${
              role === 'farmer' ? 'text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Farmer
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium" id="auth-error">
            {error}
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col justify-start">
          <AnimatePresence mode="popLayout">
            {isSignUp && (
              <motion.div 
                key="name-input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide" htmlFor="fullname">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivers"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all outline-none text-[15px] text-gray-900 shadow-inner"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide" htmlFor="email-input">
              Email Address
            </label>
            <input 
              type="email" 
              id="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all outline-none text-[15px] text-gray-900 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide" htmlFor="password-input">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all outline-none text-[15px] text-gray-900 pr-12 shadow-inner"
              />
              <button 
                type="button"
                id="password-visibility-toggle"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary transition-colors flex items-center justify-center p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Dynamic Farmer Fields inside Sign Up */}
          <AnimatePresence mode="popLayout">
            {isSignUp && role === 'farmer' && (
              <motion.div
                key="farmer-fields"
                initial={{ opacity: 0, scale: 0.95, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 pt-3 border-t border-dashed border-gray-200 mt-2"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide" htmlFor="farm-name">
                    Farm Name
                  </label>
                  <input 
                    type="text" 
                    id="farm-name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Acres &amp; Oak Farm"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all outline-none text-[15px] text-gray-900 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide" htmlFor="farm-location">
                    Location (City, State)
                  </label>
                  <input 
                    type="text" 
                    id="farm-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hill Country, TX"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all outline-none text-[15px] text-gray-900 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide" htmlFor="farm-story">
                    Your Farm Story (Brief)
                  </label>
                  <textarea 
                    id="farm-story"
                    rows={2}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="How do you grow your food? What makes it transparent?"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 transition-all outline-none text-[15px] text-gray-900 resize-none shadow-inner"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-3">
            <button 
              type="submit"
              id="auth-submit-btn"
              className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3.5 rounded-full font-semibold text-[15px] shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0f5238 0%, #2d6a4f 100%)' }}
            >
              {isSignUp ? 'Create Account' : 'Sign In Now'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-[1px] bg-gray-200"></div>
          <span className="px-3 font-medium text-xs text-gray-400 uppercase tracking-wider">or continue with</span>
          <div className="flex-grow h-[1px] bg-gray-200"></div>
        </div>

        {/* Social SSO Row */}
        <div className="grid grid-cols-2 gap-3" id="social-sso-container">
          <button 
            onClick={() => {
              setFullName('Google User');
              setEmail('user@google.com');
              setPassword('google-sso-bypass');
              setError('');
              // Autologin
              setTimeout(() => {
                onSuccess({
                  id: 'google_user',
                  name: 'Alex Google',
                  email: 'user@google.com',
                  role: role,
                  farmDetails: role === 'farmer' ? {
                    farmName: 'Google Acres Farms',
                    location: 'Mountain View, CA',
                    story: 'Connected organically with cloud technology.',
                  } : undefined
                });
              }, 100);
            }}
            id="google-sso-btn"
            className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-3 hover:bg-gray-100 transition-colors active:scale-95 duration-100 cursor-pointer"
          >
            <img 
              alt="Google Icon" 
              className="w-[18px] h-[18px]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZhu_pjhwyjqGnBKzLlatmopk2_tO3FWM4C-caW4TXKomIyVBrXdUY1_KmOBWIT2Cm_blhkvPFbVaFavSJOeizdStTK6uiF05p6JvRwhgMv2wprQjqe8bwf6qhvdqxiDKbvL5ipjChMoIPXgafh9YUM2hxFKOEmKTlZpTzyU78GHNRJ8wZs1FSEmioWD6hiygtsPUl4_q9MTaZPXfYEAQDIB430UdhdXWLnTkS3Lbp0YKyI90GdUn-OmOU4RPvBLwDheS7Q6NTw6FU"
            />
            <span className="text-[14px] font-semibold text-gray-700">Google</span>
          </button>
          
          <button 
            onClick={() => {
              setFullName('Apple User');
              setEmail('user@apple.com');
              setPassword('apple-sso-bypass');
              setError('');
              setTimeout(() => {
                onSuccess({
                  id: 'apple_user',
                  name: 'Alex Apple',
                  email: 'user@apple.com',
                  role: role,
                  farmDetails: role === 'farmer' ? {
                    farmName: 'Sunset Apple Orchards',
                    location: 'Cupertino, CA',
                    story: 'Curated premium fruits from northern orchards.',
                  } : undefined
                });
              }, 100);
            }}
            id="apple-sso-btn"
            className="flex items-center justify-center gap-2 bg-black text-white rounded-full py-3 hover:bg-black/90 transition-all active:scale-95 duration-100 cursor-pointer"
          >
            {/* Simple minimalist Apple icon representation */}
            <span className="text-white text-xs font-mono font-bold"></span>
            <span className="text-[14px] font-semibold">Apple</span>
          </button>
        </div>

        {/* Form selection toggle footer */}
        <p className="mt-6 text-center text-sm font-medium text-gray-500" id="login-toggle-paragraph">
          {isSignUp ? 'Already have an account? ' : "Don't have an account yet? "}
          <button 
            type="button"
            id="is-signup-toggle-btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-brand-primary hover:text-brand-primary-hover font-bold hover:underline cursor-pointer ml-1"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>

        {/* Bottom trust badge */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-1 opacity-90 text-center" id="trust-badge-container">
          <div className="flex items-center gap-1.5 text-brand-primary font-bold text-xs uppercase tracking-wider">
            <ShieldCheck size={18} className="stroke-2 text-brand-primary" />
            <span>Secure Transparent Trade</span>
          </div>
          <p className="text-[11px] text-gray-400 max-w-[280px] leading-relaxed mt-1">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </div>

      </main>
    </div>
  );
}
