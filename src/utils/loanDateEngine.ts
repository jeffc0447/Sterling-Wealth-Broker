import { MembershipTier, MembershipTierId } from '../types';

export type BillingAnchorPreference = 'ANNIVERSARY' | 'FIRST_OF_MONTH' | 'FIFTEENTH_OF_MONTH';
export type MembershipCyclePeriod = 'month' | 'quarter' | 'year';

export interface TierDateProfile {
  tierId: MembershipTierId | string;
  tierName: string;
  underwritingHours: number;
  closingBusinessDays: number;
  graceDaysToFirstPayment: number;
  slaSummary: string;
}

export interface AmortizationInstallment {
  installmentNumber: number;
  dueDateIso: string;
  dueDateFormatted: string;
  paymentAmount: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface TierLoanScheduleResult {
  tierId: string;
  tierName: string;
  slaSummary: string;
  baseApr: number;
  aprDiscount: number;
  effectiveApr: number;
  loanAmount: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  applicationDateIso: string;
  applicationDateFormatted: string;
  underwritingApprovalDateIso: string;
  underwritingApprovalDateFormatted: string;
  disbursementDateIso: string;
  disbursementDateFormatted: string;
  firstPaymentDateIso: string;
  firstPaymentDateFormatted: string;
  maturityDateIso: string;
  maturityDateFormatted: string;
  turnaroundBusinessDays: number;
  turnaroundCalendarDays: number;
  daysSavedVsBaseline: number;
  installments: AmortizationInstallment[];
}

export interface MembershipTimelineResult {
  memberSinceIso: string;
  memberSinceFormatted: string;
  termStartIso: string;
  termStartFormatted: string;
  renewalDateIso: string;
  renewalDateFormatted: string;
  cycle: MembershipCyclePeriod;
  totalCycleDays: number;
  elapsedDays: number;
  remainingDays: number;
  progressPercent: number;
  isExpired: boolean;
  isRenewalDueSoon: boolean;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Safely parse a date string (YYYY-MM-DD, ISO, or "Month DD, YYYY") into a local midnight Date.
 */
export function parseFlexibleDate(input?: string | Date | null, fallbackDate?: Date): Date {
  const base = fallbackDate ? new Date(fallbackDate.getTime()) : new Date();
  base.setHours(0, 0, 0, 0);

  if (!input) return base;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return base;
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  const trimmed = String(input).trim();
  if (!trimmed) return base;

  // Strict YYYY-MM-DD match avoids UTC timezone shift
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]) - 1;
    const day = Number(ymd[3]);
    const parsed = new Date(year, month, day);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const parsedMs = Date.parse(trimmed);
  if (!Number.isNaN(parsedMs)) {
    const d = new Date(parsedMs);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return base;
}

export function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatShortDate(date: Date): string {
  return `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatLongDate(date: Date): string {
  return `${MONTH_NAMES_LONG[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Advance a date by N business days (skipping Saturdays and Sundays).
 * If businessDays === 0 and the start date falls on a weekend, shifts to next Monday.
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  // If starting on weekend, move to Monday first
  while (cursor.getDay() === 0 || cursor.getDay() === 6) {
    cursor.setDate(cursor.getDate() + 1);
  }

  let remaining = Math.max(0, Math.round(businessDays));
  while (remaining > 0) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }
  return cursor;
}

/**
 * Add N months while clamping end-of-month overflow cleanly (e.g. Jan 31 + 1m -> Feb 28/29).
 */
export function addMonthsClamped(startDate: Date, months: number, targetDayOverride?: number): Date {
  const desiredDay = targetDayOverride ?? startDate.getDate();
  const rawMonthIndex = startDate.getMonth() + months;
  const targetYear = startDate.getFullYear() + Math.floor(rawMonthIndex / 12);
  const targetMonth = ((rawMonthIndex % 12) + 12) % 12;

  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const clampedDay = Math.min(desiredDay, daysInTargetMonth);
  return new Date(targetYear, targetMonth, clampedDay);
}

export function calendarDaysBetween(startDate: Date, endDate: Date): number {
  const a = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const b = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.round((b - a) / 86400000);
}

export function businessDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  if (end <= start) return 0;

  let count = 0;
  const cursor = new Date(start.getTime());
  while (cursor < end) {
    cursor.setDate(cursor.getDate() + 1);
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) count += 1;
  }
  return count;
}

