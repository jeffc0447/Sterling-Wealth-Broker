import React from 'react';
import { useBroker } from '../../context/BrokerContext';
import { PortalHeader } from './PortalHeader';
import { PortalOverview } from './PortalOverview';
import { LoanApplicationWizard } from './LoanApplicationWizard';
import { DocumentVault } from './DocumentVault';
import { PaymentHistory } from './PaymentHistory';
import { EncryptedChat } from './EncryptedChat';

export const ClientPortal: React.FC = () => {
  const { portalTab } = useBroker();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PortalHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {portalTab === 'OVERVIEW' && <PortalOverview />}
        {portalTab === 'APPLY' && <LoanApplicationWizard />}
        {portalTab === 'DOCUMENTS' && <DocumentVault />}
        {portalTab === 'PAYMENTS' && <PaymentHistory />}
        {portalTab === 'MESSAGES' && <EncryptedChat />}
      </main>
    </div>
  );
};
