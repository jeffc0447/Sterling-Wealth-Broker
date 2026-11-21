import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const TierTransitionModal: React.FC = () => {
  const { pendingTierTransition, setPendingTierTransition, confirmTierTransition } = useBroker();

  if (!pendingTierTransition) return null;

  const { currentTier, targetTier, type } = pendingTierTransition;

  const isUpgrade = type === 'UPGRADE';
  const isDowngrade = type === 'DOWNGRADE';
  const isSame = type === 'SAME';

  // Calculate pricing difference
  const priceDifference = targetTier.price - currentTier.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tier-transition-title"
      >
        {/* Accent Bar */}
        <div
          className={`h-1.5 ${
            isUpgrade
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500'
              : isDowngrade
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
              : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500'
          }`}
        />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                isUpgrade
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : isDowngrade
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
              }`}
            >
              {isUpgrade && <TrendingUp className="w-5 h-5" />}
              {isDowngrade && <TrendingDown className="w-5 h-5" />}
              {isSame && <RefreshCw className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="tier-transition-title" className="text-lg font-bold text-white tracking-tight">
                {isUpgrade && 'Confirm Tier Upgrade'}
                {isDowngrade && 'Review Plan Downgrade'}
                {isSame && 'Renew Current Membership Plan'}
              </h2>
              <p className="text-xs text-slate-400">
                {isUpgrade && 'Unlock increased borrowing limits and expedited underwriting'}
                {isDowngrade && 'Carefully review limit reductions before switching packages'}
                {isSame && 'Extend your active institutional subscription period'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPendingTierTransition(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Cancel tier change"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Downgrade Warning Notice */}
          {isDowngrade && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold text-amber-300 block mb-1">
                  Important: Borrowing Power & SLA Notice
                </span>
                Switching to <span className="font-bold text-white">{targetTier.name}</span> will reduce your
                maximum loan facility from{' '}
                <span className="font-bold text-white">
                  ${(currentTier.maxLoanLimit / 1000).toLocaleString()}k
                </span>{' '}
                to{' '}
                <span className="font-bold text-white">
                  ${(targetTier.maxLoanLimit / 1000).toLocaleString()}k
                </span>
                . Any ongoing loan applications above this threshold may require syndication re-adjustment.
              </div>
            </div>
          )}

          {/* Upgrade Incentive Notice */}
          {isUpgrade && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-200/90 leading-relaxed">
                <span className="font-semibold text-emerald-300 block mb-1">
                  Instant Tier Privilege Expansion
                </span>
                Upgrading to <span className="font-bold text-white">{targetTier.name}</span> increases your
                credit envelope to{' '}
                <span className="font-bold text-white">
                  ${(targetTier.maxLoanLimit / 1000).toLocaleString()}k
                </span>{' '}
                with guaranteed priority desk review in{' '}
                <span className="font-bold text-white">{targetTier.processingSLA}</span>.
              </div>
            </div>
          )}

          {/* Side-by-Side Tier Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Active Plan */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Current Plan
                </span>
                <h3 className="text-base font-bold text-white">{currentTier.name}</h3>
                <div className="text-sm font-semibold text-slate-300 mt-1">
                  ${currentTier.price.toLocaleString()}{' '}
                  <span className="text-xs text-slate-500 font-normal">/{currentTier.period}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Borrowing Limit:</span>
                  <span className="font-medium text-slate-200">
                    ${(currentTier.maxLoanLimit / 1000).toLocaleString()}k
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SLA Turnaround:</span>
                  <span className="font-medium text-slate-200">{currentTier.processingSLA}</span>
                </div>
              </div>
            </div>

            {/* Target Selected Plan */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isUpgrade
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : isDowngrade
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-blue-950/20 border-blue-500/40'
              }`}
            >
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                    isUpgrade ? 'text-emerald-400' : isDowngrade ? 'text-amber-400' : 'text-blue-400'
                  }`}
                >
                  {isUpgrade ? 'Upgraded Plan' : isDowngrade ? 'Selected Downgrade' : 'Plan Renewal'}
                </span>
                <h3 className="text-base font-bold text-white">{targetTier.name}</h3>
                <div className="text-sm font-semibold text-white mt-1">
                  ${targetTier.price.toLocaleString()}{' '}
                  <span className="text-xs text-slate-400 font-normal">/{targetTier.period}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>New Limit:</span>
                  <span
                    className={`font-semibold ${
                      isUpgrade ? 'text-emerald-400' : isDowngrade ? 'text-amber-400' : 'text-blue-400'
                    }`}
                  >
                    ${(targetTier.maxLoanLimit / 1000).toLocaleString()}k
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SLA Turnaround:</span>
                  <span className="font-semibold text-white">{targetTier.processingSLA}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Adjustment / Proration Calculation */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">
              {isUpgrade ? 'Subscription Difference Due Today:' : isDowngrade ? 'New Billing Cycle Rate:' : 'Renewal Amount:'}
            </span>
            <span className="text-sm font-bold text-white">
              ${isUpgrade ? Math.max(0, priceDifference).toLocaleString() : targetTier.price.toLocaleString()}{' '}
              <span className="text-xs text-slate-500 font-normal">USD</span>
            </span>
          </div>

          {/* Security & Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={confirmTierTransition}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                isUpgrade
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : isDowngrade
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isUpgrade && 'Confirm Upgrade & Proceed to Payment'}
                {isDowngrade && 'Confirm Downgrade & Continue'}
                {isSame && 'Proceed to Early Renewal'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPendingTierTransition(null)}
              className="w-full py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Keep Current Plan Unchanged
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Zero-penalty institutional proration policy
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Instant Activation
          </span>
        </div>
      </div>
    </div>
  );
};
