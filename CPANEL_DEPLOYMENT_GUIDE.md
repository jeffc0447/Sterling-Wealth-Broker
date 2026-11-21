# Sterling Wealth Brokerage - cPanel & MySQL Deployment Guide

This guide walks you through deploying the complete **Sterling Wealth Brokerage** platform on ordinary **cPanel shared hosting** (or VPS) with a **PHP backend** and a **MySQL / MariaDB database**. No external database services (such as Supabase, Firebase, or Cloud SQL) are required.

---

## System Requirements

- **Web Server:** Apache (mod_rewrite + mod_headers) — standard on almost all cPanel hosts (Namecheap, Bluehost, HostGator, SiteGround, GoDaddy, Hostinger, cPanel/WHM).
- **PHP Version:** PHP 7.4, 8.0, 8.1, 8.2, or 8.3.
- **PHP Extensions:** `pdo`, `pdo_mysql`, `json`, `mbstring`, `openssl` (enabled by default on all cPanel hosts).
- **Database:** MySQL 5.7+, MySQL 8.0+, or MariaDB 10.3+.

---

## Directory Architecture on cPanel

When deployed in your cPanel `public_html/` folder (`investproasset.com`), the directory structure looks like this:

```text
public_html/
├── index.html                 <-- React SPA frontend entry point (from dist/)
├── assets/                    <-- Frontend JS/CSS/image bundles (from dist/)
├── .htaccess                  <-- Enforces HTTPS on investproasset.com, routes SPA + /admin & API
├── robots.txt                 <-- Search crawler rules for investproasset.com
├── sitemap.xml                <-- Sitemap for investproasset.com
├── backend/
│   ├── .htaccess              <-- Blocks HTTP access to .env, config/db.php, config/env.php
│   ├── .env.example           <-- Ready-to-rename cPanel .env configuration template
│   ├── .env                   <-- Your live MySQL & mail credentials (create from .env.example or install.php)
│   ├── install.php            <-- Browser installer (generates backend/.env & imports schema.sql)
│   ├── config/
│   │   ├── env.php            <-- Zero-dependency PHP .env parser (loads .env automatically)
│   │   ├── db.php             <-- MySQL PDO singleton reading credentials from .env
│   │   └── cors.php           <-- CORS allowlist (investproasset.com) & JSON/mail config
│   ├── database/
│   │   └── schema.sql         <-- Complete 13-table MySQL schema & seed data
│   ├── api/
│   │   ├── index.php          <-- Unified REST API gateway
│   │   ├── auth.php           <-- Login, registration, session validation
│   │   ├── loans.php          <-- Loan applications & syndicate placements
│   │   ├── documents.php      <-- 256-bit encrypted KYC vault & verification
│   │   ├── checkout.php       <-- Multi-rail checkout & bank wire logger
│   │   ├── subscribers.php    <-- Tier upgrades & manual admin approvals
│   │   ├── chat.php           <-- Broker encrypted chat with robot concierge
│   │   ├── contact.php        <-- Contact form mail router -> support-broker@consultant.com
│   │   ├── admin.php          <-- Regional desks & support config
│   │   ├── export_sql.php     <-- Direct SQL schema download endpoint
│   │   └── setup_check.php    <-- Installation health, .env, & 13-table diagnostic checker
│   └── uploads/               <-- Stored KYC documents & wire receipts (chmod 755)
```

---

## Step 1: Create a MySQL Database in cPanel

1. Log into your **cPanel account**.
2. Under **Databases**, click **MySQL® Databases** (or **MySQL Database Wizard**).
3. **Create New Database**:
   - Enter a database name, e.g. `sterlingdb` (cPanel prefixes it like `youruser_sterlingdb`).
   - Click **Create Database**.
4. **Create New User**:
   - Scroll to **Add New User**.
   - Username: e.g. `sterlinguser` (cPanel prefixes it like `youruser_sterlinguser`).
   - Generate a strong password and save it securely.
5. **Add User to Database**:
   - Select your user and database under **Add User To Database**, click **Add**, check **ALL PRIVILEGES**, and click **Make Changes**.

---

## Step 2: Configure `.env` & Initialize Database (Two Options)

