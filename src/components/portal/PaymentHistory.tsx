import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { TransactionRecord } from '../../types';
import { calculateMembershipTimeline } from '../../utils/loanDateEngine';
import { Receipt, Download, CheckCircle2, CreditCard, Landmark, QrCode, X, Printer, ShieldCheck } from 'lucide-react';

export const PaymentHistory: React.FC = () => {
  const { transactions, currentUser, tiers, setCurrentView } = useBroker();
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);

  const userTxs = transactions.filter((t) => t.userId === currentUser.id);
  const currentTier = tiers.find((t) => t.id === currentUser.membershipTierId);
  const membershipTimeline = calculateMembershipTimeline({
    memberSince: currentUser.memberSince,
    termStart: currentUser.membershipTermStart || currentUser.memberSince,
    renewalDate: currentUser.renewalDate,
    cycle: currentUser.membershipCycle,
    tierPeriod: currentTier?.period,
  });

  const getMethodBadge = (method: TransactionRecord['paymentMethod']) => {
    switch (method) {
      case 'STRIPE_CARD':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
            <span>Card (Stripe)</span>
          </span>
        );
      case 'WIRE_TRANSFER':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Bank Wire</span>
          </span>
        );
      case 'CRYPTO_USDC':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>USDC Web3</span>
          </span>
        );
      case 'CRYPTO_USDT':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>USDT Stablecoin</span>
          </span>
        );
      case 'CRYPTO_BTC':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Bitcoin (BTC)</span>
          </span>
        );
      case 'CRYPTO_ETH':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ethereum (ETH)</span>
          </span>
        );
      case 'CRYPTO_SOL':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-medium">
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Solana (SOL)</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-300">{method}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Current Subscription Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              {currentTier ? 'Active Retainer Schedule' : 'Membership Retainer Status'}
            </span>
            <h2 className="font-display text-xl font-bold text-white mt-1">
              {currentTier
                ? `${currentTier.name} · Active`
                : currentUser.pendingUpgrade?.status === 'PENDING_VERIFICATION'
                ? `${currentUser.pendingUpgrade.requestedTierName} · Pending Customer Care Approval`
                : 'No Active Membership Tier'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
              {currentTier ? (
                <>
                  Renewal Date: <strong className="text-slate-200">{membershipTimeline.renewalDateFormatted}</strong> ({membershipTimeline.remainingDays >= 0 ? `${membershipTimeline.remainingDays} days left` : 'Renewal Due'}) · Billed ${currentTier.price.toLocaleString()}/{currentTier.period}
                </>
              ) : (
                `Preferred Renewal Target: ${membershipTimeline.renewalDateFormatted} · Select a membership tier package in Overview to submit for Customer Care Support approval.`
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentView('PUBLIC');
                setTimeout(() => {
                  document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition-colors"
            >
              {currentTier ? 'Modify / Upgrade Tier' : 'Choose Membership Tier'}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions & Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-white text-sm">
              Invoices & Payment Receipts
            </h3>
            <p className="text-xs text-slate-400">
              Audit-compliant invoices with immutable merchant settlement signatures.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Invoice No</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {userTxs.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 font-mono text-slate-300">{tx.invoiceNumber}</td>
                  <td className="py-3.5 text-white font-medium">{tx.tierName}</td>
                  <td className="py-3.5">{getMethodBadge(tx.paymentMethod)}</td>
                  <td className="py-3.5 text-slate-400">{tx.date}</td>
                  <td className="py-3.5 font-mono font-bold text-white">
                    ${tx.amount.toLocaleString()} {tx.currency}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setSelectedReceipt(tx)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <Receipt className="w-3 h-3 text-emerald-400" />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white text-sm">
                    Tax Invoice & Proof of Payment
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedReceipt.invoiceNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Invoice Body */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-display font-bold text-base text-white">
                    STERLING WEALTH BROKER
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Canary Wharf, London · 40 Wall St, NYC
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    VAT/Tax ID: GB-849-019-224
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase">Paid On</span>
                  <div className="font-mono text-slate-300">{selectedReceipt.date}</div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-[10px] text-slate-500 uppercase">Billed To</span>
                <div className="text-white font-medium">{selectedReceipt.userName || currentUser.name}</div>
                {currentUser.company && <div className="text-slate-400">{currentUser.company}</div>}
                <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
                {(selectedReceipt.billingAddress || currentUser.billingAddress) && (
                  <div className="mt-1 text-[11px] text-slate-300 font-sans">
                    <p>{(selectedReceipt.billingAddress || currentUser.billingAddress)?.streetAddress}</p>
                    <p>
                      {(selectedReceipt.billingAddress || currentUser.billingAddress)?.city},{' '}
                      {(selectedReceipt.billingAddress || currentUser.billingAddress)?.state}{' '}
                      {(selectedReceipt.billingAddress || currentUser.billingAddress)?.zipCode}
                    </p>
                    <p className="text-emerald-400">
                      {(selectedReceipt.billingAddress || currentUser.billingAddress)?.country}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>{selectedReceipt.tierName}</span>
                  <span className="font-mono font-semibold">${selectedReceipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Platform Broker Advisory & Syndicate Underwriting Desk</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Zero-Knowledge AES-256 Vault Maintenance</span>
                  <span>Included</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline font-display">
                <span className="font-semibold text-white">Total Cleared</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ${selectedReceipt.amount.toLocaleString()} {selectedReceipt.currency}
                </span>
              </div>

              {selectedReceipt.cryptoDetails && (
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>On-Chain Settlement:</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      {selectedReceipt.cryptoDetails.cryptoAmount} {selectedReceipt.cryptoDetails.coin} ({selectedReceipt.cryptoDetails.network})
                    </span>
                  </div>
                  {selectedReceipt.cryptoDetails.blockNumber && (
                    <div className="flex justify-between">
                      <span>Block Height:</span>
                      <span className="font-mono text-slate-300">#{selectedReceipt.cryptoDetails.blockNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedReceipt.txHash && (
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 break-all">
                  <div className="flex items-center justify-between text-slate-400 mb-0.5">
                    <span>Cryptographic Tx Hash:</span>
                    {selectedReceipt.cryptoDetails?.explorerUrl && (
                      <span className="text-emerald-400">On-Chain Verified</span>
                    )}
                  </div>
                  <span className="text-slate-300">{selectedReceipt.txHash}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                PCI-DSS Cleared
              </span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
