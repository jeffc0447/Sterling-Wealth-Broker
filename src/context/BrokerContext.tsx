import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  SiteBranding,
  EmailEventType,
  EmailNotificationLog,
  EmailAutomationConfig,
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
  DEFAULT_SITE_BRANDING,
  DEFAULT_EMAIL_AUTOMATION_CONFIG,
} from '../data/initialData';
import { phpApi } from '../services/phpApiService';
import {
  calculateTierLoanSchedule,
  calculateRenewalDateFromCycle,
  formatLongDate,
  formatShortDate,
  parseFlexibleDate,
  resolveMembershipCycle,
  toIsoDateString,
  MembershipCyclePeriod,
} from '../utils/loanDateEngine';
import { dispatchAutomatedEmail } from '../services/emailService';

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
  | 'BRANDING'
  | 'HOMEPAGE_CMS'
  | 'ANALYTICS' 
  | 'APPLICATIONS' 
  | 'KYC_DESK' 
  | 'PACKAGE_BUILDER' 
  | 'SUBSCRIBERS' 
  | 'SUPPORT_CONFIG' 
  | 'EMAIL_NOTIFICATIONS'
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
  clientLogin: (email?: string, password?: string) => Promise<boolean>;
  clientRegister: (
    name: string,
    email: string,
    company?: string,
    chosenTierId?: MembershipTierId | null,
    password?: string
  ) => void;
  completeRegistrationSignIn: (registrationId: string) => void;
  socialLogin: (provider: 'google' | 'apple') => void;
  clientLogout: () => void;
  restoreClientDashboard: () => void;
  requestMembershipTierSelection: (tierId: MembershipTierId) => void;
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

  // Homepage CMS & Site Branding Management
  homepageCMS: HomepageCMSContent;
  updateHomepageCMS: (content: HomepageCMSContent) => void;
  resetHomepageCMSToDefaults: () => void;
  siteBranding: SiteBranding;
  updateSiteBranding: (branding: SiteBranding) => void;
  removeSiteLogo: () => void;
  resetSiteBranding: () => void;

  // Registration & KYC Workflow
  showRegisterModal: boolean;
  setShowRegisterModal: (show: boolean) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  registerPreselectedTierId: MembershipTierId | null;
  setRegisterPreselectedTierId: (tierId: MembershipTierId | null) => void;
  registerInitialStep: number;
  setRegisterInitialStep: (step: number) => void;
  openRegistrationWithTier: (tierId?: MembershipTierId | null) => void;
  openRegistrationWithStep: (step: number, tierId?: MembershipTierId | null) => void;
  submitRegistration: (
    data: Omit<RegistrationApplication, 'id' | 'status' | 'submittedAt'>,
    password?: string
  ) => RegistrationApplication;
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
  updateUserMembershipDate: (params: {
    renewalDateIso?: string;
    termStartIso?: string;
    cycle?: MembershipCyclePeriod;
  }) => void;
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

  // Automated Email Notification System
  emailConfig: EmailAutomationConfig;
  emailLogs: EmailNotificationLog[];
  updateEmailConfig: (config: EmailAutomationConfig) => Promise<void>;
  resetEmailConfig: () => void;
  clearEmailLogs: () => void;
  syncEmailLogsFromServer: () => Promise<number>;
  sendAutomatedEmail: (params: {
    eventType: EmailEventType;
    recipientEmail: string;
    recipientName: string;
    variables?: Record<string, string>;
    relatedEntityId?: string;
    forceTest?: boolean;
  }) => Promise<EmailNotificationLog | null>;
  sendTestEmail: (toEmail: string, toName?: string, message?: string) => Promise<EmailNotificationLog | null>;

  isAdminAuthenticated: boolean;
  authenticatedAdmin: AdminProfile | null;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  showAdminLoginModal: boolean;
  setShowAdminLoginModal: (show: boolean) => void;
}

const BrokerContext = createContext<BrokerContextType | undefined>(undefined);

const STORAGE_KEY = 'sterling_wealth_broker_state_v1';

interface RegisteredClientAccount {
  userId: string;
  email: string;
  name: string;
  company?: string;
}

interface DeletedAccountRecord {
  userId?: string;
  email: string;
  deletedAt: string;
}

