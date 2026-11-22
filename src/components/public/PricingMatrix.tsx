import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTier, MembershipTierId } from '../../types';
import { Check, Zap, Sparkles, Clock, ShieldCheck, ArrowRight, Coins } from 'lucide-react';

interface PricingMatrixProps {
  onSelectTier: (tierId: MembershipTierId, cycle?: 'quarterly' | 'annual') => void;
  onSelectCryptoTier?: (tierId: MembershipTierId, cycle?: 'quarterly' | 'annual') => void;
}

export const PricingMatrix: React.FC<PricingMatrixProps> = ({ onSelectTier, onSelectCryptoTier }) => {
  const { tiers, currentUser, homepageCMS } = useBroker();
  const [billingCycle, setBillingCycle] = useState<'quarterly' | 'annual'>('quarterly');
  const header = homepageCMS?.pricingHeader;

  return (
    <section id="pricing-matrix" className="py-16 lg:py-24 bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            {header?.tag || 'Tiered Membership Packages'}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2">
            {header?.headline || 'Institutional Privileges Scaled to Your Borrowing Needs'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            {header?.description || 'Membership grants guaranteed underwriter turnaround, dedicated broker desk representation, and preferential syndicate lending rates.'}
          </p>

          {/* Billing cycle pill toggle */}
          <div className="mt-6 inline-flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setBillingCycle('quarterly')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                billingCycle === 'quarterly'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard Tier Access
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                billingCycle === 'annual'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Retainer</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-950/60 text-emerald-300 font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const isUserActiveTier = currentUser.membershipTierId === tier.id;
            const displayedPrice = billingCycle === 'annual' && tier.period === 'quarter'
              ? Math.round(tier.price * 3.2)
              : tier.price;
            const displayedPeriod = billingCycle === 'annual' && tier.period === 'quarter'
              ? 'year'
              : tier.period;

            return (
              <div
                key={tier.id}
                id={`tier-${tier.id}`}
                className={`relative bg-slate-950 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden scroll-mt-24 ${
                  tier.isPopular
                    ? 'border-amber-500/60 shadow-xl shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Popular Flag */}
                {tier.isPopular && (
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider py-1 px-3 text-center">
                    Most Popular for Growing Businesses
                  </div>
                )}

                <div className="p-6">
                  {/* Tier Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {tier.badge}
                    </span>
                    {isUserActiveTier && (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Current Tier
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-display font-bold text-white tracking-tight">
                        ${displayedPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">/{displayedPeriod}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium mt-1">
                      <span>-{tier.aprDiscount}% Syndicate APR Discount</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {billingCycle === 'annual' ? 'Annual Retainer' : 'Standard Access'}
                      </span>
                    </div>
                  </div>

                  {/* Limit & SLA specs */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-2 mb-6 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Borrowing Limit:</span>
                      <strong className="text-white font-mono">
                        ${tier.maxLoanLimit.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Turnaround SLA:</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tier.processingSLA}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Dedicated Broker:</span>
                      <span className="text-slate-300 font-medium">
                        {tier.dedicatedBroker ? 'Yes · Direct Line' : 'Team Pool'}
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-1">
                      Included Privileges
                    </div>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="p-6 pt-0 mt-6 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectTier(tier.id, billingCycle)}
                    className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      tier.isPopular
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        : isUserActiveTier
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:bg-slate-750'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
                    }`}
                  >
                    <span>{isUserActiveTier ? 'Manage / Renew' : `Enroll in ${tier.name}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => (onSelectCryptoTier || onSelectTier)(tier.id, billingCycle)}
                    className="w-full min-h-[44px] py-2 px-3 rounded-xl text-[11px] font-semibold bg-slate-900/90 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pay with Crypto (BTC · ETH · USDT)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {header?.guaranteeTitle || 'Institutional SLA & Placement Guarantee'}
              </div>
              <div className="text-xs text-slate-400">
                {header?.guaranteeDesc || 'If our broker desk does not present at least two qualifying institutional bank offers within your tier SLA, membership fee is 100% refundable.'}
              </div>
            </div>
          </div>
          <div className="text-right text-xs font-mono space-y-1 shrink-0">
            <div className="text-emerald-400 font-semibold flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Crypto Settlement: BTC · ETH · USDT Tether
            </div>
            <div className="text-slate-400">
              Escrow Backed · Institutional Syndicate Desk
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
