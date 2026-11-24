import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { ApplicationStatus } from '../../types';
import { UserDashboardStatusCard } from '../flows/UserDashboardStatusCard';
import { ClientMembershipPlans } from './ClientMembershipPlans';
import { EncryptedChat } from './EncryptedChat';
import { TierLoanDateEngine } from './TierLoanDateEngine';
import {
  ShieldAlert,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Building,
  PlusCircle,
  FolderLock,
  MessageSquare,
  MessageSquareLock,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const PortalOverview: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const {
    currentUser,
    tiers,
    applications,
    documents,
    setPortalTab,
    setCurrentView,
    supportConfig,
  } = useBroker();

  const currentTier = currentUser.membershipTierId
    ? tiers.find((t) => t.id === currentUser.membershipTierId) || null
    : null;
  const userApps = applications.filter((a) => a.userId === currentUser.id);

  // Compute borrowing utilization
  const totalRequestedOrApproved = userApps.reduce((acc, curr) => {
    if (curr.status !== 'REJECTED') return acc + curr.requestedAmount;
    return acc;
  }, 0);

  const maxLimit = currentTier?.maxLoanLimit || 0;
  const utilizationPercent =
    maxLimit > 0 ? Math.min(100, Math.round((totalRequestedOrApproved / maxLimit) * 100)) : 0;

  const pipelineStages: ApplicationStatus[] = [
    'PENDING',
    'UNDER_REVIEW',
    'PARTNER_SUBMITTED',
    'APPROVED',
    'DISBURSED',
  ];

  const getStageIndex = (status: ApplicationStatus) => {
    return pipelineStages.indexOf(status);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Pending Review</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Desk Underwriting</span>;
      case 'PARTNER_SUBMITTED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Partner Bank Submitted</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Approved by Syndicate</span>;
      case 'DISBURSED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Capital Disbursed</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Application Declined</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen 2: Dynamic User Dashboard Status Card */}
      <UserDashboardStatusCard />
      
      {/* Top 3 Quick Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Tier Borrowing Capacity utilization */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Active Tier Capacity</span>
              <span className="font-semibold text-amber-400">
                {currentTier ? currentTier.name : 'No Active Tier'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="font-display text-2xl font-bold text-white">
                ${totalRequestedOrApproved.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">
                / ${maxLimit.toLocaleString()} Allocated
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  utilizationPercent > 85 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{utilizationPercent}% Capacity Engaged</span>
              <span>${Math.max(0, maxLimit - totalRequestedOrApproved).toLocaleString()} Available</span>
            </div>
          </div>

          {utilizationPercent >= 80 && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-amber-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Near tier ceiling
              </span>
              <button
                onClick={() => {
                  setCurrentView('PUBLIC');
                  setTimeout(() => {
                    document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <span>Upgrade to Platinum ($1M)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* KYC Compliance Vault Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Encrypted Vault Status</span>
              <span className="text-emerald-400 font-medium">AES-256 GCM</span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-display text-2xl font-bold text-white">
                {documents.filter((d) => d.status === 'VERIFIED').length} / {documents.length}
              </span>
              <span className="text-xs text-slate-400">Files Cleared</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your identity & corporate tax filings are verified. 1 pending registration statement undergoing final compliance review.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Zero bureau inquiry footprint</span>
            <button
              onClick={() => setPortalTab('DOCUMENTS')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Manage Vault</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dedicated Advisor Desk */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Broker Coverage</span>
              <span className="text-emerald-400 font-medium">
                SLA: {currentTier ? currentTier.processingSLA : 'Pending Tier Approval'}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white">
              {currentUser.assignedBroker}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active direct channel for term negotiations, banking covenants, and closing documents.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Broker Online
            </span>
            <button
              onClick={() => setPortalTab('MESSAGES')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Open Encrypted Chat Tab</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Encrypted Broker Chat Session on Client Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Live Client Session
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AI Robot & Underwriter Active</span>
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mt-1 flex items-center gap-2">
              <MessageSquareLock className="w-5 h-5 text-emerald-400" />
              <span>Encrypted Broker Chat Session</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Chat directly with your assigned broker and underwriting desk. Automated AI Robot triage handles preliminary questions; after 3–5 questions, inquiries automatically transition to your assigned Customer Care Specialist ({supportConfig.agentName || 'Jeff Campbell'}) for further assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isChatOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{isChatOpen ? 'Minimize Chat' : 'Open Live Chat'}</span>
            </button>
            <button
              onClick={() => setPortalTab('MESSAGES')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Full Chat Tab</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Embedded Live Encrypted Chat Session or Collapsed Preview */}
        {isChatOpen ? (
          <EncryptedChat embedded={true} />
        ) : (
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-white block">Automated AI Robot Desk Standby</span>
                <span className="text-[11px] text-slate-400">Underwriting assistant active. Click to chat or inquire about terms.</span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Resume Chat
            </button>
          </div>
        )}
      </div>

      {/* Tier-Based Loan Date Calculation Engine */}
      <TierLoanDateEngine />

      {/* Active Loan Applications Tracker Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Active Loan Applications & Syndicate Status
            </h2>
            <p className="text-xs text-slate-400">
              Real-time progression through underwriting, bank partner submission, and capital disbursement.
            </p>
          </div>

          <button
            onClick={() => setPortalTab('APPLY')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for New Loan</span>
          </button>
        </div>

        {userApps.length === 0 ? (
          <div className="text-center py-12 bg-slate-950 rounded-xl border border-slate-800/80">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No Active Applications</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven&apos;t submitted any loan applications under{' '}
              {currentTier ? `your ${currentTier.name}` : 'your account'} yet.
            </p>
            <button
              onClick={() => setPortalTab('APPLY')}
              className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs"
            >
              Start Loan Application
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userApps.map((app) => {
              const currentStepIdx = getStageIndex(app.status);

              return (
                <div
                  key={app.id}
                  className="bg-slate-950 border border-slate-800/90 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">
                          {app.applicationNumber}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-semibold text-white">
                          {app.instrumentTitle}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Purpose: {app.purpose}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-display font-bold text-white">
                          ${app.requestedAmount.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {app.termMonths} Months Horizon
                        </span>
                      </div>
                      <div>{getStatusBadge(app.status)}</div>
                    </div>
                  </div>

                  {/* 5-Step Visual Progress Bar */}
                  <div>
                    <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-medium text-slate-400 mb-2">
                      <div className={currentStepIdx >= 0 ? 'text-emerald-400' : ''}>1. Received</div>
                      <div className={currentStepIdx >= 1 ? 'text-emerald-400' : ''}>2. Desk Underwriting</div>
                      <div className={currentStepIdx >= 2 ? 'text-emerald-400' : ''}>3. Bank Syndicate</div>
                      <div className={currentStepIdx >= 3 ? 'text-emerald-400' : ''}>4. Approved</div>
                      <div className={currentStepIdx >= 4 ? 'text-emerald-400' : ''}>5. Disbursed</div>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 h-2 bg-slate-900 rounded-full p-0.5">
                      {[0, 1, 2, 3, 4].map((stepIdx) => (
                        <div
                          key={stepIdx}
                          className={`h-full rounded-full transition-all ${
                            currentStepIdx >= stepIdx
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Underwriter Notes Strip */}
                  {app.underwriterNotes && app.underwriterNotes.length > 0 && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                      <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                        <span>Underwriting Desk & Syndicate Notes:</span>
                        {app.partnerBank && (
                          <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            Matched: {app.partnerBank}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-xs">
                        {app.underwriterNotes[app.underwriterNotes.length - 1]}
                      </p>
                    </div>
                  )}

                  {/* Bottom Actions for Application */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-400">
                      <span>Submitted {app.submittedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {app.lastUpdated}</span>
                      {app.estimatedDisbursementDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400">
                            Est. Disbursement: {app.estimatedDisbursementDate}
                          </span>
                        </>
                      )}
                      {app.maturityDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-300">
                            Maturity: {app.maturityDate}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setPortalTab('MESSAGES')}
                      className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Inquire with Broker Desk</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grouped Membership Packages & Stated Privileges */}
      <ClientMembershipPlans />

    </div>
  );
};