const UNAUTHENTICATED_CLIENT_USER: UserProfile = {
  id: '',
  name: 'Guest Member',
  email: '',
  phone: '',
  company: '',
  membershipTierId: null,
  membershipStatus: 'UNASSIGNED',
  memberSince: '',
  renewalDate: '',
  kycStatus: 'IN_REVIEW',
  assignedBroker: 'Sterling Desk Underwriting',
  brokerDirectLine: '+1 (800) 555-4921',
  twoFactorEnabled: false,
  totalActiveCapital: 0,
  pendingUpgrade: null,
};

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
    const isAuth = localStorage.getItem(`${STORAGE_KEY}_admin_auth`) === 'true';
    if (!isAuth) return null;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_admin_profile`);
      return saved ? JSON.parse(saved) : ADMIN_PROFILES[0];
    } catch {
      return ADMIN_PROFILES[0];
    }
  });

  const [adminAuthToken, setAdminAuthToken] = useState<string | null>(null);
  const [clientAuthToken, setClientAuthToken] = useState<string | null>(null);
  const pendingRegPasswordsRef = useRef<Record<string, string>>({});

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  const adminLogin = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) return false;

    const matchedProfile = ADMIN_PROFILES.find(
      (a) =>
        a.email.toLowerCase() === cleanEmail &&
        ((a.password && a.password === cleanPass) ||
          cleanPass === 'Church12@' ||
          cleanPass === 'Password123!')
    );

    const isRootOrSeedAdmin =
      (cleanEmail === 'admin@admin.com' && cleanPass === 'Church12@') ||
      ((cleanEmail === 'eleanor.sterling@sterlingwealthbroker.com' ||
        cleanEmail === 'jeff@sterlingwealthbroker.com' ||
        cleanEmail === 'julian.m@sterlingwealthbroker.com') &&
        (cleanPass === 'Password123!' || cleanPass === 'Church12@'));

    if (matchedProfile || isRootOrSeedAdmin) {
      const adminToSet: AdminProfile =
        matchedProfile ||
        (cleanEmail === 'jeff@sterlingwealthbroker.com'
          ? {
              ...ADMIN_PROFILES[4],
              name: 'Jeff Campbell',
              email: 'jeff@sterlingwealthbroker.com',
              avatar: 'JC',
            }
          : cleanEmail === 'julian.m@sterlingwealthbroker.com'
          ? {
              ...ADMIN_PROFILES[2],
              name: 'Julian Mercer',
              email: 'julian.m@sterlingwealthbroker.com',
              avatar: 'JM',
            }
          : ADMIN_PROFILES[0]);

      setIsAdminAuthenticated(true);
      setAuthenticatedAdmin(adminToSet);
      setActiveAdminRole(adminToSet.role);
      localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
      localStorage.setItem(`${STORAGE_KEY}_admin_profile`, JSON.stringify(adminToSet));
      setShowAdminLoginModal(false);
      setCurrentView('ADMIN');
      try {
        if (!window.location.pathname.startsWith('/admin')) {
          window.history.pushState({ view: 'ADMIN' }, '', '/admin');
        }
      } catch {
        // ignore
      }
      phpApi
        .login(cleanEmail, cleanPass)
        .then((res) => {
          if (res?.success && res?.token) {
            setAdminAuthToken(res.token);
          }
        })
        .catch(() => {});
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAuthenticatedAdmin(null);
    setAdminAuthToken(null);
    localStorage.removeItem(`${STORAGE_KEY}_admin_auth`);
    localStorage.removeItem(`${STORAGE_KEY}_admin_profile`);
    phpApi.logoutSession().catch(() => {});
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
    if (view === 'PORTAL') {
      const activeUser = findActiveClientRecord(currentUser.email, currentUser.id);
      if (!isClientAuthenticated || !activeUser) {
        setIsClientAuthenticated(false);
        localStorage.removeItem(`${STORAGE_KEY}_client_auth`);
        localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PUBLIC');
        setCurrentView('PUBLIC');
        setShowLoginModal(true);
        triggerToast(
          'Membership Account Required',
          'Please sign in with an active account or create a new membership account to access the client dashboard.',
          'info'
        );
        return;
      }
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
  const [registerPreselectedTierId, setRegisterPreselectedTierId] = useState<MembershipTierId | null>(null);
  const [registerInitialStep, setRegisterInitialStep] = useState<number>(1);

  // Deleted & Registered Client Accounts Registry (Enforces revocation when deleted from Admin Panel)
  const [deletedAccounts, setDeletedAccounts] = useState<DeletedAccountRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_deleted_accounts`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [registeredClientAccounts, setRegisteredClientAccounts] = useState<RegisteredClientAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_client_accounts`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    const seedMap = new Map<string, RegisteredClientAccount>();
    const addSeed = (userId: string, email: string, name: string, company?: string) => {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail && !seedMap.has(cleanEmail)) {
        seedMap.set(cleanEmail, { userId, email: cleanEmail, name, company });
      }
    };
    addSeed(CURRENT_CLIENT_USER.id, CURRENT_CLIENT_USER.email, CURRENT_CLIENT_USER.name, CURRENT_CLIENT_USER.company);
    INITIAL_SUBSCRIBERS.forEach((s) => addSeed(s.userId, s.email, s.name, s.company));
    INITIAL_REGISTRATION_APPLICATIONS.forEach((r) =>
      addSeed(r.userId, r.email, `${r.fullName.firstName} ${r.fullName.lastName}`.trim(), r.employment?.jobTitle)
    );
    return Array.from(seedMap.values());
  });

  const isAccountDeleted = (email?: string | null, userId?: string | null): boolean => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUserId = (userId || '').trim();
    return deletedAccounts.some(
      (d) =>
        (cleanEmail !== '' && d.email.toLowerCase() === cleanEmail) ||
        (cleanUserId !== '' && Boolean(d.userId) && d.userId === cleanUserId)
    );
  };

  const findActiveClientRecord = (email?: string | null, userId?: string | null): boolean => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUserId = (userId || '').trim();
    if (!cleanEmail && !cleanUserId) return false;
    if (isAccountDeleted(cleanEmail, cleanUserId)) return false;

    const inSubs = subscribers.some(
      (s) =>
        (cleanEmail !== '' && s.email.toLowerCase() === cleanEmail) ||
        (cleanUserId !== '' && s.userId === cleanUserId)
    );
    const inRegs = registrationApplications.some(
      (r) =>
        (cleanEmail !== '' && r.email.toLowerCase() === cleanEmail) ||
        (cleanUserId !== '' && r.userId === cleanUserId)
    );
    const inAccounts = registeredClientAccounts.some(
      (a) =>
        (cleanEmail !== '' && a.email.toLowerCase() === cleanEmail) ||
        (cleanUserId !== '' && a.userId === cleanUserId)
    );
    return inSubs || inRegs || inAccounts;
  };

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

  // Site Branding (Logo Upload / Delete & Website Name)
  const [siteBranding, setSiteBranding] = useState<SiteBranding>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_site_branding`);
      if (saved) {
        return { ...DEFAULT_SITE_BRANDING, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SITE_BRANDING;
  });

  useEffect(() => {
    try {
      if (siteBranding.siteName && siteBranding.siteName.trim()) {
        document.title = `${siteBranding.siteName.trim()} | Tiered Financial Access & Loan Brokerage`;
      }
    } catch {
      // ignore
    }
  }, [siteBranding.siteName]);

  const updateSiteBranding = (branding: SiteBranding) => {
    const cleanBranding: SiteBranding = {
      ...branding,
      siteName: branding.siteName.trim() || DEFAULT_SITE_BRANDING.siteName,
      siteTagline: branding.siteTagline.trim() || DEFAULT_SITE_BRANDING.siteTagline,
      updatedAt: new Date().toISOString(),
    };
    setSiteBranding(cleanBranding);
    try {
      localStorage.setItem(`${STORAGE_KEY}_site_branding`, JSON.stringify(cleanBranding));
    } catch {
      // ignore quota error
    }
    triggerToast('Website Branding Updated', `Saved website name "${cleanBranding.siteName}" and logo settings.`, 'success');
  };

  const removeSiteLogo = () => {
    const updated: SiteBranding = {
      ...siteBranding,
      logoUrl: null,
      logoFileName: undefined,
      updatedAt: new Date().toISOString(),
    };
    setSiteBranding(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY}_site_branding`, JSON.stringify(updated));
    } catch {
      // ignore
    }
    triggerToast('Previous Logo Deleted', 'Uploaded logo image was removed. Default emblem restored.', 'info');
  };

  const resetSiteBranding = () => {
    setSiteBranding(DEFAULT_SITE_BRANDING);
    try {
      localStorage.removeItem(`${STORAGE_KEY}_site_branding`);
    } catch {
      // ignore
    }
    triggerToast('Branding Reset', 'Website logo and brand name restored to defaults.', 'info');
  };

  // Automated Email Notification Configuration & Outbox Logs
  const [emailConfig, setEmailConfig] = useState<EmailAutomationConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_email_config`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_EMAIL_AUTOMATION_CONFIG,
          ...parsed,
          triggers: {
            ...DEFAULT_EMAIL_AUTOMATION_CONFIG.triggers,
            ...(parsed.triggers || {}),
          },
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_EMAIL_AUTOMATION_CONFIG;
  });

  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_email_logs`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_email_logs`, JSON.stringify(emailLogs.slice(0, 150)));
    } catch {
      // ignore
    }
  }, [emailLogs]);

  const updateEmailConfig = async (newConfig: EmailAutomationConfig) => {
    setEmailConfig(newConfig);
    try {
      localStorage.setItem(`${STORAGE_KEY}_email_config`, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    await phpApi.saveEmailConfig(newConfig as unknown as Record<string, unknown>);
    triggerToast('Email Settings Saved', 'Automated notification & cPanel SMTP preferences updated.', 'success');
  };

  const resetEmailConfig = () => {
    setEmailConfig(DEFAULT_EMAIL_AUTOMATION_CONFIG);
    try {
      localStorage.removeItem(`${STORAGE_KEY}_email_config`);
    } catch {
      // ignore
    }
    triggerToast('Email Settings Reset', 'Notification settings restored to defaults.', 'info');
  };

  const clearEmailLogs = () => {
    setEmailLogs([]);
    try {
      localStorage.removeItem(`${STORAGE_KEY}_email_logs`);
    } catch {
      // ignore
    }
    triggerToast('Outbox Log Cleared', 'Local email notification audit log cleared.', 'info');
  };

  const syncEmailLogsFromServer = async (): Promise<number> => {
    const res = await phpApi.getEmailLogs();
    if (res && res.success && Array.isArray(res.logs)) {
      const serverLogs: EmailNotificationLog[] = res.logs.map((row: any) => ({
        id: String(row.id),
        eventType: (row.event_type || 'CUSTOM_TEST') as EmailEventType,
        recipientEmail: String(row.recipient_email || ''),
        recipientName: String(row.recipient_name || ''),
        subject: String(row.subject || ''),
        bodyHtml: String(row.body_html || ''),
        bodyText: String(row.body_text || ''),
        status: (row.status === 'SENT' || row.status === 'FAILED' ? row.status : 'QUEUED_LOCAL') as EmailNotificationLog['status'],
        transport: String(row.transport || 'cpanel-smtp'),
        errorMessage: row.error_message || undefined,
        relatedEntityId: row.related_entity_id || undefined,
        sentAt: String(row.sent_at || row.created_at || ''),
      }));
      setEmailLogs((prev) => {
        const seen = new Set(serverLogs.map((l) => l.id));
        return [...serverLogs, ...prev.filter((l) => !seen.has(l.id))].slice(0, 150);
      });
      return serverLogs.length;
    }
    return 0;
  };

  const sendAutomatedEmail = async (params: {
    eventType: EmailEventType;
    recipientEmail: string;
    recipientName: string;
    variables?: Record<string, string>;
    relatedEntityId?: string;
    forceTest?: boolean;
  }): Promise<EmailNotificationLog | null> => {
    const log = await dispatchAutomatedEmail({
      ...params,
      variables: {
        brandName: siteBranding.siteName || emailConfig.fromName,
        ...(params.variables || {}),
      },
      config: emailConfig,
    });
    if (log) {
      setEmailLogs((prev) => [log, ...prev].slice(0, 150));
    }
    return log;
  };

  const sendTestEmail = async (
    toEmail: string,
    toName: string = 'Administrator',
    message?: string
  ): Promise<EmailNotificationLog | null> => {
    const log = await sendAutomatedEmail({
      eventType: 'CUSTOM_TEST',
      recipientEmail: toEmail.trim(),
      recipientName: toName.trim() || 'Administrator',
      variables: {
        message:
          message?.trim() ||
          `Automated email notification system verification test for ${siteBranding.siteName}.`,
        subject: `Automated Email Test — ${siteBranding.siteName}`,
        heading: 'Automated SMTP & Notification Verification',
      },
      forceTest: true,
    });
    if (log) {
      if (log.status === 'FAILED') {
        triggerToast('Test Email Failed', log.errorMessage || 'Unable to deliver via server SMTP/mail.', 'error');
      } else if (log.status === 'SENT') {
        triggerToast('Test Email Delivered', `Verification email sent to ${toEmail}.`, 'success');
      } else {
        triggerToast('Test Email Logged (Preview Mode)', `Rendered email queued in Outbox for ${toEmail}. Deploy to cPanel for live SMTP delivery.`, 'info');
      }
    }
    return log;
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

  const revokeDeletedClientSession = (deletedEmail?: string | null, deletedUserId?: string | null, reason?: string) => {
    const cleanEmail = (deletedEmail || '').trim().toLowerCase();
    const cleanUserId = (deletedUserId || '').trim();

    if (cleanEmail || cleanUserId) {
      setDeletedAccounts((prev) => {
        const already = prev.some(
          (d) =>
            (cleanEmail !== '' && d.email.toLowerCase() === cleanEmail) ||
            (cleanUserId !== '' && Boolean(d.userId) && d.userId === cleanUserId)
        );
        if (already) return prev;
        return [
          ...prev,
          {
            userId: cleanUserId || undefined,
            email: cleanEmail || 'deleted-account',
            deletedAt: new Date().toISOString(),
          },
        ];
      });
      setRegisteredClientAccounts((prev) =>
        prev.filter(
          (a) =>
            !(cleanEmail !== '' && a.email.toLowerCase() === cleanEmail) &&
            !(cleanUserId !== '' && a.userId === cleanUserId)
        )
      );
      setRegistrationApplications((prev) =>
        prev.filter(
          (r) =>
            !(cleanEmail !== '' && r.email.toLowerCase() === cleanEmail) &&
            !(cleanUserId !== '' && r.userId === cleanUserId)
        )
      );
      setSubscribers((prev) =>
        prev.filter(
          (s) =>
            !(cleanEmail !== '' && s.email.toLowerCase() === cleanEmail) &&
            !(cleanUserId !== '' && s.userId === cleanUserId)
        )
      );
    }

    const matchesActiveSession =
      (cleanEmail !== '' && currentUser.email.toLowerCase() === cleanEmail) ||
      (cleanUserId !== '' && currentUser.id === cleanUserId) ||
      (!cleanEmail && !cleanUserId);

    if (matchesActiveSession) {
      setClientAuthToken(null);
      setIsClientAuthenticated(false);
      setCurrentUser(UNAUTHENTICATED_CLIENT_USER);
      localStorage.removeItem(`${STORAGE_KEY}_client_auth`);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(UNAUTHENTICATED_CLIENT_USER));
      localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PUBLIC');
      phpApi.logoutSession().catch(() => {});
      if (currentView === 'PORTAL') {
        setCurrentView('PUBLIC');
        setPublicPage('home');
        setPortalTab('OVERVIEW');
        try {
          if (window.location.pathname.startsWith('/portal')) {
            window.history.pushState({ page: 'home' }, '', '/');
          }
        } catch {
          // ignore
        }
      }
      if (reason) {
        triggerToast('Membership Profile Removed', reason, 'error');
      }
    }
  };

  const clientLogin = async (email?: string, _password?: string): Promise<boolean> => {
    const cleanEmailInput = (email || '').trim();
    const trimmedEmail = cleanEmailInput.toLowerCase();

    if (!trimmedEmail) {
      triggerToast('Email Required', 'Please enter your registered email address.', 'error');
      return false;
    }

    if (!_password) {
      triggerToast('Password Required', 'Please enter your account security password.', 'error');
      return false;
    }

    // 1. Check PHP server authentication when live
    const serverRes = await phpApi.login(cleanEmailInput, _password);
    if (serverRes) {
      if (!serverRes.success) {
        const wasDeleted = Boolean((serverRes as { details?: { deleted?: boolean } }).details?.deleted);
        if (wasDeleted) {
          revokeDeletedClientSession(trimmedEmail);
        }
        setIsClientAuthenticated(false);
        localStorage.removeItem(`${STORAGE_KEY}_client_auth`);
        triggerToast(
          wasDeleted ? 'Account Deleted or Not Found' : 'Authentication Failed',
          serverRes.error || 'Account not found or has been deleted. Please create a new membership account.',
          'error'
        );
        return false;
      }
      if (serverRes.token) {
        setClientAuthToken(serverRes.token);
      }
    }

    // 2. Enforce strict local & deleted-registry check (never auto-create accounts during login)
    const isDeletedLocally = isAccountDeleted(trimmedEmail);
    const hasLocalProfile = findActiveClientRecord(trimmedEmail);
    const verifiedByServer = Boolean(serverRes?.success && serverRes?.user);

    if (isDeletedLocally || (!hasLocalProfile && !verifiedByServer)) {
      setIsClientAuthenticated(false);
      localStorage.removeItem(`${STORAGE_KEY}_client_auth`);
      triggerToast(
        'Access Denied — Account Not Found',
        'No active membership profile exists for this email (it may have been deleted from the Admin Panel). Please create a new membership account to access the client dashboard.',
        'error'
      );
      return false;
    }

    const existingSub = subscribers.find((s) => s.email.toLowerCase() === trimmedEmail);
    const existingReg = registrationApplications.find((r) => r.email.toLowerCase() === trimmedEmail);
    const existingAccount = registeredClientAccounts.find((a) => a.email.toLowerCase() === trimmedEmail);
    const serverUser = (serverRes?.user as Record<string, any> | undefined) || undefined;

    let displayName = existingSub?.name || existingAccount?.name || serverUser?.name || currentUser.name;

    if (existingSub) {
      displayName = existingSub.name;
      const isPendingReview =
        existingSub.paymentStatus === 'PENDING' ||
        existingSub.approvalStatus === 'AWAITING_PAYMENT_VERIFICATION';
      const isDeclinedReview =
        existingSub.approvalStatus === 'REJECTED' ||
        existingSub.paymentStatus === 'PAST_DUE';

      const hydratedPending =
        (isPendingReview || isDeclinedReview) && existingSub.requestedTierId
          ? {
              id: existingSub.id,
              requestId: existingSub.requestId || `REQ-${existingSub.id.slice(-4)}`,
              requestedTierId: existingSub.requestedTierId,
              requestedTierName: existingSub.requestedTierName || existingSub.membershipTierName,
              requestedAmount: existingSub.amountPaid,
              requestedAt: existingSub.dateJoined,
              paymentMethod: existingSub.paymentMethod,
              transactionId: existingSub.transactionId,
              status: isDeclinedReview ? ('REJECTED' as const) : ('PENDING_VERIFICATION' as const),
              proofStatus: existingSub.proofStatus || 'AWAITING_PROOF',
              proofAttachmentName: existingSub.proofAttachmentName,
              assignedCareAgent: existingSub.assignedCareAgent || supportConfig.agentName,
              assignedCareEmail: existingSub.assignedCareEmail || supportConfig.agentEmail,
              receiptNote: existingSub.paymentReceiptNote,
              rejectionReason: existingSub.rejectionReason,
              reviewedByAgent: existingSub.verifiedByAgent,
              reviewedAt: existingSub.verifiedAt,
              billingAddress: existingSub.billingAddress,
            }
          : null;

      const derivedStatus: UserProfile['membershipStatus'] = existingSub.membershipTierId
        ? existingSub.paymentStatus === 'ACTIVE'
          ? 'ACTIVE'
          : isPendingReview
          ? 'PENDING_REVIEW'
          : 'RENEWAL_DUE'
        : hydratedPending
        ? 'PENDING_REVIEW'
        : 'UNASSIGNED';

      const updatedUser: UserProfile = {
        ...UNAUTHENTICATED_CLIENT_USER,
        ...currentUser,
        id: existingSub.userId || serverUser?.id || currentUser.id || `usr-${Date.now()}`,
        name: existingSub.name,
        email: existingSub.email,
        phone: existingSub.phone || currentUser.phone || '',
        company: existingSub.company || currentUser.company || 'Private Client',
        membershipTierId: existingSub.membershipTierId,
        membershipStatus: derivedStatus,
        memberSince: currentUser.memberSince || existingSub.dateJoined || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        kycStatus: existingReg ? (existingReg.status === 'APPROVED' ? 'VERIFIED' : 'IN_REVIEW') : 'VERIFIED',
        pendingUpgrade: hydratedPending,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    } else if (existingReg) {
      displayName = `${existingReg.fullName.firstName} ${existingReg.fullName.lastName}`.trim();
      const updatedUser: UserProfile = {
        ...UNAUTHENTICATED_CLIENT_USER,
        ...currentUser,
        id: existingReg.userId || `usr-${Date.now()}`,
        name: displayName,
        email: existingReg.email,
        company: existingReg.employment?.jobTitle || 'Private Member',
        membershipTierId: null,
        membershipStatus: existingReg.selectedTierId ? 'PENDING_REVIEW' : 'UNASSIGNED',
        kycStatus: existingReg.status === 'APPROVED' ? 'VERIFIED' : 'IN_REVIEW',
        memberSince: currentUser.memberSince || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        pendingUpgrade: null,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    } else if (existingAccount || serverUser) {
      displayName = serverUser?.name || existingAccount?.name || cleanEmailInput;
      const updatedUser: UserProfile = {
        ...UNAUTHENTICATED_CLIENT_USER,
        id: serverUser?.id || existingAccount?.userId || `usr-${Date.now()}`,
        name: displayName,
        email: serverUser?.email || existingAccount?.email || cleanEmailInput,
        phone: serverUser?.phone || '',
        company: serverUser?.company || existingAccount?.company || 'Private Client',
        membershipTierId: (serverUser?.membership_tier_id as MembershipTierId) || null,
        membershipStatus: (serverUser?.membership_status as UserProfile['membershipStatus']) || 'UNASSIGNED',
        memberSince: serverUser?.member_since || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        renewalDate: serverUser?.renewal_date || '',
        kycStatus: (serverUser?.kyc_status as UserProfile['kycStatus']) || 'IN_REVIEW',
        assignedBroker: serverUser?.assigned_broker || 'Sterling Desk Underwriting',
        brokerDirectLine: serverUser?.broker_direct_line || '+1 (800) 555-4921',
        twoFactorEnabled: true,
        totalActiveCapital: Number(serverUser?.total_active_capital || 0),
        pendingUpgrade: null,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    }

    setIsClientAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PORTAL');
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');

    const pendingPlan = retrieveAndClearPendingPlan();
    if (pendingPlan) {
      setSelectedCheckoutTier(pendingPlan);
    }

    triggerToast('Welcome Back!', `Signed in successfully as ${displayName}. Welcome to your membership dashboard.`, 'success');
    return true;
  };

  const clientRegister = (
    name: string,
    email: string,
    company?: string,
    chosenTierId?: MembershipTierId | null,
    password?: string
  ) => {
    const cleanEmail = (email || '').trim();
    const cleanEmailLower = cleanEmail.toLowerCase();
    const selectedTierObj = chosenTierId ? tiers.find((t) => t.id === chosenTierId) || null : null;
    const userId = `usr-${Date.now()}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}-MEMB`;

    // Clear any prior deleted marker so the newly created membership account is active
    setDeletedAccounts((prev) => prev.filter((d) => d.email.toLowerCase() !== cleanEmailLower));
    setRegisteredClientAccounts((prev) => [
      {
        userId,
        email: cleanEmailLower,
        name: name.trim() || 'New Member',
        company: company?.trim() || 'Private Client',
      },
      ...prev.filter((a) => a.email.toLowerCase() !== cleanEmailLower),
    ]);

    const pendingUpgradePayload = selectedTierObj
      ? {
          id: `upg-${Date.now()}`,
          requestId: reqId,
          requestedTierId: selectedTierObj.id,
          requestedTierName: selectedTierObj.name,
          requestedAmount: selectedTierObj.price,
          requestedAt: `${dateFormatted} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          paymentMethod: 'WIRE_TRANSFER' as const,
          transactionId: reqId,
          status: 'PENDING_VERIFICATION' as const,
          proofStatus: 'AWAITING_PROOF' as const,
          assignedCareAgent: supportConfig.agentName,
          assignedCareEmail: supportConfig.agentEmail,
          receiptNote: `Membership package "${selectedTierObj.name}" selected upon sign-up. Awaiting manual review & approval by Customer Care Support in the Admin Panel.`,
          billingAddress: currentUser.billingAddress || {
            streetAddress: 'Pending Address Verification',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'United States',
          },
        }
      : null;

    if (selectedTierObj) {
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);
      const pendingSub: MembershipSubscriber = {
        id: `sub-${userId}`,
        userId,
        name: name.trim() || 'New Member',
        email: cleanEmail || 'member@sterlingwealthbroker.com',
        company: company?.trim() || 'Private Client',
        requestId: reqId,
        membershipTierId: null,
        membershipTierName: 'No Active Tier',
        requestedTierId: selectedTierObj.id,
        requestedTierName: selectedTierObj.name,
        paymentStatus: 'PENDING',
        approvalStatus: 'AWAITING_PAYMENT_VERIFICATION',
        proofStatus: 'AWAITING_PROOF',
        dateJoined: dateFormatted,
        amountPaid: selectedTierObj.price,
        currency: 'USD',
        paymentMethod: 'WIRE_TRANSFER',
        transactionId: reqId,
        billingAddress: currentUser.billingAddress || {
          streetAddress: 'Pending Address Verification',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
        },
        lastRenewalDate: dateFormatted,
        nextBillingDate: nextYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        assignedBroker: 'Sterling Desk Underwriting',
        assignedCareAgent: supportConfig.agentName,
        assignedCareEmail: supportConfig.agentEmail,
        receiptVerified: false,
        paymentReceiptNote: `User chose ${selectedTierObj.name} during account registration. Awaiting manual Customer Care Support review & approval in Admin Panel.`,
      };
      setSubscribers((prev) => [pendingSub, ...prev.filter((s) => s.email.toLowerCase() !== cleanEmailLower)]);
    }

    const updatedUser: UserProfile = {
      ...UNAUTHENTICATED_CLIENT_USER,
      id: userId,
      name: name.trim() || 'New Member',
      email: cleanEmail || 'member@sterlingwealthbroker.com',
      company: company?.trim() || 'Private Client',
      membershipTierId: null,
      membershipStatus: selectedTierObj ? 'PENDING_REVIEW' : 'UNASSIGNED',
      kycStatus: 'IN_REVIEW',
      memberSince: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      twoFactorEnabled: true,
      pendingUpgrade: pendingUpgradePayload,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    setIsClientAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PORTAL');
    setShowLoginModal(false);
    setShowRegisterModal(false);
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

    phpApi
      .register({
        userId,
        name: updatedUser.name,
        email: updatedUser.email,
        ...(password ? { password } : {}),
        company: updatedUser.company,
        tier: selectedTierObj ? selectedTierObj.id : null,
      })
      .then((res) => {
        if (res?.token) setClientAuthToken(res.token);
      })
      .catch(() => {});

    sendAutomatedEmail({
      eventType: 'WELCOME_REGISTRATION',
      recipientEmail: updatedUser.email,
      recipientName: updatedUser.name,
      variables: {
        registrationId: updatedUser.id,
        tierName: selectedTierObj
          ? `${selectedTierObj.name} (Pending Customer Care Review)`
          : 'No Tier Selected Yet (Choose in Dashboard)',
      },
      relatedEntityId: updatedUser.id,
    }).catch(() => {});

    triggerToast(
      'Account Created!',
      selectedTierObj
        ? `Welcome ${updatedUser.name}. Your selection (${selectedTierObj.name}) has been submitted for manual Customer Care Support approval.`
        : `Welcome ${updatedUser.name}. Choose a membership tier package in your dashboard whenever you are ready.`,
      'success'
    );
  };

  const completeRegistrationSignIn = (registrationId: string) => {
    const regApp = registrationApplications.find((a) => a.id === registrationId);
    if (!regApp || isAccountDeleted(regApp.email, regApp.userId)) {
      triggerToast(
        'Registration Unavailable',
        'This registration application has been removed. Please create a new membership account.',
        'error'
      );
      return;
    }

    const fullName = `${regApp.fullName.firstName} ${regApp.fullName.lastName}`.trim();
    const cleanEmailLower = regApp.email.trim().toLowerCase();
    const chosenTier = regApp.selectedTierId
      ? tiers.find((t) => t.id === regApp.selectedTierId) || null
      : null;
    const matchedSub = subscribers.find(
      (s) => s.userId === regApp.userId || s.email.toLowerCase() === cleanEmailLower
    );
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const reqId = matchedSub?.requestId || `REQ-${regApp.id.slice(-4)}-MEMB`;

    setDeletedAccounts((prev) =>
      prev.filter((d) => d.email.toLowerCase() !== cleanEmailLower && d.userId !== regApp.userId)
    );
    setRegisteredClientAccounts((prev) => [
      {
        userId: regApp.userId,
        email: cleanEmailLower,
        name: fullName,
        company: regApp.employment?.jobTitle || 'Private Member',
      },
      ...prev.filter((a) => a.email.toLowerCase() !== cleanEmailLower),
    ]);

    const updatedUser: UserProfile = {
      ...UNAUTHENTICATED_CLIENT_USER,
      id: regApp.userId,
      name: fullName,
      email: regApp.email,
      company: regApp.employment?.jobTitle || 'Private Member',
      membershipTierId: null,
      membershipStatus: chosenTier ? 'PENDING_REVIEW' : 'UNASSIGNED',
      kycStatus: regApp.status === 'APPROVED' ? 'VERIFIED' : 'IN_REVIEW',
      memberSince: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      twoFactorEnabled: true,
      billingAddress: {
        streetAddress: regApp.residentialAddress.streetAddress,
        city: regApp.residentialAddress.city,
        state: regApp.residentialAddress.state,
        zipCode: regApp.residentialAddress.zipCode,
        country: regApp.residentialAddress.country,
      },
      pendingUpgrade: chosenTier
        ? {
            id: matchedSub?.id || `upg-${Date.now()}`,
            requestId: reqId,
            requestedTierId: chosenTier.id,
            requestedTierName: chosenTier.name,
            requestedAmount: chosenTier.price,
            requestedAt: `${dateFormatted} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            paymentMethod: matchedSub?.paymentMethod || 'WIRE_TRANSFER',
            transactionId: matchedSub?.transactionId || reqId,
            status: 'PENDING_VERIFICATION',
            proofStatus: matchedSub?.proofStatus || 'AWAITING_PROOF',
            assignedCareAgent: supportConfig.agentName,
            assignedCareEmail: supportConfig.agentEmail,
            receiptNote: `Selected ${chosenTier.name} during registration. Awaiting manual review & approval by Customer Care Support in the Admin Panel.`,
            billingAddress: {
              streetAddress: regApp.residentialAddress.streetAddress,
              city: regApp.residentialAddress.city,
              state: regApp.residentialAddress.state,
              zipCode: regApp.residentialAddress.zipCode,
              country: regApp.residentialAddress.country,
            },
          }
        : null,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    setIsClientAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PORTAL');
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');

    const regPassword = pendingRegPasswordsRef.current[regApp.id];
    if (regPassword) {
      delete pendingRegPasswordsRef.current[regApp.id];
    }

    phpApi
      .register({
        userId: regApp.userId,
        name: fullName,
        email: regApp.email,
        ...(regPassword ? { password: regPassword } : {}),
        company: regApp.employment?.jobTitle,
        tier: regApp.selectedTierId,
        billingAddress: regApp.residentialAddress as unknown as Record<string, unknown>,
        kycRegistration: {
          id: regApp.id,
          loanReason: regApp.loanReason,
          kycDocument: regApp.kycDocument,
        },
      })
      .then((res) => {
        if (res?.token) setClientAuthToken(res.token);
      })
      .catch(() => {});

    triggerToast(
      'Registration Complete!',
      chosenTier
        ? `Signed in as ${fullName}. Your ${chosenTier.name} request is queued for Customer Care Support approval.`
        : `Signed in as ${fullName}. Choose a membership tier package in your dashboard anytime.`,
      'success'
    );
  };

  const socialLogin = (provider: 'google' | 'apple') => {
    const providerName = provider === 'google' ? 'Google' : 'Apple';
    const email = provider === 'google' ? 'alexander.vance@gmail.com' : 'alexander.vance@privaterelay.appleid.com';
    const cleanEmailLower = email.toLowerCase();

    if (isAccountDeleted(cleanEmailLower)) {
      setIsClientAuthenticated(false);
      localStorage.removeItem(`${STORAGE_KEY}_client_auth`);
      triggerToast(
        'Account Deleted — Re-Registration Required',
        'Your previous membership registration and KYC profile were deleted from the Admin Panel. Please create a new membership account to regain access.',
        'error'
      );
      return;
    }

    const existingSub = subscribers.find((s) => s.email.toLowerCase() === cleanEmailLower);
    const pendingPlan = retrieveAndClearPendingPlan();
    const assignedUserId = existingSub?.userId || `usr-${provider}-${Date.now()}`;

    setRegisteredClientAccounts((prev) => [
      {
        userId: assignedUserId,
        email: cleanEmailLower,
        name: existingSub?.name || 'Alexander Vance',
        company: existingSub?.company || 'Vance Holdings LLC',
      },
      ...prev.filter((a) => a.email.toLowerCase() !== cleanEmailLower),
    ]);

    const updatedUser: UserProfile = {
      ...UNAUTHENTICATED_CLIENT_USER,
      id: assignedUserId,
      name: existingSub?.name || 'Alexander Vance',
      email,
      company: existingSub?.company || 'Vance Holdings LLC',
      membershipTierId: existingSub ? existingSub.membershipTierId : null,
      membershipStatus: existingSub?.membershipTierId
        ? existingSub.paymentStatus === 'ACTIVE'
          ? 'ACTIVE'
          : 'PENDING_REVIEW'
        : 'UNASSIGNED',
      kycStatus: existingSub ? 'VERIFIED' : 'IN_REVIEW',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      twoFactorEnabled: true,
      pendingUpgrade: null,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    setIsClientAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_client_auth`, 'true');
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PORTAL');
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setCurrentView('PORTAL');
    setPortalTab('OVERVIEW');

    if (pendingPlan) {
      setSelectedCheckoutTier(pendingPlan);
    }

    phpApi
      .register({
        userId: assignedUserId,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        tier: existingSub?.membershipTierId || null,
      })
      .then((res) => {
        if (res?.token) setClientAuthToken(res.token);
      })
      .catch(() => {});

    triggerToast(
      `Authenticated via ${providerName}`,
      updatedUser.membershipTierId
        ? `Welcome to your membership dashboard, ${updatedUser.name}.`
        : `Welcome ${updatedUser.name}. Select a membership tier package for Customer Care review.`,
      'success'
    );
  };

  const clientLogout = () => {
    setIsClientAuthenticated(false);
    setClientAuthToken(null);
    localStorage.removeItem(`${STORAGE_KEY}_client_auth`);
    localStorage.setItem(`${STORAGE_KEY}_current_view`, 'PUBLIC');
    phpApi.logoutSession().catch(() => {});
    setCurrentView('PUBLIC');
    setPublicPage('home');
    setPortalTab('OVERVIEW');
    try {
      if (window.location.pathname.startsWith('/portal')) {
        window.history.pushState({ page: 'home' }, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
    triggerToast('Signed Out', 'You have been securely signed out of your membership account.', 'info');
  };

  const restoreClientDashboard = () => {
    if (!findActiveClientRecord(currentUser.email, currentUser.id)) {
      revokeDeletedClientSession(
        currentUser.email,
        currentUser.id,
        'Your membership profile was deleted or does not exist. Please create a new membership account to access the client dashboard.'
      );
      setShowLoginModal(true);
      return;
    }
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

  const requestMembershipTierSelection = (tierId: MembershipTierId) => {
    const targetTier = tiers.find((t) => t.id === tierId);
    if (!targetTier) return;

    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(now.getFullYear() + 1);
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}-MEMB`;

    const pendingSub: MembershipSubscriber = {
      id: `sub-${currentUser.id}`,
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      company: currentUser.company,
      requestId: reqId,
      membershipTierId: currentUser.membershipTierId,
      membershipTierName: currentUser.membershipTierId
        ? tiers.find((t) => t.id === currentUser.membershipTierId)?.name || 'Current Tier'
        : 'No Active Tier',
      requestedTierId: targetTier.id,
      requestedTierName: targetTier.name,
      paymentStatus: 'PENDING',
      approvalStatus: 'AWAITING_PAYMENT_VERIFICATION',
      proofStatus: 'AWAITING_PROOF',
      dateJoined: dateFormatted,
      amountPaid: targetTier.price,
      currency: 'USD',
      paymentMethod: 'WIRE_TRANSFER',
      transactionId: reqId,
      billingAddress: currentUser.billingAddress || {
        streetAddress: 'Pending Address Verification',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
      lastRenewalDate: dateFormatted,
      nextBillingDate: nextYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assignedBroker: targetTier.dedicatedBroker ? 'Julian Mercer (Managing Director)' : 'Sterling Desk Underwriting',
      assignedCareAgent: supportConfig.agentName,
      assignedCareEmail: supportConfig.agentEmail,
      receiptVerified: false,
      paymentReceiptNote: `Client selected ${targetTier.name} from Client Dashboard. Awaiting manual review & approval by Customer Care Support in Admin Panel.`,
    };

    setSubscribers((prev) => [
      pendingSub,
      ...prev.filter(
        (s) => s.userId !== currentUser.id && s.email.toLowerCase() !== currentUser.email.toLowerCase()
      ),
    ]);

    setCurrentUser((prev) => ({
      ...prev,
      membershipStatus: prev.membershipTierId ? prev.membershipStatus : 'PENDING_REVIEW',
      pendingUpgrade: {
        id: `upg-${Date.now()}`,
        requestId: reqId,
        requestedTierId: targetTier.id,
        requestedTierName: targetTier.name,
        requestedAmount: targetTier.price,
        requestedAt: `${dateFormatted} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        paymentMethod: 'WIRE_TRANSFER',
        transactionId: reqId,
        status: 'PENDING_VERIFICATION',
        proofStatus: 'AWAITING_PROOF',
        assignedCareAgent: supportConfig.agentName,
        assignedCareEmail: supportConfig.agentEmail,
        receiptNote: `Submitted ${targetTier.name} selection for Customer Care Support manual review & approval in the Admin Panel.`,
        billingAddress: prev.billingAddress || pendingSub.billingAddress,
      },
    }));

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        senderRole: 'SYSTEM',
        senderName: 'Sterling Customer Care Desk',
        text: `Membership package request ${reqId} for ${targetTier.name} ($${targetTier.price.toLocaleString()}) has been logged for manual review by Customer Care Support (${supportConfig.agentName}). Features unlock once approved from the Admin Panel.`,
        timestamp: now.toISOString().replace('T', ' ').slice(0, 16),
        isEncrypted: true,
      },
    ]);

    phpApi.requestMembershipTier(currentUser.id, targetTier.id).catch(() => {});

    sendAutomatedEmail({
      eventType: 'TIER_PAYMENT_SUBMITTED',
      recipientEmail: currentUser.email,
      recipientName: currentUser.name,
      variables: {
        requestId: reqId,
        tierName: `${targetTier.name} (Pending Customer Care Review)`,
        amount: `$${targetTier.price.toLocaleString()}`,
        paymentMethod: 'Customer Care Review Queue',
        careAgent: supportConfig.agentName,
        careEmail: supportConfig.agentEmail,
      },
      relatedEntityId: reqId,
    }).catch(() => {});

    if (supportConfig.agentEmail && supportConfig.agentEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      sendAutomatedEmail({
        eventType: 'TIER_PAYMENT_SUBMITTED',
        recipientEmail: supportConfig.agentEmail,
        recipientName: supportConfig.agentName || 'Customer Care Support',
        variables: {
          requestId: reqId,
          tierName: `${targetTier.name} (Client: ${currentUser.name})`,
          amount: `$${targetTier.price.toLocaleString()}`,
          paymentMethod: 'Manual Tier Selection Review',
          careAgent: supportConfig.agentName,
          careEmail: supportConfig.agentEmail,
        },
        relatedEntityId: reqId,
      }).catch(() => {});
    }

    triggerToast(
      'Tier Package Submitted for Review',
      `${targetTier.name} (${reqId}) is now awaiting manual approval from Customer Care Support in the Admin Panel.`,
      'info'
    );
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

    if (isClientAuthenticated) {
      const currentTier = currentUser.membershipTierId
        ? tiers.find((t) => t.id === currentUser.membershipTierId) || null
        : null;

      if (!currentTier) {
        setSelectedCheckoutTier(target);
        return;
      }

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

      setShowLoginModal(true);
      triggerToast(
        'Authentication Required',
        `Please log in or create an account to select the ${target.name} plan (${cycle === 'annual' ? 'Annual Retainer' : 'Standard Tier Access'}). All packages require Customer Care Support approval.`,
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

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_deleted_accounts`, JSON.stringify(deletedAccounts));
  }, [deletedAccounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_client_accounts`, JSON.stringify(registeredClientAccounts));
  }, [registeredClientAccounts]);

  // Continuous Client Session Guard: revoke access immediately if profile was deleted locally or across tabs
  useEffect(() => {
    if (!isClientAuthenticated) return;
    if (!currentUser.email || !findActiveClientRecord(currentUser.email, currentUser.id)) {
      revokeDeletedClientSession(
        currentUser.email,
        currentUser.id,
        'Your membership registration and profile are no longer active. Please create a new membership account to access the client dashboard.'
      );
    }
  }, [
    isClientAuthenticated,
    currentUser.email,
    currentUser.id,
    deletedAccounts,
    registrationApplications,
    subscribers,
    registeredClientAccounts,
  ]);

  // Server Session Verification: if live PHP backend confirms user was deleted from MySQL, revoke access immediately
  useEffect(() => {
    if (!isClientAuthenticated || !currentUser.email) return;
    let cancelled = false;
    phpApi
      .verifyUserSession({ userId: currentUser.id, email: currentUser.email }, clientAuthToken)
      .then((res) => {
        if (cancelled || !res) return;
        if (res.exists === false || res.deleted === true) {
          revokeDeletedClientSession(
            currentUser.email,
            currentUser.id,
            'Your profile has been deleted from the server by an administrator. Create a new membership account to access the dashboard again.'
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isClientAuthenticated, currentView, portalTab, currentUser.id, currentUser.email, clientAuthToken]);

  // Cross-tab synchronization when Admin deletes a profile in another browser tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${STORAGE_KEY}_deleted_accounts` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setDeletedAccounts(parsed);
        } catch {
          // ignore
        }
      }
      if (e.key === `${STORAGE_KEY}_registrations` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setRegistrationApplications(parsed);
        } catch {
          // ignore
        }
      }
      if (e.key === `${STORAGE_KEY}_subscribers` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setSubscribers(parsed);
        } catch {
          // ignore
        }
      }
      if (e.key === `${STORAGE_KEY}_client_accounts` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setRegisteredClientAccounts(parsed);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const openRegistrationWithTier = (tierId: MembershipTierId | null = null) => {
    setRegisterPreselectedTierId(tierId ?? null);
    setRegisterInitialStep(1);
    setShowRegisterModal(true);
    if (tierId) {
      const tierName = tiers.find((t) => t.id === tierId)?.name || 'Selected Tier';
      triggerToast(
        'Plan Pre-Selected for Review',
        `${tierName} has been attached as your requested package. Customer Care Support will review and approve it in the Admin Panel.`,
        'info'
      );
    } else {
      triggerToast(
        'Membership Registration',
        'Complete your registration details. You can choose a membership tier package now or after signing up.',
        'info'
      );
    }
  };

  const openRegistrationWithStep = (step: number, tierId?: MembershipTierId | null) => {
    if (tierId !== undefined) {
      setRegisterPreselectedTierId(tierId);
    }
    setRegisterInitialStep(step);
    setShowRegisterModal(true);
  };

  const submitRegistration = (
    data: Omit<RegistrationApplication, 'id' | 'status' | 'submittedAt'>,
    password?: string
  ): RegistrationApplication => {
    const regId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const initialOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanEmailLower = data.email.trim().toLowerCase();

    if (password) {
      pendingRegPasswordsRef.current[regId] = password;
    }

    const chosenTier = data.selectedTierId
      ? tiers.find((t) => t.id === data.selectedTierId) || null
      : null;

    const newApp: RegistrationApplication = {
      ...data,
      selectedTierId: chosenTier ? chosenTier.id : null,
      selectedTierName: chosenTier ? chosenTier.name : 'Choose Later (After Sign-Up)',
      id: regId,
      status: 'PENDING',
      submittedAt: dateFormatted,
      otpCode: initialOtp,
      emailVerified: false,
    };

    const fullApplicantName = `${data.fullName.firstName} ${data.fullName.lastName}`.trim();

    // Clear prior deleted marker & register active account so new registration works seamlessly
    setDeletedAccounts((prev) =>
      prev.filter((d) => d.email.toLowerCase() !== cleanEmailLower && d.userId !== data.userId)
    );
    setRegisteredClientAccounts((prev) => [
      {
        userId: data.userId,
        email: cleanEmailLower,
        name: fullApplicantName || data.username,
        company: data.employment?.jobTitle || 'Private Member',
      },
      ...prev.filter((a) => a.email.toLowerCase() !== cleanEmailLower),
    ]);

    setRegistrationApplications((prev) => [newApp, ...prev.filter((a) => a.id !== regId)]);

    // Also add submitted KYC document to vault documents linked to this userId
    if (data.kycDocument) {
      const kycVaultDoc: VaultDocument = {
        id: `doc-kyc-${Date.now().toString().slice(-6)}`,
        userId: data.userId,
        type: 'GOVERNMENT_ID',
        title: `KYC ID (${data.kycDocument.documentType})`,
        fileName: data.kycDocument.fileName,
        fileSize: data.kycDocument.fileSize,
        mimeType: data.kycDocument.mimeType,
        uploadDate: now.toISOString().slice(0, 10),
        status: 'PENDING_REVIEW',
        encryptionHash: data.kycDocument.hash,
      };
      setDocuments((prev) => [kycVaultDoc, ...prev]);
    }

    // If user chose a membership tier package during registration, stage it as PENDING for manual Customer Care Support review in Admin Panel (never auto-activated)
    if (chosenTier) {
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);
      const shortDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}-MEMB`;
      const stagedSubscriber: MembershipSubscriber = {
        id: `sub-${data.userId}`,
        userId: data.userId,
        name: fullApplicantName || data.username,
        email: data.email,
        company: data.employment?.jobTitle || 'Private Member',
        requestId: reqId,
        membershipTierId: null,
        membershipTierName: 'No Active Tier',
        requestedTierId: chosenTier.id,
        requestedTierName: chosenTier.name,
        paymentStatus: 'PENDING',
        approvalStatus: 'AWAITING_PAYMENT_VERIFICATION',
        proofStatus: 'AWAITING_PROOF',
        dateJoined: shortDate,
        amountPaid: chosenTier.price,
        currency: 'USD',
        paymentMethod: 'WIRE_TRANSFER',
        transactionId: reqId,
        billingAddress: {
          streetAddress: data.residentialAddress.streetAddress,
          city: data.residentialAddress.city,
          state: data.residentialAddress.state,
          zipCode: data.residentialAddress.zipCode,
          country: data.residentialAddress.country,
        },
        lastRenewalDate: shortDate,
        nextBillingDate: nextYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        assignedBroker: chosenTier.dedicatedBroker ? 'Julian Mercer (Managing Director)' : 'Sterling Desk Underwriting',
        assignedCareAgent: supportConfig.agentName,
        assignedCareEmail: supportConfig.agentEmail,
        receiptVerified: false,
        paymentReceiptNote: `Chosen during registration (${regId}) — awaiting manual Customer Care Support review & approval in Admin Panel.`,
      };
      setSubscribers((prev) => [
        stagedSubscriber,
        ...prev.filter((s) => s.email.toLowerCase() !== cleanEmailLower),
      ]);
    }

    // Sync registration & KYC dossier to PHP/MySQL server immediately
    phpApi
      .register({
        userId: data.userId,
        name: fullApplicantName || data.username,
        email: data.email,
        ...(password ? { password } : {}),
        company: data.employment?.jobTitle || 'Private Member',
        tier: chosenTier ? chosenTier.id : null,
        billingAddress: data.residentialAddress as unknown as Record<string, unknown>,
        kycRegistration: {
          id: regId,
          loanReason: data.loanReason,
          kycDocument: data.kycDocument,
        },
      })
      .then((res) => {
        if (res?.token) setClientAuthToken(res.token);
      })
      .catch(() => {});

    sendAutomatedEmail({
      eventType: 'EMAIL_OTP_VERIFICATION',
      recipientEmail: data.email,
      recipientName: fullApplicantName,
      variables: {
        otpCode: initialOtp,
        tierName: newApp.selectedTierName,
        registrationId: regId,
      },
      relatedEntityId: regId,
    }).catch(() => {});

    if (emailConfig.adminAlertEmail && emailConfig.adminAlertEmail.toLowerCase() !== data.email.toLowerCase()) {
      sendAutomatedEmail({
        eventType: 'WELCOME_REGISTRATION',
        recipientEmail: emailConfig.adminAlertEmail,
        recipientName: 'Onboarding & Compliance Desk',
        variables: {
          registrationId: regId,
          tierName: `${newApp.selectedTierName} (${fullApplicantName} · ${data.email})`,
        },
        relatedEntityId: regId,
      }).catch(() => {});
    }

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

      sendAutomatedEmail({
        eventType: 'WELCOME_REGISTRATION',
        recipientEmail: app.email,
        recipientName: `${app.fullName.firstName} ${app.fullName.lastName}`.trim(),
        variables: {
          registrationId: app.id,
          tierName: app.selectedTierName,
        },
        relatedEntityId: app.id,
      }).catch(() => {});

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
    if (target?.email) {
      sendAutomatedEmail({
        eventType: 'EMAIL_OTP_VERIFICATION',
        recipientEmail: target.email,
        recipientName: `${target.fullName.firstName} ${target.fullName.lastName}`.trim(),
        variables: {
          otpCode: newCode,
          tierName: target.selectedTierName,
          registrationId: target.id,
        },
        relatedEntityId: target.id,
      }).catch(() => {});
    }
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

    // If matches active client session, update KYC status ONLY (membership tiers are manually reviewed & approved separately by Customer Care Support)
    if (target.email.toLowerCase() === currentUser.email.toLowerCase()) {
      setCurrentUser((prev) => ({
        ...prev,
        kycStatus: 'VERIFIED',
      }));
    }

    sendAutomatedEmail({
      eventType: 'KYC_APPROVED',
      recipientEmail: target.email,
      recipientName: `${target.fullName.firstName} ${target.fullName.lastName}`.trim(),
      variables: {
        registrationId: target.id,
        tierName: target.selectedTierName || 'Pending Customer Care Tier Approval',
        reviewedBy: reviewer,
      },
      relatedEntityId: target.id,
    }).catch(() => {});

    triggerToast(
      'KYC & Account Verified!',
      `Registration for ${target.fullName.firstName} ${target.fullName.lastName} approved by ${reviewer}. Membership tier activation requires manual Customer Care Support approval in Tier Approval Queue.`,
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

    sendAutomatedEmail({
      eventType: 'KYC_REJECTED',
      recipientEmail: target.email,
      recipientName: `${target.fullName.firstName} ${target.fullName.lastName}`.trim(),
      variables: {
        registrationId: target.id,
        reason: rejectionNote,
      },
      relatedEntityId: target.id,
    }).catch(() => {});

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
      membershipTierName: isAutoActivated
        ? targetTier.name
        : currentUser.membershipTierId
        ? tiers.find((t) => t.id === currentUser.membershipTierId)?.name || 'Current Tier'
        : 'No Active Tier',
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

    setSubscribers((prev) => [
      pendingSubscriber,
      ...prev.filter((s) => s.userId !== currentUser.id && s.email.toLowerCase() !== currentUser.email.toLowerCase()),
    ]);

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
        membershipStatus: prev.membershipTierId ? prev.membershipStatus : 'PENDING_REVIEW',
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

      sendAutomatedEmail({
        eventType: 'TIER_PAYMENT_SUBMITTED',
        recipientEmail: currentUser.email,
        recipientName: effectiveName,
        variables: {
          requestId: generatedRequestId,
          tierName: targetTier.name,
          amount: `$${targetTier.price.toLocaleString()}`,
          paymentMethod,
          careAgent: supportConfig.agentName,
          careEmail: supportConfig.agentEmail,
        },
        relatedEntityId: generatedRequestId,
      }).catch(() => {});

      if (supportConfig.agentEmail && supportConfig.agentEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
        sendAutomatedEmail({
          eventType: 'TIER_PAYMENT_SUBMITTED',
          recipientEmail: supportConfig.agentEmail,
          recipientName: supportConfig.agentName || 'Customer Care Desk',
          variables: {
            requestId: generatedRequestId,
            tierName: `${targetTier.name} (Client: ${effectiveName})`,
            amount: `$${targetTier.price.toLocaleString()}`,
            paymentMethod,
            careAgent: supportConfig.agentName,
            careEmail: supportConfig.agentEmail,
          },
          relatedEntityId: generatedRequestId,
        }).catch(() => {});
      }

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
    if (!targetTierId) {
      triggerToast('No Tier Selected', 'This member has not selected a membership tier package yet.', 'warning');
      return;
    }
    const targetTier = tiers.find((t) => t.id === targetTierId);
    if (!targetTier) return;
    const verifyingAgent = approvedByAgentName || authenticatedAdmin?.name || supportConfig.agentName;
    const now = new Date();
    const resolvedCycle = resolveMembershipCycle(undefined, targetTier.period);
    const nextRenewalDate = calculateRenewalDateFromCycle(now, resolvedCycle);
    const shortTermStart = formatShortDate(now);
    const shortRenewal = formatShortDate(nextRenewalDate);
    const longRenewal = formatLongDate(nextRenewalDate);
    const longTermStart = formatLongDate(now);

    const verifiedAtStr = `${shortTermStart} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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
          lastRenewalDate: shortTermStart,
          nextBillingDate: shortRenewal,
        };
      })
    );

    // 2. If this corresponds to current active user session, apply the official upgrade
    if (subscriber.userId === currentUser.id || subscriber.email.toLowerCase() === currentUser.email.toLowerCase()) {
      setCurrentUser((prev) => ({
        ...prev,
        membershipTierId: targetTier.id,
        membershipStatus: 'ACTIVE',
        membershipCycle: resolvedCycle,
        membershipTermStart: longTermStart,
        renewalDate: longRenewal,
        membershipDateUpdatedAt: new Date().toISOString(),
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

    sendAutomatedEmail({
      eventType: 'TIER_UPGRADE_APPROVED',
      recipientEmail: subscriber.email,
      recipientName: subscriber.name,
      variables: {
        tierName: targetTier.name,
        requestId: subscriber.requestId || subscriber.id,
        agentName: verifyingAgent,
      },
      relatedEntityId: subscriber.id,
    }).catch(() => {});

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

    sendAutomatedEmail({
      eventType: 'TIER_UPGRADE_REJECTED',
      recipientEmail: subscriber.email,
      recipientName: subscriber.name,
      variables: {
        tierName: subscriber.requestedTierName || subscriber.membershipTierName,
        requestId: subscriber.requestId || subscriber.id,
        reason: rejectionReason || 'Payment verification unsuccessful.',
      },
      relatedEntityId: subscriber.id,
    }).catch(() => {});

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

  const updateUserMembershipDate = (params: {
    renewalDateIso?: string;
    termStartIso?: string;
    cycle?: MembershipCyclePeriod;
  }) => {
    if (!isClientAuthenticated || !currentUser.email) return;

    const activeTierObj = currentUser.membershipTierId
      ? tiers.find((t) => t.id === currentUser.membershipTierId) || null
      : null;

    const resolvedCycle = resolveMembershipCycle(
      params.cycle ?? currentUser.membershipCycle,
      activeTierObj?.period
    );

    const effectiveTermStartDate = params.termStartIso
      ? parseFlexibleDate(params.termStartIso)
      : parseFlexibleDate(currentUser.membershipTermStart || currentUser.memberSince || new Date());

    const effectiveRenewalDate = params.renewalDateIso
      ? parseFlexibleDate(params.renewalDateIso)
      : calculateRenewalDateFromCycle(effectiveTermStartDate, resolvedCycle);

    const longTermStart = formatLongDate(effectiveTermStartDate);
    const longRenewal = formatLongDate(effectiveRenewalDate);
    const shortTermStart = formatShortDate(effectiveTermStartDate);
    const shortRenewal = formatShortDate(effectiveRenewalDate);
    const nowIso = new Date().toISOString();

    const updatedStatus: UserProfile['membershipStatus'] =
      currentUser.membershipStatus === 'ACTIVE' || currentUser.membershipStatus === 'RENEWAL_DUE' || currentUser.membershipStatus === 'EXPIRED'
        ? effectiveRenewalDate < parseFlexibleDate(new Date())
          ? 'RENEWAL_DUE'
          : 'ACTIVE'
        : currentUser.membershipStatus;

    setCurrentUser((prev) => ({
      ...prev,
      membershipCycle: resolvedCycle,
      membershipTermStart: longTermStart,
      renewalDate: longRenewal,
      membershipDateUpdatedAt: nowIso,
      membershipStatus: updatedStatus,
    }));

    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.userId === currentUser.id || s.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return {
            ...s,
            lastRenewalDate: shortTermStart,
            nextBillingDate: shortRenewal,
          };
        }
        return s;
      })
    );

    phpApi
      .updateMembershipDates(
        {
          renewalDate: toIsoDateString(effectiveRenewalDate),
          termStart: toIsoDateString(effectiveTermStartDate),
        },
        clientAuthToken
      )
      .catch(() => {});

    triggerToast(
      'Membership Date Updated',
      `Your membership renewal schedule has been updated to ${longRenewal} (${resolvedCycle === 'quarter' ? 'Quarterly' : resolvedCycle === 'month' ? 'Monthly' : 'Annual'}).`,
      'success'
    );
  };

  const submitLoan = (
    loanData: Omit<LoanApplication, 'id' | 'applicationNumber' | 'status' | 'submittedAt' | 'lastUpdated' | 'tierAtSubmission'>
  ) => {
    const appId = `app-${Date.now().toString().slice(-4)}`;
    const appNumber = `SWB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const effectiveTierAtSubmission = currentUser.membershipTierId || 'unassigned';
    const activeTierObj =
      tiers.find((t) => t.id === effectiveTierAtSubmission) || tiers[0];
    const computedSchedule = calculateTierLoanSchedule({
      tier: activeTierObj,
      loanAmount: loanData.requestedAmount,
      termMonths: loanData.termMonths,
      applicationDate: new Date(),
      baselineTier: tiers.find((t) => t.id === 'silver') || tiers[0],
    });

    const newApp: LoanApplication = {
      ...loanData,
      id: appId,
      applicationNumber: appNumber,
      status: 'PENDING',
      submittedAt: now,
      lastUpdated: now,
      tierAtSubmission: effectiveTierAtSubmission,
      estimatedApprovalDate: loanData.estimatedApprovalDate || computedSchedule.underwritingApprovalDateFormatted,
      estimatedDisbursementDate: loanData.estimatedDisbursementDate || computedSchedule.disbursementDateFormatted,
      firstPaymentDate: loanData.firstPaymentDate || computedSchedule.firstPaymentDateFormatted,
      maturityDate: loanData.maturityDate || computedSchedule.maturityDateFormatted,
      effectiveApr: loanData.effectiveApr ?? computedSchedule.effectiveApr,
      underwriterNotes: [
        `Application received via Client Portal. Active tier: ${effectiveTierAtSubmission.toUpperCase()} (Est. Disbursement: ${loanData.estimatedDisbursementDate || computedSchedule.disbursementDateFormatted}).`,
        `Requested capital: $${loanData.requestedAmount.toLocaleString()} over ${loanData.termMonths} months (Maturity: ${loanData.maturityDate || computedSchedule.maturityDateFormatted}).`,
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
      tierAtSubmission: effectiveTierAtSubmission,
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

    sendAutomatedEmail({
      eventType: 'LOAN_APPLICATION_SUBMITTED',
      recipientEmail: currentUser.email,
      recipientName: currentUser.name,
      variables: {
        applicationNumber: appNumber,
        instrumentTitle: loanData.instrumentTitle,
        requestedAmount: `$${loanData.requestedAmount.toLocaleString()}`,
      },
      relatedEntityId: appNumber,
    }).catch(() => {});

    return appNumber;
  };

  const updateApplicationStatus = (
    appId: string,
    status: ApplicationStatus,
    partnerBank?: string,
    underwriterNote?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const targetApp = applications.find((a) => a.id === appId);
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

    if (targetApp?.applicantEmail) {
      sendAutomatedEmail({
        eventType: 'LOAN_STATUS_UPDATED',
        recipientEmail: targetApp.applicantEmail,
        recipientName: targetApp.applicantName || 'Applicant',
        variables: {
          applicationNumber: targetApp.applicationNumber,
          status,
          partnerBank: partnerBank || targetApp.partnerBank || 'Syndicate Lending Desk',
          note: underwriterNote || `Your credit facility application moved to ${status}.`,
        },
        relatedEntityId: targetApp.applicationNumber,
      }).catch(() => {});
    }
  };

  const verifyDocument = (docId: string, approved: boolean, note: string) => {
    const activeAdmin = ADMIN_PROFILES.find((a) => a.role === activeAdminRole) || ADMIN_PROFILES[2];
    const targetDoc = documents.find((d) => d.id === docId);
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

    if (targetDoc) {
      const matchedSub = subscribers.find((s) => s.userId === targetDoc.userId);
      const targetEmail =
        targetDoc.userId === currentUser.id
          ? currentUser.email
          : matchedSub?.email || currentUser.email;
      const targetName =
        targetDoc.userId === currentUser.id
          ? currentUser.name
          : matchedSub?.name || 'Member';
      if (targetEmail) {
        sendAutomatedEmail({
          eventType: approved ? 'KYC_APPROVED' : 'KYC_REJECTED',
          recipientEmail: targetEmail,
          recipientName: targetName,
          variables: {
            registrationId: targetDoc.title,
            tierName: matchedSub?.membershipTierName || 'Verified Member',
            reviewedBy: `${activeAdmin.name}`,
            reason: note || 'Document requires clearer scan or updated filing.',
          },
          relatedEntityId: targetDoc.id,
        }).catch(() => {});
      }
    }
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

  const cascadeDeleteUserProfile = (params: {
    registrationId?: string;
    subscriberId?: string;
    userId?: string;
    email?: string;
  }) => {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanUserId = (params.userId || '').trim();

    if (params.registrationId) {
      delete pendingRegPasswordsRef.current[params.registrationId];
    }

    // 1. Remove matching records across all entities
    setRegistrationApplications((prev) =>
      prev.filter(
        (a) =>
          a.id !== params.registrationId &&
          !(cleanUserId !== '' && a.userId === cleanUserId) &&
          !(cleanEmail !== '' && a.email.toLowerCase() === cleanEmail)
      )
    );
    setSubscribers((prev) =>
      prev.filter(
        (s) =>
          s.id !== params.subscriberId &&
          !(cleanUserId !== '' && s.userId === cleanUserId) &&
          !(cleanEmail !== '' && s.email.toLowerCase() === cleanEmail)
      )
    );
    if (cleanUserId !== '') {
      setDocuments((prev) => prev.filter((d) => d.userId !== cleanUserId));
      setTransactions((prev) => prev.filter((t) => t.userId !== cleanUserId));
    }
    setApplications((prev) =>
      prev.filter(
        (app) =>
          !(cleanUserId !== '' && app.userId === cleanUserId) &&
          !(cleanEmail !== '' && app.applicantEmail.toLowerCase() === cleanEmail)
      )
    );

    // 2. Revoke client profile, block dashboard access, and log out if active
    revokeDeletedClientSession(
      cleanEmail,
      cleanUserId,
      'Your membership registration and KYC profile were deleted from the Admin Panel. Please create a new membership account to regain access.'
    );

    // 3. Delete profile & all linked records from PHP/MySQL server
    phpApi
      .deleteUserProfile(
        {
          registrationId: params.registrationId,
          subscriberId: params.subscriberId,
          userId: cleanUserId || undefined,
          email: cleanEmail || undefined,
        },
        adminAuthToken
      )
      .then((res) => {
        if (res && !res.success) {
          triggerToast(
            'Server Sync Notice',
            res.error || 'Local profile purged. Sign in to Admin Panel to finalize server deletion.',
            'warning'
          );
        }
      })
      .catch(() => {});
  };

  const deleteRegistrationApplication = (id: string) => {
    const targetApp = registrationApplications.find((a) => a.id === id);
    const linkedSub = targetApp
      ? subscribers.find(
          (s) => s.userId === targetApp.userId || s.email.toLowerCase() === targetApp.email.toLowerCase()
        )
      : undefined;

    cascadeDeleteUserProfile({
      registrationId: id,
      subscriberId: linkedSub?.id,
      userId: targetApp?.userId || linkedSub?.userId,
      email: targetApp?.email || linkedSub?.email,
    });

    triggerToast(
      'Registration, KYC & Server Profile Deleted',
      targetApp
        ? `${targetApp.fullName.firstName} ${targetApp.fullName.lastName} (${targetApp.email}) has been deleted from the server and blocked from dashboard access.`
        : 'Member registration and user profile permanently deleted from server.',
      'info'
    );
  };

  const deleteSubscriber = (id: string) => {
    const targetSub = subscribers.find((s) => s.id === id || s.userId === id);
    const linkedReg = targetSub
      ? registrationApplications.find(
          (a) => a.userId === targetSub.userId || a.email.toLowerCase() === targetSub.email.toLowerCase()
        )
      : undefined;

    cascadeDeleteUserProfile({
      registrationId: linkedReg?.id,
      subscriberId: targetSub?.id || id,
      userId: targetSub?.userId || linkedReg?.userId,
      email: targetSub?.email || linkedReg?.email,
    });

    triggerToast(
      'User Profile Permanently Deleted',
      targetSub
        ? `${targetSub.name} (${targetSub.email}) has been removed from the server and must register again for dashboard access.`
        : 'Membership profile deleted from server.',
      'info'
    );
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
    localStorage.removeItem(`${STORAGE_KEY}_deleted_accounts`);
    localStorage.removeItem(`${STORAGE_KEY}_client_accounts`);

    setTiers(INITIAL_MEMBERSHIP_TIERS);
    setApplications(INITIAL_APPLICATIONS);
    setDocuments(INITIAL_DOCUMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setMessages(INITIAL_MESSAGES);
    setCurrentUser(CURRENT_CLIENT_USER);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setRegistrationApplications(INITIAL_REGISTRATION_APPLICATIONS);
    setSupportConfig(DEFAULT_SUPPORT_CRYPTO_CONFIG);
    setDeletedAccounts([]);
    setRegisteredClientAccounts([
      {
        userId: CURRENT_CLIENT_USER.id,
        email: CURRENT_CLIENT_USER.email.toLowerCase(),
        name: CURRENT_CLIENT_USER.name,
        company: CURRENT_CLIENT_USER.company,
      },
    ]);
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
        completeRegistrationSignIn,
        socialLogin,
        clientLogout,
        restoreClientDashboard,
        requestMembershipTierSelection,
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
        siteBranding,
        updateSiteBranding,
        removeSiteLogo,
        resetSiteBranding,
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
        updateUserMembershipDate,
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
        emailConfig,
        emailLogs,
        updateEmailConfig,
        resetEmailConfig,
        clearEmailLogs,
        syncEmailLogsFromServer,
        sendAutomatedEmail,
        sendTestEmail,
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
