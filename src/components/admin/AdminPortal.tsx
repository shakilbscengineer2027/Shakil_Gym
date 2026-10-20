import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  CalendarCheck,
  TrendingDown,
  Layers,
  UserCheck,
  Wrench,
  FileBarChart,
  BellRing,
  ArrowLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Download,
  Trash2,
  RefreshCw,
  X,
  Printer,
} from 'lucide-react';
import { useApp, AdminSectionType } from '../../context/AppContext';
import { sqliteDb } from '../../db/sqliteEngine';
import { Member, MembershipPlan, PaymentRecord, ExpenseRecord, StaffMember, EquipmentItem } from '../../types/database';

export const AdminPortal: React.FC = () => {
  const {
    adminSection,
    setAdminSection,
    setIsAdminMode,
    settings,
    members,
    plans,
    attendance,
    payments,
    expenses,
    refreshData,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('All');

  // Modal states
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // Forms
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberPlan, setNewMemberPlan] = useState(plans[0]?.id || '');
  const [newMemberDue, setNewMemberDue] = useState('0');

  // Payment form
  const [payMemberId, setPayMemberId] = useState(members[0]?.id || '');
  const [payAmount, setPayAmount] = useState('3500');
  const [payMethod, setPayMethod] = useState<PaymentRecord['paymentMethod']>('Cash');
  const [payType, setPayType] = useState<PaymentRecord['type']>('Full Payment');
  const [payNotes, setPayNotes] = useState('');

  // Expense form
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('5000');
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>('Utilities');
  const [expPaidTo, setExpPaidTo] = useState('');

  const finSummary = sqliteDb.getFinancialSummary();
  const filteredMembers = sqliteDb.getMembers(searchQuery, memberStatusFilter);
  const staffList = sqliteDb.getStaff();
  const equipmentList = sqliteDb.getEquipment();

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const chosenPlan = plans.find((p) => p.id === newMemberPlan) || plans[0];
    const initialDue = Number(newMemberDue) || 0;

    sqliteDb.saveMember({
      fullName: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      currentPlanId: chosenPlan?.id,
      currentPlanName: chosenPlan?.name,
      membershipExpiryDate: new Date(Date.now() + (chosenPlan?.durationDays || 30) * 86400000)
        .toISOString()
        .split('T')[0],
      outstandingBalance: initialDue,
      totalPaid: (chosenPlan?.price || 3500) - initialDue,
      status: 'Active',
    });

    refreshData();
    setIsAddMemberOpen(false);
    setNewMemberName('');
    setNewMemberPhone('');
    showToast('New member registered and added to SQLite database!', 'success');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = members.find((m) => m.id === payMemberId);
    if (!mem) return;

    const receipt = sqliteDb.recordPayment({
      memberId: mem.id,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      type: payType,
      planName: mem.currentPlanName,
      notes: payNotes,
    });

    refreshData();
    setIsRecordPaymentOpen(false);
    setSelectedReceipt(receipt);
    showToast(`Payment recorded! Receipt: ${receipt.receiptNumber}`, 'success');
  };

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim()) return;

    sqliteDb.recordExpense({
      title: expTitle.trim(),
      amount: Number(expAmount),
      category: expCategory,
      paidTo: expPaidTo.trim(),
    });

    refreshData();
    setIsRecordExpenseOpen(false);
    setExpTitle('');
    showToast('Expense recorded successfully.', 'success');
  };

  const handleQuickCheckIn = (memberId: string) => {
    const res = sqliteDb.checkInMember(memberId);
    refreshData();
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleExportCsv = (type: 'members' | 'payments' | 'expenses' | 'attendance') => {
    let csv = '';
    let filename = '';
    if (type === 'members') {
      csv = sqliteDb.exportMembersCsv();
      filename = `aurafit_members_${Date.now()}.csv`;
    } else if (type === 'payments') {
      csv = sqliteDb.exportPaymentsCsv();
      filename = `aurafit_payments_${Date.now()}.csv`;
    } else if (type === 'expenses') {
      csv = sqliteDb.exportExpensesCsv();
      filename = `aurafit_expenses_${Date.now()}.csv`;
    } else {
      csv = sqliteDb.exportAttendanceCsv();
      filename = `aurafit_attendance_${Date.now()}.csv`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${type} to CSV!`, 'success');
  };

  const sections: { id: AdminSectionType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <FileBarChart className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'payments', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'expenses', label: 'Expenses', icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'plans', label: 'Plans', icon: <Layers className="w-4 h-4" /> },
    { id: 'staff', label: 'Staff', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'equipment', label: 'Equipment', icon: <Wrench className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 bg-[#0a0a0a] text-white flex flex-col select-none">
      {/* Top Admin Header Bar */}
      <div className="bg-[#141414] border-b border-[#242424] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAdminMode(false)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#222222] hover:bg-[#333333] text-xs font-bold text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Member App</span>
          </button>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-2">
              <span>{settings.gymName}</span>
              <span className="text-[10px] bg-[#D4F52A] text-black px-1.5 py-0.2 rounded font-extrabold uppercase">
                Admin ERP
              </span>
            </h1>
            <p className="text-[10px] text-[#888888]">{settings.gymAddress}</p>
          </div>
        </div>

        {/* Currency & Quick Actions */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-[#D4F52A] bg-[#1f1f1f] px-2.5 py-1 rounded-lg border border-[#333333]">
            {settings.currency} ({settings.currencySymbol})
          </span>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="bg-[#111111] border-b border-[#222222] px-3 py-2 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {sections.map((sec) => {
          const isActive = adminSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setAdminSection(sec.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#D4F52A] text-black shadow-sm'
                  : 'text-[#888888] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <span>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
        {/* 1. DASHBOARD OVERVIEW */}
        {adminSection === 'dashboard' && (
          <div className="space-y-4">
            {/* Metric KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#161616] border border-[#262626] rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-[#888888] uppercase">Total Collections</span>
                <p className="text-base font-black text-[#A6E22E]">
                  {settings.currencySymbol} {finSummary.totalCollections.toLocaleString()}
                </p>
                <span className="text-[9px] text-[#888888]">{payments.length} receipts issued</span>
              </div>

              <div className="bg-[#161616] border border-[#262626] rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-[#888888] uppercase">Total Expenses</span>
                <p className="text-base font-black text-[#FF5C5C]">
                  {settings.currencySymbol} {finSummary.totalExpenses.toLocaleString()}
                </p>
                <span className="text-[9px] text-[#888888]">Rent, AC, Salaries</span>
              </div>

              <div className="bg-[#161616] border border-[#262626] rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-[#888888] uppercase">Net Operating Result</span>
                <p className="text-base font-black text-[#D4F52A]">
                  {settings.currencySymbol} {finSummary.netOperatingProfit.toLocaleString()}
                </p>
                <span className="text-[9px] text-[#A6E22E]">Positive Cash Flow</span>
              </div>

              <div className="bg-[#161616] border border-[#262626] rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-[#888888] uppercase">Outstanding Dues</span>
                <p className="text-base font-black text-[#FFB800]">
                  {settings.currencySymbol} {finSummary.totalOutstandingDues.toLocaleString()}
                </p>
                <span className="text-[9px] text-[#888888]">Pending member balances</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs shadow-sm hover:bg-[#B8D923]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Register New Member</span>
              </button>
              <button
                onClick={() => setIsRecordPaymentOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#1e2e1a] text-[#A6E22E] border border-[#2d4d24] font-bold text-xs hover:bg-[#253c20]"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Receive Payment</span>
              </button>
              <button
                onClick={() => setIsRecordExpenseOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#2e1a1a] text-[#FF5C5C] border border-[#4d2424] font-bold text-xs hover:bg-[#3c2020]"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </button>
            </div>

            {/* Live Today's Attendance snapshot */}
            <div className="bg-[#161616] border border-[#262626] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#D4F52A]" />
                  <span>Today's Gym Check-Ins ({attendance.length})</span>
                </h3>
                <button
                  onClick={() => setAdminSection('attendance')}
                  className="text-[11px] font-bold text-[#D4F52A] hover:underline"
                >
                  View All & Check In
                </button>
              </div>

              <div className="space-y-2">
                {attendance.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2.5 bg-[#1f1f1f] rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{a.memberName}</span>
                      <span className="text-[10px] text-[#888888] ml-2">({a.memberCode})</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#A6E22E]">
                      In: {new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. MEMBERS MANAGEMENT */}
        {adminSection === 'members' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              {/* Search */}
              <div className="flex-1 flex items-center space-x-2 bg-[#171717] border border-[#262626] rounded-xl px-3 py-2 text-xs">
                <Search className="w-3.5 h-3.5 text-[#777777]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, or MEM code..."
                  className="bg-transparent flex-1 text-white placeholder-[#666666] focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Member</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 text-[11px]">
              {['All', 'Active', 'Expired', 'Frozen'].map((st) => (
                <button
                  key={st}
                  onClick={() => setMemberStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                    memberStatusFilter === st
                      ? 'bg-[#D4F52A] text-black'
                      : 'bg-[#1c1c1c] text-[#888888] hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
              <button
                onClick={() => handleExportCsv('members')}
                className="ml-auto text-xs text-[#D4F52A] hover:underline flex items-center gap-1 font-bold"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#161616] border border-[#262626] rounded-2xl p-3.5 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={m.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-[#333333]"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-white">{m.fullName}</h4>
                        <span className="text-[10px] font-mono text-[#D4F52A]">{m.memberCode}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            m.status === 'Active'
                              ? 'bg-[#1a2e14] text-[#A6E22E]'
                              : 'bg-[#2e1414] text-[#FF5C5C]'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#888888]">
                        {m.phone} · Plan: <span className="text-white">{m.currentPlanName}</span>
                      </p>
                      <p className="text-[10px] text-[#666666]">Expires: {m.membershipExpiryDate}</p>
                    </div>
                  </div>

                  {/* Actions & Balance */}
                  <div className="text-right space-y-1">
                    {m.outstandingBalance > 0 ? (
                      <span className="text-[10px] font-bold text-[#FFB800] block">
                        Due: {settings.currencySymbol} {m.outstandingBalance}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#A6E22E] block">Paid In Full</span>
                    )}
                    <button
                      onClick={() => handleQuickCheckIn(m.id)}
                      className="px-2 py-1 rounded-lg bg-[#222222] hover:bg-[#333333] text-[10px] text-white font-semibold transition-colors"
                    >
                      Check-In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ATTENDANCE SYSTEM */}
        {adminSection === 'attendance' && (
          <div className="space-y-3.5">
            <div className="bg-[#161616] border border-[#262626] rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fast Member Check-In</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={payMemberId}
                  onChange={(e) => setPayMemberId(e.target.value)}
                  className="flex-1 bg-[#242424] text-white text-xs px-3 py-2 rounded-xl border border-[#333333] focus:outline-hidden"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberCode}) - {m.status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleQuickCheckIn(payMemberId)}
                  className="px-4 py-2 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs shrink-0"
                >
                  Check In Now
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider">
                Attendance Log ({attendance.length} Total)
              </h4>
              <button
                onClick={() => handleExportCsv('attendance')}
                className="text-xs text-[#D4F52A] hover:underline flex items-center gap-1 font-bold"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="space-y-2">
              {attendance.map((a) => (
                <div
                  key={a.id}
                  className="bg-[#161616] border border-[#262626] rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">{a.memberName}</h5>
                    <p className="text-[10px] text-[#888888]">{a.memberCode} · {a.dateStr}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#A6E22E] block">
                      In: {new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {a.checkOutTime ? (
                      <span className="text-[10px] font-mono text-[#888888]">
                        Out: {new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          sqliteDb.checkOutMember(a.id);
                          refreshData();
                          showToast('Checked out member', 'info');
                        }}
                        className="text-[9px] text-[#D4F52A] font-bold hover:underline"
                      >
                        Mark Check-Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. BILLING & PAYMENTS */}
        {adminSection === 'payments' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Payments & Receipts</h3>
                <p className="text-[10px] text-[#888888]">Track collections, partial payments & refunds</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportCsv('payments')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#202020] text-xs text-[#D4F52A] border border-[#333333] font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => setIsRecordPaymentOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Receive Payment</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedReceipt(p)}
                  className="bg-[#161616] hover:bg-[#1d1d1d] border border-[#262626] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-colors shadow-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-extrabold text-[#D4F52A]">{p.receiptNumber}</span>
                      <span className="text-[10px] bg-[#222222] px-1.5 py-0.2 rounded text-[#aaaaaa]">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white mt-0.5">{p.memberName}</h5>
                    <p className="text-[10px] text-[#777777]">
                      {p.planName || 'Plan'} · {p.paymentDate.split('T')[0]}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-white block">
                      {settings.currencySymbol} {p.amount.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#A6E22E] font-medium">{p.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. EXPENSES TRACKER */}
        {adminSection === 'expenses' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Operating Expenses</h3>
                <p className="text-[10px] text-[#888888]">Rent, Utilities, Staff Salaries & Maintenance</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportCsv('expenses')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#202020] text-xs text-[#D4F52A] border border-[#333333] font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => setIsRecordExpenseOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5C5C] text-black font-extrabold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {expenses.map((e) => (
                <div
                  key={e.id}
                  className="bg-[#161616] border border-[#262626] rounded-2xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="text-[10px] text-[#FF5C5C] font-bold uppercase">{e.category}</span>
                    <h5 className="font-bold text-white mt-0.5">{e.title}</h5>
                    <p className="text-[10px] text-[#777777]">
                      {e.expenseDate} · Paid to: {e.paidTo || 'Vendor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#FF5C5C]">
                      -{settings.currencySymbol} {e.amount.toLocaleString()}
                    </span>
                    <p className="text-[9px] text-[#888888]">{e.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. MEMBERSHIP PLANS */}
        {adminSection === 'plans' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Membership Plans</h3>
              <span className="text-[10px] text-[#888888]">{plans.length} Configured Plans</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((p) => (
                <div key={p.id} className="bg-[#161616] border border-[#262626] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white">{p.name}</h4>
                    <span className="text-[10px] bg-[#222222] text-[#D4F52A] px-2 py-0.5 rounded-full font-bold">
                      {p.durationLabel}
                    </span>
                  </div>
                  <div className="text-lg font-black text-[#D4F52A]">
                    {settings.currencySymbol} {p.price.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#888888]">{p.description}</p>
                  <div className="space-y-1 pt-1">
                    {p.features.map((f, i) => (
                      <div key={i} className="text-[10px] text-[#aaaaaa] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#A6E22E]" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. STAFF DIRECTORY */}
        {adminSection === 'staff' && (
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Trainers & Staff</h3>
            <div className="space-y-2">
              {staffList.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#161616] border border-[#262626] rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={s.photoUrl}
                      alt={s.fullName}
                      className="w-11 h-11 rounded-full object-cover border border-[#333333]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{s.fullName}</h4>
                      <p className="text-[10px] text-[#D4F52A] font-semibold">{s.role}</p>
                      <p className="text-[10px] text-[#888888]">{s.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-white">
                      {settings.currencySymbol} {s.baseSalary.toLocaleString()}/mo
                    </span>
                    <span className="text-[9px] text-[#888888] block">+{s.commissionRatePercent}% comm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. EQUIPMENT & INVENTORY */}
        {adminSection === 'equipment' && (
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gym Equipment Inventory</h3>
            <div className="space-y-2">
              {equipmentList.map((eq) => (
                <div
                  key={eq.id}
                  className="bg-[#161616] border border-[#262626] rounded-2xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{eq.name}</h4>
                    <p className="text-[10px] text-[#888888]">
                      Qty: {eq.quantity} · {eq.location}
                    </p>
                    <p className="text-[10px] text-[#666666]">Next Service: {eq.nextServiceDueDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#A6E22E] bg-[#1a2e14] px-2 py-0.5 rounded-full">
                      {eq.condition}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. REPORTS */}
        {adminSection === 'reports' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Reports & Export Central</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExportCsv('members')}
                className="bg-[#161616] hover:bg-[#202020] border border-[#262626] rounded-2xl p-4 text-left transition-colors space-y-1"
              >
                <Users className="w-5 h-5 text-[#D4F52A]" />
                <h4 className="text-xs font-bold text-white">Export Members CSV</h4>
                <p className="text-[10px] text-[#888888]">All registered member records & balances</p>
              </button>

              <button
                onClick={() => handleExportCsv('payments')}
                className="bg-[#161616] hover:bg-[#202020] border border-[#262626] rounded-2xl p-4 text-left transition-colors space-y-1"
              >
                <CreditCard className="w-5 h-5 text-[#A6E22E]" />
                <h4 className="text-xs font-bold text-white">Export Payments CSV</h4>
                <p className="text-[10px] text-[#888888]">Complete collection records with receipt numbers</p>
              </button>

              <button
                onClick={() => handleExportCsv('expenses')}
                className="bg-[#161616] hover:bg-[#202020] border border-[#262626] rounded-2xl p-4 text-left transition-colors space-y-1"
              >
                <TrendingDown className="w-5 h-5 text-[#FF5C5C]" />
                <h4 className="text-xs font-bold text-white">Export Expenses CSV</h4>
                <p className="text-[10px] text-[#888888]">Operating expenses & utility records</p>
              </button>

              <button
                onClick={() => handleExportCsv('attendance')}
                className="bg-[#161616] hover:bg-[#202020] border border-[#262626] rounded-2xl p-4 text-left transition-colors space-y-1"
              >
                <CalendarCheck className="w-5 h-5 text-[#FFB800]" />
                <h4 className="text-xs font-bold text-white">Export Attendance CSV</h4>
                <p className="text-[10px] text-[#888888]">Check-in timestamps & daily counts</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-2">
              <h3 className="text-sm font-bold text-white">Register New Member</h3>
              <button onClick={() => setIsAddMemberOpen(false)} className="text-[#888888] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Shakil Ahmed"
                  className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="+880 1711-XXXXXX"
                  className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Membership Plan</label>
                <select
                  value={newMemberPlan}
                  onChange={(e) => setNewMemberPlan(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {settings.currencySymbol} {p.price} ({p.durationLabel})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Outstanding Due Balance (if partial)</label>
                <input
                  type="number"
                  value={newMemberDue}
                  onChange={(e) => setNewMemberDue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs uppercase tracking-wider"
              >
                Register & Save to SQLite
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-2">
              <h3 className="text-sm font-bold text-white">Receive Member Payment</h3>
              <button onClick={() => setIsRecordPaymentOpen(false)} className="text-[#888888] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Member</label>
                <select
                  value={payMemberId}
                  onChange={(e) => setPayMemberId(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberCode}) - Due: {settings.currencySymbol} {m.outstandingBalance}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#888888] mb-1 font-semibold">Amount ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] mb-1 font-semibold">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentRecord['paymentMethod'])}
                    className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Card">Card</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Payment Type</label>
                <select
                  value={payType}
                  onChange={(e) => setPayType(e.target.value as PaymentRecord['type'])}
                  className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                >
                  <option value="Full Payment">Full Payment</option>
                  <option value="Partial Payment">Partial Payment</option>
                  <option value="Renewal">Renewal</option>
                  <option value="Registration">Registration</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs uppercase tracking-wider"
              >
                Generate Receipt & Collect
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isRecordExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-2">
              <h3 className="text-sm font-bold text-white">Record Operating Expense</h3>
              <button onClick={() => setIsRecordExpenseOpen(false)} className="text-[#888888] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Expense Title</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Generator Diesel & AC Filter"
                  className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#888888] mb-1 font-semibold">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseRecord['category'])}
                    className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#888888] mb-1 font-semibold">Amount ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Paid To (Vendor/Person)</label>
                <input
                  type="text"
                  value={expPaidTo}
                  onChange={(e) => setExpPaidTo(e.target.value)}
                  placeholder="e.g. Banani Electric Center"
                  className="w-full bg-[#242424] text-white px-3 py-2 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#FF5C5C] text-black font-extrabold text-xs uppercase tracking-wider"
              >
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#191919] border border-[#2B2B2B] rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="text-center pb-2 border-b border-[#2B2B2B]">
              <span className="text-[10px] uppercase font-mono text-[#D4F52A] tracking-wider block">Official Receipt</span>
              <h3 className="text-base font-black text-white">{settings.gymName}</h3>
              <p className="text-[10px] text-[#888888]">{settings.gymPhone}</p>
            </div>

            <div className="bg-[#121212] p-3 rounded-xl border border-[#222222] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#888888]">Receipt #:</span>
                <span className="font-mono font-bold text-[#D4F52A]">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Member:</span>
                <span className="font-bold text-white">{selectedReceipt.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Date:</span>
                <span className="text-white">{selectedReceipt.paymentDate.split('T')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Payment Method:</span>
                <span className="text-white font-bold">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#222222]">
                <span className="font-bold text-white">Amount Paid:</span>
                <span className="text-sm font-black text-[#A6E22E]">
                  {settings.currencySymbol} {selectedReceipt.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#242424] text-white font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSelectedReceipt(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#D4F52A] text-black font-extrabold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
