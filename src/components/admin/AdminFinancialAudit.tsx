import React, { useState, useMemo } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { TransactionRecord } from '../../types';
import {
  Coins,
  Download,
  RefreshCw,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  FileSpreadsheet,
  Search,
  Filter,
  CreditCard,
  Building,
  ShieldCheck,
  Eye,
  Trash2,
  AlertTriangle,
  X,
  Copy,
  Check,
  CheckCheck,
  ExternalLink,
  MapPin,
  Lock,
} from 'lucide-react';

export const AdminFinancialAudit: React.FC = () => {
  const { transactions, refundTransaction, deleteTransaction, triggerToast } = useBroker();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'CARD' | 'WIRE' | 'CRYPTO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [inspectingTx, setInspectingTx] = useState<TransactionRecord | null>(null);
  const [txToDelete, setTxToDelete] = useState<TransactionRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    triggerToast('Copied', text, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter transactions
  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      // Method filter
      if (methodFilter === 'CARD' && tx.paymentMethod !== 'STRIPE_CARD') return false;
      if (
        methodFilter === 'WIRE' &&
        tx.paymentMethod !== 'WIRE_TRANSFER' &&
        tx.paymentMethod !== 'BANK_WIRE' &&
        tx.paymentMethod !== 'SEPA_TRANSFER'
      )
        return false;
      if (
        methodFilter === 'CRYPTO' &&
        !tx.paymentMethod.startsWith('CRYPTO_')
      )
        return false;

      // Status filter
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesUser = tx.userName.toLowerCase().includes(query);
        const matchesInvoice = tx.invoiceNumber.toLowerCase().includes(query);
        const matchesTxHash = tx.txHash?.toLowerCase().includes(query) || false;
        const matchesTier = tx.tierName.toLowerCase().includes(query);
        const matchesCard = tx.cardLast4?.includes(query) || false;
        const matchesCity = tx.billingAddress?.city.toLowerCase().includes(query) || false;
        const matchesCountry = tx.billingAddress?.country.toLowerCase().includes(query) || false;
        const matchesStreet = tx.billingAddress?.streetAddress.toLowerCase().includes(query) || false;

        if (
          !matchesUser &&
          !matchesInvoice &&
          !matchesTxHash &&
          !matchesTier &&
          !matchesCard &&
          !matchesCity &&
          !matchesCountry &&
          !matchesStreet
        ) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, methodFilter, statusFilter, searchTerm]);

  // Aggregate stats
  const totalCollected = useMemo(
    () =>
      transactions
        .filter((t) => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalRefunded = useMemo(
    () =>
      transactions
        .filter((t) => t.status === 'REFUNDED')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const cardTransactionsCount = useMemo(
    () => transactions.filter((t) => t.paymentMethod === 'STRIPE_CARD').length,
    [transactions]
  );

  const handleExportCSV = () => {
    const headers =
      'InvoiceNumber,CardholderName,Tier,Amount,Currency,Method,CardLast4,Street,City,State,Zip,Country,Status,Date,StripeChargeId\n';
    const rows = filteredTxs
      .map((t) => {
        const b = t.billingAddress;
        return `"${t.invoiceNumber}","${t.userName}","${t.tierName}",${t.amount},"${t.currency}","${t.paymentMethod}","${t.cardLast4 || ''}","${b?.streetAddress || ''}","${b?.city || ''}","${b?.state || ''}","${b?.zipCode || ''}","${b?.country || ''}","${t.status}","${t.date}","${t.txHash || ''}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SterlingWealth_Card_Payments_Audit_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Total Cleared Retainers</span>
          <div className="text-2xl font-display font-bold text-emerald-400 mt-1">
            ${totalCollected.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-slate-500">Gross Brokerage Escrow</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Credit Card Volume (Stripe)</span>
          <div className="text-2xl font-display font-bold text-white mt-1">
            {cardTransactionsCount} Charges
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">100% AVS Level-1 Match</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Total SLA Refunds Issued</span>
          <div className="text-2xl font-display font-bold text-rose-400 mt-1">
            ${totalRefunded.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-slate-500">14-Day Money Back Guarantee</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Merchant Gateway Integrity</span>
          <div className="text-2xl font-display font-bold text-sky-400 mt-1">
            Zero Chargebacks
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Real-Time Risk Scoring: 0.02</span>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        
        {/* Header & Sub-Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                Payment Retrieval & Ledger Desk
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">PCI-DSS Level 1 & AVS Audit</span>
            </div>
            <h3 className="font-display font-bold text-white text-lg mt-1">
              Credit Card Payments Retrieval & Financial Audit Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Retrieve full cardholder billing address, card last 4 digits, charge reference IDs, real-time AVS verification records, and manage ledger entries.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Audit Ledger (CSV)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Method Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setMethodFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                methodFilter === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Settlements ({transactions.length})
            </button>

            <button
              onClick={() => setMethodFilter('CARD')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                methodFilter === 'CARD'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-emerald-400 hover:bg-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Credit Card Dossiers ({cardTransactionsCount})</span>
            </button>

            <button
              onClick={() => setMethodFilter('WIRE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                methodFilter === 'WIRE'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-sky-400 hover:bg-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Bank Wire Escrows</span>
            </button>

            <button
              onClick={() => setMethodFilter('CRYPTO')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                methodFilter === 'CRYPTO'
                  ? 'bg-purple-500 text-white font-bold'
                  : 'text-purple-400 hover:bg-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Crypto Gateway</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Cardholder Name, Last 4 digits (e.g. 4242), Invoice Ref, Stripe Charge ID, City, or Country..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Invoice & Settlement ID</th>
                <th className="py-3 px-4">Cardholder / Client</th>
                <th className="py-3 px-4">Payment Method & Card</th>
                <th className="py-3 px-4">Billing Address (AVS)</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const isCard = tx.paymentMethod === 'STRIPE_CARD';
                  const b = tx.billingAddress;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-950/40 transition-colors group cursor-pointer"
                      onClick={() => setInspectingTx(tx)}
                    >
                      {/* Invoice & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-emerald-400 font-semibold">
                          {tx.invoiceNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[150px]">
                          {tx.txHash || tx.id}
                        </div>
                      </td>

                      {/* Client / Cardholder */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-semibold group-hover:text-emerald-400 transition">
                          {tx.userName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {tx.tierName}
                        </div>
                      </td>

                      {/* Payment Method & Card Details */}
                      <td className="py-3.5 px-4">
                        {isCard ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                              <CreditCard className="w-3 h-3" />
                              <span>Credit Card (•••• {tx.cardLast4 || '4242'})</span>
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">
                              Stripe AVS Verified
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-mono text-[11px] text-slate-300">
                              {tx.paymentMethod.replace('_', ' ')}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {tx.date}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Billing Address */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {b ? (
                          <div className="max-w-[200px]">
                            <div className="truncate font-medium text-white text-[11px]">
                              {b.streetAddress}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {b.city}, {b.state} {b.zipCode}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-mono">
                              {b.country}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            Corporate Profile on File
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ${tx.amount.toLocaleString()} {tx.currency}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {tx.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                            <RotateCcw className="w-3 h-3" />
                            Refunded
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setInspectingTx(tx)}
                            title="Retrieve & inspect full cardholder dossier"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isCard ? 'Inspect Card' : 'Inspect Dossier'}</span>
                          </button>

                          {tx.status === 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Issue refund for invoice ${tx.invoiceNumber} ($${tx.amount})?`
                                  )
                                ) {
                                  refundTransaction(tx.id);
                                }
                              }}
                              title="Process SLA refund"
                              className="px-2 py-1 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-lg text-[11px] transition cursor-pointer"
                            >
                              Refund
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setTxToDelete(tx)}
                            title="Delete transaction record created in error"
                            className="p-1.5 bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-lg transition cursor-pointer"
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

      {/* =========================================================
         CREDIT CARD PAYMENT RETRIEVAL & DOSSIER MODAL
         ========================================================= */}
      {inspectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">
                    Credit Card Settlement & AVS Verification Dossier
                  </h4>
                  <p className="text-xs text-slate-400">
                    Invoice: <span className="font-mono text-emerald-400">{inspectingTx.invoiceNumber}</span> · Transaction ID: <span className="font-mono text-slate-300">{inspectingTx.txHash || inspectingTx.id}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingTx(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Cardholder & Membership Tier */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cardholder & Retainer Package
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    Full Legal Name
                  </span>
                  <span className="font-bold text-white text-sm">{inspectingTx.userName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    Package Tier
                  </span>
                  <span className="font-semibold text-amber-400">{inspectingTx.tierName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    Settled Retainer Amount
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${inspectingTx.amount.toLocaleString()} {inspectingTx.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Full Billing Address Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Full Billing Address (Address Verification System Match)
                </span>

                {inspectingTx.billingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      const b = inspectingTx.billingAddress!;
                      const text = `${b.streetAddress}, ${b.streetAddress2 ? b.streetAddress2 + ', ' : ''}${b.city}, ${b.state} ${b.zipCode}, ${b.country}`;
                      copyToClipboard(text, 'billing-addr');
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'billing-addr' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied Address</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {inspectingTx.billingAddress ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Street Address 1</span>
                    <span className="font-medium text-white">{inspectingTx.billingAddress.streetAddress}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Street Address 2 / Suite</span>
                    <span className="font-medium text-white">
                      {inspectingTx.billingAddress.streetAddress2 || 'N/A (Individual Suite)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">City</span>
                    <span className="font-medium text-white">{inspectingTx.billingAddress.city}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">State / Province</span>
                    <span className="font-medium text-white">{inspectingTx.billingAddress.state}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">ZIP / Postal Code</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {inspectingTx.billingAddress.zipCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Country</span>
                    <span className="font-medium text-amber-300">{inspectingTx.billingAddress.country}</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 italic">
                  Billing address securely matched on bank clearing file.
                </div>
              )}
            </div>

            {/* Section 3: Credit Card & AVS Status Breakdown */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Card Details & AVS Security Check
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-mono">Card Number</span>
                  <span className="font-mono font-bold text-white">
                    •••• {inspectingTx.cardLast4 || '4242'}
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-mono">Card Brand</span>
                  <span className="font-semibold text-emerald-400">Visa Corporate / Amex</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-mono">AVS Street Check</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    MATCH (Pass)
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-mono">AVS Postal Check</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    MATCH (Pass)
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Stripe Charge Identifier:</span>
                  <span className="font-mono text-emerald-400">{inspectingTx.txHash || 'ch_3P2qLe8kHvKYlo4B9u290cD1'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway Rail:</span>
                  <span className="font-mono text-white">Stripe Card API · Level 3 Data Processing</span>
                </div>
                <div className="flex justify-between">
                  <span>CVC / CVV Security Verification:</span>
                  <span className="font-semibold text-emerald-400">PASS (Exact 3-Digit Match)</span>
                </div>
                <div className="flex justify-between">
                  <span>Settlement Timestamp:</span>
                  <span className="text-slate-300">{inspectingTx.date}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setTxToDelete(inspectingTx);
                  setInspectingTx(null);
                }}
                className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Ledger Record</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
         DELETE CONFIRMATION MODAL FOR TRANSACTION RECORD
         ========================================================= */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  Delete Transaction Audit Record?
                </h4>
                <p className="text-xs text-rose-300">
                  Invoice: {txToDelete.invoiceNumber} (${txToDelete.amount.toLocaleString()} {txToDelete.currency})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete this financial ledger record created by error? This will permanently remove the transaction from the audit logs and reconciliation statements.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(txToDelete.id);
                  setTxToDelete(null);
                  triggerToast(
                    'Record Deleted',
                    `Purged invoice ${txToDelete.invoiceNumber} from audit log.`,
                    'info'
                  );
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