### Option A — Automated Browser Installer (Recommended)
1. Upload the built `dist/` files (which include `backend/`) into `public_html/`.
2. Open **`https://investproasset.com/backend/install.php`** in your browser.
3. Enter your cPanel `DB_HOST` (`localhost`), `DB_PORT` (`3306`), `DB_NAME`, `DB_USER`, and `DB_PASS`.
4. Click **Generate .env & Initialize MySQL Database**.
   - It automatically creates `public_html/backend/.env` with a fresh 64-character `AUTH_TOKEN_SECRET`.
   - It executes all 13 tables and initial seed records from `backend/database/schema.sql`.
5. Delete or restrict `install.php` after installation completes for extra production hardening.

### Option B — Manual `.env` + phpMyAdmin Import
1. In cPanel **phpMyAdmin**, select your database, open the **Import** tab, and upload `backend/database/schema.sql`.
2. In cPanel **File Manager**, copy `public_html/backend/.env.example` to `public_html/backend/.env` (or place it at `/home/<cpanel_user>/.env` above `public_html` — `env.php` detects it automatically).
3. Edit `.env` with your real database credentials:

```ini
APP_ENV="production"
APP_DEBUG="false"
APP_TIMEZONE="UTC"

SITE_DOMAIN="investproasset.com"
SITE_URL="https://investproasset.com"
ALLOWED_ORIGINS="https://investproasset.com,https://www.investproasset.com"

DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="youruser_sterlingdb"
DB_USER="youruser_sterlinguser"
DB_PASS="YourActualDatabasePassword"
DB_CHARSET="utf8mb4"
DB_SOCKET=""

AUTH_TOKEN_SECRET="replace-with-a-random-64-char-secret-key"

CONTACT_RECIPIENT_EMAIL="support-broker@consultant.com"
MAIL_FROM_EMAIL="noreply@investproasset.com"
MAIL_FROM_NAME="Sterling Wealth Broker"
```

---

## Step 3: Build Frontend & Upload to `public_html` (`investproasset.com`)

1. Copy root `.env.example` to `.env` if customizing frontend build variables (`VITE_SITE_DOMAIN`, `VITE_SITE_URL`, `VITE_PHP_BACKEND_URL`, `VITE_CONTACT_EMAIL`), or use the preconfigured `.env.production` values.
2. Build the React frontend:
   ```bash
   npm run build
   ```
   This builds `dist/` containing `index.html`, `.htaccess`, `robots.txt`, `sitemap.xml`, `assets/`, and the entire `backend/` folder.
3. Upload everything inside `dist/` into `public_html/` on cPanel.
4. Confirm file permissions:
   - Files: `644`
   - Directories: `755`
   - `public_html/backend/uploads/`: `755`

---

## Step 4: Test the Connection on `investproasset.com`

Open the diagnostic endpoint in your browser:

```text
https://investproasset.com/backend/api/setup_check.php
```

Expected response:
```json
{
  "success": true,
  "deployment_domain": "investproasset.com",
  "contact_recipient": "support-broker@consultant.com",
  "php_compatible": true,
  "env_config": {
    "env_file_loaded": true,
    "env_source": "backend/.env",
    "app_env": "production",
    "uploads_writable": true
  },
  "database": {
    "connected": true,
    "host": "localhost",
    "database": "youruser_sterlingdb",
    "tables": {
      "users": { "exists": true, "rows": 1 },
      "admins": { "exists": true, "rows": 4 },
      "membership_tiers": { "exists": true, "rows": 4 },
      "financial_instruments": { "exists": true, "rows": 5 },
      "contact_inquiries": { "exists": true, "rows": 0 },
      "system_settings": { "exists": true, "rows": 2 }
    }
  },
  "all_tables_installed": true
}
```

---

## Accessing Client Portal & Hidden Admin Console

- **Client Login & Portal:** `https://investproasset.com/portal`
- **Hidden Admin Dashboard:** Navigate directly in your browser to **`https://investproasset.com/admin`** (no visible Admin buttons appear in the public header or footer).
- **Default Super Admin:** `eleanor.sterling@sterlingwealthbroker.com` / `Password123!` (or `admin@admin.com` / `Church12@`).
- **Default Client Account:** `alexander.vance@vanceholdings.com` / `Password123!`.
