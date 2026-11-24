import React from 'react';
import {
  Users,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Building2,
  Mail,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const OurTeamPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

  const team = [
    {
      name: 'Marcus Vance',
      role: 'Chief Credit Officer & Syndicate Lead',
      experience: '22+ Years in Institutional Credit',
      former: 'Former Managing Director, Structured Finance at Goldman Sachs',
      bio: 'Leads our underwriting syndicate desk, matching mid-market enterprises and private principals with non-dilutive credit facilities and structured notes.',
      education: 'Wharton School of Business (MBA), Columbia University (BS Economics)',
      certifications: 'FINRA Series 7, 24, 79',
      avatar: 'MV',
      desk: 'New York Desk',
    },
    {
      name: 'Elena Rostova',
      role: 'Director of Capital Markets',
      experience: '18+ Years in Debt Capital Markets',
      former: 'Former Executive Director, Morgan Stanley Debt Syndications',
      bio: 'Oversees our private banking partnerships across North America, the UK, and Switzerland, specializing in commercial revolving lines and SBLCs.',
      education: 'London School of Economics (MSc Finance), Oxford University (BA)',
      certifications: 'CFA Charterholder, FCA Approved Person',
      avatar: 'ER',
      desk: 'London Desk',
    },
    {
      name: 'David K. Thorne, JD',
      role: 'Head of Regulatory Compliance & AML',
      experience: '16+ Years Financial Regulatory Counsel',
      former: 'Former Senior Enforcement Counsel, Financial Regulatory Affairs',
      bio: 'Ensures strict adherence to FinCEN, Bank Secrecy Act (BSA), and international cross-border liquidity compliance protocols across our multi-rail transactions.',
      education: 'Georgetown University Law Center (JD), NYU (BA Political Science)',
      certifications: 'New York Bar Association, CAMS Certified',
      avatar: 'DT',
      desk: 'New York Desk',
    },
    {
      name: 'Sarah Lin, CFA',
      role: 'Director of Private Wealth Instruments',
      experience: '14+ Years in Liquidity Engineering',
      former: 'Former Senior Portfolio Manager, J.P. Morgan Private Bank',
      bio: 'Structures high-net-worth liquidity facilities, standby letters of credit, and securities-backed credit lines with customized loan-to-value parameters.',
      education: 'UC Berkeley Haas School of Business (MBA), Stanford University (BS)',
      certifications: 'CFA Charterholder, Series 63, 65',
      avatar: 'SL',
      desk: 'San Francisco Desk',
    },
    {
      name: 'Jonathan Hayes',
      role: 'Managing Director, Commercial Real Estate Syndication',
      experience: '19+ Years in Institutional Property Debt',
      former: 'Former Managing Director, Wells Fargo Commercial Real Estate Capital',
      bio: 'Directs acquisition financing, mezzanine debt, and construction bridge facilities for institutional property developers and REITs across North America.',
      education: 'Harvard Business School (MBA), Cornell University (BS Urban Planning)',
      certifications: 'FINRA Series 7, 63',
      avatar: 'JH',
      desk: 'New York Desk',
    },
    {
      name: 'Vivienne Dubois',
      role: 'Head of Cross-Border Trade & Financial Instruments',
      experience: '15+ Years in Global Trade Settlement',
      former: 'Former Senior Vice President, BNP Paribas Global Trade Desk',
      bio: 'Directs SWIFT MT760 issuance, Bank Guarantees (BG), and performance bond instruments routed through primary European and Swiss depository institutions.',
      education: 'HEC Paris (MSc International Finance), Sorbonne University',
      certifications: 'CDCS (Certified Documentary Credit Specialist)',
      avatar: 'VD',
      desk: 'London Desk',
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
            <span className="text-emerald-400 font-medium">Our Team</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              <Users className="w-4 h-4" />
              <span>Credit Committee & Senior Underwriters</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Our Executive Leadership & Underwriting Committee
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              Our underwriting syndicate is steered by seasoned credit professionals formerly managing sovereign, corporate, and private bank desks at Wall Street and European financial institutions.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => openRegistrationWithTier(null)}
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Apply for Membership</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateToPublicPage('contact')}
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition cursor-pointer"
              >
                <span>Schedule Underwriter Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Underwriting Committee Grid */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Desk Officers & Managing Directors
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              The Underwriters Guiding Your Application
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              When you subscribe to a membership tier, your transaction is assigned directly to a desk officer with specific sector expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-5 hover:border-slate-700 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-slate-900 border border-emerald-500/40 text-emerald-400 font-bold text-lg flex items-center justify-center shadow-md">
                      {member.avatar}
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                      {member.desk}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-xs font-semibold text-emerald-400 mt-0.5">{member.role}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">{member.former}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {member.bio}
                  </p>

                  <div className="pt-3 border-t border-slate-900 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-start gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{member.education}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>{member.certifications}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.experience}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-[11px]">Direct Syndicate Desk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Committee Standards */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Credit Committee Governance
            </span>
            <h2 className="font-display text-2xl font-bold text-white">
              Underwriting Independence & Borrower Fiduciary
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Unlike retail branch loan officers incentivized to push specific proprietary bank products, our underwriters are pure institutional syndicators. Our mandate is to maximize your borrowing power, negotiate the lowest achievable APR, and secure contractual placement terms.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white text-xs block mb-1">Pre-Clearing Verification</span>
                <p className="text-[11px] text-slate-400">
                  We pre-clear files against actual underwriter balance sheet matrices before formal submission.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white text-xs block mb-1">Direct Committee Dialogue</span>
                <p className="text-[11px] text-slate-400">
                  You receive real-time intelligence directly from our senior desk officers, not customer support reps.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white text-xs block mb-1">Guaranteed SLA Turnaround</span>
                <p className="text-[11px] text-slate-400">
                  Every committee review adheres to strict turnaround times backed by full fee refund guarantees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Work with Our Underwriting Committee
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Choose your membership package to get assigned a dedicated senior underwriter for your commercial or private credit facility.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openRegistrationWithTier(null)}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply for Membership</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToPublicPage('pricing')}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <span>View Membership Tiers</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
