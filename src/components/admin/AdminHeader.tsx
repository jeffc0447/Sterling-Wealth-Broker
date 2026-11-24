import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useBroker, AdminTab } from '../../context/BrokerContext';
import { ADMIN_PROFILES } from '../../data/initialData';
import {
  BarChart3,
  KanbanSquare,
  FileCheck2,
  PackagePlus,
  Coins,
  ShieldCheck,
  UserCheck,
  Lock,
  LogOut,
  Users,
  CheckCircle2,
  Database,
  Image as ImageIcon,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    activeAdminRole,
    setActiveAdminRole,
    authenticatedAdmin,
    adminLogout,
    navigateToPublicPage,
    registrationApplications,
  } = useBroker();
  const currentAdmin =
    authenticatedAdmin ||
    ADMIN_PROFILES.find((a) => a.role === activeAdminRole) ||
    ADMIN_PROFILES[0];

  const pendingRegistrationsCount = registrationApplications.filter(
    (app) => app.status === 'PENDING'
  ).length;

  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollArrows = useCallback(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollArrows();
    window.addEventListener('resize', updateScrollArrows);
    return () => window.removeEventListener('resize', updateScrollArrows);
  }, [updateScrollArrows]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const step = Math.max(260, Math.round(el.clientWidth * 0.55));
    el.scrollBy({
      left: direction === 'right' ? step : -step,
      behavior: 'smooth',
    });
  };

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode; roles: string[]; badgeCount?: number }> = [
    {
      id: 'APPROVAL_QUEUE',
      label: 'Tier Approval Queue',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      roles: ['SUPER_ADMIN', 'LOAN_SPECIALIST', 'COMPLIANCE_OFFICER', 'CUSTOMER_SUPPORT'],
    },
    {
      id: 'REGISTRATIONS_QUEUE',
      label: 'Member Registrations & KYC',
      icon: <FileCheck2 className="w-4 h-4 text-emerald-400" />,
      roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'LOAN_SPECIALIST', 'CUSTOMER_SUPPORT'],
      badgeCount: pendingRegistrationsCount,
    },
    {
      id: 'ANALYTICS',
      label: 'Executive Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'LOAN_SPECIALIST', 'COMPLIANCE_OFFICER', 'CUSTOMER_SUPPORT'],
    },
    {
      id: 'SUBSCRIBERS',
      label: 'Memberships & Subscribers',
      icon: <Users className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'CUSTOMER_SUPPORT', 'COMPLIANCE_OFFICER', 'LOAN_SPECIALIST'],
    },
    {
      id: 'APPLICATIONS',
      label: 'Loan Pipeline (Kanban)',
      icon: <KanbanSquare className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'LOAN_SPECIALIST'],
    },
    {
      id: 'KYC_DESK',
      label: 'KYC Verification Desk',
      icon: <FileCheck2 className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
    },
    {
      id: 'PACKAGE_BUILDER',
      label: 'Package Builder (CMS)',
      icon: <PackagePlus className="w-4 h-4" />,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'BRANDING',
      label: 'Logo & Site Name',
      icon: <ImageIcon className="w-4 h-4 text-emerald-400" />,
      roles: ['SUPER_ADMIN', 'CUSTOMER_SUPPORT', 'COMPLIANCE_OFFICER'],
    },
    {
      id: 'HOMEPAGE_CMS',
      label: 'Homepage CMS Editor',
      icon: <FileCheck2 className="w-4 h-4 text-amber-400" />,
      roles: ['SUPER_ADMIN', 'CUSTOMER_SUPPORT', 'COMPLIANCE_OFFICER'],
    },
    {
      id: 'SUPPORT_CONFIG',
      label: 'Bank Wire, Agent & Crypto',
      icon: <UserCheck className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'CUSTOMER_SUPPORT', 'COMPLIANCE_OFFICER'],
    },
    {
      id: 'AUDIT_LOGS',
      label: 'Financial & Audit Logs',
      icon: <Coins className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
    },
    {
      id: 'SECURITY',
      label: 'RBAC & Security Desk',
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'],
    },
    {
      id: 'CPANEL_MYSQL',
      label: 'cPanel & MySQL Hub',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      roles: ['SUPER_ADMIN', 'LOAN_SPECIALIST', 'COMPLIANCE_OFFICER', 'CUSTOMER_SUPPORT'],
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        
        {/* Admin Bar identity */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-slate-800 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-base shadow-lg shadow-amber-950/40">
              {currentAdmin.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-white">
                  {currentAdmin.name}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-semibold">
                  {currentAdmin.role.replace('_', ' ')}
                </span>
                {currentAdmin.email === 'admin@admin.com' && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                    Initial Root Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{currentAdmin.title}</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-amber-400/90">{currentAdmin.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick RBAC Role Switcher */}
            <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 p-2 rounded-xl">
              <span className="text-xs text-slate-400 pl-1">Switch RBAC Persona:</span>
              <div className="flex flex-wrap gap-1">
                {ADMIN_PROFILES.map((admin) => (
                  <button
                    key={admin.id}
                    type="button"
                    onClick={() => setActiveAdminRole(admin.role)}
                    className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      activeAdminRole === admin.role
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {admin.name.split(' ')[0]} ({admin.avatar})
                  </button>
                ))}
              </div>
            </div>

            {/* Return to Public Website */}
            <button
              type="button"
              onClick={() => navigateToPublicPage('home')}
              className="min-h-[44px] px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
              title="View Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Website</span>
            </button>

            {/* Logout Admin Button */}
            <button
              type="button"
              onClick={adminLogout}
              className="min-h-[44px] px-3.5 py-2 bg-slate-950 hover:bg-rose-950/70 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              title="Sign out of System Administrator Desk"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Tabs with Previous / Next Feature Arrows */}
        <div className="relative flex items-center gap-2 pt-5 border-t border-slate-800/80 mt-4">
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll to previous features"
            title="Previous features"
            className={`shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border transition-all ${
              canScrollLeft
                ? 'bg-slate-950 hover:bg-slate-800 text-amber-400 border-amber-500/40 cursor-pointer shadow-sm active:scale-95'
                : 'bg-slate-950/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={tabsScrollRef}
            onScroll={updateScrollArrows}
            className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth"
          >
            {tabs.map((tab) => {
              const hasRoleAccess = tab.roles.includes(activeAdminRole);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => {
                    setAdminTab(tab.id);
                    e.currentTarget.scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                      inline: 'nearest',
                    });
                  }}
                  className={`flex items-center gap-2 min-h-[40px] py-2 px-3.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    adminTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : hasRoleAccess
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/70 active:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-400 opacity-60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        adminTab === tab.id
                          ? 'bg-slate-950 text-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {tab.badgeCount}
                    </span>
                  )}
                  {!hasRoleAccess && <Lock className="w-3 h-3 text-slate-600" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollTabs('right')}
            disabled={!canScrollRight}
            aria-label="Scroll to next features"
            title="Next features"
            className={`shrink-0 min-h-[40px] px-2.5 flex items-center justify-center gap-1 rounded-lg border text-xs font-semibold transition-all ${
              canScrollRight
                ? 'bg-slate-950 hover:bg-slate-800 text-amber-400 border-amber-500/40 cursor-pointer shadow-sm active:scale-95'
                : 'bg-slate-950/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
