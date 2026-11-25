import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Lock,
  Building2,
  CreditCard,
  Layers,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

type FAQCategory = 'ALL' | 'BORROWING' | 'TIERS' | 'PAYMENTS' | 'SECURITY';

interface FAQItem {
  id: string;
  category: FAQCategory;
  categoryLabel: string;
  question: string;
  answer: string;
}

export const FaqPage: React.FC = () => {
  const { openRegistrationWithTier, navigateToPublicPage } = useBroker();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'BORROWING',
      categoryLabel: 'Borrowing & Loans',
      question: 'How does the Sterling Wealth Broker syndicate model differ from applying at a traditional commercial bank?',
      answer:
        'Traditional retail and commercial banks review loans through rigid single-institution credit algorithms. If their internal sector allocation for your industry is saturated, your loan is declined regardless of your financial strength. Sterling Wealth Broker operates as an institutional broker syndicate connecting your file directly to over 45 Tier-1 commercial banks, sovereign balance sheets, and private debt funds competing to fund your file. We pre-underwrite your application to eliminate rejection points and secure the lowest available market APRs.',
    },
    {
      id: 'faq-2',
      category: 'TIERS',
      categoryLabel: 'Membership & Tiers',
      question: 'What is the 100% Placement SLA Guarantee, and how does the refund protection work?',
      answer:
        'Every membership tier includes a binding service level agreement. If our syndicate desk fails to present you with at least two qualified institutional funding offers within your tier commitment window (24–72 hours), your membership fee is refunded 100% in full with no deductions or administrative fees.',
    },
    {
      id: 'faq-3',
      category: 'PAYMENTS',
      categoryLabel: 'Payments & Settlement',
      question: 'What payment gateways and settlement options are accepted for membership packages?',
      answer:
        'We support three institutional settlement methods: 1) Credit Card (Stripe / Authorize.net) with real-time Address Verification System (AVS); 2) Cryptocurrency (BTC, ETH, USDC, USDT, SOL) routed to cold-storage treasury wallets configured manually by our administration; and 3) Bank Wire Transfer (Fedwire / SWIFT) with payment receipt verification. For payment settlements, you are assigned a dedicated Customer Care Specialist (Jeffery Dean — jeffery@accountant.com and jeffery@sterlingwealthbroker.com) who coordinates verification and clearance.',
    },
    {
      id: 'faq-4',
      category: 'SECURITY',
      categoryLabel: 'Security & Compliance',
      question: 'Are my financial statements, tax filings, and KYC documents safe and confidential?',
      answer:
        'Yes. All client data and documentation are encrypted with 256-bit AES cryptographic protocols inside isolated institutional document vaults. We are registered with the U.S. Department of the Treasury FinCEN as a Money Services Business (MSB #31000218849) and adhere to strict GDPR, CCPA, and Bank Secrecy Act (BSA) compliance standards.',
    },
    {
      id: 'faq-5',
      category: 'TIERS',
      categoryLabel: 'Membership & Tiers',
      question: 'Can I upgrade my membership tier if my borrowing requirements increase?',
      answer:
        'Yes. Authenticated members can upgrade from their Client Portal at any time. When upgrading, your previous tier payment is credited towards the new tier ceiling, immediately expanding your borrowing limit, accelerating your underwriting SLA, and assigning an executive underwriter.',
    },
    {
      id: 'faq-6',
      category: 'BORROWING',
      categoryLabel: 'Borrowing & Loans',
      question: 'What loan products and financial instruments can I access through the brokerage?',
      answer:
        'Our catalog spans three core asset classes: 1) Personal Loans (Unsecured personal liquidity bridge up to $100k); 2) Business Loans (Revolving commercial lines, equipment & fleet financing, working capital lines up to $2.5M); and 3) Financial Instruments (Standby Letters of Credit MT760, Bank Guarantees, Corporate Debt Syndications, and Securities-Backed Credit Facilities up to $15M+).',
    },
    {
      id: 'faq-7',
      category: 'PAYMENTS',
      categoryLabel: 'Payments & Settlement',
      question: 'How does Bank Wire Transfer verification work, and who is my assigned care agent?',
      answer:
        'When you select a payment gateway at checkout, our system automatically routes your transaction details to your assigned Customer Care Specialist, Jeffery Dean (jeffery@accountant.com and jeffery@sterlingwealthbroker.com). You will receive updated escrow coordinates, and you can upload your payment confirmation slip or reference number directly at checkout or in your Client Portal for priority underwriting clearance.',
    },
    {
      id: 'faq-8',
      category: 'SECURITY',
      categoryLabel: 'Security & Compliance',
      question: 'How does the Encrypted Broker Chat session operate?',
      answer:
        'All client portal messages are end-to-end encrypted using client-side AES-256 keys. The chat is staffed by an automated robotic assistant that answers initial queries regarding covenant ratios, document checklists, and vault protocols. After 3–5 queries, the session seamlessly transfers to your assigned underwriter for bespoke advisory.',
    },
    {
      id: 'faq-10',
      category: 'TIERS',
      categoryLabel: 'Membership & Tiers',
      question: 'How fast will my loan application be processed and funded?',
      answer:
        'Turnaround depends on your selected tier. Silver tier reviews complete in 24–48 hours; Gold Executive members receive guaranteed 24-hour review; Platinum Prestige receives same-day term sheets; and Diamond Syndicate requests receive immediate desk assignment with preliminary terms in as fast as 4 hours.',
    },
  ];

  const categories = [
    { id: 'ALL', label: 'All Questions' },
    { id: 'BORROWING', label: 'Borrowing & Loans' },
    { id: 'TIERS', label: 'Membership Tiers' },
    { id: 'PAYMENTS', label: 'Payment & Wire/Crypto' },
    { id: 'SECURITY', label: 'Security & Privacy' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'ALL' || faq.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
            <span className="text-emerald-400 font-medium">FAQ</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              <HelpCircle className="w-4 h-4" />
              <span>Underwriting Intelligence & Support Desk</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Frequently Asked Questions (FAQ)
            </h1>

            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              Find instant, detailed answers regarding our syndicated debt placement model, turnaround SLAs, multi-rail settlement procedures, and membership tier benefits.
            </p>

            {/* Search Input */}
            <div className="mt-8 relative max-w-xl">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. Wire transfer, SLA refund, Crypto, Borrowing limit)..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500 shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs & FAQ List */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as FAQCategory)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                No questions found matching "<span className="text-white">{searchQuery}</span>". Try another search term or contact our underwriting desk directly.
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <div className="space-y-1.5 flex-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                          {faq.categoryLabel}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {faq.question}
                        </h3>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 mt-1 ${
                          isExpanded
                            ? 'rotate-180 bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 mt-1 animate-in fade-in duration-150">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Underwriter Hotline Callout */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Have a Specific Credit Syndication Question?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Our senior underwriting desk is on standby to assist with bespoke credit covenants, standby letters of credit, and corporate balance sheet assessments.
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
              onClick={() => navigateToPublicPage('contact')}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <span>Contact Syndicate Desk</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
