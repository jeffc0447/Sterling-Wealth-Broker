import React from 'react';
import { useBroker, PortalTab } from '../../context/BrokerContext';
import { calculateMembershipTimeline } from '../../utils/loanDateEngine';
import { LayoutDashboard, PlusCircle, FolderLock, Receipt, MessageSquareLock, ShieldCheck, UserCheck, PhoneCall, LogOut, Globe } from 'lucide-react';

export const PortalHeader: React.FC = () => {
  const { portalTab, setPortalTab, currentUser, tiers, clientLogout, setCurrentView } = useBroker();
  const currentTier = currentUser.membershipTierId
    ? tiers.find((t) => t.id === currentUser.membershipTierId) || null
    : null;
  const membershipTimeline = calculateMembershipTimeline({
    memberSince: currentUser.memberSince,
    termStart: currentUser.membershipTermStart || currentUser.memberSince,
    renewalDate: currentUser.renewalDate,
    cycle: currentUser.membershipCycle,
    tierPeriod: currentTier?.period,
  });
  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'MB';

  const tabs: Array<{ id: PortalTab; label: string; icon: React.ReactNode }> = [
    { id: 'OVERVIEW', label: 'Portfolio Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'APPLY', label: 'Apply for Loan', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'DOCUMENTS', label: 'Document Vault (KYC)', icon: <FolderLock className="w-4 h-4" /> },
    { id: 'PAYMENTS', label: 'Invoices & Receipts', icon: <Receipt className="w-4 h-4" /> },
    { id: 'MESSAGES', label: 'Encrypted Broker Chat', icon: <MessageSquareLock className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      {/* Client Identity & Privilege Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-slate-800 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-base shadow-lg shadow-emerald-950/40">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-white">
                  {currentUser.name}
                </h1>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${currentUser.kycStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentUser.kycStatus === 'VERIFIED' ? 'KYC Verified' : 'KYC In Review'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser.company} · Member since {membershipTimeline.memberSinceFormatted} · Renewal {membershipTimeline.renewalDateFormatted}
              </p>
            </div>
          </div>

          {/* Assigned Broker Card, Tier Pill & Sign Out */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs min-w-[140px] flex-1 sm:flex-initial">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Assigned Principal Broker
              </span>
              <div className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{currentUser.assignedBroker}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <PhoneCall className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                <span className="truncate">{currentUser.brokerDirectLine}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-2 text-left sm:text-right min-w-[140px] flex-1 sm:flex-initial">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">
                {currentTier ? 'Active Membership Tier' : 'Membership Tier'}
              </span>
              <div className="text-base font-display font-bold text-white">
                {currentTier
                  ? currentTier.name
                  : currentUser.pendingUpgrade?.status === 'PENDING_VERIFICATION'
                  ? `${currentUser.pendingUpgrade.requestedTierName} (Pending Review)`
                  : 'No Tier Assigned'}
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">
                {currentTier
                  ? `Ceiling: $${currentTier.maxLoanLimit.toLocaleString()}`
                  : 'Pending Customer Care Approval'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('PUBLIC')}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 min-h-[44px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              title="Return to Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Public Website</span>
            </button>

            <button
              type="button"
              onClick={clientLogout}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] bg-slate-950 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/50 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer group shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              title="Sign out of client membership dashboard"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 group-hover:-translate-x-0.5 transition-all" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation with 44px min touch heights */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 border-t border-slate-800/80 mt-4 no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPortalTab(tab.id)}
              className={`flex items-center gap-2 min-h-[44px] py-2 px-4 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                portalTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70 active:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
