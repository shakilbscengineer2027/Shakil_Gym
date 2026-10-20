import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Scale,
  Calendar,
  Flame,
  Plus,
  Trophy,
  ChevronLeft,
  X,
  Clock,
  Target,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sqliteDb } from '../../db/sqliteEngine';

export const ProgressScreen: React.FC = () => {
  const { profile, setActiveTab, refreshData, showToast } = useApp();

  const [timeframe, setTimeframe] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [isLoggingPr, setIsLoggingPr] = useState(false);

  // Form states
  const [weightInput, setWeightInput] = useState(String(profile.weightKg || 78.5));
  const [bodyFatInput, setBodyFatInput] = useState('14');
  const [prExercise, setPrExercise] = useState('Barbell Deadlift');
  const [prValue, setPrValue] = useState('185');

  const measurements = sqliteDb.getBodyMeasurements();
  const personalRecords = sqliteDb.getPersonalRecords();
  const goals = sqliteDb.getGoals();
  const sessions = sqliteDb.getWorkoutSessions();

  const weeklyDays = [
    { day: 'Mon', mins: 65, active: true },
    { day: 'Tue', mins: 60, active: true },
    { day: 'Wed', mins: 0, active: false },
    { day: 'Thu', mins: 50, active: true },
    { day: 'Fri', mins: 45, active: true },
    { day: 'Sat', mins: 75, active: true },
    { day: 'Sun', mins: 45, active: true },
  ];

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    sqliteDb.logBodyMeasurement({
      weightKg: Number(weightInput),
      bodyFatPercent: Number(bodyFatInput) || undefined,
    });
    refreshData();
    setIsLoggingWeight(false);
    showToast(`Logged body weight: ${weightInput} kg`, 'success');
  };

  const handleSavePr = (e: React.FormEvent) => {
    e.preventDefault();
    sqliteDb.logPersonalRecord({
      exerciseTitle: prExercise,
      recordType: '1RM',
      value: Number(prValue),
      unit: 'kg',
    });
    refreshData();
    setIsLoggingPr(false);
    showToast(`New personal record recorded for ${prExercise}!`, 'success');
  };

  return (
    <div className="flex-1 bg-[#080808] text-white p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 rounded-full bg-[#171717] hover:bg-[#222222] border border-[#2B2B2B] flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wide">Progress & Analytics</h1>

        <button
          onClick={() => setIsLoggingWeight(true)}
          className="px-3.5 py-2 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#2B2B2B] flex items-center space-x-1.5 text-[#D4F52A] transition-colors text-xs font-bold"
          title="Log Weight"
        >
          <Scale className="w-4 h-4" />
          <span className="hidden sm:inline">Log Weight</span>
        </button>
      </div>

      {/* 2. Responsive 2-Column Grid on Tablet/Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Stat KPIs & Activity Bar Chart */}
        <div className="lg:col-span-7 space-y-5">
          {/* Key High-Level Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 text-center">
              <span className="text-xs text-[#888888] font-bold block uppercase">Streak</span>
              <span className="text-xl md:text-2xl font-black text-[#D4F52A] flex items-center justify-center gap-1.5 my-1">
                <Flame className="w-5 h-5 fill-[#D4F52A]" />
                {profile.streakDays}d
              </span>
              <span className="text-[10px] text-[#666666]">Best: 21 days</span>
            </div>

            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 text-center">
              <span className="text-xs text-[#888888] font-bold block uppercase">Total Time</span>
              <span className="text-xl md:text-2xl font-black text-white my-1 block">5h 40m</span>
              <span className="text-[10px] text-[#A6E22E]">+12% vs last wk</span>
            </div>

            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 text-center">
              <span className="text-xs text-[#888888] font-bold block uppercase">Weight</span>
              <span className="text-xl md:text-2xl font-black text-white my-1 block">{profile.weightKg} kg</span>
              <span className="text-[10px] text-[#888888]">Target: 77.0 kg</span>
            </div>
          </div>

          {/* Workout Volume Chart */}
          <div className="bg-[#171717] border border-[#262626] rounded-3xl p-5 md:p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Workout Activity</h3>
                <p className="text-xs text-[#888888]">Minutes trained per session</p>
              </div>
              <div className="flex items-center space-x-1 bg-[#202020] p-1 rounded-full border border-[#2e2e2e]">
                {(['Weekly', 'Monthly'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      timeframe === t ? 'bg-[#D4F52A] text-black shadow-xs' : 'text-[#888888]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar chart visualisation */}
            <div className="h-44 flex items-end justify-between pt-4 px-2">
              {weeklyDays.map((item) => {
                const heightPercent = Math.min(100, Math.round((item.mins / 75) * 100));
                return (
                  <div key={item.day} className="flex flex-col items-center flex-1 space-y-2">
                    <span className="text-[10px] font-mono text-[#888888]">
                      {item.mins > 0 ? `${item.mins}m` : '-'}
                    </span>
                    <div className="w-7 sm:w-10 bg-[#262626] rounded-full h-28 flex items-end overflow-hidden p-0.5">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-full transition-all duration-500 ${
                          item.mins >= 60
                            ? 'bg-[#D4F52A] shadow-[0_0_10px_rgba(212,245,42,0.4)]'
                            : item.mins > 0
                            ? 'bg-[#a3c91e]'
                            : 'bg-transparent'
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-[#aaaaaa]">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Personal Records & Active Targets */}
        <div className="lg:col-span-5 space-y-5">
          {/* Personal Records (PRs) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#888888] tracking-wider uppercase flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#D4F52A]" />
                <span>Personal Records</span>
              </h3>
              <button
                onClick={() => setIsLoggingPr(true)}
                className="text-xs font-bold text-[#D4F52A] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add PR</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {personalRecords.slice(0, 4).map((pr) => (
                <div
                  key={pr.id}
                  className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#888888]">
                    <span>{pr.recordType}</span>
                    <span className="text-[#666666]">{pr.achievedDate.slice(5)}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{pr.exerciseTitle}</h4>
                  <div className="text-lg font-black text-[#D4F52A]">
                    {pr.value} <span className="text-xs font-normal text-white">{pr.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fitness Goals Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#888888] tracking-wider uppercase flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#D4F52A]" />
              <span>Active Fitness Targets</span>
            </h3>

            <div className="space-y-2.5">
              {goals.map((g) => {
                const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                return (
                  <div
                    key={g.id}
                    className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-white">{g.title}</span>
                      <span className="font-mono text-[#D4F52A] font-extrabold">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#252525] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-[#D4F52A] rounded-full transition-all"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Log Weight Modal */}
      {isLoggingWeight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-2">
              <h3 className="text-base font-bold text-white">Log Body Weight</h3>
              <button onClick={() => setIsLoggingWeight(false)} className="text-[#888888] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveWeight} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-center text-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Body Fat % (optional)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatInput}
                  onChange={(e) => setBodyFatInput(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-center text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#B8D923] transition-colors"
              >
                Save Measurement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Log PR Modal */}
      {isLoggingPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-2">
              <h3 className="text-base font-bold text-white">Log Personal Record</h3>
              <button onClick={() => setIsLoggingPr(false)} className="text-[#888888] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePr} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={prExercise}
                  onChange={(e) => setPrExercise(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Weight Lifted (kg)</label>
                <input
                  type="number"
                  required
                  value={prValue}
                  onChange={(e) => setPrValue(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-center text-xl font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#B8D923] transition-colors"
              >
                Record PR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
