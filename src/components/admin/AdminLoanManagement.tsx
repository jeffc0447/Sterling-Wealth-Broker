import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { LoanApplication, ApplicationStatus } from '../../types';
import {
  KanbanSquare,
  List,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  FileText,
  AlertCircle,
  Sparkles,
  Send,
} from 'lucide-react';

export const AdminLoanManagement: React.FC = () => {
  const { applications, updateApplicationStatus, tiers } = useBroker();
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [selectedAppForAction, setSelectedAppForAction] = useState<LoanApplication | null>(null);

  // Action modal form states
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [selectedPartnerBank, setSelectedPartnerBank] = useState<string>('Barclays Corporate Banking');
  const [underwriterNoteInput, setUnderwriterNoteInput] = useState<string>('');

  const columns: Array<{ status: ApplicationStatus; title: string; color: string }> = [
    { status: 'PENDING', title: 'Pending Review', color: 'border-amber-500/50' },
    { status: 'UNDER_REVIEW', title: 'Desk Underwriting', color: 'border-sky-500/50' },
    { status: 'PARTNER_SUBMITTED', title: 'Partner Bank Submitted', color: 'border-indigo-500/50' },
    { status: 'APPROVED', title: 'Syndicate Approved', color: 'border-emerald-500/50' },
    { status: 'DISBURSED', title: 'Disbursed', color: 'border-emerald-400' },
  ];

  const handleOpenActionModal = (app: LoanApplication) => {
    setSelectedAppForAction(app);
    setNewStatus(app.status);
    setSelectedPartnerBank(app.partnerBank || 'Barclays Corporate Banking');
    setUnderwriterNoteInput('');
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForAction) return;

    updateApplicationStatus(
      selectedAppForAction.id,
      newStatus,
      selectedPartnerBank,
      underwriterNoteInput || undefined
    );
    setSelectedAppForAction(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Loan & Credit Facility Pipeline Management
          </h2>
          <p className="text-xs text-slate-400">
            Track underwriter covenant evaluations, partner bank matches, and capital disbursement.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('KANBAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'KANBAN'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('LIST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'LIST'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {columns.map((col) => {
            const colApps = applications.filter((a) => a.status === col.status);
            const colVolume = colApps.reduce((sum, a) => sum + a.requestedAmount, 0);

            return (
              <div
                key={col.status}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex flex-col h-[680px]"
              >
                {/* Column Header */}
                <div className={`pb-3 mb-3 border-b-2 ${col.color}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{col.title}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center">
                      {colApps.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    ${colVolume.toLocaleString()} Total
                  </div>
                </div>

                {/* Column Card List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleOpenActionModal(app)}
                      className="bg-slate-950 border border-slate-800/90 hover:border-amber-500/60 rounded-xl p-3.5 cursor-pointer transition-all hover:-translate-y-0.5 space-y-2 group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-slate-400">{app.applicationNumber}</span>
                        <span className="font-mono uppercase text-amber-400 font-semibold">
                          {app.tierAtSubmission === 'unassigned' ? 'No Tier' : app.tierAtSubmission}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {app.applicantName}
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {app.instrumentTitle}
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-baseline justify-between">
                        <span className="font-display font-bold text-emerald-400 text-sm">
                          ${app.requestedAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {app.termMonths}m
                        </span>
                      </div>

                      {app.partnerBank && (
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-mono">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{app.partnerBank.split(' ')[0]}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-600">
                      No files in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST TABLE VIEW */}
      {viewMode === 'LIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Ref #</th>
                  <th className="pb-3 font-semibold">Borrower</th>
                  <th className="pb-3 font-semibold">Facility / Instrument</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Active Tier</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Syndicate Partner</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-3 font-mono text-slate-300">{app.applicationNumber}</td>
                    <td className="py-3">
                      <div className="font-semibold text-white">{app.applicantName}</div>
                      <div className="text-[10px] text-slate-400">{app.applicantEmail}</div>
                    </td>
                    <td className="py-3 text-slate-300">{app.instrumentTitle}</td>
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      ${app.requestedAmount.toLocaleString()}
                    </td>
                    <td className="py-3 font-mono uppercase text-amber-400">
                      {app.tierAtSubmission === 'unassigned' ? 'No Tier' : app.tierAtSubmission}
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] font-medium text-slate-200">
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {app.partnerBank || 'Unassigned'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleOpenActionModal(app)}
                        className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors"
                      >
                        Underwrite
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Underwriting & Partner Bank Action Modal */}
      {selectedAppForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-semibold text-white text-base">
                  Underwriter Action: {selectedAppForAction.applicationNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppForAction(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Application Overview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Applicant:</span>
                <span className="text-white font-medium">{selectedAppForAction.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requested Capital:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${selectedAppForAction.requestedAmount.toLocaleString()} ({selectedAppForAction.termMonths} Months)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Facility:</span>
                <span className="text-slate-200">{selectedAppForAction.instrumentTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Credit Score:</span>
                <span className="text-slate-200">{selectedAppForAction.creditScore}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-slate-300">
                <span className="text-slate-500 block">Stated Purpose:</span>
                {selectedAppForAction.purpose}
              </div>
            </div>

            <form onSubmit={handleSaveAction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Advance Pipeline Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="UNDER_REVIEW">Desk Underwriting</option>
                    <option value="PARTNER_SUBMITTED">Partner Bank Submitted</option>
                    <option value="APPROVED">Syndicate Approved</option>
                    <option value="DISBURSED">Capital Disbursed</option>
                    <option value="REJECTED">Decline Application</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Assigned Partner Bank</label>
                  <select
                    value={selectedPartnerBank}
                    onChange={(e) => setSelectedPartnerBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Barclays Corporate Banking">Barclays Corporate Banking</option>
                    <option value="JPMorgan Real Estate Capital">JPMorgan Real Estate Capital</option>
                    <option value="Goldman Sachs Syndicated Debt">Goldman Sachs Syndicated Debt</option>
                    <option value="PNC Equipment Finance">PNC Equipment Finance</option>
                    <option value="UBS Private Wealth Credit">UBS Private Wealth Credit</option>
                    <option value="Standard Chartered Trade Desk">Standard Chartered Trade Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Attach Underwriter / Lender Notes
                </label>
                <textarea
                  rows={2}
                  value={underwriterNoteInput}
                  onChange={(e) => setUnderwriterNoteInput(e.target.value)}
                  placeholder="e.g. Audited financials meet 2.4x DSCR. Forwarded term sheet to Barclays Syndicated Credit Desk..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForAction(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition-colors shadow-md shadow-amber-500/20"
                >
                  Save Underwriting Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
