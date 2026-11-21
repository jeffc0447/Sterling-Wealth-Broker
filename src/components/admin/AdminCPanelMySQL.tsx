import React, { useState } from 'react';
import {
  Database,
  Server,
  FileCode,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Layers,
  FolderTree,
  Lock,
} from 'lucide-react';
import { useBroker } from '../../context/BrokerContext';
import { checkCPanelBackendHealth, SetupCheckResponse } from '../../services/phpApiService';

export const AdminCPanelMySQL: React.FC = () => {
  const { triggerToast } = useBroker();
  const [activeSubTab, setActiveSubTab] = useState<'GUIDE' | 'SCHEMA' | 'PHP_FILES' | 'TESTER'>('GUIDE');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<SetupCheckResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [selectedPhpFile, setSelectedPhpFile] = useState<string>('.env.example');

  const envTemplateContent = `# =====================================================================
# Sterling Wealth Brokerage — cPanel PHP & MySQL .env Configuration
# Save as: public_html/backend/.env  (or public_html/.env)
# =====================================================================

APP_ENV="production"
APP_DEBUG="false"
APP_TIMEZONE="UTC"

# Production Domain & CORS Origins
SITE_DOMAIN="investproasset.com"
SITE_URL="https://investproasset.com"
ALLOWED_ORIGINS="https://investproasset.com,https://www.investproasset.com"

# cPanel MySQL / MariaDB Credentials
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="investpro_sterlingdb"
DB_USER="investpro_sterlinguser"
DB_PASS="ReplaceWithYourStrongMySQLPassword"
DB_CHARSET="utf8mb4"
DB_SOCKET=""

# Session Signing Secret (random 32+ chars)
AUTH_TOKEN_SECRET="replace-with-a-random-64-char-secret-key-for-cpanel-production"

# Contact Form & Mail Routing
CONTACT_RECIPIENT_EMAIL="support-broker@consultant.com"
MAIL_FROM_EMAIL="noreply@investproasset.com"
MAIL_FROM_NAME="Sterling Wealth Broker"

# Institutional Customer Care Defaults
CARE_AGENT_NAME="Jeff Campbell"
CARE_AGENT_EMAIL="jeff@sterlingwealthbroker.com"`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envTemplateContent);
    setCopiedEnv(true);
    triggerToast('.env Template Copied', 'Paste into public_html/backend/.env and insert your cPanel MySQL credentials.', 'success');
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleDownloadEnv = () => {
    const blob = new Blob([envTemplateContent + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cpanel.env.example';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    triggerToast('Download Started', 'Rename cpanel.env.example to .env inside public_html/backend/.', 'success');
  };

  const handleCopySql = () => {
    fetch('/backend/database/schema.sql')
      .then((res) => res.text())
      .then((sql) => {
        navigator.clipboard.writeText(sql);
        setCopiedSql(true);
        triggerToast('SQL Copied', 'Complete schema.sql copied to clipboard for phpMyAdmin.', 'success');
        setTimeout(() => setCopiedSql(false), 2500);
      })
      .catch(() => {
        triggerToast('Notice', 'Schema file located at /backend/database/schema.sql', 'info');
      });
  };

  const handleDownloadSql = () => {
    fetch('/backend/database/schema.sql')
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sterling_wealth_schema.sql';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        triggerToast('Download Started', 'sterling_wealth_schema.sql downloaded for phpMyAdmin.', 'success');
      })
      .catch(() => {
        const a = document.createElement('a');
        a.href = '/backend/api/export_sql.php';
        a.download = 'sterling_wealth_schema.sql';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  };

  const handleRunHealthCheck = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await checkCPanelBackendHealth();
      if (res) {
        setTestResult(res);
        if (res.database.connected && res.all_tables_installed) {
          triggerToast('MySQL Connected', 'All 13 tables and PHP PDO extensions verified.', 'success');
        } else if (res.database.connected) {
          triggerToast('Connected', 'MySQL connected. Please import schema.sql to initialize tables.', 'warning');
        } else {
          triggerToast('Connection Needed', 'Update backend/.env or db.php with your cPanel MySQL credentials.', 'warning');
        }
      } else {
        setTestError('Could not reach /backend/api/setup_check.php. If testing in dev preview, upload the /backend folder to your cPanel public_html.');
        triggerToast('Preview Mode', 'Ready for upload to your cPanel hosting.', 'info');
      }
    } catch (err: unknown) {
      setTestError(err instanceof Error ? err.message : 'Unknown connection error');
    } finally {
      setIsTesting(false);
    }
  };

  const phpFileContents: Record<string, { desc: string; code: string }> = {
    '.env.example': {
      desc: 'Environment configuration template (rename to .env in public_html/backend/.env or public_html/.env). Protected from HTTP download by .htaccess.',
      code: envTemplateContent,
    },
    'env.php': {
      desc: 'Zero-dependency PHP .env parser loaded automatically by db.php and cors.php on cPanel shared hosting.',
      code: `<?php
// backend/config/env.php
// Automatically searches and parses .env from:
// 1. ../ .env (above public_html for maximum cPanel security)
// 2. public_html/.env
// 3. public_html/backend/.env
// 4. public_html/backend/config/.env
// Exposes envValue($key, $default) and envBool($key, $default).`,
    },
    'db.php': {
      desc: 'MySQL PDO connection singleton reading DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_SOCKET from .env.',
      code: `<?php
// backend/config/db.php
require_once __DIR__ . '/env.php';

defined('APP_DEBUG') || define('APP_DEBUG', envBool('APP_DEBUG', false));
defined('DB_HOST') || define('DB_HOST', (string)envValue('DB_HOST', 'localhost'));
defined('DB_PORT') || define('DB_PORT', (string)envValue('DB_PORT', '3306'));
defined('DB_NAME') || define('DB_NAME', (string)envValue('DB_NAME', 'investpro_sterlingdb'));
defined('DB_USER') || define('DB_USER', (string)envValue('DB_USER', 'investpro_sterlinguser'));
defined('DB_PASS') || define('DB_PASS', (string)envValue('DB_PASS', ''));
defined('DB_CHARSET') || define('DB_CHARSET', (string)envValue('DB_CHARSET', 'utf8mb4'));
defined('DB_SOCKET') || define('DB_SOCKET', (string)envValue('DB_SOCKET', ''));`,
    },
    'install.php': {
      desc: 'Web-based graphical installer for cPanel. Tests MySQL, updates db.php, and runs schema.sql.',
      code: `<?php
// backend/install.php
// Visit in browser: https://investproasset.com/backend/install.php
// 1. Enter DB Host, Name, User, and Password
// 2. Click "Install Database & Initialize Tables"
// 3. Executes schema.sql creating all 13 tables and initial seed data automatically!`,
    },
    'auth.php': {
      desc: 'Handles user registration, client login, admin login with password_hash & JWT session token.',
      code: `<?php
// backend/api/auth.php
// Actions: login, register, me
// Password verification with password_verify()
// Returns user profile, pending tier upgrades, and bearer token`,
    },
    'loans.php': {
      desc: 'Debt product listing, new facility applications, and syndicate placement pipeline.',
      code: `<?php
// backend/api/loans.php
// Actions: instruments, tiers, list, apply, update_status
// Staged in MySQL loan_applications table with underwriter audit notes`,
    },
    'subscribers.php': {
      desc: 'Handles manual admin membership tier upgrades upon payment verification.',
      code: `<?php
// backend/api/subscribers.php
// Actions: list, approve_upgrade, reject_upgrade, resubmit_proof
// Implements manual upgrade protocol: updates users table, marks subscriber ACTIVE, and completes transaction`,
    },
    'contact.php': {
      desc: 'Dispatches public contact form inquiries to support-broker@consultant.com and logs records in MySQL.',
      code: `<?php
// backend/api/contact.php
// Actions: submit (POST), list (GET)
// Validates client inquiry, emails HTML brief to support-broker@consultant.com
// using noreply@investproasset.com, and persists row in contact_inquiries table.`,
    },
    'chat.php': {
      desc: 'Encrypted broker chat session with automatic robot bot and care agent handoff after 3-5 questions.',
      code: `<?php
// backend/api/chat.php
// Actions: history, send
// Records client questions in broker_messages table.
// Automated concierge answers up to 3 questions.
// After 4 questions, automatically directs user to:
// Jeff Campbell (jeff@sterlingwealthbroker.com | +1 800 842-9912)`,
    },
    'setup_check.php': {
      desc: 'Diagnostic endpoint to verify PHP version, PDO MySQL driver, and database tables.',
      code: `<?php
// backend/api/setup_check.php
// Returns JSON with:
// - Deployment domain (investproasset.com) & contact email (support-broker@consultant.com)
// - PHP version and compatibility check
// - PDO MySQL extension state
// - MySQL connection status
// - Verification of 13 tables (users, loans, documents, contact_inquiries, etc.)`,
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>Native cPanel / LAMP Stack</span>
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">PHP 7.4 – 8.3 & MySQL / MariaDB</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>cPanel & MySQL Hosting Architecture</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              No Supabase or external database services required. The application includes a self-contained PHP backend and MySQL database schema ready for immediate import via phpMyAdmin (or web installer) and deployment onto any standard cPanel hosting account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/backend/install.php"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Web Installer</span>
            </a>
            <button
              type="button"
              onClick={handleCopyEnv}
              className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {copiedEnv ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
              <span>{copiedEnv ? '.env Copied!' : 'Copy .env Template'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSql}
              className="min-h-[44px] px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Download className="w-4 h-4" />
              <span>Download schema.sql</span>
            </button>
            <button
              type="button"
              onClick={handleCopySql}
              className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('GUIDE')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'GUIDE'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>cPanel Deployment Guide</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('SCHEMA')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'SCHEMA'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>MySQL Database Schema (13 Tables)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('PHP_FILES')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'PHP_FILES'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>PHP Backend Endpoints</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('TESTER')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'TESTER'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>MySQL Connection Tester</span>
        </button>
      </div>

      {/* Tab 1: Step-by-Step Guide */}
      {activeSubTab === 'GUIDE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-semibold text-white text-sm">Create MySQL Database in cPanel</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log into your cPanel dashboard, open <strong className="text-white">MySQL® Databases</strong>, and create a database (e.g. <code className="text-emerald-400 font-mono">sterlingdb</code>). Create a user and grant <strong>ALL PRIVILEGES</strong>.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400">
                Database: youruser_sterlingdb · User: youruser_sterlinguser
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="font-semibold text-white text-sm">Import schema.sql in phpMyAdmin</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click <strong className="text-white">phpMyAdmin</strong> in cPanel, select your database, click the <strong className="text-white">Import</strong> tab, and upload <code className="text-emerald-400 font-mono">backend/database/schema.sql</code>. All 13 tables and initial seed data will be created automatically.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                <span>13 Tables · InnoDB · UTF8MB4</span>
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="text-xs text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download SQL</span>
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="font-semibold text-white text-sm">Configure backend/.env Credentials</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rename <code className="text-amber-400 font-mono">backend/.env.example</code> to <code className="text-emerald-400 font-mono">backend/.env</code> (or run <code className="text-white font-mono">backend/install.php</code> to auto-generate it). <code className="text-slate-200 font-mono">env.php</code> loads it automatically into <code className="text-slate-200 font-mono">db.php</code>.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 flex items-center justify-between gap-2">
                <div className="space-y-0.5 truncate">
                  <div>DB_HOST="localhost" · DB_NAME="investpro_sterlingdb"</div>
                  <div>DB_USER="investpro_sterlinguser" · SITE_DOMAIN="investproasset.com"</div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadEnv}
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>.env</span>
                </button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h3 className="font-semibold text-white text-sm">Upload dist/ & backend/ to public_html</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Run <code className="text-emerald-400 font-mono">npm run build</code> locally, upload the contents of <code className="text-white font-mono">dist/</code> directly into <code className="text-white font-mono">public_html/</code> on <code className="text-emerald-400 font-mono">investproasset.com</code> (including <code className="text-white font-mono">.htaccess</code> and <code className="text-white font-mono">backend/</code>).
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400">
                https://investproasset.com/ &middot; Contact Mail &rarr; support-broker@consultant.com
              </div>
            </div>
          </div>

          {/* Detailed Guide Callout */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">Looking for the full deployment documentation?</h4>
              <p className="text-xs text-slate-400">
                A complete markdown guide has been generated in the project root: <code className="text-emerald-400 font-mono">CPANEL_DEPLOYMENT_GUIDE.md</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('TESTER')}
              className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Terminal className="w-4 h-4" />
              <span>Test Connection Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: MySQL Schema Viewer */}
      {activeSubTab === 'SCHEMA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>MySQL Database Schema (schema.sql)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+. Includes tables, foreign keys, indexes, and initial broker seeds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="min-h-[40px] px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSql}
                className="min-h-[40px] px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          {/* Tables Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
            {[
              { name: 'users', desc: 'Client account credentials & tiers' },
              { name: 'admins', desc: 'Principal, compliance & support profiles' },
              { name: 'membership_tiers', desc: 'Silver, Gold, Platinum, Diamond packages' },
              { name: 'financial_instruments', desc: 'Debt facilities, limits & rate terms' },
              { name: 'loan_applications', desc: 'Facility requests & underwriting status' },
              { name: 'vault_documents', desc: '256-bit encrypted KYC bank statements & IDs' },
              { name: 'transactions', desc: 'Settlement invoices & payment logs' },
              { name: 'wire_proofs', desc: 'Bank wire remittance slips & Fedwire numbers' },
              { name: 'membership_subscribers', desc: 'Pending tier upgrades for manual admin audit' },
              { name: 'registration_applications', desc: 'Public member enrollment queue' },
              { name: 'broker_messages', desc: 'Encrypted chat logs with robot bot counter' },
              { name: 'system_settings', desc: 'Bank coordinates & Regional Underwriting Desks' },
              { name: 'contact_inquiries', desc: 'Contact form logs -> support-broker@consultant.com' },
            ].map((tbl) => (
              <div key={tbl.name} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-mono font-semibold text-emerald-400">{tbl.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tbl.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 max-h-96 overflow-y-auto leading-relaxed">
            <pre className="whitespace-pre-wrap">
{`-- =====================================================================
-- STERLING WEALTH BROKERAGE - INSTITUTIONAL RETAIL & COMMERCIAL PORTAL
-- Complete MySQL / MariaDB Database Schema for cPanel Hosting
-- Engine: InnoDB | Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  membership_tier_id ENUM('silver', 'gold', 'platinum', 'diamond') DEFAULT 'gold',
  membership_status ENUM('ACTIVE', 'EXPIRED', 'RENEWAL_DUE') DEFAULT 'ACTIVE',
  kyc_status ENUM('VERIFIED', 'IN_REVIEW', 'ACTION_REQUIRED') DEFAULT 'VERIFIED',
  total_active_capital DECIMAL(15, 2) DEFAULT 2500000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_applications (
  id VARCHAR(64) PRIMARY KEY,
  application_number VARCHAR(64) UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  requested_amount DECIMAL(15, 2) NOT NULL,
  status ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'DISBURSED', 'REJECTED') DEFAULT 'PENDING',
  submitted_at VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS membership_subscribers (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  membership_tier_id VARCHAR(32) NOT NULL,
  requested_tier_id VARCHAR(32) DEFAULT NULL,
  payment_status ENUM('ACTIVE', 'PENDING', 'PAST_DUE', 'CANCELLED') DEFAULT 'PENDING',
  approval_status ENUM('AWAITING_PAYMENT_VERIFICATION', 'APPROVED', 'REJECTED') DEFAULT 'AWAITING_PAYMENT_VERIFICATION',
  payment_method VARCHAR(50) NOT NULL,
  amount_paid DECIMAL(12, 2) NOT NULL
);
-- ... (full 13 tables and seed data located in backend/database/schema.sql)`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: PHP Files Inspector */}
      {activeSubTab === 'PHP_FILES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>PHP Backend Endpoints (cPanel /public_html/backend/)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard procedural & object-oriented PHP scripts using PDO prepared statements.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {['.env.example', 'env.php', 'db.php', 'install.php', 'auth.php', 'loans.php', 'subscribers.php', 'contact.php', 'chat.php', 'setup_check.php'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedPhpFile(f)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    selectedPhpFile === f
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {selectedPhpFile === '.env.example' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="min-h-[36px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEnv ? 'Copied' : 'Copy .env'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadEnv}
                  className="min-h-[36px] px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .env Template</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              {phpFileContents[selectedPhpFile]?.desc}
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap">
                {phpFileContents[selectedPhpFile]?.code}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Connection Tester */}
      {activeSubTab === 'TESTER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>MySQL & PHP cPanel Connection Diagnostic</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tests the live <code className="text-emerald-400 font-mono">/backend/api/setup_check.php</code> endpoint to verify PDO MySQL extension and table presence.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunHealthCheck}
              disabled={isTesting}
              className="min-h-[44px] px-5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Connection...' : 'Run Diagnostics'}</span>
            </button>
          </div>

          {testResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">PHP Version</span>
                  <div className="font-bold text-white text-base mt-0.5">{testResult.php_version}</div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    {testResult.php_compatible ? '● Compatible (>= 7.4)' : 'Upgrade recommended'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">PDO MySQL Extension</span>
                  <div className="font-bold text-white text-base mt-0.5">
                    {testResult.extensions.pdo_mysql ? 'Enabled' : 'Missing'}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    {testResult.extensions.pdo_mysql ? '● Ready for MySQL/MariaDB' : 'Enable in cPanel PHP Selector'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">MySQL Database</span>
                  <div className="font-bold text-white text-base mt-0.5">
                    {testResult.database.connected ? 'Connected' : 'Connection Pending'}
                  </div>
                  <span className={`text-[11px] mt-1 block ${testResult.database.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {testResult.database.connected
                      ? `● ${testResult.database.database} @ ${testResult.database.host}`
                      : 'Check backend/.env or db.php credentials'}
                  </span>
                </div>
              </div>

              {testResult.env_config && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Config Source: <code className="text-emerald-400 font-mono">{testResult.env_config.env_source}</code>
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Domain: {testResult.deployment_domain || 'investproasset.com'} · Mail: {testResult.contact_recipient || 'support-broker@consultant.com'}
                  </div>
                </div>
              )}

              {testResult.database.tables && Object.keys(testResult.database.tables).length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-white block">Installed MySQL Tables Status:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(testResult.database.tables).map(([tbl, info]) => (
                      <div key={tbl} className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                        <span className="font-mono text-slate-300">{tbl}</span>
                        {info.exists ? (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{info.rows ?? 0}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-400">Missing</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {testError && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>cPanel Hosting Deployment Check</span>
              </div>
              <p className="leading-relaxed">
                {testError}
              </p>
              <p className="text-[11px] text-slate-400">
                To run live on your domain: upload the <code className="text-white font-mono">backend/</code> folder to your cPanel hosting <code className="text-white font-mono">public_html/backend/</code>, update credentials in <code className="text-white font-mono">backend/config/db.php</code>, and import <code className="text-white font-mono">schema.sql</code> in phpMyAdmin.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
