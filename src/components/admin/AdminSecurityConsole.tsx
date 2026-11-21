import React from 'react';
import { useBroker } from '../../context/BrokerContext';
import { ADMIN_PROFILES } from '../../data/initialData';
import { ShieldCheck, Lock, Key, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminSecurityConsole: React.FC = () => {
  const { activeAdminRole, setActiveAdminRole } = useBroker();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Role-Based Access Control (RBAC) & Security Policies
            </h2>
            <p className="text-xs text-slate-400">
              Enforce strict principle of least privilege, 2FA validation, and GDPR/CCPA data integrity.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Lock className="w-4 h-4" />
            <span>FIPS 140-2 Level 3 Module</span>
          </div>
        </div>
      </div>

      {/* RBAC Team Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ADMIN_PROFILES.map((admin) => {
          const isActive = activeAdminRole === admin.role;

          return (
            <div
              key={admin.id}
              className={`bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-amber-500 shadow-lg shadow-amber-500/10 bg-slate-900/90'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-sm">
                      {admin.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{admin.name}</h3>
                      <div className="text-[11px] text-slate-400">{admin.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 font-mono text-amber-400 border border-slate-800">
                    {admin.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium mb-2">
                  Assigned Clearance & Responsibilities:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {admin.permissions.map((p, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">2FA Hardware Token Active</span>
                <button
                  onClick={() => setActiveAdminRole(admin.role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isActive ? 'Current Active Identity' : 'Simulate This Persona'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Architecture Specifications Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-display font-semibold text-white text-base mb-4">
          Financial Platform Security Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>AES-256 Bit Encryption</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Uploaded files in the Document Vault are encrypted using unique per-object AES-GCM keys. Plaintext is never stored on disk.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="font-semibold text-sky-400 flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              <span>PCI-DSS Level 1</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Cardholder data is tokenized directly via Stripe Elements. Zero credit card numbers or CVVs touch internal broker servers.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>OAuth 2.0 & JWT 2FA</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Time-based one-time password (TOTP) and WebAuthn hardware tokens required for underwriting desk status modifications.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="font-semibold text-purple-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>GDPR & CCPA Privacy</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Full cryptographic deletion protocol. Clients retain the immutable right to revoke vault access and request document shredding.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
