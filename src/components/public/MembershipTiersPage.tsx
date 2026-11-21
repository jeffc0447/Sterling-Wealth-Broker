import React, { useState, useEffect } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTierId, MembershipTier } from '../../types';
import { PricingMatrix } from './PricingMatrix';
import {
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Briefcase,
  Building2,
  Coins,
  CreditCard,
  Building,
  HelpCircle,
  FileCheck2,
  Clock,
  Phone,
  Check,
} from 'lucide-react';

export const MembershipTiersPage: React.FC = () => {
  const {
    tiers,
    handleSelectPlanFromHomepage,
    setSelectedCheckoutTier,
    navigateToPublicPage,
    supportConfig,
  } = useBroker();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'PERSONAL' | 'BUSINESS' | 'INSTRUMENTS'>('ALL');

  useEffect(() => {
    // Check hash for pre-scroll
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    }
  }, []);

  const handleSelectTier = (tierId: MembershipTierId, cycle?: 'quarterly' | 'annual') => {
    handleSelectPlanFromHomepage(tierId, cycle);
  };

  const handleSelectCryptoTier = (tierId: MembershipTierId, cycle?: 'quarterly' | 'annual') => {
    handleSelectPlanFromHomepage(tierId, cycle);
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      
      {/* 1. Page Header & Institutional Context Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Institutional Membership & Retainer Tiers (/pricing)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            Transparent Membership Tiers for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Syndicated Capital
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Gain immediate access to our Tier-1 banking syndicate, dedicated broker desk coverage, and specialized liquidity facilities. All membership fees are backed by our binding 14-day SLA guarantee.
          </p>

          {/* Quick Category Navigation Pill Filter */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('ALL');
                document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                activeCategoryFilter === 'ALL'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Membership Packages
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('PERSONAL');
                const el = document.getElementById('tier-silver') || document.getElementById('pricing-matrix');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                activeCategoryFilter === 'PERSONAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-emerald-400 border border-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personal Loan (Silver Access)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('BUSINESS');
                const el = document.getElementById('tier-gold') || document.getElementById('pricing-matrix');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                activeCategoryFilter === 'BUSINESS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-amber-400 border border-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Business Loan (Gold & Platinum)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('INSTRUMENTS');
                const el = document.getElementById('tier-diamond') || document.getElementById('pricing-matrix');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                activeCategoryFilter === 'INSTRUMENTS'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-purple-400 border border-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Financial Instruments (Diamond)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Full Pricing Matrix */}
      <div id="pricing-section">
        <PricingMatrix
          onSelectTier={handleSelectTier}
          onSelectCryptoTier={handleSelectCryptoTier}
        />
      </div>

      {/* 3. Three Multi-Rail Payment Gateways Information Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-white text-lg">
                  Three Enterprise Settlement Gateways
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Every membership tier package can be settled instantly via your preferred institutional payment channel.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Lock className="w-3.5 h-3.5" />
              <span>TLS 1.3 · 256-Bit Escrow Protection</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Gateway 1: Credit Card */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Credit Card (Stripe Engine)</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Full billing address collection with real-time Address Verification System (AVS Street & ZIP match). Level-3 card data security.
                </p>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 font-mono pt-1">
                <li>• Visa, Mastercard, American Express</li>
                <li>• Instant membership tier activation</li>
              </ul>
            </div>

            {/* Gateway 2: Manual Admin Crypto */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-2.5 right-2.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Admin Verified
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Cryptocurrency Escrow</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Escrow wallet addresses are manually applied and audited from the Admin Security Panel for BTC, ETH, USDT, and USDC with automated QR generation.
                </p>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 font-mono pt-1">
                <li>• Native SegWit, ERC-20 & Polygon PoS</li>
                <li>• Direct Web3 wallet connection</li>
              </ul>
            </div>

            {/* Gateway 3: Bank Wire Transfer */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Bank Wire Escrow</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Fedwire, ACH, and SWIFT RTGS coordinates provided directly by assigned Customer Care Agent Jeff Campbell with receipt audit slip upload.
                </p>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 font-mono pt-1">
                <li>• FDIC Depository Partner Routing</li>
                <li>• Manual admin verification desk</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Guarantee & Underwriting SLA Commitment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-lg">
                100% Retainer Performance SLA Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                If our senior underwriting syndicate fails to deliver at least two qualified, partner bank term sheets within your tier's specified SLA turnaround window, you receive an immediate 100% refund of your membership retainer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectPlanFromHomepage('gold')}
              className="min-h-[44px] px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span>Get Started with Gold Executive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
