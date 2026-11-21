import React, { useState } from 'react';
import { HeroWithCalculator } from './HeroWithCalculator';
import { TrustAndCompliance } from './TrustAndCompliance';
import { HowItWorks } from './HowItWorks';
import { PricingMatrix } from './PricingMatrix';
import { FinancialInstrumentsDirectory } from './FinancialInstrumentsDirectory';
import { TestimonialsAndSecurity } from './TestimonialsAndSecurity';
import { PublicFooter } from './PublicFooter';
import { AboutUsPage } from './AboutUsPage';
import { CompanyOverviewPage } from './CompanyOverviewPage';
import { VisionMissionPage } from './VisionMissionPage';
import { CeoMessagePage } from './CeoMessagePage';
import { OurTeamPage } from './OurTeamPage';
import { TestimonialsPage } from './TestimonialsPage';
import { MembershipBenefitsPage } from './MembershipBenefitsPage';
import { FaqPage } from './FaqPage';
import { PersonalLoanPage } from './PersonalLoanPage';
import { BusinessLoanPage } from './BusinessLoanPage';
import { FinancialInstrumentPage } from './FinancialInstrumentPage';
import { ContactPage } from './ContactPage';
import { MembershipTiersPage } from './MembershipTiersPage';
import { CryptoPaymentModal } from '../common/CryptoPaymentModal';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTierId, MembershipTier } from '../../types';

export const PublicHome: React.FC = () => {
  const { tiers, publicPage, handleSelectPlanFromHomepage, setSelectedCheckoutTier } = useBroker();
  const [selectedTierForCrypto, setSelectedTierForCrypto] = useState<MembershipTier | null>(null);

  const handleSelectTier = (tierId: MembershipTierId, cycle?: 'quarterly' | 'annual') => {
    // Requirements: Detects member authentication, prompts Login/Register if not signed in, and auto-redirects straight to checkout upon auth
    handleSelectPlanFromHomepage(tierId, cycle);
  };

  const handleSelectCryptoTier = (tierId: MembershipTierId, cycle?: 'quarterly' | 'annual') => {
    handleSelectPlanFromHomepage(tierId, cycle);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <main className="flex-1">
        {publicPage === 'home' && (
          <>
            <HeroWithCalculator onSelectTier={handleSelectTier} />
            <TrustAndCompliance />
            <HowItWorks />
            <PricingMatrix
              onSelectTier={handleSelectTier}
              onSelectCryptoTier={handleSelectCryptoTier}
            />
            <FinancialInstrumentsDirectory />
            <TestimonialsAndSecurity />
          </>
        )}

        {/* Dedicated Direct Standalone Pages */}
        {publicPage === 'company-overview' && <CompanyOverviewPage />}
        {publicPage === 'vision-mission' && <VisionMissionPage />}
        {publicPage === 'ceo-message' && <CeoMessagePage />}
        {publicPage === 'our-team' && <OurTeamPage />}
        {publicPage === 'testimonials' && <TestimonialsPage />}
        {publicPage === 'membership-benefits' && <MembershipBenefitsPage />}
        {publicPage === 'faq' && <FaqPage />}

        {publicPage === 'about' && <AboutUsPage />}
        {publicPage === 'personal-loan' && <PersonalLoanPage />}
        {publicPage === 'business-loan' && <BusinessLoanPage />}
        {publicPage === 'financial-instrument' && <FinancialInstrumentPage />}
        {(publicPage === 'pricing' || publicPage === 'membership') && <MembershipTiersPage />}
        {publicPage === 'contact' && <ContactPage />}
      </main>

      <PublicFooter />

      {/* Direct Dedicated Cryptocurrency Payment Modal */}
      {selectedTierForCrypto && (
        <CryptoPaymentModal
          tier={selectedTierForCrypto}
          onClose={() => setSelectedTierForCrypto(null)}
        />
      )}
    </div>
  );
};
