/**
 * Automated Verification Suite for AuraFit Offline SQLite Database & Business Logic
 */

// Simple in-memory localStorage shim for Node.js test environment
const memoryStorage: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => memoryStorage[key] || null,
  setItem: (key: string, val: string) => {
    memoryStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete memoryStorage[key];
  },
  clear: () => {
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
  },
  length: 0,
  key: () => null,
};

import { sqliteDb } from '../src/db/sqliteEngine';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${desc}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    testsFailed++;
  }
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('STARTING AURAFIT BUSINESS LOGIC & SQLITE TESTS');
  console.log('========================================\n');

  // 1. Database Initialization & Seed Check
  console.log('1. Database Initialization:');
  const profile = sqliteDb.getProfile();
  assert(profile.fullName === 'Michael Law', 'Default user is Michael Law matching reference image');
  assert(profile.healthGradePercent === 85, 'Health Grade matches 85% from reference image');
  assert(profile.heartRateBpm === 120, 'Heart Rate matches 120 BPM from reference image');

  // 2. Member CRUD
  console.log('\n2. Member CRUD Operations:');
  const initialMembersCount = sqliteDb.getMembers().length;
  const newMember = sqliteDb.saveMember({
    fullName: 'Shakil Test Member',
    phone: '+880 1700-112233',
    currentPlanName: 'Monthly Pro',
    status: 'Active',
    outstandingBalance: 1000,
    totalPaid: 2500,
  });
  assert(newMember.id.startsWith('mem_'), 'Member ID correctly assigned with prefix');
  assert(sqliteDb.getMembers().length === initialMembersCount + 1, 'Member successfully inserted into SQLite');

  const retrieved = sqliteDb.getMemberById(newMember.id);
  assert(retrieved?.fullName === 'Shakil Test Member', 'Member retrieved accurately by ID');

  // 3. Duplicate Check-in Prevention
  console.log('\n3. Attendance & Duplicate Check-in Validation:');
  const checkIn1 = sqliteDb.checkInMember(newMember.id, 'Morning workout');
  assert(checkIn1.success === true, 'First check-in for today succeeds');

  const checkIn2 = sqliteDb.checkInMember(newMember.id, 'Duplicate attempt');
  assert(checkIn2.success === false, 'Duplicate check-in on the same day is correctly blocked');

  // Check out member
  if (checkIn1.record) {
    const checkedOut = sqliteDb.checkOutMember(checkIn1.record.id);
    assert(checkedOut === true, 'Member successfully checked out');
  }

  // 4. Payments, Partial Balance & Receipts
  console.log('\n4. Billing, Partial Payments & Dues:');
  const initialDue = newMember.outstandingBalance;
  assert(initialDue === 1000, 'Member initially has 1000 BDT outstanding due');

  const payment1 = sqliteDb.recordPayment({
    memberId: newMember.id,
    amount: 1000,
    paymentMethod: 'bKash',
    type: 'Partial Payment',
    notes: 'Paid off remaining due',
  });
  assert(payment1.receiptNumber.startsWith('REC-'), 'Receipt number formatted with REC- prefix');

  const updatedMember = sqliteDb.getMemberById(newMember.id);
  assert(updatedMember?.outstandingBalance === 0, 'Outstanding balance cleared to 0 after payment');
  assert(updatedMember?.totalPaid === 3500, 'Total paid increased correctly to 3500 BDT');

  // 5. Refunds
  console.log('\n5. Refund Processing:');
  const refund = sqliteDb.recordRefund({
    paymentId: payment1.id,
    amount: 500,
    reason: 'Member requested partial registration refund',
  });
  assert(refund !== null && refund.amount === 500, 'Refund recorded with corresponding receipt reference');
  const refundedMember = sqliteDb.getMemberById(newMember.id);
  assert(refundedMember?.totalPaid === 3000, 'Member totalPaid adjusted downwards by refund amount');

  // 6. Expenses & Net Operating Result
  console.log('\n6. Expenses & Financial Calculations:');
  const initialExpenses = sqliteDb.getExpenses().length;
  sqliteDb.recordExpense({
    title: 'Bench Press Upholstery Repair',
    amount: 2500,
    category: 'Maintenance',
  });
  assert(sqliteDb.getExpenses().length === initialExpenses + 1, 'Expense record successfully created');

  const fin = sqliteDb.getFinancialSummary();
  assert(typeof fin.netOperatingProfit === 'number', 'Net operating profit calculated numerically');
  assert(fin.netOperatingProfit === fin.totalCollections - fin.totalExpenses - fin.totalRefunds, 'Net Profit exactly equals Collections - Expenses - Refunds');

  // 7. Workout Sessions & Streak Increment
  console.log('\n7. Workout Sessions & Streak:');
  const prevStreak = sqliteDb.getProfile().streakDays;
  sqliteDb.recordCompletedWorkoutSession({
    workoutTitle: 'Biceps Hypertrophy Session',
    category: 'Strength Training',
    startedAt: new Date().toISOString(),
    durationMinutes: 45,
    caloriesBurned: 380,
    completionRatePercent: 100,
    exercisesLogged: [],
  });
  const updatedProfile = sqliteDb.getProfile();
  assert(updatedProfile.streakDays === prevStreak + 1, 'Streak incremented upon completing workout');

  // 8. Backup & Restore Validation
  console.log('\n8. Backup, JSON Export & Restoration:');
  const jsonDump = sqliteDb.exportDatabaseJson();
  assert(jsonDump.includes('Michael Law'), 'Export JSON dump contains member Michael Law');
  assert(jsonDump.includes('"version": 1'), 'Export JSON dump includes database schema version');

  const restoreResult = sqliteDb.importDatabaseJson(jsonDump);
  assert(restoreResult.success === true, 'Database successfully validated and restored from backup JSON');

  // 9. CSV Exports
  console.log('\n9. CSV Exporters:');
  const membersCsv = sqliteDb.exportMembersCsv();
  assert(membersCsv.includes('Member Name') || membersCsv.includes('Full Name'), 'Members CSV includes headers');
  const paymentsCsv = sqliteDb.exportPaymentsCsv();
  assert(paymentsCsv.includes('Receipt #'), 'Payments CSV includes Receipt # header');

  // 10. Shakil_Gym Brand & Authentication (Google, GitHub, Email Register & Login)
  console.log('\n10. Shakil_Gym Authentication & OAuth System:');
  const settings = sqliteDb.getSettings();
  assert(settings.gymName === 'Shakil_Gym', 'App brand name is correctly Shakil_Gym');

  // Test Google OAuth Login
  const googleAuth = sqliteDb.loginWithOAuth('google');
  assert(googleAuth.success === true, 'Google OAuth login succeeded');
  assert(googleAuth.user?.email === 'shakilbscengineer2027@gmail.com', 'Google login authenticates Shakil user email');

  // Test GitHub OAuth Login
  const githubAuth = sqliteDb.loginWithOAuth('github');
  assert(githubAuth.success === true, 'GitHub OAuth login succeeded');
  assert(githubAuth.user?.provider === 'github', 'GitHub provider recorded correctly');

  // Test New User Registration
  const regResult = sqliteDb.registerWithEmail({
    fullName: 'Robiul Islam',
    email: 'robiul.islam@example.com',
    password: 'securePassword123',
    phone: '+880 1788-990011',
    fitnessLevel: 'Beginner',
  });
  assert(regResult.success === true, 'New user registration succeeded');
  assert(sqliteDb.getProfile().fullName === 'Robiul Islam', 'Registered user set as active profile');

  // Test User Logout and Login
  sqliteDb.logout();
  const loginRes = sqliteDb.loginWithEmail('robiul.islam@example.com', 'securePassword123');
  assert(loginRes.success === true, 'User login with registered email succeeded');

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