/**
 * Derive underwriting SLA hours and bank closing speed directly from a MembershipTier.
 */
export function getTierLoanDateProfile(tier: MembershipTier): TierDateProfile {
  const slaText = (tier.processingSLA || '').toLowerCase();

  let underwritingHours = 48;
  let closingBusinessDays = 4;

  if (slaText.includes('vip') || slaText.includes('immediate')) {
    underwritingHours = 4;
    closingBusinessDays = 1;
  } else {
    const hourMatch = /(\d+)\s*h(ou)?r/i.exec(slaText);
    const dayMatch = /(\d+)\s*day/i.exec(slaText);
    if (hourMatch) {
      underwritingHours = Math.max(2, Number(hourMatch[1]));
    } else if (dayMatch) {
      underwritingHours = Math.max(8, Number(dayMatch[1]) * 24);
    } else {
      switch (tier.id) {
        case 'diamond':
          underwritingHours = 4;
          break;
        case 'platinum':
          underwritingHours = 12;
          break;
        case 'gold':
          underwritingHours = 24;
          break;
        default:
          underwritingHours = 48;
          break;
      }
    }

    if (underwritingHours <= 6) closingBusinessDays = 1;
    else if (underwritingHours <= 16) closingBusinessDays = 2;
    else if (underwritingHours <= 30) closingBusinessDays = 3;
    else closingBusinessDays = 4;
  }

  return {
    tierId: tier.id,
    tierName: tier.name,
    underwritingHours,
    closingBusinessDays,
    graceDaysToFirstPayment: 30,
    slaSummary: tier.processingSLA || `${underwritingHours} Hours`,
  };
}

/**
 * Determine the first repayment date from disbursement and anchor preference.
 */
export function computeFirstPaymentDate(
  disbursementDate: Date,
  anchorPreference: BillingAnchorPreference = 'ANNIVERSARY',
  graceDays: number = 30
): Date {
  if (anchorPreference === 'FIRST_OF_MONTH') {
    const candidate = new Date(disbursementDate.getFullYear(), disbursementDate.getMonth() + 1, 1);
    if (calendarDaysBetween(disbursementDate, candidate) < 15) {
      return new Date(disbursementDate.getFullYear(), disbursementDate.getMonth() + 2, 1);
    }
    return candidate;
  }

  if (anchorPreference === 'FIFTEENTH_OF_MONTH') {
    const candidate = new Date(disbursementDate.getFullYear(), disbursementDate.getMonth() + 1, 15);
    if (calendarDaysBetween(disbursementDate, candidate) < 15) {
      return new Date(disbursementDate.getFullYear(), disbursementDate.getMonth() + 2, 15);
    }
    return candidate;
  }

  // Default: 1 month / ~30 days from disbursement
  const approx = new Date(disbursementDate.getFullYear(), disbursementDate.getMonth(), disbursementDate.getDate());
  if (graceDays !== 30) {
    approx.setDate(approx.getDate() + graceDays);
    return approx;
  }
  return addMonthsClamped(disbursementDate, 1);
}

/**
 * Full Tier-Based Loan Date & Amortization Calculation Engine.
 */
