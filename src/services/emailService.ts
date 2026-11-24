import {
  EmailAutomationConfig,
  EmailEventType,
  EmailNotificationLog,
} from '../types';
import { phpApi } from './phpApiService';

const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildEmailTemplate = (
  eventType: EmailEventType,
  recipientName: string,
  vars: Record<string, string>,
  config: EmailAutomationConfig
): { subject: string; bodyHtml: string; bodyText: string } => {
  const brand = escapeHtml(vars.brandName || config.fromName || 'Sterling Wealth Broker');
  const safeName = escapeHtml(recipientName || 'Valued Member');
  const supportEmail = escapeHtml(config.replyToEmail || 'support-broker@consultant.com');
  const year = new Date().getFullYear();

  let subject = `Notification from ${config.fromName || 'Sterling Wealth Broker'}`;
  let heading = 'Institutional Notification';
  let badge = 'AUTOMATED NOTICE';
  let accentColor = '#10b981';
  let bodyContent = '';
  let bodyText = '';

  switch (eventType) {
    case 'EMAIL_OTP_VERIFICATION': {
      const otpCode = escapeHtml(vars.otpCode || '000000');
      const tierName = escapeHtml(vars.tierName || 'Gold Executive');
      subject = `${vars.otpCode || '000000'} is your verification code — ${config.fromName}`;
      heading = 'Verify Your Email Address';
      badge = 'SECURITY VERIFICATION';
      bodyContent = `
        <p>Hello ${safeName},</p>
        <p>Thank you for starting your institutional membership enrollment (<strong>${tierName}</strong>). Enter this 6-digit verification code to verify your email address:</p>
        <div style="margin:22px 0;padding:18px;background:#0f172a;border:1px solid #10b981;border-radius:10px;text-align:center;">
          <span style="font-family:monospace;font-size:30px;letter-spacing:8px;font-weight:bold;color:#34d399;">${otpCode}</span>
        </div>
        <p style="font-size:12px;color:#64748b;">This code expires in 15 minutes.</p>
      `;
      bodyText = `Hello ${recipientName}, your 6-digit verification code is ${vars.otpCode || '000000'}.`;
      break;
    }

    case 'WELCOME_REGISTRATION': {
      const regId = escapeHtml(vars.registrationId || 'REG-PENDING');
      const tierName = escapeHtml(vars.tierName || 'Gold Executive');
      subject = `Welcome to ${config.fromName} — Application ${vars.registrationId || 'Received'}`;
      heading = 'Membership Registration Received';
      badge = 'ONBOARDING DESK';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>Your membership enrollment for <strong>${tierName}</strong> (Reference: <code>${regId}</code>) has been logged for Compliance &amp; KYC review.</p>
        <div style="margin:18px 0;padding:14px;background:#f1f5f9;border-left:4px solid #10b981;border-radius:6px;font-size:13px;">
          <strong>Reference ID:</strong> ${regId}<br/>
          <strong>Selected Package:</strong> ${tierName}<br/>
          <strong>Status:</strong> Under Compliance Review
        </div>
      `;
      bodyText = `Registration ${vars.registrationId || ''} for ${vars.tierName || ''} received and queued for KYC verification.`;
      break;
    }

    case 'KYC_APPROVED': {
      const regId = escapeHtml(vars.registrationId || 'VERIFIED');
      const tierName = escapeHtml(vars.tierName || 'Gold Executive');
      const reviewer = escapeHtml(vars.reviewedBy || 'Compliance Desk');
      subject = `KYC & Account Approved — Welcome to ${config.fromName}`;
      heading = 'Identity & Account Approved';
      badge = 'KYC VERIFIED';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>Your KYC identity verification (<strong>${regId}</strong>) has been approved by <strong>${reviewer}</strong>.</p>
        <p>Your <strong>${tierName}</strong> client portal is now unlocked and active.</p>
      `;
      bodyText = `Your KYC dossier (${vars.registrationId || ''}) has been approved by ${vars.reviewedBy || 'Compliance Desk'}.`;
      break;
    }

    case 'KYC_REJECTED': {
      const regId = escapeHtml(vars.registrationId || 'REG');
      const reason = escapeHtml(vars.reason || 'Updated identification document required.');
      subject = `Action Required: KYC Re-submission Needed (${vars.registrationId || ''})`;
      heading = 'KYC Documentation Action Required';
      badge = 'COMPLIANCE NOTICE';
      accentColor = '#f43f5e';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>Our compliance officer reviewed your submission (<strong>${regId}</strong>) and requires updated KYC documentation:</p>
        <div style="margin:18px 0;padding:14px;background:#fff1f2;border-left:4px solid #f43f5e;border-radius:6px;color:#881337;font-size:13px;">
          <strong>Note:</strong> ${reason}
        </div>
      `;
      bodyText = `KYC action required for ${vars.registrationId || ''}: ${vars.reason || ''}`;
      break;
    }

    case 'TIER_PAYMENT_SUBMITTED': {
      const reqId = escapeHtml(vars.requestId || 'REQ-PENDING');
      const tierName = escapeHtml(vars.tierName || 'Gold Executive');
      const amount = escapeHtml(vars.amount || '$0.00');
      const method = escapeHtml(vars.paymentMethod || 'BANK_WIRE');
      const careAgent = escapeHtml(vars.careAgent || 'Jeff Campbell');
      const careEmail = escapeHtml(vars.careEmail || 'jeff@sterlingwealthbroker.com');
      subject = `Payment Receipt Logged [${vars.requestId || 'PENDING'}] — ${vars.tierName || 'Tier'}`;
      heading = 'Membership Settlement Pending Verification';
      badge = 'ESCROW VERIFICATION';
      accentColor = '#f59e0b';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>We received your settlement submission for <strong>${tierName}</strong> (${amount} via ${method}).</p>
        <div style="margin:18px 0;padding:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;">
          <strong>Request ID:</strong> ${reqId}<br/>
          <strong>Package:</strong> ${tierName}<br/>
          <strong>Amount:</strong> ${amount}<br/>
          <strong>Assigned Care Agent:</strong> ${careAgent} (${careEmail})
        </div>
      `;
      bodyText = `Payment receipt logged (${vars.requestId || ''}) for ${vars.tierName || ''} (${vars.amount || ''}).`;
      break;
    }

    case 'TIER_UPGRADE_APPROVED': {
      const tierName = escapeHtml(vars.tierName || 'Gold Executive');
      const reqId = escapeHtml(vars.requestId || 'ACTIVE');
      const agent = escapeHtml(vars.agentName || 'Treasury Desk');
      subject = `Membership Activated: ${vars.tierName || 'Tier'} [${vars.requestId || 'ACTIVE'}]`;
      heading = 'Membership Tier Activated';
      badge = 'TIER ACTIVE';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>Your settlement (<strong>${reqId}</strong>) has been verified by <strong>${agent}</strong> and your membership is now active on <strong>${tierName}</strong>.</p>
      `;
      bodyText = `Membership upgraded and activated to ${vars.tierName || ''} (${vars.requestId || ''}).`;
      break;
    }

    case 'TIER_UPGRADE_REJECTED': {
      const tierName = escapeHtml(vars.tierName || 'Requested Tier');
      const reqId = escapeHtml(vars.requestId || 'REQ');
      const reason = escapeHtml(vars.reason || 'Payment proof could not be verified.');
      subject = `Payment Verification Issue [${vars.requestId || 'REQ'}] — Action Required`;
      heading = 'Settlement Proof Requires Attention';
      badge = 'VERIFICATION DECLINED';
      accentColor = '#f43f5e';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>Our treasury desk could not verify your settlement proof for <strong>${tierName}</strong> (${reqId}):</p>
        <div style="margin:18px 0;padding:14px;background:#fff1f2;border-left:4px solid #f43f5e;border-radius:6px;color:#881337;font-size:13px;">
          <strong>Reason:</strong> ${reason}
        </div>
      `;
      bodyText = `Settlement proof rejected for ${vars.requestId || ''}: ${vars.reason || ''}`;
      break;
    }

    case 'LOAN_APPLICATION_SUBMITTED': {
      const appNum = escapeHtml(vars.applicationNumber || 'SWB-NEW');
      const instrument = escapeHtml(vars.instrumentTitle || 'Credit Facility');
      const amount = escapeHtml(vars.requestedAmount || '$0');
      subject = `Loan Application Received [${vars.applicationNumber || 'SWB'}] — ${vars.instrumentTitle || ''}`;
      heading = 'Credit Facility Application Logged';
      badge = 'UNDERWRITING QUEUE';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>Your loan application <strong>${appNum}</strong> has been submitted to our underwriting desk.</p>
        <div style="margin:18px 0;padding:14px;background:#f1f5f9;border-left:4px solid #10b981;border-radius:6px;font-size:13px;">
          <strong>Reference:</strong> ${appNum}<br/>
          <strong>Instrument:</strong> ${instrument}<br/>
          <strong>Requested Facility:</strong> ${amount}
        </div>
      `;
      bodyText = `Loan application ${vars.applicationNumber || ''} for ${vars.requestedAmount || ''} received.`;
      break;
    }

    case 'LOAN_STATUS_UPDATED': {
      const appNum = escapeHtml(vars.applicationNumber || 'SWB');
      const status = escapeHtml(vars.status || 'UNDER_REVIEW');
      const partner = escapeHtml(vars.partnerBank || 'Syndicate Lending Desk');
      const note = escapeHtml(vars.note || 'Your application status has changed.');
      subject = `Loan Update [${vars.applicationNumber || ''}]: Status Changed to ${vars.status || ''}`;
      heading = 'Loan Application Status Update';
      badge = 'PIPELINE UPDATE';
      accentColor = vars.status === 'REJECTED' ? '#f43f5e' : '#10b981';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>Application <strong>${appNum}</strong> updated to <strong>${status}</strong> (${partner}).</p>
        <div style="margin:18px 0;padding:14px;background:#f8fafc;border-left:4px solid ${accentColor};border-radius:6px;font-size:13px;">
          <strong>Underwriter Note:</strong> ${note}
        </div>
      `;
      bodyText = `Loan ${vars.applicationNumber || ''} updated to ${vars.status || ''} (${vars.partnerBank || ''}).`;
      break;
    }

    case 'CONTACT_INQUIRY':
    case 'CONTACT_INQUIRY_DESK': {
      const inqNum = escapeHtml(vars.inquiryNumber || 'INQ-NEW');
      const product = escapeHtml(vars.productType || 'Underwriting Inquiry');
      const capital = escapeHtml(vars.capitalNeeded || 'Not Specified');
      subject = `[${vars.inquiryNumber || 'INQ'}] ${eventType === 'CONTACT_INQUIRY_DESK' ? 'New Contact Desk Inquiry' : 'Inquiry Acknowledgement'} — ${config.fromName}`;
      heading = eventType === 'CONTACT_INQUIRY_DESK' ? 'New Contact Inquiry Routed' : 'Inquiry Received';
      badge = 'SYNDICATE INQUIRY';
      bodyContent = `
        <p>Dear ${safeName},</p>
        <p>Inquiry <strong>${inqNum}</strong> for <strong>${product}</strong> (${capital}) has been logged and routed to <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      `;
      bodyText = `Inquiry ${vars.inquiryNumber || ''} for ${vars.productType || ''} logged.`;
      break;
    }

    default: {
      const customMsg = escapeHtml(vars.message || 'Automated notification verification test.');
      subject = vars.subject || `Automated Email Test — ${config.fromName}`;
      heading = escapeHtml(vars.heading || 'Automated Email Verification');
      badge = 'SYSTEM TEST';
      bodyContent = `<p>Hello ${safeName},</p><p>${customMsg}</p>`;
      bodyText = vars.message || 'Automated notification verification test.';
      break;
    }
  }

  const bodyHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
    <div style="background:#020617;color:#ffffff;padding:22px 26px;border-bottom:3px solid ${accentColor};">
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${accentColor};font-weight:bold;margin-bottom:6px;">${badge}</div>
      <div style="font-size:20px;font-weight:bold;color:#ffffff;">${brand}</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:4px;">${heading}</div>
    </div>
    <div style="padding:26px;font-size:14px;line-height:1.65;color:#1e293b;">
      ${bodyContent}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px;" />
      <p style="font-size:12px;color:#64748b;margin:0;">
        Support Desk: ${supportEmail}<br/>
        &copy; ${year} ${brand}
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, bodyHtml, bodyText };
};

