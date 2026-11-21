import React from 'react';
import { useBroker } from '../../context/BrokerContext';
import { Star, ShieldCheck, Quote, X, Bell } from 'lucide-react';

export const TestimonialsAndSecurity: React.FC = () => {
  const { activeToast, dismissToast } = useBroker();

  const reviews = [
    {
      author: 'Marcus Vance-Lowell',
      role: 'Chief Investment Officer, Vance Capital Partners',
      quote:
        'Sterling Wealth secured our $4.5M bridge facility within 36 hours. Their syndicate relationships with Barclays and private liquidity desks are unrivaled by typical commercial brokers.',
      tier: 'Diamond Syndicate Member',
      stars: 5,
    },
    {
      author: 'Dr. Helena Rostova',
      role: 'Managing Principal, Apex BioDiagnostics',
      quote:
        'Enrolling in the Gold Executive package allowed us to bypass lengthy high-street branch bureaucracy. Our dedicated broker Julian handled the underwriting notes seamlessly.',
      tier: 'Gold Executive Member',
      stars: 5,
    },
    {
      author: 'David Sterling-Wu',
      role: 'Founder & CEO, Horizon Logistics Ltd',
      quote:
        'The Document Vault with cryptographic SHA-256 signatures gave our corporate board complete peace of mind. We secured 100% equipment financing on our fleet on attractive terms.',
      tier: 'Platinum Prestige Member',
      stars: 5,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-900/40 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Accredited Testimonials
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2">
            Trusted by Enterprise Leaders & Private Capitalists
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Read verified reviews from borrowers who have scaled their operations via our tiered syndicate access.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 gap-0.5">
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {rev.tier}
                  </span>
                </div>

                <Quote className="w-6 h-6 text-slate-700 mb-2" />
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-xs font-semibold text-white">{rev.author}</div>
                <div className="text-[11px] text-slate-400">{rev.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Regulatory Disclaimers Notice */}
        <div className="mt-16 bg-slate-950/90 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Brokerage Regulatory Compliance & Lending Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            Sterling Wealth Broker operates as an independent capital arranger and institutional loan broker, connecting qualified prospective borrowers with accredited depository institutions, national banks, and specialized asset finance syndicates. Sterling Wealth Broker is not a direct depository bank and does not make direct consumer credit determinations without partner lender covenant approval. Membership fees cover professional brokerage advisory, underwriter packaging, dedicated account representation, and access to proprietary syndicated rates.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-500 font-mono">
            <span>FINRA BrokerCheck ID #849102</span>
            <span>·</span>
            <span>NMLS Unique Identifier #94819</span>
            <span>·</span>
            <span>PCI-DSS Level 1 Encrypted</span>
            <span>·</span>
            <span>GDPR/CCPA Compliant Zero-Knowledge Vault</span>
          </div>
        </div>

      </div>

      {/* LIVE POP-UP NOTIFICATION TOAST (social proof in bottom left corner) */}
      {activeToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm bg-slate-900 border border-emerald-500/40 rounded-xl p-3.5 shadow-2xl shadow-emerald-950/50 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {activeToast.message}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              {activeToast.tier}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{activeToast.location}</span>
              <span>·</span>
              <span>{activeToast.timeAgo}</span>
            </div>
          </div>
          <button
            onClick={dismissToast}
            className="text-slate-500 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};