export function calculateTierLoanSchedule(params: {
  tier: MembershipTier;
  loanAmount: number;
  termMonths: number;
  applicationDate?: string | Date | null;
  baseApr?: number;
  anchorPreference?: BillingAnchorPreference;
  baselineTier?: MembershipTier | null;
}): TierLoanScheduleResult {
  const {
    tier,
    loanAmount,
    termMonths,
    applicationDate,
    baseApr = 7.75,
    anchorPreference = 'ANNIVERSARY',
    baselineTier,
  } = params;

  const safePrincipal = Math.max(1000, Number(loanAmount) || 1000);
  const safeTerm = Math.max(1, Math.round(Number(termMonths) || 12));
  const intakeDate = parseFlexibleDate(applicationDate);

  const profile = getTierLoanDateProfile(tier);
  // Convert underwriting hours into business days (12h or less = same/next business day -> 1 day; 24h -> 1 day; 48h -> 2 days)
  const underwritingBusinessDays =
    profile.underwritingHours <= 6 ? 0 : Math.max(1, Math.ceil(profile.underwritingHours / 24));

  const underwritingDate = addBusinessDays(intakeDate, underwritingBusinessDays);
  const disbursementDate = addBusinessDays(underwritingDate, profile.closingBusinessDays);
  const firstPaymentDate = computeFirstPaymentDate(
    disbursementDate,
    anchorPreference,
    profile.graceDaysToFirstPayment
  );

  const anchorDay =
    anchorPreference === 'FIRST_OF_MONTH'
      ? 1
      : anchorPreference === 'FIFTEENTH_OF_MONTH'
      ? 15
      : firstPaymentDate.getDate();

  const maturityDate = addMonthsClamped(firstPaymentDate, safeTerm - 1, anchorDay);

  // Financial math with tier APR discount
  const effectiveApr = Number(Math.max(3.95, baseApr - (tier.aprDiscount || 0)).toFixed(2));
  const monthlyRate = effectiveApr / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, safeTerm);
  const rawMonthlyPayment =
    monthlyRate > 0 ? (safePrincipal * (monthlyRate * factor)) / (factor - 1) : safePrincipal / safeTerm;

  let remainingBalance = safePrincipal;
  let totalInterestAccrued = 0;
  let totalPaidAccrued = 0;
  const installments: AmortizationInstallment[] = [];

  for (let i = 1; i <= safeTerm; i++) {
    const dueDate = i === 1 ? firstPaymentDate : addMonthsClamped(firstPaymentDate, i - 1, anchorDay);
    const interest = remainingBalance * monthlyRate;
    let principalPortion = rawMonthlyPayment - interest;
    let paymentThisMonth = rawMonthlyPayment;

    if (i === safeTerm || principalPortion > remainingBalance) {
      principalPortion = remainingBalance;
      paymentThisMonth = principalPortion + interest;
      remainingBalance = 0;
    } else {
      remainingBalance = Math.max(0, remainingBalance - principalPortion);
    }

    totalInterestAccrued += interest;
    totalPaidAccrued += paymentThisMonth;

    installments.push({
      installmentNumber: i,
      dueDateIso: toIsoDateString(dueDate),
      dueDateFormatted: formatShortDate(dueDate),
      paymentAmount: Math.round(paymentThisMonth),
      principalPaid: Math.round(principalPortion),
      interestPaid: Math.round(interest),
      remainingBalance: Math.round(remainingBalance),
    });
  }

  const turnaroundCalendarDays = Math.max(0, calendarDaysBetween(intakeDate, disbursementDate));
  const turnaroundBusinessDays = Math.max(0, businessDaysBetween(intakeDate, disbursementDate));

  // Compare funding speed against baseline (e.g. Silver 48h + 4 closing days = 6 business days)
  let baselineCalendarDays = turnaroundCalendarDays;
  if (baselineTier && baselineTier.id !== tier.id) {
    const baseProfile = getTierLoanDateProfile(baselineTier);
    const baseUwDays =
      baseProfile.underwritingHours <= 6 ? 0 : Math.max(1, Math.ceil(baseProfile.underwritingHours / 24));
    const baseDisbursement = addBusinessDays(
      addBusinessDays(intakeDate, baseUwDays),
      baseProfile.closingBusinessDays
    );
    baselineCalendarDays = Math.max(0, calendarDaysBetween(intakeDate, baseDisbursement));
  } else if (!baselineTier && tier.id !== 'silver') {
    const defaultSilverEnd = addBusinessDays(addBusinessDays(intakeDate, 2), 4);
    baselineCalendarDays = Math.max(0, calendarDaysBetween(intakeDate, defaultSilverEnd));
  }

  return {
    tierId: tier.id,
    tierName: tier.name,
    slaSummary: profile.slaSummary,
    baseApr,
    aprDiscount: tier.aprDiscount || 0,
    effectiveApr,
    loanAmount: safePrincipal,
    termMonths: safeTerm,
    monthlyPayment: Math.round(rawMonthlyPayment),
    totalInterest: Math.round(totalInterestAccrued),
    totalRepayment: Math.round(totalPaidAccrued),
    applicationDateIso: toIsoDateString(intakeDate),
    applicationDateFormatted: formatShortDate(intakeDate),
    underwritingApprovalDateIso: toIsoDateString(underwritingDate),
    underwritingApprovalDateFormatted: formatShortDate(underwritingDate),
    disbursementDateIso: toIsoDateString(disbursementDate),
    disbursementDateFormatted: formatShortDate(disbursementDate),
    firstPaymentDateIso: toIsoDateString(firstPaymentDate),
    firstPaymentDateFormatted: formatShortDate(firstPaymentDate),
    maturityDateIso: toIsoDateString(maturityDate),
    maturityDateFormatted: formatShortDate(maturityDate),
    turnaroundBusinessDays,
    turnaroundCalendarDays,
    daysSavedVsBaseline: Math.max(0, baselineCalendarDays - turnaroundCalendarDays),
    installments,
  };
}

