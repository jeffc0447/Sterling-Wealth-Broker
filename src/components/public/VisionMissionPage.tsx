import React from 'react';
import {
  Compass,
  Target,
  ShieldCheck,
  Building2,
  Lock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap,
  Layers,
  Scale,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const VisionMissionPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

  const coreValues = [
    {
      icon: <Building2 className="w-5 h-5 text-emerald-400" />,
      title: 'Institutional Syndicate Power',
      description:
        'We do not rely on single-lender bottlenecks. Your borrowing request is syndicated across vetted institutional balance sheets competing for yield.',
    },
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      title: 'Zero-Compromise Security',
      description:
        'Every financial statement and KYC document is isolated inside 256-bit AES encrypted vaults, protected under binding non-disclosure agreements.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: '100% Placement SLA Guarantee',
      description:
        'If our underwriting desk fails to present qualifying terms within your tier commitment window, membership fees are fully and promptly refunded.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      title: 'Syndicate APR Discounts',
      description:
        'Members access proprietary wholesale pricing—enjoying up to 2.25% APR reductions compared to standard commercial bank retail desks.',
    },
  ];

  const pillars = [
    {
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      title: '1. Pre-Underwriting Precision',
      desc: 'We stress-test credit profiles, balance sheets, and collateral models against Tier-1 bank risk covenants prior to submission, virtually eliminating institutional loan declines.',
    },
    {
      icon: <Layers className="w-5 h-5 text-teal-400" />,
      title: '2. Multi-Lender Capital Competition',
      desc: 'Instead of waiting for a single lender committee, your financing request is presented simultaneously to a syndicated panel of commercial banks, private debt funds, and family offices.',
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: '3. Binding Turnaround SLAs',
      desc: 'We operate on guaranteed timelines—from 24 hours for Gold Executive review to same-day executive term sheets for Platinum Prestige members.',
    },
    {
      icon: <Scale className="w-5 h-5 text-indigo-400" />,
      title: '4. Non-Dilutive Capital Preservation',
      desc: 'We believe strong founders and enterprise owners should retain full equity ownership. Our credit facilities are strictly non-dilutive, preserving your enterprise value.',
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
            <span className="text-emerald-400 font-medium">Our Vision & Mission</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              <Compass className="w-4 h-4" />
              <span>Institutional Philosophy & Direction</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Our Vision & Mission
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              To eliminate bureaucracy in commercial debt placement by connecting qualified borrowers directly to Tier-1 syndicated balance sheets under binding service level agreements and complete transparency.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => openRegistrationWithTier(null)}
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Join Our Syndicate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateToPublicPage('contact')}
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
              >
                <span>Discuss Credit Needs</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Core Breakdown */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* The Vision */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                The Vision
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                A Financial World Free from Depository Friction
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                We envision a private credit ecosystem where worthy enterprises and asset owners are never held hostage by sluggish retail banking algorithms or unpredictable loan officers.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Capital should move with the velocity of modern commerce. By establishing an authorized network of Tier-1 institutional lenders who adhere to standardized covenants and wholesale spreads, Sterling Wealth Broker sets the benchmark for speed, certainty, and borrower advocacy.
              </p>
            </div>

            {/* The Mission */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                The Mission
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                Direct Desk Advocacy & Binding Placement SLAs
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Our mission is to arm accredited borrowers with dedicated executive underwriting representation, pre-cleared underwriting dossiers, and contractual turnaround guarantees.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                We achieve this by providing transparent membership packages that align our incentives directly with borrower success—backed by our 100% money-back SLA guarantee if qualifying offers are not secured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Execution Methodology
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              The Four Pillars of Our Execution
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Every loan facility syndication is governed by institutional discipline and contractual transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Values 2x2 Grid */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Uncompromising Standards
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Our Core Institutional Values
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              How we conduct underwriting, manage sensitive client balance sheets, and deliver capital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center">
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{v.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Experience Direct Syndicate Borrowing
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Review our membership packages to lock in dedicated underwriting representation, wholesale APR discounts, and contractual placement SLAs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openRegistrationWithTier(null)}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply for Membership</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToPublicPage('pricing')}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <span>Explore Membership Tiers</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
