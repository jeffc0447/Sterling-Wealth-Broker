import React, { useState, useMemo } from 'react';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  FileText,
  Briefcase,
  Layers,
  Lock,
  Sparkles
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const BusinessLoanPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

  const [loanAmount, setLoanAmount] = useState<number>(350000);
  const [loanType, setLoanType] = useState<'credit-line' | 'term-debt' | 'cre-mortgage'>('credit-line');
  const [termMonths, setTermMonths] = useState<number>(36);

  const rateConfig = {
    'credit-line': { name: 'Revolving Credit Line', baseRate: 5.5, maxTerm: 36 },
    'term-debt': { name: 'Commercial Term Debt', baseRate: 6.25, maxTerm: 60 },
    'cre-mortgage': { name: 'Commercial Mortgage', baseRate: 6.75, maxTerm: 120 },
  };

  const currentConfig = rateConfig[loanType];
  const effectiveApr = currentConfig.baseRate - 0.75; // Gold tier average discount

  const calculation = useMemo(() => {
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

  const commercialProducts = [
    {
      title: 'Revolving Corporate Line of Credit',
      amount: '$50k to $1,000,000',
      apr: 'From 5.25% APR',
      desc: 'Draw capital on demand for payroll, supplier inventory, or working capital needs. Pay interest only on deployed balances.',
      features: ['Revolving credit facility', 'Instant online draw requests', 'No annual maintenance fees'],
    },
    {
      title: 'Commercial Term Financing',
      amount: '$100k to $2,500,000',
      apr: 'From 5.95% APR',
      desc: 'Predictable fixed-rate growth capital for physical expansion, equipment acquisition, or corporate buyouts.',
      features: ['Fixed monthly debt service', 'Up to 7-year amortization', 'No balloon payment surprises'],
    },
    {
      title: 'Industrial Equipment & Fleet Loans',
      amount: '$75k to $1,500,000',
      apr: 'From 5.50% APR',
      desc: '100% financing for heavy equipment, manufacturing machinery, medical devices, and commercial transport fleets.',
      features: ['Asset serves as primary collateral', 'Section 179 tax advantages', 'Deferred payment options'],
    },
    {
      title: 'Commercial Real Estate & Mortgages',
      amount: '$250k to $10,000,000+',
      apr: 'From 6.20% APR',
      desc: 'Acquire, refinance, or redevelop owner-occupied industrial buildings, logistics warehouses, or office properties.',
      features: ['Up to 80% LTV financing', 'Interest-only bridge phases', 'Syndicated institutional capital'],
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                <Building2 className="w-4 h-4" />
                <span>Enterprise & Commercial Debt</span>
                <span aria-hidden="true">·</span>
                <span>Tier-1 Bank Syndicate</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Non-Dilutive Business Loans up to $2.5M+ with Direct Syndicate Desks
              </h1>

              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                Empower your enterprise with flexible commercial debt. Bypass restrictive retail bank committees through our tiered membership network—enjoying preferential wholesale APR discounts and guaranteed 48-hour term sheets.
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Credit Facility</span>
                  <span className="text-xl font-bold text-white font-display">Up to $2.5M</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Wholesale Rates</span>
                  <span className="text-xl font-bold text-emerald-400 font-display">From 5.25%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Term Sheet SLA</span>
                  <span className="text-xl font-bold text-white font-display">48 Hours</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Equity Dilution</span>
                  <span className="text-xl font-bold text-emerald-400 font-display">0.0% Non-Dilutive</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={() => openRegistrationWithTier('gold')}
                  className="w-full sm:w-auto min-h-[48px] py-3.5 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>Apply for Business Line</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateToPublicPage('contact')}
                  className="w-full sm:w-auto min-h-[48px] py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 border border-slate-700/80 font-semibold text-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>Request Underwriter Call</span>
                </button>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  FDIC Direct Routing Escrow
                </span>
                <span>·</span>
                <span>Strict Non-Disclosure Agreements</span>
              </div>
            </div>

            {/* Right Commercial Calculator */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Commercial Debt Calculator</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">{effectiveApr.toFixed(2)}% APR</span>
                </div>

                {/* Facility Selector */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Facility Structure:</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['credit-line', 'term-debt', 'cre-mortgage'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLoanType(type)}
                        className={`py-1.5 px-2 rounded-lg font-medium transition ${
                          loanType === type
                            ? 'bg-slate-800 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {type === 'credit-line' ? 'Credit Line' : type === 'term-debt' ? 'Term Debt' : 'Mortgage'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Borrowing Request:</span>
                    <span className="text-white font-mono font-bold text-base">
                      ${loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={2500000}
                    step={25000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>$50,000</span>
                    <span>$1,250,000</span>
                    <span>$2,500,000</span>
                  </div>
                </div>

                {/* Term */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Repayment Horizon:</span>
                    <span className="text-white font-mono font-semibold">{termMonths} Months</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 60].map((t) => (
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

                {/* Output */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Estimated Monthly Debt Service:</span>
                    <span className="text-2xl font-bold font-display text-white">
                      ${calculation.monthlyPayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                    <span>Total Estimated Interest:</span>
                    <span className="text-slate-300 font-mono">
                      ${calculation.totalInterest.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openRegistrationWithTier('gold')}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Apply with Gold Executive Tier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Product Catalog */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Commercial Debt Spectrum
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Structured Solutions for Modern Enterprise Balance Sheets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commercialProducts.map((p, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{p.apr}</span>
                    <span className="text-xs text-slate-400 font-mono">{p.amount}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.desc}</p>
                  
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {p.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => openRegistrationWithTier('gold')}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                  >
                    <span>Request Term Sheet</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] text-slate-500">48h SLA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Underwriting Checklist */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Underwriting Requirements
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                What Our Syndicate Committee Reviews
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our underwriters evaluate business health holistically. We focus on real operational cash flow rather than outdated personal credit scores.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Minimum 6 Months Active Business Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>$150,000+ Minimum Annual Gross Operating Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>US, UK, Canadian, or EU Registered Corporate Entity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No Active Bankruptcies or Tax Liens</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Fast-Track Underwriting Desk</h3>
              <p className="text-xs text-slate-400">
                Enroll in the Gold Executive Tier to unlock direct routing to 15+ dedicated commercial balance sheets.
              </p>
              <button
                type="button"
                onClick={() => openRegistrationWithTier('gold')}
                className="w-full min-h-[44px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                Apply for Gold Executive Tier
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
