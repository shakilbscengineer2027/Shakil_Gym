import React from 'react';
import {
  Wifi,
  Battery,
  Smartphone,
  Maximize2,
  Shield,
  UserCheck,
  Flame,
  Home,
  Dumbbell,
  Calendar,
  TrendingUp,
  User,
  Bell,
  LogIn,
} from 'lucide-react';
import { useApp, TabType } from '../../context/AppContext';

export const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isPhoneFrame,
    setIsPhoneFrame,
    isAdminMode,
    setIsAdminMode,
    activeTab,
    setActiveTab,
    profile,
    currentUser,
    notifications,
    setIsQuickActionOpen,
    setIsAuthModalOpen,
    showToast,
  } = useApp();

  const navLinks: { tab: TabType; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { tab: 'workout', label: 'Workout', icon: <Dumbbell className="w-4 h-4" /> },
    { tab: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { tab: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col justify-start">
      {/* Universal Top Header / Responsive Control Bar */}
      <header className="sticky top-0 z-40 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#1f1f1f] px-4 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-2.5">
            <div
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('home');
              }}
              className="w-8 h-8 rounded-xl bg-[#D4F52A] flex items-center justify-center text-black font-black shadow-[0_0_12px_rgba(212,245,42,0.35)] cursor-pointer"
            >
              <Flame className="w-5 h-5 fill-black stroke-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider uppercase text-white">Shakil_Gym</span>
                <span className="hidden sm:inline-block text-[10px] bg-[#1a1a1a] text-[#D4F52A] px-2 py-0.5 rounded-full border border-[#2d2d2d] font-bold">
                  Offline SQLite Core
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-[#777777]">
                Shakil_Gym · Premium Fitness & Management System
              </p>
            </div>
          </div>

          {/* Desktop Responsive Navigation (hidden on mobile, visible on md+) */}
          {!isAdminMode && (
            <nav className="hidden md:flex items-center space-x-1 bg-[#141414] p-1 rounded-2xl border border-[#262626]">
              {navLinks.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#D4F52A] text-black shadow-sm'
                        : 'text-[#888888] hover:text-white hover:bg-[#1f1f1f]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Controls: Quick Button, Admin Mode, Simulator Toggle, Profile */}
          <div className="flex items-center space-x-2">
            {/* Quick Action Button for Desktop */}
            <button
              onClick={() => setIsQuickActionOpen(true)}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#D4F52A] hover:bg-[#B8D923] text-black font-extrabold text-xs transition-transform active:scale-95 shadow-[0_0_12px_rgba(212,245,42,0.25)]"
            >
              <Flame className="w-3.5 h-3.5 fill-black stroke-black" />
              <span>Quick Action</span>
            </button>

            {/* Member vs Admin Toggle */}
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isAdminMode
                  ? 'bg-[#D4F52A] text-black border-[#D4F52A] shadow-[0_0_12px_rgba(212,245,42,0.3)]'
                  : 'bg-[#181818] text-white border-[#333333] hover:border-[#555555]'
              }`}
            >
              {isAdminMode ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-black" />
                  <span>Admin Mode</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-[#D4F52A]" />
                  <span className="hidden sm:inline">Member View</span>
                  <span className="sm:hidden">App</span>
                </>
              )}
            </button>

            {/* Phone Frame Simulator Toggle */}
            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              title={isPhoneFrame ? 'Switch to Adaptive Responsive Mode' : 'Switch to iPhone 15 Pro Frame'}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-xs text-[#cccccc] border border-[#333333] transition-colors"
            >
              {isPhoneFrame ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#D4F52A]" />
                  <span className="hidden sm:inline">Responsive</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#D4F52A]" />
                  <span className="hidden sm:inline">Phone Frame</span>
                </>
              )}
            </button>

            {/* Login / Auth Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1d1d1d] hover:bg-[#282828] text-xs font-bold text-white border border-[#333333] transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D4F52A]" />
              <span className="hidden sm:inline">Sign In / Register</span>
              <span className="sm:hidden">Login</span>
            </button>

            {/* Notification & User Avatar */}
            <div className="flex items-center space-x-1.5 pl-1">
              <button
                onClick={() => showToast(`${unreadCount} unread gym notifications`, 'info')}
                className="relative w-8 h-8 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#333333] flex items-center justify-center text-white"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#D4F52A] rounded-full"></span>
                )}
              </button>
              <div
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-1.5 cursor-pointer bg-[#181818] hover:bg-[#222222] pl-1 pr-2.5 py-0.5 rounded-full border border-[#2d2d2d] transition-colors"
                title={`${profile.fullName} (${profile.authProvider || 'Email'}) · Click to Manage Account`}
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-[#D4F52A]"
                />
                <span className="hidden xl:inline text-xs font-bold text-white truncate max-w-[100px]">
                  {profile.fullName.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Area */}
      <main className="flex-1 w-full flex flex-col items-center justify-start p-2 sm:p-4 md:p-6">
        {isPhoneFrame ? (
          /* Simulated iPhone 15 Pro hardware frame (matching reference image mockup) */
          <div className="w-full max-w-[412px] my-auto">
            <div className="relative rounded-[48px] p-3 bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#111111] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.12)] border border-[#3a3a3a]">
              <div className="relative rounded-[40px] bg-[#080808] overflow-hidden border border-[#222222] min-h-[820px] flex flex-col">
                {/* iPhone Status Bar */}
                <div className="h-10 px-6 flex items-center justify-between text-xs text-white z-50 select-none pt-2">
                  <span className="font-semibold tracking-tight text-[13px]">9:41</span>
                  {/* Dynamic Island */}
                  <div className="w-24 h-5 bg-black rounded-full mx-auto relative flex items-center justify-end pr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111122] border border-[#222233]"></div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-white/90">
                    <div className="flex items-end space-x-0.5 h-3">
                      <div className="w-0.5 h-1.5 bg-white rounded-xs"></div>
                      <div className="w-0.5 h-2 bg-white rounded-xs"></div>
                      <div className="w-0.5 h-2.5 bg-white rounded-xs"></div>
                      <div className="w-0.5 h-3 bg-white rounded-xs"></div>
                    </div>
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4 fill-white" />
                  </div>
                </div>

                {/* Screen Content inside phone */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
                  {children}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Responsive Device Layout (Scales fluidly from mobile to tablet to 4K desktop) */
          <div className="w-full max-w-7xl mx-auto bg-[#080808] rounded-3xl border border-[#222222] overflow-hidden shadow-2xl flex flex-col min-h-[80vh]">
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
