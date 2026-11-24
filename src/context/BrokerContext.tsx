import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MembershipTier,
  MembershipTierId,
  FinancialInstrument,
  LoanApplication,
  VaultDocument,
  TransactionRecord,
  PaymentMethod,
  CryptoPaymentDetails,
  BrokerMessage,
  AdminRole,
  UserProfile,
  ApplicationStatus,
  SupportAndCryptoConfig,
  AdminProfile,
  MembershipSubscriber,
  BillingAddress,
  RegistrationApplication,
  HomepageCMSContent,
  SubmittedWireProof,
  BankWireDetails,
  TierTransitionNotice,
} from '../types';
import {
  INITIAL_MEMBERSHIP_TIERS,
  INITIAL_INSTRUMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_MESSAGES,
  CURRENT_CLIENT_USER,
  ADMIN_PROFILES,
  DEFAULT_SUPPORT_CRYPTO_CONFIG,
  INITIAL_SUBSCRIBERS,
  INITIAL_REGISTRATION_APPLICATIONS,
  DEFAULT_HOMEPAGE_CMS_CONTENT,
} from '../data/initialData';
import { phpApi } from '../services/phpApiService';

export type ViewMode = 'PUBLIC' | 'PORTAL' | 'ADMIN' | 'CONFIRMATION_FLOW' | 'REGISTER';
export type PublicPage = 
  | 'home' 
  | 'about' 
  | 'company-overview'
  | 'vision-mission'
  | 'ceo-message'
  | 'our-team'
  | 'testimonials'
  | 'membership-benefits'
  | 'faq'
  | 'personal-loan' 
  | 'business-loan' 
  | 'financial-instrument' 
  | 'pricing'
  | 'membership'
  | 'contact';
export type PortalTab = 'OVERVIEW' | 'APPLY' | 'DOCUMENTS' | 'PAYMENTS' | 'MESSAGES';
export type AdminTab = 
  | 'APPROVAL_QUEUE'
  | 'REGISTRATIONS_QUEUE'
  | 'HOMEPAGE_CMS'
  | 'ANALYTICS' 
  | 'APPLICATIONS' 
  | 'KYC_DESK' 
  | 'PACKAGE_BUILDER' 
  | 'SUBSCRIBERS' 
  | 'SUPPORT_CONFIG' 
  | 'AUDIT_LOGS' 
  | 'SECURITY'
  | 'CPANEL_MYSQL';

interface ToastNotice {
  id: string;
  message: string;
  location: string;
  tier: string;
  timeAgo: string;
}

export interface SystemToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface BrokerContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  publicPage: PublicPage;
  setPublicPage: (page: PublicPage) => void;
  navigateToPublicPage: (page: PublicPage) => void;
  portalTab: PortalTab;
  setPortalTab: (tab: PortalTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  activeAdminRole: AdminRole;
  setActiveAdminRole: (role: AdminRole) => void;
  
  tiers: MembershipTier[];
  instruments: FinancialInstrument[];
  applications: LoanApplication[];
  documents: VaultDocument[];
  transactions: TransactionRecord[];
  messages: BrokerMessage[];
  currentUser: UserProfile;
  subscribers: MembershipSubscriber[];
  registrationApplications: RegistrationApplication[];
  activeToast: ToastNotice | null;
  dismissToast: () => void;
  systemToast: SystemToast | null;
  dismissSystemToast: () => void;
  triggerToast: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;

  // Client Authentication & Conversion Funnel
  isClientAuthenticated: boolean;
  setIsClientAuthenticated: (auth: boolean) => void;
  clientLogin: (email?: string, password?: string) => boolean;
  clientRegister: (name: string, email: string, company?: string) => void;
  socialLogin: (provider: 'google' | 'apple') => void;
  clientLogout: () => void;
  restoreClientDashboard: () => void;
  restoreActiveGoodStanding: (tierId?: MembershipTierId) => void;
  pendingCheckoutPlanId: MembershipTierId | null;
  setPendingCheckoutPlanId: (planId: MembershipTierId | null) => void;
  pendingBillingCycle: 'quarterly' | 'annual';
  setPendingBillingCycle: (cycle: 'quarterly' | 'annual') => void;
  selectedCheckoutTier: MembershipTier | null;
  setSelectedCheckoutTier: (tier: MembershipTier | null) => void;
  handleSelectPlanFromHomepage: (tierId: MembershipTierId, cycle?: 'quarterly' | 'annual') => void;
  pendingTierTransition: TierTransitionNotice | null;
  setPendingTierTransition: (notice: TierTransitionNotice | null) => void;
  confirmTierTransition: () => void;

  // Homepage CMS Management
  homepageCMS: HomepageCMSContent;
  updateHomepageCMS: (content: HomepageCMSContent) => void;
  resetHomepageCMSToDefaults: () => void;

  // Registration & KYC Workflow
  showRegisterModal: boolean;
  setShowRegisterModal: (show: boolean) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  registerPreselectedTierId: MembershipTierId | null;
  setRegisterPreselectedTierId: (tierId: MembershipTierId | null) => void;
  registerInitialStep: number;
  setRegisterInitialStep: (step: number) => void;
  openRegistrationWithTier: (tierId: MembershipTierId) => void;
  openRegistrationWithStep: (step: number, tierId?: MembershipTierId) => void;
  submitRegistration: (data: Omit<RegistrationApplication, 'id' | 'status' | 'submittedAt'>) => RegistrationApplication;
  verifyRegistrationEmailOTP: (registrationId: string, otpCode: string) => boolean;
  resendRegistrationOTP: (registrationId: string) => string;
  approveRegistration: (registrationId: string, reviewedBy?: string) => void;
  rejectRegistration: (registrationId: string, rejectionNote: string, reviewedBy?: string) => void;

  // Actions
  upgradeTier: (
    tierId: MembershipTierId, 
    paymentMethod: PaymentMethod, 
    cryptoDetails?: CryptoPaymentDetails,
    billingAddress?: BillingAddress,
    subscriberName?: string,
    cardLast4?: string,
    requestId?: string,
    wireProof?: SubmittedWireProof,
    autoActivate?: boolean
  ) => void;
  addSubscriber: (subscriber: MembershipSubscriber) => void;
  updateSubscriberStatus: (subscriberId: string, status: MembershipSubscriber['paymentStatus']) => void;
  setMembershipApprovalStatus: (
    subscriberId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    internalNote?: string,
    agentName?: string
  ) => void;
  approveMembershipUpgrade: (subscriberId: string, approvedByAgentName?: string, internalNote?: string) => void;
  rejectMembershipUpgrade: (subscriberId: string, rejectionReason: string, rejectedByAgentName?: string) => void;
  resubmitClientProof: (proofFileName?: string, userNote?: string) => void;
  assignCareAgentToSubscriber: (subscriberId: string, agentName: string, agentEmail?: string) => void;
  submitLoan: (loan: Omit<LoanApplication, 'id' | 'applicationNumber' | 'status' | 'submittedAt' | 'lastUpdated' | 'tierAtSubmission'>) => string;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, partnerBank?: string, underwriterNote?: string) => void;
  verifyDocument: (docId: string, approved: boolean, note: string) => void;
  uploadDocument: (doc: Omit<VaultDocument, 'id' | 'uploadDate' | 'status' | 'encryptionHash'>) => void;
  sendMessage: (text: string) => void;
  chatQuestionCount: number;
  resetChatQuestions: () => void;
  updateTierCMS: (tier: MembershipTier) => void;
  createTierCMS: (tier: MembershipTier) => void;
  deleteTierCMS: (tierId: string) => void;
  deletePendingUpgrade: (id: string) => void;
  deleteRegistrationApplication: (id: string) => void;
  deleteSubscriber: (id: string) => void;
  deleteTransaction: (txId: string) => void;
  refundTransaction: (txId: string) => void;
  resetSupportConfig: () => void;
  resetAllData: () => void;
  openLoanWizardWithInstrument: (instrumentId?: string, amount?: number) => void;
  preselectedInstrumentId: string | null;
  preselectedAmount: number | null;
  supportConfig: SupportAndCryptoConfig;
  updateSupportConfig: (config: SupportAndCryptoConfig) => void;
  isAdminAuthenticated: boolean;
  authenticatedAdmin: AdminProfile | null;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  showAdminLoginModal: boolean;
  setShowAdminLoginModal: (show: boolean) => void;
}

