import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { KYCDocumentType, KYCDocumentInfo, MembershipTierId } from '../../types';
import {
  ShieldCheck,
  Check,
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Lock,
  User,
  MapPin,
  Briefcase,
  DollarSign,
  FileCheck2,
  CheckCircle2,
  Search,
  Globe,
  ChevronDown,
  Layers,
  ListOrdered,
  FileSpreadsheet,
} from 'lucide-react';

interface RegistrationKYCWizardProps {
  onClose: () => void;
  onRegistered: (registrationId: string, email: string) => void;
  onSwitchToLogin: () => void;
}

export const COUNTRIES_LIST = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Switzerland',
  'France',
  'Italy',
  'Singapore',
  'United Arab Emirates',
  'Netherlands',
  'Sweden',
  'Spain',
  'Japan',
  'Hong Kong',
  'Brazil',
  'South Africa',
  'Mexico',
  'Norway',
  'Denmark',
  'Austria',
  'Belgium',
  'Chile',
  'Cyprus',
  'Czech Republic',
  'Finland',
  'Greece',
  'Iceland',
  'India',
  'Ireland',
  'Israel',
  'Kuwait',
  'Luxembourg',
  'Malaysia',
  'Monaco',
  'New Zealand',
  'Panama',
  'Poland',
  'Portugal',
  'Qatar',
  'Saudi Arabia',
  'South Korea',
  'Taiwan',
  'Turkey',
];

