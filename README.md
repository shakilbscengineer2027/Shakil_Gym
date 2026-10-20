# Shakil_Gym - Premium Fitness & Gym Management Application

A complete, production-grade, offline-first Gym Fitness and Gym Management application named **Shakil_Gym**. Built with strict TypeScript, Google/GitHub/Email user authentication & registration, responsive multi-device support, real-time workout tracking, and complete administrative ERP modules.

---

## 1. Features

### Reference Design Reproduction (Screen-by-Screen)
- **Home Dashboard (Screen 1)**:
  - Header with user avatar ("Michael Law"), notification indicator, and greetings.
  - Search field with category filter actions.
  - Popular Plans segmented bar: active neon lime (`#D4F52A`) "Strength" pill with dumbbell icon, "Fat Loss", "Cardio", and "Stretch".
  - Featured **Health Grade** card with vibrant `#D4F52A` lime background and an 85% circular SVG gauge.
  - Dual metric cards: **Heart Rate** (120 BPM with green heart badge) and **Workout Time** (5h 40m this week).
  - Trainer Card featuring **Coach Narez** with direct feedback messaging and status.
  - **Today's Workout** card ("Biceps Workout", Mid-Level, athlete imagery, and direct Start Workout action).
- **Workout Library (Screen 2)**:
  - Header with back navigation, level switcher ("Advance", "Intermediate", "Beginner").
  - Category routines: Strength Training (42 Sessions), Functional Fitness (28 Sessions), Mind & Mobility (34 Sessions), Core Strength (36 Sessions).
  - Custom Workout Plan Creator.
  - Interactive Workout Player Modal with live elapsed timer, set/rep logger, rest countdown timer with synthesized audio chimes, and celebration confetti on completion.
- **Schedule (Screen 3)**:
  - Horizontal weekly date strip highlighting **Tue 30 Jun** in vibrant `#D4F52A` lime.
  - **Today's Focus** card ("Biceps Workout", 1900 Kcal, 60 Min, "Start Workout >").
  - **Today's Plan** with indexed exercises:
    1. Barbell Curl (4 Sets • 10-12 Reps) — "Completed ✓"
    2. Hammer Curl (3 Sets • 10-12 Reps) — "Upcoming ⏱"
    3. Preacher Curl (3 Sets • 10-12 Reps) — "Upcoming ⏱"
  - Interactive status toggles saving directly to persistent storage.
  - **Weekly Progress** card tracking completed weekly sessions.
- **Progress & Personal Records**:
  - Weekly and monthly workout duration charts.
  - Streak tracking (14 days), weight history, and target tracking.
  - Personal Records (PRs) logger (Deadlift 180kg, Barbell Curl 45kg, etc.).
  - Fitness goals tracking with completion percentage.
- **Profile & Settings**:
  - Member details, language toggle (English / Bengali - বাংলা), weight units (kg / lbs).
  - Full versioned JSON database backup and restore validation.
  - CSV exports for Members, Payments, Expenses, and Attendance.
  - Factory reset confirmation.

### Complete Gym Management Administration Portal
- **Member Management**: Add, edit, filter (Active, Expired, Frozen), view balances and plan status.
- **Membership Plans**: Configurable durations (Monthly, Quarterly, Yearly), registration fees, and features.
- **Attendance System**: Instant check-in/out, duplicate check-in prevention, and daily timestamps.
- **Billing & Payments**: Receive payments (Cash, bKash, Card, Nagad, Bank Transfer), partial payment tracking, unique receipt generation (`REC-YYYY-XXXX`), and printable receipt vouchers.
- **Expense Tracking**: Categorized expense entries (Rent, Utilities, Salaries, Maintenance), receipts, and vendor records.
- **Trainers & Staff Directory**: Head Trainer Coach Narez, staff salary records, and commission rates.
- **Equipment Inventory**: Quantity, condition tracking, and maintenance service schedules.
- **Financial Reports & Analytics**: Net Operating Profit calculation (`Total Collections - Total Expenses - Total Refunds`), dues summary, and CSV export.

---

## 2. Offline-First Relational Architecture

The application operates 100% offline without remote server or cloud dependencies:
- **Schema**: 28 normalized entities with primary keys, foreign keys, timestamps, and indexes.
- **Storage**: Persistent relational engine with automatic version management, transactional state, and backup recovery.
- **Data Integrity**: Guardrails against duplicate daily check-ins, negative balance inconsistencies, and loss of historical pricing.

---

## 3. Installation & Startup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated tests
npx tsx scripts/test_engine.ts

# Production build
npm run build
```

---

## 4. Automated Test Verification Results

All 24 business logic and database operations passed:
- `Database Initialization & Michael Law profile check`: PASSED
- `Member CRUD & Indexing`: PASSED
- `Attendance & Duplicate Check-in Prevention`: PASSED
- `Billing, Partial Payments & Receipt Generation`: PASSED
- `Refund Accounting`: PASSED
- `Operating Expenses & Net Profit Formula`: PASSED
- `Workout Session Persistence & Streak Counter`: PASSED
- `Versioned JSON Backup Export & Integrity Restore`: PASSED
- `CSV Exporters (Members, Payments, Expenses, Attendance)`: PASSED
