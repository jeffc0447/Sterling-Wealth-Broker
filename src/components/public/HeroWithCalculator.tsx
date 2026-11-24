import React, { useState, useMemo } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTierId } from '../../types';
import { calculateTierLoanSchedule } from '../../utils/loanDateEngine';
import { Calculator, ArrowRight, ShieldCheck, Sparkles, TrendingUp, Clock, Calendar } from 'lucide-react';
import heroSkylineBg from '../../assets/images/hero_financial_skyline_1793960018583.jpg';

interface HeroWithCalculatorProps {
  onSelectTier: (tierId: MembershipTierId) => void;
}

export const HeroWithCalculator: React.FC<HeroWithCalculatorProps> = ({ onSelectTier }) => {
  const { tiers, homepageCMS, navigateToPublicPage } = useBroker();
  const hero = homepageCMS?.hero;

  // Calculator state
  const [loanAmount, setLoanAmount] = useState<number>(180000);
  const [termMonths, setTermMonths] = useState<number>(36);

  // Determine recommended membership tier dynamically based on requested loan amount
  const recommendedTier = useMemo(() => {
    if (loanAmount <= 50000) {
      return tiers.find((t) => t.id === 'silver') || tiers[0];
    } else if (loanAmount <= 250000) {
      return tiers.find((t) => t.id === 'gold') || tiers[1];
    } else if (loanAmount <= 1000000) {
      return tiers.find((t) => t.id === 'platinum') || tiers[2];
    } else {
      return tiers.find((t) => t.id === 'diamond') || tiers[3];
    }
  }, [loanAmount, tiers]);

  // Loan repayment & tier-based date calculation via shared engine
  const calculation = useMemo(() => {
    const schedule = calculateTierLoanSchedule({
      tier: recommendedTier,
      loanAmount,
      termMonths,
      applicationDate: new Date(),
      baselineTier: tiers.find((t) => t.id === 'silver') || tiers[0],
    });

    return {
      effectiveApr: schedule.effectiveApr.toFixed(2),
      monthlyPayment: schedule.monthlyPayment,
      totalRepayment: schedule.totalRepayment,
      totalInterest: schedule.totalInterest,
      approvalDate: schedule.underwritingApprovalDateFormatted,
      disbursementDate: schedule.disbursementDateFormatted,
      maturityDate: schedule.maturityDateFormatted,
      turnaroundBusinessDays: schedule.turnaroundBusinessDays,
    };
  }, [loanAmount, termMonths, recommendedTier, tiers]);

  const quickPresets = [
    { label: '$25k', value: 25000 },
    { label: '$150k', value: 150000 },
    { label: '$500k', value: 500000 },
    { label: '$2.5M', value: 2500000 },
  ];

  return (
    <div className="relative pt-10 pb-16 lg:pt-16 lg:pb-28 overflow-hidden bg-slate-950">
      {/* Befitting Institutional Hero Financial Skyline Background Image with Multi-Layer Scrims */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroSkylineBg}
          alt="Sterling Wealth Institutional Banking Financial Skyline"
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-in motion-safe:fade-in duration-1000"
        />
        {/* Horizontal Dark Gradient: heavy on the left for maximum text readability, softer on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/70" />
        {/* Vertical Fade: soft blend into the top header and deep fade into the next section */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-transparent to-slate-950" />
        {/* Atmospheric Emerald Glow Accent */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Grid: Value Proposition + Interactive Loan Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {hero?.kicker || 'Tiered Capital Access · Institutional Syndication'}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              {hero?.headlineStart || 'Bespoke Loans &'}{' '}
              <span className="text-emerald-400">{hero?.headlineHighlight || 'Institutional Capital'}</span>{' '}
              {hero?.headlineEnd || 'Structured for Growth.'}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              {hero?.description ||
                'Sterling Wealth Broker connects accredited entrepreneurs, executives, and enterprises with premier tier-1 banking syndicates. Unlock custom borrowing limits through our privileged membership tiers.'}
            </p>

            {/* Feature highlights */}
            <div className="pt-2 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Tiered Capacity</div>
                  <div className="text-slate-400 text-[11px]">$10k to $15M+ custom facilities</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">24-Hr Underwriting</div>
                  <div className="text-slate-400 text-[11px]">Direct broker desk assignment</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectTier(recommendedTier.id)}
                className="min-h-[48px] px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>{hero?.primaryCtaText ? `${hero.primaryCtaText} (${recommendedTier.name})` : `Enroll in ${recommendedTier.name}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('instruments-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigateToPublicPage('financial-instrument');
                  }
                }}
                className="min-h-[48px] px-5 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 border border-slate-700/80 rounded-xl text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {hero?.secondaryCtaText || 'Explore Financial Instruments'}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Loan Calculator & Tier Matcher */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-sm">
                      Interactive Loan & Tier Calculator
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Real-time syndication estimates & membership tier routing
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Est. APR</span>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {calculation.effectiveApr}%
                  </div>
                </div>
              </div>

              {/* Loan Amount Slider */}
              <div className="space-y-4 pt-5">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-xs font-medium text-slate-300">
                      Target Borrowing Amount
                    </label>
                    <span className="font-display text-2xl font-bold text-white tracking-tight">
                      ${loanAmount.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10000"
                    max="3000000"
                    step="5000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] text-slate-400">Presets:</span>
                    {quickPresets.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setLoanAmount(p.value)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          loanAmount === p.value
                            ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                            : 'border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Term selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Repayment Horizon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 60].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setTermMonths(months)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                          termMonths === months
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {months} Months
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Outputs */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950 border border-slate-800/90 rounded-xl p-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Estimated Monthly Payment
                    </span>
                    <span className="text-xl font-display font-bold text-white">
                      ${calculation.monthlyPayment.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Principal & Interest
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Total Interest Over Term
                    </span>
                    <span className="text-lg font-display font-semibold text-slate-200">
                      ${calculation.totalInterest.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">
                      Incl. -{recommendedTier.aprDiscount}% Tier Discount
                    </span>
                  </div>
                </div>

                {/* Tier-Based Loan Date Schedule Strip */}
                <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-[11px] tabular-nums">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Approval: <strong className="text-white">{calculation.approvalDate}</strong></span>
                  </div>
                  <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
                  <div>
                    <span className="text-slate-400">Est. Funding: </span>
                    <strong className="text-emerald-400">{calculation.disbursementDate}</strong>
                  </div>
                  <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
                  <div>
                    <span className="text-slate-400">Maturity: </span>
                    <strong className="text-white">{calculation.maturityDate}</strong>
                  </div>
                </div>

                {/* AUTOMATED RECOMMENDED TIER CARD (Core requirement) */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-xl p-4 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommended Membership Tier:</span>
                      </div>
                      <div className="text-lg font-display font-bold text-white">
                        {recommendedTier.name}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Covers up to <strong className="text-white">${recommendedTier.maxLoanLimit.toLocaleString()}</strong> · Underwriting SLA: {recommendedTier.processingSLA}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-display font-bold text-emerald-400">
                        ${recommendedTier.price.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400">/{recommendedTier.period}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {recommendedTier.dedicatedBroker ? 'Dedicated Wealth Advisor Included' : 'Standard Brokerage Access'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectTier(recommendedTier.id)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <span>Unlock This Tier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
