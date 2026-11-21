import React, { useState, useEffect, useRef } from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface EmailVerificationModalProps {
  registrationId: string;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  registrationId,
  email,
  onSuccess,
  onClose,
}) => {
  const {
    registrationApplications,
    verifyRegistrationEmailOTP,
    resendRegistrationOTP,
    triggerToast,
  } = useBroker();

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const app = registrationApplications.find((a) => a.id === registrationId);
  const currentDemoCode = app?.otpCode || '849201';

  // Timer countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto advance focus
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto-verify
    if (cleanVal && index === 5 && newDigits.every((d) => d !== '')) {
      handleVerifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);
    setErrorMessage(null);

    const nextFocusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();

    if (pasteData.length === 6) {
      handleVerifyCode(pasteData);
    }
  };

  const handleVerifyCode = (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpDigits.join('');
    if (finalCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      const success = verifyRegistrationEmailOTP(registrationId, finalCode);
      setIsVerifying(false);

      if (success) {
        setIsVerifiedSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setErrorMessage('Invalid 6-digit verification code. Please check your email or click Auto-fill.');
      }
    }, 700);
  };

  const handleResend = () => {
    if (!canResend) return;
    const newCode = resendRegistrationOTP(registrationId);
    setCountdown(60);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMessage(null);
    inputRefs.current[0]?.focus();
  };

  const handleAutoFill = () => {
    const digits = currentDemoCode.split('').slice(0, 6);
    setOtpDigits(digits);
    setErrorMessage(null);
    handleVerifyCode(currentDemoCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isVerifiedSuccess ? (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Email Verified Successfully!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your identity credentials and loan package have been officially transmitted to our Underwriting & Compliance Desk for manual review.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Verify Your Email Address
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                We have sent an automated 6-digit verification code to{' '}
                <strong className="text-white font-mono break-all">{email}</strong>
              </p>
            </div>

            {/* Simulated Live Email Inbox Banner (For effortless testing) */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Simulated Email Delivery
                </span>
                <span className="text-slate-400 font-normal">Just now</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Subject: [Sterling Wealth] Your Verification OTP
                  </span>
                  <span className="text-sm font-mono font-bold text-white tracking-widest">
                    {currentDemoCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-md text-[11px] transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-fill</span>
                </button>
              </div>
            </div>

            {/* 6-Digit OTP Inputs */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold font-mono bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs justify-center animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleVerifyCode()}
              disabled={isVerifying || otpDigits.some((d) => d === '')}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email & Complete Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Timer */}
            <div className="text-center text-xs text-slate-400">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Verification Code</span>
                </button>
              ) : (
                <span>
                  Resend code in <strong className="text-white font-mono">{countdown}s</strong>
                </span>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
