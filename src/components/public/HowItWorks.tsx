import React from 'react';
import { Layers, ShieldCheck, Banknote, ArrowRight } from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';

export const HowItWorks: React.FC = () => {
  const {
    setCurrentView,
    setPortalTab,
    navigateToPublicPage,
    isClientAuthenticated,
    openRegistrationWithStep,
    triggerToast,
    homepageCMS,
  } = useBroker();

  const cmsHow = homepageCMS?.howItWorks;

  const defaultStepIcons = [
    <Layers key="1" className="w-5 h-5 text-emerald-400" />,
    <ShieldCheck key="2" className="w-5 h-5 text-emerald-400" />,
    <Banknote key="3" className="w-5 h-5 text-emerald-400" />,
  ];

  const steps = [
    {
      number: cmsHow?.steps?.[0]?.number || '01',
      title: cmsHow?.steps?.[0]?.title || 'Select Membership Package',
      description:
        cmsHow?.steps?.[0]?.description ||
        'Choose a subscription tier aligned with your target borrowing limit ($10k to $15M+) and desired turnaround speed. Tiers unlock dedicated underwriters and partner rate discounts.',
      icon: defaultStepIcons[0],
      tag: cmsHow?.steps?.[0]?.tag || 'Step 1 · Capacity Match',
      destinationHint: 'Directs to Membership Tiers package page',
    },
    {
      number: cmsHow?.steps?.[1]?.number || '02',
      title: cmsHow?.steps?.[1]?.title || 'Verify Identity & Upload Financials',
      description:
        cmsHow?.steps?.[1]?.description ||
        'Submit required KYC documents to our zero-knowledge AES-256 encrypted vault. Our in-house compliance officers review files within hours without external bureau footprints.',
      icon: defaultStepIcons[1],
      tag: cmsHow?.steps?.[1]?.tag || 'Step 2 · 256-Bit Vault',
      destinationHint: 'Directs to KYC upload form section',
    },
    {
      number: cmsHow?.steps?.[2]?.number || '03',
      title: cmsHow?.steps?.[2]?.title || 'Access Capital & Disburse Funds',
      description:
        cmsHow?.steps?.[2]?.description ||
        'Your assigned senior broker structures terms and presents your file directly to matched Tier-1 syndicated banking partners. Review competitive term sheets and disburse capital.',
      icon: defaultStepIcons[2],
      tag: cmsHow?.steps?.[2]?.tag || 'Step 3 · Rapid Disbursement',
      destinationHint: 'Directs to Contact form section',
    },
  ];

  const handleStepDetails = (idx: number) => {
    if (idx === 0) {
      // Step 1: Direct user to the Membership tiers package page
      navigateToPublicPage('pricing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      triggerToast(
        'Membership Tiers Packages',
        'Directing to the complete tiered membership packages and privilege matrix.',
        'info'
      );
    } else if (idx === 1) {
      // Step 2: Direct user to KYC upload form section
      if (isClientAuthenticated) {
        // Authenticated client goes to encrypted Document Vault KYC & Financials
        setCurrentView('PORTAL');
        setPortalTab('DOCUMENTS');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        triggerToast(
          'Client Document Vault',
          'Access your encrypted vault to upload KYC identity documents and financial statements.',
          'info'
        );
      } else {
        // Unauthenticated client opens the 5-step registration wizard directly on Step 5 (KYC Upload Component)
        openRegistrationWithStep(5);
        triggerToast(
          'KYC Upload Form Section',
          'Attach your government-issued ID (Passport, Driver’s License, or National ID) for review.',
          'info'
        );
      }
    } else if (idx === 2) {
      // Step 3: Direct user to the Contact form section to send message to customer representative
      navigateToPublicPage('contact');
      setTimeout(() => {
        const contactSection = document.getElementById('contact-form-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }
      }, 120);
      triggerToast(
        'Contact Customer Representative',
        'Directing to the underwriting inquiry form to send a message to our customer representative.',
        'info'
      );
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            {cmsHow?.tag || 'Frictionless Private Brokerage'}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2">
            {cmsHow?.headline || 'How Sterling Wealth Broker Works'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            {cmsHow?.description || 'A transparent 3-step pathway connecting your financial ambitions with institutional lending power.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:p-7 relative flex flex-col justify-between hover:border-slate-700 transition-all hover:-translate-y-1 group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-display text-2xl font-bold text-slate-700 group-hover:text-emerald-500/60 transition-colors">
                    {step.number}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-emerald-400 mb-1">
                  {step.tag}
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="hidden sm:inline">Enterprise SLA</span>
                <span className="sm:hidden">Guaranteed</span>

                {/* (Details) Action Trigger Button */}
                <button
                  type="button"
                  onClick={() => handleStepDetails(idx)}
                  className="min-h-[44px] px-3 py-1.5 text-emerald-400 hover:text-emerald-300 font-semibold group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-emerald-500/15 border border-transparent hover:border-emerald-500/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  aria-label={`View details for ${step.tag}: ${step.title}`}
                  title={step.destinationHint}
                >
                  <span className="underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 font-medium">
                    (Details)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => {
              if (isClientAuthenticated) {
                setCurrentView('PORTAL');
                setPortalTab('APPLY');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                openRegistrationWithStep(1);
                triggerToast(
                  'Membership Application',
                  'Register your membership profile to launch syndicated underwriting and funding.',
                  'info'
                );
              }
            }}
            className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>Launch Loan Application Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
