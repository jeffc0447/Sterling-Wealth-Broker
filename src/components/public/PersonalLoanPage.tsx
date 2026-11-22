import React, { useState, useMemo } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Lock,
  FileCheck2,
  Sparkles,
  HelpCircle,
  Award
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const PersonalLoanPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

  // Calculator state
  const [loanAmount, setLoanAmount] = useState<number>(35000);
  const [termMonths, setTermMonths] = useState<number>(36);

  const baseApr = 5.95;
  const tierDiscount = 0.5; // Silver/Gold average
  const effectiveApr = baseApr - tierDiscount;

  const monthlyCalculation = useMemo(() => {
    const monthlyRate = effectiveApr / 100 / 12;
    const monthly =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    const total = monthly * termMonths;
    const interest = total - loanAmount;

    return {
      monthlyPayment: Math.round(monthly),
      totalRepayment: Math.round(total),
      totalInterest: Math.round(interest),
    };
  }, [loanAmount, termMonths, effectiveApr]);

  const useCases = [
    {
      title: 'High-Interest Debt Consolidation',
      desc: 'Combine credit card balances and high-rate debt into a single, low-interest fixed monthly payment.',
      savings: 'Save up to 40% on monthly financing costs',
    },
    {
      title: 'Home Improvement & Capital Works',
      desc: 'Fund residential remodels, structural upgrades, or green energy installations with flexible repayment terms.',
      savings: 'Preserve your primary home equity intact',
    },
    {
      title: 'Bridge Liquidity & Major Expenses',
      desc: 'Access immediate liquidity for tax obligations, executive tuition, or private transactions with zero friction.',
      savings: 'Immediate 24-hour funds disbursement',
    },
    {
      title: 'Luxury & Private Asset Financing',
      desc: 'Acquire high-value personal assets, vehicles, or collectible investments with non-recourse backing options.',
      savings: 'Bespoke syndicate underwriting rates',
    },
  ];

  const eligibilityRequirements = [
    'Minimum Age: 18 years or older',
    'Credit Score: 620+ qualifying minimum FICO/Vantage',
    'Proof of Income: 2 recent pay stubs, 1099, or 3 months bank statements',
    'Valid Government Identification (Passport, Driver’s License, National ID)',
    'Active Checking Account for direct electronic fund disbursement',
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Product Hero */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                <User className="w-4 h-4" />
                <span>Personal Credit Facility</span>
                <span aria-hidden="true">·</span>
                <span>Tier 1 Syndicate Backed</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Low-APR Personal Loans up to $100,000 with Rapid Underwriting
              </h1>

              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                Access fixed-rate unsecured personal credit backed by our premier banking syndicate, with no early repayment penalties and an expedited 24-hour turnaround SLA.
              </p>

              {/* Key Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Max Borrowing</span>
                  <span className="text-xl font-bold text-white font-display">$100,000</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Starting APR</span>
                  <span className="text-xl font-bold text-emerald-400 font-display">4.75%*</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Repayment Terms</span>
                  <span className="text-xl font-bold text-white font-display">12–84 Mos</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Turnaround SLA</span>
                  <span className="text-xl font-bold text-emerald-400 font-display">24 Hours</span>
                </div>
              </div>

              {/* Direct CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={() => openRegistrationWithTier('silver')}
                  className="w-full sm:w-auto min-h-[48px] py-3.5 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>Apply for Personal Loan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateToPublicPage('contact')}
                  className="w-full sm:w-auto min-h-[48px] py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 border border-slate-700/80 font-semibold text-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>Inquire with Underwriter</span>
                </button>
              </div>

              {/* Trust Badge Line */}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  Soft Credit Check First
                </span>
                <span>·</span>
                <span>Zero Prepayment Penalties</span>
                <span>·</span>
                <span>256-Bit SSL Encrypted</span>
              </div>
            </div>

            {/* Right Calculator Card */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Personal Loan Calculator</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">{effectiveApr}% APR</span>
                </div>

                {/* Amount Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Desired Amount:</span>
                    <span className="text-white font-mono font-bold text-base">
                      ${loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={100000}
                    step={1000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>$5,000</span>
                    <span>$50,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Term Selector */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Repayment Period:</span>
                    <span className="text-white font-mono font-semibold">{termMonths} Months</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 48].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTermMonths(t)}
                        className={`py-2 text-xs font-mono font-semibold rounded-lg border transition ${
                          termMonths === t
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {t}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Output Breakdown */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Estimated Monthly Payment:</span>
                    <span className="text-2xl font-bold font-display text-white">
                      ${monthlyCalculation.monthlyPayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                    <span>Total Interest Over Term:</span>
                    <span className="text-slate-300 font-mono">
                      ${monthlyCalculation.totalInterest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Total Repayment Amount:</span>
                    <span className="text-slate-300 font-mono">
                      ${monthlyCalculation.totalRepayment.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openRegistrationWithTier('silver')}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Apply with This Estimate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Flexible Capital Deployment
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Tailored for Discerning Individual Needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">{uc.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-emerald-400">
                  {uc.savings}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility & Requirements Checklist */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Qualification Standards
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Simple, Transparent Eligibility Criteria
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We believe in straightforward underwriting. Before submitting your application, review our qualification thresholds to ensure your profile aligns with our syndicate parameters.
              </p>

              <div className="space-y-3 pt-2">
                {eligibilityRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Required Documents</h3>
                  <p className="text-xs text-slate-400">Upload securely to your 256-bit encrypted vault</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                  <span>Government Photo ID</span>
                  <span className="text-emerald-400 font-mono">Passport / DL</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                  <span>Income Verification</span>
                  <span className="text-slate-400">2 Recent Pay Stubs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                  <span>Bank Statement</span>
                  <span className="text-slate-400">Most Recent 60 Days</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                  <span>Residential Proof</span>
                  <span className="text-slate-400">Utility Bill / Lease</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openRegistrationWithTier('silver')}
                className="w-full min-h-[44px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Start Encrypted Personal Loan Application
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
