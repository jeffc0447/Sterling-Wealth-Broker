# Sterling Wealth Broker

**Sterling Wealth Broker** is a tiered financial access, loan brokerage, KYC document vault, and client wealth management platform built with **React + TypeScript + Vite** on the frontend and a self-contained **PHP + MySQL / MariaDB** backend engineered for standard **cPanel shared hosting** (no external database services required).

Configured for production deployment on **`https://investproasset.com`** with confidential contact inquiry routing to **`support-broker@consultant.com`**.

---

## Key Capabilities

- **Tiered Membership & Capital Access**: Four institutional tiers (*Silver*, *Gold Executive*, *Platinum Prestige*, and *Diamond Syndicate*) with borrowing capacities from `$50,000` up to `$15,000,000+` and bespoke syndicate facilities.
- **Manual Membership Upgrade Protocol**: Payment settlements (Card, Fedwire/SWIFT Bank Wire with receipt upload, or Crypto) stage upgrade requests in MySQL for manual verification and activation from the Admin Panel.
- **Loan Origination & Underwriting Pipeline**: End-to-end credit facility applications across Personal, Commercial, Asset-Backed, and Securities-Backed instruments with underwriting status tracking.
- **Encrypted KYC Document Vault**: Multi-file upload and compliance verification workflow (`PENDING_REVIEW`, `VERIFIED`, `ACTION_REQUIRED`) with SHA-256 verification hashes.
- **Encrypted Broker Chat & Care Handoff**: Client dashboard chat powered by an automated underwriting concierge bot that hands off to Senior Customer Care Specialist **Jeff Campbell** (`jeff@sterlingwealthbroker.com`) after 3–5 questions.
- **Contact Form Mail Dispatch**: Public inquiries route through `/backend/api/contact.php`, send formatted HTML notifications to `support-broker@consultant.com` (`From: noreply@investproasset.com`), and log records in MySQL (`contact_inquiries`).
- **Hidden Admin Console (`/admin`)**: All public header/footer admin buttons are hidden; the Admin Desk is accessible directly via `/admin` in the browser.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Native PHP 7.4 – 8.3 (PDO MySQL with prepared statements, zero Composer dependencies)
- **Database**: MySQL 5.7+ / 8.0+ or MariaDB 10.3+ (InnoDB, `utf8mb4_unicode_ci`, 13 tables)
- **Web Server**: Apache (`mod_rewrite`, `mod_headers`, `mod_expires`) configured via `.htaccess` for `public_html/`

---

## Project Structure

```text
.
├── .env.example                    # Unified Vite + PHP cPanel .env template
├── .env.production                 # Production Vite build variables for investproasset.com
├── CPANEL_DEPLOYMENT_GUIDE.md      # Detailed cPanel & phpMyAdmin walkthrough
├── index.html                      # Canonical SPA HTML entry (https://investproasset.com/)
├── package.json                    # Scripts & dependencies
├── vite.config.ts                  # Vite configuration (base: '/')
├── public/
│   ├── .htaccess                   # Root public_html Apache rules (HTTPS, SPA routing, .env protection)
│   ├── robots.txt                  # Search engine rules for investproasset.com
│   ├── sitemap.xml                 # XML sitemap for investproasset.com
│   └── backend/                    # Build mirror copied automatically into dist/backend/
├── backend/
│   ├── .env.example                # cPanel PHP & MySQL .env configuration template
│   ├── .htaccess                   # Blocks HTTP access to .env*, config/db.php, config/env.php
│   ├── install.php                 # Point-and-click browser installer (writes .env & runs schema.sql)
│   ├── public_html_htaccess.txt    # Reference root .htaccess for cPanel public_html/
│   ├── config/
│   │   ├── env.php                 # Zero-dependency PHP .env parser & envValue()/envBool() helpers
│   │   ├── db.php                  # Singleton PDO MySQL connector reading from .env
│   │   └── cors.php                # Origin-validated CORS allowlist, domain constants & JSON helpers
│   ├── database/
│   │   └── schema.sql              # Complete 13-table MySQL schema & initial seed data
│   ├── api/
│   │   ├── index.php               # Unified REST router
│   │   ├── auth.php                # Login, registration & bearer session check
│   │   ├── loans.php               # Instruments, tiers, applications & underwriting updates
│   │   ├── documents.php           # KYC document vault upload, listing & compliance verification
│   │   ├── checkout.php            # Multi-rail checkout & bank wire remittance proof logger
│   │   ├── subscribers.php         # Pending tier queue & manual admin approvals/rejections
│   │   ├── chat.php                # Encrypted broker chat & automated bot concierge
│   │   ├── contact.php             # Contact form mail dispatch -> support-broker@consultant.com
│   │   ├── admin.php               # System settings, bank coordinates, regional desks & stats
│   │   ├── export_sql.php          # Direct sterling_wealth_schema.sql download endpoint
│   │   └── setup_check.php         # cPanel .env, PHP extension & 13-table health diagnostic
│   └── uploads/                    # Uploaded KYC documents & wire receipts (chmod 755)
└── src/
    ├── components/                 # Public pages, Client Portal, Payment Gateway & Admin Console
    ├── context/BrokerContext.tsx   # Global state, URL routing (/portal, /admin) & persistence sync
    ├── data/mockData.ts            # Instruments, membership tiers, regional desks & initial seeds
    ├── services/phpApiService.ts   # Typed client for /backend/api/*.php endpoints
    └── types/index.ts              # Shared TypeScript domain interfaces
```

