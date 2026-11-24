import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sliders,
  Server,
  BellRing,
  Search,
  Lock,
  EyeOff,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';
import { EmailAutomationConfig, EmailEventType, EmailNotificationLog } from '../../types';
import { phpApi } from '../../services/phpApiService';

type EmailDeskSubTab = 'OUTBOX' | 'TRIGGERS' | 'SMTP_CONFIG';

interface TriggerMeta {
  key: keyof EmailAutomationConfig['triggers'];
  label: string;
  recipient: string;
  description: string;
}

const TRIGGER_DEFINITIONS: TriggerMeta[] = [
  {
    key: 'EMAIL_OTP_VERIFICATION',
    label: 'Registration OTP Verification',
    recipient: 'New Applicant',
    description: 'Sends a 6-digit security verification code when a client registers or requests an OTP resend.',
  },
  {
    key: 'WELCOME_REGISTRATION',
    label: 'Onboarding Welcome & Desk Alert',
    recipient: 'New Member & Admin Alert',
    description: 'Confirms completed registration/email verification and alerts the compliance desk of new sign-ups.',
  },
  {
    key: 'KYC_APPROVED',
    label: 'KYC & Account Approval',
    recipient: 'Client Member',
    description: 'Notifies applicants immediately when their identity dossier or vault document is verified.',
  },
  {
    key: 'KYC_REJECTED',
    label: 'KYC Rejection / Re-submission Notice',
    recipient: 'Client Member',
    description: 'Delivers compliance review notes when an identity or vault document requires re-submission.',
  },
  {
    key: 'TIER_PAYMENT_SUBMITTED',
    label: 'Tier Payment Receipt & Agent Notice',
    recipient: 'Client & Care Agent',
    description: 'Logs checkout/wire proof receipt to the member and dispatches an instant verification alert to the assigned agent.',
  },
  {
    key: 'TIER_UPGRADE_APPROVED',
    label: 'Membership Tier Activated',
    recipient: 'Client Member',
    description: 'Confirms manual admin verification of payment and unlocks upgraded borrowing ceilings.',
  },
  {
    key: 'TIER_UPGRADE_REJECTED',
    label: 'Tier Payment Verification Declined',
    recipient: 'Client Member',
    description: 'Informs the subscriber with the admin review reason if settlement proof could not be cleared.',
  },
  {
    key: 'LOAN_APPLICATION_SUBMITTED',
    label: 'Loan Application Logged',
    recipient: 'Borrower',
    description: 'Dispatches an application reference summary when a client submits a new syndicated credit request.',
  },
  {
    key: 'LOAN_STATUS_UPDATED',
    label: 'Loan Pipeline Status Update',
    recipient: 'Borrower',
    description: 'Sends real-time status notifications whenever underwriters move an application across pipeline stages.',
  },
  {
    key: 'CONTACT_INQUIRY',
    label: 'Contact Desk Inquiry & Acknowledgement',
    recipient: 'Support Desk & Sender',
    description: 'Routes confidential website inquiries to the support email and sends an instant confirmation receipt.',
  },
];

const EVENT_LABELS: Record<EmailEventType, string> = {
  EMAIL_OTP_VERIFICATION: 'OTP Code',
  WELCOME_REGISTRATION: 'Welcome / Onboarding',
  KYC_APPROVED: 'KYC Approved',
  KYC_REJECTED: 'KYC Action Needed',
  TIER_PAYMENT_SUBMITTED: 'Payment Logged',
  TIER_UPGRADE_APPROVED: 'Tier Activated',
  TIER_UPGRADE_REJECTED: 'Payment Declined',
  LOAN_APPLICATION_SUBMITTED: 'Loan Submitted',
  LOAN_STATUS_UPDATED: 'Loan Status Update',
  CONTACT_INQUIRY: 'Inquiry Receipt',
  CONTACT_INQUIRY_DESK: 'Inquiry Desk Alert',
  CUSTOM_TEST: 'System Test',
};

