import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Check, Timer, Flame, Award, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { sqliteDb } from '../../db/sqliteEngine';
import { WorkoutPlanExercise } from '../../types/database';

export const WorkoutPlayerModal: React.FC = () => {
  const { activeRunningWorkout, stopRunningWorkout, showToast, refreshData } = useApp();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Rest Timer
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Logs
  const [weightInput, setWeightInput] = useState<string>('25');
  const [repsInput, setRepsInput] = useState<string>('12');
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  // Synthesize clean audio beep
  const playBeep = (freq = 880, duration = 0.2) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio not permitted or supported
    }
  };

  // Workout Timer
  useEffect(() => {
    if (!activeRunningWorkout || isFinished) return;
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeRunningWorkout, isTimerRunning, isFinished]);

  // Rest Timer Countdown
  useEffect(() => {
    if (!isRestTimerActive || restSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRestTimerActive(false);
          playBeep(1200, 0.4);
          return 0;
        }
        if (prev <= 4) {
          playBeep(600, 0.1);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestTimerActive, restSecondsLeft]);

  if (!activeRunningWorkout) return null;

  const exercises = activeRunningWorkout.exercises && activeRunningWorkout.exercises.length > 0
    ? activeRunningWorkout.exercises
    : [
        {
          id: 'def_1',
          exerciseId: 'ex_1',
          exerciseTitle: activeRunningWorkout.title,
          targetMuscle: 'Full Body',
          imageUrl: activeRunningWorkout.coverImageUrl,
          orderIndex: 1,
          sets: 4,
          reps: '10-12 Reps',
          restSec: 60,
        },
      ];

  const currentExercise: WorkoutPlanExercise = exercises[currentExerciseIndex] || exercises[0];
  const totalSets = currentExercise.sets || 4;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    const key = `${currentExercise.id}_set_${currentSetIndex}`;
    setCompletedSets((prev) => ({ ...prev, [key]: Number(weightInput) || 0 }));
    playBeep(950, 0.15);

    if (currentSetIndex < totalSets) {
      setCurrentSetIndex((prev) => prev + 1);
      // Trigger rest timer
      setRestSecondsLeft(currentExercise.restSec || 60);
      setIsRestTimerActive(true);
    } else {
      // Last set of exercise
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSetIndex(1);
        setRestSecondsLeft(currentExercise.restSec || 60);
        setIsRestTimerActive(true);
        showToast(`Exercise completed! Moving to next`, 'success');
      } else {
        handleFinishWorkout();
      }
    }
  };

  const handleFinishWorkout = () => {
    setIsFinished(true);
    setIsTimerRunning(false);
    setIsRestTimerActive(false);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4F52A', '#A6E22E', '#ffffff', '#FF5C5C'],
      });
    } catch {
      // Confetti fallback
    }

    const durationMin = Math.max(1, Math.round(elapsedSeconds / 60));
    const estimatedBurn = Math.round(durationMin * 8.5);

    // Save to SQLite
    sqliteDb.recordCompletedWorkoutSession({
      workoutPlanId: activeRunningWorkout.id,
      workoutTitle: activeRunningWorkout.title,
      category: activeRunningWorkout.category,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: durationMin,
      caloriesBurned: estimatedBurn,
      completionRatePercent: 100,
      notes: `Completed all ${exercises.length} exercises cleanly with great tempo!`,
      exercisesLogged: exercises.map((ex, i) => ({
        id: `log_${i}`,
        exerciseId: ex.exerciseId,
        exerciseTitle: ex.exerciseTitle,
        setNumber: ex.sets,
        repsCompleted: 12,
        weightUsedKg: Number(weightInput) || 25,
        restSec: ex.restSec,
      })),
    });

    refreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh] shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        {/* Top Workout Status Bar */}
        <div className="flex items-center justify-between p-4 bg-[#171717] border-b border-[#222222]">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4F52A] animate-pulse"></div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#D4F52A]">
                {activeRunningWorkout.title}
              </h3>
              <p className="text-[10px] text-[#888888] font-mono">
                Elapsed: <span className="text-white font-bold">{formatTime(elapsedSeconds)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-full bg-[#242424] text-[#888888] hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#D4F52A]" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1.5 rounded-full bg-[#242424] text-[#888888] hover:text-white"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
            <button
              onClick={stopRunningWorkout}
              className="p-1.5 rounded-full bg-[#242424] text-[#888888] hover:text-[#FF5C5C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isFinished ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Exercise Image Card */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#1a1a1a] border border-[#2B2B2B]">
              <img
                src={currentExercise.imageUrl || activeRunningWorkout.coverImageUrl}
                alt={currentExercise.exerciseTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4F52A]">
                  Exercise {currentExerciseIndex + 1} of {exercises.length}
                </span>
                <h2 className="text-lg font-black text-white">{currentExercise.exerciseTitle}</h2>
                <p className="text-xs text-[#bbbbbb]">{currentExercise.targetMuscle}</p>
              </div>
            </div>

            {/* Set & Reps Tracker */}
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-full bg-[#D4F52A] text-black font-extrabold text-xs flex items-center justify-center">
                    {currentSetIndex}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Set {currentSetIndex} of {totalSets}
                    </h4>
                    <p className="text-[10px] text-[#888888]">Target: {currentExercise.reps || '10-12 Reps'}</p>
                  </div>
                </div>

                {/* Rest indicator badge */}
                {isRestTimerActive && (
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#D4F52A]/15 border border-[#D4F52A]/30 text-[#D4F52A] text-xs font-mono font-bold animate-pulse">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Rest: {restSecondsLeft}s</span>
                  </div>
                )}
              </div>

              {/* Set Weight & Reps Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-semibold text-[#888888] block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full bg-[#242424] border border-[#333333] rounded-xl px-3 py-2 text-white font-bold text-center text-sm focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#888888] block mb-1">Reps Performed</label>
                  <input
                    type="number"
                    value={repsInput}
                    onChange={(e) => setRepsInput(e.target.value)}
                    className="w-full bg-[#242424] border border-[#333333] rounded-xl px-3 py-2 text-white font-bold text-center text-sm focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
              </div>

              {/* Check / Complete Set Button */}
              <button
                onClick={handleCompleteSet}
                className="w-full py-3 rounded-xl bg-[#D4F52A] hover:bg-[#B8D923] text-black font-extrabold text-sm flex items-center justify-center space-x-2 transition-transform active:scale-98 shadow-[0_0_15px_rgba(212,245,42,0.3)]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Log Set & Start Rest</span>
              </button>
            </div>

            {/* Exercise Navigation Controls */}
            <div className="flex items-center justify-between space-x-2">
              <button
                disabled={currentExerciseIndex === 0}
                onClick={() => {
                  setCurrentExerciseIndex((prev) => Math.max(0, prev - 1));
                  setCurrentSetIndex(1);
                }}
                className="flex-1 py-2 rounded-xl bg-[#202020] disabled:opacity-40 text-xs font-semibold text-white flex items-center justify-center space-x-1 border border-[#333333]"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Prev Exercise</span>
              </button>
              <button
                disabled={currentExerciseIndex >= exercises.length - 1}
                onClick={() => {
                  setCurrentExerciseIndex((prev) => Math.min(exercises.length - 1, prev + 1));
                  setCurrentSetIndex(1);
                }}
                className="flex-1 py-2 rounded-xl bg-[#202020] disabled:opacity-40 text-xs font-semibold text-white flex items-center justify-center space-x-1 border border-[#333333]"
              >
                <span>Skip Exercise</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Finish Workout Early */}
            <button
              onClick={handleFinishWorkout}
              className="w-full py-2.5 rounded-xl bg-transparent hover:bg-[#222222] text-[#888888] hover:text-white border border-[#2B2B2B] text-xs font-bold transition-colors"
            >
              Finish Workout Session
            </button>
          </div>
        ) : (
          /* Workout Completed Screen */
          <div className="p-6 text-center space-y-5 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#D4F52A] text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,245,42,0.4)]">
              <Award className="w-10 h-10 fill-black stroke-black" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold text-[#D4F52A] tracking-wider">
                Workout Complete!
              </span>
              <h2 className="text-2xl font-black text-white mt-1">{activeRunningWorkout.title}</h2>
              <p className="text-xs text-[#999999] mt-1">
                Saved directly to offline SQLite database.
              </p>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-3 bg-[#171717] p-4 rounded-2xl border border-[#2B2B2B]">
              <div className="p-2">
                <span className="text-[10px] text-[#888888] uppercase font-bold block">Active Duration</span>
                <span className="text-lg font-black text-white">{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-[#888888] uppercase font-bold block">Estimated Burn</span>
                <span className="text-lg font-black text-[#D4F52A] flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-[#D4F52A]" />
                  {Math.max(1, Math.round(elapsedSeconds / 60)) * 8} Kcal
                </span>
              </div>
            </div>

            <button
              onClick={stopRunningWorkout}
              className="w-full py-3.5 rounded-xl bg-[#D4F52A] text-black font-extrabold text-sm hover:bg-[#B8D923] transition-all shadow-[0_0_20px_rgba(212,245,42,0.3)]"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
