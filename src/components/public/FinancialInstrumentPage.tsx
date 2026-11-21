import React from 'react';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Lock,
  ArrowRight,
  Globe2,
  Layers,
  Sparkles,
  Building2,
  Scale
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const FinancialInstrumentPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

  const instrumentsList = [
    {
      code: 'SBLC (MT760)',
      name: 'Standby Letter of Credit',
      faceValue: '$500,000 – $25,000,000+',
      cost: '4.5% – 8.5% Face Value',
      tenor: '1 Year & 1 Day (Renewable)',
      issuers: 'Barclays, HSBC, Deutsche Bank, UBS',
      desc: 'An irrevocable commitment from a Tier-1 bank ensuring financial backing for international trade, project development, or collateral monetization.',
      uses: ['Large-scale commodity trade', 'EPC infrastructure project backing', 'Credit enhancement for loan syndication'],
    },
    {
      code: 'BG (MT760)',
      name: 'Bank Guarantee',
      faceValue: '$250,000 – $15,000,000',
      cost: '5.0% – 9.0% Face Value',
      tenor: '1 to 5 Years',
      issuers: 'Credit Suisse, Standard Chartered, BNP Paribas',
      desc: 'Direct performance and payment guarantees issued under ICC uniform rules (URDG 758), serving as primary tender and advance payment security.',
      uses: ['Commercial tenders and performance bonds', 'Cross-border import/export security', 'Real estate development security'],
    },
    {
      code: 'POF (MT799/999)',
      name: 'Proof of Funds & Pre-Advice',
      faceValue: '$1,000,000 – $50,000,000+',
      cost: 'Fixed Administrative Tariff',
      tenor: '30 to 90 Days',
      issuers: 'Top 50 Global Clearing Banks',
      desc: 'SWIFT authenticated electronic proof confirming liquid capital reserves on deposit, required by sovereign sellers and institutional sellers.',
      uses: ['Commercial asset acquisition proof', 'High-value commodity contracts', 'Private equity co-investment capacity'],
    },
    {
      code: 'SBL',
      name: 'Securities-Backed Liquidity',
      faceValue: '$250,000 – $10,000,000',
      cost: 'SOFR + 1.85% Spread',
      tenor: 'Revolving Line (No Fixed Expiration)',
      issuers: 'Sterling Private Wealth Desk & Syndicate',
      desc: 'Unlock immediate non-recourse cash liquidity against public equities, corporate bonds, or treasury holdings without triggering taxable capital gains.',
      uses: ['Zero tax liquidation events', 'Rapid opportunistic acquisitions', 'Personal estate and portfolio protection'],
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Mandate & Compliance Intake',
      desc: 'Applicant submits Client Information Sheet (CIS), corporate registry, and verified proof of identity to our compliance vault.',
    },
    {
      step: '02',
      title: 'Custodial Escrow Formulation',
      desc: 'Tri-party contract between borrower, issuing prime bank, and insured escrow custodian is executed to guarantee delivery.',
    },
    {
      step: '03',
      title: 'SWIFT MT799 Pre-Advice',
      desc: 'Issuing bank transmits verified SWIFT pre-advice to the receiving institution confirming instrument allocation and authorization.',
    },
    {
      step: '04',
      title: 'Final MT760 Delivery & Release',
      desc: 'Full instrument is authenticated on SWIFT network; liquidity or credit enhancement facility is activated.',
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
              <Coins className="w-4 h-4" />
              <span>Specialized Financial Instruments</span>
              <span aria-hidden="true">·</span>
              <span>ICC 500 / 600 UCP Compliant</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Tier-1 Bank Guarantees, SBLCs, & Liquidity Instruments
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Sterling Wealth Broker structures institutional credit enhancement mechanisms including Standby Letters of Credit (SBLC), Bank Guarantees (BG), and authenticated SWIFT Proof of Funds (MT799/MT760) from top global clearing banks.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => openRegistrationWithTier('platinum')}
                className="w-full sm:w-auto min-h-[48px] py-3.5 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Apply for Platinum Prestige Tier</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateToPublicPage('contact')}
                className="w-full sm:w-auto min-h-[48px] py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 border border-slate-700/80 font-semibold text-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Speak with Structuring Lead</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                SWIFT Direct Transmission
              </span>
              <span>·</span>
              <span>Top 25 Issuing Banks</span>
              <span>·</span>
              <span>Custodial Escrow Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Institutional Product Matrix
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Tailored Credit Enhancements & SWIFT Routing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {instrumentsList.map((inst, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                      {inst.code}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{inst.tenor}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-3">{inst.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{inst.desc}</p>

                  <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Face Value</span>
                      <span className="text-white font-mono font-semibold">{inst.faceValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Cost Structure</span>
                      <span className="text-amber-400 font-mono font-semibold">{inst.cost}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Common Applications:
                    </span>
                    {inst.uses.map((u, ui) => (
                      <div key={ui} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    Banks: {inst.issuers}
                  </div>
                  <button
                    onClick={() => openRegistrationWithTier('platinum')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Request Allocation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SWIFT & Escrow Workflow */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Execution Protocol
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Four-Stage Institutional Delivery
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Protected by licensed custodial escrow. Zero capital transmission occurs prior to authenticated SWIFT transmission and bilateral legal verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((ws, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-display font-bold text-amber-400/80 mb-2 block font-mono">
                    {ws.step}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-2">{ws.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{ws.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Escrow Secured</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-amber-500/30 shadow-2xl space-y-6">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Private Wealth & Institutional Desk
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white max-w-2xl mx-auto">
              Structure Bespoke Bank Guarantees & SBLCs
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Our Diamond Syndicate and Platinum Prestige members work directly with former Tier-1 structured finance leads for custom non-recourse facilities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => openRegistrationWithTier('diamond')}
                className="w-full sm:w-auto min-h-[48px] py-3.5 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Enroll in Diamond Syndicate ($15M+)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateToPublicPage('contact')}
                className="w-full sm:w-auto min-h-[48px] py-3.5 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Request Private Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
