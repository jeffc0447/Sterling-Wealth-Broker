import React from 'react';
import {
  Shield,
  ShieldCheck,
  Award,
  Users,
  Building2,
  TrendingUp,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  Star,
  Globe2,
  Clock,
  Briefcase,
  Compass,
  HelpCircle,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const AboutUsPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();

  const leadershipTeam = [
    {
      name: 'Marcus Vance',
      role: 'Chief Credit Officer & Syndicate Lead',
      experience: '22+ Years in Institutional Credit',
      former: 'Former Managing Director, Structured Finance at Goldman Sachs',
      bio: 'Leads our underwriting syndicate desk, matching mid-market enterprises and private principals with non-dilutive credit facilities.',
      avatar: 'MV',
    },
    {
      name: 'Elena Rostova',
      role: 'Director of Capital Markets',
      experience: '18+ Years in Debt Capital Markets',
      former: 'Former Executive Director, Morgan Stanley Debt Syndications',
      bio: 'Oversees our private banking partnerships across North America, the UK, and Switzerland, specializing in commercial facilities and SBLCs.',
      avatar: 'ER',
    },
    {
      name: 'David K. Thorne, JD',
      role: 'Head of Regulatory Compliance & AML',
      experience: '16+ Years Financial Regulatory Counsel',
      former: 'Former Senior Enforcement Counsel, Regulatory Affairs',
      bio: 'Ensures strict adherence to FinCEN, Bank Secrecy Act (BSA), and international cross-border liquidity compliance protocols.',
      avatar: 'DT',
    },
    {
      name: 'Sarah Lin, CFA',
      role: 'Director of Private Wealth Instruments',
      experience: '14+ Years in Liquidity Engineering',
      former: 'Former Senior Portfolio Manager, J.P. Morgan Private Bank',
      bio: 'Structures high-net-worth liquidity facilities, standby letters of credit, and securities-backed credit lines.',
      avatar: 'SL',
    },
  ];

  const milestones = [
    { metric: '$1.4B+', label: 'Total Capital Placed', desc: 'Over 10 years of successful corporate and private placements' },
    { metric: '45+', label: 'Syndicate Banking Partners', desc: 'Direct routing to Tier-1 international and regional banks' },
    { metric: '99.4%', label: 'Placement SLA Guarantee', desc: 'Clients receive at least two qualifying institutional bank offers' },
    { metric: '24-72h', label: 'Underwriter Turnaround', desc: 'Guaranteed desk review and terms sheet formulation' },
  ];

  const values = [
    {
      icon: <Building2 className="w-5 h-5 text-emerald-400" />,
      title: 'Institutional Syndicate Power',
      description:
        'We do not rely on single-lender bottlenecks. Your borrowing request is syndicated across vetted institutional balance sheets competing for yield.',
    },
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      title: 'Zero-Compromise Security',
      description:
        'Every financial statement and KYC document is isolated inside 256-bit AES encrypted vaults, protected under binding non-disclosure agreements.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: '100% Placement SLA Guarantee',
      description:
        'If our underwriting desk fails to present qualifying terms within your tier commitment window, membership fees are fully and promptly refunded.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      title: 'Syndicate APR Discounts',
      description:
        'Members access proprietary wholesale pricing—enjoying up to 2.25% APR reductions compared to standard commercial bank retail desks.',
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* 1. Company Overview Hero Section */}
      <section id="company-overview" className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden border-b border-slate-900 scroll-mt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Unboxed Metadata Kicker */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              <span>About Sterling Wealth Broker</span>
              <span aria-hidden="true">·</span>
              <span>Institutional Loan Placement</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Direct Institutional Syndicate Access, Built on Uncompromising Integrity
            </h1>

            <p className="mt-6 text-slate-400 text-base sm:text-lg leading-relaxed">
              Founded by former Wall Street credit desk officers, Sterling Wealth Broker bridges qualified enterprises, entrepreneurs, and private principals directly to Tier-1 syndicated balance sheets—bypassing retail delays and traditional banking friction.
            </p>

            {/* Quick CTA Pair */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => openRegistrationWithTier(null)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply for Membership Tier</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateToPublicPage('contact')}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Speak with an Underwriter</span>
              </button>
            </div>
          </div>

          {/* Key Milestones Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center"
              >
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {m.metric}
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-1 uppercase tracking-wider">
                  {m.label}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Dedicated Direct Standalone Feature Pages Portal */}
          <div className="mt-14 pt-12 border-t border-slate-800/80">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Direct Feature Directories
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                Access Standalone Information Pages
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Navigate directly to isolated pages containing only the specific information you need.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                {
                  id: 'company-overview',
                  title: '1. Company Overview',
                  desc: 'Scale, $1.4B+ track record, and Wall Street credit syndication history.',
                  icon: Building2,
                  page: 'company-overview' as const,
                },
                {
                  id: 'vision-mission',
                  title: '2. Our Vision & Mission',
                  desc: 'Core institutional principles, underwriting mandate & 4 execution pillars.',
                  icon: Compass,
                  page: 'vision-mission' as const,
                },
                {
                  id: 'ceo-message',
                  title: '3. CEO’s Message',
                  desc: 'Executive address and signed perspective from founder Julian Sterling.',
                  icon: Award,
                  page: 'ceo-message' as const,
                },
                {
                  id: 'our-team',
                  title: '4. Our Team',
                  desc: 'Executive Underwriting Committee, credit officers, and senior managing directors.',
                  icon: Users,
                  page: 'our-team' as const,
                },
                {
                  id: 'testimonials',
                  title: '5. Testimonials',
                  desc: 'Trustpilot 4.9/5 reviews, case studies, and verified borrower proofs.',
                  icon: Star,
                  page: 'testimonials' as const,
                },
                {
                  id: 'membership-tiers-benefits',
                  title: '6. Membership Tiers Benefits',
                  desc: 'Detailed comparison matrix of borrowing limits, SLAs, and wholesale APRs.',
                  icon: ShieldCheck,
                  page: 'membership-benefits' as const,
                },
                {
                  id: 'faq',
                  title: '7. FAQ',
                  desc: 'Frequently asked underwriting, wire transfer, and crypto settlement questions.',
                  icon: HelpCircle,
                  page: 'faq' as const,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateToPublicPage(item.page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium">
                      <span>View Dedicated Page</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Accreditations Matrix */}
      <section className="py-10 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Regulatory Compliance & Industry Credentials
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800/70 text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-1.5" />
              <span className="text-xs font-bold text-white">FinCEN MSB</span>
              <span className="text-[10px] text-slate-400">Reg #31000218849</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800/70 text-center">
              <Lock className="w-6 h-6 text-emerald-400 mb-1.5" />
              <span className="text-xs font-bold text-white">256-Bit SSL/TLS</span>
              <span className="text-[10px] text-slate-400">AES Hardware Vault</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800/70 text-center">
              <Building2 className="w-6 h-6 text-emerald-400 mb-1.5" />
              <span className="text-xs font-bold text-white">FDIC Syndicate</span>
              <span className="text-[10px] text-slate-400">Partner Bank Escrow</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800/70 text-center">
              <Star className="w-6 h-6 text-amber-400 mb-1.5 fill-amber-400" />
              <span className="text-xs font-bold text-white">Trustpilot 4.9/5</span>
              <span className="text-[10px] text-slate-400">Verified Client Reviews</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800/70 text-center col-span-2 sm:col-span-1">
              <Award className="w-6 h-6 text-emerald-400 mb-1.5" />
              <span className="text-xs font-bold text-white">BBB Accredited</span>
              <span className="text-[10px] text-slate-400">A+ Financial Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Our Vision & Mission */}
      <section id="our-vision-mission" className="py-16 lg:py-24 border-b border-slate-900 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Our Vision & Mission
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Reinventing Commercial Borrowing for High-Velocity Principals
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Traditional retail banking operates at a sluggish pace, imposing weeks of document re-requests and unpredictable underwriter declines. Sterling Wealth was established to operate differently: as an authorized institutional broker syndicate.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Through our Tiered Membership architecture, our clients secure dedicated broker desk representation and direct placement lines. We pre-underwrite every package against institutional criteria before routing it to partner capital committees, delivering guaranteed turnaround SLAs and wholesale lending rates.
              </p>

              <div className="pt-2 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">Direct Desk Representation:</span>
                    <span className="text-xs text-slate-400 ml-1.5">A senior underwriter is assigned to every qualified application, managing institutional back-and-forth directly.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">Multi-Rail Settlement:</span>
                    <span className="text-xs text-slate-400 ml-1.5">Support for domestic wires, SWIFT international routing, SEPA transfers, and digital asset settlements (USDC/USDT/BTC).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">Guaranteed Refund Protection:</span>
                    <span className="text-xs text-slate-400 ml-1.5">Complete refund protection if two qualifying offers are not tendered within SLA bounds.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Values 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((v, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{v.title}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CEO’s Message */}
      <section id="ceos-message" className="py-16 lg:py-24 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-slate-900 border border-emerald-400/40 flex items-center justify-center text-slate-950 font-display font-bold text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
                JS
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
                  CEO’s Executive Perspective
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  A Message from Julian Sterling, Founder & Managing Director
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Institutional Credit Architecture · Private Syndication Desk
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-5 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                "When we founded Sterling Wealth Broker in 2016, commercial borrowing was deeply fractured. High-performing enterprises and private wealth principals were continually slowed down by retail-oriented depository committees unable to grasp complex collateral structures, multi-jurisdiction filings, or time-sensitive closing windows.
              </p>
              <p>
                Our philosophy has always been simple: <strong className="text-white">credit should be negotiated directly at the institutional balance sheet level</strong>, with complete alignment between the borrower and the underwriter. By curating a syndicate of over 45 Tier-1 institutional lenders and family balance sheets, we replace bureaucratic inertia with binding turnaround SLAs, competitive wholesale pricing, and multi-rail settlements.
              </p>
              <p>
                Whether you are accessing an unsecured $100,000 personal liquidity bridge, syndicating a $2.5M commercial credit line, or issuing a $15M+ Standby Letter of Credit, our commitment remains unshakeable: transparent terms, ironclad confidentiality, and dedicated execution."
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-display font-bold text-white text-base">Julian Sterling</div>
                <div className="text-xs text-emerald-400">Founder & Chief Executive Officer</div>
                <div className="text-[11px] text-slate-500 font-mono">Sterling Wealth Brokerage Group LLC</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Placement SLA:</span>
                <span className="text-xs font-semibold text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  100% Backed Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Team (Leadership & Advisory Committee) */}
      <section id="our-team" className="py-16 lg:py-24 border-b border-slate-900 bg-slate-900/30 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Our Team & Executive Committee
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2">
              Seasoned Institutional Leadership
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Our underwriting syndicate is steered by seasoned credit professionals formerly managing sovereign, corporate, and private bank desks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadershipTeam.map((leader, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-slate-900 border border-emerald-500/40 text-emerald-400 font-bold text-base flex items-center justify-center mb-4">
                    {leader.avatar}
                  </div>
                  <h3 className="text-base font-bold text-white">{leader.name}</h3>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">{leader.role}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">{leader.former}</p>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    {leader.bio}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-900 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{leader.experience}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials & Verified Borrower Reviews */}
      <section id="testimonials" className="py-16 lg:py-24 border-b border-slate-900 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-2">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-xs font-bold text-white ml-1">4.9 / 5.0 Trustpilot Rating</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Institutional Borrower Testimonials
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Hear from commercial principals, real estate sponsors, and private wealth executives who secured liquidity through our syndicate desks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  "$1.85M Commercial Facility Funded in 48 Hours"
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  "Our logistics firm faced an urgent warehouse acquisition deadline after a regional bank stalled for 6 weeks. Julian and the Sterling team syndicated our portfolio across two private debt funds and wired closing funds within 48 hours of Gold tier review."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs">
                <div className="font-semibold text-white">Harrison Reed</div>
                <div className="text-[11px] text-slate-500">Managing Principal · TransPacific Freight Corp</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Tier: Gold Executive Access</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  "Standby Letter of Credit (SBLC) Delivered Flawlessly"
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  "Structuring a $12M international performance guarantee was frictionless. The assigned senior underwriter coordinated directly with Barclays and issued SWIFT MT760 coordinates ahead of schedule. Unrivaled institutional sophistication."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs">
                <div className="font-semibold text-white">Camilla Dupont</div>
                <div className="text-[11px] text-slate-500">Chief Investment Officer · Alpine Trade Finance Ltd</div>
                <div className="text-[10px] text-amber-400 font-mono mt-0.5">Tier: Diamond Syndicate Retainer</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  "Transparent Fees & Dedicated Broker Representation"
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  "The Silver membership gave me direct access to an executive underwriter for my medical practice expansion. No surprise broker points, clear document requests, and approval within 24 hours at a 5.25% fixed APR."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs">
                <div className="font-semibold text-white">Dr. Aris Thorne</div>
                <div className="text-[11px] text-slate-500">Founder & Medical Director · BioHealth Surgical</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Tier: Silver Personal Loan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Membership Tiers Benefits */}
      <section id="membership-tiers-benefits" className="py-16 lg:py-24 border-b border-slate-900 bg-slate-900/20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Privileges & Access Structure
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2">
              Membership Tiers Benefits
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Each membership tier provides calibrated underwriting capacity, dedicated desk representation, and guaranteed placement SLAs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Silver */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Category: Personal Loan
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1">Silver Access</h3>
                <div className="text-2xl font-bold font-display text-white mt-2">$450</div>
                <div className="text-xs text-emerald-400 font-mono mt-1">Ceiling: Up to $100,000</div>
                <ul className="mt-4 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>24–48h Underwriting Turnaround</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Unsecured personal credit lines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Dedicated loan officer support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => openRegistrationWithTier('silver')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Select Silver
              </button>
            </div>

            {/* Gold */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/50 shadow-lg shadow-emerald-500/10 flex flex-col justify-between space-y-4 relative">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                Popular
              </span>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                  Category: Business Loan
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1">Gold Executive</h3>
                <div className="text-2xl font-bold font-display text-white mt-2">$1,450</div>
                <div className="text-xs text-emerald-400 font-mono mt-1">Ceiling: Up to $500,000</div>
                <ul className="mt-4 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Guaranteed 24-Hour Review SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Revolving commercial credit line</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct Senior Underwriter desk</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => openRegistrationWithTier('gold')}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Select Gold
              </button>
            </div>

            {/* Platinum */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">
                  Category: Business Loan
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1">Platinum Prestige</h3>
                <div className="text-2xl font-bold font-display text-white mt-2">$3,850</div>
                <div className="text-xs text-emerald-400 font-mono mt-1">Ceiling: Up to $2,500,000</div>
                <ul className="mt-4 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Same-Day Executive Term Sheet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Wholesale bank APR discount (-1.75%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Encrypted Direct Broker Chat</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => openRegistrationWithTier('platinum')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Select Platinum
              </button>
            </div>

            {/* Diamond */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                  Financial Instruments
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1">Diamond Syndicate</h3>
                <div className="text-2xl font-bold font-display text-white mt-2">$8,900</div>
                <div className="text-xs text-amber-400 font-mono mt-1">Ceiling: $15,000,000+</div>
                <ul className="mt-4 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Standby Letters of Credit (SBLC) & BG</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Managing Director desk direct dial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Securities-backed non-purpose credit</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => openRegistrationWithTier('diamond')}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition cursor-pointer"
              >
                Select Diamond
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-16 lg:py-24 border-b border-slate-900 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Underwriting Intelligence
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Key insights into our underwriting protocols, tier membership model, and multi-rail settlement procedures.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the Sterling Wealth Broker syndicate model differ from applying at a retail bank?',
                a: 'Traditional banks review loans through rigid single-institution credit algorithms. Sterling Wealth operates as an institutional broker syndicate connecting you directly to over 45 Tier-1 commercial banks, sovereign funds, and private credit desks competing to fund your file. We pre-underwrite your application to guarantee speed and lowest market APRs.',
              },
              {
                q: 'What is the 100% Placement SLA Guarantee?',
                a: 'Every membership tier includes a binding service level agreement. If our syndicate desk fails to present you with at least two qualified institutional funding offers within your tier commitment window (24–72 hours), your membership fee is refunded 100% in full with no deductions.',
              },
              {
                q: 'How are membership fees paid, and what payment gateways are accepted?',
                a: 'We support three institutional settlement methods: Credit Card via Stripe, Bank Wire Transfer (Fedwire / SWIFT RTGS) with manual verification, and Cryptocurrency (BTC, ETH, USDC, USDT, SOL) routed to audited cold-storage multi-sig escrow wallets manually configured and verified by our treasury administration.',
              },
              {
                q: 'Are my financial statements, tax filings, and KYC documents safe?',
                a: 'Yes. All client data and documentation are encrypted with 256-bit AES cryptographic protocols inside isolated institutional document vaults. We are registered with FinCEN as a Money Services Business (MSB #31000218849) and adhere to strict GDPR and CCPA standards.',
              },
              {
                q: 'Can I upgrade my membership tier if my borrowing requirements increase?',
                a: 'Absolutely. Authenticated members can upgrade from their Client Portal at any time. When upgrading, your previous tier payment is credited towards the new tier ceiling, immediately expanding your borrowing limit and assigning an executive underwriter.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5"
              >
                <h4 className="text-sm font-bold text-white flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    Q
                  </span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence & Desks */}
      <section className="py-16 lg:py-20 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <Globe2 className="w-4 h-4" />
                London Syndicate Desk
              </div>
              <p className="text-sm font-semibold text-white">One Canada Square, Canary Wharf</p>
              <p className="text-xs text-slate-400 mt-1">London E14 5AA, United Kingdom</p>
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                <div>Hours: 08:00 – 18:00 GMT</div>
                <div>Focus: SBLC, International Guarantees, Cross-Border Liquidity</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <Globe2 className="w-4 h-4" />
                New York Capital Desk
              </div>
              <p className="text-sm font-semibold text-white">40 Wall Street, 28th Floor</p>
              <p className="text-xs text-slate-400 mt-1">New York, NY 10005, United States</p>
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                <div>Hours: 08:30 – 18:30 EST</div>
                <div>Focus: Commercial Real Estate, Corporate Debt, Working Capital</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <Globe2 className="w-4 h-4" />
                San Francisco Tech & Growth Desk
              </div>
              <p className="text-sm font-semibold text-white">240 Stockton Street, Suite 800</p>
              <p className="text-xs text-slate-400 mt-1">San Francisco, CA 94108, United States</p>
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                <div>Hours: 08:00 – 17:30 PST</div>
                <div>Focus: Venture Debt, Equipment Financing, Founder Credit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-emerald-500/30 shadow-2xl space-y-6">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Ready to Accelerate Your Liquidity?
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white max-w-2xl mx-auto">
              Secure Direct Access to Tier-1 Syndicated Borrowing
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Select your membership tier to receive dedicated desk representation, an expedited turnaround SLA, and non-dilutive capital matching.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => openRegistrationWithTier(null)}
                className="w-full sm:w-auto py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply for Membership Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateToPublicPage('contact')}
                className="w-full sm:w-auto py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
              >
                <span>Inquire with Syndicate Desk</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                100% Placement SLA Guarantee
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                256-Bit Vault Protection
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
