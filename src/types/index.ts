export type MembershipTierId = 'silver' | 'gold' | 'platinum' | 'diamond';

export interface MembershipTier {
  id: MembershipTierId;
  name: string;
  badge: string;
  price: number;
  period: 'month' | 'quarter' | 'year' | 'one-time';
  maxLoanLimit: number;
  aprDiscount: number; // e.g., 0.75% discount
  processingSLA: string; // e.g. "48 Hours"
  dedicatedBroker: boolean;
  priorityUnderwriting: boolean;
  features: string[];
  allowedInstruments: string[];
  isPopular?: boolean;
  colorScheme: {
    accent: string;
    border: string;
    bgGlow: string;
    text: string;
  };
}

export interface FinancialInstrument {
  id: string;
  title: string;
  category: 'Personal' | 'Commercial' | 'Asset-Backed' | 'Wealth & Liquidity';
  minAmount: number;
  maxAmount: number;
  aprRange: string;
  termOptions: string;
  minTierRequired: MembershipTierId;
  turnaround: string;
  description: string;
  eligibility: string[];
  documentsRequired: string[];
  partnerLenders: string[];
}

export type ApplicationStatus = 
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'PARTNER_SUBMITTED'
  | 'APPROVED'
  | 'DISBURSED'
  | 'REJECTED';

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  instrumentId: string;
  instrumentTitle: string;
  requestedAmount: number;
  termMonths: number;
  purpose: string;
  annualIncome: number;
  creditScore: string;
  status: ApplicationStatus;
  partnerBank?: string;
  partnerSubmissionDate?: string;
  underwriterNotes?: string[];
  assignedBroker: string;
  submittedAt: string;
  lastUpdated: string;
  tierAtSubmission: MembershipTierId | 'unassigned';
  estimatedApprovalDate?: string;
  estimatedDisbursementDate?: string;
  firstPaymentDate?: string;
  maturityDate?: string;
  effectiveApr?: number;
}

export type DocumentType = 
  | 'GOVERNMENT_ID'
  | 'PROOF_OF_INCOME'
  | 'BANK_STATEMENTS'
  | 'TAX_RETURNS'
  | 'BUSINESS_REGISTRATION'
  | 'FINANCIAL_AUDIT';

export interface VaultDocument {
  id: string;
  userId: string;
  type: DocumentType;
  title: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  uploadDate: string;
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'ACTION_REQUIRED';
  verificationNotes?: string;
  encryptionHash: string; // SHA-256 / AES-256 simulated signature
  verifiedBy?: string;
}

export type PaymentProofStatus = 
  | 'PENDING_UPLOAD' 
  | 'AWAITING_PROOF'
  | 'RECEIPT_ATTACHED' 
  | 'EMAILED_TO_CARE'
  | 'VERIFIED' 
  | 'REJECTED';

export type PaymentMethod = 
  | 'STRIPE_CARD' 
  | 'WIRE_TRANSFER' 
  | 'BANK_WIRE'
  | 'CRYPTO_USDC' 
  | 'CRYPTO_USDT' 
  | 'CRYPTO_BTC' 
  | 'CRYPTO_ETH' 
  | 'CRYPTO_SOL' 
  | 'SEPA_TRANSFER';

export interface CryptoPaymentDetails {
  coin: string;
  network: string;
  cryptoAmount: string;
  depositAddress: string;
  confirmations: number;
  blockNumber?: number;
  explorerUrl?: string;
}

