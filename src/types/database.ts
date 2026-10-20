/**
 * Complete Database Types for Offline-First Gym & Fitness Management
 * 28 Normalized Entities + DTOs + Enums
 */

export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advance';
export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP';
export type LanguageCode = 'en' | 'bn';
export type UnitWeight = 'kg' | 'lbs';
export type UnitHeight = 'cm' | 'inch';

export interface AppSettings {
  id: string;
  gymName: string;
  gymAddress: string;
  gymPhone: string;
  currency: CurrencyCode;
  currencySymbol: string;
  language: LanguageCode;
  unitWeight: UnitWeight;
  unitHeight: UnitHeight;
  enableNotifications: boolean;
  reminderHour: number; // 24h format
  autoBackup: boolean;
  theme: 'dark' | 'light';
  dbVersion: number;
  lastBackupDate?: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  provider: 'email' | 'google' | 'github';
  role: 'member' | 'admin' | 'owner';
  joinedDate: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  fitnessLevel: FitnessLevel;
  goals: string[];
  preferredCategories: string[];
  weightKg: number;
  heightCm: number;
  streakDays: number;
  healthGradePercent: number;
  heartRateBpm: number;
  weeklyWorkoutMinutes: number;
  coachName: string;
  coachAvatarUrl: string;
  coachFeedback: string;
  hasNewFeedback: boolean;
  authProvider?: 'email' | 'google' | 'github';
  role?: 'member' | 'admin' | 'owner';
}

export interface Member {
  id: string;
  memberCode: string; // e.g. "MEM-1001"
  fullName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  emergencyContact: string;
  joiningDate: string;
  status: 'Active' | 'Inactive' | 'Expired' | 'Frozen';
  currentPlanId?: string;
  currentPlanName?: string;
  membershipExpiryDate?: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  notes?: string;
  outstandingBalance: number;
  totalPaid: number;
}

export interface MembershipPlan {
  id: string;
  name: string; // e.g. "Monthly Pro", "Yearly Elite"
  durationDays: number; // 7, 30, 90, 180, 365
  durationLabel: string; // "1 Month", "3 Months", "1 Year"
  price: number;
  registrationFee: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  status: 'Active' | 'Expired' | 'Frozen' | 'Cancelled';
  createdAt: string;
}

export interface MembershipFreezePeriod {
  id: string;
  membershipId: string;
  memberId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Active' | 'Completed' | 'Revoked';
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  checkInTime: string; // ISO
  checkOutTime?: string; // ISO
  dateStr: string; // YYYY-MM-DD
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string; // e.g. "REC-2026-001"
  memberId: string;
  memberName: string;
  membershipId?: string;
  planName?: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'bKash' | 'Nagad';
  paymentDate: string; // ISO
  type: 'Full Payment' | 'Partial Payment' | 'Registration' | 'Renewal' | 'Personal Training';
  notes?: string;
  receivedBy: string;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  amount: number;
  reason: string;
  refundDate: string;
  processedBy: string;
}

export interface ExpenseRecord {
  id: string;
  category: 'Rent' | 'Utilities' | 'Equipment' | 'Salaries' | 'Maintenance' | 'Marketing' | 'Supplements' | 'Other';
  title: string;
  amount: number;
  expenseDate: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque';
  receiptNote?: string;
  paidTo?: string;
}

export interface Exercise {
  id: string;
  title: string;
  category: string;
  targetMuscle: string;
  equipment: string;
  imageUrl: string;
  defaultSets: number;
  defaultReps: string;
  defaultRestSec: number;
  instructions: string;
  caloriesBurnEstimate: number;
}

export interface WorkoutPlanExercise {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  targetMuscle: string;
  imageUrl: string;
  orderIndex: number;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
  isCompleted?: boolean;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  fitnessLevel: FitnessLevel;
  coverImageUrl: string;
  durationMinutes: number;
  estimatedCalories: number;
  equipment: string;
  totalExercises: number;
  isFavorite: boolean;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutSessionExerciseLog {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  setNumber: number;
  repsCompleted: number;
  weightUsedKg: number;
  restSec: number;
}

export interface WorkoutSession {
  id: string;
  workoutPlanId?: string;
  workoutTitle: string;
  category: string;
  startedAt: string; // ISO
  endedAt?: string; // ISO
  durationMinutes: number;
  caloriesBurned: number;
  completionRatePercent: number;
  notes?: string;
  exercisesLogged: WorkoutSessionExerciseLog[];
}

export interface ScheduledWorkout {
  id: string;
  workoutPlanId: string;
  workoutTitle: string;
  category: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  durationMinutes: number;
  estimatedCalories: number;
  coverImageUrl: string;
  isCompleted: boolean;
  completedAt?: string;
  exercises: {
    id: string;
    exerciseTitle: string;
    sets: number;
    reps: string;
    imageUrl: string;
    isCompleted: boolean;
  }[];
}

export interface BodyMeasurement {
  id: string;
  dateStr: string;
  weightKg: number;
  bodyFatPercent?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
  notes?: string;
}

export interface FitnessGoal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadlineDate: string;
  category: 'Weight' | 'Strength' | 'Workouts' | 'Cardio';
  isCompleted: boolean;
}

export interface PersonalRecord {
  id: string;
  exerciseTitle: string;
  recordType: '1RM' | 'Max Reps' | 'Fastest Time' | 'Max Volume';
  value: number;
  unit: string;
  achievedDate: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  role: 'Head Trainer' | 'Personal Trainer' | 'Nutritionist' | 'Manager' | 'Receptionist';
  phone: string;
  email: string;
  photoUrl: string;
  specialization: string;
  baseSalary: number;
  commissionRatePercent: number;
  joiningDate: string;
  isActive: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'Strength' | 'Cardio' | 'Free Weights' | 'Accessories';
  quantity: number;
  condition: 'Excellent' | 'Good' | 'Needs Service' | 'Under Repair';
  purchasePrice: number;
  purchaseDate: string;
  lastServicedDate?: string;
  nextServiceDueDate: string;
  location: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'expiry' | 'due' | 'workout' | 'system';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface DatabaseDump {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  profile: UserProfile;
  members: Member[];
  membershipPlans: MembershipPlan[];
  memberships: Membership[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  refunds: RefundRecord[];
  expenses: ExpenseRecord[];
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  workoutSessions: WorkoutSession[];
  scheduledWorkouts: ScheduledWorkout[];
  bodyMeasurements: BodyMeasurement[];
  fitnessGoals: FitnessGoal[];
  personalRecords: PersonalRecord[];
  staff: StaffMember[];
  equipment: EquipmentItem[];
  notifications: AppNotification[];
}
