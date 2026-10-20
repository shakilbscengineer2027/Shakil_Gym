import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Dumbbell, Clock, Flame, Play, X, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkoutPlan, FitnessLevel } from '../../types/database';
import { sqliteDb } from '../../db/sqliteEngine';

export const WorkoutScreen: React.FC = () => {
  const { workoutPlans, startRunningWorkout, setActiveTab, refreshData, showToast } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<FitnessLevel>('Advance');
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<WorkoutPlan | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // New plan form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Strength Training');
  const [newDuration, setNewDuration] = useState('45');
  const [newCalories, setNewCalories] = useState('380');
  const [newDescription, setNewDescription] = useState('');

  // Filter plans by selected fitness level
  const displayedPlans = workoutPlans.filter((p) => p.fitnessLevel === selectedLevel);
  const otherPlans = workoutPlans.filter((p) => p.fitnessLevel !== selectedLevel);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sqliteDb.saveWorkoutPlan({
      title: newTitle.trim(),
      category: newCategory,
      fitnessLevel: selectedLevel,
      durationMinutes: Number(newDuration) || 45,
      estimatedCalories: Number(newCalories) || 350,
      description: newDescription.trim() || 'Custom training program.',
      coverImageUrl:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      totalExercises: 4,
    });

    refreshData();
    setIsCreatingCustom(false);
    setNewTitle('');
    setNewDescription('');
    showToast('New workout plan added to SQLite!', 'success');
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sqliteDb.toggleWorkoutFavorite(id);
    refreshData();
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

        <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wide">Workout Library</h1>

        <button
          onClick={() => setIsCreatingCustom(true)}
          className="px-3.5 py-2 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#2B2B2B] flex items-center space-x-1.5 text-[#D4F52A] transition-colors text-xs font-bold"
          title="Create Custom Workout"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Plan</span>
        </button>
      </div>

      {/* 2. Fitness Level Selector & See All Link (Advance) */}
      <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{selectedLevel}</h2>
          <span className="text-xs text-[#888888] font-medium">Fitness Level Category</span>
        </div>

        {/* Level Switcher tabs */}
        <div className="flex items-center space-x-1.5 bg-[#171717] p-1.5 rounded-full border border-[#2B2B2B]">
          {(['Beginner', 'Intermediate', 'Advance'] as FitnessLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedLevel === level
                  ? 'bg-[#D4F52A] text-black shadow-sm'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Workout Cards Responsive Grid (Single column on mobile, 2-3 columns on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...displayedPlans, ...otherPlans].map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlanDetail(plan)}
            className="bg-[#171717] hover:bg-[#1d1d1d] border border-[#262626] rounded-2xl p-4 flex items-center space-x-4 cursor-pointer transition-all active:scale-99 group shadow-md"
          >
            {/* Left Thumbnail Image */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-[#222222] relative">
              <img
                src={plan.coverImageUrl}
                alt={plan.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={(e) => handleToggleFavorite(e, plan.id)}
                className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:text-[#D4F52A]"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    plan.isFavorite ? 'fill-[#D4F52A] text-[#D4F52A]' : 'text-white'
                  }`}
                />
              </button>
            </div>

            {/* Right Details */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-white truncate">{plan.title}</h3>
              </div>

              {/* Yellow/Lime Sessions Badge */}
              <div className="text-xs font-extrabold text-[#D4F52A]">
                {plan.totalExercises || 36} Sessions
              </div>

              {/* Description */}
              <p className="text-xs text-[#999999] line-clamp-2 leading-relaxed">
                {plan.description}
              </p>

              <div className="flex items-center space-x-3 text-[11px] text-[#777777] pt-1">
                <span>{plan.durationMinutes} Min</span>
                <span>•</span>
                <span>{plan.estimatedCalories} Kcal</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Workout Plan Details Modal */}
      {selectedPlanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[88vh] shadow-2xl">
            {/* Image Header */}
            <div className="relative aspect-video bg-[#111111]">
              <img
                src={selectedPlanDetail.coverImageUrl}
                alt={selectedPlanDetail.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPlanDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-[#D4F52A] border border-[#333333]">
                {selectedPlanDetail.fitnessLevel} · {selectedPlanDetail.category}
              </div>
            </div>

            {/* Details Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <h2 className="text-xl font-black text-white">{selectedPlanDetail.title}</h2>
                <p className="text-xs text-[#aaaaaa] mt-1">{selectedPlanDetail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#202020] p-3.5 rounded-2xl border border-[#2B2B2B]">
                <div className="flex items-center space-x-2 text-xs text-[#dddddd]">
                  <Clock className="w-4 h-4 text-[#D4F52A]" />
                  <span>{selectedPlanDetail.durationMinutes} Min</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-[#dddddd]">
                  <Flame className="w-4 h-4 text-[#D4F52A]" />
                  <span>{selectedPlanDetail.estimatedCalories} Kcal</span>
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  Routine Exercises ({selectedPlanDetail.exercises?.length || 3})
                </h4>
                <div className="space-y-2">
                  {(selectedPlanDetail.exercises || []).map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="flex items-center justify-between p-3 bg-[#202020] rounded-xl border border-[#2B2B2B]"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-[#D4F52A] text-black font-extrabold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">{ex.exerciseTitle}</p>
                          <p className="text-[10px] text-[#888888]">
                            {ex.sets} Sets · {ex.reps}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Workout Button */}
              <button
                onClick={() => {
                  const plan = selectedPlanDetail;
                  setSelectedPlanDetail(null);
                  startRunningWorkout(plan);
                }}
                className="w-full py-4 rounded-2xl bg-[#D4F52A] hover:bg-[#B8D923] text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(212,245,42,0.3)] transition-transform active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black stroke-black" />
                <span>Start Workout Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Custom Plan Modal */}
      {isCreatingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-3">
              <h3 className="text-base font-bold text-white">Create Custom Plan</h3>
              <button onClick={() => setIsCreatingCustom(false)} className="text-[#888888] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Plan Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Explosive Upper Body"
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1 font-semibold">Duration (Min)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] mb-1 font-semibold">Calories Burn</label>
                  <input
                    type="number"
                    value={newCalories}
                    onChange={(e) => setNewCalories(e.target.value)}
                    className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Focus points, target muscles..."
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#B8D923] transition-colors"
              >
                Save Plan to Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
