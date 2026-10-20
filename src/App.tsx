import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PhoneFrame } from './components/common/PhoneFrame';
import { BottomNav } from './components/common/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { WorkoutScreen } from './components/workout/WorkoutScreen';
import { ScheduleScreen } from './components/schedule/ScheduleScreen';
import { ProgressScreen } from './components/progress/ProgressScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { AdminPortal } from './components/admin/AdminPortal';
import { WorkoutPlayerModal } from './components/workout/WorkoutPlayerModal';
import { CoachFeedbackModal } from './components/common/CoachFeedbackModal';
import { QuickActionModal } from './components/common/QuickActionModal';
import { AuthModal } from './components/auth/AuthModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, isAdminMode, toast, clearToast } = useApp();

  return (
    <PhoneFrame>
      {/* Toast Notification Container */}
      {toast && (
        <div className="absolute top-12 left-4 right-4 z-50 flex items-center justify-between p-3 rounded-2xl bg-[#1c1c1c] border border-[#333333] shadow-2xl text-xs text-white animate-fadeIn">
          <div className="flex items-center space-x-2">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#D4F52A] shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#FF5C5C] shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#70baff] shrink-0" />}
            <span className="font-semibold">{toast.message}</span>
          </div>
          <button onClick={clearToast} className="text-[#888888] hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Screen Router */}
      {isAdminMode ? (
        <AdminPortal />
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'workout' && <WorkoutScreen />}
            {activeTab === 'schedule' && <ScheduleScreen />}
            {activeTab === 'progress' && <ProgressScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </div>
          <BottomNav />
        </div>
      )}

      {/* Interactive Global Modals */}
      <WorkoutPlayerModal />
      <CoachFeedbackModal />
      <QuickActionModal />
      <AuthModal />
    </PhoneFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
