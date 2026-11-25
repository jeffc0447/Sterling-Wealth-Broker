import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { SupportAndCryptoConfig, RegionalUnderwritingDesk, DirectVerifiedChannels } from '../../types';
import { DEFAULT_SUPPORT_CRYPTO_CONFIG } from '../../data/initialData';
import {
  UserCheck,
  Mail,
  Phone,
  Wallet,
  Save,
  Check,
  RefreshCw,
  Eye,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  QrCode,
  AlertCircle,
  Landmark,
  Building2,
  FileCheck2,
  Trash2,
  AlertTriangle,
  CreditCard,
  Coins,
  Power,
  Bell,
  X,
  Sliders,
  Globe2,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';

export const AdminSupportConfig: React.FC = () => {
  const { supportConfig, updateSupportConfig, resetSupportConfig, triggerToast } = useBroker();

  // Helper to ensure all domain emails end in @sterlingwealthbroker.com
  const enforceSterlingDomain = (email: string, fallbackUser: string): string => {
    const trimmed = (email || '').trim();
    if (!trimmed) return `${fallbackUser}@sterlingwealthbroker.com`;
    const userPart = trimmed.split('@')[0].trim();
    return `${userPart || fallbackUser}@sterlingwealthbroker.com`;
  };

  // Local form state initialized from context
  const [formData, setFormData] = useState<SupportAndCryptoConfig>({
    ...supportConfig,
    agentName: (supportConfig.agentName || 'Jeffery Dean').trim(),
    agentEmail: (supportConfig.agentEmail || 'jeffery@accountant.com').trim(),
    agentSecondaryEmail: (supportConfig.agentSecondaryEmail || 'jeffery@sterlingwealthbroker.com').trim(),
    walletAddresses: { ...supportConfig.walletAddresses },
    bankWire: { ...supportConfig.bankWire },
    enabledGateways: {
      card: supportConfig.enabledGateways?.card !== false,
      crypto: supportConfig.enabledGateways?.crypto !== false,
      wire: supportConfig.enabledGateways?.wire !== false,
    },
    gatewayInstructions: {
      card: supportConfig.gatewayInstructions?.card ?? (DEFAULT_SUPPORT_CRYPTO_CONFIG.gatewayInstructions?.card || ''),
      crypto: supportConfig.gatewayInstructions?.crypto ?? (DEFAULT_SUPPORT_CRYPTO_CONFIG.gatewayInstructions?.crypto || ''),
    },
    regionalDesks: supportConfig.regionalDesks && supportConfig.regionalDesks.length > 0
      ? supportConfig.regionalDesks.map(d => ({
          ...d,
          email: enforceSterlingDomain(d.email, 'desk'),
        }))
      : (DEFAULT_SUPPORT_CRYPTO_CONFIG.regionalDesks || []).map(d => ({ ...d })),
    directChannels: {
      tollFree: supportConfig.directChannels?.tollFree ?? (DEFAULT_SUPPORT_CRYPTO_CONFIG.directChannels?.tollFree || '+1 (800) 555-STERLING'),
      intakeEmail: enforceSterlingDomain(supportConfig.directChannels?.intakeEmail || '', 'syndicate'),
      hours: supportConfig.directChannels?.hours ?? (DEFAULT_SUPPORT_CRYPTO_CONFIG.directChannels?.hours || 'Monday – Friday: 24h Global'),
      underwritingDirectEmail: enforceSterlingDomain(supportConfig.directChannels?.underwritingDirectEmail || '', 'underwriting'),
    },
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'FORM' | 'PREVIEW'>('FORM');
  const [showResetModal, setShowResetModal] = useState(false);
  const [testPopupGateway, setTestPopupGateway] = useState<'card' | 'crypto' | null>(null);

  const handleDeskChange = (index: number, field: keyof RegionalUnderwritingDesk, value: string) => {
    const updated = [...(formData.regionalDesks || [])];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      setFormData({
        ...formData,
        regionalDesks: updated,
      });
    }
  };

  const handleAddDesk = () => {
    const newDesk: RegionalUnderwritingDesk = {
      id: `desk-${Date.now()}`,
      name: 'New Regional Underwriting Desk',
      badge: 'Regional Ops',
      address: 'Financial Center Tower, Suite 1200',
      phone: '+1 (800) 555-0100',
      email: 'regional.desk@sterlingwealthbroker.com',
      opsDetail: 'Commercial Underwriting & Syndication',
    };
    setFormData({
      ...formData,
      regionalDesks: [...(formData.regionalDesks || []), newDesk],
    });
  };

  const handleRemoveDesk = (index: number) => {
    const updated = [...(formData.regionalDesks || [])];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      regionalDesks: updated,
    });
  };

  const handleDirectChannelChange = (field: keyof DirectVerifiedChannels, value: string) => {
    setFormData({
      ...formData,
      directChannels: {
        tollFree: formData.directChannels?.tollFree || '+1 (800) 555-STERLING',
        intakeEmail: formData.directChannels?.intakeEmail || 'syndicate@sterlingwealthbroker.com',
        hours: formData.directChannels?.hours || 'Monday – Friday: 24h Global',
        underwritingDirectEmail: formData.directChannels?.underwritingDirectEmail || 'underwriting@sterlingwealthbroker.com',
        ...formData.directChannels,
        [field]: value,
      },
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedDesks = (formData.regionalDesks || []).map((d, idx) => ({
      ...d,
      email: enforceSterlingDomain(d.email, `desk.${idx + 1}`),
    }));
    const sanitizedDirectChannels = {
      tollFree: formData.directChannels?.tollFree?.trim() || '+1 (800) 555-STERLING',
      intakeEmail: enforceSterlingDomain(formData.directChannels?.intakeEmail || '', 'syndicate'),
      hours: formData.directChannels?.hours?.trim() || 'Monday – Friday: 24h Global',
      underwritingDirectEmail: enforceSterlingDomain(formData.directChannels?.underwritingDirectEmail || '', 'underwriting'),
    };
    const sanitizedAgentEmail = (formData.agentEmail || 'jeffery@accountant.com').trim();
    const sanitizedAgentSecondaryEmail = (formData.agentSecondaryEmail || 'jeffery@sterlingwealthbroker.com').trim();
    const sanitizedAgentName = (formData.agentName || 'Jeffery Dean').trim();

    const updatedConfig = {
      ...formData,
      agentName: sanitizedAgentName,
      agentEmail: sanitizedAgentEmail,
      agentSecondaryEmail: sanitizedAgentSecondaryEmail,
      regionalDesks: sanitizedDesks,
      directChannels: sanitizedDirectChannels,
    };

    setFormData(updatedConfig);
    updateSupportConfig(updatedConfig);
    setSavedSuccess(true);
    triggerToast('Configuration Saved', 'Assigned Customer Care Specialist, Regional Underwriting Desks, Direct Verified Channels, and payment gateways deployed.', 'success');
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset customer care representative, regional desks, bank wire, and crypto escrow addresses to system defaults?')) {
      setFormData(DEFAULT_SUPPORT_CRYPTO_CONFIG);
      updateSupportConfig(DEFAULT_SUPPORT_CRYPTO_CONFIG);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-semibold">
                Admin Configuration Desk
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-medium">Real-Time Sync</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Customer Service Agent & Crypto Gateway Desk
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Configure the exact customer service agent details (name, email, phone, instructions) that borrowers will see and contact as soon as their membership payment clears, and manage the official escrow deposit addresses for BTC, ETH, and USDC.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-rose-500/40"
              title="Delete custom config or erroneous wire coordinates"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete / Reset Config</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab(previewTab === 'FORM' ? 'PREVIEW' : 'FORM')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-amber-500/30"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{previewTab === 'FORM' ? 'Preview Client Post-Payment' : 'Back to Editor'}</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal for Resetting Support/Wire/Crypto Config */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">
                    Delete Custom Bank Wire & Agent Settings?
                  </h4>
                  <p className="text-xs text-rose-300">
                    Purge custom wire/crypto records created in error
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                This will delete any customized depository bank coordinates, crypto escrow addresses, or customer service agent data and restore the verified baseline (<strong className="text-white">Jeffery Dean / jeffery@accountant.com &amp; jeffery@sterlingwealthbroker.com</strong>).
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetSupportConfig();
                    setFormData(DEFAULT_SUPPORT_CRYPTO_CONFIG);
                    setShowResetModal(false);
                    setSavedSuccess(true);
                    triggerToast('Config Reset', 'Restored verified bank wire coordinates and customer care baseline.', 'info');
                    setTimeout(() => setSavedSuccess(false), 3000);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete & Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {savedSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Configuration deployed!</strong> The new customer service agent ({formData.agentName} · {formData.agentEmail}) and crypto addresses are live across all membership checkout modals.
            </span>
          </div>
        )}
      </div>

      {previewTab === 'FORM' ? (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 0: Payment Gateways Control & Popup Notification Desk */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-white text-base">
                      Payment Gateways & Pop-up Notification Instructions
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold">
                      Admin Gateways Desk
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enable or disable any checkout payment gateway option, and configure custom advisory instructions that will pop up whenever a member selects Credit Card or Cryptocurrency at checkout.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Real-Time Checkout Sync</span>
                </span>
              </div>
            </div>

            {/* Gateway 1: Credit Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        Credit Card Gateway (Stripe / Authorize.net)
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          formData.enabledGateways?.card
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {formData.enabledGateways?.card ? '● Active / Enabled' : '○ Offline / Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Instant 3D-Secure 2.0 and automated Address Verification System (AVS).
                    </p>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...formData,
                        enabledGateways: {
                          ...formData.enabledGateways!,
                          card: !formData.enabledGateways?.card,
                        },
                      };
                      setFormData(updated);
                      updateSupportConfig(updated);
                      triggerToast(
                        'Gateway Status Updated',
                        `Credit Card Gateway is now ${updated.enabledGateways.card ? 'Enabled' : 'Disabled'}.`,
                        updated.enabledGateways.card ? 'success' : 'warning'
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                      formData.enabledGateways?.card
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{formData.enabledGateways?.card ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>

              {/* Pop-up Notification Instructions for Credit Card */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Credit Card Pop-up Notification Instructions</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setTestPopupGateway('card')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Test Client Pop-up Modal</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.gatewayInstructions?.card || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gatewayInstructions: {
                        ...formData.gatewayInstructions!,
                        card: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter custom advisory text that pops up when a user clicks Credit Card at checkout..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  This custom advisory will automatically appear in a dedicated pop-up modal whenever a user selects the Credit Card payment option. Leave blank to disable pop-up for credit card.
                </span>
              </div>
            </div>

            {/* Gateway 2: Cryptocurrency */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        Cryptocurrency Gateway (BTC, Ethereum, USDT Tether)
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          formData.enabledGateways?.crypto
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {formData.enabledGateways?.crypto ? '● Active / Enabled' : '○ Offline / Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Multi-chain deposit escrow with real-time dynamic QR code generation.
                    </p>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...formData,
                        enabledGateways: {
                          ...formData.enabledGateways!,
                          crypto: !formData.enabledGateways?.crypto,
                        },
                      };
                      setFormData(updated);
                      updateSupportConfig(updated);
                      triggerToast(
                        'Gateway Status Updated',
                        `Cryptocurrency Gateway is now ${updated.enabledGateways.crypto ? 'Enabled' : 'Disabled'}.`,
                        updated.enabledGateways.crypto ? 'success' : 'warning'
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                      formData.enabledGateways?.crypto
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{formData.enabledGateways?.crypto ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>

              {/* Pop-up Notification Instructions for Crypto */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cryptocurrency Pop-up Notification Instructions</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setTestPopupGateway('crypto')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Test Client Pop-up Modal</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.gatewayInstructions?.crypto || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gatewayInstructions: {
                        ...formData.gatewayInstructions!,
                        crypto: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter custom advisory text that pops up when a user clicks Cryptocurrency at checkout..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  This custom advisory will automatically appear in a dedicated pop-up modal whenever a user selects the Cryptocurrency payment option. Leave blank to disable pop-up for crypto.
                </span>
              </div>
            </div>

            {/* Gateway 3: Bank Wire */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        Bank Wire Transfer Gateway (Fedwire / SWIFT)
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          formData.enabledGateways?.wire
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {formData.enabledGateways?.wire ? '● Active / Enabled' : '○ Offline / Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      High-limit institutional settlement with formal depository bank details and manual remittance audit.
                    </p>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...formData,
                        enabledGateways: {
                          ...formData.enabledGateways!,
                          wire: !formData.enabledGateways?.wire,
                        },
                      };
                      setFormData(updated);
                      updateSupportConfig(updated);
                      triggerToast(
                        'Gateway Status Updated',
                        `Bank Wire Gateway is now ${updated.enabledGateways.wire ? 'Enabled' : 'Disabled'}.`,
                        updated.enabledGateways.wire ? 'success' : 'warning'
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                      formData.enabledGateways?.wire
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{formData.enabledGateways?.wire ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Save All Gateway Settings Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  updateSupportConfig(formData);
                  triggerToast('Gateways Deployed', 'Payment gateway toggles and popup instructions deployed to client checkout.', 'success');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Deploy Gateway Configurations</span>
              </button>
            </div>
          </div>

          {/* Section 1: Customer Service Agent Provisioning */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-base">
                    Designated Customer Service Agent
                  </h3>
                  <p className="text-xs text-slate-400">
                    This contact is prominently shown to borrowers upon completing payment for immediate support.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Primary Contact</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Agent Full Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  placeholder="e.g. Jeffery Dean"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Specialist Email <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.agentEmail}
                  onChange={(e) => setFormData({ ...formData, agentEmail: e.target.value })}
                  placeholder="e.g. jeffery@accountant.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                  Displayed across all payment gateways &amp; dashboard
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secondary Specialist Email <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.agentSecondaryEmail || ''}
                  onChange={(e) => setFormData({ ...formData, agentSecondaryEmail: e.target.value })}
                  placeholder="e.g. jeffery@sterlingwealthbroker.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                  Co-displayed on all payment gateways &amp; dashboard
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Agent Title / Role
                </label>
                <input
                  type="text"
                  value={formData.agentTitle}
                  onChange={(e) => setFormData({ ...formData, agentTitle: e.target.value })}
                  placeholder="e.g. Senior Client Services Lead"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Direct Phone / Hotwire
                </label>
                <input
                  type="text"
                  value={formData.agentPhone}
                  onChange={(e) => setFormData({ ...formData, agentPhone: e.target.value })}
                  placeholder="e.g. +1 (800) 555-0199 Ext. 104"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telegram / Desk Channel
                </label>
                <input
                  type="text"
                  value={formData.telegramHandle}
                  onChange={(e) => setFormData({ ...formData, telegramHandle: e.target.value })}
                  placeholder="e.g. @SterlingSupportDesk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Post-Payment Custom Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Post-Payment Client Onboarding Instructions
              </label>
              <textarea
                rows={3}
                value={formData.postPaymentInstructions}
                onChange={(e) =>
                  setFormData({ ...formData, postPaymentInstructions: e.target.value })
                }
                placeholder="Instructions shown to the borrower immediately after payment..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                This exact paragraph appears on the client's confirmation card along with an auto-formatted 1-click email draft.
              </span>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSendConfirmationEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, autoSendConfirmationEmail: e.target.checked })
                  }
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Automatically dispatch electronic welcome receipt to user email address</span>
              </label>
            </div>
          </div>

          {/* Section: Regional Underwriting Desks & Direct Verified Channels (Contact Section Features) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-white text-base">
                      Regional Underwriting Desks & Direct Verified Channels
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-300 font-mono font-bold">
                      Contact Section Editor
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure official contact office addresses, phone numbers, and verified @sterlingwealthbroker.com email channels displayed on the Contact page.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Contact Feature Live Sync</span>
                </span>
              </div>
            </div>

            {/* Direct Verified Channels Panel */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Direct Verified Channels Configuration
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Domain Enforced: @sterlingwealthbroker.com
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Toll-Free Hotline Phone Number <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.directChannels?.tollFree || ''}
                    onChange={(e) => handleDirectChannelChange('tollFree', e.target.value)}
                    placeholder="e.g. +1 (800) 555-STERLING"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Institutional direct phone hotline
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    PGP Encrypted Intake Email <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.directChannels?.intakeEmail || ''}
                    onChange={(e) => handleDirectChannelChange('intakeEmail', e.target.value)}
                    placeholder="syndicate@sterlingwealthbroker.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    Must be @sterlingwealthbroker.com
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operating Hours Notice <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.directChannels?.hours || ''}
                    onChange={(e) => handleDirectChannelChange('hours', e.target.value)}
                    placeholder="e.g. Monday – Friday: 24h Global"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Underwriting schedule display
                  </span>
                </div>
              </div>
            </div>

            {/* Regional Underwriting Desks List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    Regional Underwriting Desks ({formData.regionalDesks?.length || 0})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Edit each physical desk's office address, direct telephone, and designated @sterlingwealthbroker.com email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDesk}
                  className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Regional Desk</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(formData.regionalDesks || []).map((desk, idx) => (
                  <div
                    key={desk.id || idx}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 relative group hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 font-mono text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {desk.name || `Regional Desk #${idx + 1}`}
                        </span>
                        {desk.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            {desk.badge}
                          </span>
                        )}
                      </div>

                      {(formData.regionalDesks?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDesk(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          title="Remove Desk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Desk Title & Region <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={desk.name}
                          onChange={(e) => handleDeskChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Canary Wharf Desk (London)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Jurisdiction / Badge Tag
                        </label>
                        <input
                          type="text"
                          value={desk.badge || ''}
                          onChange={(e) => handleDeskChange(idx, 'badge', e.target.value)}
                          placeholder="e.g. GMT Desks, EST Desks"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Direct Telephone <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={desk.phone}
                          onChange={(e) => handleDeskChange(idx, 'phone', e.target.value)}
                          placeholder="e.g. +44 20 7946 0912"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Office Street Address <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={desk.address}
                          onChange={(e) => handleDeskChange(idx, 'address', e.target.value)}
                          placeholder="e.g. One Canada Square, Canary Wharf, London E14 5AA"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Underwriting Desk Email <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={desk.email}
                          onChange={(e) => handleDeskChange(idx, 'email', e.target.value)}
                          placeholder="e.g. london.desk@sterlingwealthbroker.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                        />
                        <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                          Must be @sterlingwealthbroker.com
                        </span>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Desk Specialization / Ops Channel Note
                        </label>
                        <input
                          type="text"
                          value={desk.opsDetail || ''}
                          onChange={(e) => handleDeskChange(idx, 'opsDetail', e.target.value)}
                          placeholder="e.g. Direct SWIFT Ops, Corporate Credit, Growth & Tech"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>All edits update immediately on Contact and Underwriting views.</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const sanitizedDesks = (formData.regionalDesks || []).map((d, idx) => ({
                    ...d,
                    email: enforceSterlingDomain(d.email, `desk.${idx + 1}`),
                  }));
                  const sanitizedDirectChannels = {
                    tollFree: formData.directChannels?.tollFree?.trim() || '+1 (800) 555-STERLING',
                    intakeEmail: enforceSterlingDomain(formData.directChannels?.intakeEmail || '', 'syndicate'),
                    hours: formData.directChannels?.hours?.trim() || 'Monday – Friday: 24h Global',
                    underwritingDirectEmail: enforceSterlingDomain(formData.directChannels?.underwritingDirectEmail || '', 'underwriting'),
                  };
                  const updated = {
                    ...formData,
                    regionalDesks: sanitizedDesks,
                    directChannels: sanitizedDirectChannels,
                  };
                  setFormData(updated);
                  updateSupportConfig(updated);
                  triggerToast('Regional Desks Updated', 'Contact office addresses, phone numbers, and @sterlingwealthbroker.com emails are now live.', 'success');
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-600/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Regional Desks & Channels</span>
              </button>
            </div>
          </div>

          {/* Section 2: Cryptocurrency Escrow Wallet Addresses (Manual Admin Panel Application) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-white text-base">
                      Cryptocurrency Escrow Deposit Addresses
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                      Manual Admin Application
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Wallet addresses configured here are manually applied and immediately govern client checkout gateways (BTC, ETH, USDC, USDT, and SOL).
                  </p>
                </div>
              </div>

              {/* Master Apply All Button */}
              <button
                type="button"
                onClick={() => {
                  const now = new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const updated: SupportAndCryptoConfig = {
                    ...formData,
                    walletAddresses: {
                      ...formData.walletAddresses,
                      lastAppliedAt: now,
                      appliedByAdmin: 'Admin Desk (admin@admin.com)',
                    },
                  };
                  setFormData(updated);
                  updateSupportConfig(updated);
                  triggerToast(
                    'Manual Addresses Applied',
                    'All cryptocurrency escrow addresses have been applied to live client checkout gateways.',
                    'success'
                  );
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition shrink-0 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4 text-slate-950" />
                <span>Apply All Addresses to Client Checkout</span>
              </button>
            </div>

            {/* Audit & Transparency Bar */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-slate-300">
                  Status:{' '}
                  <strong className="text-emerald-400">
                    Live on Client Checkout Gateways
                  </strong>
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">
                  Last Applied:{' '}
                  <span className="text-slate-200 font-mono">
                    {formData.walletAddresses.lastAppliedAt || 'Active Baseline'}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manual Verification Enforced</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* 1. BTC Address */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">
                      Bitcoin (BTC) Manual Escrow Address
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                      Native SegWit / Taproot
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const updated = {
                        ...formData,
                        walletAddresses: {
                          ...formData.walletAddresses,
                          lastAppliedAt: now,
                          appliedByAdmin: 'Admin Desk',
                        },
                      };
                      setFormData(updated);
                      updateSupportConfig(updated);
                      triggerToast('BTC Address Applied', 'Bitcoin address updated on live client checkout.', 'success');
                    }}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply BTC Address</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.walletAddresses.btc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        walletAddresses: { ...formData.walletAddresses, btc: e.target.value.trim() },
                      })
                    }
                    placeholder="e.g. bc1q9v8h2p29k3n8d8w9s7z4m6r5t3x2q1y0v8h2p2"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono pr-20"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                    BTC Mainnet
                  </span>
                </div>
              </div>

              {/* 2. ETH Address */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400">
                      Ethereum (ETH) Manual Escrow Address
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      ERC-20 / Arbitrum / Base
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const updated = {
                        ...formData,
                        walletAddresses: {
                          ...formData.walletAddresses,
                          lastAppliedAt: now,
                          appliedByAdmin: 'Admin Desk',
                        },
                      };
                      setFormData(updated);
                      updateSupportConfig(updated);
                      triggerToast('ETH Address Applied', 'Ethereum address updated on live client checkout.', 'success');
                    }}
                    className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply ETH Address</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.walletAddresses.eth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        walletAddresses: { ...formData.walletAddresses, eth: e.target.value.trim() },
                      })
                    }
                    placeholder="e.g. 0x9B4E3879Fe414801127B08EAf94200Ce2C9271a9"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono pr-20"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                    EVM 0x
                  </span>
                </div>
              </div>

              {/* 3. USDC Address */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">
                      USD Coin (USDC) Manual Escrow Address
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      Polygon / Solana / ERC-20
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const updated = {
                        ...formData,
                        walletAddresses: {
                          ...formData.walletAddresses,
                          lastAppliedAt: now,
                          appliedByAdmin: 'Admin Desk',
                        },
                      };
                      setFormData(updated);
                      updateSupportConfig(updated);
                      triggerToast('USDC Address Applied', 'USDC address updated on live client checkout.', 'success');
                    }}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply USDC Address</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.walletAddresses.usdc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        walletAddresses: { ...formData.walletAddresses, usdc: e.target.value.trim() },
                      })
                    }
                    placeholder="e.g. 0x9B4E3879Fe414801127B08EAf94200Ce2C9271a9"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono pr-20"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                    Pegged $1
                  </span>
                </div>
              </div>

              {/* 4. USDT Address */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-400">
                      Tether (USDT) Manual Escrow Address
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                      TRC-20 / ERC-20
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const updated = {
                        ...formData,
                        walletAddresses: {
                          ...formData.walletAddresses,
                          lastAppliedAt: now,
                          appliedByAdmin: 'Admin Desk',
                        },
                      };
                      setFormData(updated);
                      updateSupportConfig(updated);
                      triggerToast('USDT Address Applied', 'Tether address updated on live client checkout.', 'success');
                    }}
                    className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply USDT Address</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.walletAddresses.usdt || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        walletAddresses: { ...formData.walletAddresses, usdt: e.target.value.trim() },
                      })
                    }
                    placeholder="TRC-20 or ERC-20 USDT deposit address"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono pr-20"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                    TRC20 / ERC20
                  </span>
                </div>
              </div>

              {/* 5. SOL Address */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-400">
                      Solana (SOL) Manual Escrow Address
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                      Solana Mainnet-Beta SPL
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const updated = {
                        ...formData,
                        walletAddresses: {
                          ...formData.walletAddresses,
                          lastAppliedAt: now,
                          appliedByAdmin: 'Admin Desk',
                        },
                      };
                      setFormData(updated);
                      updateSupportConfig(updated);
                      triggerToast('SOL Address Applied', 'Solana address updated on live client checkout.', 'success');
                    }}
                    className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply SOL Address</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.walletAddresses.sol || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        walletAddresses: { ...formData.walletAddresses, sol: e.target.value.trim() },
                      })
                    }
                    placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 font-mono pr-20"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                    SOL SPL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Bank Wire Transfer Escrow Details (Offline Verification) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-base">
                    Institutional Bank Wire Transfer Coordinates
                  </h3>
                  <p className="text-xs text-slate-400">
                    These banking details are displayed to subscribers choosing manual bank wire transfer.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-sky-400">Fedwire / SWIFT RTGS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Depository Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankWire.bankName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, bankName: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Beneficiary Account Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankWire.accountName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, accountName: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankWire.accountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, accountNumber: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Routing Number (ABA / Fedwire)
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankWire.routingCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, routingCode: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SWIFT / BIC Code (International)
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankWire.swiftBic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, swiftBic: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  IBAN (International Bank Account Number)
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankWire.iban}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, iban: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500 uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bank Branch Physical Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankWire.bankAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, bankAddress: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Reference Prefix
                </label>
                <input
                  type="text"
                  value={formData.bankWire.referencePrefix || 'SWB-WIRE'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, referencePrefix: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Remittance Instructions Summary
                </label>
                <input
                  type="text"
                  value={formData.bankWire.wireInstructions || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankWire: { ...formData.bankWire, wireInstructions: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Changes take effect immediately across all client payment views.
            </span>

            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Deploy Configuration</span>
            </button>
          </div>

        </form>
      ) : (
        /* LIVE CLIENT POST-PAYMENT PREVIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">Live Client Post-Payment Preview</span>
              <span className="text-slate-500">·</span>
              <span>This is what users see immediately upon completing payment:</span>
            </div>
            <button
              onClick={() => setPreviewTab('FORM')}
              className="text-xs text-amber-400 hover:underline"
            >
              Back to Form
            </button>
          </div>

          <div className="max-w-lg mx-auto bg-slate-950 border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-display text-lg font-bold text-white">
                Payment Received & Agent Assigned!
              </h4>
              <p className="text-xs text-slate-400">
                Gold Executive Tier · Borrowing Capacity: $250,000
              </p>
            </div>

            {/* Agent Contact Card Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center text-xs">
                    {formData.agentName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">{formData.agentName}</div>
                    <div className="text-[10px] text-slate-400">{formData.agentTitle}</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Assigned Agent</span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                {formData.postPaymentInstructions}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="py-2 px-3 bg-amber-500 text-slate-950 font-semibold rounded-lg text-center flex items-center justify-center gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email {formData.agentName.split(' ')[0]}</span>
                </div>
                <div className="py-2 px-3 bg-slate-800 text-slate-200 rounded-lg text-center font-mono text-[11px] flex flex-col items-center justify-center gap-0.5">
                  <span>{formData.agentEmail}</span>
                  <span>{formData.agentSecondaryEmail || 'jeffery@sterlingwealthbroker.com'}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                <span>Phone: {formData.agentPhone}</span>
                <span>Telegram: {formData.telegramHandle}</span>
              </div>
            </div>

            <button
              onClick={() => setPreviewTab('FORM')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Close Preview & Edit Fields
            </button>
          </div>
        </div>
      )}

      {/* Interactive Modal to Test Pop-up Notification Instructions */}
      {testPopupGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {testPopupGateway === 'card' ? <CreditCard className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                    Client Checkout Pop-up Preview
                  </div>
                  <h4 className="font-display font-bold text-white text-base">
                    {testPopupGateway === 'card'
                      ? 'Credit Card Payment Advisory'
                      : 'Cryptocurrency Escrow Advisory'}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestPopupGateway(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="whitespace-pre-wrap">
                  {testPopupGateway === 'card'
                    ? formData.gatewayInstructions?.card || 'No custom instruction entered. Pop-up will not show if left blank.'
                    : formData.gatewayInstructions?.crypto || 'No custom instruction entered. Pop-up will not show if left blank.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Triggered on client gateway selection
              </span>
              <button
                type="button"
                onClick={() => setTestPopupGateway(null)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Dismiss & Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
