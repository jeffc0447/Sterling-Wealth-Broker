import React, { useState, useRef, useEffect } from 'react';
import { useBroker, PublicPage } from '../../context/BrokerContext';
import {
  Shield,
  ShieldCheck,
  Lock,
  User,
  Building2,
  ExternalLink,
  LogOut,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Star,
  Coins,
  Briefcase,
  Layers,
  Phone,
  Compass,
  Award,
  Users,
  HelpCircle,
  UserPlus,
  LayoutDashboard,
} from 'lucide-react';
import { ADMIN_PROFILES } from '../../data/initialData';

interface AboutDropdownItem {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  page: PublicPage;
}

const ABOUT_DROPDOWN_ITEMS: AboutDropdownItem[] = [
  {
    id: 'company-overview',
    label: 'Company Overview',
    subtitle: 'Institutional heritage, scale & $1.4B+ track record',
    icon: Building2,
    page: 'company-overview',
  },
  {
    id: 'our-vision-mission',
    label: 'Our Vision & Mission',
    subtitle: 'Multi-rail credit syndication & core principles',
    icon: Compass,
    page: 'vision-mission',
  },
  {
    id: 'ceos-message',
    label: 'CEO’s Message',
    subtitle: 'Strategic execution letter from Julian Sterling',
    icon: Award,
    page: 'ceo-message',
  },
  {
    id: 'our-team',
    label: 'Our Team',
    subtitle: 'Credit committee & Wall Street underwriters',
    icon: Users,
    page: 'our-team',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    subtitle: 'Institutional borrower reviews & Trustpilot 4.9/5',
    icon: Star,
    page: 'testimonials',
  },
  {
    id: 'membership-tiers-benefits',
    label: 'Membership Tiers Benefits',
    subtitle: 'Turnaround SLAs, underwriting priority & wholesale APRs',
    icon: ShieldCheck,
    page: 'membership-benefits',
  },
  {
    id: 'faq',
    label: 'FAQ',
    subtitle: 'Frequently asked underwriting & settlement questions',
    icon: HelpCircle,
    page: 'faq',
  },
];

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    publicPage,
    navigateToPublicPage,
    portalTab,
    setPortalTab,
    adminTab,
    setAdminTab,
    activeAdminRole,
    currentUser,
    subscribers,
    tiers,
    isAdminAuthenticated,
    adminLogout,
    setShowAdminLoginModal,
    setShowLoginModal,
    openRegistrationWithTier,
    isClientAuthenticated,
  } = useBroker();

  // Desktop "About Us" dropdown state
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const aboutTriggerRef = useRef<HTMLButtonElement>(null);
  const aboutMenuRef = useRef<HTMLDivElement>(null);
  const aboutItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedAboutIndex, setFocusedAboutIndex] = useState<number>(-1);

  // Desktop "Loan Products" dropdown state
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Desktop "Login / Sign Up" dropdown state
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  // Mobile single dropdown menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAboutAccordionOpen, setIsMobileAboutAccordionOpen] = useState(false);
  const [isMobileProductsAccordionOpen, setIsMobileProductsAccordionOpen] = useState(false);
  const [isMobileLoginAccordionOpen, setIsMobileLoginAccordionOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsProductsDropdownOpen(false);
      }
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(target)) {
        setIsAboutDropdownOpen(false);
        setFocusedAboutIndex(-1);
      }
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(target)) {
        setIsLoginDropdownOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProductsDropdownOpen(false);
        setIsAboutDropdownOpen(false);
        setIsLoginDropdownOpen(false);
        setIsMobileMenuOpen(false);
        setFocusedAboutIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const userTier = tiers.find((t) => t.id === currentUser.membershipTierId);
  const pendingCount = subscribers.filter(
    (s) => s.paymentStatus === 'PENDING' || s.approvalStatus === 'AWAITING_PAYMENT_VERIFICATION'
  ).length;

  const handleNavClick = (page: PublicPage) => {
    navigateToPublicPage(page);
    setIsProductsDropdownOpen(false);
    setIsAboutDropdownOpen(false);
    setIsLoginDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleAboutTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsAboutDropdownOpen(true);
      setFocusedAboutIndex(0);
      setTimeout(() => {
        aboutItemRefs.current[0]?.focus();
      }, 50);
    } else if (e.key === 'Escape' && isAboutDropdownOpen) {
      e.preventDefault();
      setIsAboutDropdownOpen(false);
      setFocusedAboutIndex(-1);
    }
  };

  const handleAboutMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsAboutDropdownOpen(false);
      setFocusedAboutIndex(-1);
      aboutTriggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (focusedAboutIndex + 1) % ABOUT_DROPDOWN_ITEMS.length;
      setFocusedAboutIndex(nextIndex);
      aboutItemRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (focusedAboutIndex - 1 + ABOUT_DROPDOWN_ITEMS.length) % ABOUT_DROPDOWN_ITEMS.length;
      setFocusedAboutIndex(prevIndex);
      aboutItemRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedAboutIndex(0);
      aboutItemRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = ABOUT_DROPDOWN_ITEMS.length - 1;
      setFocusedAboutIndex(lastIndex);
      aboutItemRefs.current[lastIndex]?.focus();
    } else if (e.key === 'Tab') {
      setIsAboutDropdownOpen(false);
      setFocusedAboutIndex(-1);
    }
  };

  const isAboutActive =
    currentView === 'PUBLIC' &&
    (publicPage === 'about' ||
      publicPage === 'company-overview' ||
      publicPage === 'vision-mission' ||
      publicPage === 'ceo-message' ||
      publicPage === 'our-team' ||
      publicPage === 'testimonials' ||
      publicPage === 'membership-benefits' ||
      publicPage === 'faq');

  const isLoanProductsActive =
    currentView === 'PUBLIC' &&
    (publicPage === 'personal-loan' ||
      publicPage === 'business-loan' ||
      publicPage === 'financial-instrument' ||
      publicPage === 'pricing' ||
      publicPage === 'membership');

  const handleAboutItemClick = (page: PublicPage) => {
    setIsAboutDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileAboutAccordionOpen(false);
    setFocusedAboutIndex(-1);

    navigateToPublicPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyNow = () => {
    openRegistrationWithTier('gold');
    setIsLoginDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLoginAction = () => {
    if (isClientAuthenticated) {
      setCurrentView('PORTAL');
      setPortalTab('OVERVIEW');
    } else {
      setShowLoginModal(true);
    }
    setIsLoginDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignUpAction = () => {
    openRegistrationWithTier('gold');
    setIsLoginDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Top Security & Regulatory Trust Bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-1 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Trust Badges Left */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              256-Bit SSL Encrypted
            </span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="flex items-center gap-1 shrink-0 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              FinCEN MSB #31000218849
            </span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="hidden md:inline shrink-0">FDIC Partner Bank Routing</span>
            <span className="text-slate-600 hidden lg:inline">·</span>
            <span className="hidden lg:flex items-center gap-1 shrink-0 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              Trustpilot 4.9/5 · BBB A+ Rating
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* Logo (Top Left) */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-h-[44px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md group-hover:border-emerald-400 transition-colors shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display tracking-wider text-xs xs:text-sm sm:text-base font-bold text-white flex items-center gap-1 truncate">
                STERLING <span className="text-emerald-400 font-normal">WEALTH</span> <span className="hidden xs:inline">BROKER</span>
              </div>
              <p className="text-[8px] sm:text-[9px] tracking-widest text-slate-400 uppercase font-sans truncate">
                Institutional Financial Brokerage
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {/* 1. Home */}
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors py-1 cursor-pointer ${
                currentView === 'PUBLIC' && publicPage === 'home'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </button>

            {/* 2. ABOUT US (Dropdown Menu) */}
            <div
              className="relative"
              ref={aboutDropdownRef}
              onMouseEnter={() => setIsAboutDropdownOpen(true)}
              onMouseLeave={() => {
                setIsAboutDropdownOpen(false);
                setFocusedAboutIndex(-1);
              }}
            >
              <button
                ref={aboutTriggerRef}
                id="about-nav-trigger"
                type="button"
                aria-haspopup="true"
                aria-expanded={isAboutDropdownOpen}
                aria-controls="about-dropdown-menu"
                onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                onKeyDown={handleAboutTriggerKeyDown}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  isAboutActive
                    ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>About Us</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isAboutDropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Desktop Dropdown Floating Menu */}
              {isAboutDropdownOpen && (
                <div
                  id="about-dropdown-menu"
                  role="menu"
                  aria-labelledby="about-nav-trigger"
                  ref={aboutMenuRef}
                  onKeyDown={handleAboutMenuKeyDown}
                  className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Corporate Syndicate</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Profile</span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {ABOUT_DROPDOWN_ITEMS.map((item, idx) => {
                      const IconComponent = item.icon;
                      const isFocused = focusedAboutIndex === idx;
                      return (
                        <button
                          key={item.id}
                          role="menuitem"
                          tabIndex={isFocused ? 0 : -1}
                          ref={(el) => {
                            aboutItemRefs.current[idx] = el;
                          }}
                          onClick={() => handleAboutItemClick(item.page)}
                          onMouseEnter={() => setFocusedAboutIndex(idx)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 group cursor-pointer ${
                            isFocused
                              ? 'bg-slate-800 border border-emerald-500/30 shadow-sm'
                              : 'hover:bg-slate-800/80 hover:border-slate-700/50 border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isFocused
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                : 'bg-slate-800/80 border border-slate-700/60 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white flex items-center justify-between group-hover:text-emerald-300">
                              <span className="truncate">{item.label}</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-emerald-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                              {item.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-slate-400">Canary Wharf & Wall St Desks</span>
                    <button
                      onClick={() => handleNavClick('about')}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Loan Products (Dropdown Menu incl. Membership Tiers) */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setIsProductsDropdownOpen(true)}
              onMouseLeave={() => setIsProductsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  isLoanProductsActive
                    ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                    : 'text-slate-300 hover:text-white'
                }`}
                aria-haspopup="true"
                aria-expanded={isProductsDropdownOpen}
              >
                <span>Loan Products</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isProductsDropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Dropdown Floating Menu */}
              {isProductsDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Institutional Debt &amp; Membership Catalog
                  </div>

                  <div className="p-1 space-y-1">
                    {/* Personal Loan */}
                    <button
                      type="button"
                      onClick={() => handleNavClick('personal-loan')}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 hover:bg-slate-800/80 cursor-pointer ${
                        publicPage === 'personal-loan' ? 'bg-slate-800 border border-emerald-500/30' : 'border border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Personal Loan</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Up to $100k</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          Unsecured personal credit, debt consolidation, 4.75% starting APR.
                        </p>
                      </div>
                    </button>

                    {/* Business Loan */}
                    <button
                      type="button"
                      onClick={() => handleNavClick('business-loan')}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 hover:bg-slate-800/80 cursor-pointer ${
                        publicPage === 'business-loan' ? 'bg-slate-800 border border-emerald-500/30' : 'border border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Business Loan</span>
                          <span className="text-[10px] text-indigo-400 font-mono">Up to $2.5M+</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          Revolving lines of credit, commercial mortgages, equipment funding.
                        </p>
                      </div>
                    </button>

                    {/* Financial Instrument */}
                    <button
                      type="button"
                      onClick={() => handleNavClick('financial-instrument')}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 hover:bg-slate-800/80 cursor-pointer ${
                        publicPage === 'financial-instrument' ? 'bg-slate-800 border border-amber-500/30' : 'border border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Financial Instrument</span>
                          <span className="text-[10px] text-amber-400 font-mono">$15M+ Limit</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          Standby Letters of Credit (SBLC), Bank Guarantees (BG), and POF.
                        </p>
                      </div>
                    </button>

                    {/* Membership Tiers (moved under Loan Products) */}
                    <button
                      type="button"
                      onClick={() => handleNavClick('pricing')}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 hover:bg-slate-800/80 cursor-pointer ${
                        publicPage === 'pricing' || publicPage === 'membership'
                          ? 'bg-slate-800 border border-emerald-500/30'
                          : 'border border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>Membership Tiers</span>
                          <span className="text-[10px] text-teal-400 font-mono">Tier 1 – 4</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          Silver, Gold, Platinum &amp; Diamond borrowing limits and underwriting SLAs.
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Guaranteed SLA Turnaround</span>
                    <button
                      type="button"
                      onClick={() => handleNavClick('pricing')}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      Compare Tiers →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Contact */}
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className={`transition-colors py-1 cursor-pointer ${
                currentView === 'PUBLIC' && publicPage === 'contact'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Header CTAs (Desktop) & Single Dropdown Toggle (Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Login & Sign Up Dropdown */}
            <div
              className="relative hidden lg:block"
              ref={loginDropdownRef}
              onMouseEnter={() => setIsLoginDropdownOpen(true)}
              onMouseLeave={() => setIsLoginDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isLoginDropdownOpen}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition border border-slate-700/80 cursor-pointer min-h-[44px]"
                title={isClientAuthenticated ? 'Member Portal & Account Options' : 'Login or Sign Up'}
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Login</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isLoginDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {isLoginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Client Account Access
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      type="button"
                      onClick={handleLoginAction}
                      className="w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 hover:bg-slate-800/80 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">
                          {isClientAuthenticated ? 'Open Membership Dashboard' : 'Login'}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {isClientAuthenticated
                            ? 'Return to your active client portal'
                            : 'Sign in with existing member credentials'}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleSignUpAction}
                      className="w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 hover:bg-slate-800/80 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-emerald-400">Sign Up</div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          Register a new institutional membership
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Header CTA Button: 'Apply Now' */}
            <button
              type="button"
              onClick={handleApplyNow}
              className="hidden lg:flex py-2 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25 transition-all items-center gap-1.5 cursor-pointer active:scale-95 min-h-[44px]"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile Single Dropdown Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] px-3 flex items-center justify-center gap-1.5 rounded-xl text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-emerald-400" />
              ) : (
                <Menu className="w-5 h-5 text-emerald-400" />
              )}
              <span className="text-xs font-semibold">Menu</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isMobileMenuOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Single Dropdown Menu (All header features accessible from one dropdown) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute inset-x-0 top-full max-h-[calc(100dvh-5.5rem)] bg-slate-950/98 backdrop-blur-xl border-b border-slate-800 shadow-2xl z-50 overflow-y-auto pb-safe animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 sm:px-6 py-4 space-y-2.5 max-w-lg mx-auto">
            {/* Nav Links */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`w-full min-h-[44px] text-left py-2.5 px-4 rounded-xl text-sm font-semibold transition flex items-center cursor-pointer ${
                  publicPage === 'home' && currentView === 'PUBLIC'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-900 active:bg-slate-800'
                }`}
              >
                Home
              </button>

              {/* Accordion: ABOUT US */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isMobileAboutAccordionOpen}
                  onClick={() => setIsMobileAboutAccordionOpen(!isMobileAboutAccordionOpen)}
                  className={`w-full min-h-[44px] text-left py-2.5 px-4 flex items-center justify-between text-sm font-semibold transition cursor-pointer ${
                    isAboutActive ? 'text-emerald-400 bg-slate-900/90' : 'text-white hover:text-emerald-400 active:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>About Us</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isMobileAboutAccordionOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isMobileAboutAccordionOpen && (
                  <div className="px-2 sm:px-3 pb-3 pt-1 space-y-1 border-t border-slate-800/80 bg-slate-950">
                    {ABOUT_DROPDOWN_ITEMS.map((item) => {
                      const IconComponent = item.icon;
                      const isItemActive = publicPage === item.page;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAboutItemClick(item.page)}
                          className={`w-full min-h-[44px] text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                            isItemActive
                              ? 'bg-slate-900 text-emerald-400 font-semibold'
                              : 'hover:bg-slate-900 active:bg-slate-800 text-slate-300 hover:text-emerald-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <IconComponent className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-medium text-white block truncate">{item.label}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{item.subtitle}</span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 font-mono shrink-0">→</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion: Loan Products (includes Membership Tiers) */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isMobileProductsAccordionOpen}
                  onClick={() => setIsMobileProductsAccordionOpen(!isMobileProductsAccordionOpen)}
                  className={`w-full min-h-[44px] text-left py-2.5 px-4 flex items-center justify-between text-sm font-semibold transition cursor-pointer ${
                    isLoanProductsActive ? 'text-emerald-400 bg-slate-900/90' : 'text-white hover:text-emerald-400 active:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Loan Products</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isMobileProductsAccordionOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isMobileProductsAccordionOpen && (
                  <div className="px-2 sm:px-3 pb-3 pt-1 space-y-1 border-t border-slate-800/80 bg-slate-950">
                    <button
                      type="button"
                      onClick={() => handleNavClick('personal-loan')}
                      className={`w-full min-h-[44px] text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        publicPage === 'personal-loan' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-medium text-white block">Personal Loan</span>
                          <span className="text-[10px] text-slate-400 block">Unsecured personal credit</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">$5k–$100k</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('business-loan')}
                      className={`w-full min-h-[44px] text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        publicPage === 'business-loan' ? 'bg-slate-800 text-indigo-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div>
                          <span className="font-medium text-white block">Business Loan</span>
                          <span className="text-[10px] text-slate-400 block">Revolving credit &amp; mortgage</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded shrink-0">$50k–$2.5M</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('financial-instrument')}
                      className={`w-full min-h-[44px] text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        publicPage === 'financial-instrument' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-medium text-white block">Financial Instrument</span>
                          <span className="text-[10px] text-slate-400 block">SBLC, BG, POF liquidity</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded shrink-0">$15M+</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('pricing')}
                      className={`w-full min-h-[44px] text-left p-2.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        publicPage === 'pricing' || publicPage === 'membership'
                          ? 'bg-slate-800 text-teal-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                        <div>
                          <span className="font-medium text-white block">Membership Tiers</span>
                          <span className="text-[10px] text-slate-400 block">Silver, Gold, Platinum &amp; Diamond</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded shrink-0">Tier 1–4</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleNavClick('contact')}
                className={`w-full min-h-[44px] text-left py-2.5 px-4 rounded-xl text-sm font-semibold transition flex items-center cursor-pointer ${
                  publicPage === 'contact' && currentView === 'PUBLIC'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-900 active:bg-slate-800'
                }`}
              >
                Contact
              </button>

              {/* Accordion: Login & Sign Up */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isMobileLoginAccordionOpen}
                  onClick={() => setIsMobileLoginAccordionOpen(!isMobileLoginAccordionOpen)}
                  className="w-full min-h-[44px] text-left py-2.5 px-4 flex items-center justify-between text-sm font-semibold text-white hover:text-emerald-400 active:bg-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Login</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isMobileLoginAccordionOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isMobileLoginAccordionOpen && (
                  <div className="px-2 sm:px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-800/80 bg-slate-950">
                    <button
                      type="button"
                      onClick={handleLoginAction}
                      className="w-full min-h-[44px] text-left p-2.5 rounded-lg text-xs transition flex items-center gap-2.5 text-slate-200 hover:bg-slate-900 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-white block">
                          {isClientAuthenticated ? 'Open Membership Dashboard' : 'Login'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {isClientAuthenticated ? 'Access your client dashboard' : 'Sign in to your member account'}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleSignUpAction}
                      className="w-full min-h-[44px] text-left p-2.5 rounded-lg text-xs transition flex items-center gap-2.5 text-emerald-400 hover:bg-slate-900 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-emerald-400 block">Sign Up</span>
                        <span className="text-[10px] text-slate-400 block">Create a new membership account</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Primary CTA inside single mobile dropdown */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleApplyNow}
                className="w-full min-h-[48px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Badges in Mobile Drawer */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Licensed Syndicate Brokerage</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-snug">
                FinCEN MSB #31000218849 · 256-Bit SSL Encrypted Vaults · FDIC Insured Depository Routing
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
