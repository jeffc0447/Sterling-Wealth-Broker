import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, navigateToPublicPage, siteBranding } = useBroker();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const success = adminLogin(email, password);
      setIsLoading(false);
      if (!success) {
        setErrorMsg(
          'Access denied. Invalid administrator email or password. Only authorized admin personnel may sign in.'
        );
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigateToPublicPage('home')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Return to Website</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
          <Lock className="w-3.5 h-3.5" />
          <span>Restricted Admin Gateway</span>
        </div>
      </div>

      {/* Main Centered Admin Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-8">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-slate-950/60 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg overflow-hidden">
                {siteBranding.logoUrl ? (
                  <img
                    src={siteBranding.logoUrl}
                    alt={siteBranding.siteName}
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <Shield className="w-8 h-8" />
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                {siteBranding.siteName}
              </p>
              <h1 className="font-display text-2xl font-bold text-white mt-1">
                Admin Panel Sign In
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Authorized administrators only. Enter your admin credentials to access underwriting, KYC, membership approvals, and site controls.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor="admin-login-email"
                  className="block text-slate-300 font-semibold mb-1.5"
                >
                  Administrator Email
                </label>
                <div className="relative">
                  <input
                    id="admin-login-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter administrator email"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-3 pl-10 text-sm text-white placeholder:text-slate-600 focus:outline-none transition font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-login-password"
                  className="block text-slate-300 font-semibold mb-1.5"
                >
                  Administrator Password
                </label>
                <div className="relative">
                  <input
                    id="admin-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none transition font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-3 p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:text-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Admin Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Protected Route: /admin</span>
              <span>256-Bit Encrypted Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="relative z-10 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} {siteBranding.siteName} · Executive Administration Portal
      </div>
    </div>
  );
};