export interface BillingAddress {
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TransactionRecord {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName: string;
  tierId: MembershipTierId;
  tierName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: 'COMPLETED' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
  date: string;
  receiptUrl?: string;
  txHash?: string;
  cryptoDetails?: CryptoPaymentDetails;
  billingAddress?: BillingAddress;
  cardLast4?: string;
}

export interface SubmittedWireProof {
  wireReferenceNumber: string;
  remitterName: string;
  remitterBank: string;
  receiptFileName?: string;
  receiptFileSize?: string;
  receiptFileUrl?: string;
  submissionDate: string;
  submittedAt?: string;
  customerCareNotified: boolean;
  notifiedAgentEmail?: string;
  agentNotifiedEmail?: string;
}

export interface PendingTierUpgrade {
  id: string;
  requestId: string;
  requestedTierId: MembershipTierId;
  requestedTierName: string;
  requestedAmount: number;
  requestedAt: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  txHash?: string;
  billingAddress: BillingAddress;
  cardLast4?: string;
  cryptoDetails?: CryptoPaymentDetails;
  wireProof?: SubmittedWireProof;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  proofStatus: PaymentProofStatus;
  proofAttachmentName?: string;
  assignedCareAgent: string;
  assignedCareEmail: string;
  receiptNote?: string;
  rejectionReason?: string;
  reviewedByAgent?: string;
  reviewedAt?: string;
}

export interface MembershipSubscriber {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  requestId?: string;
  membershipTierId: MembershipTierId | null;
  membershipTierName: string;
  requestedTierId?: MembershipTierId;
  requestedTierName?: string;
  paymentStatus: 'ACTIVE' | 'PENDING' | 'PAST_DUE' | 'CANCELLED';
  approvalStatus?: 'AWAITING_PAYMENT_VERIFICATION' | 'APPROVED' | 'REJECTED';
  proofStatus?: PaymentProofStatus;
  proofAttachmentName?: string;
  wireProof?: SubmittedWireProof;
  dateJoined: string;
  amountPaid: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  billingAddress: BillingAddress;
  lastRenewalDate?: string;
  nextBillingDate?: string;
  cardLast4?: string;
  assignedBroker?: string;
  assignedCareAgent?: string;
  assignedCareEmail?: string;
  receiptVerified?: boolean;
  verifiedByAgent?: string;
  verifiedAt?: string;
  paymentReceiptNote?: string;
  rejectionReason?: string;
  proofDocumentUrl?: string;
}

export interface BrokerMessage {
  id: string;
  senderRole: 'CLIENT' | 'BROKER' | 'SYSTEM';
  senderName: string;
  text: string;
  timestamp: string;
  isEncrypted: boolean;
  avatar?: string;
}

export type AdminRole = 
  | 'SUPER_ADMIN'
  | 'LOAN_SPECIALIST'
  | 'COMPLIANCE_OFFICER'
  | 'CUSTOMER_SUPPORT';

export interface AdminProfile {
  id: string;
  name: string;
  role: AdminRole;
  title: string;
  avatar: string;
  email: string;
  password?: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  membershipTierId: MembershipTierId | null;
  membershipStatus: 'UNASSIGNED' | 'PENDING_REVIEW' | 'ACTIVE' | 'EXPIRED' | 'RENEWAL_DUE';
  memberSince: string;
  renewalDate: string;
  membershipCycle?: 'month' | 'quarter' | 'year';
  membershipTermStart?: string;
  membershipDateUpdatedAt?: string;
  kycStatus: 'VERIFIED' | 'IN_REVIEW' | 'ACTION_REQUIRED';
  assignedBroker: string;
  brokerDirectLine: string;
  twoFactorEnabled: boolean;
  totalActiveCapital: number;
  billingAddress?: BillingAddress;
  pendingUpgrade?: PendingTierUpgrade | null;
}

export interface TierTransitionNotice {
  currentTier: MembershipTier;
  targetTier: MembershipTier;
  type: 'UPGRADE' | 'DOWNGRADE' | 'SAME';
}

export interface BankWireDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swiftBic: string;
  routingCode: string;
  bankAddress: string;
  wireInstructions?: string;
  referencePrefix: string;
}

export interface SupportAndCryptoConfig {
  agentName: string;
  agentEmail: string;
  agentSecondaryEmail?: string;
  agentTitle: string;
  agentPhone: string;
  telegramHandle: string;
  postPaymentInstructions: string;
  autoSendConfirmationEmail: boolean;
  walletAddresses: {
    btc: string;
    eth: string;
    usdc?: string;
    usdt?: string;
    sol?: string;
    lastAppliedAt?: string;
    appliedByAdmin?: string;
  };
  bankWire: BankWireDetails;
  enabledGateways?: {
    card: boolean;
    crypto: boolean;
    wire: boolean;
  };
  gatewayInstructions?: {
    card: string;
    crypto: string;
  };
  regionalDesks?: RegionalUnderwritingDesk[];
  directChannels?: DirectVerifiedChannels;
}

