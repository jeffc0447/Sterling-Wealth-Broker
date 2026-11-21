import React, { useState } from 'react';
import { UserPlus, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const FloatingRegisterFAB: React.FC = () => {
  const {
    currentView,
    showRegisterModal,
    showLoginModal,
    openRegistrationWithTier,
    setShowRegisterModal,
    setPortalTab,
  } = useBroker();

  const [isHovered, setIsHovered] = useState(false);

  // Hide FAB if admin mode is active or modals are currently open
  if (currentView === 'ADMIN' || showRegisterModal || showLoginModal) {
    return null;
  }

  const handleOpenRegistration = () => {
    if (currentView === 'PORTAL') {
      setPortalTab('APPLY');
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // ignore
      }
    } else {
      openRegistrationWithTier('gold');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-end pb-safe">
      {/* Expanded Pill Tooltip on Hover */}
      <div
        className={`mr-3 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-emerald-500/30 text-white shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-none flex items-center gap-2 ${
          isHovered
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <div className="text-left">
          <p className="text-xs font-semibold text-white flex items-center gap-1">
            {currentView === 'PORTAL' ? 'Apply for Facility' : 'Membership Registration'}
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
          </p>
          <p className="text-[10px] text-slate-400">
            {currentView === 'PORTAL' ? 'Launch Underwriting Loan Wizard' : 'Apply for Tier & Unlock Loans up to $1M'}
          </p>
        </div>
      </div>

      {/* Main Circular Floating Action Button */}
      <button
        type="button"
        onClick={handleOpenRegistration}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        aria-label={currentView === 'PORTAL' ? 'Apply for Loan Facility' : 'Open Membership Registration'}
      >
        {/* Subtle pulsating outer ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/20 group-hover:bg-emerald-400/40 animate-ping opacity-75 duration-1000" />

        {/* Icon with rotational hover micro-interaction */}
        <UserPlus className="w-6 h-6 text-slate-950 transition-transform duration-300 group-hover:scale-110" />

        {/* Top-right micro spark badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-slate-950 shadow">
          ★
        </span>
      </button>
    </div>
  );
};