---

## Local Development

### Prerequisites
- Node.js 18+ (`npm` or `bun`)
- Optional for local PHP/MySQL testing: PHP 7.4+ with `pdo_mysql` and a local MySQL/MariaDB instance

### Setup & Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (optional for local customization):**
   ```bash
   cp .env.example .env
   ```

3. **Start the development server (port 3000):**
   ```bash
   npm run dev
   ```
   *(When running Vite standalone without PHP, the frontend cleanly operates in interactive preview mode.)*

4. **Type-check and build for production:**
   ```bash
   npm run lint
   npm run build
   ```
   Running `npm run build` outputs the complete production archive in `dist/`, including `.htaccess`, `robots.txt`, `sitemap.xml`, compiled assets, and `dist/backend/`.

---

## cPanel Hosting & MySQL Deployment

Full instructions are available in [`CPANEL_DEPLOYMENT_GUIDE.md`](./CPANEL_DEPLOYMENT_GUIDE.md). Quick overview:

1. **Create Database in cPanel**: Open **MySQL® Databases**, create a database (e.g. `investpro_sterlingdb`) and user (`investpro_sterlinguser`), and assign **ALL PRIVILEGES**.
2. **Build & Upload**: Run `npm run build` locally and upload the entire contents of `dist/` directly into `public_html/` for `investproasset.com`. Ensure `public_html/backend/uploads/` has `755` permissions.
3. **Configure `.env` & Initialize Tables** *(choose one)*:
   - **Option A — Browser Installer**: Visit `https://investproasset.com/backend/install.php`, enter your MySQL host, database name, username, and password, and submit. It automatically creates `backend/.env` and initializes all 13 MySQL tables from `schema.sql`. *(Remove or restrict `install.php` afterwards.)*
   - **Option B — phpMyAdmin + Manual `.env`**: Import `backend/database/schema.sql` in **phpMyAdmin**, then copy `backend/.env.example` to `backend/.env` (or `/home/<cpanel_user>/.env` above `public_html/`) and fill in your `DB_*` credentials.
4. **Verify Connection**: Open `https://investproasset.com/backend/api/setup_check.php` and confirm `"database.connected": true`, `"env_config.env_file_loaded": true`, and `"all_tables_installed": true`.

---

## Environment Variables (`.env`)

`backend/config/env.php` automatically searches `.env` in order: `../.env` (above `public_html`), `public_html/.env`, `backend/.env`, and `backend/config/.env`.

| Variable | Default / Example | Purpose |
|---|---|---|
| `APP_ENV` / `APP_DEBUG` | `production` / `false` | Controls runtime error verbosity |
| `SITE_DOMAIN` / `SITE_URL` | `investproasset.com` / `https://investproasset.com` | Production domain and canonical URL |
| `ALLOWED_ORIGINS` | `https://investproasset.com,https://www.investproasset.com` | Comma-separated CORS allowlist |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | cPanel MySQL server host & port |
| `DB_NAME` / `DB_USER` / `DB_PASS` | `investpro_sterlingdb` / `investpro_sterlinguser` | cPanel MySQL database credentials |
| `DB_SOCKET` | *(empty)* | Optional Unix socket path if required by host |
| `AUTH_TOKEN_SECRET` | *(random 64-char hex)* | Secret used for token signing |
| `CONTACT_RECIPIENT_EMAIL` | `support-broker@consultant.com` | Destination inbox for Contact Form inquiries |
| `MAIL_FROM_EMAIL` / `MAIL_FROM_NAME` | `noreply@investproasset.com` / `Sterling Wealth Broker` | Outbound SMTP/PHP `mail()` sender headers |

---

## Database Schema (13 Tables)

`backend/database/schema.sql` creates and seeds the following InnoDB (`utf8mb4_unicode_ci`) tables:

1. `users` — Client profiles, tier membership, KYC status & capital limits
2. `admins` — Principal, compliance, underwriting & customer support officers
3. `membership_tiers` — Silver, Gold, Platinum & Diamond tier configurations
4. `financial_instruments` — Debt facilities, limits, APR ranges & eligibility rules
5. `loan_applications` — Client facility applications & underwriting audit logs
6. `vault_documents` — 256-bit hashed KYC bank statements, IDs & tax filings
7. `transactions` — Multi-rail settlement invoices & transaction hashes
8. `wire_proofs` — Bank wire remittance slips & Fedwire/SWIFT references
9. `membership_subscribers` — Manual admin tier upgrade verification queue
10. `registration_applications` — Public membership enrollment submissions
11. `broker_messages` — Encrypted broker chat transcripts & bot escalation history
12. `system_settings` — Bank wire coordinates, regional desks & site config
13. `contact_inquiries` — Public contact form submissions routed to `support-broker@consultant.com`

---

## Default Access & Seeded Credentials

- **Public Website**: `https://investproasset.com/`
- **Client Login & Dashboard**: `https://investproasset.com/portal`
  - Demo Client: `alexander.vance@vanceholdings.com` / `Password123!`
- **Hidden Admin Console**: `https://investproasset.com/admin`
  - Super Admin: `eleanor.sterling@sterlingwealthbroker.com` / `Password123!` (or `admin@admin.com` / `Church12@`)
  - Customer Care Desk: `jeff@sterlingwealthbroker.com` / `Password123!`
