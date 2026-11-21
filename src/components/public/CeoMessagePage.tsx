import React from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Star,
  Lock,
  Quote,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const CeoMessagePage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

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
            <span className="text-emerald-400 font-medium">CEO’s Message</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              <FileText className="w-4 h-4" />
              <span>Executive Perspective & Founder’s Letter</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              A Message from Our Founder & CEO
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              "We built Sterling Wealth Broker on a straightforward conviction: sophisticated borrowers deserve direct, institutional-grade access to Tier-1 capital with contractual certainty, transparent terms, and zero retail friction."
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
                <span>Inquire with Syndicate Desk</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Executive Letter Card */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden space-y-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

            {/* Letter Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-slate-950 border border-emerald-400/40 flex items-center justify-center text-slate-950 font-display font-bold text-3xl shadow-xl shadow-emerald-500/20 shrink-0">
                  JS
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">Julian Sterling</h2>
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">
                    Founder, Chief Executive Officer & Managing Director
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Sterling Wealth Brokerage Group LLC · Canary Wharf & Wall St Desks
                  </p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Executive Mandate</span>
                <span className="text-xs font-bold text-emerald-400">100% Backed Placement SLA</span>
              </div>
            </div>

            {/* Letter Body */}
            <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <Quote className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-emerald-200/90 italic font-medium leading-relaxed">
                  "Credit is the lifeblood of enterprise. Yet for decades, commercial borrowing has been trapped behind bureaucratic retail depository committees incapable of moving at the speed of modern deals."
                </p>
              </div>

              <p>
                To Our Valued Members, Partners, and Prospective Principals,
              </p>

              <p>
                When my partners and I founded Sterling Wealth Broker in 2016 following decades in structured finance at Wall Street institutions, we identified a profound systemic failure in commercial debt placement: worthy, highly profitable enterprises and asset sponsors were routinely delayed or declined by traditional depository banks.
              </p>

              <p>
                The cause was rarely the borrower's fundamental credit quality. Rather, traditional banks operate under rigid, single-institution credit algorithms. If a bank’s internal quota for commercial real estate or specialized equipment is exhausted for the quarter, the client’s loan is declined—wasting weeks of diligence and forfeiting critical business opportunities.
              </p>

              <h3 className="font-display text-lg font-bold text-white pt-2">
                A New Paradigm: The Institutional Syndicate Architecture
              </h3>

              <p>
                Sterling Wealth Broker was founded to re-engineer this dynamic from first principles. By establishing an authorized syndicate of over 45 Tier-1 commercial banks, sovereign funds, private debt institutions, and family office balance sheets, we transformed commercial borrowing into a competitive, multi-lender process.
              </p>

              <p>
                When you apply under our Membership Tiers, your file is not tossed into an automated black box. A dedicated senior underwriter personally reviews your financials, models your debt service ratios, and crafts an institutional credit dossier pre-cleared against our lenders' specific covenants. Lenders then compete to fund your file, driving down your effective APR and maximizing your credit ceiling.
              </p>

              <h3 className="font-display text-lg font-bold text-white pt-2">
                Our Three Unshakeable Commitments to Every Member
              </h3>

              <div className="space-y-3.5 pl-2 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">1. Contractual Turnaround SLAs:</strong>{' '}
                    <span className="text-slate-400">
                      We value your time as much as you do. Our Gold, Platinum, and Diamond tiers operate on guaranteed review windows—delivering preliminary term sheets in as fast as 24 hours.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">2. 100% Placement SLA Guarantee:</strong>{' '}
                    <span className="text-slate-400">
                      Our alignment is absolute. If our syndicate desk fails to deliver at least two qualifying institutional debt offers within your tier’s commitment window, your membership fee is refunded 100% in full.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">3. Ironclad Confidentiality:</strong>{' '}
                    <span className="text-slate-400">
                      We operate with zero-knowledge AES-256 client document vaults under binding non-disclosure agreements. Your balance sheets, tax returns, and identity filings remain strictly confidential.
                    </span>
                  </div>
                </div>
              </div>

              <p className="pt-2">
                Whether you are accessing an unsecured $100,000 personal liquidity facility, syndicating a $2.5M commercial credit line, or issuing a $15M+ Standby Letter of Credit (SBLC), my team and I look forward to serving as your steadfast capital advocates.
              </p>

              <p>
                Sincerely,
              </p>
            </div>

            {/* Letter Sign-Off & Official Seal */}
            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="font-serif text-2xl text-emerald-400 font-bold tracking-wider italic">
                  Julian Sterling
                </div>
                <div className="text-xs font-semibold text-white mt-1">Julian Sterling</div>
                <div className="text-xs text-slate-400">Founder & Chief Executive Officer</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">FinCEN MSB Compliance Officer</div>
              </div>

              {/* Digital Verification Seal */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                <div className="text-[11px]">
                  <span className="font-bold text-white block">Officially Verified Executive Seal</span>
                  <span className="text-slate-400 block font-mono text-[10px]">Sterling Syndicate Desk · Auth #7892-JS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Ready to Begin Underwriting?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Choose your membership tier to lock in dedicated senior underwriter representation and contractual placement turnaround times.
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
              onClick={() => navigateToPublicPage('contact')}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <span>Contact Executive Desk</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
