import React, { useState, useEffect, useMemo } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTierId } from '../../types';
import {
  calculateMembershipTimeline,
  calculateRenewalDateFromCycle,
  formatLongDate,
  parseFlexibleDate,
  toIsoDateString,
  MembershipCyclePeriod,
} from '../../utils/loanDateEngine';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ArrowUpRight,
  Mail,
  Copy,
  ExternalLink,
  Download,
  RefreshCw,
  Sparkles,
  Zap,
  HelpCircle,
  FileText,
  UploadCloud,
  Check,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export const UserDashboardStatusCard: React.FC = () => {
  const {
    currentUser,
    tiers,
    supportConfig,
    setCurrentView,
    triggerToast,
    resubmitClientProof,
    requestMembershipTierSelection,
    setSelectedCheckoutTier,
    updateUserMembershipDate,
  } = useBroker();

  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitFileName, setResubmitFileName] = useState('');
  const [resubmitFileError, setResubmitFileError] = useState<string | null>(null);
  const [resubmitUserNote, setResubmitUserNote] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isTierUpgradeSelectorOpen, setIsTierUpgradeSelectorOpen] = useState(false);

  // Interactive Membership Date state
  const [nowDate, setNowDate] = useState<Date>(() => new Date());
  const [isDateEditorOpen, setIsDateEditorOpen] = useState(false);

  // Active membership tier details (null when user has not yet been manually approved for a tier)
  const activeTier = currentUser.membershipTierId
    ? tiers.find((t) => t.id === currentUser.membershipTierId) || null
    : null;
  const pending = currentUser.pendingUpgrade;

  const membershipTimeline = useMemo(
    () =>
      calculateMembershipTimeline({
        memberSince: currentUser.memberSince,
        termStart: currentUser.membershipTermStart || currentUser.memberSince,
        renewalDate: currentUser.renewalDate,
        cycle: currentUser.membershipCycle,
        tierPeriod: activeTier?.period,
        referenceDate: nowDate,
      }),
    [
      currentUser.memberSince,
      currentUser.membershipTermStart,
      currentUser.renewalDate,
      currentUser.membershipCycle,
      activeTier?.period,
      nowDate,
    ]
  );

  const [draftCycle, setDraftCycle] = useState<MembershipCyclePeriod>(
    membershipTimeline.cycle
  );
  const [draftStartIso, setDraftStartIso] = useState<string>(
    membershipTimeline.termStartIso
  );
  const [draftRenewalIso, setDraftRenewalIso] = useState<string>(
    membershipTimeline.renewalDateIso
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNowDate(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setDraftCycle(membershipTimeline.cycle);
    setDraftStartIso(membershipTimeline.termStartIso);
    setDraftRenewalIso(membershipTimeline.renewalDateIso);
  }, [
    membershipTimeline.cycle,
    membershipTimeline.termStartIso,
    membershipTimeline.renewalDateIso,
  ]);

  const handleCycleSelect = (nextCycle: MembershipCyclePeriod) => {
    setDraftCycle(nextCycle);
    const startObj = parseFlexibleDate(draftStartIso);
    const recomputed = calculateRenewalDateFromCycle(startObj, nextCycle);
    setDraftRenewalIso(toIsoDateString(recomputed));
  };

  const handleStartDateChange = (nextStartIso: string) => {
    setDraftStartIso(nextStartIso);
    const startObj = parseFlexibleDate(nextStartIso);
    const recomputed = calculateRenewalDateFromCycle(startObj, draftCycle);
    setDraftRenewalIso(toIsoDateString(recomputed));
  };

  const handleSaveMembershipDates = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMembershipDate({
      termStartIso: draftStartIso,
      renewalDateIso: draftRenewalIso,
      cycle: draftCycle,
    });
    setIsDateEditorOpen(false);
  };

  // Determine the effective dynamic state
  const isPending = pending?.status === 'PENDING_VERIFICATION';
  const isDeclined = pending?.status === 'REJECTED';
  const isUnassigned = !activeTier && !isPending && !isDeclined;
  const isApproved = Boolean(activeTier) && !isPending && !isDeclined;

  const uploadedProofName =
    (pending?.proofAttachmentName && pending.proofAttachmentName.trim()) ||
    (pending?.wireProof?.receiptFileName && pending.wireProof.receiptFileName.trim()) ||
    '';
  const hasUploadedProof =
    pending?.proofStatus === 'RECEIPT_ATTACHED' ||
    pending?.proofStatus === 'EMAILED_TO_CARE' ||
    Boolean(uploadedProofName);

  const handleResubmitFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResubmitFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setResubmitFileError('File size exceeds the 10MB maximum limit.');
      return;
    }
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const lowerName = file.name.toLowerCase();
    if (!allowedExtensions.some((ext) => lowerName.endsWith(ext))) {
      setResubmitFileError('Invalid file format. Upload a PDF, PNG, or JPG payment slip.');
      return;
    }
    setResubmitFileName(file.name);
  };

  const handleResubmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitFileName.trim()) {
      setResubmitFileError('Please select a copy of your payment slip to upload.');
      return;
    }
    setIsSubmittingProof(true);
    setTimeout(() => {
      resubmitClientProof(
        resubmitFileName,
        resubmitUserNote || 'Client attached official proof of payment copy for bank clearance review.'
      );
      setIsSubmittingProof(false);
      setIsResubmitModalOpen(false);
      setResubmitUserNote('');
      setResubmitFileName('');
    }, 600);
  };

  const handleSimulateNewRequest = (tierId: MembershipTierId) => {
    const target = tiers.find((t) => t.id === tierId);
    if (target) {
      setSelectedCheckoutTier(target);
      setIsTierUpgradeSelectorOpen(false);
    }
  };

  const careAgent = supportConfig.agentName || 'Jeffery Dean';
  const careEmail = supportConfig.agentEmail || 'jeffery@accountant.com';
  const careSecondaryEmail = supportConfig.agentSecondaryEmail || 'jeffery@sterlingwealthbroker.com';
  const mailtoSubject = encodeURIComponent(
    `[Inquiry] Membership Upgrade Verification - ${currentUser.name}`
  );
  const mailtoHref = `mailto:${careEmail},${careSecondaryEmail}?subject=${mailtoSubject}`;

  return (
    <div className="space-y-4">
      {/* 2. Client-Side: User Dashboard Status Card (Screen 2) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        
        {/* Dynamic Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Membership Overview & Dynamic Entitlements
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-emerald-400">Verified Underwriting Channel</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 flex flex-wrap items-center gap-2.5">
              <span>
                {activeTier
                  ? activeTier.name
                  : isPending
                  ? pending?.requestedTierName || 'Package Pending Review'
                  : 'No Membership Tier Assigned'}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-sans font-medium border ${
                  isApproved
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : isPending
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : isDeclined
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isApproved
                  ? 'Active Approved Plan'
                  : isPending
                  ? 'Pending Customer Care Approval'
                  : isDeclined
                  ? 'Action Required'
                  : 'Not Assigned Yet'}
              </span>
            </h2>
          </div>

          {/* Quick Actions: Choose or Upgrade Tier */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTierUpgradeSelectorOpen(!isTierUpgradeSelectorOpen)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isTierUpgradeSelectorOpen
                  ? 'Close Tier Menu'
                  : activeTier
                  ? 'Upgrade Membership Tier'
                  : 'Choose Membership Tier'}
              </span>
            </button>
          </div>
        </div>

        {/* Tier Selector Dropdown if open */}
        {isTierUpgradeSelectorOpen && (
          <div className="my-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-semibold text-white">
                {activeTier
                  ? 'Select a Tier Package to Request Upgrade:'
                  : 'Choose Your Membership Tier Package:'}
              </span>
              <span className="text-[11px] text-amber-400">
                All packages are manually reviewed & approved by Customer Care Support in the Admin Panel
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {tiers.map((t) => {
                const isCurrentActive = t.id === currentUser.membershipTierId && !pending;
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2.5 ${
                      isCurrentActive
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-300'
                        : 'border-slate-700 bg-slate-900 text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                        ${t.price.toLocaleString()} / {t.period}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Up to ${t.maxLoanLimit.toLocaleString()} debt capacity
                      </div>
                    </div>

                    {isCurrentActive ? (
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                        Current Active Plan
                      </span>
                    ) : (
                      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => {
                            requestMembershipTierSelection(t.id);
                            setIsTierUpgradeSelectorOpen(false);
                          }}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Submit Choice (Care Review)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateNewRequest(t.id)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Pay &amp; Submit Proof
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DYNAMIC MEMBERSHIP OVERVIEW SECTION (Screen 2 core requirements) */}
        <div className="pt-5">
          {/* 🟡 1. PENDING STATUS BANNER */}
          {isPending && (
            <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/50 rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-1">
                      {hasUploadedProof ? 'Proof Uploaded · Under Review' : 'Awaiting Proof of Payment'}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {hasUploadedProof
                        ? 'Proof of payment received and currently under review.'
                        : 'Assigned Customer Care Specialist is awaiting your proof of payment.'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {hasUploadedProof ? (
                        <>
                          Thank you — we have received your attached payment copy{' '}
                          {uploadedProofName ? (
                            <strong className="text-emerald-300 font-mono">({uploadedProofName})</strong>
                          ) : null}{' '}
                          for <strong className="text-white">{pending?.requestedTierName}</strong> (${pending?.requestedAmount?.toLocaleString()} USD). It is currently under review for bank clearance, and your assigned Customer Care Specialist (<strong className="text-white">{supportConfig.agentName}</strong>) will contact you shortly.
                        </>
                      ) : (
                        <>
                          Your request for <strong className="text-white">{pending?.requestedTierName}</strong> (${pending?.requestedAmount?.toLocaleString()} USD) is logged, but no payment copy has been uploaded yet. Your assigned Customer Care Specialist (<strong className="text-white">{supportConfig.agentName}</strong>) is awaiting your attached copy of proof of payment for bank clearance.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">
                    Request ID
                  </span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {pending?.requestId || 'REQ-8942-MEMB'}
                  </span>
                </div>
              </div>

              {/* Explicit Proof-of-Payment Notification Callout */}
              {!hasUploadedProof ? (
                <div className="bg-amber-950/50 border border-amber-500/40 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">
                        Action Required: Attach Copy of Proof of Payment
                      </div>
                      <p className="text-amber-200/90 leading-relaxed">
                        Assigned Customer Care Specialist <strong className="text-white">{supportConfig.agentName}</strong> is awaiting your attached copy of proof of payment for bank clearance.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResubmitFileError(null);
                      setIsResubmitModalOpen(true);
                    }}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Attach Copy of Payment Slip</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-950/35 border border-emerald-500/40 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-emerald-300">
                        Proof of Payment Acknowledged · Under Bank Clearance Review
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        Your payment copy{uploadedProofName ? ` (${uploadedProofName})` : ''} has been acknowledged and is under review. Assigned Customer Care Specialist <strong className="text-white">{supportConfig.agentName}</strong> will contact you.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress & Next Step helper */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-300">
                    <span className="text-slate-400">Assigned Customer Care Specialist:</span>
                    <span className="font-semibold text-white">{careAgent}</span>
                    <span className="text-slate-600">·</span>
                    <a href={`mailto:${careEmail}`} className="font-mono text-amber-400 hover:underline">
                      {careEmail}
                    </a>
                    <span className="text-slate-500">and</span>
                    <a href={`mailto:${careSecondaryEmail}`} className="font-mono text-amber-400 hover:underline">
                      {careSecondaryEmail}
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Estimated verification turnaround: <strong>12–24 hours</strong> · Receipt status:{' '}
                    <span className={hasUploadedProof ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                      {hasUploadedProof
                        ? `Uploaded (${uploadedProofName || 'On File'}) · Under Review`
                        : 'Awaiting Proof of Payment'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={mailtoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[40px] inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Email Receipt Copy</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setResubmitFileError(null);
                      setIsResubmitModalOpen(true);
                    }}
                    className="min-h-[40px] inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 transition-all shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{hasUploadedProof ? 'Attach Updated Proof' : 'Upload Payment Slip'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 🔴 2. DECLINED STATUS NOTICE */}
          {isDeclined && (
            <div className="bg-gradient-to-r from-rose-500/15 via-slate-900 to-slate-900 border-2 border-rose-500/50 rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-1">
                      🔴 Verification Notice
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Payment verification unsuccessful
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Our customer care desk was unable to verify the transaction proof for your{' '}
                      <strong className="text-white">{pending?.requestedTierName}</strong> upgrade request.
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">
                    Request ID
                  </span>
                  <span className="font-mono text-rose-400 font-bold text-sm">
                    {pending?.requestId || 'REQ-8942-MEMB'}
                  </span>
                </div>
              </div>

              {/* Admin Reason Box */}
              <div className="bg-slate-950 border border-rose-500/30 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Reason from Operations Desk:</span>
                </div>
                <p className="text-slate-200 italic font-sans bg-rose-950/20 p-2.5 rounded border border-rose-900/40">
                  "{pending?.receiptNote || pending?.rejectionReason || 'Receipt document was unreadable or transaction reference did not match bank ledger records. Please resubmit clear proof.'}"
                </p>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Reviewed by: {pending?.reviewedByAgent || supportConfig.agentName}</span>
                  <span>Reviewed on: {pending?.reviewedAt || 'Today'}</span>
                </div>
              </div>

              {/* Actions: Contact Support or Resubmit Proof */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <a
                  href={mailtoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Support</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsResubmitModalOpen(true)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-400 active:scale-95 text-white transition-all shadow-md shadow-rose-500/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Resubmit Proof</span>
                </button>
              </div>
            </div>
          )}

          {/* ⚪ 0. UNASSIGNED MEMBERSHIP TIER BANNER */}
          {isUnassigned && (
            <div className="bg-gradient-to-r from-sky-500/10 via-slate-900 to-slate-900 border-2 border-sky-500/40 rounded-xl p-5 sm:p-6 shadow-lg space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 mb-1.5">
                      Step Required · Choose Membership Tier Package
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      No Membership Tier Package Selected Yet
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
                      Our platform does not assign membership packages automatically upon registration. Please choose your preferred membership tier package below (submit your choice for review or complete retainer checkout). Once submitted, Customer Care Support will manually review and approve your tier from the Admin Panel.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTierUpgradeSelectorOpen(true)}
                  className="min-h-[42px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition shadow-md shadow-emerald-500/20"
                >
                  <span>Choose Tier Package</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 🟢 3. APPROVED STATUS CELEBRATION BANNER */}
          {isApproved && activeTier && (
            <div className="bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-xl p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Active Member</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{activeTier.name} Status Verified</span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Your package has been manually reviewed and cleared by Customer Care Support &amp; Underwriting. All tier borrowing privileges, expedited SLAs, and syndicate facilities are fully unlocked.
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">
                    {membershipTimeline.cycle === 'quarter'
                      ? 'Quarterly Renewal Date'
                      : membershipTimeline.cycle === 'month'
                      ? 'Monthly Renewal Date'
                      : 'Annual Renewal Date'}
                  </span>
                  <span className="text-white font-semibold text-xs sm:text-sm tabular-nums">
                    {membershipTimeline.renewalDateFormatted}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5 tabular-nums">
                    {membershipTimeline.remainingDays >= 0
                      ? `${membershipTimeline.remainingDays} days remaining`
                      : `Renewal overdue by ${Math.abs(membershipTimeline.remainingDays)} days`}
                  </span>
                </div>
              </div>

              {/* Unlocked Tier Perks Grid */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-slate-200 block mb-3">
                  Unlocked Tier Perks & Underwriting Privileges:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {activeTier.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-2.5 flex items-start gap-2 text-xs text-slate-300"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Active Member */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono">
                  Active Borrowing Ceiling: <strong className="text-white">${activeTier.maxLoanLimit.toLocaleString()} USD</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerToast('Certificate Downloaded', 'Official Membership Certificate saved to your device.', 'success')}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Membership Certificate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTierUpgradeSelectorOpen(true)}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 transition-all font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <span>Upgrade to Higher Tier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Updated Membership Date & Live Cycle Tracker */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/75 border border-slate-800 rounded-xl p-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">
                  Membership Date &amp; Renewal Schedule
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-slate-400">
                  Today: <strong className="text-slate-200">{formatLongDate(nowDate)}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 tabular-nums">
                <span>
                  Cycle Start:{' '}
                  <strong className="text-slate-200">{membershipTimeline.termStartFormatted}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Next Renewal:{' '}
                  <strong className="text-emerald-400">{membershipTimeline.renewalDateFormatted}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {membershipTimeline.remainingDays >= 0
                    ? `${membershipTimeline.remainingDays} of ${membershipTimeline.totalCycleDays} days left`
                    : `${Math.abs(membershipTimeline.remainingDays)} days past renewal`}
                </span>
              </div>

              {/* Cycle Progress Bar */}
              <div className="pt-1.5 max-w-xl">
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      membershipTimeline.isExpired
                        ? 'bg-rose-500'
                        : membershipTimeline.isRenewalDueSoon
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${membershipTimeline.progressPercent}%` }}
                  />
                </div>
                {currentUser.membershipDateUpdatedAt && (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Updated {new Date(currentUser.membershipDateUpdatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsDateEditorOpen((prev) => !prev)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 inline-flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isDateEditorOpen ? 'Close Date Controls' : 'Update Membership Date'}</span>
              </button>
            </div>
          </div>

          {isDateEditorOpen && (
            <form
              onSubmit={handleSaveMembershipDates}
              className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Adjust Membership Cycle &amp; Renewal Date
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Choose a billing cadence or pick custom start and renewal dates to update your live dashboard timeline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartDateChange(toIsoDateString(new Date()))}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer self-start sm:self-auto"
                >
                  Sync Start to Today
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-[11px] font-medium text-slate-300 mb-1.5">
                    Membership Billing Cycle
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'month', label: 'Monthly' },
                        { id: 'quarter', label: 'Quarterly' },
                        { id: 'year', label: 'Annual' },
                      ] as Array<{ id: MembershipCyclePeriod; label: string }>
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleCycleSelect(opt.id)}
                        className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                          draftCycle === opt.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="membership-term-start"
                    className="block text-[11px] font-medium text-slate-300 mb-1.5"
                  >
                    Cycle Start Date
                  </label>
                  <input
                    id="membership-term-start"
                    type="date"
                    value={draftStartIso}
                    onChange={(e) => {
                      if (e.target.value) handleStartDateChange(e.target.value);
                    }}
                    className="w-full min-h-[38px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="membership-renewal-date"
                    className="block text-[11px] font-medium text-slate-300 mb-1.5"
                  >
                    Updated Renewal Date
                  </label>
                  <input
                    id="membership-renewal-date"
                    type="date"
                    value={draftRenewalIso}
                    onChange={(e) => {
                      if (e.target.value) setDraftRenewalIso(e.target.value);
                    }}
                    className="w-full min-h-[38px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400">
                  Preview:{' '}
                  <strong className="text-white">
                    {formatLongDate(parseFlexibleDate(draftStartIso))}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-emerald-400">
                    {formatLongDate(parseFlexibleDate(draftRenewalIso))}
                  </strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDateEditorOpen(false)}
                    className="min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[38px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Updated Date</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Always-Visible Assigned Customer Care Specialist Contact Bar on User Dashboard */}
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                {careAgent.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'JD'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    Assigned Customer Care Specialist
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-semibold text-white">{careAgent}</span>
                </div>
                <div className="text-xs font-mono flex flex-wrap items-center gap-x-2 gap-y-1">
                  <a href={`mailto:${careEmail}`} className="text-emerald-400 hover:underline font-medium">
                    {careEmail}
                  </a>
                  <span className="text-slate-500 font-sans">and</span>
                  <a href={`mailto:${careSecondaryEmail}`} className="text-emerald-400 hover:underline font-medium">
                    {careSecondaryEmail}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(`${careEmail}, ${careSecondaryEmail}`);
                    triggerToast('Emails Copied', `${careEmail} and ${careSecondaryEmail} copied to clipboard.`, 'success');
                  } catch {
                    // ignore
                  }
                }}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Emails</span>
              </button>
              <a
                href={mailtoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Specialist</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Resubmit Proof Modal */}
      {isResubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white text-base">
                  {hasUploadedProof ? 'Update Proof of Payment' : 'Attach Copy of Proof of Payment'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResubmitModalOpen(false)}
                className="text-slate-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Close Modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResubmitSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Select Receipt / Payment Confirmation File
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    id="resubmit-file"
                    onChange={handleResubmitFileSelect}
                  />
                  <label htmlFor="resubmit-file" className="cursor-pointer block space-y-1">
                    <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
                    <span className="block text-white font-medium">
                      {resubmitFileName || 'Click to choose your payment slip (PDF, PNG, or JPG)'}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      Attach a copy of your payment slip for bank clearance review (Max 10MB)
                    </span>
                  </label>
                </div>
                {resubmitFileError && (
                  <p className="text-[11px] text-rose-400 mt-1.5">{resubmitFileError}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Explanation or Transaction Notes (Sent to Customer Care Desk)
                </label>
                <textarea
                  rows={3}
                  value={resubmitUserNote}
                  onChange={(e) => setResubmitUserNote(e.target.value)}
                  placeholder="e.g. Uploaded high-resolution bank wire slip showing clearing reference #88190 and sender account match."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResubmitModalOpen(false)}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProof}
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {isSubmittingProof ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
