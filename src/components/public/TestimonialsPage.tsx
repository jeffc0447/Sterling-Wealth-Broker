import React from 'react';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Building2,
  Award,
  Lock,
  Quote,
  TrendingUp,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const TestimonialsPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

  const testimonials = [
    {
      title: '$1.85M Commercial Facility Funded in 48 Hours',
      quote:
        'Our logistics firm faced an urgent warehouse acquisition deadline after a regional commercial bank stalled our diligence for 6 weeks. Marcus Vance and the Sterling syndicate desk mobilized our file across two private institutional debt funds, delivered binding term sheets within 24 hours, and wired closing funds within 48 hours of Gold tier review.',
      author: 'Harrison Reed',
      position: 'Managing Principal · TransPacific Freight Corp',
      tier: 'Gold Executive Access',
      tierTag: 'Business Loan',
      location: 'Chicago, IL',
      amount: '$1,850,000 Commercial Line',
      verified: true,
    },
    {
      title: 'Standby Letter of Credit (SBLC) Delivered Flawlessly',
      quote:
        'Structuring an international $12M performance guarantee for a cross-border liquefied natural gas contract was frictionless. Vivienne Dubois coordinated directly with our trade desk and Barclays London, issuing MT760 coordinates ahead of schedule. Unrivaled institutional sophistication and zero broker runaround.',
      author: 'Camilla Dupont',
      position: 'Chief Investment Officer · Alpine Trade Finance Ltd',
      tier: 'Diamond Syndicate Retainer',
      tierTag: 'Financial Instruments',
      location: 'Geneva / London',
      amount: '$12,000,000 SBLC MT760',
      verified: true,
    },
    {
      title: 'Transparent Fees & Dedicated Broker Representation',
      quote:
        'The Silver membership gave me direct access to an executive underwriter for my surgical center expansion. No surprise broker points, clear document requests, and approval within 24 hours at a 5.25% fixed APR. Sterling Wealth operates with true fiduciary discipline.',
      author: 'Dr. Aris Thorne',
      position: 'Founder & Medical Director · BioHealth Surgical Associates',
      tier: 'Silver Personal Access',
      tierTag: 'Personal Loan',
      location: 'Dallas, TX',
      amount: '$450,000 Medical Practice Line',
      verified: true,
    },
    {
      title: '$4.2M Mezzanine Acquisition Debt Syndicated in 5 Days',
      quote:
        'As real estate sponsors, time kills deals. Our retail bank could not get their committee together before our purchase-and-sale deposit became non-refundable. Jonathan Hayes stepped in, pre-underwrote our debt service coverage, and syndicated the mezzanine piece across two family offices. We closed smoothly.',
      author: 'Mateo Morales',
      position: 'Managing Partner · Skyline Capital Partners',
      tier: 'Platinum Prestige',
      tierTag: 'Business Loan',
      location: 'Miami, FL',
      amount: '$4,200,000 Mezzanine Facility',
      verified: true,
    },
    {
      title: 'Non-Dilutive Growth Debt Without Equity Warrants',
      quote:
        'Venture capitalists wanted 8% equity dilution for a growth round. Sterling Wealth showed us how to leverage our recurring SaaS contracts into a $1.2M non-dilutive credit line. We retained 100% cap table ownership and closed at a wholesale interest rate 1.75% below retail market.',
      author: 'Sandra Chen',
      position: 'Chief Financial Officer · NexaCloud Technologies',
      tier: 'Gold Executive Access',
      tierTag: 'Business Loan',
      location: 'Austin, TX',
      amount: '$1,200,000 SaaS Working Capital',
      verified: true,
    },
    {
      title: '$8.5M Securities-Backed Liquidity with Swiss Custody',
      quote:
        'Pledging private equities and municipal bonds without liquidating positions required bespoke structuring. Sarah Lin structured a securities-backed revolving line through a Zurich private bank, allowing us to fund a private equity direct co-investment in under 3 days.',
      author: 'Lord Alistair Sterling-Grey',
      position: 'Managing Director · Grey-Monmouth Family Office',
      tier: 'Diamond Syndicate Retainer',
      tierTag: 'Financial Instruments',
      location: 'London & Zurich',
      amount: '$8,500,000 Securities Facility',
      verified: true,
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
            <span className="text-emerald-400 font-medium">Testimonials</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span>Trustpilot 4.9/5 · BBB A+ Rating</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Institutional Borrower Testimonials & Case Studies
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              Read verified feedback from mid-market corporate principals, private wealth family offices, real estate sponsors, and entrepreneurs who secured non-dilutive credit facilities through our syndicate desk.
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
                onClick={() => navigateToPublicPage('pricing')}
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition cursor-pointer"
              >
                <span>View Membership Tiers</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Ratings Highlights */}
      <section className="py-8 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-2xl font-bold text-white font-display">4.9 / 5.0</div>
              <div className="text-xs text-amber-400 font-semibold mt-0.5">Trustpilot Score</div>
              <div className="text-[10px] text-slate-500">Over 1,240+ Verified Reviews</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-2xl font-bold text-white font-display">A+ Rating</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">Better Business Bureau</div>
              <div className="text-[10px] text-slate-500">Accredited Financial Brokerage</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-2xl font-bold text-white font-display">99.4%</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">SLA Fulfillment Rate</div>
              <div className="text-[10px] text-slate-500">Contractual Placement Guarantee</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-2xl font-bold text-white font-display">$1.4B+</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">Total Debt Syndicated</div>
              <div className="text-[10px] text-slate-500">Across 45+ Tier-1 Institutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials 2-Column Grid */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-5 hover:border-slate-700 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.amount}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    "{item.title}"
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.quote}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white text-xs">{item.author}</div>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{item.position}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>{item.location}</span>
                    <span className="text-slate-400 font-medium">Tier: {item.tier}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Join Over 1,200+ Successfully Funded Principals
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Select your membership tier to lock in dedicated underwriting representation, wholesale APR discounts, and contractual placement SLAs.
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
