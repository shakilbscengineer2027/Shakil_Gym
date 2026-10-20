import React from 'react';
import { X, Play, UserCheck, Scale, Timer, Shield, Dumbbell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sqliteDb } from '../../db/sqliteEngine';

export const QuickActionModal: React.FC = () => {
  const {
    isQuickActionOpen,
    setIsQuickActionOpen,
    workoutPlans,
    startRunningWorkout,
    profile,
    refreshData,
    showToast,
    setIsAdminMode,
    setActiveTab,
  } = useApp();

  if (!isQuickActionOpen) return null;

  const handleStartTodayWorkout = () => {
    setIsQuickActionOpen(false);
    const biceps = workoutPlans.find((p) => p.title.toLowerCase().includes('biceps')) || workoutPlans[0];
    if (biceps) {
      startRunningWorkout(biceps);
    }
  };

  const handleQuickCheckIn = () => {
    // Check in Michael Law (user_01 / mem_01)
    const res = sqliteDb.checkInMember('mem_01', 'Member self check-in via mobile quick action');
    refreshData();
    showToast(res.message, res.success ? 'success' : 'error');
    setIsQuickActionOpen(false);
  };

  const handleOpenProgress = () => {
    setIsQuickActionOpen(false);
    setActiveTab('progress');
  };

  const handleOpenAdmin = () => {
    setIsQuickActionOpen(false);
    setIsAdminMode(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#171717] border border-[#2B2B2B] rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#D4F52A] flex items-center justify-center text-black font-bold">
              <Dumbbell className="w-4 h-4 fill-black stroke-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Quick Actions</h3>
              <p className="text-[10px] text-[#888888]">Instant fitness & gym shortcuts</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickActionOpen(false)}
            className="w-7 h-7 rounded-full bg-[#242424] hover:bg-[#333333] flex items-center justify-center text-[#aaaaaa]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Start Scheduled Workout */}
          <button
            onClick={handleStartTodayWorkout}
            className="w-full flex items-center space-x-3.5 p-3.5 rounded-2xl bg-[#D4F52A] text-black font-bold text-left hover:bg-[#B8D923] transition-all active:scale-98 shadow-[0_0_20px_rgba(212,245,42,0.25)]"
          >
            <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
              <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-black/70 font-black">Featured Session</p>
              <h4 className="text-sm font-extrabold text-black">Start Today's Workout</h4>
              <p className="text-[10px] text-black/80 font-medium">Biceps Workout · 60 Min · 1900 Kcal</p>
            </div>
          </button>

          {/* Quick Gym Check-In */}
          <button
            onClick={handleQuickCheckIn}
            className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-[#242424] hover:bg-[#2e2e2e] text-white border border-[#333333] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-[#D4F52A]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Express Gym Check-In</h4>
              <p className="text-[10px] text-[#888888]">Log attendance for {profile.fullName}</p>
            </div>
          </button>

          {/* Log Weight & PR */}
          <button
            onClick={handleOpenProgress}
            className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-[#242424] hover:bg-[#2e2e2e] text-white border border-[#333333] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-[#A6E22E]">
              <Scale className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Log Weight & Measurements</h4>
              <p className="text-[10px] text-[#888888]">Current: {profile.weightKg} kg · View Trends</p>
            </div>
          </button>

          {/* Switch to Gym Management ERP */}
          <button
            onClick={handleOpenAdmin}
            className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-[#1d1d1d] hover:bg-[#252525] text-white border border-[#333333] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-[#FFB800]">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Gym Administration Portal</h4>
              <p className="text-[10px] text-[#888888]">Members, Billing, Attendance, Reports</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
