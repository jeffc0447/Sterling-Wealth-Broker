import React, { useState } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  XCircle,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  User,
  MapPin,
  Briefcase,
  Layers,
  Calendar,
  Mail,
  Fingerprint,
  AlertTriangle,
  Send,
  Award
} from 'lucide-react';
import { RegistrationApplication } from '../../types';
import { useBroker } from '../../context/BrokerContext';

interface AdminMemberReviewModalProps {
  application: RegistrationApplication | null;
  onClose: () => void;
}

export const AdminMemberReviewModal: React.FC<AdminMemberReviewModalProps> = ({
  application,
  onClose,
}) => {
  const { approveRegistration, rejectRegistration, activeAdminRole, triggerToast } = useBroker();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!application) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      approveRegistration(application.id, `Admin (${activeAdminRole})`);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionNote.trim()) {
      triggerToast('Rejection Note Required', 'Please specify a reason or instructions for document re-submission.', 'error');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      rejectRegistration(application.id, rejectionNote, `Admin (${activeAdminRole})`);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  const formatDocType = (type: string) => {
    switch (type) {
      case 'INTERNATIONAL_PASSPORT':
        return 'International Passport';
      case 'DRIVERS_LICENSE':
        return "Driver's License";
      case 'NATIONAL_ID':
        return 'National Identity Card';
      case 'BANK_STATEMENT':
        return 'Bank Statement (3 Months)';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

        {/* Modal Topbar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  KYC Verification & Membership Review
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {application.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Submitted on {application.submittedAt} · Reviewer: {activeAdminRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill */}
            {application.status === 'APPROVED' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approved
              </span>
            )}
            {application.status === 'REJECTED' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                <XCircle className="w-3.5 h-3.5" />
                Action Required / Rejected
              </span>
            )}
            {application.status === 'PENDING' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Pending Compliance Review
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Applicant Dossier (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Verification Status Card */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                Security Verification Checks
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Email OTP Check:</span>
                  {application.emailVerified ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Pending OTP
                    </span>
                  )}
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Selected Tier:</span>
                  <span className="text-indigo-300 font-semibold flex items-center gap-1 mt-0.5">
                    <Award className="w-3 h-3" />
                    {application.selectedTierName}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Account & Personal Info */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                Applicant Identity
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Full Name</span>
                  <span className="text-white font-medium">
                    {application.fullName.firstName}{' '}
                    {application.fullName.middleName ? `${application.fullName.middleName} ` : ''}
                    {application.fullName.lastName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Username</span>
                  <span className="text-slate-200 font-mono">@{application.username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Email Address</span>
                  <span className="text-emerald-400 font-medium">{application.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Gender</span>
                  <span className="text-slate-200">{application.gender}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Marital Status</span>
                  <span className="text-slate-200">{application.maritalStatus}</span>
                </div>
              </div>
            </div>

            {/* 2. Residential Address */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Residential Address
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Street</span>
                  <span className="text-white font-medium text-right">
                    {application.residentialAddress.streetAddress}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">City & State</span>
                  <span className="text-slate-200">
                    {application.residentialAddress.city}, {application.residentialAddress.state}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Postal / Zipcode</span>
                  <span className="text-slate-200 font-mono">
                    {application.residentialAddress.zipCode}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Country</span>
                  <span className="text-slate-200 font-semibold">
                    {application.residentialAddress.country}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Employment & Purpose */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Employment & Financial Purpose
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Employment Status</span>
                  <span className="text-white font-medium">
                    {application.employment.employmentStatus}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Job Title</span>
                  <span className="text-slate-200">{application.employment.jobTitle}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">Reason for Loan / Capital Need:</span>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed italic text-[11px]">
                    "{application.loanReason}"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Document Viewer & Compliance Desk (7 cols) */}
          <div className="lg:col-span-7 space-y-5 flex flex-col">
            {/* Document Viewer Frame */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">
                      {formatDocType(application.kycDocument.documentType)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {application.kycDocument.fileName} · {application.kycDocument.fileSize}
                  </p>
                </div>

                {/* Viewer Controls */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-300 px-1.5">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-700 mx-0.5" />
                  <button
                    onClick={handleRotate}
                    title="Rotate 90° Clockwise"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetView}
                    title="Reset Zoom & Rotation"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Canvas Display */}
              <div className="relative my-4 flex-1 min-h-[300px] max-h-[460px] bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
                <div
                  className="transition-transform duration-200 ease-out origin-center select-none"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                >
                  <img
                    src={application.kycDocument.previewUrl}
                    alt="Applicant KYC Document"
                    className="max-h-[360px] w-auto object-contain rounded-md shadow-2xl border border-slate-700/60"
                  />
                </div>

                {/* Audit Watermark */}
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-slate-400 border border-slate-800 font-mono">
                  SHA-256: {application.kycDocument.hash.substring(0, 16)}...
                </div>
              </div>

              {/* Document Meta Hash */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cryptographic File Hash (Immutable Vault Record):</span>
                  <span className="text-emerald-400 font-mono">Verified Match</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 break-all select-all">
                  {application.kycDocument.hash}
                </div>
              </div>
            </div>

            {/* Rejection / Resubmit Form (Conditional) */}
            {showRejectForm && (
              <form
                onSubmit={handleReject}
                className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Specify Reason for Document Re-Submission or Rejection
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="e.g., ID photo has glare on expiration date, please re-upload clear full-page photo of Passport."
                  rows={3}
                  className="w-full bg-slate-950 border border-red-500/40 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Rejection & Request Re-upload</span>
                </button>
              </form>
            )}

            {/* Current Admin Audit Trail */}
            {application.reviewedBy && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Last Reviewed By:</span>
                  <span className="text-white font-medium">{application.reviewedBy}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Reviewed Timestamp:</span>
                  <span className="text-slate-300">{application.reviewedAt}</span>
                </div>
                {application.adminRejectionNote && (
                  <div className="pt-1.5 border-t border-slate-800/80">
                    <span className="text-red-400 block font-semibold text-[11px]">Audit Note:</span>
                    <p className="text-slate-300 italic text-[11px] mt-0.5">
                      "{application.adminRejectionNote}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Close Window
          </button>

          <div className="flex items-center gap-3">
            {application.status === 'PENDING' && !showRejectForm && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject / Request Re-submit</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Approving...' : 'Approve Account & Provision Tier'}</span>
                </button>
              </>
            )}

            {application.status === 'REJECTED' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Re-evaluate & Approve</span>
              </button>
            )}

            {application.status === 'APPROVED' && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Account Verified & Active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
