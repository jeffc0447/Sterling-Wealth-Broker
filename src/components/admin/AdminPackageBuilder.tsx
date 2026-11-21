import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipTier } from '../../types';
import { PackagePlus, Edit2, Check, Clock, ShieldCheck, DollarSign, Plus, Trash2, ListChecks, AlertTriangle } from 'lucide-react';

export const AdminPackageBuilder: React.FC = () => {
  const { tiers, updateTierCMS, createTierCMS, deleteTierCMS } = useBroker();
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [newPrivilegeText, setNewPrivilegeText] = useState('');
  const [tierToDelete, setTierToDelete] = useState<MembershipTier | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleEditClick = (tier: MembershipTier) => {
    setEditingTier({ ...tier, features: [...tier.features] });
    setNewPrivilegeText('');
  };

  const handleAddPrivilege = () => {
    if (!editingTier || !newPrivilegeText.trim()) return;
    setEditingTier({
      ...editingTier,
      features: [...editingTier.features, newPrivilegeText.trim()],
    });
    setNewPrivilegeText('');
  };

  const handleRemovePrivilege = (indexToRemove: number) => {
    if (!editingTier) return;
    setEditingTier({
      ...editingTier,
      features: editingTier.features.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleUpdatePrivilege = (index: number, value: string) => {
    if (!editingTier) return;
    const updated = [...editingTier.features];
    updated[index] = value;
    setEditingTier({ ...editingTier, features: updated });
  };

  const handleDeleteTier = (tier: MembershipTier) => {
    deleteTierCMS(tier.id);
    setTierToDelete(null);
    if (editingTier?.id === tier.id) setEditingTier(null);
    setSuccessNotice(`Deleted membership package "${tier.name}" successfully.`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleCreateNewClick = () => {
    const newTier: MembershipTier = {
      id: `tier-${Date.now().toString().slice(-4)}` as any,
      name: 'Custom Corporate Club',
      badge: 'Custom Tier',
      price: 2500,
      period: 'quarter',
      maxLoanLimit: 500000,
      aprDiscount: 1.5,
      processingSLA: '18 Hours',
      dedicatedBroker: true,
      priorityUnderwriting: true,
      features: [
        'Borrowing limit up to $500,000',
        'Direct syndicated credit desk match',
        'Dedicated senior underwriting coverage',
      ],
      allowedInstruments: ['inst-revolving-line', 'inst-equipment-facility'],
      colorScheme: {
        accent: '#10b981',
        border: 'border-emerald-500/50',
        bgGlow: 'from-emerald-500/10',
        text: 'text-emerald-400',
      },
    };
    setEditingTier(newTier);
  };

  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;

    const exists = tiers.some((t) => t.id === editingTier.id);
    if (exists) {
      updateTierCMS(editingTier);
      setSuccessNotice(`Updated ${editingTier.name} package successfully.`);
    } else {
      createTierCMS(editingTier);
      setSuccessNotice(`Created new tier ${editingTier.name} successfully.`);
    }

    setEditingTier(null);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Membership Package Builder (Dynamic CMS)
            </h2>
            <p className="text-xs text-slate-400">
              Configure tiered access thresholds, borrowing ceilings, APR syndicate discounts, and broker SLA covenants.
            </p>
          </div>

          <button
            onClick={handleCreateNewClick}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Membership Tier</span>
          </button>
        </div>

        {successNotice && (
          <div className="mt-4 p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successNotice}</span>
          </div>
        )}
      </div>

      {/* Existing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-amber-400 text-[10px] uppercase">
                  {tier.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {tier.id}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-white mb-1">
                {tier.name}
              </h3>

              <div className="text-xl font-display font-bold text-emerald-400 mb-3">
                ${tier.price.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-normal">/{tier.period}</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Borrowing:</span>
                  <strong className="text-white font-mono">${tier.maxLoanLimit.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Underwriting SLA:</span>
                  <span className="text-amber-400">{tier.processingSLA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rate Discount:</span>
                  <span className="text-emerald-400">-{tier.aprDiscount}% APR</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                {tier.features.slice(0, 3).map((f, i) => (
                  <div key={i} className="truncate">• {f}</div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => handleEditClick(tier)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Configure Tier in CMS</span>
              </button>

              <button
                type="button"
                onClick={() => setTierToDelete(tier)}
                title="Delete this package tier"
                className="p-2 bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-xl text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal for Tier Deletion */}
      {tierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  Delete Membership Tier?
                </h4>
                <p className="text-xs text-rose-300">
                  Are you sure you want to delete <strong className="text-white">{tierToDelete.name}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This action will remove this tier package from the client portal and pricing matrix. Any profiles or packages created in error will be purged from the active catalogue.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTierToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTier(tierToDelete)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier Editor Drawer / Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-semibold text-white text-base">
                  CMS Package Editor: {editingTier.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingTier(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Tier Name</label>
                  <input
                    type="text"
                    value={editingTier.name}
                    onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Badge / Subtitle</label>
                  <input
                    type="text"
                    value={editingTier.badge}
                    onChange={(e) => setEditingTier({ ...editingTier, badge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Membership Price ($)</label>
                  <input
                    type="number"
                    value={editingTier.price}
                    onChange={(e) => setEditingTier({ ...editingTier, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Billing Period</label>
                  <select
                    value={editingTier.period}
                    onChange={(e) => setEditingTier({ ...editingTier, period: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="quarter">Quarterly</option>
                    <option value="year">Annual</option>
                    <option value="month">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Max Borrowing Ceiling ($)</label>
                  <input
                    type="number"
                    value={editingTier.maxLoanLimit}
                    onChange={(e) => setEditingTier({ ...editingTier, maxLoanLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Underwriting SLA</label>
                  <input
                    type="text"
                    value={editingTier.processingSLA}
                    onChange={(e) => setEditingTier({ ...editingTier, processingSLA: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">APR Discount (%)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={editingTier.aprDiscount}
                    onChange={(e) => setEditingTier({ ...editingTier, aprDiscount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* (INCLUDE PRIVILEGES) Dedicated CMS Section */}
              <div className="pt-3 pb-1 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-emerald-400" />
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      (INCLUDE PRIVILEGES)
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {editingTier.features.length} Privileges Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Edit the bullet points and privileges displayed to clients on the portal and checkout matrix.
                </p>

                {/* Privileges List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingTier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleUpdatePrivilege(idx, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePrivilege(idx)}
                        title="Remove privilege bullet"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Privilege Input */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
                  <input
                    type="text"
                    value={newPrivilegeText}
                    onChange={(e) => setNewPrivilegeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPrivilege();
                      }
                    }}
                    placeholder="Type new privilege bullet point (e.g., Free AVS Audit, Priority Wire Escrow)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddPrivilege}
                    disabled={!newPrivilegeText.trim()}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Privilege</span>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-2 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTier.dedicatedBroker}
                    onChange={(e) => setEditingTier({ ...editingTier, dedicatedBroker: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Dedicated Personal Broker Assigned</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTier.priorityUnderwriting}
                    onChange={(e) => setEditingTier({ ...editingTier, priorityUnderwriting: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Priority Syndicate Fast-Track</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setTierToDelete(editingTier);
                  }}
                  className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Package</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTier(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition-colors shadow-md shadow-amber-500/20"
                  >
                    Save Tier Configuration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