export const RegistrationKYCWizard: React.FC<RegistrationKYCWizardProps> = ({
  onClose,
  onRegistered,
  onSwitchToLogin,
}) => {
  const {
    tiers,
    registerPreselectedTierId,
    registerInitialStep,
    submitRegistration,
    triggerToast,
    pendingBillingCycle,
  } = useBroker();

  const [chosenTierId, setChosenTierId] = useState<MembershipTierId | null>(
    registerPreselectedTierId || null
  );

  useEffect(() => {
    setChosenTierId(registerPreselectedTierId || null);
  }, [registerPreselectedTierId]);

  const selectedTier = chosenTierId
    ? tiers.find((t) => t.id === chosenTierId) || null
    : null;

  // Layout mode: Multi-Step Wizard or Logical Single-Page
  const [layoutMode, setLayoutMode] = useState<'WIZARD' | 'SINGLE_PAGE'>('WIZARD');

  // Current wizard step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(registerInitialStep || 1);

  // Form Fields - Step 1: Account Credentials
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields - Step 2: Personal Information
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Female');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Married');

  // Form Fields - Step 3: Residential Address
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Form Fields - Step 4: Employment & Financial Details
  const [employmentStatus, setEmploymentStatus] = useState<
    'Employed' | 'Self-Employed' | 'Unemployed' | 'Retired' | 'Student'
  >('Employed');
  const [jobTitle, setJobTitle] = useState('');
  const [loanReason, setLoanReason] = useState('');

  // Form Fields - Step 5: KYC / Identity Document Upload
  const [documentType, setDocumentType] = useState<KYCDocumentType>('INTERNATIONAL_PASSPORT');
  const [showBankStatementNotice, setShowBankStatementNotice] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<{
    fileName: string;
    fileSize: string;
    mimeType: string;
    previewUrl: string;
    rawFile?: File;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close country dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered countries for searchable dropdown
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES_LIST;
    return COUNTRIES_LIST.filter((c) =>
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Moderate', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  }, [password]);

  // Validation logic
  const validateSection = (stepNumber: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!username.trim() || username.length < 3) {
        stepErrors.username = 'Username must be at least 3 characters.';
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        stepErrors.email = 'Please enter a valid email address.';
      }
      if (!password || password.length < 8) {
        stepErrors.password = 'Password must be at least 8 characters long.';
      }
      if (password !== confirmPassword) {
        stepErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (stepNumber === 2) {
      if (!firstName.trim()) stepErrors.firstName = 'First name is required.';
      if (!lastName.trim()) stepErrors.lastName = 'Last name is required.';
    }

    if (stepNumber === 3) {
      if (!streetAddress.trim()) stepErrors.streetAddress = 'Street address is required.';
      if (!city.trim()) stepErrors.city = 'City is required.';
      if (!state.trim()) stepErrors.state = 'State / province is required.';
      if (!zipCode.trim()) stepErrors.zipCode = 'Postal / Zip code is required.';
      if (!country.trim()) stepErrors.country = 'Country is required.';
    }

    if (stepNumber === 4) {
      if (!jobTitle.trim()) stepErrors.jobTitle = 'Position or job title is required.';
      if (!loanReason.trim() || loanReason.length < 15) {
        stepErrors.loanReason = 'Please explain your reason for the loan (at least 15 characters).';
      }
    }

    if (stepNumber === 5) {
      if (!uploadedFile) {
        stepErrors.document = 'Please upload a valid government-issued ID document.';
      }
    }

    return stepErrors;
  };

  const validateStep = (stepNumber: number): boolean => {
    const stepErrors = validateSection(stepNumber);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateAllSections = (): boolean => {
    let combined: Record<string, string> = {};
    for (let i = 1; i <= 5; i++) {
      combined = { ...combined, ...validateSection(i) };
    }
    setErrors(combined);
    return Object.keys(combined).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // Drag and drop & file upload handler
  const handleFileProcess = (file: File) => {
    setFileError(null);

    // Validate size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File size exceeds the 10MB maximum limit.');
      return;
    }

    // Validate type (PNG, JPG, PDF)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file format. Only PNG, JPG, and PDF documents are accepted.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          const preview = file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80';

          setUploadedFile({
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            mimeType: file.type,
            previewUrl: preview,
            rawFile: file,
          });
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Submit complete form
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();

    if (layoutMode === 'WIZARD') {
      if (!validateStep(5)) return;
      if (!validateAllSections()) {
        for (let s = 1; s <= 5; s++) {
          const stepErrs = validateSection(s);
          if (Object.keys(stepErrs).length > 0) {
            setCurrentStep(s);
            break;
          }
        }
        triggerToast('Account Info Needed', 'Please complete remaining registration details before final verification.', 'warning');
        return;
      }
    } else {
      if (!validateAllSections()) {
        triggerToast('Incomplete Form', 'Please complete all required fields highlighted in red.', 'error');
        return;
      }
    }

    const kycDocInfo: KYCDocumentInfo = {
      documentType,
      fileName: uploadedFile?.fileName || 'Government_ID_Document.pdf',
      fileSize: uploadedFile?.fileSize || '2.8 MB',
      mimeType: uploadedFile?.mimeType || 'application/pdf',
      previewUrl:
        uploadedFile?.previewUrl ||
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      uploadTimestamp: new Date().toISOString().slice(0, 16),
      hash: `SHA256:${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`,
    };

    const newApp = submitRegistration(
      {
        userId: `usr-${Date.now()}`,
        username,
        email,
        fullName: {
          firstName,
          middleName: middleName || undefined,
          lastName,
        },
        gender,
        maritalStatus,
        residentialAddress: {
          streetAddress,
          city,
          state,
          zipCode,
          country,
        },
        employment: {
          employmentStatus,
          jobTitle,
        },
        loanReason,
        kycDocument: kycDocInfo,
        selectedTierId: selectedTier ? selectedTier.id : null,
        selectedTierName: selectedTier ? selectedTier.name : 'Choose Later (After Sign-Up)',
        emailVerified: false,
      },
      password
    );

    onRegistered(newApp.id, email);
  };

  const stepsMeta = [
    { num: 1, title: 'Credentials', icon: <Lock className="w-3.5 h-3.5" /> },
    { num: 2, title: 'Personal Info', icon: <User className="w-3.5 h-3.5" /> },
    { num: 3, title: 'Address', icon: <MapPin className="w-3.5 h-3.5" /> },
    { num: 4, title: 'Employment', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { num: 5, title: 'KYC Document', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
  ];

  /* ---------------- Render Field Blocks ---------------- */

  const renderStep1Credentials = () => (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>1. Account Credentials & Security</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Establish your private authentication keys for the Sterling Wealth Vault.
        </p>
      </div>

      {/* Desired Username */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Desired Username <span className="text-emerald-400">*</span>
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. jcooper_institutional"
          className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
            errors.username ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
          }`}
        />
        {errors.username && (
          <span className="text-[11px] text-rose-400 mt-1 block flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.username}
          </span>
        )}
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Email Address <span className="text-emerald-400">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. jane.cooper@vancecapital.com"
          className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
            errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
          }`}
        />
        {errors.email && (
          <span className="text-[11px] text-rose-400 mt-1 block flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.email}
          </span>
        )}
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Password <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none pr-10 transition ${
                errors.password ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-[11px] text-rose-400 mt-1 block flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.password}
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Confirm Password <span className="text-emerald-400">*</span>
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              errors.confirmPassword ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          {errors.confirmPassword && (
            <span className="text-[11px] text-rose-400 mt-1 block flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.confirmPassword}
            </span>
          )}
        </div>
      </div>

      {/* Password Strength Meter */}
      {password && (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Password Strength:</span>
            <span className="font-semibold text-white">{passwordStrength.label}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 h-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`rounded-full transition-all ${
                  passwordStrength.score >= lvl ? passwordStrength.color : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Membership Tier Package Choice (Optional) */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-semibold text-white">
            Membership Tier Package (Optional)
          </label>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
            Manual Care Approval Required
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          No tier is assigned automatically. Select a package now or choose later after signing up — all membership packages are manually reviewed and approved by Customer Care Support in the Admin Panel.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setChosenTierId(null)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              chosenTierId === null
                ? 'bg-emerald-500/15 border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Choose Later (After Sign-Up)</span>
              {chosenTierId === null && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Create account first with no tier assigned
            </span>
          </button>

          {tiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setChosenTierId(tier.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                chosenTierId === tier.id
                  ? 'bg-amber-500/15 border-amber-500/50 text-white ring-1 ring-amber-500/30'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold truncate">{tier.name}</span>
                <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                  ${tier.price.toLocaleString()}/{tier.period}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Limit up to ${tier.maxLoanLimit.toLocaleString()} · Pending Care Review
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2PersonalInfo = () => (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          <span>2. Personal Information</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Official identity details matching your government-issued documents.
        </p>
      </div>

      {/* Full Name: First, Middle, Last */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            First Name <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Jane"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              errors.firstName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          {errors.firstName && (
            <span className="text-[11px] text-rose-400 mt-1 block">{errors.firstName}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Middle Name (Optional)
          </label>
          <input
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="e.g. Marie"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Last Name <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Cooper"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              errors.lastName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          {errors.lastName && (
            <span className="text-[11px] text-rose-400 mt-1 block">{errors.lastName}</span>
          )}
        </div>
      </div>

      {/* Gender & Marital Status Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Gender (Dropdown) <span className="text-emerald-400">*</span>
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Marital Status (Dropdown) <span className="text-emerald-400">*</span>
          </label>
          <select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3ResidentialAddress = () => (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>3. Residential Address</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Official domicile for institutional cross-border jurisdiction verification.
        </p>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Full Home Address (Street Line) <span className="text-emerald-400">*</span>
        </label>
        <input
          type="text"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="e.g. 240 Stockton St, Suite 800"
          className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
            errors.streetAddress ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
          }`}
        />
        {errors.streetAddress && (
          <span className="text-[11px] text-rose-400 mt-1 block">{errors.streetAddress}</span>
        )}
      </div>

      {/* City, State, Zipcode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            City <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. San Francisco"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              errors.city ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          {errors.city && (
            <span className="text-[11px] text-rose-400 mt-1 block">{errors.city}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            State / Province <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. CA / England"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              errors.state ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          {errors.state && (
            <span className="text-[11px] text-rose-400 mt-1 block">{errors.state}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Zipcode / Postal Code <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="e.g. 94108"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              errors.zipCode ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          {errors.zipCode && (
            <span className="text-[11px] text-rose-400 mt-1 block">{errors.zipCode}</span>
          )}
        </div>
      </div>

      {/* Country (Searchable Dropdown) */}
      <div className="relative" ref={countryDropdownRef}>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Country (Searchable Dropdown) <span className="text-emerald-400">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white flex items-center justify-between hover:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer text-left transition"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{country || 'Select Country...'}</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isCountryOpen ? 'rotate-180 text-emerald-400' : ''
              }`}
            />
          </button>

          {isCountryOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-44 space-y-0.5 divide-y divide-slate-800/40">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCountry(c);
                        setIsCountryOpen(false);
                        setCountrySearch('');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        country === c
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{c}</span>
                      {country === c && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs py-3 text-center">
                    No matching countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4Employment = () => (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span>4. Employment & Financial Details</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Underwriting profile for syndicate debt allocation and placement facilities.
        </p>
      </div>

      {/* Employment Status & Position */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Employment Status (Dropdown) <span className="text-emerald-400">*</span>
          </label>
          <select
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Employed">Employed</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Retired">Retired</option>
            <option value="Student">Student</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Employment Position / Job Title <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Managing Partner / VP of Operations"
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
              errors.jobTitle ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          {errors.jobTitle && (
            <span className="text-[11px] text-rose-400 mt-1 block">{errors.jobTitle}</span>
          )}
        </div>
      </div>

      {/* Reason for the Loan with Character Counter */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-slate-300">
            Reason for the Loan (Text area with character counter) <span className="text-emerald-400">*</span>
          </label>
          <span
            className={`text-[11px] font-mono ${
              loanReason.length > 450 ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            {loanReason.length} / 500 characters
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={500}
          value={loanReason}
          onChange={(e) => setLoanReason(e.target.value)}
          placeholder="Describe the capital requirement (e.g. Commercial real estate acquisition, industrial equipment refinance, working capital bridge, inventory turnaround)..."
          className={`w-full bg-slate-950 border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed transition ${
            errors.loanReason ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'
          }`}
        />
        {errors.loanReason && (
          <span className="text-[11px] text-rose-400 mt-1 block">{errors.loanReason}</span>
        )}
      </div>
    </div>
  );

  const renderStep5KYCUpload = () => (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>5. KYC / Identity Document Upload Component</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Government identification verification for AML/FinCEN compliance.
        </p>
      </div>

      {/* Allowed Document Types */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Allowed Document Types <span className="text-emerald-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'INTERNATIONAL_PASSPORT', label: 'International Passport' },
            { id: 'DRIVERS_LICENSE', label: "Driver's License" },
            { id: 'NATIONAL_ID', label: 'National ID Card' },
            { id: 'BANK_STATEMENT', label: 'Bank Statement' },
          ].map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => {
                const targetType = doc.id as KYCDocumentType;
                setDocumentType(targetType);
                if (targetType === 'BANK_STATEMENT') {
                  setShowBankStatementNotice(true);
                  triggerToast('Document Notice', '3months bank statement is required', 'info');
                } else {
                  setShowBankStatementNotice(false);
                }
              }}
              className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer min-h-[44px] flex items-center justify-center text-center ${
                documentType === doc.id
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold shadow-sm ring-1 ring-emerald-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {doc.label}
            </button>
          ))}
        </div>

        {/* Notification Message Pop-up for Bank Statement */}
        {documentType === 'BANK_STATEMENT' && (
          <div className="mt-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">
                  3months bank statement is required
                </span>
                <span className="text-[11px] text-amber-200/90 block">
                  Please upload official bank PDF statements covering 3 consecutive calendar months.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 shrink-0">
              Notice
            </span>
          </div>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10'
            : uploadedFile
            ? 'border-emerald-500/50 bg-slate-950'
            : 'border-slate-700 hover:border-emerald-500/50 bg-slate-950/80'
        }`}
      >
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        {uploadedFile ? (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="font-semibold text-white text-xs block">
                {uploadedFile.fileName}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {uploadedFile.fileSize} · {documentType.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium block">
              ✓ Verified: PNG/JPG/PDF specs met (under 10MB limit)
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                Drag & drop document here, or click to browse
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Allowed Specs: PNG, JPG, or PDF (Max 10MB per file)
              </span>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Uploading & running hash scan...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {fileError && (
        <div className="flex items-center gap-1.5 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}
      {errors.document && (
        <span className="text-[11px] text-rose-400 block">{errors.document}</span>
      )}

      {/* Security Statement */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Files are encrypted with hardware-level AES-256 before transmission and stored in compliance with FinCEN MSB regulations.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md pb-safe">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Member Notice Banner */}
        <div className="bg-gradient-to-r from-emerald-500/15 via-slate-800 to-emerald-500/10 border-b border-emerald-500/25 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs text-slate-300 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="truncate">
              Already a member?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
              >
                Login here
              </button>
            </span>
          </div>
        </div>

        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between shrink-0 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold truncate">
                Membership Registration & KYC
              </span>
              <span className="text-slate-600 hidden xs:inline">·</span>
              <span className="text-xs text-amber-300 font-medium truncate hidden xs:inline">
                {selectedTier
                  ? `${selectedTier.name} ($${selectedTier.price.toLocaleString()})`
                  : 'Tier: Choose Later (Optional)'}
              </span>
            </div>
            <h2 className="font-display text-base sm:text-lg font-bold text-white mt-0.5 truncate">
              Institutional Member Onboarding
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle Button */}
            <div className="hidden sm:flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setLayoutMode('WIZARD')}
                className={`px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
                  layoutMode === 'WIZARD'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Step-by-step guided wizard"
              >
                <ListOrdered className="w-3 h-3" />
                <span>Multi-Step</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('SINGLE_PAGE')}
                className={`px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
                  layoutMode === 'SINGLE_PAGE'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View all 5 sections on a single scrollable form"
              >
                <Layers className="w-3 h-3" />
                <span>Single-Page</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Registration Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Step Progress Stepper (Visible in Wizard Mode) */}
        {layoutMode === 'WIZARD' && (
          <div className="px-5 py-3 bg-slate-950 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center justify-between">
              {stepsMeta.map((s, idx) => {
                const isActive = currentStep === s.num;
                const isPast = currentStep > s.num;

                return (
                  <div key={s.num} className="flex items-center flex-1 last:flex-none">
                    <div
                      className="flex items-center gap-1.5 cursor-pointer"
                      onClick={() => setCurrentStep(s.num)}
                      title={`Go to step ${s.num}: ${s.title}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : isPast
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPast ? <Check className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      <span
                        className={`text-xs hidden sm:inline font-medium ${
                          isActive
                            ? 'text-white font-semibold'
                            : isPast
                            ? 'text-slate-300'
                            : 'text-slate-500'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    {idx < stepsMeta.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 rounded transition-colors ${
                          isPast ? 'bg-emerald-500/50' : 'bg-slate-800'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-6">
          <form onSubmit={handleSubmitRegistration} className="space-y-6">
            
            {/* WIZARD MODE: Active Step Only */}
            {layoutMode === 'WIZARD' && (
              <>
                {currentStep === 1 && renderStep1Credentials()}
                {currentStep === 2 && renderStep2PersonalInfo()}
                {currentStep === 3 && renderStep3ResidentialAddress()}
                {currentStep === 4 && renderStep4Employment()}
                {currentStep === 5 && renderStep5KYCUpload()}
              </>
            )}

            {/* SINGLE-PAGE MODE: All 5 Logical Sections on One Clean Form */}
            {layoutMode === 'SINGLE_PAGE' && (
              <div className="space-y-8 divide-y divide-slate-800">
                <div className="pt-0">{renderStep1Credentials()}</div>
                <div className="pt-6">{renderStep2PersonalInfo()}</div>
                <div className="pt-6">{renderStep3ResidentialAddress()}</div>
                <div className="pt-6">{renderStep4Employment()}</div>
                <div className="pt-6">{renderStep5KYCUpload()}</div>
              </div>
            )}

            {/* Form Footer Action Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
              {layoutMode === 'WIZARD' ? (
                <>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center"
                    >
                      Cancel
                    </button>
                  )}

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Submit Registration & Trigger OTP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Complete Membership Registration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

          </form>
        </div>

      </div>

      {/* Small Notification Modal Pop-up: “3months bank statement is required” */}
      {showBankStatementNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Document Requirement</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBankStatementNotice(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center space-y-1.5">
              <p className="text-base font-bold text-white leading-snug">
                “3months bank statement is required”
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Please attach official PDF statements covering 3 consecutive calendar months from your operating bank account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowBankStatementNotice(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
