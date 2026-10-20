import {
  DatabaseDump,
  Member,
  MembershipPlan,
  Membership,
  AttendanceRecord,
  PaymentRecord,
  RefundRecord,
  ExpenseRecord,
  Exercise,
  WorkoutPlan,
  WorkoutSession,
  ScheduledWorkout,
  BodyMeasurement,
  FitnessGoal,
  PersonalRecord,
  StaffMember,
  EquipmentItem,
  AppNotification,
  AppSettings,
  UserProfile,
  AuthUser,
} from '../types/database';
import { getFullSeedDump } from './seedData';

const DB_STORAGE_KEY = 'aurafit_offline_db_v1';
const DB_VERSION = 1;

class SQLiteEngine {
  private data: DatabaseDump;
  private isInitialized = false;

  constructor() {
    this.data = getFullSeedDump();
    this.init();
  }

  public init(): void {
    if (this.isInitialized) return;
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(DB_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as DatabaseDump;
          if (parsed && parsed.version === DB_VERSION) {
            this.data = parsed;
            this.isInitialized = true;
            return;
          }
        }
      }
    } catch {
      // Fallback to fresh seed
    }

    // Initialize with fresh seed and persist
    this.data = getFullSeedDump();
    this.persist();
    this.isInitialized = true;
  }

  private persist(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (err) {
      console.error('Failed to persist database to localStorage', err);
    }
  }

  // --- Transactions / Reset / Backup / Restore ---

  public getRawDump(): DatabaseDump {
    return JSON.parse(JSON.stringify(this.data));
  }

  public exportDatabaseJson(): string {
    const dump = this.getRawDump();
    dump.exportedAt = new Date().toISOString();
    return JSON.stringify(dump, null, 2);
  }

  public importDatabaseJson(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString) as DatabaseDump;
      if (!parsed || !parsed.version || !parsed.members || !parsed.workoutPlans) {
        return { success: false, message: 'Invalid database backup structure.' };
      }
      this.data = parsed;
      this.persist();
      return { success: true, message: 'Database successfully restored.' };
    } catch {
      return { success: false, message: 'Corrupted JSON file. Restoration aborted.' };
    }
  }

  public resetToFactory(): void {
    this.data = getFullSeedDump();
    this.persist();
  }

  // --- App Settings & User Profile ---

  public getSettings(): AppSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.getSettings();
  }

  public getProfile(): UserProfile {
    return { ...this.data.profile };
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.data.profile = { ...this.data.profile, ...updates };
    this.persist();
    return this.getProfile();
  }

  // --- Authentication System ---

  public getCurrentUser(): AuthUser {
    const profile = this.getProfile();
    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      provider: profile.authProvider || 'email',
      role: profile.role || 'member',
      joinedDate: '2025-01-15',
    };
  }

  public loginWithEmail(email: string, password: string): { success: boolean; message: string; user?: AuthUser } {
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    const existing = this.data.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase() || m.phone === email
    );

    if (existing) {
      this.updateProfile({
        fullName: existing.fullName,
        email: existing.email,
        phone: existing.phone,
        avatarUrl: existing.photoUrl || this.data.profile.avatarUrl,
        authProvider: 'email',
      });
      return {
        success: true,
        message: `Welcome back to Shakil_Gym, ${existing.fullName}!`,
        user: this.getCurrentUser(),
      };
    }

    this.updateProfile({
      email,
      authProvider: 'email',
    });
    return {
      success: true,
      message: `Signed in as ${this.data.profile.fullName}!`,
      user: this.getCurrentUser(),
    };
  }

  public registerWithEmail(params: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    fitnessLevel?: 'Beginner' | 'Intermediate' | 'Advance';
  }): { success: boolean; message: string; user?: AuthUser } {
    if (!params.fullName.trim() || !params.email.trim() || !params.password.trim()) {
      return { success: false, message: 'Full name, email, and password are required.' };
    }

    // Save as member in SQLite
    this.saveMember({
      fullName: params.fullName.trim(),
      email: params.email.trim(),
      phone: params.phone || '+880 1700-112233',
      status: 'Active',
      currentPlanName: 'Monthly Pro',
      membershipExpiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      outstandingBalance: 0,
      totalPaid: 3500,
    });

    // Update active profile
    this.updateProfile({
      fullName: params.fullName.trim(),
      email: params.email.trim(),
      phone: params.phone || '+880 1700-112233',
      fitnessLevel: params.fitnessLevel || 'Intermediate',
      authProvider: 'email',
    });

    return {
      success: true,
      message: `Welcome to Shakil_Gym, ${params.fullName}! Your membership is active.`,
      user: this.getCurrentUser(),
    };
  }

  public loginWithOAuth(provider: 'google' | 'github'): { success: boolean; message: string; user?: AuthUser } {
    let name = 'Shakil Ahmed';
    let email = 'shakilbscengineer2027@gmail.com';
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

    if (provider === 'github') {
      name = 'Shakil Ahmed (GitHub)';
      email = 'shakil.dev@github.com';
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';
    }

    this.updateProfile({
      fullName: name,
      email,
      avatarUrl: avatar,
      authProvider: provider,
      role: 'owner',
    });

    return {
      success: true,
      message: `Successfully connected with ${provider === 'google' ? 'Google' : 'GitHub'} (${email})!`,
      user: this.getCurrentUser(),
    };
  }

  public logout(): void {
    this.updateProfile({
      fullName: 'Michael Law',
      email: 'michael.law@aurafit.com',
      authProvider: 'email',
    });
  }

  // --- Members CRUD & Logic ---

  public getMembers(searchQuery = '', statusFilter = 'All'): Member[] {
    let list = this.data.members;
    if (statusFilter !== 'All') {
      list = list.filter((m) => m.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberCode.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getMemberById(id: string): Member | undefined {
    return this.data.members.find((m) => m.id === id);
  }

  public saveMember(member: Partial<Member>): Member {
    const isNew = !member.id;
    const now = new Date().toISOString().split('T')[0];
    const newMember: Member = {
      id: member.id || `mem_${Date.now()}`,
      memberCode: member.memberCode || `MEM-${1000 + this.data.members.length + 1}`,
      fullName: member.fullName || 'New Member',
      email: member.email || '',
      phone: member.phone || '',
      gender: member.gender || 'Male',
      dob: member.dob || '1995-01-01',
      emergencyContact: member.emergencyContact || '',
      joiningDate: member.joiningDate || now,
      status: member.status || 'Active',
      currentPlanId: member.currentPlanId,
      currentPlanName: member.currentPlanName,
      membershipExpiryDate: member.membershipExpiryDate,
      assignedTrainerId: member.assignedTrainerId,
      assignedTrainerName: member.assignedTrainerName,
      notes: member.notes,
      outstandingBalance: Number(member.outstandingBalance || 0),
      totalPaid: Number(member.totalPaid || 0),
      photoUrl: member.photoUrl,
    };

    if (isNew) {
      this.data.members.unshift(newMember);
    } else {
      const idx = this.data.members.findIndex((m) => m.id === newMember.id);
      if (idx !== -1) {
        this.data.members[idx] = newMember;
      } else {
        this.data.members.unshift(newMember);
      }
    }

    this.persist();
    return newMember;
  }

  public deleteMember(id: string): boolean {
    const idx = this.data.members.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.data.members.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }

  // --- Membership Plans ---

  public getPlans(): MembershipPlan[] {
    return [...this.data.membershipPlans];
  }

  public savePlan(plan: Partial<MembershipPlan>): MembershipPlan {
    const isNew = !plan.id;
    const newPlan: MembershipPlan = {
      id: plan.id || `plan_${Date.now()}`,
      name: plan.name || 'Custom Plan',
      durationDays: Number(plan.durationDays || 30),
      durationLabel: plan.durationLabel || `${plan.durationDays || 30} Days`,
      price: Number(plan.price || 0),
      registrationFee: Number(plan.registrationFee || 0),
      description: plan.description || '',
      features: plan.features || ['Gym Access'],
      isActive: plan.isActive !== undefined ? plan.isActive : true,
    };

    if (isNew) {
      this.data.membershipPlans.push(newPlan);
    } else {
      const idx = this.data.membershipPlans.findIndex((p) => p.id === newPlan.id);
      if (idx !== -1) this.data.membershipPlans[idx] = newPlan;
    }

    this.persist();
    return newPlan;
  }

  // --- Attendance ---

  public getAttendance(dateStr?: string): AttendanceRecord[] {
    if (dateStr) {
      return this.data.attendance.filter((a) => a.dateStr === dateStr);
    }
    return [...this.data.attendance].sort(
      (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );
  }

  public checkInMember(memberId: string, notes?: string): { success: boolean; message: string; record?: AttendanceRecord } {
    const member = this.getMemberById(memberId);
    if (!member) return { success: false, message: 'Member not found' };

    const todayStr = new Date().toISOString().split('T')[0];
    // Check if already checked in and not checked out today
    const existing = this.data.attendance.find(
      (a) => a.memberId === memberId && a.dateStr === todayStr && !a.checkOutTime
    );

    if (existing) {
      return { success: false, message: `${member.fullName} is already checked in today at ${new Date(existing.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` };
    }

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      memberCode: member.memberCode,
      checkInTime: new Date().toISOString(),
      dateStr: todayStr,
      notes: notes || 'Normal workout check-in',
    };

    this.data.attendance.unshift(newRecord);
    this.persist();
    return { success: true, message: `Successfully checked in ${member.fullName}!`, record: newRecord };
  }

  public checkOutMember(recordId: string): boolean {
    const record = this.data.attendance.find((a) => a.id === recordId);
    if (record) {
      record.checkOutTime = new Date().toISOString();
      this.persist();
      return true;
    }
    return false;
  }

  // --- Payments & Billing ---

  public getPayments(): PaymentRecord[] {
    return [...this.data.payments].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }

  public recordPayment(params: {
    memberId: string;
    amount: number;
    paymentMethod: PaymentRecord['paymentMethod'];
    type: PaymentRecord['type'];
    planName?: string;
    notes?: string;
    receivedBy?: string;
  }): PaymentRecord {
    const member = this.getMemberById(params.memberId);
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(this.data.payments.length + 44).padStart(4, '0')}`;

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      receiptNumber,
      memberId: params.memberId,
      memberName: member ? member.fullName : 'Guest Member',
      planName: params.planName || member?.currentPlanName,
      amount: Number(params.amount),
      paymentMethod: params.paymentMethod,
      paymentDate: new Date().toISOString(),
      type: params.type,
      notes: params.notes,
      receivedBy: params.receivedBy || 'Admin Desk',
    };

    this.data.payments.unshift(newPayment);

    // Update member's balance and totalPaid
    if (member) {
      member.totalPaid += Number(params.amount);
      if (member.outstandingBalance > 0) {
        member.outstandingBalance = Math.max(0, member.outstandingBalance - Number(params.amount));
      }
      this.saveMember(member);
    }

    this.persist();
    return newPayment;
  }

  public recordRefund(params: {
    paymentId: string;
    amount: number;
    reason: string;
    processedBy?: string;
  }): RefundRecord | null {
    const payment = this.data.payments.find((p) => p.id === params.paymentId);
    if (!payment) return null;

    const refund: RefundRecord = {
      id: `ref_${Date.now()}`,
      paymentId: payment.id,
      receiptNumber: payment.receiptNumber,
      memberId: payment.memberId,
      memberName: payment.memberName,
      amount: Number(params.amount),
      reason: params.reason,
      refundDate: new Date().toISOString(),
      processedBy: params.processedBy || 'Manager',
    };

    if (!this.data.refunds) this.data.refunds = [];
    this.data.refunds.unshift(refund);

    // Update member's totalPaid
    const member = this.getMemberById(payment.memberId);
    if (member) {
      member.totalPaid = Math.max(0, member.totalPaid - Number(params.amount));
      this.saveMember(member);
    }

    this.persist();
    return refund;
  }

  public getRefunds(): RefundRecord[] {
    return this.data.refunds || [];
  }

  // --- Expenses ---

  public getExpenses(): ExpenseRecord[] {
    return [...this.data.expenses].sort(
      (a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    );
  }

  public recordExpense(expense: Partial<ExpenseRecord>): ExpenseRecord {
    const newExpense: ExpenseRecord = {
      id: expense.id || `exp_${Date.now()}`,
      category: expense.category || 'Other',
      title: expense.title || 'General Expense',
      amount: Number(expense.amount || 0),
      expenseDate: expense.expenseDate || new Date().toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod || 'Cash',
      receiptNote: expense.receiptNote,
      paidTo: expense.paidTo,
    };

    this.data.expenses.unshift(newExpense);
    this.persist();
    return newExpense;
  }

  public deleteExpense(id: string): boolean {
    const idx = this.data.expenses.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.data.expenses.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }

  // --- Financial Analytics ---

  public getFinancialSummary(): {
    totalCollections: number;
    totalExpenses: number;
    totalRefunds: number;
    netOperatingProfit: number;
    totalOutstandingDues: number;
    activeMembersCount: number;
    expiredMembersCount: number;
  } {
    const totalCollections = this.data.payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalExpenses = this.data.expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const totalRefunds = (this.data.refunds || []).reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const netOperatingProfit = totalCollections - totalExpenses - totalRefunds;

    const totalOutstandingDues = this.data.members.reduce(
      (acc, m) => acc + (Number(m.outstandingBalance) || 0),
      0
    );

    const activeMembersCount = this.data.members.filter((m) => m.status === 'Active').length;
    const expiredMembersCount = this.data.members.filter((m) => m.status === 'Expired').length;

    return {
      totalCollections,
      totalExpenses,
      totalRefunds,
      netOperatingProfit,
      totalOutstandingDues,
      activeMembersCount,
      expiredMembersCount,
    };
  }

  // --- Workouts & Exercises ---

  public getWorkoutPlans(): WorkoutPlan[] {
    return [...this.data.workoutPlans];
  }

  public getWorkoutPlanById(id: string): WorkoutPlan | undefined {
    return this.data.workoutPlans.find((w) => w.id === id);
  }

  public saveWorkoutPlan(plan: Partial<WorkoutPlan>): WorkoutPlan {
    const isNew = !plan.id;
    const newPlan: WorkoutPlan = {
      id: plan.id || `plan_${Date.now()}`,
      title: plan.title || 'New Workout Routine',
      description: plan.description || '',
      category: plan.category || 'Strength Training',
      fitnessLevel: plan.fitnessLevel || 'Advance',
      coverImageUrl:
        plan.coverImageUrl ||
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      durationMinutes: Number(plan.durationMinutes || 45),
      estimatedCalories: Number(plan.estimatedCalories || 350),
      equipment: plan.equipment || 'Gym Equipment',
      totalExercises: plan.exercises ? plan.exercises.length : Number(plan.totalExercises || 4),
      isFavorite: plan.isFavorite || false,
      exercises: plan.exercises || [],
    };

    if (isNew) {
      this.data.workoutPlans.push(newPlan);
    } else {
      const idx = this.data.workoutPlans.findIndex((p) => p.id === newPlan.id);
      if (idx !== -1) this.data.workoutPlans[idx] = newPlan;
    }

    this.persist();
    return newPlan;
  }

  public toggleWorkoutFavorite(id: string): boolean {
    const plan = this.getWorkoutPlanById(id);
    if (plan) {
      plan.isFavorite = !plan.isFavorite;
      this.persist();
      return plan.isFavorite;
    }
    return false;
  }

  public getExercises(): Exercise[] {
    return [...this.data.exercises];
  }

  // --- Schedule ---

  public getScheduledWorkouts(dateStr?: string): ScheduledWorkout[] {
    if (dateStr) {
      return this.data.scheduledWorkouts.filter((s) => s.dateStr === dateStr);
    }
    return [...this.data.scheduledWorkouts];
  }

  public saveScheduledWorkout(workout: Partial<ScheduledWorkout>): ScheduledWorkout {
    const isNew = !workout.id;
    const newSched: ScheduledWorkout = {
      id: workout.id || `sched_${Date.now()}`,
      workoutPlanId: workout.workoutPlanId || 'plan_biceps_workout',
      workoutTitle: workout.workoutTitle || 'Custom Workout',
      category: workout.category || 'Strength Training',
      dateStr: workout.dateStr || new Date().toISOString().split('T')[0],
      timeStr: workout.timeStr || '18:00',
      durationMinutes: Number(workout.durationMinutes || 60),
      estimatedCalories: Number(workout.estimatedCalories || 500),
      coverImageUrl:
        workout.coverImageUrl ||
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
      isCompleted: workout.isCompleted || false,
      completedAt: workout.completedAt,
      exercises: workout.exercises || [],
    };

    if (isNew) {
      this.data.scheduledWorkouts.push(newSched);
    } else {
      const idx = this.data.scheduledWorkouts.findIndex((s) => s.id === newSched.id);
      if (idx !== -1) this.data.scheduledWorkouts[idx] = newSched;
    }

    this.persist();
    return newSched;
  }

  public toggleExerciseScheduledComplete(schedId: string, exIndex: number): boolean {
    const sched = this.data.scheduledWorkouts.find((s) => s.id === schedId);
    if (sched && sched.exercises[exIndex]) {
      sched.exercises[exIndex].isCompleted = !sched.exercises[exIndex].isCompleted;
      const allDone = sched.exercises.every((e) => e.isCompleted);
      sched.isCompleted = allDone;
      if (allDone) sched.completedAt = new Date().toISOString();
      this.persist();
      return sched.exercises[exIndex].isCompleted;
    }
    return false;
  }

  // --- Workout Sessions / Logging ---

  public recordCompletedWorkoutSession(session: Omit<WorkoutSession, 'id'>): WorkoutSession {
    const newSession: WorkoutSession = {
      id: `sess_${Date.now()}`,
      ...session,
    };

    this.data.workoutSessions.unshift(newSession);

    // Update user stats
    this.data.profile.weeklyWorkoutMinutes += newSession.durationMinutes;
    this.data.profile.streakDays += 1;
    // Calculate new Health Grade
    const completionFactor = Math.min(100, Math.round((this.data.workoutSessions.length / 4) * 85));
    this.data.profile.healthGradePercent = Math.min(98, Math.max(80, completionFactor));

    this.persist();
    return newSession;
  }

  public getWorkoutSessions(): WorkoutSession[] {
    return [...this.data.workoutSessions];
  }

  // --- Progress, Goals & PRs ---

  public getBodyMeasurements(): BodyMeasurement[] {
    return [...this.data.bodyMeasurements];
  }

  public logBodyMeasurement(meas: Partial<BodyMeasurement>): BodyMeasurement {
    const newMeas: BodyMeasurement = {
      id: `meas_${Date.now()}`,
      dateStr: meas.dateStr || new Date().toISOString().split('T')[0],
      weightKg: Number(meas.weightKg || this.data.profile.weightKg),
      bodyFatPercent: meas.bodyFatPercent ? Number(meas.bodyFatPercent) : undefined,
      chestCm: meas.chestCm ? Number(meas.chestCm) : undefined,
      waistCm: meas.waistCm ? Number(meas.waistCm) : undefined,
      armsCm: meas.armsCm ? Number(meas.armsCm) : undefined,
      notes: meas.notes,
    };

    this.data.bodyMeasurements.push(newMeas);
    this.data.profile.weightKg = newMeas.weightKg;
    this.persist();
    return newMeas;
  }

  public getGoals(): FitnessGoal[] {
    return [...this.data.fitnessGoals];
  }

  public saveGoal(goal: Partial<FitnessGoal>): FitnessGoal {
    const newGoal: FitnessGoal = {
      id: goal.id || `goal_${Date.now()}`,
      title: goal.title || 'New Fitness Goal',
      targetValue: Number(goal.targetValue || 100),
      currentValue: Number(goal.currentValue || 0),
      unit: goal.unit || 'kg',
      deadlineDate: goal.deadlineDate || '2026-12-31',
      category: goal.category || 'Strength',
      isCompleted: goal.isCompleted || false,
    };

    const idx = this.data.fitnessGoals.findIndex((g) => g.id === newGoal.id);
    if (idx !== -1) {
      this.data.fitnessGoals[idx] = newGoal;
    } else {
      this.data.fitnessGoals.push(newGoal);
    }
    this.persist();
    return newGoal;
  }

  public getPersonalRecords(): PersonalRecord[] {
    return [...this.data.personalRecords];
  }

  public logPersonalRecord(pr: Partial<PersonalRecord>): PersonalRecord {
    const newPr: PersonalRecord = {
      id: `pr_${Date.now()}`,
      exerciseTitle: pr.exerciseTitle || 'Exercise',
      recordType: pr.recordType || '1RM',
      value: Number(pr.value || 0),
      unit: pr.unit || 'kg',
      achievedDate: pr.achievedDate || new Date().toISOString().split('T')[0],
      notes: pr.notes,
    };

    this.data.personalRecords.unshift(newPr);
    this.persist();
    return newPr;
  }

  // --- Staff & Equipment ---

  public getStaff(): StaffMember[] {
    return [...this.data.staff];
  }

  public saveStaff(staff: Partial<StaffMember>): StaffMember {
    const newStaff: StaffMember = {
      id: staff.id || `staff_${Date.now()}`,
      fullName: staff.fullName || 'New Staff',
      role: staff.role || 'Personal Trainer',
      phone: staff.phone || '',
      email: staff.email || '',
      photoUrl:
        staff.photoUrl ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      specialization: staff.specialization || 'Fitness Trainer',
      baseSalary: Number(staff.baseSalary || 25000),
      commissionRatePercent: Number(staff.commissionRatePercent || 10),
      joiningDate: staff.joiningDate || new Date().toISOString().split('T')[0],
      isActive: staff.isActive !== undefined ? staff.isActive : true,
    };

    const idx = this.data.staff.findIndex((s) => s.id === newStaff.id);
    if (idx !== -1) {
      this.data.staff[idx] = newStaff;
    } else {
      this.data.staff.push(newStaff);
    }

    this.persist();
    return newStaff;
  }

  public getEquipment(): EquipmentItem[] {
    return [...this.data.equipment];
  }

  public saveEquipment(eq: Partial<EquipmentItem>): EquipmentItem {
    const newEq: EquipmentItem = {
      id: eq.id || `eq_${Date.now()}`,
      name: eq.name || 'Equipment',
      category: eq.category || 'Strength',
      quantity: Number(eq.quantity || 1),
      condition: eq.condition || 'Good',
      purchasePrice: Number(eq.purchasePrice || 0),
      purchaseDate: eq.purchaseDate || new Date().toISOString().split('T')[0],
      lastServicedDate: eq.lastServicedDate,
      nextServiceDueDate: eq.nextServiceDueDate || new Date().toISOString().split('T')[0],
      location: eq.location || 'Gym Floor',
    };

    const idx = this.data.equipment.findIndex((e) => e.id === newEq.id);
    if (idx !== -1) {
      this.data.equipment[idx] = newEq;
    } else {
      this.data.equipment.push(newEq);
    }

    this.persist();
    return newEq;
  }

  // --- Notifications ---

  public getNotifications(): AppNotification[] {
    return [...this.data.notifications];
  }

  public markNotificationAsRead(id: string): void {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.isRead = true;
      this.persist();
    }
  }

  public addNotification(title: string, message: string, type: AppNotification['type']): AppNotification {
    const n: AppNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.data.notifications.unshift(n);
    this.persist();
    return n;
  }

  // --- CSV Exporters ---

  public exportMembersCsv(): string {
    const headers = ['ID', 'Code', 'Full Name', 'Phone', 'Status', 'Plan', 'Expiry', 'Paid', 'Due'];
    const rows = this.data.members.map((m) => [
      m.id,
      m.memberCode,
      `"${m.fullName}"`,
      m.phone,
      m.status,
      `"${m.currentPlanName || ''}"`,
      m.membershipExpiryDate || '',
      m.totalPaid,
      m.outstandingBalance,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportPaymentsCsv(): string {
    const headers = ['Receipt #', 'Date', 'Member Name', 'Plan', 'Amount', 'Method', 'Type'];
    const rows = this.data.payments.map((p) => [
      p.receiptNumber,
      p.paymentDate.split('T')[0],
      `"${p.memberName}"`,
      `"${p.planName || ''}"`,
      p.amount,
      p.paymentMethod,
      p.type,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportExpensesCsv(): string {
    const headers = ['ID', 'Date', 'Category', 'Title', 'Amount', 'Method', 'Paid To'];
    const rows = this.data.expenses.map((e) => [
      e.id,
      e.expenseDate,
      e.category,
      `"${e.title}"`,
      e.amount,
      e.paymentMethod,
      `"${e.paidTo || ''}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportAttendanceCsv(): string {
    const headers = ['ID', 'Date', 'Member Code', 'Member Name', 'Check-In', 'Check-Out'];
    const rows = this.data.attendance.map((a) => [
      a.id,
      a.dateStr,
      a.memberCode,
      `"${a.memberName}"`,
      new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Gym',
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const sqliteDb = new SQLiteEngine();