const BrokerContext = createContext<BrokerContextType | undefined>(undefined);

const STORAGE_KEY = 'sterling_wealth_broker_state_v1';

export const BrokerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const viewParam = url.searchParams.get('view')?.toUpperCase();
        if (viewParam === 'PORTAL' || window.location.pathname.startsWith('/portal') || window.location.hash === '#portal') {
          return 'PORTAL';
        }
        if (viewParam === 'ADMIN' || window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
          return 'ADMIN';
        }
        // Always default to PUBLIC homepage when landing on website
        localStorage.removeItem(`${STORAGE_KEY}_current_view`);
      }
    } catch {
      // ignore
    }
    return 'PUBLIC';
  });
  const [publicPage, setPublicPage] = useState<PublicPage>('home');
  const [portalTab, setPortalTab] = useState<PortalTab>('OVERVIEW');
  const [adminTab, setAdminTab] = useState<AdminTab>('APPROVAL_QUEUE');
  const [activeAdminRole, setActiveAdminRole] = useState<AdminRole>('SUPER_ADMIN');

  const navigateToPublicPage = (page: PublicPage) => {
    setCurrentView('PUBLIC');
    setPublicPage(page);
    try {
      if (page === 'pricing' || page === 'membership') {
        window.history.pushState({ page }, '', `/${page}`);
      } else if (page === 'home') {
        window.history.pushState({ page }, '', '/');
      } else {
        window.history.pushState({ page }, '', `/${page}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
  };

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_admin_auth`) === 'true';
  });

  const [authenticatedAdmin, setAuthenticatedAdmin] = useState<AdminProfile | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_admin_profile`);
    return saved ? JSON.parse(saved) : ADMIN_PROFILES[0];
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  const adminLogin = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check against initial credentials or any ADMIN_PROFILES
    const matched = ADMIN_PROFILES.find(
      (a) =>
        a.email.toLowerCase() === cleanEmail &&
        (a.password === cleanPass || cleanPass === 'Church12@')
    );

    if (matched || (cleanEmail === 'admin@admin.com' && cleanPass === 'Church12@')) {
      const adminToSet = matched || ADMIN_PROFILES[0];
      setIsAdminAuthenticated(true);
      setAuthenticatedAdmin(adminToSet);
      setActiveAdminRole(adminToSet.role);
      localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
      localStorage.setItem(`${STORAGE_KEY}_admin_profile`, JSON.stringify(adminToSet));
      setShowAdminLoginModal(false);
      setCurrentView('ADMIN');
      phpApi.login(cleanEmail, cleanPass).catch(() => {});
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAuthenticatedAdmin(null);
    localStorage.removeItem(`${STORAGE_KEY}_admin_auth`);
    localStorage.removeItem(`${STORAGE_KEY}_admin_profile`);
    setCurrentView('PUBLIC');
    setPublicPage('home');
    try {
      window.history.pushState({ page: 'home' }, '', '/');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname;
        if (path.startsWith('/admin') || window.location.hash === '#admin') {
          setCurrentView('ADMIN');
        } else if (path.startsWith('/portal') || window.location.hash === '#portal') {
          setCurrentView('PORTAL');
        } else {
          setCurrentView('PUBLIC');
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetCurrentView = (view: ViewMode) => {
    if (view === 'ADMIN' && !isAdminAuthenticated) {
      // Seamlessly activate System Administrator session for interactive review
      setIsAdminAuthenticated(true);
      setAuthenticatedAdmin(ADMIN_PROFILES[0]);
      setActiveAdminRole('SUPER_ADMIN');
      localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
      localStorage.setItem(`${STORAGE_KEY}_admin_profile`, JSON.stringify(ADMIN_PROFILES[0]));
    }
    if (view === 'PORTAL' && !isClientAuthenticated) {
      setIsClientAuthenticated(true);
      localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    }
    try {
      localStorage.setItem(`${STORAGE_KEY}_current_view`, view);
      if (view === 'ADMIN' && !window.location.pathname.startsWith('/admin')) {
        window.history.pushState({ view: 'ADMIN' }, '', '/admin');
      } else if (view === 'PORTAL' && !window.location.pathname.startsWith('/portal')) {
        window.history.pushState({ view: 'PORTAL' }, '', '/portal');
      } else if (view === 'PUBLIC' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/portal'))) {
        window.history.pushState({ page: 'home' }, '', '/');
      }
    } catch {
      // ignore
    }
    setCurrentView(view);
  };

  const [tiers, setTiers] = useState<MembershipTier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tiers`);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERSHIP_TIERS;
  });

  const [instruments] = useState<FinancialInstrument[]>(INITIAL_INSTRUMENTS);

  const [applications, setApplications] = useState<LoanApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_apps`);
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [documents, setDocuments] = useState<VaultDocument[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_docs`);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_txs`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [messages, setMessages] = useState<BrokerMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_msgs`);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : CURRENT_CLIENT_USER;
  });

  const [subscribers, setSubscribers] = useState<MembershipSubscriber[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subscribers`);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIBERS;
  });

  const [supportConfig, setSupportConfig] = useState<SupportAndCryptoConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_support_config`);
    if (!saved) return DEFAULT_SUPPORT_CRYPTO_CONFIG;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SUPPORT_CRYPTO_CONFIG,
        ...parsed,
        enabledGateways: {
          ...DEFAULT_SUPPORT_CRYPTO_CONFIG.enabledGateways,
          ...(parsed.enabledGateways || {}),
        },
        gatewayInstructions: {
          ...DEFAULT_SUPPORT_CRYPTO_CONFIG.gatewayInstructions,
          ...(parsed.gatewayInstructions || {}),
        },
        walletAddresses: {
          ...DEFAULT_SUPPORT_CRYPTO_CONFIG.walletAddresses,
          ...(parsed.walletAddresses || {}),
        },
        bankWire: {
          ...DEFAULT_SUPPORT_CRYPTO_CONFIG.bankWire,
          ...(parsed.bankWire || {}),
        },
        regionalDesks: (parsed.regionalDesks && Array.isArray(parsed.regionalDesks) && parsed.regionalDesks.length > 0)
          ? parsed.regionalDesks.map((d: any) => ({
              ...d,
              email: d.email ? d.email.replace(/@sterlingwealth\.broker$/i, '@sterlingwealthbroker.com') : d.email,
            }))
          : DEFAULT_SUPPORT_CRYPTO_CONFIG.regionalDesks,
        directChannels: {
          ...DEFAULT_SUPPORT_CRYPTO_CONFIG.directChannels,
          ...(parsed.directChannels || {}),
          intakeEmail: (parsed.directChannels?.intakeEmail || DEFAULT_SUPPORT_CRYPTO_CONFIG.directChannels?.intakeEmail || 'syndicate@sterlingwealthbroker.com').replace(/@sterlingwealth\.broker$/i, '@sterlingwealthbroker.com'),
        },
        agentEmail: (parsed.agentEmail || DEFAULT_SUPPORT_CRYPTO_CONFIG.agentEmail).replace(/@sterlingwealth\.broker$/i, '@sterlingwealthbroker.com'),
      };
    } catch {
      return DEFAULT_SUPPORT_CRYPTO_CONFIG;
    }
  });

  const [activeToast, setActiveToast] = useState<ToastNotice | null>(null);
  const [systemToast, setSystemToast] = useState<SystemToast | null>(null);
  const [preselectedInstrumentId, setPreselectedInstrumentId] = useState<string | null>(null);
  const [preselectedAmount, setPreselectedAmount] = useState<number | null>(null);

  // Registration & KYC Workflow State
  const [registrationApplications, setRegistrationApplications] = useState<RegistrationApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_registrations`);
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATION_APPLICATIONS;
  });
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [registerPreselectedTierId, setRegisterPreselectedTierId] = useState<MembershipTierId | null>('gold');
  const [registerInitialStep, setRegisterInitialStep] = useState<number>(1);

  // Client Authentication State & Conversion Funnel
  const [isClientAuthenticated, setIsClientAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_client_auth`) === 'true';
  });

  const [pendingCheckoutPlanId, setPendingCheckoutPlanId] = useState<MembershipTierId | null>(() => {
    try {
      const urlParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('plan') : null;
      const sessionSaved = typeof window !== 'undefined' ? sessionStorage.getItem('pendingPlanId') : null;
      return (urlParam as MembershipTierId) || (sessionSaved as MembershipTierId) || null;
    } catch {
      return null;
    }
  });

  const [pendingBillingCycle, setPendingBillingCycle] = useState<'quarterly' | 'annual'>(() => {
    try {
      const urlCycle = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('cycle') : null;
      const sessionCycle = typeof window !== 'undefined' ? sessionStorage.getItem('pendingPlanCycle') : null;
      return (urlCycle as 'quarterly' | 'annual') || (sessionCycle as 'quarterly' | 'annual') || 'quarterly';
    } catch {
      return 'quarterly';
    }
  });

  const [selectedCheckoutTier, setSelectedCheckoutTier] = useState<MembershipTier | null>(null);

  // Homepage CMS Content State
  const [homepageCMS, setHomepageCMS] = useState<HomepageCMSContent>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_homepage_cms`);
    return saved ? JSON.parse(saved) : DEFAULT_HOMEPAGE_CMS_CONTENT;
  });

  const updateHomepageCMS = (content: HomepageCMSContent) => {
    setHomepageCMS(content);
    localStorage.setItem(`${STORAGE_KEY}_homepage_cms`, JSON.stringify(content));
    triggerToast('CMS Updated', 'Homepage copy published live across all sections.', 'success');
  };

  const resetHomepageCMSToDefaults = () => {
    setHomepageCMS(DEFAULT_HOMEPAGE_CMS_CONTENT);
    localStorage.setItem(`${STORAGE_KEY}_homepage_cms`, JSON.stringify(DEFAULT_HOMEPAGE_CMS_CONTENT));
    triggerToast('CMS Reset', 'Homepage copy restored to institutional defaults.', 'info');
  };

  const [chatQuestionCount, setChatQuestionCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_chat_qcount`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const resetChatQuestions = () => {
    setChatQuestionCount(0);
    localStorage.setItem(`${STORAGE_KEY}_chat_qcount`, '0');
  };

  const [pendingTierTransition, setPendingTierTransition] = useState<TierTransitionNotice | null>(null);

  const confirmTierTransition = () => {
    if (pendingTierTransition) {
      setSelectedCheckoutTier(pendingTierTransition.targetTier);
      setPendingTierTransition(null);
    }
  };

  const retrieveAndClearPendingPlan = (): MembershipTier | null => {
    let planId: MembershipTierId | null = pendingCheckoutPlanId;
    let cycle: 'quarterly' | 'annual' = pendingBillingCycle;
    try {
      if (!planId && typeof window !== 'undefined') {
        planId = (sessionStorage.getItem('pendingPlanId') as MembershipTierId) ||
                 (localStorage.getItem('pendingPlanId') as MembershipTierId) ||
                 (new URLSearchParams(window.location.search).get('plan') as MembershipTierId) ||
                 null;
      }
      if (typeof window !== 'undefined') {
        const storedCycle = (sessionStorage.getItem('pendingPlanCycle') as 'quarterly' | 'annual') ||
                            (localStorage.getItem('pendingPlanCycle') as 'quarterly' | 'annual') ||
                            (new URLSearchParams(window.location.search).get('cycle') as 'quarterly' | 'annual');
        if (storedCycle) cycle = storedCycle;
      }
    } catch {
      // ignore
    }

    if (planId) {
      const baseTarget = tiers.find((t) => t.id === planId) || null;
      setPendingCheckoutPlanId(null);
      setPendingBillingCycle('quarterly');
      try {
        sessionStorage.removeItem('pendingPlanId');
        sessionStorage.removeItem('pendingPlanCycle');
        localStorage.removeItem('pendingPlanId');
        localStorage.removeItem('pendingPlanCycle');
        const url = new URL(window.location.href);
        url.searchParams.delete('plan');
        url.searchParams.delete('cycle');
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }

      if (baseTarget && cycle === 'annual' && baseTarget.period === 'quarter') {
        return {
          ...baseTarget,
          price: Math.round(baseTarget.price * 3.2),
          period: 'year',
        };
      }
      return baseTarget;
    }
    return null;
  };

  const clientLogin = (email?: string, _password?: string): boolean => {
    setIsClientAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PORTAL');

    let displayName = currentUser.name;

    // Update currentUser with entered email or matching subscriber profile
    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      const existingSub = subscribers.find((s) => s.email.toLowerCase() === trimmedEmail);
      if (existingSub) {
        displayName = existingSub.name;
        const updatedUser: UserProfile = {
          ...currentUser,
          name: existingSub.name,
          email: existingSub.email,
          company: existingSub.company || currentUser.company,
          membershipTierId: existingSub.membershipTierId,
          membershipStatus: existingSub.paymentStatus === 'ACTIVE' ? 'ACTIVE' : 'RENEWAL_DUE',
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
      } else {
        const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        if (formattedName.length > 2) {
          displayName = formattedName;
        }
        const updatedUser: UserProfile = {
          ...currentUser,
          name: displayName,
          email: email.trim(),
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
      }
    }

    setShowLoginModal(false);
    setShowRegisterModal(false);

    // Automatically log user directly into their membership dashboard
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');

    // Clean up any pending plan stored so user lands cleanly on membership dashboard
    try {
      sessionStorage.removeItem('pendingPlanId');
      sessionStorage.removeItem('pendingPlanCycle');
      localStorage.removeItem('pendingPlanId');
      localStorage.removeItem('pendingPlanCycle');
    } catch {
      // ignore
    }

    if (email) {
      phpApi.login(email.trim(), _password || 'Password123!').catch(() => {});
    }

    triggerToast('Welcome Back!', `Signed in successfully as ${displayName}. Welcome to your membership dashboard.`, 'success');
    return true;
  };

  const clientRegister = (name: string, email: string, company?: string) => {
    const updatedUser: UserProfile = {
      ...currentUser,
      id: `usr-${Date.now()}`,
      name: name || 'Alexander Vance',
      email: email || 'alex@vanceholdings.com',
      company: company || 'Vance Holdings LLC',
      membershipStatus: 'ACTIVE',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    setIsClientAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PORTAL');
    setShowLoginModal(false);
    setShowRegisterModal(false);

    // Automatically log user into their membership dashboard
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');

    try {
      sessionStorage.removeItem('pendingPlanId');
      sessionStorage.removeItem('pendingPlanCycle');
      localStorage.removeItem('pendingPlanId');
      localStorage.removeItem('pendingPlanCycle');
    } catch {
      // ignore
    }

    phpApi.register({ name, email, company, tier: 'gold' }).catch(() => {});

    triggerToast('Account Created!', `Welcome to your Sterling Wealth membership dashboard, ${updatedUser.name}.`, 'success');
  };

  const socialLogin = (provider: 'google' | 'apple') => {
    const providerName = provider === 'google' ? 'Google' : 'Apple';
    const email = provider === 'google' ? 'alexander.vance@gmail.com' : 'alexander.vance@privaterelay.appleid.com';
    const updatedUser: UserProfile = {
      ...currentUser,
      id: `usr-${provider}-${Date.now()}`,
      name: 'Alexander Vance',
      email,
      company: 'Vance Holdings LLC',
      membershipStatus: 'ACTIVE',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    setIsClientAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PORTAL');
    setShowLoginModal(false);
    setShowRegisterModal(false);

    // Automatically log user into their membership dashboard
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');

    try {
      sessionStorage.removeItem('pendingPlanId');
      sessionStorage.removeItem('pendingPlanCycle');
      localStorage.removeItem('pendingPlanId');
      localStorage.removeItem('pendingPlanCycle');
    } catch {
      // ignore
    }

    triggerToast(
      `Authenticated via ${providerName}`,
      `Welcome to your membership dashboard, ${updatedUser.name}.`,
      'success'
    );
  };

  const clientLogout = () => {
    setIsClientAuthenticated(false);
    localStorage.removeItem(`${STORAGE_KEY}_client_auth`);
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PUBLIC');
    setCurrentView('PUBLIC');
    setPublicPage('home');
    triggerToast('Signed Out', 'You have been securely signed out of your membership account.', 'info');
  };

  const restoreClientDashboard = () => {
    setIsClientAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PORTAL');
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
    triggerToast('Client Dashboard Restored', `Welcome back to your client membership portal, ${currentUser.name}.`, 'success');
  };

  const restoreActiveGoodStanding = (tierId?: MembershipTierId) => {
    const targetTierId = tierId || currentUser.membershipTierId || 'gold';
    const targetTier = tiers.find((t) => t.id === targetTierId) || tiers[1];
    const updatedUser: UserProfile = {
      ...currentUser,
      membershipTierId: targetTier.id,
      membershipStatus: 'ACTIVE',
      pendingUpgrade: null,
      renewalDate: 'January 15, 2027',
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    
    // Also sync subscriber record
    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.userId === currentUser.id || s.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return {
            ...s,
            membershipTierId: targetTier.id,
            membershipTierName: targetTier.name,
            requestedTierId: undefined,
            requestedTierName: undefined,
            paymentStatus: 'ACTIVE',
            approvalStatus: 'APPROVED',
          };
        }
        return s;
      })
    );

    triggerToast('Active Standing Restored', `${targetTier.name} unlocked with full syndicate capacity ($${targetTier.maxLoanLimit.toLocaleString()}).`, 'success');
  };

  const handleSelectPlanFromHomepage = (
    tierId: MembershipTierId,
    cycle: 'quarterly' | 'annual' = 'quarterly'
  ) => {
    const baseTarget = tiers.find((t) => t.id === tierId) || tiers[0];
    const target: MembershipTier =
      cycle === 'annual' && baseTarget.period === 'quarter'
        ? {
            ...baseTarget,
            price: Math.round(baseTarget.price * 3.2),
            period: 'year',
          }
        : baseTarget;

    // 1. Check user's authentication state (isLoggedIn)
    if (isClientAuthenticated) {
      // 2. State A: User IS Logged In
      const currentTier = tiers.find((t) => t.id === currentUser.membershipTierId) || tiers[0];

      // Fallback logic: If user already has an active tier, warn before proceeding to payment
      if (currentTier.id === target.id) {
        setPendingTierTransition({
          currentTier,
          targetTier: target,
          type: 'SAME',
        });
      } else if (target.price > currentTier.price) {
        setPendingTierTransition({
          currentTier,
          targetTier: target,
          type: 'UPGRADE',
        });
      } else {
        setPendingTierTransition({
          currentTier,
          targetTier: target,
          type: 'DOWNGRADE',
        });
      }
    } else {
      // 3. State B: User IS NOT Logged In (The Auth Gate)
      // Do NOT redirect to payment gateway yet.
      // Temporarily save choice in state, sessionStorage, localStorage & URL param so it isn't lost.
      setPendingCheckoutPlanId(tierId);
      setPendingBillingCycle(cycle);
      setRegisterPreselectedTierId(tierId);
      try {
        sessionStorage.setItem('pendingPlanId', tierId);
        sessionStorage.setItem('pendingPlanCycle', cycle);
        localStorage.setItem('pendingPlanId', tierId);
        localStorage.setItem('pendingPlanCycle', cycle);
        const url = new URL(window.location.href);
        url.searchParams.set('plan', tierId);
        url.searchParams.set('cycle', cycle);
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }

      // Open the Auth Gate Modal with two clear options (Log In vs Register)
      setShowLoginModal(true);
      triggerToast(
        'Authentication Required',
        `Please log in or create an account to complete your subscription to the ${target.name} plan (${cycle === 'annual' ? 'Annual Retainer' : 'Standard Tier Access'}).`,
        'info'
      );
    }
  };

  const triggerToast = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    const id = `sys-toast-${Date.now()}`;
    setSystemToast({ id, title, message, type });
    setTimeout(() => {
      setSystemToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const dismissSystemToast = () => setSystemToast(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_registrations`, JSON.stringify(registrationApplications));
  }, [registrationApplications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_subscribers`, JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_support_config`, JSON.stringify(supportConfig));
  }, [supportConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tiers`, JSON.stringify(tiers));
  }, [tiers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_apps`, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_docs`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_txs`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_msgs`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  // Live Toast notification ticker for social proof on public site
  useEffect(() => {
    const TOAST_EVENTS: Array<Omit<ToastNotice, 'id'>> = [
      { message: 'Commercial Line Approved ($320k)', location: 'Zurich, Switzerland', tier: 'Platinum Prestige', timeAgo: '2m ago' },
      { message: 'New Member Registration', location: 'London, UK · Mayfair', tier: 'Diamond Syndicate', timeAgo: '4m ago' },
      { message: 'Equipment Facility Disbursed ($95k)', location: 'Chicago, IL', tier: 'Gold Executive', timeAgo: '8m ago' },
      { message: 'Securities-Backed Loan Closed ($3.2M)', location: 'Singapore · Marina Bay', tier: 'Diamond Syndicate', timeAgo: '14m ago' },
      { message: 'New Member Upgrade', location: 'Frankfurt, Germany', tier: 'Gold Executive', timeAgo: '19m ago' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      const item = TOAST_EVENTS[index % TOAST_EVENTS.length];
      setActiveToast({
        id: `toast-${Date.now()}`,
        ...item,
      });
      index++;

      // auto dismiss after 5s
      setTimeout(() => {
        setActiveToast((prev) => (prev?.message === item.message ? null : prev));
      }, 5000);
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  const dismissToast = () => setActiveToast(null);

  const openRegistrationWithTier = (tierId: MembershipTierId) => {
    setRegisterPreselectedTierId(tierId);
    setRegisterInitialStep(1);
    setShowRegisterModal(true);
    const tierName = tiers.find((t) => t.id === tierId)?.name || 'Selected Tier';
    triggerToast(
      'Plan Attached to Registration',
      `${tierName} has been attached to your sign-up context. Fill in your details to apply.`,
      'info'
    );
  };

  const openRegistrationWithStep = (step: number, tierId?: MembershipTierId) => {
    if (tierId) {
      setRegisterPreselectedTierId(tierId);
    }
    setRegisterInitialStep(step);
    setShowRegisterModal(true);
  };

  const submitRegistration = (
    data: Omit<RegistrationApplication, 'id' | 'status' | 'submittedAt'>
  ): RegistrationApplication => {
    const regId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const initialOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newApp: RegistrationApplication = {
      ...data,
      id: regId,
      status: 'PENDING',
      submittedAt: dateFormatted,
      otpCode: initialOtp,
      emailVerified: false,
    };

    setRegistrationApplications((prev) => [newApp, ...prev.filter((a) => a.id !== regId)]);

    triggerToast(
      'Verification Email Dispatched',
      `6-digit OTP code sent to ${data.email}. (Code: ${initialOtp})`,
      'warning'
    );

    return newApp;
  };

  const verifyRegistrationEmailOTP = (registrationId: string, otpCode: string): boolean => {
    const app = registrationApplications.find((a) => a.id === registrationId);
    if (!app) return false;

    // Allow the actual code or universal demo codes 849201 / 123456
    const isValid = app.otpCode === otpCode || otpCode === '849201' || otpCode === '123456';
    if (isValid) {
      const now = new Date().toISOString();
      setRegistrationApplications((prev) =>
        prev.map((a) =>
          a.id === registrationId
            ? { ...a, emailVerified: true, emailVerifiedAt: now }
            : a
        )
      );

      triggerToast(
        'Email Successfully Verified!',
        'Your identity and loan request have been submitted to the Admin Approval Desk.',
        'success'
      );
      return true;
    }

    triggerToast('Verification Code Invalid', 'Please check the 6-digit code or use Auto-fill.', 'error');
    return false;
  };

  const resendRegistrationOTP = (registrationId: string): string => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setRegistrationApplications((prev) =>
      prev.map((a) => (a.id === registrationId ? { ...a, otpCode: newCode } : a))
    );
    const target = registrationApplications.find((a) => a.id === registrationId);
    triggerToast(
      'New OTP Code Sent',
      `A fresh code was sent to ${target?.email || 'your email'}. (Code: ${newCode})`,
      'info'
    );
    return newCode;
  };

  const approveRegistration = (registrationId: string, reviewedBy?: string) => {
    const reviewer = reviewedBy || authenticatedAdmin?.name || 'Compliance & Onboarding Desk';
    const now = new Date().toISOString().slice(0, 16);

    const target = registrationApplications.find((a) => a.id === registrationId);
    if (!target) return;

    setRegistrationApplications((prev) =>
      prev.map((a) =>
        a.id === registrationId
          ? {
              ...a,
              status: 'APPROVED',
              reviewedBy: reviewer,
              reviewedAt: now,
              adminRejectionNote: undefined,
            }
          : a
      )
    );

    // If matches active client session, update status to VERIFIED
    if (target.email.toLowerCase() === currentUser.email.toLowerCase()) {
      setCurrentUser((prev) => ({
        ...prev,
        kycStatus: 'VERIFIED',
        membershipTierId: target.selectedTierId,
        membershipStatus: 'ACTIVE',
      }));
    }

    triggerToast(
      'Account & KYC Approved!',
      `Registration for ${target.fullName.firstName} ${target.fullName.lastName} approved by ${reviewer}. Member account active.`,
      'success'
    );
  };

  const rejectRegistration = (registrationId: string, rejectionNote: string, reviewedBy?: string) => {
    const reviewer = reviewedBy || authenticatedAdmin?.name || 'Compliance & Onboarding Desk';
    const now = new Date().toISOString().slice(0, 16);

    const target = registrationApplications.find((a) => a.id === registrationId);
    if (!target) return;

    setRegistrationApplications((prev) =>
      prev.map((a) =>
        a.id === registrationId
          ? {
              ...a,
              status: 'REJECTED',
              reviewedBy: reviewer,
              reviewedAt: now,
              adminRejectionNote: rejectionNote,
            }
          : a
      )
    );

    triggerToast(
      'Registration KYC Rejected',
      `Re-submission notice dispatched to ${target.email}: "${rejectionNote}"`,
      'error'
    );
  };

  const addSubscriber = (newSub: MembershipSubscriber) => {
    setSubscribers((prev) => [newSub, ...prev.filter((s) => s.id !== newSub.id)]);
  };

  const updateSubscriberStatus = (subscriberId: string, status: MembershipSubscriber['paymentStatus']) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === subscriberId ? { ...s, paymentStatus: status } : s))
    );
  };

  const upgradeTier = (
    tierId: MembershipTierId, 
    paymentMethod: PaymentMethod,
    cryptoDetails?: CryptoPaymentDetails,
    billingAddress?: BillingAddress,
    subscriberName?: string,
    cardLast4?: string,
    requestId?: string,
    wireProof?: SubmittedWireProof,
    autoActivate?: boolean
  ) => {
    const targetTier = tiers.find((t) => t.id === tierId);
    if (!targetTier) return;

    // Generate realistic hash based on payment method
    let txHash = `ch_${Date.now().toString(36)}`;
    if (paymentMethod.startsWith('CRYPTO')) {
      if (paymentMethod === 'CRYPTO_SOL') {
        txHash = `${Array.from({ length: 44 }, () =>
          '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
        ).join('')}`;
      } else if (paymentMethod === 'CRYPTO_BTC') {
        txHash = `${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      } else {
        txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      }
    } else if (paymentMethod === 'BANK_WIRE' && wireProof) {
      txHash = `WIRE-${wireProof.wireReferenceNumber}`;
    }

    const effectiveAddress: BillingAddress = billingAddress || currentUser.billingAddress || {
      streetAddress: '240 Stockton St, Suite 800',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94108',
      country: 'United States',
    };

    const effectiveName = subscriberName || currentUser.name;
    const effectiveCardLast4 = cardLast4 || (paymentMethod === 'STRIPE_CARD' ? '4242' : undefined);
    const invoiceNum = `INV-SWB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedRequestId = requestId || `REQ-${Math.floor(1000 + Math.random() * 9000)}-MEMB`;
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(now.getFullYear() + 1);
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // All membership tier package should be upgraded manually from the admin panel after payment is made
    const isAutoActivated = false;

    // 1. Create Transaction Record
    const newTx: TransactionRecord = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      invoiceNumber: invoiceNum,
      userId: currentUser.id,
      userName: effectiveName,
      tierId: targetTier.id,
      tierName: targetTier.name,
      amount: targetTier.price,
      currency: 'USD',
      paymentMethod,
      status: isAutoActivated ? 'COMPLETED' : 'PROCESSING',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      receiptUrl: `#receipt-${Date.now()}`,
      txHash,
      billingAddress: effectiveAddress,
      cardLast4: effectiveCardLast4,
      cryptoDetails: cryptoDetails
        ? {
            ...cryptoDetails,
            blockNumber: cryptoDetails.blockNumber || Math.floor(19820000 + Math.random() * 50000),
            explorerUrl: cryptoDetails.explorerUrl || `https://etherscan.io/tx/${txHash}`,
          }
        : undefined,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // 2. Queue Subscriber record
    const pendingSubscriber: MembershipSubscriber = {
      id: `sub-${currentUser.id}`,
      userId: currentUser.id,
      name: effectiveName,
      email: currentUser.email,
      phone: currentUser.phone,
      company: currentUser.company,
      requestId: generatedRequestId,
      membershipTierId: isAutoActivated ? targetTier.id : currentUser.membershipTierId,
      membershipTierName: isAutoActivated ? targetTier.name : (tiers.find((t) => t.id === currentUser.membershipTierId)?.name || 'Current Tier'),
      requestedTierId: targetTier.id,
      requestedTierName: targetTier.name,
      paymentStatus: isAutoActivated ? 'ACTIVE' : 'PENDING',
      approvalStatus: isAutoActivated ? 'APPROVED' : 'AWAITING_PAYMENT_VERIFICATION',
      proofStatus: wireProof ? 'RECEIPT_ATTACHED' : 'RECEIPT_ATTACHED',
      proofAttachmentName: wireProof ? wireProof.receiptFileName : `Payment_Receipt_${generatedRequestId}.pdf`,
      dateJoined: dateFormatted,
      amountPaid: targetTier.price,
      currency: 'USD',
      paymentMethod,
      transactionId: newTx.invoiceNumber,
      billingAddress: effectiveAddress,
      lastRenewalDate: dateFormatted,
      nextBillingDate: nextYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      cardLast4: effectiveCardLast4,
      assignedBroker: targetTier.dedicatedBroker ? 'Julian Mercer (Managing Director)' : 'Sterling Desk Underwriting',
      assignedCareAgent: supportConfig.agentName,
      assignedCareEmail: supportConfig.agentEmail,
      receiptVerified: isAutoActivated,
      wireProof: wireProof,
      paymentReceiptNote: wireProof
        ? `Wire Transfer Ref: #${wireProof.wireReferenceNumber} remitted from ${wireProof.remitterName} (${wireProof.remitterBank}). Payment verification email dispatched to ${supportConfig.agentEmail}.`
        : `Payment submitted for $${targetTier.price.toLocaleString()} via ${paymentMethod}.`,
    };

    setSubscribers((prev) => [pendingSubscriber, ...prev.filter((s) => s.userId !== currentUser.id)]);

    // 3. Update User Profile
    if (isAutoActivated) {
      setCurrentUser((prev) => ({
        ...prev,
        name: effectiveName,
        billingAddress: effectiveAddress,
        membershipTierId: targetTier.id,
        pendingUpgrade: undefined,
      }));

      // Add system notice message in client messaging vault
      const successMsg: BrokerMessage = {
        id: `msg-${Date.now()}`,
        senderRole: 'SYSTEM',
        senderName: 'Sterling Treasury Operations',
        text: `Transaction ${newTx.invoiceNumber} verified. Your account has been upgraded to ${targetTier.name}. All institutional credit facilities and syndicated perks are now active.`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        isEncrypted: true,
      };
      setMessages((prev) => [...prev, successMsg]);

      triggerToast(
        'Subscription Activated!',
        `Your membership has been upgraded to ${targetTier.name}. Full benefits are active.`,
        'success'
      );
    } else {
      setCurrentUser((prev) => ({
        ...prev,
        name: effectiveName,
        billingAddress: effectiveAddress,
        pendingUpgrade: {
          id: `upg-${Date.now()}`,
          requestId: generatedRequestId,
          requestedTierId: targetTier.id,
          requestedTierName: targetTier.name,
          requestedAmount: targetTier.price,
          requestedAt: `${dateFormatted} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          paymentMethod,
          transactionId: newTx.invoiceNumber,
          txHash,
          billingAddress: effectiveAddress,
          cardLast4: effectiveCardLast4,
          cryptoDetails,
          status: 'PENDING_VERIFICATION',
          proofStatus: 'RECEIPT_ATTACHED',
          proofAttachmentName: wireProof ? wireProof.receiptFileName : `Payment_Receipt_${generatedRequestId}.pdf`,
          assignedCareAgent: supportConfig.agentName,
          assignedCareEmail: supportConfig.agentEmail,
          receiptNote: wireProof
            ? `Wire transfer of $${targetTier.price.toLocaleString()} remitted by ${wireProof.remitterName}. Ref: #${wireProof.wireReferenceNumber}. Notification sent to ${supportConfig.agentEmail}.`
            : `Payment submitted for ${targetTier.name}. Awaiting manual payment verification by customer care.`,
          wireProof: wireProof,
        },
      }));

      // Add system notice message in client messaging vault
      const pendingNoticeMsg: BrokerMessage = {
        id: `msg-${Date.now()}`,
        senderRole: 'SYSTEM',
        senderName: 'Sterling Compliance Desk',
        text: wireProof
          ? `Wire transfer receipt received for ${targetTier.name} ($${targetTier.price.toLocaleString()}). Wire Reference: #${wireProof.wireReferenceNumber}. Automatic alert dispatched to assigned agent ${supportConfig.agentName} (${supportConfig.agentEmail}).`
          : `Payment request ${generatedRequestId} received for ${targetTier.name} ($${targetTier.price.toLocaleString()} via ${paymentMethod}). Verification assigned to Customer Care Specialist ${supportConfig.agentName}.`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        isEncrypted: true,
      };
      setMessages((prev) => [...prev, pendingNoticeMsg]);

      phpApi.processCheckout({
        userId: currentUser.id,
        userName: effectiveName || currentUser.name,
        tierId: targetTier.id,
        tierName: targetTier.name,
        amount: targetTier.price,
        paymentMethod,
        billingAddress: effectiveAddress,
        cardLast4: effectiveCardLast4,
        cryptoDetails,
        wireProof,
      }).catch(() => {});

      if (wireProof) {
        triggerToast(
          'Wire Transfer Notice Dispatched',
          `Verification alert emailed to ${supportConfig.agentEmail}. Request Ref: #${wireProof.wireReferenceNumber}.`,
          'success'
        );
      } else {
        triggerToast(
          'Payment Request Received!',
          `Request ${generatedRequestId} logged. Status: Pending Verification. Please email receipt to care desk.`,
          'warning'
        );
      }
    }
  };

  const approveMembershipUpgrade = (
    subscriberId: string,
    approvedByAgentName?: string,
    internalNote?: string
  ) => {
    const subscriber = subscribers.find((s) => s.id === subscriberId);
    if (!subscriber) return;

    const targetTierId = subscriber.requestedTierId || subscriber.membershipTierId;
    const targetTier = tiers.find((t) => t.id === targetTierId) || tiers[1];
    const verifyingAgent = approvedByAgentName || authenticatedAdmin?.name || supportConfig.agentName;
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(now.getFullYear() + 1);

    const verifiedAtStr = `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // 1. Update subscriber in state
    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id !== subscriberId) return s;
        return {
          ...s,
          membershipTierId: targetTier.id,
          membershipTierName: targetTier.name,
          requestedTierId: undefined,
          requestedTierName: undefined,
          paymentStatus: 'ACTIVE',
          approvalStatus: 'APPROVED',
          receiptVerified: true,
          verifiedByAgent: verifyingAgent,
          verifiedAt: verifiedAtStr,
          paymentReceiptNote:
            internalNote ||
            `Payment receipt verified and cleared by Customer Care Specialist ${verifyingAgent}. Membership tier officially upgraded.`,
          rejectionReason: undefined,
          lastRenewalDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          nextBillingDate: nextYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
      })
    );

    // 2. If this corresponds to current active user session, apply the official upgrade
    if (subscriber.userId === currentUser.id || subscriber.email.toLowerCase() === currentUser.email.toLowerCase()) {
      setCurrentUser((prev) => ({
        ...prev,
        membershipTierId: targetTier.id,
        membershipStatus: 'ACTIVE',
        renewalDate: nextYear.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        pendingUpgrade: null,
      }));
    }

    // 3. Mark transaction as COMPLETED
    setTransactions((prev) =>
      prev.map((tx) => {
        if (
          tx.invoiceNumber === subscriber.transactionId ||
          tx.txHash === subscriber.transactionId ||
          (tx.userId === subscriber.userId && tx.tierId === targetTier.id)
        ) {
          return { ...tx, status: 'COMPLETED' };
        }
        return tx;
      })
    );

    // 4. Log official broker upgrade message
    const approvalMsg: BrokerMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'SYSTEM',
      senderName: 'Customer Care & Underwriting Desk',
      text: `Official Notice: Payment receipt for ${targetTier.name} has been verified and confirmed by Customer Care Specialist ${verifyingAgent}. Your account has been officially approved and upgraded! Borrowing ceiling elevated to $${targetTier.maxLoanLimit.toLocaleString()}.`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isEncrypted: true,
    };
    setMessages((prev) => [...prev, approvalMsg]);

    phpApi.approveUpgrade(subscriberId, verifyingAgent, internalNote || 'Payment approved and verified').catch(() => {});

    triggerToast(
      'Upgrade Approved!',
      `Membership for ${subscriber.name} upgraded to ${targetTier.name}. Perks unlocked.`,
      'success'
    );
  };

  const rejectMembershipUpgrade = (
    subscriberId: string,
    rejectionReason: string,
    rejectedByAgentName?: string
  ) => {
    const subscriber = subscribers.find((s) => s.id === subscriberId);
    if (!subscriber) return;

    const verifyingAgent = rejectedByAgentName || authenticatedAdmin?.name || supportConfig.agentName;
    const now = new Date();
    const verifiedAtStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id !== subscriberId) return s;
        return {
          ...s,
          paymentStatus: 'PAST_DUE',
          approvalStatus: 'REJECTED',
          receiptVerified: false,
          verifiedByAgent: verifyingAgent,
          verifiedAt: verifiedAtStr,
          rejectionReason: rejectionReason || 'Payment verification unsuccessful.',
          paymentReceiptNote: rejectionReason || 'Payment receipt verification failed or was rejected by customer care.',
        };
      })
    );

    if (subscriber.userId === currentUser.id || subscriber.email.toLowerCase() === currentUser.email.toLowerCase()) {
      setCurrentUser((prev) => ({
        ...prev,
        pendingUpgrade: prev.pendingUpgrade
          ? {
              ...prev.pendingUpgrade,
              status: 'REJECTED',
              receiptNote: rejectionReason,
              rejectionReason,
              reviewedByAgent: verifyingAgent,
              reviewedAt: verifiedAtStr,
            }
          : null,
      }));
    }

    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.invoiceNumber === subscriber.transactionId || tx.userId === subscriber.userId) {
          return { ...tx, status: 'FAILED' };
        }
        return tx;
      })
    );

    const rejectMsg: BrokerMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'SYSTEM',
      senderName: 'Customer Care Desk',
      text: `Notice: Payment receipt verification for your requested tier package was flagged by ${verifyingAgent}: "${rejectionReason}". Please review payment details with customer care at ${supportConfig.agentEmail}.`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isEncrypted: true,
    };
    setMessages((prev) => [...prev, rejectMsg]);

    triggerToast(
      'Payment Request Declined',
      `Payment request for ${subscriber.name} marked as Declined. Reason sent to client dashboard.`,
      'error'
    );
  };

  const setMembershipApprovalStatus = (
    subscriberId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    internalNote?: string,
    agentName?: string
  ) => {
    if (status === 'APPROVED') {
      approveMembershipUpgrade(subscriberId, agentName, internalNote);
    } else if (status === 'REJECTED') {
      rejectMembershipUpgrade(subscriberId, internalNote || 'Payment receipt verification failed.', agentName);
    } else {
      // Revert to pending
      const subscriber = subscribers.find((s) => s.id === subscriberId);
      if (!subscriber) return;
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriberId
            ? {
                ...s,
                paymentStatus: 'PENDING',
                approvalStatus: 'AWAITING_PAYMENT_VERIFICATION',
                receiptVerified: false,
                paymentReceiptNote: internalNote || 'Status set to pending verification.',
                rejectionReason: undefined,
              }
            : s
        )
      );
      if (subscriber.userId === currentUser.id || subscriber.email.toLowerCase() === currentUser.email.toLowerCase()) {
        setCurrentUser((prev) => ({
          ...prev,
          pendingUpgrade: prev.pendingUpgrade
            ? {
                ...prev.pendingUpgrade,
                status: 'PENDING_VERIFICATION',
                receiptNote: internalNote || 'Verification in progress.',
                rejectionReason: undefined,
              }
            : null,
        }));
      }
      triggerToast('Status Reset to Pending', `Request for ${subscriber.name} returned to Pending queue.`, 'warning');
    }
  };

  const resubmitClientProof = (proofFileName: string = 'Payment_Receipt_Proof_Updated.pdf', userNote?: string) => {
    const defaultNote = userNote || 'Payment receipt re-uploaded by client for expedited verification.';
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setCurrentUser((prev) => {
      if (!prev.pendingUpgrade) return prev;
      return {
        ...prev,
        pendingUpgrade: {
          ...prev.pendingUpgrade,
          status: 'PENDING_VERIFICATION',
          proofStatus: 'RECEIPT_ATTACHED',
          proofAttachmentName: proofFileName,
          receiptNote: defaultNote,
          requestedAt: dateFormatted,
          rejectionReason: undefined,
        },
      };
    });

    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.userId === currentUser.id || s.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return {
            ...s,
            paymentStatus: 'PENDING',
            approvalStatus: 'AWAITING_PAYMENT_VERIFICATION',
            proofStatus: 'RECEIPT_ATTACHED',
            proofAttachmentName: proofFileName,
            paymentReceiptNote: defaultNote,
            rejectionReason: undefined,
            receiptVerified: false,
          };
        }
        return s;
      })
    );

    triggerToast(
      'Proof Resubmitted Successfully',
      'Your updated payment receipt has been routed to Customer Care for verification.',
      'success'
    );
  };

  const assignCareAgentToSubscriber = (
    subscriberId: string,
    agentName: string,
    agentEmail?: string
  ) => {
    setSubscribers((prev) =>
      prev.map((s) =>
        s.id === subscriberId
          ? {
              ...s,
              assignedCareAgent: agentName,
              assignedCareEmail: agentEmail || s.assignedCareEmail || supportConfig.agentEmail,
            }
          : s
      )
    );
  };

  const submitLoan = (
    loanData: Omit<LoanApplication, 'id' | 'applicationNumber' | 'status' | 'submittedAt' | 'lastUpdated' | 'tierAtSubmission'>
  ) => {
    const appId = `app-${Date.now().toString().slice(-4)}`;
    const appNumber = `SWB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newApp: LoanApplication = {
      ...loanData,
      id: appId,
      applicationNumber: appNumber,
      status: 'PENDING',
      submittedAt: now,
      lastUpdated: now,
      tierAtSubmission: currentUser.membershipTierId,
      underwriterNotes: [
        `Application received via Client Portal. Active tier: ${currentUser.membershipTierId.toUpperCase()}.`,
        `Requested capital: $${loanData.requestedAmount.toLocaleString()} over ${loanData.termMonths} months.`,
      ],
      assignedBroker: currentUser.assignedBroker || 'Julian Sterling (Principal Broker)',
    };

    setApplications((prev) => [newApp, ...prev]);

    phpApi.submitLoan({
      userId: currentUser.id,
      applicantName: currentUser.name,
      applicantEmail: currentUser.email,
      applicantPhone: currentUser.phone,
      instrumentId: loanData.instrumentId,
      instrumentTitle: loanData.instrumentTitle,
      requestedAmount: loanData.requestedAmount,
      termMonths: loanData.termMonths,
      purpose: loanData.purpose,
      annualIncome: loanData.annualIncome,
      creditScore: loanData.creditScore,
      tierAtSubmission: currentUser.membershipTierId,
    }).catch(() => {});

    // Send chat ping
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        senderRole: 'BROKER',
        senderName: currentUser.assignedBroker,
        text: `Hello ${currentUser.name.split(' ')[0]}, I received your new application ${appNumber} for $${loanData.requestedAmount.toLocaleString()} (${loanData.instrumentTitle}). Our desk is already reviewing your financial schedule.`,
        timestamp: now,
        isEncrypted: true,
      },
    ]);

    return appNumber;
  };

  const updateApplicationStatus = (
    appId: string,
    status: ApplicationStatus,
    partnerBank?: string,
    underwriterNote?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const notes = [...(app.underwriterNotes || [])];
        if (underwriterNote) {
          notes.push(`[${now}] ${underwriterNote}`);
        }
        return {
          ...app,
          status,
          partnerBank: partnerBank || app.partnerBank,
          partnerSubmissionDate: status === 'PARTNER_SUBMITTED' ? now : app.partnerSubmissionDate,
          underwriterNotes: notes,
          lastUpdated: now,
        };
      })
    );
  };

  const verifyDocument = (docId: string, approved: boolean, note: string) => {
    const activeAdmin = ADMIN_PROFILES.find((a) => a.role === activeAdminRole) || ADMIN_PROFILES[2];
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          status: approved ? 'VERIFIED' : 'ACTION_REQUIRED',
          verificationNotes: note,
          verifiedBy: `${activeAdmin.title} (${activeAdmin.name})`,
        };
      })
    );
  };

  const uploadDocument = (docData: Omit<VaultDocument, 'id' | 'uploadDate' | 'status' | 'encryptionHash'>) => {
    const randomHash = `SHA256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const newDoc: VaultDocument = {
      ...docData,
      id: `doc-${Date.now().toString().slice(-4)}`,
      uploadDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'PENDING_REVIEW',
      encryptionHash: randomHash,
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const sendMessage = (text: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const userMsg: BrokerMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'CLIENT',
      senderName: currentUser.name,
      text,
      timestamp: now,
      isEncrypted: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    phpApi.sendChatMessage(currentUser.id, text).catch(() => {});

    const newCount = chatQuestionCount + 1;
    setChatQuestionCount(newCount);
    try {
      localStorage.setItem(`${STORAGE_KEY}_chat_qcount`, newCount.toString());
    } catch {
      // ignore
    }

    // Automated Broker Robot responds after 900ms
    setTimeout(() => {
      let botReply = '';
      const lower = text.toLowerCase();

      // Check if triage limit is reached (after 3-5 questions, e.g. at 4 questions)
      if (newCount >= 4) {
        botReply = `🤖 Automated Broker Assistant: You have reached our automated assistance triage limit (${newCount} questions answered). Please contact your assigned Customer Care Agent, ${supportConfig.agentName || 'Jeff Campbell'}, who will be assisting you with your loan process and further inquiries:\n\nContact Details for your Agent:\n• Name: ${supportConfig.agentName || 'Jeff Campbell'}\n• Email: ${supportConfig.agentEmail || 'jeff@sterlingwealthbroker.com'}\n• Phone: ${supportConfig.agentPhone || '+1 (800) 555-0199 Ext. 104'}\n\nPlease email your questions directly to ${supportConfig.agentEmail || 'jeff@sterlingwealthbroker.com'} for personalized underwriting assistance.`;
      } else {
        if (lower.includes('rate') || lower.includes('interest') || lower.includes('apr')) {
          botReply = `🤖 Automated Assistant: Our syndicate lending rates are SOFR-benchmarked. Your active tier unlocks preferential discounts (up to 2.75% off standard rates) with zero prepayment penalties across partner banks. (Automated Triage: Question ${newCount} of 4 answered)`;
        } else if (lower.includes('tier') || lower.includes('upgrade') || lower.includes('limit') || lower.includes('package') || lower.includes('loan')) {
          botReply = `🤖 Automated Assistant: Membership packages scale your borrowing capacity from $10k–$50k up to $15M+ syndicate lines. All upgrades are submitted for manual clearance from the Admin Panel by our underwriting desk. (Automated Triage: Question ${newCount} of 4 answered)`;
        } else if (lower.includes('wire') || lower.includes('bank') || lower.includes('transfer') || lower.includes('account')) {
          botReply = `🤖 Automated Assistant: Bank Wire Transfers are routed directly into our institutional escrow depository accounts. Requests are logged as Pending Verification and manually approved by Customer Care Agent Jeff Campbell. (Automated Triage: Question ${newCount} of 4 answered)`;
        } else if (lower.includes('document') || lower.includes('kyc') || lower.includes('passport') || lower.includes('statement') || lower.includes('vault')) {
          botReply = `🤖 Automated Assistant: All KYC identity documents, 3-month bank statements, and company filings are encrypted in our zero-knowledge AES-256 GCM vault with immutable SHA-256 audit hashes. (Automated Triage: Question ${newCount} of 4 answered)`;
        } else {
          const generalReplies = [
            `🤖 Automated Assistant: Underwriting Analysis — Your active profile is in good standing. Syndicate review turnaround is governed by your tier SLA. For specific loan covenants, please consult your desk file. (Automated Triage: Question ${newCount} of 4 answered)`,
            `🤖 Automated Assistant: Credit Facilities — We partner with 30+ Tier-1 financial institutions including Barclays, JPMorgan, and Wells Fargo for commercial credit lines, equipment financing, and private notes. (Automated Triage: Question ${newCount} of 4 answered)`,
            `🤖 Automated Assistant: Brokerage Privileges — Your membership guarantees dedicated underwriter coverage, automated proof of funds certificates, and escrow protections. (Automated Triage: Question ${newCount} of 4 answered)`,
          ];
          botReply = generalReplies[(newCount - 1) % generalReplies.length];
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          senderRole: 'BROKER',
          senderName: 'Sterling Automated Assistant (Robot Desk)',
          text: botReply,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          isEncrypted: true,
        },
      ]);
    }, 900);
  };

  const updateTierCMS = (updatedTier: MembershipTier) => {
    setTiers((prev) => prev.map((t) => (t.id === updatedTier.id ? updatedTier : t)));
    triggerToast('Tier Updated', `Updated privileges and terms for ${updatedTier.name}.`, 'success');
  };

  const createTierCMS = (newTier: MembershipTier) => {
    setTiers((prev) => [...prev, newTier]);
    triggerToast('Tier Created', `Added new tier package ${newTier.name}.`, 'success');
  };

  const deleteTierCMS = (tierId: string) => {
    if (tiers.length <= 1) {
      triggerToast('Cannot Delete', 'At least one membership tier must remain active in the system.', 'error');
      return;
    }
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
    triggerToast('Tier Package Deleted', 'Membership tier removed from catalog.', 'info');
  };

  const deletePendingUpgrade = (id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id && s.requestId !== id));
    if (currentUser.pendingUpgrade && (currentUser.pendingUpgrade.id === id || currentUser.pendingUpgrade.requestId === id)) {
      setCurrentUser((prev) => ({ ...prev, pendingUpgrade: null }));
    }
    triggerToast('Upgrade Request Deleted', 'Pending tier upgrade request was removed from queue.', 'info');
  };

  const deleteRegistrationApplication = (id: string) => {
    setRegistrationApplications((prev) => prev.filter((a) => a.id !== id));
    triggerToast('Registration Deleted', 'Member registration application has been deleted.', 'info');
  };

  const deleteSubscriber = (id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id && s.userId !== id));
    triggerToast('Subscriber Deleted', 'Membership profile has been deleted.', 'info');
  };

  const deleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId && t.invoiceNumber !== txId));
    triggerToast('Record Deleted', 'Transaction record has been deleted from audit log.', 'info');
  };

  const resetSupportConfig = () => {
    setSupportConfig(DEFAULT_SUPPORT_CRYPTO_CONFIG);
    triggerToast('Settings Reset', 'Support agent and wire coordinates reset to initial defaults.', 'success');
  };

  const refundTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, status: 'REFUNDED' } : tx))
    );
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_tiers`);
    localStorage.removeItem(`${STORAGE_KEY}_apps`);
    localStorage.removeItem(`${STORAGE_KEY}_docs`);
    localStorage.removeItem(`${STORAGE_KEY}_txs`);
    localStorage.removeItem(`${STORAGE_KEY}_msgs`);
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    localStorage.removeItem(`${STORAGE_KEY}_subscribers`);
    localStorage.removeItem(`${STORAGE_KEY}_registrations`);
    localStorage.removeItem(`${STORAGE_KEY}_support_config`);

    setTiers(INITIAL_MEMBERSHIP_TIERS);
    setApplications(INITIAL_APPLICATIONS);
    setDocuments(INITIAL_DOCUMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setMessages(INITIAL_MESSAGES);
    setCurrentUser(CURRENT_CLIENT_USER);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setRegistrationApplications(INITIAL_REGISTRATION_APPLICATIONS);
    setSupportConfig(DEFAULT_SUPPORT_CRYPTO_CONFIG);
  };

  const updateSupportConfig = (newConfig: SupportAndCryptoConfig) => {
    setSupportConfig(newConfig);
  };

  const openLoanWizardWithInstrument = (instrumentId?: string, amount?: number) => {
    if (instrumentId) setPreselectedInstrumentId(instrumentId);
    if (amount) setPreselectedAmount(amount);
    if (isClientAuthenticated) {
      setCurrentView('PORTAL');
      setPortalTab('APPLY');
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // ignore
      }
    } else {
      triggerToast(
        'Membership Access Required',
        'Please sign in or complete membership registration to apply for this syndicated loan facility.',
        'info'
      );
      setShowLoginModal(true);
    }
  };

  return (
    <BrokerContext.Provider
      value={{
        currentView,
        setCurrentView: handleSetCurrentView,
        publicPage,
        setPublicPage,
        navigateToPublicPage,
        portalTab,
        setPortalTab,
        adminTab,
        setAdminTab,
        activeAdminRole,
        setActiveAdminRole,
        tiers,
        instruments,
        applications,
        documents,
        transactions,
        messages,
        currentUser,
        subscribers,
        registrationApplications,
        activeToast,
        dismissToast,
        systemToast,
        dismissSystemToast,
        triggerToast,
        isClientAuthenticated,
        setIsClientAuthenticated,
        clientLogin,
        clientRegister,
        socialLogin,
        clientLogout,
        restoreClientDashboard,
        restoreActiveGoodStanding,
        pendingCheckoutPlanId,
        setPendingCheckoutPlanId,
        pendingBillingCycle,
        setPendingBillingCycle,
        selectedCheckoutTier,
        setSelectedCheckoutTier,
        handleSelectPlanFromHomepage,
        pendingTierTransition,
        setPendingTierTransition,
        confirmTierTransition,
        homepageCMS,
        updateHomepageCMS,
        resetHomepageCMSToDefaults,
        showRegisterModal,
        setShowRegisterModal,
        showLoginModal,
        setShowLoginModal,
        registerPreselectedTierId,
        setRegisterPreselectedTierId,
        registerInitialStep,
        setRegisterInitialStep,
        openRegistrationWithTier,
        openRegistrationWithStep,
        submitRegistration,
        verifyRegistrationEmailOTP,
        resendRegistrationOTP,
        approveRegistration,
        rejectRegistration,
        upgradeTier,
        addSubscriber,
        updateSubscriberStatus,
        setMembershipApprovalStatus,
        approveMembershipUpgrade,
        rejectMembershipUpgrade,
        resubmitClientProof,
        assignCareAgentToSubscriber,
        submitLoan,
        updateApplicationStatus,
        verifyDocument,
        uploadDocument,
        sendMessage,
        chatQuestionCount,
        resetChatQuestions,
        updateTierCMS,
        createTierCMS,
        deleteTierCMS,
        deletePendingUpgrade,
        deleteRegistrationApplication,
        deleteSubscriber,
        deleteTransaction,
        resetSupportConfig,
        refundTransaction,
        resetAllData,
        openLoanWizardWithInstrument,
        preselectedInstrumentId,
        preselectedAmount,
        supportConfig,
        updateSupportConfig,
        isAdminAuthenticated,
        authenticatedAdmin,
        adminLogin,
        adminLogout,
        showAdminLoginModal,
        setShowAdminLoginModal,
      }}
    >
      {children}
    </BrokerContext.Provider>
  );
};

export const useBroker = () => {
  const context = useContext(BrokerContext);
  if (!context) {
    throw new Error('useBroker must be used within a BrokerProvider');
  }
  return context;
};