export interface RegionalUnderwritingDesk {
  id: string;
  name: string;
  badge: string;
  address: string;
  phone: string;
  email: string;
  opsDetail?: string;
}

export interface DirectVerifiedChannels {
  tollFree: string;
  intakeEmail: string;
  hours: string;
  underwritingDirectEmail?: string;
}

export interface HomepageCMSContent {
  hero: {
    kicker: string;
    headlineStart: string;
    headlineHighlight: string;
    headlineEnd: string;
    description: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
  };
  metrics: Array<{
    label: string;
    value: string;
    change: string;
  }>;
  trustCompliance: {
    tag: string;
    headline: string;
    subtitle: string;
    badges: Array<{
      title: string;
      subtitle: string;
    }>;
  };
  howItWorks: {
    tag: string;
    headline: string;
    description: string;
    steps: Array<{
      number: string;
      title: string;
      description: string;
      tag: string;
    }>;
  };
  pricingHeader: {
    tag: string;
    headline: string;
    description: string;
    guaranteeTitle: string;
    guaranteeDesc: string;
  };
}

export type KYCDocumentType = 
  | 'INTERNATIONAL_PASSPORT' 
  | 'DRIVERS_LICENSE' 
  | 'NATIONAL_ID'
  | 'BANK_STATEMENT';

export interface KYCDocumentInfo {
  documentType: KYCDocumentType;
  fileName: string;
  fileSize: string;
  mimeType: string;
  previewUrl: string;
  uploadTimestamp: string;
  hash: string;
}

export interface RegistrationApplication {
  id: string;
  userId: string;
  username: string;
  email: string;
  fullName: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  residentialAddress: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  employment: {
    employmentStatus: 'Employed' | 'Self-Employed' | 'Unemployed' | 'Retired' | 'Student';
    jobTitle: string;
  };
  loanReason: string;
  kycDocument: KYCDocumentInfo;
  selectedTierId: MembershipTierId | null;
  selectedTierName: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  otpCode?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminRejectionNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface SiteBranding {
  siteName: string;
  siteTagline: string;
  logoUrl: string | null;
  logoFileName?: string;
  updatedAt?: string;
}

export type EmailEventType =
  | 'EMAIL_OTP_VERIFICATION'
  | 'WELCOME_REGISTRATION'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'TIER_PAYMENT_SUBMITTED'
  | 'TIER_UPGRADE_APPROVED'
  | 'TIER_UPGRADE_REJECTED'
  | 'LOAN_APPLICATION_SUBMITTED'
  | 'LOAN_STATUS_UPDATED'
  | 'CONTACT_INQUIRY'
  | 'CONTACT_INQUIRY_DESK'
  | 'CUSTOM_TEST';

export interface EmailNotificationLog {
  id: string;
  eventType: EmailEventType;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  status: 'SENT' | 'QUEUED_LOCAL' | 'FAILED';
  transport: string;
  errorMessage?: string;
  relatedEntityId?: string;
  sentAt: string;
}

export interface EmailAutomationConfig {
  enabled: boolean;
  driver: 'smtp' | 'mail';
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  adminAlertEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: 'ssl' | 'tls' | 'none';
  smtpUsername: string;
  smtpPassword?: string;
  triggers: {
    EMAIL_OTP_VERIFICATION: boolean;
    WELCOME_REGISTRATION: boolean;
    KYC_APPROVED: boolean;
    KYC_REJECTED: boolean;
    TIER_PAYMENT_SUBMITTED: boolean;
    TIER_UPGRADE_APPROVED: boolean;
    TIER_UPGRADE_REJECTED: boolean;
    LOAN_APPLICATION_SUBMITTED: boolean;
    LOAN_STATUS_UPDATED: boolean;
    CONTACT_INQUIRY: boolean;
  };
}


