import React from 'react';
import { Home, Dumbbell, Calendar, User, Flame } from 'lucide-react';
import { useApp, TabType } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickActionOpen, isPhoneFrame } = useApp();

  const navItems: { tab: TabType; label: string; icon: React.ReactNode }[] = [
    {
      tab: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5 stroke-[2]" />,
    },
    {
      tab: 'workout',
      label: 'Workout',
      icon: <Dumbbell className="w-5 h-5 stroke-[2]" />,
    },
    // Center button is handled separately
    {
      tab: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="w-5 h-5 stroke-[2]" />,
    },
    {
      tab: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5 stroke-[2]" />,
    },
  ];

  return (
    <div
      className={`relative bg-[#0d0d0d]/95 backdrop-blur-md border-t border-[#1f1f1f] px-4 pt-2 pb-5 z-40 select-none ${
        !isPhoneFrame ? 'md:hidden' : ''
      }`}
    >
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        {/* First two tabs */}
        <div className="flex items-center space-x-6">
          {navItems.slice(0, 2).map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-[#D4F52A]' : 'text-[#777777] hover:text-[#aaaaaa]'
                }`}
              >
                <div className="transition-transform active:scale-95">{item.icon}</div>
                <span className="text-[10px] font-semibold mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Floating Neon Lime Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={() => setIsQuickActionOpen(true)}
            aria-label="Quick Workout Action"
            className="w-13 h-13 rounded-full bg-[#D4F52A] active:bg-[#B8D923] text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,245,42,0.35)] transition-transform active:scale-90 hover:scale-105 border-4 border-[#080808]"
          >
            <Flame className="w-6 h-6 fill-black stroke-black" />
          </button>
          <span className="text-[10px] font-semibold text-[#888888] mt-0.5">Quick</span>
        </div>

        {/* Last two tabs */}
        <div className="flex items-center space-x-6">
          {navItems.slice(2, 4).map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-[#D4F52A]' : 'text-[#777777] hover:text-[#aaaaaa]'
                }`}
              >
                <div className="transition-transform active:scale-95">{item.icon}</div>
                <span className="text-[10px] font-semibold mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* iPhone Home Indicator bar */}
      <div className="w-32 h-1 bg-[#444444] rounded-full mx-auto mt-2 opacity-60"></div>
    </div>
  );
};
