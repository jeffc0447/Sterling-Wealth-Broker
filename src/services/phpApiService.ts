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

  // User Login
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // User Registration
  register: async (userData: { name: string; email: string; phone?: string; company?: string; tier?: string }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth.php?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
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
};
