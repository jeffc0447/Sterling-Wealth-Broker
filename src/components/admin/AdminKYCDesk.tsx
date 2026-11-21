import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { VaultDocument } from '../../types';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  X,
  KeyRound,
} from 'lucide-react';

export const AdminKYCDesk: React.FC = () => {
  const { documents, verifyDocument } = useBroker();
  const [selectedDocToReview, setSelectedDocToReview] = useState<VaultDocument | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const pendingDocs = documents.filter((d) => d.status === 'PENDING_REVIEW');
  const processedDocs = documents.filter((d) => d.status !== 'PENDING_REVIEW');

  const handleDecision = (approved: boolean) => {
    if (!selectedDocToReview) return;
    verifyDocument(
      selectedDocToReview.id,
      approved,
      reviewNote || (approved ? 'Document verified against government / corporate registry records.' : 'Incomplete documentation. Please re-upload certified copy.')
    );
    setSelectedDocToReview(null);
    setReviewNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Compliance & KYC Verification Desk
            </h2>
            <p className="text-xs text-slate-400">
              Audit incoming user ID, business registration certificates, and corporate tax schedules under AML/KYC standards.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Knowledge Decryption Desk</span>
          </div>
        </div>
      </div>

      {/* Pending Reviews Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
            <span>Pending Compliance Review</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs">
              {pendingDocs.length} Pending
            </span>
          </h3>
        </div>

        {pendingDocs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800/80">
            All user KYC and financial records are cleared. Zero pending queue.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-white">{doc.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({doc.fileSize})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {doc.fileName} · User: {doc.userId}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-md mt-1">
                      {doc.encryptionHash}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDocToReview(doc);
                    setReviewNote('');
                  }}
                  className="min-h-[40px] px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-lg text-xs transition-all shrink-0 cursor-pointer shadow-sm shadow-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  Inspect & Verify
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History of Audited Documents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-display font-semibold text-white text-sm mb-4">
          Audited Documents Archive ({processedDocs.length} Records)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Document Title</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Hash Signature</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Audited By</th>
                <th className="pb-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {processedDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3 text-white font-medium">{doc.title}</td>
                  <td className="py-3 font-mono text-slate-400 text-[11px]">{doc.type}</td>
                  <td className="py-3 font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                    {doc.encryptionHash.slice(0, 20)}...
                  </td>
                  <td className="py-3">
                    {doc.status === 'VERIFIED' ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-rose-400 font-medium flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300 text-[11px]">{doc.verifiedBy || 'Compliance Officer'}</td>
                  <td className="py-3 text-slate-400 text-[11px] max-w-[200px] truncate">
                    {doc.verificationNotes || 'Covenant cleared'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedDocToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-semibold text-white text-base">
                  KYC Verification Review
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocToReview(null)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Close KYC review modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Document:</span>
                <span className="text-white font-medium">{selectedDocToReview.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File:</span>
                <span className="font-mono text-slate-300">{selectedDocToReview.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Cipher:</span>
                <span className="text-emerald-400 font-mono">AES-256 Validated</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono break-all text-slate-400">
                {selectedDocToReview.encryptionHash}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Compliance Officer Audit Notes / Feedback
              </label>
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter verification comments or rejection rationale..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleDecision(false)}
                className="min-h-[44px] px-4 py-2 bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                Reject with Note
              </button>

              <button
                type="button"
                onClick={() => handleDecision(true)}
                className="min-h-[44px] px-5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Verify KYC</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
