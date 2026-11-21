import { BillingAddress, MembershipSubscriber, MembershipTier, PaymentMethod, TransactionRecord } from '../types';

export interface CardPaymentFormData {
  cardholderName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ValidationErrors {
  cardholderName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AU', name: 'Australia' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'IE', name: 'Ireland' },
  { code: 'JP', name: 'Japan' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'SE', name: 'Sweden' },
];

export const POPULAR_US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

/**
 * Validates full payment & billing address form (Client-side & Server-side rules)
 */
export function validatePaymentAndBilling(data: CardPaymentFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // 1. Cardholder Name
  const trimmedName = data.cardholderName.trim();
  if (!trimmedName) {
    errors.cardholderName = 'Cardholder name is required.';
  } else if (trimmedName.length < 3) {
    errors.cardholderName = 'Please enter full legal cardholder name.';
  }

  // 2. Card Number
  const cleanedCard = data.cardNumber.replace(/[\s-•]/g, '');
  if (!cleanedCard) {
    errors.cardNumber = 'Card number is required.';
  } else if (!/^\d{15,19}$/.test(cleanedCard) && !data.cardNumber.includes('•••')) {
    errors.cardNumber = 'Card number must be 15 to 19 digits.';
  }

  // 3. Expiry
  const trimmedExpiry = data.cardExpiry.trim();
  if (!trimmedExpiry) {
    errors.cardExpiry = 'Expiry is required (MM/YY).';
  } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(trimmedExpiry)) {
    errors.cardExpiry = 'Format must be MM/YY.';
  }

  // 4. CVC
  const cleanedCvc = data.cardCvc.trim();
  if (!cleanedCvc) {
    errors.cardCvc = 'CVC code is required.';
  } else if (!/^\d{3,4}$/.test(cleanedCvc)) {
    errors.cardCvc = 'CVC must be 3 or 4 digits.';
  }

  // 5. Billing Street Address
  const trimmedStreet = data.streetAddress.trim();
  if (!trimmedStreet) {
    errors.streetAddress = 'Street address is required.';
  } else if (trimmedStreet.length < 5) {
    errors.streetAddress = 'Please provide full street number and street name.';
  }

  // 6. City
  const trimmedCity = data.city.trim();
  if (!trimmedCity) {
    errors.city = 'City is required.';
  } else if (trimmedCity.length < 2) {
    errors.city = 'Please enter a valid city name.';
  }

  // 7. State / Province
  const trimmedState = data.state.trim();
  if (!trimmedState) {
    errors.state = 'State or province is required.';
  } else if (trimmedState.length < 2) {
    errors.state = 'Please enter state or province.';
  }

  // 8. Zip / Postal Code
  const trimmedZip = data.zipCode.trim();
  if (!trimmedZip) {
    errors.zipCode = 'Zip or postal code is required.';
  } else if (trimmedZip.length < 3 || trimmedZip.length > 12) {
    errors.zipCode = 'Please enter a valid zip or postal code.';
  }

  // 9. Country
  const trimmedCountry = data.country.trim();
  if (!trimmedCountry) {
    errors.country = 'Please select a country.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Server-side simulated API endpoint: /api/memberships/checkout
 * Validates billing address payload and provisions subscriber & transaction records
 */
export async function simulateServerCheckoutApi(params: {
  userId: string;
  userName: string;
  userEmail: string;
  tier: MembershipTier;
  formData: CardPaymentFormData;
  paymentMethod?: PaymentMethod;
}): Promise<{
  success: boolean;
  message: string;
  subscriber?: MembershipSubscriber;
  transaction?: TransactionRecord;
  errors?: ValidationErrors;
}> {
  // Simulate network latency (300ms)
  await new Promise((resolve) => setTimeout(resolve, 350));

  const validation = validatePaymentAndBilling(params.formData);
  if (!validation.isValid) {
    return {
      success: false,
      message: 'Validation failed on server: billing address or card data is incomplete.',
      errors: validation.errors,
    };
  }

  const billingAddress: BillingAddress = {
    streetAddress: params.formData.streetAddress.trim(),
    city: params.formData.city.trim(),
    state: params.formData.state.trim().toUpperCase(),
    zipCode: params.formData.zipCode.trim(),
    country: params.formData.country.trim(),
  };

  const invoiceNum = `INV-SWB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const txnId = `TXN-STR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const cardDigits = params.formData.cardNumber.replace(/\D/g, '').slice(-4) || '9821';

  const transaction: TransactionRecord = {
    id: `tx-${Date.now().toString().slice(-4)}`,
    invoiceNumber: invoiceNum,
    userId: params.userId,
    userName: params.userName,
    tierId: params.tier.id,
    tierName: params.tier.name,
    amount: params.tier.price,
    currency: 'USD',
    paymentMethod: params.paymentMethod || 'STRIPE_CARD',
    status: 'COMPLETED',
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    receiptUrl: `#receipt-${invoiceNum}`,
    txHash: `ch_${Date.now().toString(36)}`,
    billingAddress,
    cardLast4: cardDigits,
  };

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);

  const subscriber: MembershipSubscriber = {
    id: `sub-${Date.now().toString().slice(-4)}`,
    userId: params.userId,
    name: params.formData.cardholderName.trim() || params.userName,
    email: params.userEmail,
    membershipTierId: params.tier.id,
    membershipTierName: params.tier.name,
    paymentStatus: 'ACTIVE',
    dateJoined: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    amountPaid: params.tier.price,
    currency: 'USD',
    paymentMethod: params.paymentMethod || 'STRIPE_CARD',
    transactionId: txnId,
    billingAddress,
    lastRenewalDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    nextBillingDate: nextYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    cardLast4: cardDigits,
    assignedBroker: params.tier.dedicatedBroker ? 'Julian Mercer (Managing Director)' : 'Sterling Desk Underwriting',
  };

  return {
    success: true,
    message: 'Payment authorized and subscriber record provisioned successfully.',
    subscriber,
    transaction,
  };
}
