import React, { useState, useEffect } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { FinancialInstrument } from '../../types';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Building,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const LoanApplicationWizard: React.FC = () => {
  const {
    instruments,
    tiers,
    currentUser,
    submitLoan,
    setPortalTab,
    setCurrentView,
    preselectedInstrumentId,
    preselectedAmount,
  } = useBroker();

  const currentTier = tiers.find((t) => t.id === currentUser.membershipTierId) || tiers[1];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedAppNumber, setSubmittedAppNumber] = useState<string | null>(null);

  // Form State
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string>(
    preselectedInstrumentId || instruments[0].id
  );
  const [requestedAmount, setRequestedAmount] = useState<number>(
    preselectedAmount || 120000
  );
  const [termMonths, setTermMonths] = useState<number>(24);
  const [purpose, setPurpose] = useState<string>(
    'Expansion of supply-chain working capital and inventory acquisition.'
  );
  const [applicantName, setApplicantName] = useState<string>(currentUser.name);
  const [applicantEmail, setApplicantEmail] = useState<string>(currentUser.email);
  const [applicantPhone, setApplicantPhone] = useState<string>(currentUser.phone);
  const [companyName, setCompanyName] = useState<string>(
    currentUser.company || 'VanceTech Holdings LLC'
  );
  const [annualRevenue, setAnnualRevenue] = useState<number>(550000);
  const [creditScore, setCreditScore] = useState<string>('740 - 799 (Excellent)');
  const [collateralType, setCollateralType] = useState<string>(
    'Corporate Guarantee & Account Receivables'
  );

  const selectedInstrument =
    instruments.find((i) => i.id === selectedInstrumentId) || instruments[0];

  // Tier limit check
  const exceedsTierLimit = requestedAmount > currentTier.maxLoanLimit;
  const recommendedTierForAmount = tiers.find((t) => t.maxLoanLimit >= requestedAmount) || tiers[3];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appNum = submitLoan({
      userId: currentUser.id,
      applicantName,
      applicantEmail,
      applicantPhone,
      instrumentId: selectedInstrument.id,
      instrumentTitle: selectedInstrument.title,
      requestedAmount,
      termMonths,
      purpose,
      annualIncome: annualRevenue,
      creditScore,
      assignedBroker: currentUser.assignedBroker,
    });
    setSubmittedAppNumber(appNum);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Wizard Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              Active Tier: {currentTier.name} (Max Limit: ${currentTier.maxLoanLimit.toLocaleString()})
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
              Syndicated Loan Application Wizard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured underwriter submission with direct broker representation.
            </p>
          </div>

          {!submittedAppNumber && (
            <div className="text-right">
              <span className="text-xs text-slate-400">Step {currentStep} of 4</span>
              <div className="flex gap-1.5 mt-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-6 h-1.5 rounded-full transition-colors ${
                      step <= currentStep ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Successful Submission View */}
        {submittedAppNumber ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-display text-2xl font-bold text-white">
              Application Submitted to Underwriting
            </h3>

            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Your application <strong className="text-emerald-400 font-mono">{submittedAppNumber}</strong> has been transmitted to {currentUser.assignedBroker} for priority covenant review.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-slate-400">
                <span>Facility:</span>
                <span className="text-white font-medium">{selectedInstrument.title}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Requested Capital:</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  ${requestedAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Underwriting SLA:</span>
                <span className="text-amber-400 font-medium">{currentTier.processingSLA}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPortalTab('OVERVIEW')}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                Track in Portfolio Overview
              </button>
              <button
                onClick={() => setPortalTab('MESSAGES')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition-colors"
              >
                Message Assigned Broker
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: Instrument & Amount */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Select Financial Instrument
                  </label>
                  <select
                    value={selectedInstrumentId}
                    onChange={(e) => setSelectedInstrumentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {instruments.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.title} ({inst.category} · {inst.aprRange})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input & Slider */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-xs font-medium text-slate-300">
                      Requested Loan Principal ($ USD)
                    </label>
                    <span className="font-display text-xl font-bold text-white">
                      ${requestedAmount.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={selectedInstrument.minAmount}
                    max={Math.max(selectedInstrument.maxAmount, currentTier.maxLoanLimit * 1.5)}
                    step="5000"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Min: ${selectedInstrument.minAmount.toLocaleString()}</span>
                    <span>Max: ${selectedInstrument.maxAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* TIER LIMIT WARNING & UPGRADE CTA (Crucial Business Logic) */}
                {exceedsTierLimit && (
                  <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-amber-300">
                        Loan Amount Exceeds Active Membership Limit
                      </div>
                      <p className="text-slate-300">
                        Your current <span className="font-semibold text-white">{currentTier.name}</span> membership ceiling is <strong className="text-white">${currentTier.maxLoanLimit.toLocaleString()}</strong>.
                        To apply for <strong className="text-amber-400">${requestedAmount.toLocaleString()}</strong>, you must upgrade to <strong className="text-white">{recommendedTierForAmount.name}</strong> (limits up to ${recommendedTierForAmount.maxLoanLimit.toLocaleString()}).
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('PUBLIC');
                          setTimeout(() => {
                            document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-white font-semibold underline pt-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Upgrade to {recommendedTierForAmount.name} Now</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Term Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Proposed Horizon (Months)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTermMonths(m)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                          termMonths === m
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m} Months
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Financial & Corporate Profile */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Applicant Name</label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Company / Entity</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Direct Phone</label>
                    <input
                      type="text"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Annual Revenue ($)</label>
                    <input
                      type="number"
                      value={annualRevenue}
                      onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Credit Score Range</label>
                    <select
                      value={creditScore}
                      onChange={(e) => setCreditScore(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="780+ (Sovereign / Tier 1)">780+ (Sovereign / Tier 1)</option>
                      <option value="740 - 799 (Excellent)">740 - 799 (Excellent)</option>
                      <option value="680 - 739 (Good Commercial)">680 - 739 (Good Commercial)</option>
                      <option value="640 - 679 (Fair / Asset-Backed)">640 - 679 (Fair / Asset-Backed)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Purpose & Collateral */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Specific Use of Proceeds / Loan Purpose
                  </label>
                  <textarea
                    rows={3}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Describe how the requested facility will be deployed and anticipated cash flow payback schedule..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Offered Collateral / Security Structure
                  </label>
                  <select
                    value={collateralType}
                    onChange={(e) => setCollateralType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Corporate Guarantee & Account Receivables">
                      Corporate Guarantee & Account Receivables
                    </option>
                    <option value="Commercial Real Estate First Lien">
                      Commercial Real Estate First Lien (1st Mortgage)
                    </option>
                    <option value="Industrial Equipment & Machinery Title">
                      Industrial Equipment & Machinery Title
                    </option>
                    <option value="Custodian Securities & Bond Portfolio">
                      Custodian Securities & Bond Portfolio
                    </option>
                    <option value="Unsecured Director Personal Guarantee">
                      Unsecured Director Personal Guarantee
                    </option>
                  </select>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Prerequisite Documents Check</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Your KYC identity and tax filings are already on record in your encrypted Document Vault. No additional uploads required for initial credit screening.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Formal Submission */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                  <div className="text-sm font-semibold text-white border-b border-slate-800 pb-2">
                    Application Summary Schedule
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-slate-400">
                    <div>
                      <span>Selected Instrument:</span>
                      <strong className="block text-white mt-0.5">{selectedInstrument.title}</strong>
                    </div>
                    <div>
                      <span>Requested Facility:</span>
                      <strong className="block text-emerald-400 text-base font-mono mt-0.5">
                        ${requestedAmount.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span>Horizon:</span>
                      <strong className="block text-slate-200 mt-0.5">{termMonths} Months</strong>
                    </div>
                    <div>
                      <span>Assigned Broker:</span>
                      <strong className="block text-slate-200 mt-0.5">{currentUser.assignedBroker}</strong>
                    </div>
                    <div>
                      <span>Entity / Applicant:</span>
                      <strong className="block text-slate-200 mt-0.5">{applicantName} ({companyName})</strong>
                    </div>
                    <div>
                      <span>Indicative Partner Syndicate:</span>
                      <strong className="block text-slate-200 mt-0.5">{selectedInstrument.partnerLenders.join(', ')}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-[11px] text-slate-400 leading-relaxed space-y-2">
                  <p>
                    By clicking "Submit to Underwriting Desk", you authorize Sterling Wealth Broker to perform institutional financial review and submit non-binding credit inquiries to syndicate lender partners. No hard inquiry is lodged against personal credit bureaus during preliminary packaging.
                  </p>
                </div>
              </div>
            )}

            {/* Form Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={exceedsTierLimit}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <span>Submit to Underwriting Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
