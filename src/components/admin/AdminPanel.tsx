import React from 'react';
import { useBroker } from '../../context/BrokerContext';
import { AdminHeader } from './AdminHeader';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminLoanManagement } from './AdminLoanManagement';
import { AdminKYCDesk } from './AdminKYCDesk';
import { AdminPackageBuilder } from './AdminPackageBuilder';
import { AdminFinancialAudit } from './AdminFinancialAudit';
import { AdminSecurityConsole } from './AdminSecurityConsole';
import { AdminSupportConfig } from './AdminSupportConfig';
import { AdminSubscribers } from './AdminSubscribers';
import { AdminRegistrationsQueue } from './AdminRegistrationsQueue';
import { AdminTierApprovalPanel } from '../flows/AdminTierApprovalPanel';
import { AdminHomepageCMS } from './AdminHomepageCMS';
import { AdminBrandingSettings } from './AdminBrandingSettings';
import { AdminCPanelMySQL } from './AdminCPanelMySQL';
import { AdminLoginPage } from './AdminLoginPage';

export const AdminPanel: React.FC = () => {
  const { adminTab, isAdminAuthenticated } = useBroker();

  if (!isAdminAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {adminTab === 'APPROVAL_QUEUE' && <AdminTierApprovalPanel />}
        {adminTab === 'REGISTRATIONS_QUEUE' && <AdminRegistrationsQueue />}
        {adminTab === 'BRANDING' && <AdminBrandingSettings />}
        {adminTab === 'HOMEPAGE_CMS' && <AdminHomepageCMS />}
        {adminTab === 'ANALYTICS' && <AdminAnalytics />}
        {adminTab === 'SUBSCRIBERS' && <AdminSubscribers />}
        {adminTab === 'APPLICATIONS' && <AdminLoanManagement />}
        {adminTab === 'KYC_DESK' && <AdminKYCDesk />}
        {adminTab === 'PACKAGE_BUILDER' && <AdminPackageBuilder />}
        {adminTab === 'SUPPORT_CONFIG' && <AdminSupportConfig />}
        {adminTab === 'AUDIT_LOGS' && <AdminFinancialAudit />}
        {adminTab === 'SECURITY' && <AdminSecurityConsole />}
        {adminTab === 'CPANEL_MYSQL' && <AdminCPanelMySQL />}
      </main>
    </div>
  );
};

