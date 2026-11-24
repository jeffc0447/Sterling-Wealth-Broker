/**
 * Sterling Wealth Brokerage - PHP & MySQL Backend API Client
 * 
 * Communicates with the PHP backend scripts deployed on cPanel hosting.
 * Automatically falls back to local data if the PHP API is not reachable or in preview environment.
 */

const API_BASE_URL = import.meta.env.VITE_PHP_BACKEND_URL || '/backend/api';
export const SITE_DOMAIN = import.meta.env.VITE_SITE_DOMAIN || 'investproasset.com';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://investproasset.com';
export const CONTACT_RECIPIENT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support-broker@consultant.com';

export interface SetupCheckResponse {
  success: boolean;
  timestamp: string;
  deployment_domain?: string;
  contact_recipient?: string;
  php_version: string;
  php_compatible: boolean;
  env_config?: {
    env_file_loaded: boolean;
    env_source: string;
    app_env: string;
    site_url: string;
    uploads_writable: boolean;
  };
  extensions: {
    pdo: boolean;
    pdo_mysql: boolean;
    json: boolean;
    mbstring: boolean;
    openssl: boolean;
  };
  database: {
    connected: boolean;
    host: string;
    database: string;
    user: string;
    server_version?: string | null;
    error: string | null;
    tables: Record<string, { exists: boolean; rows?: number; error?: string }>;
  };
  all_tables_installed: boolean;
}

export const checkCPanelBackendHealth = async (): Promise<SetupCheckResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/setup_check.php`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export const phpApi = {
  // Test backend connection
  checkHealth: checkCPanelBackendHealth,

  // Submit Contact Form Inquiry -> Emails support-broker@consultant.com
  submitContactInquiry: async (payload: {
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    capitalNeeded: string;
    productType: string;
    message: string;
  }): Promise<{
    success: boolean;
    inquiryId?: string;
    inquiryNumber?: string;
    recipient?: string;
    mailSent?: boolean;
    message?: string;
    error?: string;
  } | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact.php?action=submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  // User Login (Admin or Client)
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email, password }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // User Registration (with optional KYC dossier)
  register: async (userData: {
    userId?: string;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    company?: string;
    tier?: string | null;
    billingAddress?: Record<string, unknown>;
    kycRegistration?: Record<string, unknown>;
  }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth.php?action=register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(userData),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Verify user profile still exists on server (revokes access if deleted)
  verifyUserSession: async (
    payload: { userId?: string; email?: string },
    token?: string | null
  ): Promise<{ success?: boolean; exists: boolean; deleted?: boolean } | null> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/auth.php?action=verify_session`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Terminate server session cookies
  logoutSession: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth.php?action=logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Update interactive membership renewal / term dates for authenticated client
  updateMembershipDates: async (
    payload: { renewalDate: string; termStart?: string },
    token?: string | null
  ): Promise<{ success: boolean; renewalDate?: string; error?: string } | null> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/auth.php?action=update_membership_dates`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Admin: Permanently delete user profile, registration, KYC & linked records from server
  deleteUserProfile: async (
    payload: {
      registrationId?: string;
      subscriberId?: string;
      userId?: string;
      email?: string;
    },
    adminToken?: string | null
  ): Promise<{
    success: boolean;
    deleted?: boolean;
    deletedUserId?: string | null;
    deletedEmail?: string | null;
    message?: string;
    error?: string;
  } | null> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/admin.php?action=delete_user_profile`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Submit Loan Application
  submitLoan: async (loanData: Record<string, unknown>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/loans.php?action=apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Record Checkout & Bank Wire
  processCheckout: async (checkoutData: Record<string, unknown>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/checkout.php?action=process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Submit Membership Tier Selection (Pending Customer Care Approval in Admin Panel)
  requestMembershipTier: async (userId: string, tierId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/subscribers.php?action=request_tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tierId }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Admin Manual Upgrade Approval
  approveUpgrade: async (subscriberId: string, agentName: string, auditNote: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/subscribers.php?action=approve_upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberId, agentName, auditNote }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Send Chat Message & Trigger Bot
  sendChatMessage: async (userId: string, text: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat.php?action=send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Fetch Chat History
  getChatHistory: async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat.php?action=history&user_id=${encodeURIComponent(userId)}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Save Support Config & Regional Desks
  saveConfig: async (config: Record<string, unknown>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin.php?action=save_config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Automated Email Notifications Endpoint
  sendEmailNotification: async (payload: {
    eventType: string;
    recipientEmail: string;
    recipientName: string;
    variables?: Record<string, string>;
    relatedEntityId?: string;
    subject?: string;
    htmlBody?: string;
  }): Promise<{
    success: boolean;
    notification?: {
      logId?: string;
      dispatched: boolean;
      status: string;
      transport: string;
      subject?: string;
      error?: string | null;
      sentAt?: string;
    };
    message?: string;
    error?: string;
  } | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications.php?action=send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  sendTestEmail: async (toEmail: string, toName?: string, message?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications.php?action=test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ toEmail, toName, message }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getEmailLogs: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications.php?action=list`, {
        headers: { 'Accept': 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getEmailConfig: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications.php?action=config`, {
        headers: { 'Accept': 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  saveEmailConfig: async (config: Record<string, unknown>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications.php?action=config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};

