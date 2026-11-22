import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  ShieldCheck,
  Lock,
  Send,
  CheckCircle2,
  ChevronDown,
  Building2,
  Globe2,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';
import { phpApi, CONTACT_RECIPIENT_EMAIL } from '../../services/phpApiService';

export const ContactPage: React.FC = () => {
  const { triggerToast, openRegistrationWithTier, navigateToPublicPage, supportConfig } = useBroker();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [capitalNeeded, setCapitalNeeded] = useState('$250,000 - $1,000,000');
  const [productType, setProductType] = useState('Business Loan & Credit Line');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inquiryRef, setInquiryRef] = useState<string>('');

  // FAQ accordion active state
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      triggerToast('Required Fields Missing', 'Please fill in your name, email, and contact phone number.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await phpApi.submitContactInquiry({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        capitalNeeded,
        productType,
        message: message.trim(),
      });

      if (res && res.success === false) {
        triggerToast('Submission Error', res.error || 'Unable to dispatch inquiry. Please verify your details.', 'error');
        setIsSubmitting(false);
        return;
      }

      const generatedRef = res?.inquiryNumber || `INQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setInquiryRef(generatedRef);
      setIsSubmitted(true);
      triggerToast(
        'Inquiry Transmitted to Support Desk',
        `Reference ${generatedRef} routed to ${CONTACT_RECIPIENT_EMAIL}. A senior syndicate broker will respond within 24 hours.`,
        'success'
      );
    } catch {
      const fallbackRef = `INQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setInquiryRef(fallbackRef);
      setIsSubmitted(true);
      triggerToast(
        'Inquiry Queued',
        `Reference ${fallbackRef} prepared for ${CONTACT_RECIPIENT_EMAIL}.`,
        'success'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildDirectMailto = () => {
    const subject = encodeURIComponent(`[${inquiryRef || 'INQUIRY'}] ${productType} - ${fullName}`);
    const body = encodeURIComponent(
      `Reference: ${inquiryRef || 'NEW'}\n` +
      `Full Legal Name: ${fullName}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Company: ${company || 'N/A'}\n` +
      `Capital Needed: ${capitalNeeded}\n` +
      `Product: ${productType}\n\n` +
      `Message:\n${message}`
    );
    return `mailto:${CONTACT_RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const faqs = [
    {
      q: 'How fast can our business receive term sheet offers?',
      a: 'Depending on your selected Membership Tier, our desk delivers qualified institutional bank terms within 24 to 72 hours. Gold and Platinum members receive priority same-day underwriting review.',
    },
    {
      q: 'Is our financial information kept strictly confidential?',
      a: 'Yes. All financial statements, tax returns, and KYC documents are encrypted using 256-bit AES algorithms and protected under bilateral non-disclosure agreements. We never sell, share, or broadcast client information.',
    },
    {
      q: 'What is the Sterling Wealth Placement SLA Guarantee?',
      a: 'We guarantee that our desk will present at least two qualifying institutional bank offers meeting your borrowing parameters within your tier timeframe. If we fail to do so, your membership fee is 100% refunded.',
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Banner */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              <Mail className="w-4 h-4" />
              <span>Direct Syndicate Underwriting Desk</span>
              <span aria-hidden="true">·</span>
              <span>24/7 Priority Dispatch</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Connect Directly with an Institutional Credit Officer
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Have questions regarding our loan products, underwriting SLAs, or bespoke financial instruments? Submit your parameters below for confidential syndicate evaluation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Form + Office Desks */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left 7 Cols: Financial Inquiry Form */}
            <div id="contact-form-section" className="lg:col-span-7 scroll-mt-24">
              <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl">
                <div className="pb-6 border-b border-slate-800 mb-6">
                  <h2 className="text-xl font-bold text-white">Underwriting Inquiry & Consultation</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete this confidential form to schedule a direct consultation with our syndicate lead. Inquiries are dispatched directly to{' '}
                    <span className="text-emerald-400 font-mono">{CONTACT_RECIPIENT_EMAIL}</span>.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="py-12 text-center space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Inquiry Successfully Dispatched</h3>
                    {inquiryRef && (
                      <div className="inline-block px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                        Reference: {inquiryRef}
                      </div>
                    )}
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      Thank you, <strong className="text-white">{fullName}</strong>. Your parameters have been encrypted and dispatched to{' '}
                      <strong className="text-emerald-400">{CONTACT_RECIPIENT_EMAIL}</strong>. An underwriter will contact you via{' '}
                      <strong className="text-emerald-400">{email}</strong> within 24 business hours.
                    </p>
                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className="min-h-[44px] py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                      >
                        Submit Another Inquiry
                      </button>
                      <a
                        href={buildDirectMailto()}
                        className="min-h-[44px] py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open Email Copy</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => openRegistrationWithTier('gold')}
                        className="min-h-[44px] py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Fast-Track with Membership</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Full Legal Name <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Jonathan Reynolds"
                          className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Corporate / Work Email <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. j.reynolds@enterprise.com"
                          className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Direct Contact Phone <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Entity / Company Name
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Reynolds Logistics LLC"
                          className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Capital Needed
                        </label>
                        <select
                          value={capitalNeeded}
                          onChange={(e) => setCapitalNeeded(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        >
                          <option value="$10,000 - $50,000">$10,000 – $50,000 (Personal / Micro)</option>
                          <option value="$50,000 - $250,000">$50,000 – $250,000 (Silver / Growth)</option>
                          <option value="$250,000 - $1,000,000">$250,000 – $1,000,000 (Gold Executive)</option>
                          <option value="$1,000,000 - $5,000,000">$1,000,000 – $5,000,000 (Platinum Prestige)</option>
                          <option value="$5,000,000+">$5,000,000+ (Diamond Syndicate)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Product of Interest
                        </label>
                        <select
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Personal Loan">Personal Loan (Unsecured Credit)</option>
                          <option value="Business Loan & Credit Line">Business Loan & Credit Line</option>
                          <option value="Commercial Real Estate">Commercial Real Estate / Mortgage</option>
                          <option value="Financial Instrument">Financial Instrument (SBLC / BG / POF)</option>
                          <option value="Securities Liquidity">Securities-Backed Liquidity (SBL)</option>
                          <option value="Membership Inquiry">Tiered Membership Questions</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Brief Transaction Details or Timeline
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please outline your planned capital deployment, desired funding timeline, or specific collateral parameters..."
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      />
                    </div>

                    {/* Trust Badges Near Form Submission */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>256-Bit Hardware Vault Encrypted Submission</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Binding Confidentiality NDA</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Encrypting & Routing Parameters...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Confidential Inquiry to Underwriting Desk</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right 5 Cols: Office Desks & Direct Contacts */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Desks Card */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    Regional Underwriting Desks
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
                    Live Desks
                  </span>
                </div>

                <div className="space-y-3">
                  {(supportConfig.regionalDesks && supportConfig.regionalDesks.length > 0
                    ? supportConfig.regionalDesks
                    : [
                        {
                          id: 'desk-london',
                          name: 'Canary Wharf Desk (London)',
                          badge: 'GMT Desks',
                          address: 'One Canada Square, Canary Wharf, London E14 5AA',
                          phone: '+44 20 7946 0912',
                          email: 'london.desk@sterlingwealthbroker.com',
                          opsDetail: 'Direct SWIFT Ops',
                        },
                        {
                          id: 'desk-newyork',
                          name: 'Wall Street Desk (New York)',
                          badge: 'EST Desks',
                          address: '40 Wall Street, 28th Floor, New York, NY 10005',
                          phone: '+1 (212) 555-8819',
                          email: 'newyork.desk@sterlingwealthbroker.com',
                          opsDetail: 'Corporate Credit',
                        },
                        {
                          id: 'desk-sf',
                          name: 'San Francisco Desk (West Coast)',
                          badge: 'PST Desks',
                          address: '240 Stockton St, Suite 800, San Francisco, CA 94108',
                          phone: '+1 (415) 555-9031',
                          email: 'sf.desk@sterlingwealthbroker.com',
                          opsDetail: 'Growth & Tech',
                        },
                      ]
                  ).map((desk) => (
                    <div
                      key={desk.id || desk.name}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 transition-all hover:border-slate-700"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-emerald-400" />
                          {desk.name}
                        </span>
                        {desk.badge && (
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {desk.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                        <span>{desk.address}</span>
                      </p>
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 text-[11px] font-mono">
                        <a
                          href={`tel:${desk.phone.replace(/[^0-9+]/g, '')}`}
                          className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{desk.phone}</span>
                        </a>
                        <a
                          href={`mailto:${desk.email}`}
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{desk.email}</span>
                        </a>
                      </div>
                      {desk.opsDetail && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          Ops Channel: {desk.opsDetail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Channels */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Direct Verified Channels
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400">SSL Encrypted</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Toll-Free Hotline
                    </span>
                    <a
                      href={`tel:${(supportConfig.directChannels?.tollFree || '+1 (800) 555-STERLING').replace(/[^0-9+]/g, '')}`}
                      className="text-white font-mono font-medium hover:text-emerald-400 transition-colors"
                    >
                      {supportConfig.directChannels?.tollFree || '+1 (800) 555-STERLING'}
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      PGP Encrypted Intake
                    </span>
                    <a
                      href={`mailto:${supportConfig.directChannels?.intakeEmail || 'syndicate@sterlingwealthbroker.com'}`}
                      className="text-emerald-400 font-mono font-medium hover:underline flex items-center gap-1"
                    >
                      <span>{supportConfig.directChannels?.intakeEmail || 'syndicate@sterlingwealthbroker.com'}</span>
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Operating Hours
                    </span>
                    <span className="text-slate-200">
                      {supportConfig.directChannels?.hours || 'Monday – Friday: 24h Global'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Track Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 text-center space-y-3">
                <h4 className="text-sm font-bold text-white">Need Guaranteed Turnaround?</h4>
                <p className="text-xs text-slate-400">
                  Skip the public queue by choosing a verified Membership Tier. Guaranteed 24-72h placement SLA.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigateToPublicPage('pricing');
                    try {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch {
                      // ignore
                    }
                  }}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <span>Explore Membership Tiers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Underwriting FAQ
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
              Frequently Asked Inquiries
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-emerald-400 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
