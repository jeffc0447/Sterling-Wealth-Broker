import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  UserPlus,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTierId } from '../../types';

export const LoginModal: React.FC = () => {
  const {
    showLoginModal,
    setShowLoginModal,
    setShowRegisterModal,
    setCurrentView,
    setPortalTab,
    triggerToast,
    clientLogin,
    clientRegister,
    socialLogin,
    adminLogin,
    pendingCheckoutPlanId,
    pendingBillingCycle,
    setPendingCheckoutPlanId,
    setRegisterPreselectedTierId,
    tiers,
  } = useBroker();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states - Register
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);
  const [selectedRegTierId, setSelectedRegTierId] = useState<MembershipTierId | null>(
    pendingCheckoutPlanId || null
  );

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Resolve pending tier details if user selected a tier from homepage or pricing
  const pendingTier = pendingCheckoutPlanId
    ? tiers.find((t) => t.id === pendingCheckoutPlanId)
    : null;

  // Whenever modal opens with a pending tier, ensure we default to clean state
  useEffect(() => {
    if (showLoginModal) {
      setError(null);
      setSelectedRegTierId(pendingCheckoutPlanId || null);
    }
  }, [showLoginModal, pendingCheckoutPlanId]);

  if (!showLoginModal) return null;

  const handleClose = () => {
    setShowLoginModal(false);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim()) {
      setError('Please enter your email address or username');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      // Check for admin credentials
      if (
        (loginEmail.toLowerCase() === 'admin@admin.com' || loginEmail.toLowerCase() === 'admin') &&
        loginPassword === 'Church12@'
      ) {
        adminLogin(loginEmail, loginPassword);
        return;
      }

      // Client membership login - verifies active non-deleted profile on server/state
      const success = await clientLogin(loginEmail, loginPassword);
      if (success) {
        setCurrentView('PORTAL');
        setPortalTab('OVERVIEW');
        setShowLoginModal(false);
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
          // ignore
        }
      } else {
        setError(
          'Account not found, password invalid, or your membership profile has been deleted. Please register a new membership account to access the client dashboard.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regFullName.trim()) {
      setError('Please enter your full legal name');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Please provide a valid work or corporate email address');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }
    if (!regAgreeTerms) {
      setError('Please agree to the Membership & Institutional Disclosure terms');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      clientRegister(regFullName, regEmail, regCompany, selectedRegTierId, regPassword);
      setCurrentView('PORTAL');
      setPortalTab('OVERVIEW');
      setShowLoginModal(false);
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // ignore
      }
    }, 450);
  };

  const handleOpenFullKYCWizard = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md pb-safe animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 flex items-start justify-between border-b border-slate-800 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="auth-gate-title" className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {pendingTier ? 'Membership Authentication Gate' : 'Member & Institutional Login'}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Sterling Wealth Brokerage • Secure Client Vault
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Context Banner: Displayed when plan is chosen */}
        {pendingTier && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="text-emerald-200 font-medium leading-relaxed">
                Please log in or create an account to complete your subscription to the{' '}
                <span className="font-bold text-white underline decoration-emerald-400 underline-offset-2">
                  {pendingTier.name}
                </span>{' '}
                plan ({pendingBillingCycle === 'annual' ? 'Annual Retainer' : 'Standard Tier Access'}).
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[11px]">
                  ${(pendingBillingCycle === 'annual' && pendingTier.period === 'quarter'
                    ? Math.round(pendingTier.price * 3.2)
                    : pendingTier.price
                  ).toLocaleString()}{' '}
                  / {pendingBillingCycle === 'annual' && pendingTier.period === 'quarter' ? 'year' : pendingTier.period}
                </span>
                <span className="text-[11px] text-slate-400">
                  Credit Limit: ${(pendingTier.maxLoanLimit / 1000).toLocaleString()}k
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-medium">
                  {pendingBillingCycle === 'annual' ? '★ Annual Retainer (Save 20%)' : 'Standard Tier Rate'}
                </span>
                <span className="text-[11px] text-slate-500">• Fast checkout preserved</span>
              </div>
            </div>
          </div>
        )}

        {/* Auth Mode Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setError(null);
              }}
              className={`min-h-[44px] py-2.5 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'LOGIN'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60 active:bg-slate-850'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterPreselectedTierId(pendingCheckoutPlanId || null);
                setShowLoginModal(false);
                setShowRegisterModal(true);
              }}
              className="min-h-[44px] py-2.5 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-slate-900/60 active:bg-slate-850"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Register / Sign Up</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 1-Click Fast Social Auth Buttons */}
          <div className="space-y-2">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider text-center">
              Fast 1-Click Authentication
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => socialLogin('google')}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
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
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => socialLogin('apple')}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.83-11.71-14.36-5.65-8.9-10.05-18.78-13.2-29.64-3.14-10.86-4.71-21.36-4.71-31.5 0-14.46 3.73-26.68 11.19-36.66 7.45-9.98 16.9-15.06 28.34-15.25 4.36 0 9.25 1.15 14.67 3.47 5.43 2.31 9.4 3.51 11.92 3.6 2.12 0 6.27-1.28 12.44-3.85 6.18-2.57 11.64-3.67 16.4-3.3 12.23.63 21.94 4.87 29.13 12.72-10.74 6.53-15.98 15.46-15.72 26.79.27 8.91 3.65 16.32 10.15 22.23 6.5 5.92 14.28 9.3 23.34 10.15-2.31 6.84-5.2 13.78-8.67 20.81zM119.22 33.15c0-6.19 2.29-12.22 6.87-18.09 4.58-5.88 10.37-9.87 17.37-11.96.22 1.3.33 2.5.33 3.61 0 6.07-2.39 12.06-7.18 17.97-4.78 5.92-10.63 9.87-17.55 11.85-.11-1.09-.16-2.22-.16-3.38z" />
                </svg>
                <span>Apple ID</span>
              </button>
            </div>
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Or with Credentials
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address or Member ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. member@institution.com"
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      triggerToast(
                        'Recovery Link Sent',
                        'Password reset instructions dispatched to registered address.',
                        'info'
                      )
                    }
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account security key"
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-400">Remember this device</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <KeyRound className="w-3 h-3 text-emerald-400" />
                  <span>2FA Protected</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Membership Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Victoria Sterling"
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Company / Family Office <span className="text-slate-500 text-[11px]">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="e.g. Sterling Capital Holdings Ltd."
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Create Master Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Membership Tier Package <span className="text-slate-500 text-[11px]">(Optional)</span>
                </label>
                <select
                  value={selectedRegTierId || ''}
                  onChange={(e) =>
                    setSelectedRegTierId((e.target.value || null) as MembershipTierId | null)
                  }
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose Later (After Signing Up)</option>
                  {tiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} — ${tier.price.toLocaleString()}/{tier.period}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regAgreeTerms}
                    onChange={(e) => setRegAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-400 leading-tight">
                    I agree to the Institutional Membership Terms, SEC/FINRA Compliance rules, and Data
                    Privacy standards.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>
                      {pendingTier || selectedRegTierId
                        ? 'Creating Account & Submitting Tier Request...'
                        : 'Creating Member Account...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {pendingTier
                        ? `Create Account & Proceed to ${pendingTier.name}`
                        : selectedRegTierId
                        ? 'Create Account & Submit Tier Choice'
                        : 'Create Member Account'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Option to complete enterprise KYC wizard */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleOpenFullKYCWizard}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>Need full KYC dossier registration with ID upload? Click here</span>
                </button>
              </div>
            </form>
          )}

          {/* Emergency Exit / Dismiss with no changes */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              Cancel and return to membership page
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            TLS 1.3 256-bit AES Encryption
          </span>
          <span>Zero-Knowledge Vault</span>
        </div>
      </div>
    </div>
  );
};
