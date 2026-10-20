import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle, ArrowRight, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sqliteDb } from '../../db/sqliteEngine';
import { FitnessLevel } from '../../types/database';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, refreshData, showToast } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFitnessLevel, setRegFitnessLevel] = useState<FitnessLevel>('Intermediate');

  if (!isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const res = sqliteDb.loginWithEmail(loginEmail, loginPassword);
      setLoading(false);
      if (res.success) {
        refreshData();
        showToast(res.message, 'success');
        setIsAuthModalOpen(false);
      } else {
        showToast(res.message, 'error');
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = sqliteDb.registerWithEmail({
        fullName: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        fitnessLevel: regFitnessLevel,
      });
      setLoading(false);
      if (res.success) {
        refreshData();
        showToast(res.message, 'success');
        setIsAuthModalOpen(false);
      } else {
        showToast(res.message, 'error');
      }
    }, 400);
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setLoading(true);
    setTimeout(() => {
      const res = sqliteDb.loginWithOAuth(provider);
      setLoading(false);
      refreshData();
      showToast(res.message, 'success');
      setIsAuthModalOpen(false);
    }, 500);
  };

  const handleQuickDemo = (userType: 'shakil' | 'michael') => {
    if (userType === 'shakil') {
      handleOAuthLogin('google');
    } else {
      sqliteDb.loginWithEmail('michael.law@aurafit.com', 'password123');
      refreshData();
      showToast('Signed in as Michael Law (Member)', 'success');
      setIsAuthModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh] shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* Header with Shakil_Gym Branding */}
        <div className="relative p-6 bg-gradient-to-b from-[#1c1c1c] to-[#121212] border-b border-[#222222] text-center">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#242424] hover:bg-[#333333] text-[#aaaaaa] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#D4F52A] flex items-center justify-center text-black font-black mx-auto mb-2.5 shadow-[0_0_20px_rgba(212,245,42,0.4)]">
            <Flame className="w-7 h-7 fill-black stroke-black" />
          </div>

          <h2 className="text-xl font-black text-white tracking-wide flex items-center justify-center gap-1.5">
            <span>Shakil_Gym</span>
          </h2>
          <p className="text-xs text-[#888888] mt-0.5">
            {authMode === 'signin' ? 'Sign in to access your workout and stats' : 'Create an account to join Shakil_Gym'}
          </p>

          {/* Switch tabs */}
          <div className="flex items-center justify-center space-x-1.5 bg-[#202020] p-1 rounded-full border border-[#2e2e2e] max-w-[240px] mx-auto mt-4">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-[#D4F52A] text-black shadow-sm'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#D4F52A] text-black shadow-sm'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              New Register
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Social Logins: Google & GitHub */}
          <div className="space-y-2.5">
            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] text-white font-bold transition-all active:scale-98 cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* GitHub Login Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] text-white font-bold transition-all active:scale-98 cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-3 py-1">
            <div className="flex-1 h-px bg-[#262626]"></div>
            <span className="text-[10px] text-[#666666] uppercase font-bold tracking-wider">
              Or with credentials
            </span>
            <div className="flex-1 h-px bg-[#262626]"></div>
          </div>

          {/* SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#888888] mb-1">
                  Email Address or Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. shakil@gmail.com or michael.law@aurafit.com"
                    className="w-full bg-[#1b1b1b] border border-[#2d2d2d] rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder-[#666666] text-xs focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#888888] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#1b1b1b] border border-[#2d2d2d] rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder-[#666666] text-xs focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#888888] pt-0.5">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-sm accent-[#D4F52A]" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset link sent to registered email.', 'info')}
                  className="text-[#D4F52A] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#D4F52A] hover:bg-[#B8D923] text-black font-extrabold text-xs uppercase tracking-wider transition-transform active:scale-98 shadow-[0_0_15px_rgba(212,245,42,0.3)] mt-2 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Sign In to Shakil_Gym'}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#888888] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Shakil Ahmed"
                    className="w-full bg-[#1b1b1b] border border-[#2d2d2d] rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder-[#666666] text-xs focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#888888] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="shakil@example.com"
                    className="w-full bg-[#1b1b1b] border border-[#2d2d2d] rounded-2xl px-3 py-2.5 text-white placeholder-[#666666] text-xs focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#888888] mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+880 17XXXXXXXX"
                    className="w-full bg-[#1b1b1b] border border-[#2d2d2d] rounded-2xl px-3 py-2.5 text-white placeholder-[#666666] text-xs focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#888888] mb-1">Fitness Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advance'] as FitnessLevel[]).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setRegFitnessLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        regFitnessLevel === lvl
                          ? 'bg-[#D4F52A] text-black border-[#D4F52A]'
                          : 'bg-[#1b1b1b] text-[#888888] border-[#2d2d2d]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#888888] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1b1b1b] border border-[#2d2d2d] rounded-2xl px-3 py-2.5 text-white text-xs focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#888888] mb-1">Confirm</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1b1b1b] border border-[#2d2d2d] rounded-2xl px-3 py-2.5 text-white text-xs focus:outline-hidden focus:border-[#D4F52A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#D4F52A] hover:bg-[#B8D923] text-black font-extrabold text-xs uppercase tracking-wider transition-transform active:scale-98 shadow-[0_0_15px_rgba(212,245,42,0.3)] mt-2 cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Register & Join Shakil_Gym'}
              </button>
            </form>
          )}

          {/* Quick Demo Logins */}
          <div className="pt-2 border-t border-[#222222]">
            <p className="text-[10px] text-[#666666] font-semibold mb-2 text-center uppercase tracking-wider">
              Quick 1-Click Demo Profiles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('shakil')}
                className="py-2 px-2.5 rounded-xl bg-[#1b1b1b] hover:bg-[#252525] border border-[#2e2e2e] text-[10px] text-white font-bold flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4F52A]" />
                <span>Shakil Ahmed (Admin)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('michael')}
                className="py-2 px-2.5 rounded-xl bg-[#1b1b1b] hover:bg-[#252525] border border-[#2e2e2e] text-[10px] text-white font-bold flex items-center justify-center space-x-1"
              >
                <User className="w-3.5 h-3.5 text-[#A6E22E]" />
                <span>Michael Law (Member)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
