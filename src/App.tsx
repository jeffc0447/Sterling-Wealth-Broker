/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrokerProvider, useBroker } from './context/BrokerContext';
import { Header } from './components/common/Header';
import { PublicHome } from './components/public/PublicHome';
import { ClientPortal } from './components/portal/ClientPortal';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLoginModal } from './components/common/AdminLoginModal';
import { PostPaymentConfirmationPage } from './components/flows/PostPaymentConfirmationPage';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginModal } from './components/auth/LoginModal';
import { RegistrationKYCWizard } from './components/auth/RegistrationKYCWizard';
import { EmailVerificationModal } from './components/auth/EmailVerificationModal';
import { FloatingRegisterFAB } from './components/common/FloatingRegisterFAB';

import { CheckoutModal } from './components/common/CheckoutModal';
import { TierTransitionModal } from './components/common/TierTransitionModal';

const AppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    showRegisterModal,
    setShowRegisterModal,
    showLoginModal,
    setShowLoginModal,
    triggerToast,
    clientLogin,
    pendingCheckoutPlanId,
    selectedCheckoutTier,
    setSelectedCheckoutTier,
    tiers,
  } = useBroker();

  // Active email OTP verification state
  const [activeVerification, setActiveVerification] = useState<{
    registrationId: string;
    email: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {currentView !== 'ADMIN' && <Header />}
      <div className="flex-1">
        {currentView === 'PUBLIC' && <PublicHome />}
        {currentView === 'PORTAL' && <ClientPortal />}
        {currentView === 'ADMIN' && <AdminPanel />}
        {currentView === 'CONFIRMATION_FLOW' && <PostPaymentConfirmationPage />}
      </div>

      {/* Floating Registration Action Button (FAB) */}
      <FloatingRegisterFAB />

      {/* Client & Admin Standard Login Modal / Auth Gate */}
      <LoginModal />

      {/* Tier Upgrade / Downgrade Transition Warning Modal */}
      <TierTransitionModal />

      {/* Legacy / Direct Admin Login Trigger */}
      <AdminLoginModal />

      {/* Multi-Rail Institutional Checkout Modal (Gateway 1: Card + AVS, Gateway 2: Crypto + QR, Gateway 3: Wire + Proof) */}
      {selectedCheckoutTier && (
        <CheckoutModal
          tier={selectedCheckoutTier}
          onClose={() => setSelectedCheckoutTier(null)}
        />
      )}

      {/* 5-Step Membership Registration & KYC Wizard */}
      {showRegisterModal && (
        <RegistrationKYCWizard
          onClose={() => setShowRegisterModal(false)}
          onRegistered={(registrationId, email) => {
            setShowRegisterModal(false);
            setActiveVerification({ registrationId, email });
          }}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* 6-Digit Email OTP Verification Modal */}
      {activeVerification && (
        <EmailVerificationModal
          registrationId={activeVerification.registrationId}
          email={activeVerification.email}
          onSuccess={() => {
            setActiveVerification(null);
            clientLogin();
          }}
          onClose={() => setActiveVerification(null)}
        />
      )}

      {/* Live System Alerts & Dynamic Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <BrokerProvider>
      <AppContent />
    </BrokerProvider>
  );
}
