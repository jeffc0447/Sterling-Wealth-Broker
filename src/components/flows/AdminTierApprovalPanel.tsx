import React, { useState, useMemo } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipSubscriber, MembershipTierId } from '../../types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Mail,
  Copy,
  Check,
  Eye,
  ShieldCheck,
  Download,
  Calendar,
  CreditCard,
  Building,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';

export const AdminTierApprovalPanel: React.FC = () => {
  const {
    subscribers,
    tiers,
    currentUser,
    setMembershipApprovalStatus,
    authenticatedAdmin,
    supportConfig,
    setCurrentView,
    triggerToast,
    upgradeTier,
    deletePendingUpgrade,
  } = useBroker();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'DECLINED'>('ALL');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');

  // Confirmation Modal state
  const [pendingAction, setPendingAction] = useState<{
    subscriber: MembershipSubscriber;
    targetStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  } | null>(null);

  const [adminNote, setAdminNote] = useState('');
  const [declineReasonPreset, setDeclineReasonPreset] = useState('');

  // Receipt Preview Modal state
  const [inspectingSubscriber, setInspectingSubscriber] = useState<MembershipSubscriber | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MembershipSubscriber | null>(null);

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      // Tab filter
      const isPending =
        sub.paymentStatus === 'PENDING' ||
        sub.approvalStatus === 'AWAITING_PAYMENT_VERIFICATION';
      const isApproved =
        sub.approvalStatus === 'APPROVED' ||
        (sub.paymentStatus === 'ACTIVE' && !sub.requestedTierId);
      const isDeclined =
        sub.approvalStatus === 'REJECTED' ||
        sub.paymentStatus === 'PAST_DUE';

      if (activeTab === 'PENDING' && !isPending) return false;
      if (activeTab === 'APPROVED' && !isApproved) return false;
      if (activeTab === 'DECLINED' && !isDeclined) return false;

      // Tier filter
      const effectiveTierId = sub.requestedTierId || sub.membershipTierId;
      if (selectedTierFilter === 'UNASSIGNED') {
        if (effectiveTierId !== null) return false;
      } else if (selectedTierFilter !== 'ALL' && effectiveTierId !== selectedTierFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = sub.name.toLowerCase().includes(query);
        const matchesEmail = sub.email.toLowerCase().includes(query);
        const matchesReqId = sub.requestId?.toLowerCase().includes(query) || false;
        const matchesTxId = sub.transactionId.toLowerCase().includes(query);
        const matchesCompany = sub.company?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesEmail && !matchesReqId && !matchesTxId && !matchesCompany) {
          return false;
        }
      }

      return true;
    });
  }, [subscribers, activeTab, selectedTierFilter, searchTerm]);

  // Aggregate stats
  const pendingCount = useMemo(
    () =>
      subscribers.filter(
        (s) =>
          s.paymentStatus === 'PENDING' ||
          s.approvalStatus === 'AWAITING_PAYMENT_VERIFICATION'
      ).length,
    [subscribers]
  );

  const approvedCount = useMemo(
    () =>
      subscribers.filter(
        (s) =>
          s.approvalStatus === 'APPROVED' ||
          (s.paymentStatus === 'ACTIVE' && !s.requestedTierId)
      ).length,
    [subscribers]
  );

  const declinedCount = useMemo(
    () =>
      subscribers.filter(
        (s) => s.approvalStatus === 'REJECTED' || s.paymentStatus === 'PAST_DUE'
      ).length,
    [subscribers]
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    triggerToast('Copied', text, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenActionModal = (
    subscriber: MembershipSubscriber,
    targetStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  ) => {
    // If target is same as current state, skip
    const isCurrentApproved =
      subscriber.approvalStatus === 'APPROVED' ||
      (subscriber.paymentStatus === 'ACTIVE' && !subscriber.requestedTierId);
    const isCurrentDeclined =
      subscriber.approvalStatus === 'REJECTED' ||
      subscriber.paymentStatus === 'PAST_DUE';
    const isCurrentPending =
      subscriber.approvalStatus === 'AWAITING_PAYMENT_VERIFICATION' ||
      subscriber.paymentStatus === 'PENDING';

    if (targetStatus === 'APPROVED' && isCurrentApproved) return;
    if (targetStatus === 'REJECTED' && isCurrentDeclined) return;
    if (targetStatus === 'PENDING' && isCurrentPending) return;

    setPendingAction({ subscriber, targetStatus });
    if (targetStatus === 'APPROVED') {
      setAdminNote(
        `Payment receipt verified and cleared against bank settlement records by ${
          authenticatedAdmin?.name || supportConfig.agentName
        }. Membership tier officially unlocked.`
      );
    } else if (targetStatus === 'REJECTED') {
      setDeclineReasonPreset('Receipt unreadable or blurry image');
      setAdminNote('Receipt image was unreadable. Please upload a clear official bank wire or card receipt.');
    } else {
      setAdminNote('Status reset to pending manual verification.');
    }
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    const finalNote =
      pendingAction.targetStatus === 'REJECTED' && declineReasonPreset
        ? `${declineReasonPreset}: ${adminNote}`
        : adminNote;

    setMembershipApprovalStatus(
      pendingAction.subscriber.id,
      pendingAction.targetStatus,
      finalNote,
      authenticatedAdmin?.name || supportConfig.agentName
    );

    setPendingAction(null);
    setAdminNote('');
    setDeclineReasonPreset('');
  };

  const getProofStatusBadge = (subscriber: MembershipSubscriber) => {
    const status = subscriber.proofStatus || 'RECEIPT_ATTACHED';
    switch (status) {
      case 'RECEIPT_ATTACHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Receipt Attached
          </span>
        );
      case 'EMAILED_TO_CARE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/25">
            <Mail className="w-3 h-3" />
            Emailed to Care
          </span>
        );
      case 'AWAITING_PROOF':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <Clock className="w-3 h-3" />
            Awaiting Proof
          </span>
        );
    }
  };

  const getRowCurrentStatus = (sub: MembershipSubscriber): 'PENDING' | 'APPROVED' | 'REJECTED' => {
    if (sub.approvalStatus === 'APPROVED' || (sub.paymentStatus === 'ACTIVE' && !sub.requestedTierId)) {
      return 'APPROVED';
    }
    if (sub.approvalStatus === 'REJECTED' || sub.paymentStatus === 'PAST_DUE') {
      return 'REJECTED';
    }
    return 'PENDING';
  };

  return (
    <div className="space-y-6">
      
      {/* Screen 3 Header & Context Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Screen 3 of 3 · Admin-Side
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">Operations & Compliance Workspace</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Membership Tier Approval & Verification Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Customer Care Support manually reviews and approves all user-selected membership tier packages (chosen during registration or after sign-up), verifies payment proofs, and activates tier privileges.
            </p>
          </div>

          {/* Live Sync Callout Banner */}
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-3 rounded-xl shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Live Bi-Directional Sync</span>
              <span className="text-white font-medium">Changes immediately reflect in Client View</span>
            </div>
            <button
              onClick={() => setCurrentView('PORTAL')}
              className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
            >
              <span>Switch to Client</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-400 block mb-1">Queue Total</span>
            <span className="font-display font-bold text-xl text-white tabular-nums">
              {subscribers.length}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-3.5">
            <span className="text-[11px] text-amber-400 block mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Pending Verification (#F59E0B)
            </span>
            <span className="font-display font-bold text-xl text-amber-400 tabular-nums">
              {pendingCount}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-3.5">
            <span className="text-[11px] text-emerald-400 block mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Approved & Active (#10B981)
            </span>
            <span className="font-display font-bold text-xl text-emerald-400 tabular-nums">
              {approvedCount}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-rose-500/20 rounded-xl p-3.5">
            <span className="text-[11px] text-rose-400 block mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Declined (#EF4444)
            </span>
            <span className="font-display font-bold text-xl text-rose-400 tabular-nums">
              {declinedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Quick Filter Tabs: All, Pending, Approved, Declined */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Requests ({subscribers.length})
            </button>

            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'PENDING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
              <span>Pending ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              <span>Approved ({approvedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('DECLINED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'DECLINED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
              <span>Declined ({declinedCount})</span>
            </button>
          </div>

          {/* Tier Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Tiers</option>
              <option value="UNASSIGNED">No Tier Selected</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User Name, Email, Unique Request ID (e.g. REQ-8942-MEMB), or Transaction Reference..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* 1. DATA TABLE / QUEUE LAYOUT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 font-semibold">User Name & Email</th>
                <th className="py-3.5 px-4 font-semibold">Selected Tier</th>
                <th className="py-3.5 px-4 font-semibold">Amount Paid</th>
                <th className="py-3.5 px-4 font-semibold">Request Date</th>
                <th className="py-3.5 px-4 font-semibold">Payment Copy Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status Action Controls</th>
                <th className="py-3.5 px-4 font-semibold text-right">Receipt / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No matching requests found</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Try adjusting your search query or filter tab.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => {
                  const currentStatus = getRowCurrentStatus(subscriber);
                  const isUserJane =
                    subscriber.name.toLowerCase().includes('jane cooper') ||
                    subscriber.email.toLowerCase().includes('jane.cooper');

                  const displayTierName =
                    subscriber.requestedTierName || subscriber.membershipTierName;
                  const reqId = subscriber.requestId || 'REQ-8942-MEMB';

                  return (
                    <tr
                      key={subscriber.id}
                      className={`hover:bg-slate-850/60 transition-colors ${
                        isUserJane ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      {/* User Name & Email */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {subscriber.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{subscriber.name}</span>
                              {isUserJane && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Client View User
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                              {subscriber.email}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              ID: {reqId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Selected Tier */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">
                          {displayTierName || 'No Active Tier'}
                        </div>
                        {subscriber.requestedTierName && (
                          <div className="text-[11px] text-amber-400 mt-0.5 flex items-center gap-1">
                            <span className="text-slate-500">
                              {subscriber.membershipTierName || 'No Active Tier'}
                            </span>
                            <span>→</span>
                            <span className="font-semibold">{subscriber.requestedTierName}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          Method: {subscriber.paymentMethod.replace('STRIPE_', '').replace('CRYPTO_', '')}
                        </span>
                      </td>

                      {/* Amount Paid */}
                      <td className="py-4 px-4 font-mono font-bold text-white tabular-nums">
                        ${subscriber.amountPaid.toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-normal block font-sans">
                          {subscriber.currency} Escrow
                        </span>
                      </td>

                      {/* Request Date */}
                      <td className="py-4 px-4 text-slate-300 font-sans">
                        <div>{subscriber.dateJoined}</div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          12–24h SLA Active
                        </span>
                      </td>

                      {/* Payment Copy Status */}
                      <td className="py-4 px-4">
                        {getProofStatusBadge(subscriber)}
                        {subscriber.proofAttachmentName && (
                          <div className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[140px]">
                            {subscriber.proofAttachmentName}
                          </div>
                        )}
                      </td>

                      {/* 2. PER-ROW STATUS CONTROL: Inline Color-Coded Button Group */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                          {/* Pending Button (#F59E0B) */}
                          <button
                            onClick={() => handleOpenActionModal(subscriber, 'PENDING')}
                            title="Set to Pending Verification"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              currentStatus === 'PENDING'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
                            }`}
                          >
                            Pending
                          </button>

                          {/* Approved Button (#10B981) */}
                          <button
                            onClick={() => handleOpenActionModal(subscriber, 'APPROVED')}
                            title="Verify and Approve Membership Upgrade"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              currentStatus === 'APPROVED'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                            }`}
                          >
                            Approved
                          </button>

                          {/* Declined Button (#EF4444) */}
                          <button
                            onClick={() => handleOpenActionModal(subscriber, 'REJECTED')}
                            title="Decline Payment Verification"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              currentStatus === 'REJECTED'
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-bold'
                                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
                            }`}
                          >
                            Declined
                          </button>
                        </div>
                      </td>

                      {/* Details / Receipt Inspector Button & Delete Option */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingSubscriber(subscriber)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemToDelete(subscriber)}
                            title="Delete this record created in error"
                            className="p-1.5 bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal for Tier Approval Queue */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  Delete Queue Request?
                </h4>
                <p className="text-xs text-rose-300">
                  User: {itemToDelete.name} ({itemToDelete.requestId || 'REQ-8942-MEMB'})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete this pending tier request created by error? This will permanently purge the pending upgrade record from the queue.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePendingUpgrade(itemToDelete.id);
                  setItemToDelete(null);
                  triggerToast('Record Deleted', `Removed ${itemToDelete.name}'s request from the queue.`, 'info');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONFIRMATION MODAL for Status Updates */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {pendingAction.targetStatus === 'APPROVED' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                {pendingAction.targetStatus === 'REJECTED' && (
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                {pendingAction.targetStatus === 'PENDING' && (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-white text-base">
                    {pendingAction.targetStatus === 'APPROVED' && 'Confirm Membership Tier Approval'}
                    {pendingAction.targetStatus === 'REJECTED' && 'Confirm Payment Request Rejection'}
                    {pendingAction.targetStatus === 'PENDING' && 'Reset to Pending Verification'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    User: {pendingAction.subscriber.name} ({pendingAction.subscriber.email})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPendingAction(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Target details breakdown */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Target Tier:</span>
                <span className="text-white font-semibold">
                  {pendingAction.subscriber.requestedTierName || pendingAction.subscriber.membershipTierName}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount:</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  ${pendingAction.subscriber.amountPaid.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Request ID:</span>
                <span className="font-mono text-slate-300">
                  {pendingAction.subscriber.requestId || 'REQ-8942-MEMB'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Assigned Verifier:</span>
                <span className="text-slate-200">
                  {authenticatedAdmin?.name || supportConfig.agentName}
                </span>
              </div>
            </div>

            {/* If Declining: Offer quick reason presets */}
            {pendingAction.targetStatus === 'REJECTED' && (
              <div className="space-y-1.5 text-xs">
                <label className="block text-slate-300 font-medium">
                  Select Rejection Preset:
                </label>
                <select
                  value={declineReasonPreset}
                  onChange={(e) => {
                    setDeclineReasonPreset(e.target.value);
                    if (e.target.value === 'Receipt unreadable or blurry image') {
                      setAdminNote('Receipt image was unreadable. Please upload a clear official bank wire or card receipt.');
                    } else if (e.target.value === 'Amount mismatch with tier price') {
                      setAdminNote('Submitted transaction amount did not match the required membership retainer price.');
                    } else if (e.target.value === 'Escrow deposit hold not detected') {
                      setAdminNote('Bank wire transfer reference was not detected in clearing ledger. Please check with your originating bank.');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500 text-xs"
                >
                  <option value="Receipt unreadable or blurry image">Receipt unreadable or blurry image</option>
                  <option value="Amount mismatch with tier price">Amount mismatch with tier price</option>
                  <option value="Escrow deposit hold not detected">Escrow deposit hold not detected</option>
                  <option value="Sender name mismatch on bank account">Sender name mismatch on bank account</option>
                  <option value="Custom Reason">Custom Reason</option>
                </select>
              </div>
            )}

            {/* Admin Reason / Notes Textarea */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-300 font-medium">
                Admin Notes & User Notification Message:
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Enter notes sent directly to the client's dashboard status view..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
              <span className="text-[11px] text-slate-400 block">
                This note will be displayed in real time on the user's dashboard status card.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-lg font-semibold text-xs transition-colors shadow-lg ${
                  pendingAction.targetStatus === 'APPROVED'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : pendingAction.targetStatus === 'REJECTED'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {pendingAction.targetStatus === 'APPROVED' && 'Confirm & Upgrade Tier'}
                {pendingAction.targetStatus === 'REJECTED' && 'Confirm & Send Decline Notice'}
                {pendingAction.targetStatus === 'PENDING' && 'Confirm Reset to Pending'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT PROOF INSPECTOR MODAL */}
      {inspectingSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  Payment Receipt & Settlement Audit Slip
                </h3>
              </div>
              <button
                onClick={() => setInspectingSubscriber(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Document simulated view */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <div className="font-bold text-white text-sm">
                    {inspectingSubscriber.proofAttachmentName || `Payment_Receipt_${inspectingSubscriber.requestId || 'REQ-8942'}.pdf`}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    SHA-256 Verified · 1.4 MB · Digital Escrow Slip
                  </span>
                </div>
                {getProofStatusBadge(inspectingSubscriber)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Subscriber</span>
                  <span className="font-medium text-white">{inspectingSubscriber.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Email</span>
                  <span className="font-mono text-slate-300">{inspectingSubscriber.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Upgraded Tier</span>
                  <span className="font-semibold text-emerald-400">
                    {inspectingSubscriber.requestedTierName || inspectingSubscriber.membershipTierName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Retainer Amount</span>
                  <span className="font-bold text-white font-mono">
                    ${inspectingSubscriber.amountPaid.toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Transaction ID</span>
                  <span className="font-mono text-slate-300">{inspectingSubscriber.transactionId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Request Date</span>
                  <span className="text-slate-300">{inspectingSubscriber.dateJoined}</span>
                </div>
              </div>

              {/* Billing Address */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">
                  Registered Billing Address
                </span>
                <p className="text-slate-300">
                  {inspectingSubscriber.billingAddress.streetAddress}
                  {inspectingSubscriber.billingAddress.streetAddress2 ? `, ${inspectingSubscriber.billingAddress.streetAddress2}` : ''},{' '}
                  {inspectingSubscriber.billingAddress.city},{' '}
                  {inspectingSubscriber.billingAddress.state}{' '}
                  {inspectingSubscriber.billingAddress.zipCode},{' '}
                  {inspectingSubscriber.billingAddress.country}
                </p>
              </div>

              {/* Wire Remittance Details if submitted via Bank Wire */}
              {inspectingSubscriber.wireProof && (
                <div className="pt-2 border-t border-slate-800 bg-sky-950/30 p-3 rounded-lg border border-sky-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      Bank Wire Remittance Audit Proof
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                      Receipt Attached
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Wire Reference Number</span>
                      <span className="font-mono text-white font-semibold">#{inspectingSubscriber.wireProof.wireReferenceNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Remitter Name & Bank</span>
                      <span className="text-white">{inspectingSubscriber.wireProof.remitterName} ({inspectingSubscriber.wireProof.remitterBank})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Attached Receipt Slip</span>
                      <span className="text-emerald-400 font-mono flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {inspectingSubscriber.wireProof.receiptFileName} ({inspectingSubscriber.wireProof.receiptFileSize || '1.4 MB'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Dispatched Care Agent Alert</span>
                      <span className="text-amber-400 font-mono">
                        {(() => {
                          const notified = inspectingSubscriber.wireProof.agentNotifiedEmail || '';
                          const secondary = supportConfig.agentSecondaryEmail || 'jeffery@sterlingwealthbroker.com';
                          if (notified.toLowerCase().includes(secondary.toLowerCase())) {
                            return notified;
                          }
                          return `${notified || supportConfig.agentEmail} and ${secondary}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Verified Note if exists */}
              {inspectingSubscriber.paymentReceiptNote && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">
                    Receipt Ledger Note
                  </span>
                  <p className="text-slate-300 italic bg-slate-900 p-2 rounded">
                    "{inspectingSubscriber.paymentReceiptNote}"
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setPendingAction({ subscriber: inspectingSubscriber, targetStatus: 'APPROVED' });
                  setInspectingSubscriber(null);
                  setAdminNote(`Verified proof slip for ${inspectingSubscriber.name}. Cleared.`);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs"
              >
                Approve From Inspector
              </button>

              <button
                onClick={() => setInspectingSubscriber(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
