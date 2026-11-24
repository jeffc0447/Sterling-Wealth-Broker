import React, { useState, useMemo } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTierId } from '../../types';
import {
  calculateTierLoanSchedule,
  BillingAnchorPreference,
  toIsoDateString,
} from '../../utils/loanDateEngine';
import {
  Calendar,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const TierLoanDateEngine: React.FC = () => {
  const {
    tiers,
    currentUser,
    openLoanWizardWithInstrument,
    instruments,
  } = useBroker();

  const silverBaseline = useMemo(
    () => tiers.find((t) => t.id === 'silver') || tiers[0],
    [tiers]
  );

  const initialTierId: MembershipTierId =
    currentUser.membershipTierId ||
    currentUser.pendingUpgrade?.requestedTierId ||
    tiers[1]?.id ||
    tiers[0].id;

  const [selectedTierId, setSelectedTierId] = useState<MembershipTierId>(initialTierId);
  const [loanAmount, setLoanAmount] = useState<number>(150000);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [applicationDateIso, setApplicationDateIso] = useState<string>(() =>
    toIsoDateString(new Date())
  );
  const [anchorPreference, setAnchorPreference] =
    useState<BillingAnchorPreference>('ANNIVERSARY');
  const [showScheduleTable, setShowScheduleTable] = useState<boolean>(false);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  const selectedTier = useMemo(
    () => tiers.find((t) => t.id === selectedTierId) || tiers[0],
    [tiers, selectedTierId]
  );

  const schedule = useMemo(
    () =>
      calculateTierLoanSchedule({
        tier: selectedTier,
        loanAmount,
        termMonths,
        applicationDate: applicationDateIso,
        anchorPreference,
        baselineTier: silverBaseline,
      }),
    [selectedTier, loanAmount, termMonths, applicationDateIso, anchorPreference, silverBaseline]
  );

  // Compute compact speed comparison across all available tiers
  const tierComparisons = useMemo(
    () =>
      tiers.map((tier) =>
        calculateTierLoanSchedule({
          tier,
          loanAmount,
          termMonths,
          applicationDate: applicationDateIso,
          anchorPreference,
          baselineTier: silverBaseline,
        })
      ),
    [tiers, loanAmount, termMonths, applicationDateIso, anchorPreference, silverBaseline]
  );

  const exceedsSelectedTierLimit = loanAmount > selectedTier.maxLoanLimit;
  const visibleInstallments = showAllRows
    ? schedule.installments
    : schedule.installments.slice(0, 12);

  const matchedInstrument = useMemo(() => {
    const byLimit = instruments.find(
      (i) => loanAmount >= i.minAmount && loanAmount <= i.maxAmount
    );
    return byLimit || instruments[0];
  }, [instruments, loanAmount]);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tier-Based Loan Date Calculation Engine</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400">Business-Day Underwriting & Amortization</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white mt-1">
            Calculate Disbursement, First Payment & Maturity Dates by Tier
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Compare underwriting approval dates, syndicate funding timelines, and full monthly due dates based on your membership tier SLA and APR discount.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openLoanWizardWithInstrument(matchedInstrument?.id, loanAmount)
          }
          className="min-h-[42px] px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-md shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <span>Apply With These Terms</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tier Selection Segmented Cards */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Membership Tier SLA Profile</span>
          </span>
          {currentUser.membershipTierId && (
            <span className="text-[11px] text-slate-400">
              Your Active Tier:{' '}
              <strong className="text-emerald-400">
                {tiers.find((t) => t.id === currentUser.membershipTierId)?.name}
              </strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tiers.map((tier) => {
            const isSelected = tier.id === selectedTier.id;
            const isActiveUserTier = tier.id === currentUser.membershipTierId;
            const comp = tierComparisons.find((c) => c.tierId === tier.id);

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTierId(tier.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-white truncate">
                    {tier.name}
                  </span>
                  {isActiveUserTier && (
                    <span className="text-[10px] font-medium text-emerald-400 shrink-0">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                  <span>SLA: {tier.processingSLA}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-mono">
                    -{tier.aprDiscount}% APR
                  </span>
                </div>

                {comp && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Est. Funding:</span>
                    <span className="font-mono font-semibold text-white tabular-nums">
                      {comp.disbursementDateFormatted}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs Row: Date Picker, Principal Slider, Horizon & Anchor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5">
        {/* Application Start Date */}
        <div className="lg:col-span-3 space-y-1.5">
          <label
            htmlFor="engine-intake-date"
            className="block text-xs font-medium text-slate-300"
          >
            Loan Application Date
          </label>
          <input
            id="engine-intake-date"
            type="date"
            value={applicationDateIso}
            onChange={(e) => {
              if (e.target.value) setApplicationDateIso(e.target.value);
            }}
            className="w-full min-h-[40px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => setApplicationDateIso(toIsoDateString(new Date()))}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
          >
            Reset to Today
          </button>
        </div>

        {/* Principal Amount */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="engine-principal-range"
              className="text-xs font-medium text-slate-300"
            >
              Requested Facility Amount
            </label>
            <span className="font-display text-lg font-bold text-white tabular-nums">
              ${loanAmount.toLocaleString()}
            </span>
          </div>
          <input
            id="engine-principal-range"
            type="range"
            min={10000}
            max={Math.max(1000000, selectedTier.maxLoanLimit)}
            step={5000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Tier Max: ${selectedTier.maxLoanLimit.toLocaleString()}</span>
            {exceedsSelectedTierLimit && (
              <span className="text-amber-400 font-medium">
                Exceeds {selectedTier.name} limit
              </span>
            )}
          </div>
        </div>

        {/* Term Months */}
        <div className="lg:col-span-3 space-y-1.5">
          <span className="block text-xs font-medium text-slate-300">
            Repayment Term
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-1.5">
            {[12, 24, 36, 48, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTermMonths(m)}
                className={`min-h-[36px] py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  termMonths === m
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* First Payment Anchor */}
        <div className="lg:col-span-2 space-y-1.5">
          <label
            htmlFor="engine-anchor-select"
            className="block text-xs font-medium text-slate-300"
          >
            Payment Due Day
          </label>
          <select
            id="engine-anchor-select"
            value={anchorPreference}
            onChange={(e) =>
              setAnchorPreference(e.target.value as BillingAnchorPreference)
            }
            className="w-full min-h-[40px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ANNIVERSARY">Funding Anniversary</option>
            <option value="FIRST_OF_MONTH">1st of Month</option>
            <option value="FIFTEENTH_OF_MONTH">15th of Month</option>
          </select>
        </div>
      </div>

      {/* Calculated Tier Milestone Dates Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400">
            1. Underwriting Approval
          </div>
          <div className="font-display text-base font-bold text-white mt-1 tabular-nums">
            {schedule.underwritingApprovalDateFormatted}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{selectedTier.name} SLA ({schedule.slaSummary})</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4">
          <div className="text-[11px] text-slate-400">
            2. Capital Disbursement
          </div>
          <div className="font-display text-base font-bold text-emerald-400 mt-1 tabular-nums">
            {schedule.disbursementDateFormatted}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>
              {schedule.turnaroundBusinessDays} business days
              {schedule.daysSavedVsBaseline > 0
                ? ` · ${schedule.daysSavedVsBaseline}d faster`
                : ''}
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400">
            3. First Installment Due
          </div>
          <div className="font-display text-base font-bold text-white mt-1 tabular-nums">
            {schedule.firstPaymentDateFormatted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
            Est. ${schedule.monthlyPayment.toLocaleString()}/mo · {schedule.effectiveApr}% APR
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400">
            4. Final Loan Maturity Date
          </div>
          <div className="font-display text-base font-bold text-white mt-1 tabular-nums">
            {schedule.maturityDateFormatted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
            Total Interest: ${schedule.totalInterest.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Summary Strip + Schedule Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>
            Effective APR:{' '}
            <strong className="text-emerald-400 font-mono">
              {schedule.effectiveApr}%
            </strong>{' '}
            (-{schedule.aprDiscount}% tier discount)
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Total Repayment:{' '}
            <strong className="text-white font-mono tabular-nums">
              ${schedule.totalRepayment.toLocaleString()}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowScheduleTable((prev) => !prev)}
          className="min-h-[38px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {showScheduleTable ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Hide Payment Date Schedule</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>View Full {termMonths}-Month Date Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Monthly Installment Date Table */}
      {showScheduleTable && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Amortization Date Schedule — {selectedTier.name} ({termMonths} Installments)
              </span>
            </span>
            {schedule.installments.length > 12 && (
              <button
                type="button"
                onClick={() => setShowAllRows((prev) => !prev)}
                className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                {showAllRows
                  ? 'Show First 12 Months'
                  : `Show All ${schedule.installments.length} Months`}
              </button>
            )}
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 sticky top-0 text-[11px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">#</th>
                  <th className="py-2.5 px-4 font-medium">Due Date</th>
                  <th className="py-2.5 px-4 font-medium">Payment</th>
                  <th className="py-2.5 px-4 font-medium">Principal</th>
                  <th className="py-2.5 px-4 font-medium">Interest</th>
                  <th className="py-2.5 px-4 font-medium text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 tabular-nums">
                {visibleInstallments.map((row) => (
                  <tr key={row.installmentNumber} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-4 text-slate-400 font-mono">
                      {row.installmentNumber}
                    </td>
                    <td className="py-2.5 px-4 text-white font-medium">
                      {row.dueDateFormatted}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400 font-mono font-semibold">
                      ${row.paymentAmount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">
                      ${row.principalPaid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono">
                      ${row.interestPaid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-200 font-mono">
                      ${row.remainingBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