/**
 * Infer membership cycle period from a MembershipTier or explicit cycle string.
 */
export function resolveMembershipCycle(
  explicitCycle?: MembershipCyclePeriod | null,
  tierPeriod?: MembershipTier['period'] | null
): MembershipCyclePeriod {
  if (explicitCycle === 'month' || explicitCycle === 'quarter' || explicitCycle === 'year') {
    return explicitCycle;
  }
  if (tierPeriod === 'month' || tierPeriod === 'quarter' || tierPeriod === 'year') {
    return tierPeriod;
  }
  return 'year';
}

export function calculateRenewalDateFromCycle(
  startDate: Date,
  cycle: MembershipCyclePeriod
): Date {
  const monthsToAdd = cycle === 'month' ? 1 : cycle === 'quarter' ? 3 : 12;
  return addMonthsClamped(startDate, monthsToAdd);
}

/**
 * Compute interactive Membership Date timeline & progress metrics for the user dashboard.
 */
export function calculateMembershipTimeline(params: {
  memberSince?: string | null;
  termStart?: string | null;
  renewalDate?: string | null;
  cycle?: MembershipCyclePeriod | null;
  tierPeriod?: MembershipTier['period'] | null;
  referenceDate?: Date;
}): MembershipTimelineResult {
  const today = parseFlexibleDate(params.referenceDate || new Date());
  const resolvedCycle = resolveMembershipCycle(params.cycle, params.tierPeriod);
  const memberSinceDate = parseFlexibleDate(params.memberSince, today);
  const termStartDate = parseFlexibleDate(params.termStart || params.memberSince, memberSinceDate);

  const renewalDate = params.renewalDate
    ? parseFlexibleDate(params.renewalDate)
    : calculateRenewalDateFromCycle(termStartDate, resolvedCycle);

  const totalCycleDays = Math.max(1, calendarDaysBetween(termStartDate, renewalDate));
  const rawElapsed = calendarDaysBetween(termStartDate, today);
  const elapsedDays = Math.max(0, Math.min(totalCycleDays, rawElapsed));
  const remainingDays = calendarDaysBetween(today, renewalDate);
  const progressPercent = Math.max(0, Math.min(100, Math.round((elapsedDays / totalCycleDays) * 100)));

  return {
    memberSinceIso: toIsoDateString(memberSinceDate),
    memberSinceFormatted: formatLongDate(memberSinceDate),
    termStartIso: toIsoDateString(termStartDate),
    termStartFormatted: formatLongDate(termStartDate),
    renewalDateIso: toIsoDateString(renewalDate),
    renewalDateFormatted: formatLongDate(renewalDate),
    cycle: resolvedCycle,
    totalCycleDays,
    elapsedDays,
    remainingDays,
    progressPercent,
    isExpired: remainingDays < 0,
    isRenewalDueSoon: remainingDays >= 0 && remainingDays <= 30,
  };
}
