import React, { useState, useRef } from 'react';
import {
  User,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Globe,
  Settings,
  Bell,
  Scale,
  Award,
  ChevronRight,
  Check,
  AlertTriangle,
  LogIn,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sqliteDb } from '../../db/sqliteEngine';

export const ProfileScreen: React.FC = () => {
  const { profile, settings, setIsAdminMode, setIsAuthModalOpen, refreshData, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(profile.fullName);
  const [phoneInput, setPhoneInput] = useState(profile.phone);
  const [emailInput, setEmailInput] = useState(profile.email);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sqliteDb.updateProfile({
      fullName: nameInput.trim(),
      phone: phoneInput.trim(),
      email: emailInput.trim(),
    });
    refreshData();
    setIsEditingProfile(false);
    showToast('Profile updated!', 'success');
  };

  const handleToggleLanguage = (lang: 'en' | 'bn') => {
    sqliteDb.updateSettings({ language: lang });
    refreshData();
    showToast(`Language switched to ${lang === 'en' ? 'English' : 'Bengali (বাংলা)'}`, 'info');
  };

  const handleToggleWeightUnit = (unit: 'kg' | 'lbs') => {
    sqliteDb.updateSettings({ unitWeight: unit });
    refreshData();
    showToast(`Weight unit set to ${unit}`, 'info');
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const jsonStr = sqliteDb.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurafit_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Database backup downloaded successfully!', 'success');
  };

  // Import JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = sqliteDb.importDatabaseJson(content);
      if (res.success) {
        refreshData();
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Factory Reset
  const handleResetData = () => {
    sqliteDb.resetToFactory();
    refreshData();
    setShowResetConfirm(false);
    showToast('Database reset to initial factory seed state.', 'info');
  };

  return (
    <div className="flex-1 bg-[#080808] text-white p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wide">My Profile & Settings</h1>
        <button
          onClick={() => setIsAdminMode(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#171717] hover:bg-[#222222] text-xs font-bold text-[#D4F52A] border border-[#2B2B2B] transition-colors"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* 2. Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Profile Card & Preferences */}
        <div className="lg:col-span-6 space-y-5">
          {/* Member Card Banner */}
          <div className="bg-[#171717] border border-[#262626] rounded-3xl p-5 sm:p-6 flex items-center space-x-5 shadow-xl">
            <div className="relative shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#D4F52A]"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#D4F52A] text-black flex items-center justify-center font-bold text-xs shadow-md">
                <Award className="w-4 h-4 fill-black stroke-black" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white truncate">{profile.fullName}</h2>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs text-[#D4F52A] font-bold hover:underline"
                >
                  Edit Profile
                </button>
              </div>
              <p className="text-xs text-[#888888]">{profile.phone}</p>
              <p className="text-xs text-[#666666] truncate">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-extrabold text-black bg-[#D4F52A] px-2.5 py-0.5 rounded-full">
                  {profile.fitnessLevel}
                </span>
                <span className="text-[10px] text-[#A6E22E] bg-[#1a2e14] px-2.5 py-0.5 rounded-full border border-[#294c1f]">
                  Annual VIP Member
                </span>
              </div>
            </div>
          </div>

          {/* Shakil_Gym Account & Authentication */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#888888] tracking-wider uppercase">
              Shakil_Gym Account & Access
            </h3>
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{profile.fullName}</span>
                    <span className="text-[10px] bg-[#222222] text-[#D4F52A] px-2 py-0.5 rounded-full border border-[#333333] capitalize">
                      {profile.authProvider || 'Email'} Auth
                    </span>
                  </h4>
                  <p className="text-xs text-[#888888] mt-0.5">{profile.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex-1 min-w-[140px] flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#D4F52A] hover:bg-[#B8D923] text-black font-extrabold text-xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Switch Account / Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sqliteDb.logout();
                    refreshData();
                    showToast('Logged out of session.', 'info');
                  }}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3.5 rounded-xl bg-[#222222] hover:bg-[#2b2b2b] text-[#FF5C5C] font-bold text-xs border border-[#333333] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preferences & Units */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#888888] tracking-wider uppercase">Preferences</h3>
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-4">
              {/* Language Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-[#D4F52A]" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">App Language</h4>
                    <p className="text-[11px] text-[#888888]">English / Bengali (বাংলা)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-[#242424] p-1 rounded-full border border-[#333333]">
                  <button
                    onClick={() => handleToggleLanguage('en')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      settings.language === 'en' ? 'bg-[#D4F52A] text-black shadow-xs' : 'text-[#888888]'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleToggleLanguage('bn')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      settings.language === 'bn' ? 'bg-[#D4F52A] text-black shadow-xs' : 'text-[#888888]'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <div className="border-t border-[#262626]"></div>

              {/* Units */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Scale className="w-5 h-5 text-[#D4F52A]" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Weight Units</h4>
                    <p className="text-[11px] text-[#888888]">Kilograms vs Pounds</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-[#242424] p-1 rounded-full border border-[#333333]">
                  <button
                    onClick={() => handleToggleWeightUnit('kg')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      settings.unitWeight === 'kg' ? 'bg-[#D4F52A] text-black shadow-xs' : 'text-[#888888]'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    onClick={() => handleToggleWeightUnit('lbs')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      settings.unitWeight === 'lbs' ? 'bg-[#D4F52A] text-black shadow-xs' : 'text-[#888888]'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Offline SQLite Database, Backup & Restore, Reset */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#888888] tracking-wider uppercase">
              Local Storage & Backup
            </h3>
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-5 space-y-4">
              <p className="text-xs text-[#999999] leading-relaxed">
                All data is saved locally on your device in persistent SQLite storage. Export periodic backups
                to prevent data loss if browser storage is cleared.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleExportJson}
                  className="flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl bg-[#242424] hover:bg-[#2d2d2d] text-white border border-[#333333] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#D4F52A]" />
                  <span>Export Backup</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl bg-[#242424] hover:bg-[#2d2d2d] text-white border border-[#333333] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#A6E22E]" />
                  <span>Restore Backup</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJson}
                  accept=".json"
                  className="hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-3 rounded-xl bg-[#2a1313] hover:bg-[#3d1818] text-[#FF5C5C] border border-[#522222] text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset to Factory Seed Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white">AuraFit Performance v1.0.0</h4>
            <p className="text-xs text-[#777777] leading-relaxed">
              Offline-first gym fitness tracking and gym administration system. Responsive across all mobile, tablet, laptop, and desktop screen sizes.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#2B2B2B] rounded-3xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-[#2B2B2B] pb-2">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-sm"
                />
              </div>
              <div>
                <label className="block text-[#888888] mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#242424] text-white px-3.5 py-2.5 rounded-xl border border-[#333333] focus:border-[#D4F52A] focus:outline-hidden text-sm"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-3 rounded-xl bg-[#242424] text-[#888888] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#D4F52A] text-black font-extrabold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171717] border border-[#522222] rounded-3xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#3d1818] text-[#FF5C5C] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reset All Application Data?</h3>
              <p className="text-xs text-[#999999] mt-1 leading-relaxed">
                This will overwrite current members, workouts, attendance, and financial payments back to the
                original reference seed state.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-[#242424] text-[#888888] font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 py-3 rounded-xl bg-[#FF5C5C] text-black font-extrabold text-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