export const dispatchAutomatedEmail = async (params: {
  eventType: EmailEventType;
  recipientEmail: string;
  recipientName: string;
  variables?: Record<string, string>;
  relatedEntityId?: string;
  config: EmailAutomationConfig;
  forceTest?: boolean;
}): Promise<EmailNotificationLog | null> => {
  const {
    eventType,
    recipientEmail,
    recipientName,
    variables = {},
    relatedEntityId,
    config,
    forceTest = false,
  } = params;

  if (!config.enabled && !forceTest) {
    return null;
  }

  const triggerKey = eventType as keyof EmailAutomationConfig['triggers'];
  if (!forceTest && triggerKey in config.triggers && !config.triggers[triggerKey]) {
    return null;
  }

  if (!recipientEmail || !recipientEmail.includes('@')) {
    return null;
  }

  const tpl = buildEmailTemplate(eventType, recipientName, variables, config);
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Attempt live cPanel PHP delivery if backend is running
  const apiRes = forceTest
    ? await phpApi.sendTestEmail(recipientEmail, recipientName, variables.message)
    : await phpApi.sendEmailNotification({
        eventType,
        recipientEmail,
        recipientName,
        variables,
        relatedEntityId,
        subject: tpl.subject,
        htmlBody: tpl.bodyHtml,
      });

  const dispatched = Boolean(apiRes?.notification?.dispatched);
  const status: EmailNotificationLog['status'] = apiRes
    ? dispatched
      ? 'SENT'
      : 'FAILED'
    : 'QUEUED_LOCAL';

  return {
    id: apiRes?.notification?.logId || `mail-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    eventType,
    recipientEmail,
    recipientName,
    subject: apiRes?.notification?.subject || tpl.subject,
    bodyHtml: tpl.bodyHtml,
    bodyText: tpl.bodyText,
    status,
    transport: apiRes?.notification?.transport || `${config.driver} (browser-preview)`,
    errorMessage: apiRes?.notification?.error || undefined,
    relatedEntityId,
    sentAt: apiRes?.notification?.sentAt || nowStr,
  };
};
