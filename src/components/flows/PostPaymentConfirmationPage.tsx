import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  CheckCircle2,
  Clock,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  FileText,
  UploadCloud,
  Paperclip,
  Sparkles,
  HelpCircle,
  Building,
} from 'lucide-react';

export const PostPaymentConfirmationPage: React.FC = () => {
  const {
    currentUser,
    tiers,
    supportConfig,
    setCurrentView,
    setPortalTab,
    triggerToast,
    resubmitClientProof,
  } = useBroker();

  const [hasCopiedEmail, setHasCopiedEmail] = useState(false);
  const [hasCopiedReqId, setHasCopiedReqId] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Fallback or active pending upgrade data
  const pending = currentUser.pendingUpgrade;
  const targetTier = tiers.find((t) => t.id === pending?.requestedTierId) || tiers[1]; // default Gold Executive

  const requestId = pending?.requestId || 'REQ-8942-MEMB';
  const tierName = pending?.requestedTierName || targetTier.name;
  const amount = pending?.requestedAmount || targetTier.price;
  const requestedDate = pending?.requestedAt || 'October 28, 2026 · 14:32';
  const careEmail = supportConfig.agentEmail || 'jeffery@accountant.com';
  const careSecondaryEmail = supportConfig.agentSecondaryEmail || 'jeffery@sterlingwealthbroker.com';
  const careAgent = supportConfig.agentName || 'Jeffery Dean';

  const mailtoSubject = encodeURIComponent(`[Payment Proof] ${requestId} - ${tierName} Upgrade`);
  const mailtoBody = encodeURIComponent(
    `Hello ${careAgent} & Sterling Customer Care Team,\n\nPlease find attached the payment receipt/transaction proof for my membership upgrade request:\n\n- Request ID: ${requestId}\n- Client Name: ${currentUser.name}\n- Account Email: ${currentUser.email}\n- Upgraded Tier: ${tierName}\n- Amount: $${amount.toLocaleString()} USD\n\nThank you for verifying and expediting my underwriting vault access.\n\nSincerely,\n${currentUser.name}`
  );
  const mailtoHref = `mailto:${careEmail},${careSecondaryEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`${careEmail}, ${careSecondaryEmail}`);
    setHasCopiedEmail(true);
    triggerToast('Emails Copied to Clipboard', `${careEmail} and ${careSecondaryEmail}`, 'success');
    setTimeout(() => setHasCopiedEmail(false), 2500);
  };

  const handleCopyRequestId = () => {
    navigator.clipboard.writeText(requestId);
    setHasCopiedReqId(true);
    triggerToast('Request ID Copied', requestId, 'info');
    setTimeout(() => setHasCopiedReqId(false), 2500);
  };

  const handleSimulateAttachProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fileName = file ? file.name : `Payment_Receipt_${requestId}.pdf`;
    setIsUploadingProof(true);
    setTimeout(() => {
      setUploadedFileName(fileName);
      setIsUploadingProof(false);
      resubmitClientProof(fileName, `Payment receipt ${fileName} attached by client.`);
    }, 900);
  };

  const handleGoToDashboard = () => {
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');
  };

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
        
        {/* Step Indicator Header (Screen 1 Indicator) */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-400 font-semibold tracking-wider uppercase">
              Screen 1 of 3
            </span>
            <span>·</span>
            <span className="text-white font-medium">Client-Side: Post-Payment Confirmation</span>
          </div>
          <span className="font-mono text-slate-400">
            Role: <span className="text-slate-200">Client ({currentUser.name})</span>
          </span>
        </div>

        {/* 1. System Confirmation Header */}
        <section aria-labelledby="confirmation-heading" className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-950/40 animate-in zoom-in-90 duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h1 id="confirmation-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Payment Request Received!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Thank you, <span className="text-white font-medium">{currentUser.name}</span>. Your tier upgrade order has been logged in our secure financial ledger.
            </p>
          </div>
        </section>

        {/* 2. Order / Request Summary Card */}
        <section aria-label="Order Summary" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                Target Membership Package
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {tierName}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tier Upgrade
                </span>
              </h2>
            </div>

            {/* 4. Status Badge */}
            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Current Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-sm shadow-amber-950/50">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Status: Pending Verification</span>
              </span>
            </div>
          </div>

          {/* Grid Metadata details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-left text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Unique Request ID</span>
              <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold text-sm">
                <span>{requestId}</span>
                <button
                  onClick={handleCopyRequestId}
                  title="Copy Request ID"
                  className="p-1 hover:text-white rounded hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  {hasCopiedReqId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Amount Submitted</span>
              <span className="font-display font-bold text-white text-base tabular-nums">
                ${amount.toLocaleString()} USD
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Date & Timestamp</span>
              <span className="text-slate-200 font-medium font-sans">
                {requestedDate}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Assigned Specialist</span>
              <span className="text-slate-200 font-medium">
                {careAgent}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Actionable Instruction Box (High Visual Hierarchy) */}
        <section aria-labelledby="instruction-heading" className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Mail className="w-6 h-6" />
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold block mb-1">
                  {pending?.proofStatus === 'RECEIPT_ATTACHED' || uploadedFileName || pending?.proofAttachmentName
                    ? 'Proof of Payment Uploaded · Under Review'
                    : 'Action Required · Step 2 of 2'}
                </span>
                <h3 id="instruction-heading" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {pending?.proofStatus === 'RECEIPT_ATTACHED' || uploadedFileName || pending?.proofAttachmentName
                    ? 'Proof of Payment Under Review'
                    : 'Attach a Copy of Your Payment Slip for Review'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  {pending?.proofStatus === 'RECEIPT_ATTACHED' || uploadedFileName || pending?.proofAttachmentName
                    ? `We have received your proof of payment (${uploadedFileName || pending?.proofAttachmentName}). Your payment slip is currently under review for bank clearance, and your assigned Customer Care Specialist (${careAgent}) will contact you shortly.`
                    : `Your assigned Customer Care Specialist (${careAgent}) is awaiting your attached copy of proof of payment for bank clearance. Attach your payment slip below or email it directly to:`}
                </p>
              </div>

              {/* Email Address Highlight & Action Buttons */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <a href={`mailto:${careEmail}`} className="font-mono text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition-colors">
                      {careEmail}
                    </a>
                    <span className="text-slate-400 text-xs">and</span>
                    <a href={`mailto:${careSecondaryEmail}`} className="font-mono text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition-colors">
                      {careSecondaryEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* One-click "Copy Email Address" button */}
                  <button
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors shadow-sm cursor-pointer"
                  >
                    {hasCopiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Emails</span>
                      </>
                    )}
                  </button>

                  {/* "Launch Email Client" CTA */}
                  <a
                    href={mailtoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md shadow-amber-500/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Email Client</span>
                  </a>
                </div>
              </div>

              {/* In-Browser Receipt Attachment / Upload option */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Paperclip className="w-4 h-4 text-emerald-400" />
                    <span>Attach a copy of your payment slip for review:</span>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploadingProof ? 'Uploading...' : 'Browse / Attach Receipt (PDF or Image)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleSimulateAttachProof}
                    />
                  </label>
                </div>

                {(uploadedFileName || pending?.proofAttachmentName) && (
                  <div className="mt-2 text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Attached: {uploadedFileName || pending?.proofAttachmentName}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-sans font-medium">
                      ✓ Under Review · Specialist Will Contact You
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Next Steps Helper Text & SLA Timeframe */}
        <section aria-label="Next steps" className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Estimated Verification SLA
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Our operations team usually verifies payments within <strong className="text-slate-200">12–24 hours</strong>. You will receive an immediate status update and vault unlock notification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Escrow Protected</span>
          </div>
        </section>

        {/* 6. Secondary CTA: "Go to My Dashboard" button & Role Switcher Guide */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleGoToDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 group"
          >
            <span>Go to My Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Interactive Role Switcher Tip */}
          <div className="text-xs text-slate-400 flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Tip: Switch to <strong className="text-slate-200">Admin Workspace</strong> in the top header to manually approve or decline this request!
            </span>
          </div>
        </div>

      </div>
    </main>
  );
};
