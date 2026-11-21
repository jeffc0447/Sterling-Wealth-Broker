import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { FinancialInstrument } from '../../types';
import { Banknote, Building2, Briefcase, Gem, Clock, ArrowRight, X, FileText, CheckCircle2 } from 'lucide-react';

export const FinancialInstrumentsDirectory: React.FC = () => {
  const { instruments, tiers, openLoanWizardWithInstrument } = useBroker();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalInstrument, setActiveModalInstrument] = useState<FinancialInstrument | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Instruments' },
    { id: 'Commercial', label: 'Commercial & Corporate' },
    { id: 'Personal', label: 'Executive Personal' },
    { id: 'Asset-Backed', label: 'Equipment & Fleet' },
    { id: 'Wealth & Liquidity', label: 'Private Wealth & Securities' },
  ];

  const filteredInstruments = selectedCategory === 'ALL'
    ? instruments
    : instruments.filter((inst) => inst.category === selectedCategory);

  const getTierBadge = (tierId: string) => {
    const t = tiers.find((tier) => tier.id === tierId);
    return t ? t.name : 'Silver Access';
  };

  return (
    <section id="instruments-section" className="py-16 lg:py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Brokered Facilities
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">
              Financial Instruments Directory
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Inspect eligibility criteria, documentation prerequisites, and indicative term sheets across our institutional debt portfolio.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  selectedCategory === c.id
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Instruments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstruments.map((inst) => (
            <div
              key={inst.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 group"
            >
              <div>
                {/* Meta Top Line */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-mono text-emerald-400">{inst.category}</span>
                  <span>Requires {getTierBadge(inst.minTierRequired)}</span>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {inst.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed mb-5 line-clamp-2">
                  {inst.description}
                </p>

                {/* Instrument Quick Financial Specs */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Indicative APR:</span>
                    <strong className="text-emerald-400 font-mono">{inst.aprRange}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Capital Range:</span>
                    <span className="text-slate-200 font-mono font-medium">
                      ${inst.minAmount.toLocaleString()} – ${inst.maxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Term Horizon:</span>
                    <span className="text-slate-300">{inst.termOptions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Underwriting SLA:</span>
                    <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {inst.turnaround}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalInstrument(inst)}
                  className="min-h-[44px] px-2.5 py-2 text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1.5 rounded-lg hover:bg-slate-800/80 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Prerequisites & Criteria</span>
                </button>

                <button
                  type="button"
                  onClick={() => openLoanWizardWithInstrument(inst.id, inst.minAmount)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Instrument Modal */}
        {activeModalInstrument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40 shrink-0">
                <div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1">
                    <span className="font-mono">{activeModalInstrument.category}</span>
                    <span className="text-slate-600">·</span>
                    <span>Min Tier: {getTierBadge(activeModalInstrument.minTierRequired)}</span>
                  </div>
                  <h3 className="font-display font-bold text-white text-lg">
                    {activeModalInstrument.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalInstrument(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label="Close instrument modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">Overview</h4>
                  <p className="text-slate-300 leading-relaxed">
                    {activeModalInstrument.description}
                  </p>
                </div>

                {/* Key Term Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Rate Range</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {activeModalInstrument.aprRange}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Max Ceiling</span>
                    <span className="font-mono font-bold text-white text-sm">
                      ${activeModalInstrument.maxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Term Length</span>
                    <span className="font-medium text-slate-200 text-xs">
                      {activeModalInstrument.termOptions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Review Speed</span>
                    <span className="font-medium text-amber-400 text-xs">
                      {activeModalInstrument.turnaround}
                    </span>
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Eligibility Prerequisites</span>
                  </h4>
                  <ul className="space-y-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                    {activeModalInstrument.eligibility.map((el, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{el}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required Documents */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Required Vault Documentation</span>
                  </h4>
                  <ul className="space-y-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                    {activeModalInstrument.documentsRequired.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-slate-500 font-bold">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Partner Syndicate Lenders */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Primary Banking Syndicate Match:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeModalInstrument.partnerLenders.map((lender, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
                      >
                        {lender}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-400">
                  Assigned broker conducts immediate compliance pre-qualification.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const inst = activeModalInstrument;
                    setActiveModalInstrument(null);
                    openLoanWizardWithInstrument(inst.id, inst.minAmount);
                  }}
                  className="min-h-[44px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>Start Application with this Facility</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