export const AdminEmailNotifications: React.FC = () => {
  const {
    emailConfig,
    emailLogs,
    updateEmailConfig,
    resetEmailConfig,
    clearEmailLogs,
    syncEmailLogsFromServer,
    sendTestEmail,
    triggerToast,
  } = useBroker();

  const [subTab, setSubTab] = useState<EmailDeskSubTab>('OUTBOX');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [previewLog, setPreviewLog] = useState<EmailNotificationLog | null>(null);
  const [previewMode, setPreviewMode] = useState<'HTML' | 'TEXT'>('HTML');
  const [isSyncing, setIsSyncing] = useState(false);

  // SMTP & Sender form state
  const [formConfig, setFormConfig] = useState<EmailAutomationConfig>(emailConfig);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Test email state
  const [testEmailAddress, setTestEmailAddress] = useState(emailConfig.adminAlertEmail || 'support-broker@consultant.com');
  const [testRecipientName, setTestRecipientName] = useState('Brokerage Administrator');
  const [testMessage, setTestMessage] = useState(
    'Automated email notification verification from Sterling Wealth Broker Admin Console.'
  );
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    setFormConfig(emailConfig);
  }, [emailConfig]);

  // Attempt to hydrate server email config & MySQL logs when opening this desk on live cPanel
  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      try {
        const cfgRes = await phpApi.getEmailConfig();
        if (mounted && cfgRes?.success && cfgRes.config) {
          setFormConfig((prev) => ({
            ...prev,
            ...cfgRes.config,
            triggers: {
              ...prev.triggers,
              ...(cfgRes.config.triggers || {}),
            },
          }));
        }
        await syncEmailLogsFromServer();
      } catch {
        // running in preview mode without PHP server
      }
    };
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSyncLogs = async () => {
    setIsSyncing(true);
    try {
      const count = await syncEmailLogsFromServer();
      if (count > 0) {
        triggerToast('Outbox Synced', `Loaded ${count} email records from MySQL.`, 'success');
      } else {
        triggerToast(
          'Local Outbox Up to Date',
          'No live PHP/MySQL endpoint detected in preview mode; displaying local session logs.',
          'info'
        );
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      await updateEmailConfig({
        ...formConfig,
        smtpPort: Number(formConfig.smtpPort) || 465,
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleToggleMaster = async () => {
    const next = { ...emailConfig, enabled: !emailConfig.enabled };
    await updateEmailConfig(next);
  };

  const handleToggleTrigger = async (key: keyof EmailAutomationConfig['triggers']) => {
    const next: EmailAutomationConfig = {
      ...emailConfig,
      triggers: {
        ...emailConfig.triggers,
        [key]: !emailConfig.triggers[key],
      },
    };
    await updateEmailConfig(next);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
      triggerToast('Invalid Email', 'Enter a valid destination email address.', 'error');
      return;
    }
    setIsSendingTest(true);
    try {
      await sendTestEmail(testEmailAddress, testRecipientName, testMessage);
    } finally {
      setIsSendingTest(false);
    }
  };

  const filteredLogs = emailLogs.filter((log) => {
    const matchesEvent = eventFilter === 'ALL' || log.eventType === eventFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !q ||
      log.recipientEmail.toLowerCase().includes(q) ||
      log.recipientName.toLowerCase().includes(q) ||
      log.subject.toLowerCase().includes(q) ||
      (log.relatedEntityId || '').toLowerCase().includes(q);
    return matchesEvent && matchesQuery;
  });

  const sentCount = emailLogs.filter((l) => l.status === 'SENT').length;
  const previewCount = emailLogs.filter((l) => l.status === 'QUEUED_LOCAL').length;
  const failedCount = emailLogs.filter((l) => l.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-white">
                Automated Email Notification System
              </h2>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  emailConfig.enabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {emailConfig.enabled ? 'Automation Active' : 'Automation Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Transactional cPanel SMTP &amp; PHP mail() dispatch engine with HTML templates, MySQL delivery logs, and per-event triggers.
            </p>
          </div>
        </div>

        {/* Sub-tab Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('OUTBOX')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'OUTBOX'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Outbox &amp; Logs ({emailLogs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('TRIGGERS')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'TRIGGERS'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Event Triggers</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('SMTP_CONFIG')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'SMTP_CONFIG'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>SMTP &amp; Test Email</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Logged Notifications</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{emailLogs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Audit trail across lifecycle events</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Sent via cPanel Mailer</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{sentCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Confirmed server dispatch</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Preview / Local Queued</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{previewCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Inspectable HTML templates</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Delivery Errors</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">{failedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">SMTP / transport exceptions</div>
        </div>
      </div>

      {/* SUBTAB 1: OUTBOX & LOGS */}
      {subTab === 'OUTBOX' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search recipient, subject, or ID..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Event Types</option>
                {Object.entries(EVENT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSyncLogs}
                disabled={isSyncing}
                className="min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync MySQL Logs</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab('SMTP_CONFIG')}
                className="min-h-[38px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Email</span>
              </button>
              {emailLogs.length > 0 && (
                <button
                  type="button"
                  onClick={clearEmailLogs}
                  className="min-h-[38px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold text-rose-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-2">
              <Mail className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Automated Emails Logged Yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Register an account, approve/reject a tier upgrade or KYC filing, submit a loan, or send a test email to see live automated notifications logged here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Trigger Event</th>
                    <th className="py-3 px-3">Recipient</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Transport</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.sentAt}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium">
                          {EVENT_LABELS[log.eventType] || log.eventType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-white">{log.recipientName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{log.recipientEmail}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-200 max-w-xs truncate" title={log.subject}>
                        {log.subject}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.transport}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {log.status === 'SENT' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            SENT
                          </span>
                        ) : log.status === 'FAILED' ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-semibold"
                            title={log.errorMessage || 'Delivery failure'}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                            <Clock className="w-3 h-3" />
                            QUEUED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewLog(log);
                            setPreviewMode('HTML');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: AUTOMATED TRIGGERS */}
      {subTab === 'TRIGGERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Lifecycle Email Automation Rules</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enable or pause automated HTML email notifications for specific user and underwriting events.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleMaster}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                emailConfig.enabled
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-950 text-rose-300 border-rose-500/40'
              }`}
            >
              {emailConfig.enabled ? 'Master Switch: ENABLED' : 'Master Switch: PAUSED'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRIGGER_DEFINITIONS.map((trig) => {
              const isEnabled = emailConfig.triggers[trig.key];
              return (
                <div
                  key={trig.key}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                    isEnabled && emailConfig.enabled
                      ? 'bg-slate-950/90 border-slate-800'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{trig.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                        {trig.recipient}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{trig.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTrigger(trig.key)}
                    aria-label={`Toggle ${trig.label}`}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SMTP & TEST EMAIL */}
      {subTab === 'SMTP_CONFIG' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: cPanel SMTP / Mail Configuration */}
          <form
            onSubmit={handleSaveConfig}
            className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">cPanel SMTP &amp; Sender Settings</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure native PHP SMTP socket credentials (ports 465 SSL or 587 STARTTLS) or PHP mail().
                </p>
              </div>
              <button
                type="button"
                onClick={resetEmailConfig}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Mail Transport Driver</label>
                <select
                  value={formConfig.driver}
                  onChange={(e) =>
                    setFormConfig((p) => ({ ...p, driver: e.target.value as 'smtp' | 'mail' }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="smtp">cPanel SMTP Socket (Recommended)</option>
                  <option value="mail">Native PHP mail() Fallback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Sender Display Name</label>
                <input
                  type="text"
                  value={formConfig.fromName}
                  onChange={(e) => setFormConfig((p) => ({ ...p, fromName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">From Email</label>
                <input
                  type="email"
                  value={formConfig.fromEmail}
                  onChange={(e) => setFormConfig((p) => ({ ...p, fromEmail: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Reply-To Email</label>
                <input
                  type="email"
                  value={formConfig.replyToEmail}
                  onChange={(e) => setFormConfig((p) => ({ ...p, replyToEmail: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Alert Email</label>
                <input
                  type="email"
                  value={formConfig.adminAlertEmail}
                  onChange={(e) => setFormConfig((p) => ({ ...p, adminAlertEmail: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">SMTP Host</label>
                <input
                  type="text"
                  value={formConfig.smtpHost}
                  onChange={(e) => setFormConfig((p) => ({ ...p, smtpHost: e.target.value }))}
                  placeholder="mail.investproasset.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">SMTP Port</label>
                <input
                  type="number"
                  value={formConfig.smtpPort}
                  onChange={(e) => setFormConfig((p) => ({ ...p, smtpPort: Number(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Encryption</label>
                <select
                  value={formConfig.smtpEncryption}
                  onChange={(e) =>
                    setFormConfig((p) => ({
                      ...p,
                      smtpEncryption: e.target.value as 'ssl' | 'tls' | 'none',
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ssl">SSL / TLS (Port 465)</option>
                  <option value="tls">STARTTLS (Port 587)</option>
                  <option value="none">None (Port 25 / Relay)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">SMTP Username</label>
                <input
                  type="text"
                  value={formConfig.smtpUsername}
                  onChange={(e) => setFormConfig((p) => ({ ...p, smtpUsername: e.target.value }))}
                  placeholder="noreply@investproasset.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  SMTP Password
                </label>
                <div className="relative">
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    value={formConfig.smtpPassword || ''}
                    onChange={(e) => setFormConfig((p) => ({ ...p, smtpPassword: e.target.value }))}
                    placeholder="Enter cPanel mailbox password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Passwords saved to cPanel MySQL are masked when read back via API. You can also configure <code className="text-emerald-300">SMTP_HOST</code>, <code className="text-emerald-300">SMTP_USER</code>, and <code className="text-emerald-300">SMTP_PASS</code> in <code className="text-emerald-300">backend/.env</code>.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSavingConfig}
              className="w-full min-h-[44px] py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'Saving Configuration...' : 'Save SMTP & Email Settings'}</span>
            </button>
          </form>

          {/* Right: Send Test Email Panel */}
          <form
            onSubmit={handleSendTest}
            className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit"
          >
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <span>Send Test Notification Email</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify template rendering and cPanel SMTP / PHP mail() dispatch immediately.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Destination Email</label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Recipient Name</label>
              <input
                type="text"
                value={testRecipientName}
                onChange={(e) => setTestRecipientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Test Body Message</label>
              <textarea
                rows={4}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingTest}
              className="w-full min-h-[44px] py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingTest ? 'Dispatching Test Email...' : 'Dispatch Test Email'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Email HTML / Plain-text Preview Modal (Sandboxed Iframe) */}
      {previewLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">{previewLog.subject}</div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  To: {previewLog.recipientName} &lt;{previewLog.recipientEmail}&gt; · {previewLog.sentAt}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode('HTML')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    previewMode === 'HTML'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  HTML View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('TEXT')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    previewMode === 'TEXT'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Plain Text
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLog(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  aria-label="Close email preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 space-y-3">
              {previewLog.errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-mono">
                  Transport Note: {previewLog.errorMessage}
                </div>
              )}

              {previewMode === 'HTML' ? (
                <iframe
                  sandbox=""
                  srcDoc={previewLog.bodyHtml}
                  title="Email Notification HTML Preview"
                  className="w-full h-[460px] bg-white rounded-xl border border-slate-700"
                />
              ) : (
                <pre className="w-full h-[460px] overflow-auto p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap">
                  {previewLog.bodyText || 'No plain-text fallback available.'}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
