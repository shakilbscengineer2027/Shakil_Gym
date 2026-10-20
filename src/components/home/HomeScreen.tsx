import React, { useState } from 'react';
import {
  Bell,
  Search,
  SlidersHorizontal,
  Dumbbell,
  Flame,
  Zap,
  Activity,
  Heart,
  Gauge,
  MessageSquare,
  Play,
  CheckCircle,
  Calendar,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CircularProgress } from '../common/CircularProgress';

export const HomeScreen: React.FC = () => {
  const {
    profile,
    workoutPlans,
    startRunningWorkout,
    setIsCoachModalOpen,
    setIsAuthModalOpen,
    notifications,
    showToast,
    setActiveTab,
  } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Strength');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const popularCategories = [
    { id: 'Strength', label: 'Strength', icon: <Dumbbell className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'Fat Loss', label: 'Fat Loss', icon: <Flame className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'Cardio', label: 'Cardio', icon: <Zap className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'Stretch', label: 'Stretch', icon: <Activity className="w-4 h-4 stroke-[2.5]" /> },
  ];

  // Today's featured workout: Biceps Workout (matches reference)
  const todaysWorkout =
    workoutPlans.find((p) => p.title.toLowerCase().includes('biceps')) || workoutPlans[0];

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex-1 bg-[#080808] text-white p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* 1. Top Header: Avatar, Welcome Back, Name & Notification Bell */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#2B2B2B]"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#A6E22E] rounded-full ring-2 ring-[#080808]"></span>
          </div>
          <div>
            <span className="text-xs text-[#999999] block font-medium">Welcome Back!</span>
            <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight">{profile.fullName}</h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-full bg-[#171717] hover:bg-[#222222] border border-[#2B2B2B] text-xs font-bold text-white transition-colors cursor-pointer"
            title="Sign In or Switch Account"
          >
            <LogIn className="w-3.5 h-3.5 text-[#D4F52A]" />
            <span className="hidden sm:inline">Account</span>
          </button>

          <button
            onClick={() => showToast(`${unreadNotificationsCount} unread gym notifications`, 'info')}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full bg-[#171717] hover:bg-[#222222] border border-[#2B2B2B] flex items-center justify-center text-white transition-colors"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#D4F52A] rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Responsive Grid Layout: Single column on mobile, 2-column on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* LEFT COLUMN: Search, Popular Plans, Health Grade & Trainer */}
        <div className="lg:col-span-7 space-y-5">
          {/* Search Field with Filter Action */}
          <div className="flex items-center space-x-2.5 bg-[#171717] border border-[#2B2B2B] rounded-2xl px-4 py-3">
            <Search className="w-4 h-4 text-[#777777] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your workouts..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-[#777777] focus:outline-hidden"
            />
            <button
              onClick={() => showToast('Filters: All levels & equipment active', 'info')}
              className="text-[#999999] hover:text-[#D4F52A] transition-colors p-1"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Popular Plans Filter Tabs */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-semibold text-[#888888] tracking-wider uppercase">Popular Plans</h2>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {popularCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4F52A] text-black shadow-[0_0_15px_rgba(212,245,42,0.3)]'
                        : 'bg-[#171717] text-[#999999] hover:text-white border border-[#2B2B2B]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Grade Card (Vibrant Neon Lime, Exactly Matching Reference) */}
          <div className="bg-[#D4F52A] rounded-3xl p-6 text-black flex items-center justify-between shadow-[0_10px_30px_rgba(212,245,42,0.22)]">
            <div className="max-w-[62%] space-y-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-black">Health Grade</h2>
              <p className="text-xs sm:text-sm text-black/85 leading-snug font-medium">
                Your fitness journey is on track. Stay consistent to achieve even better results.
              </p>
            </div>
            <div className="shrink-0">
              <CircularProgress
                percentage={profile.healthGradePercent || 85}
                size={96}
                strokeWidth={8}
                trackColor="#b3d41f"
                strokeColor="#080808"
                textColor="text-black font-black"
                fontSize="text-2xl font-black"
              />
            </div>
          </div>

          {/* Trainer Card with Coach Narez & Feedback Trigger */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#888888] tracking-wider uppercase">Trainer</h3>
            <div
              onClick={() => setIsCoachModalOpen(true)}
              className="bg-[#171717] hover:bg-[#1f1f1f] border border-[#262626] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors active:scale-99"
            >
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <img
                    src={profile.coachAvatarUrl}
                    alt={profile.coachName}
                    className="w-12 h-12 rounded-full object-cover border border-[#333333]"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#A6E22E] rounded-full ring-2 ring-[#171717]"></span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{profile.coachName}</h4>
                  <p className="text-xs text-[#888888] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4F52A]"></span>
                    {profile.coachFeedback ? 'New Feedback Available' : 'Online Coach'}
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-[#D4F52A] text-black flex items-center justify-center shadow-[0_0_12px_rgba(212,245,42,0.3)]">
                <MessageSquare className="w-5 h-5 fill-black stroke-black" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Metrics, Today's Workout, & Weekly Schedule shortcut */}
        <div className="lg:col-span-5 space-y-5">
          {/* Heart Rate & Workout Time Metric Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Heart Rate Card */}
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#888888]">Heart Rate</span>
                <div className="w-7 h-7 rounded-full bg-[#D4F52A]/15 flex items-center justify-center text-[#D4F52A]">
                  <Heart className="w-4 h-4 fill-[#D4F52A]" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-white">{profile.heartRateBpm || 120}</span>
                  <span className="text-xs font-bold text-[#888888]">BPM</span>
                </div>
              </div>
            </div>

            {/* Workout Time Card */}
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#888888]">Workout Time</span>
                <div className="w-7 h-7 rounded-full bg-[#D4F52A]/15 flex items-center justify-center text-[#D4F52A]">
                  <Gauge className="w-4 h-4 text-[#D4F52A]" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-white">5h 40m</span>
                  <span className="text-[10px] font-medium text-[#888888]">this week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Workout Card (Biceps Workout) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#888888] tracking-wider uppercase">Today's Workout</h3>
              <button
                onClick={() => setActiveTab('workout')}
                className="text-[11px] font-bold text-[#D4F52A] hover:underline"
              >
                View Library
              </button>
            </div>

            <div
              onClick={() => todaysWorkout && startRunningWorkout(todaysWorkout)}
              className="relative bg-[#171717] hover:bg-[#1c1c1c] border border-[#262626] rounded-3xl overflow-hidden cursor-pointer transition-all active:scale-99 group shadow-xl"
            >
              <div className="p-5 flex items-center justify-between">
                {/* Left Info */}
                <div className="space-y-2.5 max-w-[55%]">
                  <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-[#A6E22E] bg-[#1a2e14] px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A6E22E]"></span>
                    <span>Mid-Level</span>
                  </div>
                  <h4 className="text-lg md:text-xl font-extrabold text-white leading-tight">
                    {todaysWorkout?.title || 'Biceps Workout'}
                  </h4>

                  <p className="text-xs text-[#888888]">60 Min · 1900 Kcal</p>

                  {/* Play Action Circle */}
                  <div className="pt-2">
                    <div className="w-11 h-11 rounded-full bg-[#242424] group-hover:bg-[#D4F52A] group-hover:text-black text-white flex items-center justify-center transition-colors border border-[#333333] shadow-md">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Right Athlete Image */}
                <div className="w-36 h-36 rounded-2xl overflow-hidden shrink-0 bg-[#222222]">
                  <img
                    src={todaysWorkout?.coverImageUrl || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80'}
                    alt="Workout Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Schedule Mini Shortcut on desktop */}
          <div className="hidden sm:block bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D4F52A]" />
                <span>Next Scheduled Session</span>
              </span>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-bold text-[#D4F52A] hover:underline"
              >
                Open Schedule &gt;
              </button>
            </div>
            <p className="text-xs text-[#888888]">
              Tue 30 Jun · Barbell, Hammer, and Preacher Curl routine (3 of 6 completed this week)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
