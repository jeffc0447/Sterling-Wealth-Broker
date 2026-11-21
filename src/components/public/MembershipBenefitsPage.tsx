import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  Lock,
  Building2,
  Clock,
  Shield,
  HelpCircle,
  Coins,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTierId } from '../../types';

export const MembershipBenefitsPage: React.FC = () => {
  const { tiers, handleSelectPlanFromHomepage, navigateToPublicPage } = useBroker();
  const [billingCycle, setBillingCycle] = useState<'quarterly' | 'annual'>('quarterly');

  const handleSelectTier = (tierId: MembershipTierId, cycle: 'quarterly' | 'annual' = billingCycle) => {
    handleSelectPlanFromHomepage(tierId, cycle);
  };

  const silverTier = tiers.find((t) => t.id === 'silver') || tiers[0];
  const goldTier = tiers.find((t) => t.id === 'gold') || tiers[1];
  const platinumTier = tiers.find((t) => t.id === 'platinum') || tiers[2];
  const diamondTier = tiers.find((t) => t.id === 'diamond') || tiers[3];

  const getTierPriceDisplay = (tier?: typeof silverTier) => {
    if (!tier) return '';
    const price =
      billingCycle === 'annual' && tier.period === 'quarter'
        ? Math.round(tier.price * 3.2)
        : tier.price;
    const period =
      billingCycle === 'annual' && tier.period === 'quarter'
        ? 'yr'
        : tier.period === 'quarter'
        ? 'qtr'
        : tier.period;
    return `$${price.toLocaleString()}/${period}`;
  };

  const featureMatrix = [
    {
      feature: 'Maximum Loan Placement Ceiling',
      silver: silverTier ? `$${silverTier.maxLoanLimit.toLocaleString()}` : '$100,000',
      gold: goldTier ? `$${goldTier.maxLoanLimit.toLocaleString()}` : '$500,000',
      platinum: platinumTier ? `$${platinumTier.maxLoanLimit.toLocaleString()}` : '$2,500,000',
      diamond: diamondTier ? `$${diamondTier.maxLoanLimit.toLocaleString()}+` : '$15,000,000+',
    },
    {
      feature: 'Underwriting Review SLA',
      silver: silverTier?.processingSLA || '24–48 Hours',
      gold: goldTier?.processingSLA || '24 Hours Guaranteed',
      platinum: platinumTier?.processingSLA || 'Same-Day Term Sheet',
      diamond: diamondTier?.processingSLA || 'Immediate / 4 Hours',
    },
    {
      feature: 'Wholesale Syndicate APR Discount',
      silver: silverTier ? `-${silverTier.aprDiscount}% Discount` : '-0.75% Discount',
      gold: goldTier ? `-${goldTier.aprDiscount}% Discount` : '-1.25% Discount',
      platinum: platinumTier ? `-${platinumTier.aprDiscount}% Discount` : '-1.75% Discount',
      diamond: diamondTier ? `-${diamondTier.aprDiscount}% Discount` : 'Up to -2.25% Discount',
    },
    {
      feature: 'Desk Representation',
      silver: silverTier?.dedicatedBroker ? 'Dedicated Underwriter' : 'Assigned Loan Officer',
      gold: goldTier?.dedicatedBroker ? 'Senior Underwriter Dedicated' : 'Senior Underwriter',
      platinum: platinumTier?.dedicatedBroker ? 'Credit Desk Director Direct Dial' : 'Credit Desk Director',
      diamond: diamondTier?.dedicatedBroker ? 'Managing Director Direct Dial & Channel' : 'Managing Director Direct Dial',
    },
    {
      feature: 'Loan Category Alignment',
      silver: 'Personal Loan',
      gold: 'Business Loan',
      platinum: 'Business Loan (Corporate)',
      diamond: 'Financial Instruments & SBLC',
    },
    {
      feature: 'Encrypted Broker Chat Session',
      silver: 'Robot Desk (3–5 Questions)',
      gold: 'Robot Desk + Underwriter Handoff',
      platinum: 'Priority Desk Live Chat',
      diamond: '24/7 Direct Private Channel',
    },
    {
      feature: '100% Placement SLA Money-Back Guarantee',
      silver: 'Included',
      gold: 'Included',
      platinum: 'Included',
      diamond: 'Included',
    },
    {
      feature: 'Multi-Rail Settlement (Card, Wire, Crypto)',
      silver: 'Included',
      gold: 'Included',
      platinum: 'Included',
      diamond: 'Included',
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={() => navigateToPublicPage('home')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              onClick={() => navigateToPublicPage('about')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              About Us
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400 font-medium">Membership Tiers Benefits</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Privileges, Borrowing Limits & Turnaround SLAs</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Membership Tiers Benefits & Privileges
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              Every Sterling Wealth membership tier is calibrated to institutional borrowing requirements—delivering guaranteed underwriting capacity, dedicated desk representation, wholesale APR discounts, and binding placement SLAs.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => handleSelectTier('gold', billingCycle)}
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Select Gold Executive Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateToPublicPage('contact')}
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition cursor-pointer"
              >
                <span>Speak with an Underwriter</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers Pricing & Benefits Cards */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Catalog of Tier Packages
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Four Tiers Designed for Every Scale of Borrowing
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Select your plan to instantly enter our authenticated checkout funnel.
            </p>

            {/* Billing cycle pill toggle */}
            <div className="mt-6 inline-flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  billingCycle === 'quarterly'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard Tier Access
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Retainer</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-emerald-950/60 text-emerald-300 font-mono">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => {
              const isGold = tier.id === 'gold';
              const isDiamond = tier.id === 'diamond';
              const displayedPrice = billingCycle === 'annual' && tier.period === 'quarter'
                ? Math.round(tier.price * 3.2)
                : tier.price;
              const displayedPeriod = billingCycle === 'annual' && tier.period === 'quarter'
                ? 'year'
                : tier.period;

              return (
                <div
                  key={tier.id}
                  className={`p-6 sm:p-7 rounded-2xl bg-slate-950 flex flex-col justify-between space-y-6 relative transition border ${
                    isGold
                      ? 'border-emerald-500/60 shadow-xl shadow-emerald-500/10'
                      : isDiamond
                      ? 'border-amber-500/50 shadow-xl shadow-amber-500/10'
                      : 'border-slate-800'
                  }`}
                >
                  {tier.isPopular && (
                    <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {tier.id === 'silver'
                          ? 'Category: Personal Loan'
                          : tier.id === 'gold' || tier.id === 'platinum'
                          ? 'Category: Business Loan'
                          : 'Category: Financial Instruments'}
                      </span>
                      <h3 className="font-display text-xl font-bold text-white mt-1">{tier.name}</h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold font-display text-white">
                          ${displayedPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500">/{displayedPeriod}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium mt-1">
                        <span>Limit: Up to ${(tier.maxLoanLimit / 1000).toLocaleString()}k</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {billingCycle === 'annual' ? 'Annual Retainer' : 'Standard Access'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-900 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Review SLA:</span>
                        <span className="font-semibold text-white">{tier.processingSLA}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Wholesale APR:</span>
                        <span className="font-semibold text-emerald-400">-{tier.aprDiscount}% Discount</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Broker Desk:</span>
                        <span className="font-semibold text-white">
                          {tier.dedicatedBroker ? 'Dedicated Underwriter' : 'Standard'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-900">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Privileges Included:
                      </span>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {tier.features.slice(0, 5).map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleSelectTier(tier.id, billingCycle)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                        isGold
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          : isDiamond
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <span>Select {tier.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTier(tier.id, billingCycle)}
                      className="w-full py-2 px-3 rounded-xl text-[11px] font-semibold bg-slate-900/90 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pay with Crypto (BTC · ETH · USDC)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full Feature Comparison Matrix */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Detailed Comparison
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Side-by-Side Privilege Matrix
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Detailed breakdown of underwriting capacities and SLA commitments across all packages.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Feature / Privilege</th>
                  <th className="p-4 sm:p-5 font-bold text-white">
                    {silverTier.name} ({getTierPriceDisplay(silverTier)})
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-emerald-400">
                    {goldTier.name} ({getTierPriceDisplay(goldTier)})
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-indigo-400">
                    {platinumTier.name} ({getTierPriceDisplay(platinumTier)})
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-amber-400">
                    {diamondTier.name} ({getTierPriceDisplay(diamondTier)})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {featureMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 sm:p-5 font-semibold text-slate-200">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-slate-400">{row.silver}</td>
                    <td className="p-4 sm:p-5 font-medium text-emerald-300">{row.gold}</td>
                    <td className="p-4 sm:p-5 font-medium text-indigo-300">{row.platinum}</td>
                    <td className="p-4 sm:p-5 font-bold text-amber-300">{row.diamond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 100% SLA Guarantee Callout */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  100% Placement SLA Money-Back Guarantee
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applies to all four membership tier subscriptions
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              If our underwriting desk fails to present you with at least two qualified institutional funding offers within your tier's commitment window (24–72 hours), your membership fee is refunded 100% in full with no deductions or administrative fees.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Ready to Select Your Membership Tier?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Choose your package to proceed directly into our authenticated checkout flow with Credit Card, Bank Wire, or Cryptocurrency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleSelectTier('gold')}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started with Gold Executive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToPublicPage('contact')}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <span>Inquire with Syndicate Desk</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
