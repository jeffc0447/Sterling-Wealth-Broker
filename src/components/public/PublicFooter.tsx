import React from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Star,
  Award,
  CheckCircle2,
  FileCheck2,
  Building2,
  UserPlus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const PublicFooter: React.FC = () => {
  const {
    setCurrentView,
    setPortalTab,
    navigateToPublicPage,
    openRegistrationWithTier,
    isClientAuthenticated,
    setShowLoginModal,
    triggerToast,
  } = useBroker();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      {/* Prominent Trust & Security Badges Strip */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {/* 1. SSL */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <Lock className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-white">256-Bit SSL</span>
              <span className="text-[10px] text-slate-500">AES Hardware Vault</span>
            </div>

            {/* 2. FinCEN */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-white">FinCEN MSB</span>
              <span className="text-[10px] text-slate-500">Reg #31000218849</span>
            </div>

            {/* 3. FDIC */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <Building2 className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-white">FDIC Routing</span>
              <span className="text-[10px] text-slate-500">Partner Bank Escrow</span>
            </div>

            {/* 4. Data Privacy */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <FileCheck2 className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-white">Data Privacy</span>
              <span className="text-[10px] text-slate-500">GDPR & CCPA Safe</span>
            </div>

            {/* 5. Trustpilot */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-0.5 mb-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <span className="text-xs font-bold text-white">Trustpilot 4.9/5</span>
              <span className="text-[10px] text-slate-500">Verified Reviews</span>
            </div>

            {/* 6. BBB */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 md:col-span-1">
              <Award className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-white">BBB Accredited</span>
              <span className="text-[10px] text-slate-500">A+ Financial Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER MEMBERSHIP REGISTRATION / SIGN-UP SECTION */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border-b border-slate-800/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/40 border border-emerald-500/30 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Membership Registration Section</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Register Your Syndicate Membership Account
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Complete our secure 5-step registration form (Account Credentials, Personal Info, Residential Address, Employment, and KYC Document Upload) for instant vault activation and Tier-1 underwriting SLA coverage.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => openRegistrationWithTier('gold')}
                className="w-full sm:w-auto min-h-[44px] py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Complete Membership Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigateToPublicPage('pricing')}
                className="w-full sm:w-auto min-h-[44px] py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-750 text-slate-200 border border-slate-700/80 font-semibold text-xs sm:text-sm transition cursor-pointer text-center flex items-center justify-center"
              >
                <span>Compare Tier Benefits</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div 
              onClick={() => navigateToPublicPage('home')}
              className="flex items-center gap-3 cursor-pointer group inline-flex"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display text-base font-bold text-white tracking-wider block">
                  STERLING <span className="text-emerald-400">WEALTH</span> BROKER
                </span>
                <span className="text-[9px] tracking-widest text-slate-400 uppercase font-sans">
                  Institutional Financial Brokerage
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Connecting accredited enterprises, entrepreneurs, and private wealth clients directly to Tier-1 syndicated balance sheets under binding SLAs.
            </p>

            <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Canary Wharf, London & 40 Wall St, New York</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+1 (800) 555-STERLING</span>
              </div>
            </div>
          </div>

          {/* Dedicated About Us Feature Pages Column */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>About Us Pages</span>
              <span className="text-[9px] text-emerald-400 font-mono">Direct</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                <button
                  onClick={() => navigateToPublicPage('company-overview')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  1. Company Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPublicPage('vision-mission')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  2. Our Vision & Mission
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPublicPage('ceo-message')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  3. CEO’s Message
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPublicPage('our-team')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  4. Our Team
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPublicPage('testimonials')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  5. Testimonials
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPublicPage('membership-benefits')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  6. Membership Benefits
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPublicPage('faq')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  7. FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => navigateToPublicPage('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPublicPage('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPublicPage('contact')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact Syndicate Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (isClientAuthenticated) {
                      setCurrentView('PORTAL');
                      setPortalTab('OVERVIEW');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      navigateToPublicPage('pricing');
                    }
                  }}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={isClientAuthenticated ? 'Open your active membership tier in account dashboard' : 'View membership tiers and packages'}
                >
                  <span>Membership Tiers (/pricing)</span>
                  {isClientAuthenticated ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">Active</span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">New</span>
                  )}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openRegistrationWithTier('gold')}
                  className="hover:text-emerald-400 transition-colors font-medium text-emerald-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Member Sign-Up / Register (KYC) →</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Loan Products Catalog -> Seamless Redirection to Membership Tiers Page */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">
              Loan Products
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => {
                    navigateToPublicPage('pricing');
                    setTimeout(() => {
                      const el = document.getElementById('tier-silver') || document.getElementById('pricing-matrix');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 120);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center justify-between w-full group cursor-pointer"
                  title="Personal Loan - Redirect to Membership Tiers page (/membership or /pricing)"
                >
                  <span className="group-hover:text-white">Personal Loan</span>
                  <span className="text-[10px] text-emerald-400 font-mono">/pricing</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigateToPublicPage('pricing');
                    setTimeout(() => {
                      const el = document.getElementById('tier-gold') || document.getElementById('pricing-matrix');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 120);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center justify-between w-full group cursor-pointer"
                  title="Business Loan - Redirect to Membership Tiers page (/membership or /pricing)"
                >
                  <span className="group-hover:text-white">Business Loan</span>
                  <span className="text-[10px] text-amber-400 font-mono">/pricing</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigateToPublicPage('pricing');
                    setTimeout(() => {
                      const el = document.getElementById('tier-diamond') || document.getElementById('pricing-matrix');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 120);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center justify-between w-full group cursor-pointer"
                  title="Financial Instruments - Redirect to Membership Tiers page (/membership or /pricing)"
                >
                  <span className="group-hover:text-white">Financial Instruments</span>
                  <span className="text-[10px] text-sky-400 font-mono">/pricing</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Client & Compliance */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">
              Client & Security
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (isClientAuthenticated) {
                      setCurrentView('PORTAL');
                      setPortalTab('OVERVIEW');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer group text-left min-h-[36px]"
                  title={isClientAuthenticated ? 'Open your logged-in account dashboard' : 'Client Login - Sign in to access your dashboard'}
                >
                  <span>{isClientAuthenticated ? 'Client Account Dashboard' : 'Client Login & Dashboard'}</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (isClientAuthenticated) {
                      setCurrentView('PORTAL');
                      setPortalTab('DOCUMENTS');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left min-h-[36px] flex items-center"
                >
                  Encrypted Document Vault
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (isClientAuthenticated) {
                      setCurrentView('PORTAL');
                      setPortalTab('APPLY');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left min-h-[36px] flex items-center"
                >
                  Loan Application Wizard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openRegistrationWithTier('gold')}
                  className="hover:text-emerald-400 text-emerald-400/90 transition-colors flex items-center gap-1 cursor-pointer text-left min-h-[36px]"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Member Registration (KYC)</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal & Disclaimers Footer */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Sterling Wealth Brokerage Ltd. Registered FinCEN MSB #31000218849. All Rights Reserved.
          </div>
          <div className="flex items-center gap-3 mt-3 sm:mt-0 flex-wrap">
            <button
              type="button"
              onClick={() => triggerToast('Privacy Statement', 'All financial statements, tax filings, and KYC documents are protected under strict 256-bit AES encryption with zero third-party disclosure.', 'info')}
              className="hover:text-slate-300 cursor-pointer text-left"
            >
              Privacy Statement
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => triggerToast('Terms of Brokerage', 'Brokerage agreements are executed under bilateral institutional non-circumvention, non-disclosure (NCND) terms with FDIC partner banks.', 'info')}
              className="hover:text-slate-300 cursor-pointer text-left"
            >
              Terms of Brokerage
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => triggerToast('KYC/AML Policy', 'Fully compliant with FinCEN MSB regulations (#31000218849) and Bank Secrecy Act (BSA) AML screening protocols.', 'info')}
              className="hover:text-slate-300 cursor-pointer text-left"
            >
              KYC/AML Policy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => triggerToast('Placement SLA Guarantee', 'Binding 100% money-back guarantee if our desk fails to present at least two qualifying term sheets within your tier SLA.', 'info')}
              className="hover:text-slate-300 cursor-pointer text-left"
            >
              Placement SLA Guarantee
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
