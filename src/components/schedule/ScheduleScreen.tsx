import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Hourglass, CheckCircle2, Clock, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sqliteDb } from '../../db/sqliteEngine';

export const ScheduleScreen: React.FC = () => {
  const { scheduledWorkouts, workoutPlans, startRunningWorkout, setActiveTab, refreshData, showToast } =
    useApp();

  // Reference image shows Tue 30 Jun as selected
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-06-30');

  // Days strip matching reference screenshot
  const weekDays = [
    { dayName: 'Mon', dayNum: '29', month: 'Jun', dateStr: '2026-06-29' },
    { dayName: 'Tue', dayNum: '30', month: 'Jun', dateStr: '2026-06-30' },
    { dayName: 'Wed', dayNum: '1', month: 'Jul', dateStr: '2026-07-01' },
    { dayName: 'Thu', dayNum: '2', month: 'Jul', dateStr: '2026-07-02' },
    { dayName: 'Fri', dayNum: '3', month: 'Jul', dateStr: '2026-07-03' },
    { dayName: 'Sat', dayNum: '4', month: 'Jul', dateStr: '2026-07-04' },
    { dayName: 'Sun', dayNum: '5', month: 'Jul', dateStr: '2026-07-05' },
  ];

  // Current day scheduled session
  const currentSched =
    scheduledWorkouts.find((s) => s.dateStr === selectedDateStr) || scheduledWorkouts[0];

  const handleToggleExercise = (exIndex: number) => {
    if (!currentSched) return;
    const newState = sqliteDb.toggleExerciseScheduledComplete(currentSched.id, exIndex);
    refreshData();
    showToast(
      newState ? 'Marked exercise as Completed!' : 'Marked exercise as Upcoming',
      'info'
    );
  };

  const handleStartWorkout = () => {
    if (!currentSched) return;
    const matchingPlan =
      workoutPlans.find((p) => p.id === currentSched.workoutPlanId) ||
      workoutPlans.find((p) => p.title === currentSched.workoutTitle) ||
      workoutPlans[0];
    if (matchingPlan) {
      startRunningWorkout(matchingPlan);
    }
  };

  return (
    <div className="flex-1 bg-[#080808] text-white p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* 1. Header Bar: Back Button & Center Title */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 rounded-full bg-[#171717] hover:bg-[#222222] border border-[#2B2B2B] flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wide">Workout Schedule</h1>

        <div className="w-10 h-10"></div>
      </div>

      {/* Responsive 2-column layout on desktop/tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Date Selector & Today's Focus Card */}
        <div className="lg:col-span-6 space-y-5">
          {/* Workout Plan / Track, train, and improve / See All > */}
          <div className="flex items-end justify-between pt-1">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Workout Plan</h2>
              <p className="text-xs text-[#888888] font-medium">Track, train, and improve</p>
            </div>

            <button
              onClick={() => showToast('Full calendar schedule loaded', 'info')}
              className="text-xs font-bold text-[#D4F52A] hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Weekly Date Selector (Tue 30 Jun highlighted in lime) */}
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
            {weekDays.map((d) => {
              const isSelected = selectedDateStr === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDateStr(d.dateStr)}
                  className={`flex flex-col items-center justify-center py-3 px-3.5 rounded-2xl min-w-[54px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4F52A] text-black font-extrabold shadow-[0_0_15px_rgba(212,245,42,0.35)] scale-105'
                      : 'bg-[#171717] text-white border border-[#2B2B2B] hover:border-[#444444]'
                  }`}
                >
                  <span
                    className={`text-[10px] font-semibold uppercase ${
                      isSelected ? 'text-black/80 font-bold' : 'text-[#888888]'
                    }`}
                  >
                    {d.dayName}
                  </span>
                  <span className={`text-base font-black my-0.5 ${isSelected ? 'text-black' : 'text-white'}`}>
                    {d.dayNum}
                  </span>
                  <span
                    className={`text-[9px] font-semibold ${
                      isSelected ? 'text-black/75' : 'text-[#777777]'
                    }`}
                  >
                    {d.month}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Today's Focus Card (Biceps Workout with lime pill button) */}
          {currentSched && (
            <div className="bg-[#171717] border border-[#262626] rounded-3xl p-5 md:p-6 flex items-center justify-between shadow-xl">
              {/* Left Details */}
              <div className="space-y-2.5 max-w-[58%]">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#D4F52A]">
                  <span className="w-2 h-2 rounded-full bg-[#D4F52A]"></span>
                  <span>Today's Focus</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {currentSched.workoutTitle}
                </h3>

                {/* Calories & Duration Stats */}
                <div className="flex items-center space-x-3.5 text-xs text-[#999999] pt-0.5">
                  <div className="flex items-center space-x-1.5">
                    <Flame className="w-4 h-4 text-[#D4F52A] fill-[#D4F52A]" />
                    <span className="text-white font-bold text-sm">{currentSched.estimatedCalories}</span>
                    <span className="text-[10px]">Kcal</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Hourglass className="w-4 h-4 text-[#D4F52A]" />
                    <span className="text-white font-bold text-sm">{currentSched.durationMinutes}</span>
                    <span className="text-[10px]">Min</span>
                  </div>
                </div>

                {/* Start Workout Button (Neon Lime Pill) */}
                <div className="pt-2">
                  <button
                    onClick={handleStartWorkout}
                    className="px-5 py-2.5 rounded-full bg-[#D4F52A] hover:bg-[#B8D923] text-black font-extrabold text-xs sm:text-sm flex items-center space-x-1.5 shadow-[0_0_15px_rgba(212,245,42,0.3)] transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Start Workout</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Right Athlete Image */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 bg-[#222222]">
                <img
                  src={currentSched.coverImageUrl}
                  alt={currentSched.workoutTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Today's Plan & Weekly Progress Tracker */}
        <div className="lg:col-span-6 space-y-5">
          {/* Today's Plan Header & Exercise Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-extrabold text-white">Today's Plan</h3>
              <span className="text-xs font-bold text-[#888888]">See All</span>
            </div>

            {/* Exercise Items List (1: Barbell Curl, 2: Hammer Curl, 3: Preacher Curl) */}
            <div className="space-y-3">
              {(currentSched?.exercises || []).map((ex, idx) => {
                const isCompleted = ex.isCompleted;
                return (
                  <div
                    key={ex.id || idx}
                    onClick={() => handleToggleExercise(idx)}
                    className="bg-[#171717] hover:bg-[#1f1f1f] border border-[#262626] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all active:scale-99 shadow-xs"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Exercise Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#222222]">
                        <img src={ex.imageUrl} alt={ex.exerciseTitle} className="w-full h-full object-cover" />
                      </div>

                      {/* Number Badge */}
                      <span className="w-6 h-6 rounded-full bg-[#D4F52A] text-black font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Title & Sets/Reps */}
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate">{ex.exerciseTitle}</h4>
                        <p className="text-[11px] text-[#888888] mt-0.5">
                          {ex.sets} Sets · {ex.reps}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill Badge: Green Completed vs Gray Upcoming */}
                    <div className="shrink-0 pl-3">
                      {isCompleted ? (
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1e3a17] border border-[#326926] text-[#A6E22E] text-xs font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Completed</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5 opacity-60" />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#242424] border border-[#333333] text-[#999999] text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Upcoming</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5 opacity-60" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Progress Card (3 of 6 Workouts) */}
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">Weekly Progress</span>
              </div>
              <span className="text-sm font-bold text-[#D4F52A]">3 of 6 Workouts</span>
            </div>

            {/* Progress Bar in Neon Lime */}
            <div className="w-full h-2.5 bg-[#262626] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4F52A] rounded-full shadow-[0_0_8px_rgba(212,245,42,0.5)] transition-all duration-500"
                style={{ width: '50%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
