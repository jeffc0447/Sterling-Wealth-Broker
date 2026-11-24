import React from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  ShieldCheck,
  Check,
  ArrowRight,
  Briefcase,
  User,
  Building2,
  DollarSign,
  Clock,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { MembershipTier } from '../../types';

export const ClientMembershipPlans: React.FC = () => {
  const {
    tiers,
    currentUser,
    setSelectedCheckoutTier,
    requestMembershipTierSelection,
    openLoanWizardWithInstrument,
    instruments,
  } = useBroker();

  // Group tiers
  const silverTier = tiers.find((t) => t.id === 'silver') || tiers[0];
  const goldTier = tiers.find((t) => t.id === 'gold') || tiers[1];
  const platinumTier = tiers.find((t) => t.id === 'platinum') || tiers[2];
  const diamondTier = tiers.find((t) => t.id === 'diamond') || tiers[3];

  const businessTiers = [goldTier, platinumTier, diamondTier].filter(Boolean);

  const handleSelectTier = (tier: MembershipTier) => {
    setSelectedCheckoutTier(tier);
  };

  // Group financial instruments
  const commercialInstruments = instruments.filter(
    (i) => i.id === 'inst-commercial-mortgage' || i.id === 'inst-revolving-line'
  );
  const personalInstrument = instruments.find((i) => i.id === 'inst-unsecured-personal');
  const equipmentInstrument = instruments.find((i) => i.id === 'inst-equipment-facility');
  const privateWealthInstrument = instruments.find((i) => i.id === 'inst-private-wealth-liquidity');

  return (
    <div id="client-membership-plans" className="space-y-8 mt-6">
      {/* Section Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Membership Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Membership Packages & Syndicate Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Choose your preferred membership package or upgrade an existing tier. All membership tier selections are manually reviewed and approved by Customer Care Support in the Admin Panel before activation.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Your Active Tier</span>
            <span className="text-sm font-bold text-amber-400 font-display">
              {tiers.find((t) => t.id === currentUser.membershipTierId)?.name ||
                'No Active Tier Assigned'}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">
              Status: {currentUser.membershipStatus}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
         GROUP 1: PERSONAL LOAN (SILVER MEMBERSHIP PACKAGE)
         ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              PERSONAL LOAN
            </h3>
            <p className="text-xs text-slate-400">
              Personal Macro and Silver Access Tier ($10,000 – $50,000 Borrowing Capacity)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {silverTier.badge || 'Tier 1 · Personal Credit'}
                  </span>
                  <h4 className="text-xl font-bold text-white font-display mt-2">
                    {silverTier.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    No-collateral personal credit lines for high-earning executives, directors, and accredited individuals.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-display text-white">
                    ${silverTier.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">/{silverTier.period}</div>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 my-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Max Capacity</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    ${silverTier.maxLoanLimit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Review SLA</span>
                  <span className="font-semibold text-white">{silverTier.processingSLA}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">APR Discount</span>
                  <span className="font-semibold text-emerald-300">-{silverTier.aprDiscount}% APR</span>
                </div>
              </div>

              {/* Privileges List */}
              <div className="space-y-2 text-xs">
                <span className="text-[11px] font-semibold uppercase text-slate-300 tracking-wider block">
                  Included Privileges:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {silverTier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero prepayment penalties · Direct syndicate placement
              </span>

              {currentUser.membershipTierId === silverTier.id ? (
                <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  Active Package
                </span>
              ) : currentUser.pendingUpgrade?.requestedTierId === silverTier.id &&
                currentUser.pendingUpgrade.status === 'PENDING_VERIFICATION' ? (
                <span className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  Pending Customer Care Approval
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => requestMembershipTierSelection(silverTier.id)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Submit Choice (Care Review)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTier(silverTier)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Pay &amp; Select Personal Loan (Silver)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Personal Loan Instrument Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold block mb-1">
                Matched Facility
              </span>
              <h4 className="text-base font-bold text-white font-display">
                Executive Personal Credit Facility
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Single-signature liquidity from SoFi Institutional, Marcus by Goldman, and Discover Premier.
              </p>

              <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Limit:</span>
                  <span className="font-semibold text-white">$10,000 – $50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Indicative Rate:</span>
                  <span className="font-semibold text-emerald-400">7.20% - 11.50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tenure:</span>
                  <span className="text-white">24 to 60 Months Fixed</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openLoanWizardWithInstrument(personalInstrument?.id, 35000)}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Apply for Personal Credit Facility</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
         GROUP 2: BUSINESS LOAN (GOLD, PLATINUM & DIAMOND PACKAGES)
         ========================================================= */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              BUSINESS LOAN
            </h3>
            <p className="text-xs text-slate-400">
              Gold Executive, Platinum Prestige & Diamond Syndicate Packages ($250,000 to $15,000,000+)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {businessTiers.map((tier) => {
            const isActive = currentUser.membershipTierId === tier.id;
            const isPopular = tier.id === 'gold';

            return (
              <div
                key={tier.id}
                className={`bg-slate-900 rounded-2xl border transition flex flex-col justify-between relative overflow-hidden ${
                  isPopular
                    ? 'border-amber-500/60 shadow-xl shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {isPopular && (
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider py-1 px-3 text-center">
                    Top Business Loan Selection
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold block">
                        {tier.badge}
                      </span>
                      <h4 className="text-xl font-bold text-white font-display mt-1">
                        {tier.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-display text-white">
                        ${tier.price.toLocaleString()}
                      </div>
                      <span className="text-[11px] text-slate-400">/{tier.period}</span>
                    </div>
                  </div>

                  {/* Limit & SLA Strip */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 my-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Commercial Capacity:</span>
                      <strong className="text-emerald-400 font-mono">
                        ${tier.maxLoanLimit.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Turnaround SLA:</span>
                      <span className="text-white font-medium">{tier.processingSLA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Syndicate APR Discount:</span>
                      <span className="text-amber-400 font-semibold">-{tier.aprDiscount}% APR</span>
                    </div>
                  </div>

                  {/* Included Privileges */}
                  <div className="space-y-2 mt-4 text-xs">
                    <span className="text-[11px] font-semibold uppercase text-slate-300 tracking-wider block">
                      Included Privileges:
                    </span>
                    <ul className="space-y-1.5">
                      {tier.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-4">
                  {isActive ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
                      Currently Active Business Package
                    </div>
                  ) : currentUser.pendingUpgrade?.requestedTierId === tier.id &&
                    currentUser.pendingUpgrade.status === 'PENDING_VERIFICATION' ? (
                    <div className="w-full py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold text-center">
                      Pending Customer Care Approval
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTier(tier)}
                        className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                          isPopular
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        }`}
                      >
                        <span>Pay &amp; Select {tier.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestMembershipTierSelection(tier.id)}
                        className="w-full py-2 px-4 font-semibold rounded-xl text-[11px] bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                      >
                        Request Package (Customer Care Review)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
         GROUP 3: FINANCIAL INSTRUMENT DIRECTORY (4 CATEGORIES)
         ========================================================= */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              FINANCIAL INSTRUMENT DIRECTORY
            </h3>
            <p className="text-xs text-slate-400">
              Commercial & Corporate, Executive Personal, Equipment & Fleet, Private Wealth & Securities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category 1: Commercial & Corporate */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="text-[10px] text-sky-400 font-mono uppercase font-semibold">
                Category 01
              </div>
              <h4 className="font-bold text-white font-display text-base mt-1">
                Commercial & Corporate
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Commercial mortgages, multi-family construction loans, and revolving working capital lines up to $1M+.
              </p>
              <div className="mt-3 text-[11px] text-slate-300 font-mono space-y-1">
                <div>• Property Acquisition Facility</div>
                <div>• Corporate Revolving Credit Line</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openLoanWizardWithInstrument('inst-revolving-line', 150000)}
              className="mt-4 w-full py-2 bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <span>Explore Commercial</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category 2: Executive Personal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="text-[10px] text-emerald-400 font-mono uppercase font-semibold">
                Category 02
              </div>
              <h4 className="font-bold text-white font-display text-base mt-1">
                Executive Personal
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Unsecured personal liquidity ($10k to $50k) for accredited professionals with zero business balance sheet liens.
              </p>
              <div className="mt-3 text-[11px] text-slate-300 font-mono space-y-1">
                <div>• Executive Personal Credit Facility</div>
                <div>• 24-Hour Desk Clearance</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openLoanWizardWithInstrument('inst-unsecured-personal', 40000)}
              className="mt-4 w-full py-2 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <span>Explore Personal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category 3: Equipment & Fleet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="text-[10px] text-amber-400 font-mono uppercase font-semibold">
                Category 03
              </div>
              <h4 className="font-bold text-white font-display text-base mt-1">
                Equipment & Fleet
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                100% heavy machinery, medical devices, logistics fleets, and precision tooling facilities ($40k to $250k).
              </p>
              <div className="mt-3 text-[11px] text-slate-300 font-mono space-y-1">
                <div>• Industrial Fleet Financing</div>
                <div>• Section 179 Tax Advantage</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openLoanWizardWithInstrument('inst-equipment-facility', 120000)}
              className="mt-4 w-full py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <span>Explore Equipment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category 4: Private Wealth & Securities */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="text-[10px] text-purple-400 font-mono uppercase font-semibold">
                Category 04
              </div>
              <h4 className="font-bold text-white font-display text-base mt-1">
                Private Wealth & Securities
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Securities-backed revolving facilities ($1M to $15M+) pledged against investment portfolios and debt instruments.
              </p>
              <div className="mt-3 text-[11px] text-slate-300 font-mono space-y-1">
                <div>• Securities-Backed Liquidity</div>
                <div>• Sovereign Grade Advisory</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openLoanWizardWithInstrument('inst-private-wealth-liquidity', 2500000)}
              className="mt-4 w-full py-2 bg-slate-950 hover:bg-slate-800 text-purple-400 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <span>Explore Private Wealth</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
         ADDITIONAL MEMBERSHIP PACKAGE TIERS PRIVILEGES
         ========================================================= */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h4 className="font-display text-base font-bold text-white">
            Comprehensive Membership Package Privileges
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-semibold text-emerald-400 block">100% SLA Guarantee</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Full refund of membership fees if our syndicate desk fails to deliver at least two qualified partner bank term sheets within SLA.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-semibold text-sky-400 block">Dedicated Desk Representation</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Senior underwriters and Managing Director level representation across 30+ Tier-1 European and North American syndicated desks.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-semibold text-amber-400 block">Confidential AES-256 Vault</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              All tax filings, proof of funds, and KYC documents are encrypted using zero-knowledge cryptography with zero external credit bureau footprints.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-semibold text-purple-400 block">Multi-Gateway Settlement</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Upgrade membership instantly via Credit Card (with AVS Level-1 verification), Web3 cryptocurrency, or manual FDIC bank wire escrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
