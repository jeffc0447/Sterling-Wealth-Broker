import React, { useState, useMemo } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { MembershipSubscriber, MembershipTierId } from '../../types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  X,
  CreditCard,
  MapPin,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Receipt,
  Download,
  Copy,
  Check,
  Coins,
  Landmark,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  UserCheck,
  Trash2,
} from 'lucide-react';

export const AdminSubscribers: React.FC = () => {
  const { subscribers, tiers, updateSubscriberStatus, deleteSubscriber, triggerToast } = useBroker();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Preview / Details Modal State
  const [selectedSubscriber, setSelectedSubscriber] = useState<MembershipSubscriber | null>(null);
  const [subscriberToDelete, setSubscriberToDelete] = useState<MembershipSubscriber | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusUpdateNotice, setStatusUpdateNotice] = useState<string | null>(null);

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.billingAddress.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.billingAddress.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.company && sub.company.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTier =
        selectedTierFilter === 'ALL' || sub.membershipTierId === selectedTierFilter;

      const matchesStatus =
        selectedStatusFilter === 'ALL' || sub.paymentStatus === selectedStatusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [subscribers, searchTerm, selectedTierFilter, selectedStatusFilter]);

  // Aggregate Metrics
  const activeCount = useMemo(
    () => subscribers.filter((s) => s.paymentStatus === 'ACTIVE').length,
    [subscribers]
  );

  const totalARR = useMemo(() => {
    return subscribers.reduce((acc, sub) => {
      if (sub.paymentStatus === 'ACTIVE') {
        // Annualized approximation: quarterly * 4, annual * 1
        return acc + sub.amountPaid * 4;
      }
      return acc;
    }, 0);
  }, [subscribers]);

  const pastDueCount = useMemo(
    () => subscribers.filter((s) => s.paymentStatus === 'PAST_DUE').length,
    [subscribers]
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStatusChange = (
    subscriberId: string,
    newStatus: MembershipSubscriber['paymentStatus']
  ) => {
    updateSubscriberStatus(subscriberId, newStatus);
    if (selectedSubscriber && selectedSubscriber.id === subscriberId) {
      setSelectedSubscriber({
        ...selectedSubscriber,
        paymentStatus: newStatus,
      });
    }
    setStatusUpdateNotice(`Status updated to ${newStatus}`);
    setTimeout(() => setStatusUpdateNotice(null), 3000);
  };

  const getTierColor = (tierId: MembershipTierId) => {
    switch (tierId) {
      case 'silver':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'gold':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'platinum':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'diamond':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: MembershipSubscriber['paymentStatus']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'PAST_DUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/25">
            <AlertTriangle className="w-3 h-3" />
            Past Due
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Memberships & Subscribers Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete registry of subscribed institutional borrowers, verified billing addresses, and payment transaction logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['Name,Email,Tier,Status,DateJoined,Street,City,State,Zip,Country,AmountPaid,TxnId']
                  .concat(
                    subscribers.map(
                      (s) =>
                        `"${s.name}","${s.email}","${s.membershipTierName}","${s.paymentStatus}","${s.dateJoined}","${s.billingAddress.streetAddress}","${s.billingAddress.city}","${s.billingAddress.state}","${s.billingAddress.zipCode}","${s.billingAddress.country}",${s.amountPaid},"${s.transactionId}"`
                    )
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `sterling-subscribers-${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Subscribers (CSV)</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Subscribers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {activeCount}{' '}
            <span className="text-xs font-normal text-slate-400">/ {subscribers.length} total</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>94.2% Retention Rate</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Retainer ARR Run-Rate</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            ${totalARR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Institutional retainer membership fees
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">AVS Verified Addresses</span>
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {subscribers.length}{' '}
            <span className="text-xs font-normal text-slate-400">Validated</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>100% Tax & KYC Address Match</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Past Due / Action</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {pastDueCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Requires dunning or wire follow-up
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, transaction ID, city or country..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Tier:</span>
          </div>
          <select
            value={selectedTierFilter}
            onChange={(e) => setSelectedTierFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Tiers</option>
            <option value="silver">Silver Access</option>
            <option value="gold">Gold Executive</option>
            <option value="platinum">Platinum Prestige</option>
            <option value="diamond">Diamond Syndicate</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Memberships & Subscribers Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Membership Tier</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Date Joined</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">No subscribers found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Try adjusting your search criteria or filter options.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => {
                  const targetTier = tiers.find((t) => t.id === sub.membershipTierId);
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs shrink-0 group-hover:border-emerald-500/50 transition-colors">
                            {sub.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {sub.name}
                            </div>
                            {sub.company && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Building className="w-3 h-3 text-slate-500" />
                                {sub.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                          <span>{sub.email}</span>
                          <button
                            onClick={() => copyToClipboard(sub.email, `email-${sub.id}`)}
                            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            title="Copy email"
                          >
                            {copiedKey === `email-${sub.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Membership Tier */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getTierColor(
                              sub.membershipTierId
                            )}`}
                          >
                            {sub.membershipTierName}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Limit: ${targetTier?.maxLoanLimit.toLocaleString()} · ${sub.amountPaid}/qtr
                          </div>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(sub.paymentStatus)}
                      </td>

                      {/* Date Joined */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{sub.dateJoined}</span>
                        </div>
                      </td>

                      {/* Actions: View Details & Delete Profile */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSubscriber(sub)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 border border-slate-700 hover:border-emerald-400 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSubscriberToDelete(sub)}
                            title="Delete subscriber profile created in error"
                            className="p-1.5 bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-lg transition-colors cursor-pointer"
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

      {/* VIEW DETAILS MODAL */}
      {selectedSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-slate-800 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center text-sm shadow-md">
                  {selectedSubscriber.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-white text-base">
                      {selectedSubscriber.name}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getTierColor(
                        selectedSubscriber.membershipTierId
                      )}`}
                    >
                      {selectedSubscriber.membershipTierName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Subscriber ID: <span className="font-mono text-slate-300">{selectedSubscriber.id}</span> · Joined {selectedSubscriber.dateJoined}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubscriber(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
              
              {statusUpdateNotice && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{statusUpdateNotice}</span>
                </div>
              )}

              {/* Grid 1: Membership Tier Details */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Selected Membership Tier
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold font-display text-white">
                      ${selectedSubscriber.amountPaid.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400"> / quarter</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tier Level</span>
                    <span className="font-semibold text-slate-200">
                      {selectedSubscriber.membershipTierName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Borrowing Limit</span>
                    <span className="font-semibold text-emerald-400">
                      ${tiers.find((t) => t.id === selectedSubscriber.membershipTierId)?.maxLoanLimit.toLocaleString() || '100,000'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Underwriting SLA</span>
                    <span className="font-semibold text-amber-400">
                      {tiers.find((t) => t.id === selectedSubscriber.membershipTierId)?.processingSLA || '24 Hours'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Dedicated Broker</span>
                    <span className="font-semibold text-slate-200">
                      {tiers.find((t) => t.id === selectedSubscriber.membershipTierId)?.dedicatedBroker ? 'Assigned' : 'General Desk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Full Name & Email & Contact */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  Subscriber Identity & Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Full Legal Name</span>
                    <span className="text-sm font-semibold text-white">
                      {selectedSubscriber.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Primary Email</span>
                    <div className="flex items-center gap-1.5 text-slate-200 font-mono mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedSubscriber.email}</span>
                      <button
                        onClick={() => copyToClipboard(selectedSubscriber.email, 'modal-email')}
                        className="text-slate-500 hover:text-white cursor-pointer"
                        title="Copy"
                      >
                        {copiedKey === 'modal-email' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {selectedSubscriber.phone && (
                    <div>
                      <span className="text-[10px] text-slate-500 block">Direct Telephone</span>
                      <div className="flex items-center gap-1.5 text-slate-200 font-mono mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedSubscriber.phone}</span>
                      </div>
                    </div>
                  )}

                  {selectedSubscriber.company && (
                    <div>
                      <span className="text-[10px] text-slate-500 block">Registered Entity / Company</span>
                      <div className="flex items-center gap-1.5 text-slate-200 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedSubscriber.company}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid 3: Full Billing Address */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Full Billing Address
                  </span>
                  <button
                    onClick={() => {
                      const fullAddress = `${selectedSubscriber.billingAddress.streetAddress}, ${selectedSubscriber.billingAddress.city}, ${selectedSubscriber.billingAddress.state} ${selectedSubscriber.billingAddress.zipCode}, ${selectedSubscriber.billingAddress.country}`;
                      copyToClipboard(fullAddress, 'modal-address');
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'modal-address' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Street Address 1:</span>
                      <span className="font-medium text-white">
                        {selectedSubscriber.billingAddress.streetAddress}
                      </span>
                    </div>

                    {selectedSubscriber.billingAddress.streetAddress2 && (
                      <div>
                        <span className="text-[10px] text-slate-500 block">Street Address 2 / Suite:</span>
                        <span className="font-medium text-white">
                          {selectedSubscriber.billingAddress.streetAddress2}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-slate-500 block">City:</span>
                      <span className="font-medium text-white">
                        {selectedSubscriber.billingAddress.city}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">State / Province:</span>
                      <span className="font-medium text-white">
                        {selectedSubscriber.billingAddress.state}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Zip / Postal Code:</span>
                      <span className="font-mono font-medium text-emerald-400">
                        {selectedSubscriber.billingAddress.zipCode}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-500 block">Country:</span>
                      <span className="font-medium text-amber-300 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {selectedSubscriber.billingAddress.country}
                      </span>
                    </div>

                    {selectedSubscriber.wireProof && (
                      <div className="sm:col-span-2 pt-2 border-t border-slate-800 bg-sky-950/40 p-2.5 rounded-lg border border-sky-500/30">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-sky-400 mb-1">
                          <span>Bank Wire Remittance Advice</span>
                          <span className="font-mono text-emerald-400">Ref: #{selectedSubscriber.wireProof.wireReferenceNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Remitter: <strong>{selectedSubscriber.wireProof.remitterName}</strong> ({selectedSubscriber.wireProof.remitterBank}) · Receipt: <span className="font-mono text-emerald-300">{selectedSubscriber.wireProof.receiptFileName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid 4: Payment History & Transaction ID */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-purple-400" />
                  Payment History & Transaction ID
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Transaction Reference / Hash</span>
                      <span className="font-mono text-emerald-400 font-semibold break-all">
                        {selectedSubscriber.transactionId}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block">Amount Settled</span>
                      <span className="font-bold text-white font-mono">
                        ${selectedSubscriber.amountPaid.toLocaleString()} {selectedSubscriber.currency}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-400 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Payment Rail:</span>
                      <span className="text-slate-200 font-medium">
                        {selectedSubscriber.paymentMethod === 'STRIPE_CARD'
                          ? `Credit Card (•••• ${selectedSubscriber.cardLast4 || '9821'})`
                          : selectedSubscriber.paymentMethod === 'WIRE_TRANSFER'
                          ? 'Fedwire Bank Escrow'
                          : selectedSubscriber.paymentMethod}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Current Status:</span>
                      <div className="mt-0.5">
                        {getStatusBadge(selectedSubscriber.paymentStatus)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Next Renewal Date:</span>
                      <span className="text-slate-200 font-mono">
                        {selectedSubscriber.nextBillingDate || 'Apr 26, 2027'}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Action for Admin */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Admin Status Controls:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStatusChange(selectedSubscriber.id, 'ACTIVE')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          selectedSubscriber.paymentStatus === 'ACTIVE'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Set Active
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedSubscriber.id, 'PAST_DUE')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          selectedSubscriber.paymentStatus === 'PAST_DUE'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Mark Past Due
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedSubscriber.id, 'PENDING')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          selectedSubscriber.paymentStatus === 'PENDING'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Mark Pending
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSubscriberToDelete(selectedSubscriber);
                }}
                className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Subscriber Profile</span>
              </button>

              <button
                onClick={() => setSelectedSubscriber(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Subscribers */}
      {subscriberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  Delete Subscriber Record?
                </h4>
                <p className="text-xs text-rose-300">
                  {subscriberToDelete.name} ({subscriberToDelete.email})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete this subscriber profile created by error? This will permanently remove their active membership status and billing profile from the registry.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSubscriberToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSubscriber(subscriberToDelete.id);
                  if (selectedSubscriber?.id === subscriberToDelete.id) {
                    setSelectedSubscriber(null);
                  }
                  setSubscriberToDelete(null);
                  triggerToast('Subscriber Deleted', `Removed ${subscriberToDelete.name}'s profile from registry.`, 'info');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
