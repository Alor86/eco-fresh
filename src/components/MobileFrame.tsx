import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const isAmPm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // 12-hour format
      setTimeStr(`${hours}:${minutes} ${isAmPm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30); // update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8 md:p-10 transition-colors">
      
      {/* Decorative desktop ambient light aura */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-emerald-500/15 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-orange-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Main smartphone body mockup (only applies on screens sm: and wider) */}
      <div className="relative w-full max-w-sm sm:w-[380px] h-full sm:h-[750px] sm:max-h-[90vh] bg-[#161917] sm:rounded-[42px] sm:shadow-[0_0_0_6px_#272a28,0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transition-all duration-300 transform sm:border-2 sm:border-[#373a38]">
        
        {/* Physical hardware buttons representation on bezel */}
        <div className="absolute left-[-15px] top-[140px] w-[3px] h-[60px] bg-[#1f2220] rounded-l-md hidden sm:block" />
        <div className="absolute left-[-15px] top-[210px] w-[3px] h-[60px] bg-[#1f2220] rounded-l-md hidden sm:block" />
        <div className="absolute right-[-15px] top-[180px] w-[3px] h-[80px] bg-[#1f2220] rounded-r-md hidden sm:block" />

        {/* Dynamic Island Notch & Top Mobile Status bar */}
        <div className="relative z-50 bg-white/95 backdrop-blur-md px-6 pt-3 pb-1 flex justify-between items-center text-xs font-semibold text-gray-800 select-none border-b border-gray-100 flex-shrink-0">
          
          {/* Dynamic mobile clock */}
          <div className="flex items-center gap-1 font-sans text-xs select-none">
            <span className="font-bold tracking-tight text-gray-900">{timeStr}</span>
          </div>

          {/* Centered camera capsule (Dynamic Island) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 h-[24px] w-[100px] bg-black rounded-full flex items-center justify-center shadow-inner pointer-events-none">
            <div className="absolute right-3.5 w-2 h-2 rounded-full bg-slate-900 border border-slate-800/40" />
          </div>

          {/* Right aligned battery and connection status bar icons */}
          <div className="flex items-center gap-2 text-gray-900">
            <Signal size={13} className="stroke-[2.5]" />
            <Wifi size={13} className="stroke-[2.5]" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold">100%</span>
              <Battery size={15} className="stroke-[2.2] text-emerald-800 fill-emerald-700" />
            </div>
          </div>
        </div>

        {/* Outer scrolling content wrapper containing our dynamic React applets and system nav bar */}
        <div className="flex-grow overflow-hidden relative bg-brand-bg rounded-t-xl sm:rounded-b-[42px] flex flex-col">
          <div className="flex-grow overflow-hidden relative bg-brand-bg flex flex-col">
            {children}
          </div>
          
          {/* Android 3-Button Navigation Bar with Slimmer Bezels */}
          <div className="h-[38px] w-full bg-[#111312] border-t border-[#222523] flex items-center justify-around px-12 text-gray-500 select-none flex-shrink-0 z-50">
            {/* Back Button (Triangle/Chevron) */}
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('system-navigation', { detail: { action: 'back' } }));
              }}
              className="p-1.5 hover:text-white active:scale-75 transition-all flex items-center justify-center cursor-pointer"
              title="Back"
            >
              <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] fill-current">
                <polygon points="18,4 6,12 18,20" />
              </svg>
            </button>

            {/* Home Button (Circle) */}
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('system-navigation', { detail: { action: 'home' } }));
              }}
              className="p-1.5 hover:text-white active:scale-75 transition-all flex items-center justify-center cursor-pointer"
              title="Home"
            >
              <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current stroke-2 fill-none">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </button>

            {/* Recents Button (Square) */}
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('system-navigation', { detail: { action: 'recents' } }));
              }}
              className="p-1.5 hover:text-white active:scale-75 transition-all flex items-center justify-center cursor-pointer"
              title="Recent Apps"
            >
              <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] stroke-current stroke-2 fill-none">
                <rect x="5" y="5" width="14" height="14" rx="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
