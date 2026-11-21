import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { VaultDocument, DocumentType } from '../../types';
import {
  FolderLock,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileText,
  KeyRound,
  Eye,
  CheckCircle2,
  X,
} from 'lucide-react';

export const DocumentVault: React.FC = () => {
  const { documents, uploadDocument, currentUser } = useBroker();
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<VaultDocument | null>(null);

  // Upload modal states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<DocumentType>('BANK_STATEMENTS');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  const userDocs = documents.filter((d) => d.userId === currentUser.id);

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName) return;

    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setSimulatedProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        uploadDocument({
          userId: currentUser.id,
          type: uploadType,
          title: uploadTitle || uploadFileName.replace(/\.[^/.]+$/, ''),
          fileName: uploadFileName,
          fileSize: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
          mimeType: 'application/pdf',
        });
        setIsUploading(false);
        setUploadFileName('');
        setUploadTitle('');
        setSimulatedProgress(0);
      }
    }, 250);
  };

  const getStatusBadge = (status: VaultDocument['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographically Verified</span>
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Compliance Desk In-Review</span>
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Action Required</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Cryptographic Vault Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white">
                  Client Document Vault (KYC & Financials)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                  AES-256 Bit GCM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                All records uploaded to your Sterling Wealth Vault are encrypted client-side prior to storage. Only assigned brokers and credentialed compliance officers hold ephemeral decryption keys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vault Key: 0x9b4...f429</span>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-emerald-400" />
          <span>Upload Verification Document or Financial Statement</span>
        </h3>

        <form onSubmit={handleSimulatedUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Document Category</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as DocumentType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="BANK_STATEMENTS">Corporate Bank Statements</option>
                <option value="TAX_RETURNS">Audited Tax Returns (1120 / W-2)</option>
                <option value="GOVERNMENT_ID">Passport / Executive Driving License</option>
                <option value="BUSINESS_REGISTRATION">Articles of Incorporation / Good Standing</option>
                <option value="FINANCIAL_AUDIT">Certified P&L / CPA Balance Sheet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Q3 Commercial Statements"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Select File (PDF, DOCX, PNG)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Select or enter filename.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setUploadFileName(`Statement_${Date.now().toString().slice(-4)}.pdf`)}
                  className="min-h-[38px] px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Pick Sample
                </button>
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Encrypting with AES-256 client cipher...</span>
                <span>{simulatedProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUploading || !uploadFileName}
              className="min-h-[44px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Securing...' : 'Encrypt & Upload to Vault'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white text-sm">
            Active Vault Inventory ({userDocs.length} Documents)
          </h3>
          <span className="text-xs text-slate-400">
            Immutable Audit Trail Active
          </span>
        </div>

        <div className="space-y-3">
          {userDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-white">{doc.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({doc.fileSize})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {doc.fileName} · Uploaded {doc.uploadDate}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1 truncate max-w-md">
                    <span>Hash:</span>
                    <span className="text-slate-400">{doc.encryptionHash}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                <div>{getStatusBadge(doc.status)}</div>
                <button
                  type="button"
                  onClick={() => setSelectedDocForPreview(doc)}
                  className="min-h-[38px] px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 hover:text-white border border-slate-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Inspector Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-semibold text-white text-sm">
                  Cryptographic File Proof
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocForPreview(null)}
                className="text-slate-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>File Name:</span>
                  <span className="font-mono text-white">{selectedDocForPreview.fileName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>File Size:</span>
                  <span className="text-white">{selectedDocForPreview.fileSize}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Audit Status:</span>
                  <span className="text-emerald-400 font-semibold">{selectedDocForPreview.status}</span>
                </div>
                {selectedDocForPreview.verifiedBy && (
                  <div className="flex justify-between text-slate-400">
                    <span>Verified By:</span>
                    <span className="text-slate-200">{selectedDocForPreview.verifiedBy}</span>
                  </div>
                )}
                {selectedDocForPreview.verificationNotes && (
                  <div className="text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500 block">Reviewer Feedback:</span>
                    {selectedDocForPreview.verificationNotes}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  SHA-256 Immutable Signature:
                </span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono break-all text-emerald-400">
                  {selectedDocForPreview.encryptionHash}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocForPreview(null)}
                className="min-h-[40px] px-5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
