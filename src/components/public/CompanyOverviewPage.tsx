import React from 'react';
import {
  Shield,
  ShieldCheck,
  Building2,
  TrendingUp,
  Lock,
  Star,
  Award,
  Globe2,
  ArrowRight,
  ChevronRight,
  FileCheck2,
  CheckCircle2,
  Clock,
  Landmark,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const CompanyOverviewPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

  const keyMetrics = [
    { metric: '$1.4B+', label: 'Total Capital Placed', desc: 'Over a decade of successful commercial loans and credit syndication' },
    { metric: '45+', label: 'Tier-1 Banking Partners', desc: 'Direct routing across institutional commercial balance sheets' },
    { metric: '99.4%', label: 'Placement SLA Guarantee', desc: 'Clients receive qualifying institutional debt offers within commitment bounds' },
    { metric: '24–72h', label: 'Underwriter Review SLA', desc: 'Guaranteed desk review and terms sheet formulation' },
  ];

  const globalDesks = [
    {
      city: 'London Syndicate Desk',
      address: 'One Canada Square, Canary Wharf',
      region: 'London E14 5AA, United Kingdom',
      hours: '08:00 – 18:00 GMT',
      focus: 'SBLC, International Guarantees, Cross-Border Liquidity',
    },
    {
      city: 'New York Capital Desk',
      address: '40 Wall Street, 28th Floor',
      region: 'New York, NY 10005, United States',
      hours: '08:30 – 18:30 EST',
      focus: 'Commercial Real Estate, Corporate Debt, Working Capital',
    },
    {
      city: 'San Francisco Tech & Growth Desk',
      address: '240 Stockton Street, Suite 800',
      region: 'San Francisco, CA 94108, United States',
      hours: '08:00 – 17:30 PST',
      focus: 'Venture Debt, Equipment Leasing, Founder Credit Facilities',
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
            <span className="text-emerald-400 font-medium">Company Overview</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              <Building2 className="w-4 h-4" />
              <span>Direct Institutional Brokerage Syndicate</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Company Overview & Institutional Heritage
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              Founded in 2016 by former Wall Street and City of London credit desk officers, Sterling Wealth Broker is an authorized institutional debt placement syndicate. We connect qualified enterprises, real estate sponsors, and private principals directly to Tier-1 institutional balance sheets—bypassing retail banking bottlenecks and delays.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => openRegistrationWithTier('gold')}
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Apply for Membership</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateToPublicPage('contact')}
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition cursor-pointer"
              >
                <span>Contact Syndicate Desk</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {keyMetrics.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-left space-y-1"
              >
                <div className="font-display text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {item.metric}
                </div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {item.label}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug pt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Narrative & Institutional Foundation */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Our Operational DNA
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Engineered to Eliminate Single-Lender Rejection Risk
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                When an enterprise applies directly to a standard commercial depository, their application is subjected to rigid single-institution credit criteria. If that lender’s current sector allocation is saturated, the loan is declined regardless of the borrower’s intrinsic balance sheet strength.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sterling Wealth Broker operates on an institutional syndication model: our underwriting desk structures and packages your borrowing facility, pre-clearing credit covenants before syndicating it across our private network of 45+ institutional balance sheets. Lenders compete for allocation, securing you wholesale pricing, higher borrowing limits, and rapid capital disbursement.
              </p>

              <div className="pt-2 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>FinCEN Registered Money Services Business (MSB #31000218849)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>256-Bit AES Hardware Vault Architecture with Zero-Knowledge Client Dossiers</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Triple-rail settlement: Stripe Credit Card, Fedwire/SWIFT, and Cold-Storage Crypto</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <span>The Syndicate Advantage</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-white block mb-1">Single-Point Accountability</span>
                  <p className="text-slate-400">
                    You work exclusively with an assigned senior underwriter. We manage all lender committee negotiations, legal drafting, and closing procedures.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-white block mb-1">Wholesale Pricing Spreads</span>
                  <p className="text-slate-400">
                    Syndicate volume commands wholesale borrowing discounts—reducing your effective APR by up to 2.25% compared to retail commercial bank offers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-white block mb-1">Contractual SLA Protection</span>
                  <p className="text-slate-400">
                    100% money-back guarantee if two qualifying institutional financing proposals are not delivered within your tier turnaround commitment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Desks */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              International Footprint
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Global Syndicate Desks
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Strategically positioned across primary financial centers to execute domestic and cross-border credit facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {globalDesks.map((desk, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    <Globe2 className="w-4 h-4" />
                    <span>{desk.city}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{desk.address}</h3>
                  <p className="text-xs text-slate-400 mt-1">{desk.region}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500">Trading Hours:</span>{' '}
                    <span className="text-slate-300 font-medium">{desk.hours}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Facility Focus:</span>{' '}
                    <span className="text-slate-300 font-medium">{desk.focus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulatory Compliance & Badges */}
      <section className="py-12 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Institutional Oversight & Trust Accreditations
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-white">FinCEN MSB</div>
              <div className="text-[10px] text-slate-400">Reg #31000218849</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <Lock className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-white">256-Bit SSL/TLS</div>
              <div className="text-[10px] text-slate-400">AES Hardware Vault</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <Building2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-white">FDIC Syndicate</div>
              <div className="text-[10px] text-slate-400">Partner Bank Escrow</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <Star className="w-6 h-6 text-amber-400 mx-auto mb-1.5 fill-amber-400" />
              <div className="text-xs font-bold text-white">Trustpilot 4.9/5</div>
              <div className="text-[10px] text-slate-400">Verified Borrower Rating</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
              <Award className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-white">BBB Accredited</div>
              <div className="text-[10px] text-slate-400">A+ Financial Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Access Tier-1 Institutional Credit Desks
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Choose your membership package to begin loan underwriting with dedicated desk representation and binding SLA turnaround times.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openRegistrationWithTier('gold')}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply for Membership</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToPublicPage('pricing')}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <span>Compare All Tiers</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
