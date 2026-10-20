import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppSettings,
  UserProfile,
  Member,
  MembershipPlan,
  AttendanceRecord,
  PaymentRecord,
  ExpenseRecord,
  WorkoutPlan,
  ScheduledWorkout,
  AppNotification,
  AuthUser,
} from '../types/database';
import { sqliteDb } from '../db/sqliteEngine';

export type TabType = 'home' | 'workout' | 'schedule' | 'progress' | 'profile';
export type AdminSectionType =
  | 'dashboard'
  | 'members'
  | 'plans'
  | 'attendance'
  | 'payments'
  | 'expenses'
  | 'staff'
  | 'equipment'
  | 'reports'
  | 'reminders';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextValue {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  adminSection: AdminSectionType;
  setAdminSection: (section: AdminSectionType) => void;
  settings: AppSettings;
  profile: UserProfile;
  refreshData: () => void;
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  // Live Data lists
  members: Member[];
  plans: MembershipPlan[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  workoutPlans: WorkoutPlan[];
  scheduledWorkouts: ScheduledWorkout[];
  notifications: AppNotification[];
  // Workout Runner
  activeRunningWorkout: WorkoutPlan | null;
  startRunningWorkout: (plan: WorkoutPlan) => void;
  stopRunningWorkout: () => void;
  // Coach feedback modal
  isCoachModalOpen: boolean;
  setIsCoachModalOpen: (val: boolean) => void;
  // Quick Action menu
  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (val: boolean) => void;
  // Auth Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  currentUser: AuthUser;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  // Default to false so the application is fully responsive on laptops, tablets, and desktops
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminSection, setAdminSection] = useState<AdminSectionType>('dashboard');
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => sqliteDb.getSettings());
  const [profile, setProfile] = useState<UserProfile>(() => sqliteDb.getProfile());
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => sqliteDb.getCurrentUser());

  const [members, setMembers] = useState<Member[]>(() => sqliteDb.getMembers());
  const [plans, setPlans] = useState<MembershipPlan[]>(() => sqliteDb.getPlans());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => sqliteDb.getAttendance());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => sqliteDb.getPayments());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => sqliteDb.getExpenses());
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(() => sqliteDb.getWorkoutPlans());
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>(() =>
    sqliteDb.getScheduledWorkouts()
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    sqliteDb.getNotifications()
  );

  const [activeRunningWorkout, setActiveRunningWorkout] = useState<WorkoutPlan | null>(null);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState<boolean>(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const refreshData = useCallback(() => {
    setSettings(sqliteDb.getSettings());
    setProfile(sqliteDb.getProfile());
    setCurrentUser(sqliteDb.getCurrentUser());
    setMembers(sqliteDb.getMembers());
    setPlans(sqliteDb.getPlans());
    setAttendance(sqliteDb.getAttendance());
    setPayments(sqliteDb.getPayments());
    setExpenses(sqliteDb.getExpenses());
    setWorkoutPlans(sqliteDb.getWorkoutPlans());
    setScheduledWorkouts(sqliteDb.getScheduledWorkouts());
    setNotifications(sqliteDb.getNotifications());
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: `toast_${Date.now()}`, message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const startRunningWorkout = useCallback((plan: WorkoutPlan) => {
    setActiveRunningWorkout(plan);
  }, []);

  const stopRunningWorkout = useCallback(() => {
    setActiveRunningWorkout(null);
    refreshData();
  }, [refreshData]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isPhoneFrame,
        setIsPhoneFrame,
        isAdminMode,
        setIsAdminMode,
        adminSection,
        setAdminSection,
        settings,
        profile,
        refreshData,
        toast,
        showToast,
        clearToast,
        members,
        plans,
        attendance,
        payments,
        expenses,
        workoutPlans,
        scheduledWorkouts,
        notifications,
        activeRunningWorkout,
        startRunningWorkout,
        stopRunningWorkout,
        isCoachModalOpen,
        setIsCoachModalOpen,
        isQuickActionOpen,
        setIsQuickActionOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        currentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
