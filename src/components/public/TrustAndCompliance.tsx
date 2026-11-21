import React from 'react';
import { ShieldCheck, Lock, Award, Building, CheckCircle, Scale } from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const TrustAndCompliance: React.FC = () => {
  const { homepageCMS } = useBroker();
  const cmsMetrics = homepageCMS?.metrics;
  const cmsTrust = homepageCMS?.trustCompliance;

  const defaultStats = [
    { label: 'Total Brokered Capital', value: '$482,000,000+', change: '+18% YoY' },
    { label: 'Active Corporate & HNW Members', value: '1,840+', change: 'Global Network' },
    { label: 'Syndicate Approval Rate', value: '98.4%', change: 'Tier-1 Partners' },
    { label: 'Average Underwriting Turnaround', value: '18.4 Hours', change: 'Priority SLA' },
  ];

  const stats = cmsMetrics && cmsMetrics.length > 0 ? cmsMetrics : defaultStats;

  const badgeIcons = [
    <Lock key="lock" className="w-4 h-4 text-emerald-400" />,
    <ShieldCheck key="shield" className="w-4 h-4 text-emerald-400" />,
    <Scale key="scale" className="w-4 h-4 text-emerald-400" />,
    <Building key="bldg" className="w-4 h-4 text-emerald-400" />,
  ];

  const defaultBadges = [
    { title: 'AES-256 Bit Document Vault', subtitle: 'Zero-knowledge client encryption protocol' },
    { title: 'SOC 2 Type II & ISO 27001', subtitle: 'Independently audited data infrastructure' },
    { title: 'Regulatory Brokerage Compliance', subtitle: 'Adheres to FINRA / SEC & FCA AML Guidelines' },
    { title: '30+ Tier-1 Syndicate Banks', subtitle: 'JPMorgan, Barclays, Goldman Sachs, UBS' },
  ];

  const trustBadges = (cmsTrust?.badges && cmsTrust.badges.length > 0 ? cmsTrust.badges : defaultBadges).map(
    (b, idx) => ({
      ...b,
      icon: badgeIcons[idx % badgeIcons.length],
    })
  );

  return (
    <section className="py-12 bg-slate-900/60 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Live Brokerage Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800/80">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {s.value}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>{s.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Security & Regulatory Trust Badges */}
        <div className="pt-10">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {cmsTrust?.tag || 'Institutional Security Standards'}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
              {cmsTrust?.headline || 'Protected by Enterprise Grade Compliance & Privacy'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex items-start gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{badge.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
