import React from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  BarChart,
  Building,
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { applications, tiers, transactions } = useBroker();

  // Metrics calculation
  const totalLoanVolumeRequested = applications.reduce((sum, a) => sum + a.requestedAmount, 0);
  const pendingApps = applications.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW');
  const approvedApps = applications.filter((a) => a.status === 'APPROVED' || a.status === 'DISBURSED');
  const approvalRate = Math.round((approvedApps.length / Math.max(1, applications.length)) * 100);

  // MRR from transactions
  const totalCompletedRevenue = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* 4 Primary Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Active Members</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-white tracking-tight">
            1,842
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            +14% YoY Member Retention
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Membership MRR</span>
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-white tracking-tight">
            ${(142500 + totalCompletedRevenue).toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 font-medium mt-1">
            Predictable Retainer Income
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Pipeline Volume</span>
            <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-white tracking-tight">
            ${totalLoanVolumeRequested.toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-400 font-medium mt-1">
            Across {applications.length} Underwriting Files
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Syndicate Approval Rate</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-white tracking-tight">
            {approvalRate}%
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            Pre-qualified via Tier Screening
          </div>
        </div>

      </div>

      {/* Capital Volume by Tier & Syndicate Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tier Distribution Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-display font-semibold text-white text-sm mb-1">
            Brokered Capital by Membership Tier
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Borrowing capacity engagement across silver, gold, platinum, and diamond club tiers.
          </p>

          <div className="space-y-4">
            {tiers.map((tier) => {
              const tierApps = applications.filter((a) => a.tierAtSubmission === tier.id);
              const tierVolume = tierApps.reduce((sum, a) => sum + a.requestedAmount, 0);
              const pct = totalLoanVolumeRequested > 0 ? Math.round((tierVolume / totalLoanVolumeRequested) * 100) : 25;

              return (
                <div key={tier.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{tier.name}</span>
                    <span className="font-mono text-slate-300">
                      ${tierVolume.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ceiling: ${tier.maxLoanLimit.toLocaleString()}</span>
                    <span>{tierApps.length} Application(s)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Banking Syndicate Routing Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-1">
              Syndicated Banking Partner Performance
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time commitment metrics from primary capital distribution banks.
            </p>

            <div className="space-y-3">
              {[
                { bank: 'Barclays Corporate Banking', volume: '$124.5M', speed: '24h Avg', status: 'Preferred Syndicate' },
                { bank: 'JPMorgan Real Estate Capital', volume: '$98.0M', speed: '48h Avg', status: 'Active Lending Desk' },
                { bank: 'PNC Equipment Financing', volume: '$42.3M', speed: '18h Avg', status: 'Direct Integration' },
                { bank: 'UBS Private Wealth Credit', volume: '$180.0M', speed: 'Same Day', status: 'HNW Desk' },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                      <Building className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{p.bank}</div>
                      <div className="text-[10px] text-slate-400">{p.status}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">{p.volume}</div>
                    <div className="text-[10px] text-slate-400">{p.speed}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Automated API rate routing</span>
            <span className="text-emerald-400 font-medium">All 4 Desks Operational</span>
          </div>
        </div>

      </div>

    </div>
  );
};
