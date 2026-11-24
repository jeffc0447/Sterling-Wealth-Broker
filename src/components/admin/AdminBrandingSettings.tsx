import React, { useState, useRef } from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  Shield,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const AdminBrandingSettings: React.FC = () => {
  const {
    siteBranding,
    updateSiteBranding,
    removeSiteLogo,
    resetSiteBranding,
    navigateToPublicPage,
    triggerToast,
  } = useBroker();

  const [siteName, setSiteName] = useState(siteBranding.siteName);
  const [siteTagline, setSiteTagline] = useState(siteBranding.siteTagline);
  const [logoUrl, setLogoUrl] = useState<string | null>(siteBranding.logoUrl);
  const [logoFileName, setLogoFileName] = useState<string | undefined>(siteBranding.logoFileName);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a PNG, JPG, WebP, or SVG logo image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Logo file exceeds 2 MB. Please upload a smaller image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (result) {
        setLogoUrl(result);
        setLogoFileName(file.name);
        triggerToast(
          'New Logo Uploaded',
          `Loaded "${file.name}". Click "Save Logo & Brand Name" to publish it live.`,
          'info'
        );
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the selected image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePreviousLogo = () => {
    setLogoUrl(null);
    setLogoFileName(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    removeSiteLogo();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!siteName.trim()) {
      setErrorMsg('Website name cannot be empty.');
      return;
    }

    updateSiteBranding({
      siteName: siteName.trim(),
      siteTagline: siteTagline.trim() || 'Institutional Financial Brokerage',
      logoUrl,
      logoFileName,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  const handleResetAll = () => {
    resetSiteBranding();
    setSiteName('Sterling Wealth Broker');
    setSiteTagline('Institutional Financial Brokerage');
    setLogoUrl(null);
    setLogoFileName(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const nameParts = (siteName.trim() || 'Sterling Wealth Broker').split(/\s+/);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-semibold uppercase tracking-wider">
            Brand Identity Manager
          </span>
          <h2 className="font-display text-2xl font-bold text-white mt-2">
            Website Logo &amp; Brand Name Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload a new website logo, delete the previous uploaded logo, and update the website brand name shown in the header, footer, and login pages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateToPublicPage('home')}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 shrink-0 cursor-pointer transition"
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Preview Live Header</span>
        </button>
      </div>

      {/* Live Preview Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Live Header Brand Preview
          </span>
          {logoUrl ? (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
              Custom Logo Active {logoFileName ? `(${logoFileName})` : ''}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-lg">
              Default Emblem Active
            </span>
          )}
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md overflow-hidden shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName || 'Website Logo'}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                <Shield className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-display tracking-wider text-sm sm:text-base font-bold text-white flex items-center gap-1 flex-wrap uppercase">
                {nameParts.length >= 2 ? (
                  <>
                    <span>{nameParts[0]}</span>
                    <span className="text-emerald-400 font-semibold">{nameParts[1]}</span>
                    {nameParts.length > 2 && <span>{nameParts.slice(2).join(' ')}</span>}
                  </>
                ) : (
                  <span>{siteName || 'Website Name'}</span>
                )}
              </div>
              <p className="text-[9px] tracking-widest text-slate-400 uppercase font-sans truncate">
                {siteTagline || 'Institutional Financial Brokerage'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Controls */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Logo Upload & Delete Previous Logo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Website Logo Image</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload a new logo image (PNG, JPG, WebP, or SVG, max 2 MB) or delete the previous uploaded logo.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Logo Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Current uploaded logo"
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                <Shield className="w-9 h-9 text-emerald-400/80" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
              <p className="text-xs font-semibold text-white truncate">
                {logoUrl ? logoFileName || 'Uploaded Custom Logo' : 'No custom logo uploaded'}
              </p>
              <p className="text-[11px] text-slate-400">
                {logoUrl
                  ? 'Delete the previous logo below or upload a new file to replace it.'
                  : 'Currently displaying the default security shield emblem.'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{logoUrl ? 'Upload Replacement Logo' : 'Upload New Logo'}</span>
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePreviousLogo}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Previous Logo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-6 text-center transition cursor-pointer group"
          >
            <Upload className="w-7 h-7 text-slate-400 group-hover:text-emerald-400 mx-auto mb-2 transition" />
            <p className="text-xs font-semibold text-slate-200">
              Click to select a new website logo file
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Recommended: Transparent PNG or SVG (square or landscape, up to 2 MB)
            </p>
          </button>
        </div>

        {/* Right: Website Name & Tagline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Website Name &amp; Tagline</h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize the website logo name displayed across the navigation header, footer, browser tab title, and login screen.
              </p>
            </div>

            <div>
              <label
                htmlFor="branding-site-name"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Website Logo Name
              </label>
              <input
                id="branding-site-name"
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. InvestPro Asset Broker"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="branding-site-tagline"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Website Tagline / Subtitle
              </label>
              <input
                id="branding-site-tagline"
                type="text"
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
                placeholder="e.g. Institutional Financial Brokerage"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            {savedNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Website logo and brand name updated live across the application.</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Logo &amp; Brand Name</span>
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
