import React, { useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';
import { PortalHeader } from './PortalHeader';
import { PortalOverview } from './PortalOverview';
import { LoanApplicationWizard } from './LoanApplicationWizard';
import { DocumentVault } from './DocumentVault';
import { PaymentHistory } from './PaymentHistory';
import { EncryptedChat } from './EncryptedChat';

export const ClientPortal: React.FC = () => {
  const {
    portalTab,
    isClientAuthenticated,
    currentUser,
    setCurrentView,
    setShowLoginModal,
  } = useBroker();

  const hasValidSession = Boolean(isClientAuthenticated && currentUser?.email);

  useEffect(() => {
    if (!hasValidSession) {
      setCurrentView('PUBLIC');
      setShowLoginModal(true);
    }
  }, [hasValidSession, setCurrentView, setShowLoginModal]);

  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Membership Sign-In Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your session is inactive or your membership profile has been removed. Please sign in with an active membership account or create a new account to access the client dashboard.
          </p>
          <button
            type="button"
            onClick={() => {
              setCurrentView('PUBLIC');
              setShowLoginModal(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition cursor-pointer"
          >
            Return & Sign In
          </button>
        </div>
      </div>
    );
  }

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
