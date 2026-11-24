import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { showAdminLoginModal, setShowAdminLoginModal, adminLogin, siteBranding } = useBroker();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!showAdminLoginModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = adminLogin(email, password);
      setIsLoading(false);
      if (!success) {
        setErrorMsg('Invalid administrative credentials. Please verify your email and password.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-base">
                Admin Desk Authentication
              </h3>
              <p className="text-xs text-slate-400">
                {siteBranding.siteName} · System Administration
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdminLoginModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-5">
          
          {/* Security Notice */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Restricted Executive Gateway</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Sign in with your privileged credentials to manage loan underwriter pipelines, KYC verifications, customer service agents, and escrow settings.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Administrator Username / Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-300 font-medium">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-9 pr-10 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating System Administrator...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to System Administrator Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Role: System Administrator</span>
            <span>256-Bit SSL Encrypted</span>
          </div>

        </div>

      </div>
    </div>
  );
};
