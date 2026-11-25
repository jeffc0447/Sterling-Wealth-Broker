import React, { useState } from 'react';
import {
  MembershipTier,
  PaymentMethod,
  CryptoPaymentDetails,
  BillingAddress,
  SubmittedWireProof,
} from '../../types';
import { useBroker } from '../../context/BrokerContext';
import {
  X,
  ShieldCheck,
  CreditCard,
  Landmark,
  CheckCircle2,
  Coins,
  ArrowRight,
  Mail,
  AlertCircle,
  MapPin,
  Building,
  Lock,
  Clock,
  Globe,
  FileCheck,
  Copy,
  Check,
  UploadCloud,
  FileText,
  ExternalLink,
  BadgeCheck,
  Phone,
  Sparkles,
} from 'lucide-react';
import { CryptoPaymentGateway } from './CryptoPaymentGateway';
import {
  SUPPORTED_COUNTRIES,
  POPULAR_US_STATES,
  validatePaymentAndBilling,
  simulateServerCheckoutApi,
  ValidationErrors,
} from '../../services/checkoutService';

interface CheckoutModalProps {
  tier: MembershipTier | null;
  onClose: () => void;
}

type MainGatewayCategory = 'STRIPE_CARD' | 'CRYPTO' | 'BANK_WIRE';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ tier, onClose }) => {
  const { upgradeTier, supportConfig, setCurrentView, setPortalTab, currentUser, triggerToast } = useBroker();
  
  const isCardEnabled = supportConfig.enabledGateways?.card !== false;
  const isCryptoEnabled = supportConfig.enabledGateways?.crypto !== false;
  const isWireEnabled = supportConfig.enabledGateways?.wire !== false;

  const getInitialGateway = (): MainGatewayCategory => {
    if (isCardEnabled) return 'STRIPE_CARD';
    if (isCryptoEnabled) return 'CRYPTO';
    if (isWireEnabled) return 'BANK_WIRE';
    return 'STRIPE_CARD';
  };

  const [gatewayCategory, setGatewayCategory] = useState<MainGatewayCategory>(getInitialGateway);
  const [instructionPopup, setInstructionPopup] = useState<'card' | 'crypto' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completedCategory, setCompletedCategory] = useState<MainGatewayCategory>('STRIPE_CARD');
  const [completedCryptoDetails, setCompletedCryptoDetails] = useState<CryptoPaymentDetails | null>(null);
  const [completedTxHash, setCompletedTxHash] = useState<string>('');
  const [completedInvoiceNumber, setCompletedInvoiceNumber] = useState<string>('');
  const [completedBillingAddress, setCompletedBillingAddress] = useState<BillingAddress | null>(null);
  const [completedWireProof, setCompletedWireProof] = useState<SubmittedWireProof | null>(null);
  const [showWireNoticeModal, setShowWireNoticeModal] = useState<boolean>(false);

  // Card Form & Billing Address States
  const [cardholderName, setCardholderName] = useState(currentUser?.name || 'Alexander Vance');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('883');

  // Billing Address fields (Street 1 & Street 2)
  const [streetAddress, setStreetAddress] = useState(
    currentUser?.billingAddress?.streetAddress || '450 Montgomery St'
  );
  const [streetAddress2, setStreetAddress2] = useState(
    currentUser?.billingAddress?.streetAddress2 || 'Suite 1400'
  );
  const [city, setCity] = useState(currentUser?.billingAddress?.city || 'San Francisco');
  const [state, setState] = useState(currentUser?.billingAddress?.state || 'CA');
  const [zipCode, setZipCode] = useState(currentUser?.billingAddress?.zipCode || '94104');
  const [country, setCountry] = useState(currentUser?.billingAddress?.country || 'United States');

  // Bank Wire Form States
  const [wireRefNumber, setWireRefNumber] = useState(
    () => `${supportConfig.bankWire?.referencePrefix || 'SWB-WIRE'}-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [wireRemitterName, setWireRemitterName] = useState(currentUser?.name || 'Alexander Vance');
  const [wireRemitterBank, setWireRemitterBank] = useState('JPMorgan Chase Bank, N.A.');
  const [wireReceiptFile, setWireReceiptFile] = useState<{
    name: string;
    size: string;
    uploadedAt: string;
  } | null>(null);
  const [wireUploadError, setWireUploadError] = useState<string | null>(null);
  const [cardSlipFile, setCardSlipFile] = useState<{
    name: string;
    size: string;
    uploadedAt: string;
  } | null>(null);
  const [completedCryptoProofName, setCompletedCryptoProofName] = useState<string | null>(null);

  // Copy feedback state for bank wire details
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form Validation & Feedback
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

  if (!tier) return null;

  // Real-time AVS validation check
  const isAvsPassing =
    streetAddress.trim().length >= 4 &&
    zipCode.trim().length >= 3 &&
    city.trim().length >= 2;

  const handleCopyText = (text: string, fieldKey: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedBankField(fieldKey);
      setTimeout(() => setCopiedBankField(null), 2000);
    } catch {
      // ignore
    }
  };

  const careAgent = supportConfig.agentName || 'Jeffery Dean';
  const careEmail = supportConfig.agentEmail || 'jeffery@accountant.com';
  const careSecondaryEmail = supportConfig.agentSecondaryEmail || 'jeffery@sterlingwealthbroker.com';
  const careEmailsCombined = `${careEmail} and ${careSecondaryEmail}`;
  const careMailtoList = `${careEmail},${careSecondaryEmail}`;

  const handleCopyCareEmail = () => {
    try {
      navigator.clipboard.writeText(`${careEmail}, ${careSecondaryEmail}`);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // ignore
    }
  };

  // Card Payment Submission (Instant AVS Verification & Activation)
  const handleCardPaymentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setServerErrorMessage(null);

    const formData = {
      cardholderName,
      cardNumber,
      cardExpiry,
      cardCvc,
      streetAddress,
      streetAddress2,
      city,
      state,
      zipCode,
      country,
    };

    // Client-side validation check
    const validation = validatePaymentAndBilling(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsProcessing(true);

    try {
      // Server-side simulated endpoint API call
      const response = await simulateServerCheckoutApi({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        tier,
        formData,
        paymentMethod: 'STRIPE_CARD',
      });

      if (!response.success) {
        setServerErrorMessage(response.message || 'Payment processing failed on server.');
        if (response.errors) setFormErrors(response.errors);
        setIsProcessing(false);
        return;
      }

      const verifiedAddress: BillingAddress = {
        streetAddress,
        streetAddress2,
        city,
        state,
        zipCode,
        country,
      };

      const cardLast4 = cardNumber.replace(/\D/g, '').slice(-4) || '9821';
      const invoiceNumber = response.transaction?.invoiceNumber || `INV-SWB-2026-${Date.now().toString().slice(-4)}`;
      const txHash = response.transaction?.txHash || `ch_${Date.now().toString(36)}`;

      // Persist to Central Broker Store staged for manual admin upgrade
      upgradeTier(
        tier.id,
        'STRIPE_CARD',
        undefined,
        verifiedAddress,
        cardholderName,
        cardLast4,
        undefined,
        undefined,
        false,
        cardSlipFile?.name || null
      );

      setCompletedCategory('STRIPE_CARD');
      setCompletedBillingAddress(verifiedAddress);
      setCompletedTxHash(txHash);
      setCompletedInvoiceNumber(invoiceNumber);
      setCompletedCryptoProofName(cardSlipFile?.name || null);
      setIsProcessing(false);
      setIsComplete(true);
    } catch {
      setServerErrorMessage('A communication error occurred with the payment gateway. Please retry.');
      setIsProcessing(false);
    }
  };

  // Crypto Payment Success (Staged for manual admin upgrade)
  const handleCryptoSuccess = (
    method: PaymentMethod,
    details: CryptoPaymentDetails,
    proofFile?: { name: string; size: string; uploadedAt: string } | null
  ) => {
    const verifiedAddress: BillingAddress = {
      streetAddress,
      streetAddress2,
      city,
      state,
      zipCode,
      country,
    };

    upgradeTier(
      tier.id,
      method,
      details,
      verifiedAddress,
      cardholderName,
      details.coin,
      undefined,
      undefined,
      false,
      proofFile?.name || null
    );

    setCompletedCategory('CRYPTO');
    setCompletedBillingAddress(verifiedAddress);
    setCompletedCryptoDetails(details);
    setCompletedCryptoProofName(proofFile?.name || null);
    setCompletedTxHash(details.explorerUrl?.split('/').pop() || `0x${Date.now().toString(16)}`);
    setCompletedInvoiceNumber(`INV-SWB-CRYPTO-${Date.now().toString().slice(-4)}`);
    setIsComplete(true);
  };

  // File Picker for Wire Proof
  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWireUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setWireUploadError('File size exceeds the 15MB maximum limit.');
        return;
      }
      const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
      const lowerName = file.name.toLowerCase();
      if (!allowedExtensions.some((ext) => lowerName.endsWith(ext))) {
        setWireUploadError('Invalid file format. Please upload PDF, PNG, JPG, or DOCX.');
        return;
      }
      setWireReceiptFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: 'Just now',
      });
      triggerToast('Payment Slip Attached', `${file.name} uploaded for underwriting review.`, 'success');
    }
  };

  // File Picker for Credit Card Slip
  const handleCardSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      triggerToast('File Too Large', 'Payment slip file must be 10MB or smaller.', 'error');
      return;
    }
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const lowerName = file.name.toLowerCase();
    if (!allowedExtensions.some((ext) => lowerName.endsWith(ext))) {
      triggerToast('Invalid Format', 'Please attach a PDF, PNG, or JPG copy of your payment slip.', 'error');
      return;
    }
    setCardSlipFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: 'Just now',
    });
  };

  // Bank Wire Transfer Submission (Manual/Offline Verification Workflow)
  const handleWireSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setWireUploadError(null);

    if (!wireRefNumber.trim()) {
      setWireUploadError('Please provide your Wire Reference / Fedwire Confirmation Number.');
      return;
    }
    if (!wireRemitterName.trim()) {
      setWireUploadError('Please provide the legal remitter name on the wire remittance.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const verifiedAddress: BillingAddress = {
        streetAddress,
        streetAddress2,
        city,
        state,
        zipCode,
        country,
      };

      const wireProof: SubmittedWireProof = {
        wireReferenceNumber: wireRefNumber.trim(),
        remitterName: wireRemitterName.trim(),
        remitterBank: wireRemitterBank.trim() || supportConfig.bankWire.bankName,
        receiptFileName: wireReceiptFile?.name || '',
        receiptFileSize: wireReceiptFile?.size || '',
        submissionDate: new Date().toLocaleString(),
        submittedAt: new Date().toLocaleString(),
        customerCareNotified: true,
        notifiedAgentEmail: careEmailsCombined,
        agentNotifiedEmail: careEmailsCombined,
      };

      const generatedReqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}-MEMB`;

      // Persist to Central Broker Store with manual offline verification status
      upgradeTier(
        tier.id,
        'BANK_WIRE',
        undefined,
        verifiedAddress,
        wireRemitterName,
        'Wire-Clearance',
        generatedReqId,
        wireProof,
        false, // Requires manual verification by Customer Care Desk in Admin Panel
        wireReceiptFile?.name || null
      );

      setCompletedCategory('BANK_WIRE');
      setCompletedWireProof(wireProof);
      setCompletedBillingAddress(verifiedAddress);
      setCompletedInvoiceNumber(`INV-SWB-WIRE-${Date.now().toString().slice(-4)}`);
      setCompletedTxHash(`FEDWIRE-${wireProof.wireReferenceNumber}`);
      setIsProcessing(false);
      setIsComplete(true);
    }, 1200);
  };

  const handleFinishAndGoToPortal = () => {
    onClose();
    if (completedCategory === 'BANK_WIRE') {
      setCurrentView('CONFIRMATION_FLOW');
    } else {
      setCurrentView('PORTAL');
      setPortalTab('OVERVIEW');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md pb-safe">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-white text-sm sm:text-base truncate">
                {isComplete
                  ? completedCategory === 'BANK_WIRE'
                    ? 'Payment Request Received · Pending Manual Verification'
                    : 'Payment Verified & Subscription Active'
                  : 'Institutional Membership Checkout'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Sterling Wealth Brokerage · Encrypted Multi-Rail Settlement Desk
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-800 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
            aria-label="Close Checkout Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {isComplete ? (
            /* =========================================================
               POST-PAYMENT CONFIRMATION VIEW (DIFFERENTIATED FOR WIRE VS INSTANT)
               ========================================================= */
            completedCategory === 'BANK_WIRE' ? (
              /* SCREEN 1: POST-PAYMENT WIRE CONFIRMATION (MANUAL VERIFICATION) */
              <div className="space-y-5 py-2">
                {/* Status Header */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                    <Clock className="w-8 h-8" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    Status: Pending Verification
                  </div>

                  <h4 className="font-display text-2xl font-bold text-white">
                    Payment Request Received!
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Your bank wire transfer request has been logged. Under institutional escrow protocols, all wire remittances are manually verified by our designated Customer Care desk before account activation.
                  </p>
                </div>

                {/* Order / Request Summary Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                    <span>Selected Membership Tier:</span>
                    <span className="font-semibold text-white text-sm">{tier.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tier Price / Amount Due:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ${tier.price.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Wire Reference Number:</span>
                    <span className="font-mono text-sky-400 font-semibold">
                      #{completedWireProof?.wireReferenceNumber || wireRefNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Remitting Account & Bank:</span>
                    <span className="text-white font-medium">
                      {completedWireProof?.remitterName || wireRemitterName} ({completedWireProof?.remitterBank || wireRemitterBank})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Attached Payment Slip:</span>
                    {completedWireProof?.receiptFileName || wireReceiptFile?.name ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                        <FileCheck className="w-3.5 h-3.5" />
                        {completedWireProof?.receiptFileName || wireReceiptFile?.name} (Under Review)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium text-[11px]">
                        Not Uploaded Yet (Awaiting Slip on Dashboard)
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                    <span>Submission Timestamp:</span>
                    <span className="text-slate-300">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                {/* Actionable Instruction Box (High Visual Hierarchy) */}
                <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>Next Step: Assigned Customer Care Audit</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    An automatic alert has been dispatched to your dedicated Customer Care Specialist:{' '}
                    <strong className="text-white">{careAgent}</strong> ({supportConfig.agentTitle}). For expedited clearance, you may also email your bank confirmation slip directly:
                  </p>

                  <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {careAgent.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">{careAgent}</div>
                        <div className="text-[11px] font-mono text-amber-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <a href={`mailto:${careEmail}`} className="hover:underline">{careEmail}</a>
                          <span className="text-slate-500 font-sans">and</span>
                          <a href={`mailto:${careSecondaryEmail}`} className="hover:underline">{careSecondaryEmail}</a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyCareEmail}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEmail ? 'Copied' : 'Copy Emails'}</span>
                      </button>

                      <a
                        href={`mailto:${careMailtoList}?subject=Bank%20Wire%20Proof%20-%20Ref%20%23${completedWireProof?.wireReferenceNumber || wireRefNumber}&body=Dear%20${encodeURIComponent(careAgent)}%2C%0A%0APlease%20find%20attached%20my%20wire%20remittance%20advice%20for%20the%20${encodeURIComponent(tier.name)}%20membership%20($${tier.price}).%0A%0AWire%20Reference:%20%23${encodeURIComponent(completedWireProof?.wireReferenceNumber || wireRefNumber)}%0ARemitter:%20${encodeURIComponent(completedWireProof?.remitterName || wireRemitterName)}%0A%0AThank%20you.`}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Launch Email Client</span>
                      </a>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Estimated verification timeframe: <strong>12–24 business hours</strong>. You will receive an email upon admin activation.
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleFinishAndGoToPortal}
                    className="flex-1 min-h-[48px] py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <span>View Post-Payment Verification Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[48px] py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              /* POST-PAYMENT CONFIRMATION (CARD / CRYPTO - MANUAL ADMIN UPGRADE) */
              <div className="space-y-5 py-2">
                {/* Status Header */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                    <Clock className="w-8 h-8" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    Status: Pending Admin Upgrade
                  </div>

                  <h4 className="font-display text-2xl font-bold text-white">
                    Payment Received — Awaiting Admin Upgrade
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Your payment of <span className="text-white font-semibold">${tier.price.toLocaleString()}</span> has been confirmed and logged. Under institutional protocol, all membership tier packages are upgraded manually from the Admin Panel by our underwriting desk once ledger verification is completed.
                  </p>
                </div>

                {/* Transaction receipt */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2.5">
                  <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-800">
                    <span>Transaction / Invoice ID:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {completedInvoiceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Selected Upgrade Tier:</span>
                    <span className="text-white font-semibold">{tier.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Subscriber Legal Name:</span>
                    <span className="text-white font-medium">{cardholderName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Settlement Method:</span>
                    <span className="text-emerald-400 font-medium">
                      {completedCryptoDetails
                        ? `${completedCryptoDetails.coin} (${completedCryptoDetails.network})`
                        : 'Credit Card (AVS Verified)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Billing Address:</span>
                    <span className="text-slate-300 text-right">
                      {completedBillingAddress?.streetAddress}
                      {completedBillingAddress?.streetAddress2 ? `, ${completedBillingAddress.streetAddress2}` : ''}, {completedBillingAddress?.city}, {completedBillingAddress?.state} {completedBillingAddress?.zipCode}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Slip Status:</span>
                    {completedCryptoProofName ? (
                      <span className="text-emerald-400 font-medium">
                        Attached ({completedCryptoProofName}) — Under Review
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        Awaiting Proof Upload on Client Dashboard
                      </span>
                    )}
                  </div>
                </div>

                {/* Care Specialist Notice */}
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Assigned Customer Care Specialist:</span>
                    <span className="font-semibold text-white">{careAgent}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono text-[11px]">
                    <span className="text-slate-400 font-sans">Specialist Emails:</span>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <a href={`mailto:${careEmail}`} className="text-emerald-400 hover:underline">{careEmail}</a>
                      <span className="text-slate-500 font-sans">and</span>
                      <a href={`mailto:${careSecondaryEmail}`} className="text-emerald-400 hover:underline">{careSecondaryEmail}</a>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleFinishAndGoToPortal}
                    className="flex-1 min-h-[48px] py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <span>Track Upgrade on Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[48px] py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )
          ) : (
            /* =========================================================
               CHECKOUT SELECTION & 3-GATEWAY FORM TABS
               ========================================================= */
            <>
              {/* Tier Summary Banner */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-wider uppercase text-amber-400 font-semibold">
                    {tier.badge}
                  </span>
                  <h4 className="font-display text-lg font-bold text-white">{tier.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Max Facility: <strong className="text-emerald-400">${tier.maxLoanLimit.toLocaleString()}</strong> · Underwriting SLA: {tier.processingSLA}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-display text-white">
                    ${tier.price.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">/{tier.period}</div>
                </div>
              </div>

              {/* Accessible 3-Gateway Tabbed Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Institutional Payment Gateway
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Gateway 1: Credit Card */}
                  <button
                    type="button"
                    disabled={!isCardEnabled}
                    onClick={() => {
                      if (!isCardEnabled) {
                        triggerToast('Gateway Unavailable', 'Credit Card processing is currently offline/disabled by administration.', 'warning');
                        return;
                      }
                      setGatewayCategory('STRIPE_CARD');
                      setFormErrors({});
                      setInstructionPopup('card');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-[0.98] ${
                      !isCardEnabled
                        ? 'opacity-50 cursor-not-allowed border-slate-900 bg-slate-950/40 text-slate-500'
                        : gatewayCategory === 'STRIPE_CARD'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40 shadow-sm cursor-pointer'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <CreditCard className={`w-4 h-4 ${isCardEnabled ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        !isCardEnabled
                          ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400'
                          : 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300'
                      }`}>
                        {isCardEnabled ? 'Instant AVS' : 'Offline'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Credit Card</span>
                      {!isCardEnabled && <span className="text-[10px] text-rose-400 font-normal">Disabled</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">Stripe / Authorize.net</div>
                  </button>

                  {/* Gateway 2: Cryptocurrency */}
                  <button
                    type="button"
                    disabled={!isCryptoEnabled}
                    onClick={() => {
                      if (!isCryptoEnabled) {
                        triggerToast('Gateway Unavailable', 'Cryptocurrency processing is currently offline/disabled by administration.', 'warning');
                        return;
                      }
                      setGatewayCategory('CRYPTO');
                      setFormErrors({});
                      setInstructionPopup('crypto');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-[0.98] ${
                      !isCryptoEnabled
                        ? 'opacity-50 cursor-not-allowed border-slate-900 bg-slate-950/40 text-slate-500'
                        : gatewayCategory === 'CRYPTO'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40 shadow-sm cursor-pointer'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Coins className={`w-4 h-4 ${isCryptoEnabled ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        !isCryptoEnabled
                          ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400'
                          : 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300'
                      }`}>
                        {isCryptoEnabled ? 'Web3 / QR' : 'Offline'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Cryptocurrency</span>
                      {!isCryptoEnabled && <span className="text-[10px] text-rose-400 font-normal">Disabled</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">BTC, ETH, USDT Tether</div>
                  </button>

                  {/* Gateway 3: Bank Wire Transfer */}
                  <button
                    type="button"
                    disabled={!isWireEnabled}
                    onClick={() => {
                      if (!isWireEnabled) {
                        triggerToast('Gateway Unavailable', 'Bank Wire settlement is currently offline/disabled by administration.', 'warning');
                        return;
                      }
                      setGatewayCategory('BANK_WIRE');
                      setFormErrors({});
                      setShowWireNoticeModal(true);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98] ${
                      !isWireEnabled
                        ? 'opacity-50 cursor-not-allowed border-slate-900 bg-slate-950/40 text-slate-500'
                        : gatewayCategory === 'BANK_WIRE'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/40 shadow-sm cursor-pointer'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Landmark className={`w-4 h-4 ${isWireEnabled ? 'text-amber-400' : 'text-slate-600'}`} />
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        !isWireEnabled
                          ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400'
                          : 'bg-amber-950/90 border border-amber-500/40 text-amber-300'
                      }`}>
                        {isWireEnabled ? 'Manual Audit' : 'Offline'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Bank Wire Transfer</span>
                      {!isWireEnabled && <span className="text-[10px] text-rose-400 font-normal">Disabled</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">Fedwire / SWIFT RTGS</div>
                  </button>

                </div>
              </div>

              {/* Server / Global Error Notice */}
              {serverErrorMessage && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Checkout Verification Notice</span>
                    <span>{serverErrorMessage}</span>
                  </div>
                </div>
              )}

              {/* =========================================================
                 GATEWAY 1: CREDIT CARD WITH FULL BILLING ADDRESS & REAL-TIME AVS
                 ========================================================= */}
              {gatewayCategory === 'STRIPE_CARD' && (
                <form onSubmit={handleCardPaymentSubmit} className="space-y-4">
                  
                  {/* Card Details */}
                  <div className="space-y-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        Cardholder Details & Number
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        256-bit SSL / PCI-DSS Level 1
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Cardholder Legal Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => {
                          setCardholderName(e.target.value);
                          if (formErrors.cardholderName) setFormErrors((prev) => ({ ...prev, cardholderName: undefined }));
                        }}
                        placeholder="e.g., Alexander Vance"
                        className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${
                          formErrors.cardholderName
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-700 focus:border-emerald-500'
                        }`}
                      />
                      {formErrors.cardholderName && (
                        <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.cardholderName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Card Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(e.target.value);
                          if (formErrors.cardNumber) setFormErrors((prev) => ({ ...prev, cardNumber: undefined }));
                        }}
                        placeholder="4242 •••• •••• 9821"
                        className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono ${
                          formErrors.cardNumber
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-700 focus:border-emerald-500'
                        }`}
                      />
                      {formErrors.cardNumber && (
                        <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Expiration (MM/YY) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            setCardExpiry(e.target.value);
                            if (formErrors.cardExpiry) setFormErrors((prev) => ({ ...prev, cardExpiry: undefined }));
                          }}
                          placeholder="MM/YY"
                          className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono ${
                            formErrors.cardExpiry
                              ? 'border-rose-500 focus:border-rose-500'
                              : 'border-slate-700 focus:border-emerald-500'
                          }`}
                        />
                        {formErrors.cardExpiry && (
                          <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.cardExpiry}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Security CVC <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => {
                            setCardCvc(e.target.value);
                            if (formErrors.cardCvc) setFormErrors((prev) => ({ ...prev, cardCvc: undefined }));
                          }}
                          placeholder="CVC"
                          className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono ${
                            formErrors.cardCvc
                              ? 'border-rose-500 focus:border-rose-500'
                              : 'border-slate-700 focus:border-emerald-500'
                          }`}
                        />
                        {formErrors.cardCvc && (
                          <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.cardCvc}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Billing Address Fields */}
                  <div className="space-y-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        Billing Address (Required for AVS Verification)
                      </span>
                      
                      {/* Real-Time AVS Indicator */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 font-semibold ${
                        isAvsPassing
                          ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                      }`}>
                        {isAvsPassing ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>AVS: Validated · Match</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>AVS: Awaiting Input</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Street Address 1 */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Street Address 1 <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => {
                          setStreetAddress(e.target.value);
                          if (formErrors.streetAddress) setFormErrors((prev) => ({ ...prev, streetAddress: undefined }));
                        }}
                        placeholder="e.g., 450 Montgomery St"
                        className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${
                          formErrors.streetAddress
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-700 focus:border-emerald-500'
                        }`}
                      />
                      {formErrors.streetAddress && (
                        <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.streetAddress}
                        </p>
                      )}
                    </div>

                    {/* Street Address 2 */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Street Address 2 <span className="text-slate-500 font-normal">(Apartment, Suite, Unit, Floor - Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={streetAddress2}
                        onChange={(e) => setStreetAddress2(e.target.value)}
                        placeholder="e.g., Suite 1400 or Floor 12"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          City <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (formErrors.city) setFormErrors((prev) => ({ ...prev, city: undefined }));
                          }}
                          placeholder="e.g., San Francisco"
                          className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${
                            formErrors.city
                              ? 'border-rose-500 focus:border-rose-500'
                              : 'border-slate-700 focus:border-emerald-500'
                          }`}
                        />
                        {formErrors.city && (
                          <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          State / Province <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            if (formErrors.state) setFormErrors((prev) => ({ ...prev, state: undefined }));
                          }}
                          placeholder="e.g., CA or Ontario"
                          className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${
                            formErrors.state
                              ? 'border-rose-500 focus:border-rose-500'
                              : 'border-slate-700 focus:border-emerald-500'
                          }`}
                          list="popular-states-list"
                        />
                        <datalist id="popular-states-list">
                          {POPULAR_US_STATES.map((st) => (
                            <option key={st} value={st} />
                          ))}
                        </datalist>
                        {formErrors.state && (
                          <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.state}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Zip Code & Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Zip / Postal Code <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => {
                            setZipCode(e.target.value);
                            if (formErrors.zipCode) setFormErrors((prev) => ({ ...prev, zipCode: undefined }));
                          }}
                          placeholder="e.g., 94104"
                          className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono ${
                            formErrors.zipCode
                              ? 'border-rose-500 focus:border-rose-500'
                              : 'border-slate-700 focus:border-emerald-500'
                          }`}
                        />
                        {formErrors.zipCode && (
                          <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.zipCode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Country <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            if (formErrors.country) setFormErrors((prev) => ({ ...prev, country: undefined }));
                          }}
                          className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none ${
                            formErrors.country
                              ? 'border-rose-500 focus:border-rose-500'
                              : 'border-slate-700 focus:border-emerald-500'
                          }`}
                        >
                          <option value="">Select country...</option>
                          {SUPPORTED_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                        {formErrors.country && (
                          <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Payment Slip Copy Upload for Card Checkout */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Attach a copy of your payment slip for review</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </div>
                    {cardSlipFile ? (
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center justify-between gap-2 text-xs">
                        <span className="text-white truncate">{cardSlipFile.name} ({cardSlipFile.size})</span>
                        <button
                          type="button"
                          onClick={() => setCardSlipFile(null)}
                          className="text-rose-300 hover:text-white px-2 py-1 rounded hover:bg-rose-500/20 cursor-pointer shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-slate-700 hover:border-emerald-500/60 rounded-lg p-3 flex items-center justify-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900/50 transition-colors">
                        <UploadCloud className="w-4 h-4 text-emerald-400" />
                        <span>Upload payment confirmation slip (PDF, PNG, JPG)</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleCardSlipUpload}
                        />
                      </label>
                    )}
                  </div>

                  {/* Assigned Customer Care Specialist Contact Strip */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                        Assigned Customer Care Specialist
                      </span>
                      <span className="font-semibold text-white">{careAgent}</span>
                    </div>
                    <div className="font-mono text-[11px] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <a href={`mailto:${careEmail}`} className="text-emerald-400 hover:underline font-medium">
                        {careEmail}
                      </a>
                      <span className="text-slate-500 font-sans">and</span>
                      <a href={`mailto:${careSecondaryEmail}`} className="text-emerald-400 hover:underline font-medium">
                        {careSecondaryEmail}
                      </a>
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full min-h-[48px] py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:bg-emerald-800 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying AVS & Sponsoring Account...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Authorize & Settle ${tier.price.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* =========================================================
                 GATEWAY 2: CRYPTOCURRENCY WITH DYNAMIC ESCROW ADDRESSES & QR
                 ========================================================= */}
              {gatewayCategory === 'CRYPTO' && (
                <div className="pt-1">
                  <CryptoPaymentGateway
                    tier={tier}
                    onSuccess={handleCryptoSuccess}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </div>
              )}

              {/* =========================================================
                 GATEWAY 3: BANK WIRE TRANSFER WITH DYNAMIC BANK COORDINATES & PROOF UPLOAD
                 ========================================================= */}
              {gatewayCategory === 'BANK_WIRE' && (
                <form onSubmit={handleWireSubmit} className="space-y-4">
                  {/* Assigned Customer Care Agent Alert Notice */}
                  <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-xl p-4 space-y-2.5 shadow-lg shadow-amber-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span>Customer Care Assistance Required</span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                        Official Instructions
                      </span>
                    </div>

                    {/* Notification banner for Bank Wire Payment */}
                    <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-white">Attach a copy of your payment slip for review</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 shrink-0 font-semibold">
                        Notice
                      </span>
                    </div>

                    <p className="text-xs text-white font-medium">
                      Thank you for choosing <strong className="text-emerald-400 font-semibold">Sterling Wealth Broker</strong>
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Please reach out to your assigned Customer Care Specialist, <strong className="text-amber-400">{careAgent}</strong>, who will be assisting you with your loan process and bank clearance review.
                    </p>

                    <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                        Contact Details for your Specialist:
                      </div>
                      <div className="text-white font-medium">
                        Name: <span className="text-amber-300 font-semibold">{careAgent}</span>
                      </div>
                      <div className="text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                        <span>Emails:</span>
                        <a href={`mailto:${careEmail}`} className="text-emerald-400 font-mono hover:underline font-semibold">
                          {careEmail}
                        </a>
                        <span className="text-slate-500">and</span>
                        <a href={`mailto:${careSecondaryEmail}`} className="text-emerald-400 font-mono hover:underline font-semibold">
                          {careSecondaryEmail}
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              navigator.clipboard.writeText(`${careEmail}, ${careSecondaryEmail}`);
                              triggerToast('Copied', `${careEmailsCombined} copied to clipboard.`, 'success');
                            } catch {
                              // ignore
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                        >
                          Copy Emails
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bank Wire Details Card (Configured dynamically from Admin Panel) */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <Landmark className="w-4 h-4 text-sky-400" />
                        <span>Depository Bank Wire Coordinates</span>
                      </div>
                      <span className="text-[10px] font-mono text-sky-400 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/30">
                        Admin Synced
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Instruct your bank to remit exactly <strong className="text-emerald-400 font-semibold">${tier.price.toLocaleString()} USD</strong> to the official escrow coordinates below:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Bank Name */}
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Depository Bank</div>
                          <div className="font-semibold text-white">{supportConfig.bankWire.bankName}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(supportConfig.bankWire.bankName, 'bankName')}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          title="Copy Bank Name"
                          aria-label="Copy Bank Name"
                        >
                          {copiedBankField === 'bankName' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Beneficiary Name */}
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Beneficiary Account Name</div>
                          <div className="font-semibold text-white">{supportConfig.bankWire.accountName}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(supportConfig.bankWire.accountName, 'accountName')}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          title="Copy Account Name"
                          aria-label="Copy Account Name"
                        >
                          {copiedBankField === 'accountName' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Account Number */}
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Account Number</div>
                          <div className="font-mono font-semibold text-white">{supportConfig.bankWire.accountNumber}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(supportConfig.bankWire.accountNumber, 'accountNumber')}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          title="Copy Account Number"
                          aria-label="Copy Account Number"
                        >
                          {copiedBankField === 'accountNumber' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Routing Number (ABA) */}
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Routing Number (ABA)</div>
                          <div className="font-mono font-semibold text-white">{supportConfig.bankWire.routingCode}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(supportConfig.bankWire.routingCode, 'routingCode')}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          title="Copy Routing Number"
                          aria-label="Copy Routing Number"
                        >
                          {copiedBankField === 'routingCode' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* SWIFT / BIC */}
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">SWIFT / BIC Code</div>
                          <div className="font-mono font-semibold text-white">{supportConfig.bankWire.swiftBic}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(supportConfig.bankWire.swiftBic, 'swiftBic')}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          title="Copy SWIFT"
                          aria-label="Copy SWIFT Code"
                        >
                          {copiedBankField === 'swiftBic' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* IBAN */}
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">IBAN</div>
                          <div className="font-mono font-semibold text-white">{supportConfig.bankWire.iban}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(supportConfig.bankWire.iban, 'iban')}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          title="Copy IBAN"
                          aria-label="Copy IBAN"
                        >
                          {copiedBankField === 'iban' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                      <strong>Depository Bank Address:</strong> {supportConfig.bankWire.bankAddress}
                    </div>
                  </div>

                  {/* Wire Payment Proof Upload & Remitter Form */}
                  <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                        Wire Remittance Proof & Remitter Details
                      </span>
                      <span className="text-[10px] font-mono text-amber-400">
                        Required for Audit
                      </span>
                    </div>

                    {wireUploadError && (
                      <div className="p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{wireUploadError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Wire Reference / Fedwire # <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wireRefNumber}
                          onChange={(e) => setWireRefNumber(e.target.value)}
                          placeholder="e.g. SWB-WIRE-98214"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Remitter Legal Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wireRemitterName}
                          onChange={(e) => setWireRemitterName(e.target.value)}
                          placeholder="Name on bank wire"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Originating Remitter Bank <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wireRemitterBank}
                          onChange={(e) => setWireRemitterBank(e.target.value)}
                          placeholder="e.g., Barclays Bank PLC / Citibank N.A."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Receipt Upload Dropzone */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Attach a copy of your payment slip for review
                      </label>

                      {wireReceiptFile ? (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white">{wireReceiptFile.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Size: {wireReceiptFile.size} · Uploaded: {wireReceiptFile.uploadedAt}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setWireReceiptFile(null)}
                            className="min-h-[36px] px-3 py-1.5 text-xs text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                          >
                            Replace
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/60 transition-colors">
                          <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-xs text-white font-medium">Click to upload payment receipt or drag & drop</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">PDF, PNG, JPG, or DOCX (Max 15MB)</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.docx"
                            className="hidden"
                            onChange={handleSimulateFileUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full min-h-[48px] py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:bg-amber-800 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Wire Transfer to Customer Care Queue...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Submit Wire Proof for Manual Verification</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Guaranteed refund within 14 days if initial broker consultation fails SLA.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Automatic Bank Wire Notice Pop-Up Modal */}
      {showWireNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">
                    Bank Wire Transfer Notice
                  </h4>
                  <p className="text-xs text-amber-400">Sterling Wealth Broker</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWireNoticeModal(false)}
                className="text-slate-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Close Notice"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification message pop-up */}
            <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-white">Attach a copy of your payment slip for review</span>
              </div>
              <span className="text-[10px] font-mono text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 shrink-0 font-semibold">
                Notice
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3 leading-relaxed">
              <p className="text-sm font-semibold text-white">
                Thank you for choosing <span className="text-emerald-400">Sterling Wealth Broker</span>
              </p>
              <p className="text-slate-300 text-xs">
                Please reach out to your assigned Customer Care Specialist, <strong className="text-amber-400">{careAgent}</strong>, who will be assisting you with your loan process. They will also provide you with the updated bank account details required for your payment.
              </p>
              
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">
                  Assigned Customer Care Specialist:
                </span>
                <div className="text-white font-medium">
                  Name: <span className="text-amber-300 font-semibold">{careAgent}</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px] flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="font-sans">Emails:</span>
                  <a href={`mailto:${careEmail}`} className="text-emerald-400 hover:underline font-semibold">
                    {careEmail}
                  </a>
                  <span className="text-slate-500 font-sans">and</span>
                  <a href={`mailto:${careSecondaryEmail}`} className="text-emerald-400 hover:underline font-semibold">
                    {careSecondaryEmail}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(`${careEmail}, ${careSecondaryEmail}`);
                    triggerToast('Emails Copied', `${careEmailsCombined} copied to clipboard.`, 'success');
                  } catch {
                    // ignore
                  }
                }}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Copy Emails
              </button>
              <a
                href={`mailto:${careMailtoList}?subject=Bank%20Wire%20Transfer%20Details%20Request%20-%20Sterling%20Wealth%20Broker`}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 text-xs font-medium text-center cursor-pointer flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Launch Email Client
              </a>
              <button
                type="button"
                onClick={() => setShowWireNoticeModal(false)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                Proceed to Wire Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Notification Instructions Modal for Credit Card & Crypto */}
      {instructionPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {instructionPopup === 'card' ? <CreditCard className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                    Payment Gateway Advisory
                  </div>
                  <h4 className="font-display font-bold text-white text-base">
                    {instructionPopup === 'card'
                      ? 'Credit Card Payment Instructions'
                      : 'Cryptocurrency Payment Instructions'}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInstructionPopup(null)}
                className="text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-800 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
                aria-label="Dismiss Advisory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs flex items-center gap-2.5">
              <UploadCloud className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-white">
                Attach a copy of your payment slip for review
              </span>
            </div>

            {(instructionPopup === 'card'
              ? supportConfig.gatewayInstructions?.card
              : supportConfig.gatewayInstructions?.crypto) && (
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {instructionPopup === 'card'
                      ? supportConfig.gatewayInstructions?.card
                      : supportConfig.gatewayInstructions?.crypto}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                  Assigned Customer Care Specialist
                </span>
                <span className="font-semibold text-white">{careAgent}</span>
              </div>
              <div className="font-mono text-[11px] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <a href={`mailto:${careEmail}`} className="text-emerald-400 hover:underline font-medium">
                  {careEmail}
                </a>
                <span className="text-slate-500 font-sans">and</span>
                <a href={`mailto:${careSecondaryEmail}`} className="text-emerald-400 hover:underline font-medium">
                  {careSecondaryEmail}
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Mandatory Underwriting Advisory
              </span>
              <button
                type="button"
                onClick={() => setInstructionPopup(null)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Check className="w-4 h-4" />
                <span>I Understand & Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
