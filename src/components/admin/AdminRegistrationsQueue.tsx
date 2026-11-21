import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  User,
  Fingerprint,
  Mail,
  Award,
  ChevronRight,
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';
import { RegistrationApplication } from '../../types';
import { AdminMemberReviewModal } from './AdminMemberReviewModal';

export const AdminRegistrationsQueue: React.FC = () => {
  const { registrationApplications, activeAdminRole, deleteRegistrationApplication, triggerToast } = useBroker();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);
  const [appToDelete, setAppToDelete] = useState<RegistrationApplication | null>(null);

  // Filter applications
  const filteredApps = registrationApplications.filter((app) => {
    const matchesSearch =
      app.fullName.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fullName.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = registrationApplications.length;
  const pendingCount = registrationApplications.filter((a) => a.status === 'PENDING').length;
  const approvedCount = registrationApplications.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = registrationApplications.filter((a) => a.status === 'REJECTED').length;

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case 'INTERNATIONAL_PASSPORT':
        return 'Passport';
      case 'DRIVERS_LICENSE':
        return "Driver's Lic.";
      case 'NATIONAL_ID':
        return 'National ID';
      case 'BANK_STATEMENT':
        return 'Bank Statement';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Registrations</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-400 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400 font-medium">Approved & Active</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-red-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-red-400 font-medium">Action Required</p>
            <p className="text-2xl font-bold text-red-400 mt-0.5">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Member Registrations & KYC Compliance Queue
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review personal information, verify government-issued ID documents, and provision membership tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, ID..."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    statusFilter === status
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status === 'ALL'
                    ? 'All'
                    : status === 'PENDING'
                    ? `Pending (${pendingCount})`
                    : status === 'APPROVED'
                    ? 'Approved'
                    : 'Action Req.'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Applicant & ID</th>
                <th className="py-3 px-4">Contact & OTP</th>
                <th className="py-3 px-4">Requested Tier</th>
                <th className="py-3 px-4">KYC Document</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No member registration records match the current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    {/* Applicant & ID */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-white group-hover:text-emerald-400 transition">
                          {app.fullName.firstName} {app.fullName.lastName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400">
                            {app.id}
                          </span>
                          <span className="text-[10px] text-slate-500">·</span>
                          <span className="text-[10px] text-slate-400">
                            @{app.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact & OTP Status */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="text-slate-200">{app.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {app.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              OTP Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              <Clock className="w-2.5 h-2.5" />
                              Pending OTP
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {app.residentialAddress.country}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Requested Tier */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-700/40">
                        <Award className="w-3 h-3 text-indigo-400" />
                        {app.selectedTierName}
                      </span>
                    </td>

                    {/* KYC Document */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">
                            {getDocTypeLabel(app.kycDocument.documentType)}
                          </p>
                          <p className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                            {app.kycDocument.fileName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {app.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                          <XCircle className="w-3 h-3" />
                          Action Required
                        </span>
                      )}
                      {app.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Submitted */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {app.submittedAt}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Dossier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAppToDelete(app)}
                          title="Delete application record created in error"
                          className="p-1.5 bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal for Registrations Queue */}
        {appToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">
                    Delete Registration Application?
                  </h4>
                  <p className="text-xs text-rose-300">
                    Applicant: {appToDelete.fullName.firstName} {appToDelete.fullName.lastName} ({appToDelete.email})
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete this applicant profile and KYC record created by error? This will permanently remove the application from the compliance queue.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAppToDelete(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteRegistrationApplication(appToDelete.id);
                    setAppToDelete(null);
                    triggerToast('Application Deleted', `Purged ${appToDelete.fullName.firstName} ${appToDelete.fullName.lastName} from queue.`, 'info');
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

        {/* Table Footer */}
        <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-300">{filteredApps.length}</strong> of{' '}
            <strong className="text-slate-300">{registrationApplications.length}</strong> applicants
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Automatic OCR & Hash Verification enabled
          </span>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <AdminMemberReviewModal
          application={
            registrationApplications.find((a) => a.id === selectedApp.id) || selectedApp
          }
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};
