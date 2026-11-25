-- =====================================================================
-- STERLING WEALTH BROKERAGE - INSTITUTIONAL RETAIL & COMMERCIAL PORTAL
-- Complete MySQL / MariaDB Database Schema for cPanel Hosting
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Engine: InnoDB | Collation: utf8mb4_unicode_ci
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ---------------------------------------------------------------------
-- 1. Table: users (Client membership user accounts)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `company` VARCHAR(150) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `membership_tier_id` ENUM('silver', 'gold', 'platinum', 'diamond') DEFAULT NULL,
  `membership_status` ENUM('UNASSIGNED', 'PENDING_REVIEW', 'ACTIVE', 'EXPIRED', 'RENEWAL_DUE') NOT NULL DEFAULT 'UNASSIGNED',
  `member_since` VARCHAR(50) DEFAULT '2024-03-15',
  `renewal_date` VARCHAR(50) DEFAULT '2027-01-15',
  `kyc_status` ENUM('VERIFIED', 'IN_REVIEW', 'ACTION_REQUIRED') NOT NULL DEFAULT 'VERIFIED',
  `assigned_broker` VARCHAR(150) DEFAULT 'Marcus Vance',
  `broker_direct_line` VARCHAR(50) DEFAULT '+1 (800) 555-4921',
  `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `total_active_capital` DECIMAL(15, 2) NOT NULL DEFAULT 2500000.00,
  `billing_address_json` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Table: admins (Institutional Officers & Compliance Desks)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'LOAN_SPECIALIST', 'COMPLIANCE_OFFICER', 'CUSTOMER_SUPPORT') NOT NULL DEFAULT 'SUPER_ADMIN',
  `title` VARCHAR(150) DEFAULT 'Executive Officer',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `permissions_json` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Table: membership_tiers (Tier Packages & Privileges)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `membership_tiers` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `badge` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `period` VARCHAR(32) NOT NULL DEFAULT 'year',
  `max_loan_limit` DECIMAL(15, 2) NOT NULL,
  `apr_discount` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `processing_sla` VARCHAR(50) NOT NULL,
  `dedicated_broker` TINYINT(1) NOT NULL DEFAULT 1,
  `priority_underwriting` TINYINT(1) NOT NULL DEFAULT 1,
  `features_json` TEXT NOT NULL,
  `allowed_instruments_json` TEXT NOT NULL,
  `is_popular` TINYINT(1) NOT NULL DEFAULT 0,
  `color_scheme_json` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Table: financial_instruments (Debt Products & Facilities)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `financial_instruments` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `category` ENUM('Personal', 'Commercial', 'Asset-Backed', 'Wealth & Liquidity') NOT NULL,
  `min_amount` DECIMAL(15, 2) NOT NULL,
  `max_amount` DECIMAL(15, 2) NOT NULL,
  `apr_range` VARCHAR(50) NOT NULL,
  `term_options` VARCHAR(100) NOT NULL,
  `min_tier_required` VARCHAR(32) NOT NULL DEFAULT 'silver',
  `turnaround` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `eligibility_json` TEXT NOT NULL,
  `documents_required_json` TEXT NOT NULL,
  `partner_lenders_json` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Table: loan_applications (Loan Facility Applications)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `loan_applications` (
  `id` VARCHAR(64) NOT NULL,
  `application_number` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` VARCHAR(64) NOT NULL,
  `applicant_name` VARCHAR(150) NOT NULL,
  `applicant_email` VARCHAR(191) NOT NULL,
  `applicant_phone` VARCHAR(50) DEFAULT NULL,
  `instrument_id` VARCHAR(64) NOT NULL,
  `instrument_title` VARCHAR(150) NOT NULL,
  `requested_amount` DECIMAL(15, 2) NOT NULL,
  `term_months` INT NOT NULL DEFAULT 36,
  `purpose` TEXT NOT NULL,
  `annual_income` DECIMAL(15, 2) NOT NULL,
  `credit_score` VARCHAR(50) NOT NULL,
  `status` ENUM('PENDING', 'UNDER_REVIEW', 'PARTNER_SUBMITTED', 'APPROVED', 'DISBURSED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `partner_bank` VARCHAR(150) DEFAULT NULL,
  `partner_submission_date` VARCHAR(50) DEFAULT NULL,
  `underwriter_notes_json` TEXT DEFAULT NULL,
  `assigned_broker` VARCHAR(150) DEFAULT 'Marcus Vance',
  `submitted_at` VARCHAR(50) NOT NULL,
  `last_updated` VARCHAR(50) NOT NULL,
  `tier_at_submission` VARCHAR(32) NOT NULL DEFAULT 'unassigned',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loan_user` (`user_id`),
  KEY `idx_loan_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Table: vault_documents (256-Bit Encrypted Vault Records)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vault_documents` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) DEFAULT NULL,
  `file_size` VARCHAR(50) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  `upload_date` VARCHAR(50) NOT NULL,
  `status` ENUM('VERIFIED', 'PENDING_REVIEW', 'ACTION_REQUIRED') NOT NULL DEFAULT 'PENDING_REVIEW',
  `verification_notes` TEXT DEFAULT NULL,
  `encryption_hash` VARCHAR(128) NOT NULL,
  `verified_by` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doc_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Table: transactions (Multi-Rail Financial Transactions)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(64) NOT NULL,
  `invoice_number` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `tier_id` VARCHAR(32) NOT NULL,
  `tier_name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `payment_method` VARCHAR(50) NOT NULL,
  `status` ENUM('COMPLETED', 'PROCESSING', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
  `date` VARCHAR(50) NOT NULL,
  `receipt_url` VARCHAR(255) DEFAULT NULL,
  `tx_hash` VARCHAR(255) DEFAULT NULL,
  `crypto_details_json` TEXT DEFAULT NULL,
  `billing_address_json` TEXT DEFAULT NULL,
  `card_last4` VARCHAR(10) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. Table: wire_proofs (Bank Wire Receipts & Remittance Slips)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wire_proofs` (
  `id` VARCHAR(64) NOT NULL,
  `transaction_id` VARCHAR(64) DEFAULT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `wire_reference_number` VARCHAR(100) NOT NULL,
  `remitter_name` VARCHAR(150) NOT NULL,
  `remitter_bank` VARCHAR(150) NOT NULL,
  `receipt_file_name` VARCHAR(255) DEFAULT NULL,
  `receipt_file_path` VARCHAR(255) DEFAULT NULL,
  `receipt_file_size` VARCHAR(50) DEFAULT NULL,
  `submission_date` VARCHAR(50) NOT NULL,
  `customer_care_notified` TINYINT(1) NOT NULL DEFAULT 1,
  `notified_agent_email` VARCHAR(191) DEFAULT 'jeffery@accountant.com',
  `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `audit_note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. Table: membership_subscribers (Subscribers & Pending Upgrades)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `membership_subscribers` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `company` VARCHAR(150) DEFAULT NULL,
  `request_id` VARCHAR(64) DEFAULT NULL,
  `membership_tier_id` VARCHAR(32) DEFAULT NULL,
  `membership_tier_name` VARCHAR(100) NOT NULL DEFAULT 'No Active Tier',
  `requested_tier_id` VARCHAR(32) DEFAULT NULL,
  `requested_tier_name` VARCHAR(100) DEFAULT NULL,
  `payment_status` ENUM('ACTIVE', 'PENDING', 'PAST_DUE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `approval_status` ENUM('AWAITING_PAYMENT_VERIFICATION', 'APPROVED', 'REJECTED') DEFAULT 'AWAITING_PAYMENT_VERIFICATION',
  `proof_status` VARCHAR(50) DEFAULT 'AWAITING_PROOF',
  `proof_attachment_name` VARCHAR(255) DEFAULT NULL,
  `date_joined` VARCHAR(50) NOT NULL,
  `amount_paid` DECIMAL(12, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `payment_method` VARCHAR(50) NOT NULL,
  `transaction_id` VARCHAR(64) NOT NULL,
  `billing_address_json` TEXT DEFAULT NULL,
  `card_last4` VARCHAR(10) DEFAULT NULL,
  `assigned_broker` VARCHAR(150) DEFAULT 'Marcus Vance',
  `assigned_care_agent` VARCHAR(150) DEFAULT 'Jeffery Dean',
  `assigned_care_email` VARCHAR(191) DEFAULT 'jeffery@accountant.com',
  `receipt_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `verified_by_agent` VARCHAR(150) DEFAULT NULL,
  `verified_at` VARCHAR(50) DEFAULT NULL,
  `payment_receipt_note` TEXT DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sub_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. Table: registration_applications (Public Enrollment Flow)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registration_applications` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `company` VARCHAR(150) DEFAULT NULL,
  `selected_tier` VARCHAR(32) DEFAULT NULL,
  `desired_amount` DECIMAL(15, 2) NOT NULL,
  `loan_purpose` TEXT NOT NULL,
  `credit_score` VARCHAR(50) NOT NULL,
  `submission_date` VARCHAR(50) NOT NULL,
  `status` ENUM('PENDING_REVIEW', 'APPROVED_READY_FOR_PAYMENT', 'REJECTED') NOT NULL DEFAULT 'PENDING_REVIEW',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reg_user` (`user_id`),
  KEY `idx_reg_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. Table: broker_messages (Client-to-Broker Encrypted Chat)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `broker_messages` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `sender_role` ENUM('CLIENT', 'BROKER', 'SYSTEM') NOT NULL,
  `sender_name` VARCHAR(150) NOT NULL,
  `text` TEXT NOT NULL,
  `timestamp` VARCHAR(50) NOT NULL,
  `is_encrypted` TINYINT(1) NOT NULL DEFAULT 1,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_msg_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. Table: system_settings (Configurations, CMS, Desks, Coordinates)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. Table: contact_inquiries (Contact Form Submissions -> support-broker@consultant.com)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_inquiries` (
  `id` VARCHAR(64) NOT NULL,
  `inquiry_number` VARCHAR(64) NOT NULL UNIQUE,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `company` VARCHAR(150) DEFAULT NULL,
  `capital_needed` VARCHAR(100) DEFAULT NULL,
  `product_type` VARCHAR(120) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `recipient_email` VARCHAR(191) NOT NULL DEFAULT 'support-broker@consultant.com',
  `mail_dispatched` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('NEW', 'IN_REVIEW', 'RESPONDED', 'ARCHIVED') NOT NULL DEFAULT 'NEW',
  `ip_address` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. Table: email_notifications (Automated Email Outbox & Audit Log)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `email_notifications` (
  `id` VARCHAR(64) NOT NULL,
  `event_type` VARCHAR(80) NOT NULL,
  `recipient_email` VARCHAR(191) NOT NULL,
  `recipient_name` VARCHAR(150) DEFAULT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body_html` LONGTEXT DEFAULT NULL,
  `body_text` TEXT DEFAULT NULL,
  `status` ENUM('SENT', 'QUEUED', 'FAILED', 'SIMULATED') NOT NULL DEFAULT 'SENT',
  `transport` VARCHAR(40) NOT NULL DEFAULT 'php_mail',
  `error_message` TEXT DEFAULT NULL,
  `related_entity_id` VARCHAR(64) DEFAULT NULL,
  `sent_at` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_event` (`event_type`),
  KEY `idx_email_recipient` (`recipient_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- INITIAL SEED DATA
-- Default Admin Profiles, Client Account, Desks & Config
-- =====================================================================

-- Default Client User (Alexander Vance)
-- Default Password: Password123! (bcrypt hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO `users` (
  `id`, `name`, `email`, `phone`, `company`, `password_hash`, `membership_tier_id`, `membership_status`, `member_since`, `renewal_date`, `kyc_status`, `assigned_broker`, `broker_direct_line`, `two_factor_enabled`, `total_active_capital`, `billing_address_json`
) VALUES (
  'usr-alexander-vance',
  'Alexander Vance',
  'alexander.vance@vanceholdings.com',
  '+1 (415) 890-4219',
  'Vance Capital Holdings LLC',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'gold',
  'ACTIVE',
  '2024-03-15',
  '2027-01-15',
  'VERIFIED',
  'Marcus Vance',
  '+1 (800) 555-4921',
  1,
  2500000.00,
  '{\"streetAddress\":\"450 Montgomery St\",\"streetAddress2\":\"Suite 1400\",\"city\":\"San Francisco\",\"state\":\"CA\",\"zipCode\":\"94104\",\"country\":\"United States\"}'
) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Default Super Admin (admin@admin.com & Eleanor Sterling) & Officers
INSERT INTO `admins` (
  `id`, `name`, `email`, `password_hash`, `role`, `title`, `avatar`, `permissions_json`
) VALUES
(
  'adm-root-1',
  'System Administrator',
  'admin@admin.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'SUPER_ADMIN',
  'Chief Executive & Root Administrator',
  'SA',
  '[\"ALL\",\"UNDERWRITE\",\"KYC_CLEARANCE\",\"PORTAL_OVERRIDE\",\"SETTINGS_EDIT\",\"MANUAL_TIER_UPGRADE\"]'
),
(
  'adm-super-1',
  'Eleanor Sterling',
  'eleanor.sterling@sterlingwealthbroker.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'SUPER_ADMIN',
  'Managing Principal & Chief Underwriter',
  'ES',
  '[\"ALL\",\"UNDERWRITE\",\"KYC_CLEARANCE\",\"PORTAL_OVERRIDE\",\"SETTINGS_EDIT\"]'
),
(
  'adm-support-1',
  'Jeffery Dean',
  'jeffery@accountant.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'CUSTOMER_SUPPORT',
  'Senior Customer Care Specialist',
  'JD',
  '[\"PAYMENT_VERIFY\",\"QUEUE_READ\",\"CLIENT_COMMUNICATION\"]'
),
(
  'adm-loan-1',
  'Julian Montgomery',
  'julian.m@sterlingwealthbroker.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'LOAN_SPECIALIST',
  'Syndicate Debt Placement Officer',
  'JM',
  '[\"LOAN_APPROVE\",\"PARTNER_SUBMISSION\",\"TERM_ADJUSTMENT\"]'
) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Default Membership Tiers
INSERT INTO `membership_tiers` (`id`, `name`, `badge`, `price`, `period`, `max_loan_limit`, `apr_discount`, `processing_sla`, `dedicated_broker`, `priority_underwriting`, `features_json`, `allowed_instruments_json`, `is_popular`, `color_scheme_json`) VALUES
('silver', 'Silver Access', 'Tier 1', 495.00, 'quarter', 50000.00, 0.50, '48 Hours', 0, 0, '[\"Borrowing capacity up to $50,000\",\"Access to Unsecured Personal & Micro-Business Lines\",\"48-Hour Broker Review SLA\",\"Automated Rate Comparison with 12 Partner Lenders\",\"Encrypted Digital Document Vault (5GB)\",\"Quarterly Financial Health Report\"]', '[\"inst-unsecured-personal\",\"inst-micro-credit\"]', 0, '{\"accent\":\"#94a3b8\",\"border\":\"border-slate-700/60\",\"bgGlow\":\"from-slate-500/10\",\"text\":\"text-slate-300\"}'),
('gold', 'Gold Executive', 'Tier 2 · Most Popular', 1450.00, 'quarter', 250000.00, 1.25, '24 Hours', 1, 1, '[\"Borrowing capacity up to $250,000\",\"Full Access to Commercial Lines & Equipment Facilities\",\"24-Hour Expedited Underwriting SLA\",\"Assigned Senior Wealth Broker (Direct Phone & Secure Chat)\",\"1.25% Direct APR Discount from Banking Partners\",\"Custom Commercial Loan Structuring\",\"Unlimited Encrypted Vault Storage with Multi-Party Sign-off\"]', '[\"inst-unsecured-personal\",\"inst-micro-credit\",\"inst-revolving-line\",\"inst-equipment-facility\"]', 1, '{\"accent\":\"#f59e0b\",\"border\":\"border-amber-500/50\",\"bgGlow\":\"from-amber-500/10\",\"text\":\"text-amber-400\"}'),
('platinum', 'Platinum Prestige', 'Tier 3 · Commercial Priority', 3850.00, 'year', 1000000.00, 2.00, '12 Hours', 1, 1, '[\"Borrowing capacity up to $1,000,000\",\"Commercial Real Estate Acquisition & Bridge Loans\",\"12-Hour Priority Underwriter Review\",\"Direct Desk Access to Tier-1 Banking Partners (JPMorgan, Barclays)\",\"2.00% APR Discount & Fee Waiver on Originator Fees\",\"Institutional Term Sheet Negotiations\",\"Dedicated Junior Analyst & Senior Broker Coverage\"]', '[\"inst-unsecured-personal\",\"inst-micro-credit\",\"inst-revolving-line\",\"inst-equipment-facility\",\"inst-commercial-mortgage\"]', 0, '{\"accent\":\"#38bdf8\",\"border\":\"border-sky-500/50\",\"bgGlow\":\"from-sky-500/10\",\"text\":\"text-sky-400\"}'),
('diamond', 'Diamond Syndicate', 'Tier 4 · Private Wealth', 8900.00, 'year', 15000000.00, 2.75, 'Immediate VIP', 1, 1, '[\"Borrowing capacity $1M to $15M+ Bespoke Debt\",\"Direct Access to Sovereign & Private Placement Debt Instruments\",\"Managing Director Level Broker Advisory\",\"Cross-Border Currency & Asset-Backed Arbitrage\",\"Zero Origination Surcharge from Broker Network\",\"White-Glove Legal & Escrow Structuring Desk\",\"Tailored Syndicated Club Facilities\"]', '[\"inst-unsecured-personal\",\"inst-micro-credit\",\"inst-revolving-line\",\"inst-equipment-facility\",\"inst-commercial-mortgage\",\"inst-private-wealth-liquidity\"]', 0, '{\"accent\":\"#10b981\",\"border\":\"border-emerald-500/50\",\"bgGlow\":\"from-emerald-500/10\",\"text\":\"text-emerald-400\"}')
ON DUPLICATE KEY UPDATE `price`=VALUES(`price`), `max_loan_limit`=VALUES(`max_loan_limit`);

-- Default Financial Instruments
INSERT INTO `financial_instruments` (
  `id`, `title`, `category`, `min_amount`, `max_amount`, `apr_range`, `term_options`, `min_tier_required`, `turnaround`, `description`, `eligibility_json`, `documents_required_json`, `partner_lenders_json`
) VALUES
(
  'inst-revolving-line',
  'Corporate Revolving Line of Credit',
  'Commercial',
  50000.00,
  250000.00,
  '6.45% - 9.20%',
  '12 to 36 Months (Renewable)',
  'gold',
  '24-48 Business Hours',
  'Flexible, continuous liquidity access for high-growth enterprises to bridge accounts receivable, manage inventory cycles, or capture opportunistic vendor discounts.',
  '[\"Minimum 18 months continuous business operation\",\"Annual gross business revenue exceeding $350,000\",\"Owner FICO score 670+\",\"Positive operating cash flow in last two tax filings\"]',
  '[\"Last 6 months corporate bank statements\",\"2 years corporate tax returns (Form 1120/1120-S)\",\"Current Year-to-Date Profit & Loss Statement\",\"Government Issued ID of majority shareholders (>20%)\"]',
  '[\"Barclays Corporate\",\"Wells Fargo Commercial\",\"HSBC Business\"]'
),
(
  'inst-commercial-mortgage',
  'Commercial Property Acquisition Facility',
  'Commercial',
  250000.00,
  1000000.00,
  '5.85% - 7.90%',
  '5, 10, or 25 Years Fixed / Adjustable',
  'platinum',
  '3 to 5 Business Days',
  'Senior secured mortgage capital for acquiring, refinancing, or expanding industrial properties, multi-tenant retail units, medical offices, and logistics distribution hubs.',
  '[\"Minimum Debt Service Coverage Ratio (DSCR) of 1.25x\",\"Commercial property appraisal by accredited surveyor\",\"Minimum 20% equity contribution / down payment\",\"Clean environmental Phase I assessment\"]',
  '[\"Certified rent rolls and lease agreements\",\"Property operating statements (last 3 years)\",\"Borrower personal and corporate balance sheets\",\"Articles of Organization and Operating Agreement\"]',
  '[\"JPMorgan Real Estate Capital\",\"Goldman Sachs Debt Funds\",\"Blackstone Debt\"]'
),
(
  'inst-unsecured-personal',
  'Tier-1 Executive Personal Credit Facility',
  'Personal',
  10000.00,
  50000.00,
  '7.20% - 11.50%',
  '24 to 60 Months Fixed',
  'silver',
  '24 Hours',
  'No-collateral liquidity intended for high-earning professionals, company directors, and accredited executives for strategic investments or high-yield opportunities.',
  '[\"Individual annual verifiable income > $110,000\",\"Credit score >= 700 with clean 3-year record\",\"Debt-to-income ratio below 35%\"]',
  '[\"Government Passport / Driving License\",\"Most recent 3 months payslips or W-2\",\"Recent 2 months personal bank statements\"]',
  '[\"SoFi Institutional\",\"Marcus by Goldman\",\"Discover Premier\"]'
),
(
  'inst-equipment-facility',
  'Fleet & Heavy Industrial Equipment Financing',
  'Asset-Backed',
  40000.00,
  250000.00,
  '6.10% - 8.40%',
  '36 to 84 Months',
  'gold',
  '24-48 Hours',
  '100% equipment financing with potential Section 179 tax deductions. The purchased machinery or vehicle fleet serves as primary pledge collateral.',
  '[\"Commercial invoice or pro-forma quote from licensed dealer\",\"Company in good standing with Secretary of State\",\"Positive credit payment history on trade lines\"]',
  '[\"Equipment quote / vendor invoice specification\",\"Company bank statements (4 months)\",\"Current balance sheet & income statement\"]',
  '[\"Caterpillar Financial\",\"GE Capital\",\"PNC Equipment Finance\"]'
),
(
  'inst-private-wealth-liquidity',
  'Private Placement & Securities-Backed Loan',
  'Wealth & Liquidity',
  1000000.00,
  15000000.00,
  'SOFR + 1.65% to 2.45%',
  'Interest-Only Revolving (1-5 Years)',
  'diamond',
  'Same-Day Term Sheet',
  'Institutional-grade non-purpose liquidity facility collateralized against equities, bonds, investment funds, or precious metals without triggering taxable capital gains events.',
  '[\"Eligible custodian brokerage assets >= $2,000,000\",\"Institutional or qualified accredited investor status\",\"Account held with tier-1 custodian (Pershing, BNY, Fidelity)\"]',
  '[\"Custodian holding statements (last 90 days)\",\"Entity trust or offshore vehicle formation documents\",\"Compliance & AML source of funds declaration\"]',
  '[\"UBS Private Bank\",\"Morgan Stanley Wealth\",\"Lombard Odier\"]'
) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Sample Loan Applications
INSERT INTO `loan_applications` (
  `id`, `application_number`, `user_id`, `applicant_name`, `applicant_email`, `applicant_phone`,
  `instrument_id`, `instrument_title`, `requested_amount`, `term_months`, `purpose`,
  `annual_income`, `credit_score`, `status`, `partner_bank`, `partner_submission_date`,
  `underwriter_notes_json`, `assigned_broker`, `submitted_at`, `last_updated`, `tier_at_submission`
) VALUES
(
  'app-1001',
  'SWB-2026-9481',
  'usr-alexander-vance',
  'Alexander Vance',
  'alexander.vance@vanceholdings.com',
  '+1 (415) 890-4219',
  'inst-revolving-line',
  'Corporate Revolving Line of Credit',
  180000.00,
  24,
  'Strategic Q2 inventory expansion and overseas manufacturer advance deposits.',
  520000.00,
  '745 - Excellent',
  'PARTNER_SUBMITTED',
  'Barclays Corporate Banking',
  '2026-10-24 14:30',
  '[\"Passed primary KYC and AML checks.\",\"Audited balance sheet indicates 2.4x current ratio.\",\"Submitted to Barclays Syndicated Credit Desk with recommended approval at 6.85% APR.\"]',
  'Marcus Vance',
  '2026-10-22 09:15',
  '2026-10-25 11:20',
  'gold'
),
(
  'app-1002',
  'SWB-2026-9470',
  'usr-alexander-vance',
  'Alexander Vance',
  'alexander.vance@vanceholdings.com',
  '+1 (415) 890-4219',
  'inst-equipment-facility',
  'Fleet & Heavy Industrial Equipment Financing',
  65000.00,
  36,
  'Acquisition of two precision CNC automated machining units for subsidiary.',
  520000.00,
  '745 - Excellent',
  'APPROVED',
  'PNC Equipment Finance',
  '2026-10-18 10:00',
  '[\"Direct equipment invoice verified from Haas Automation.\",\"Approved at 6.25% fixed interest with zero early-redemption penalty.\"]',
  'Marcus Vance',
  '2026-10-16 16:40',
  '2026-10-21 15:00',
  'gold'
) ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- Sample KYC Vault Documents
INSERT INTO `vault_documents` (
  `id`, `user_id`, `type`, `title`, `file_name`, `file_size`, `mime_type`, `upload_date`, `status`, `verification_notes`, `encryption_hash`, `verified_by`
) VALUES
(
  'doc-101',
  'usr-alexander-vance',
  'GOVERNMENT_ID',
  'Primary Director Passport (Biometric)',
  'Vance_Passport_Verified.pdf',
  '2.4 MB',
  'application/pdf',
  '2026-09-10',
  'VERIFIED',
  'OFAC and FinCEN AML cross-check cleared.',
  '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  'Julian Montgomery'
),
(
  'doc-102',
  'usr-alexander-vance',
  'BANK_STATEMENTS',
  '3-Month Corporate Bank Statements (JPMorgan)',
  'Vance_Holdings_JPM_Q3.pdf',
  '4.1 MB',
  'application/pdf',
  '2026-10-02',
  'VERIFIED',
  'Verified average daily liquidity balance and operating cash flow.',
  '0x4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
  'Julian Montgomery'
) ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- Sample Transactions & Subscriber Records
INSERT INTO `transactions` (
  `id`, `invoice_number`, `user_id`, `user_name`, `tier_id`, `tier_name`, `amount`, `currency`, `payment_method`, `status`, `date`, `tx_hash`, `card_last4`
) VALUES
(
  'tx-seed-1',
  'INV-SWB-2026-1042',
  'usr-alexander-vance',
  'Alexander Vance',
  'gold',
  'Gold Executive',
  1450.00,
  'USD',
  'BANK_WIRE',
  'COMPLETED',
  '2026-03-15 10:12:00',
  'SWB-SETTLE-8F4A91D2',
  NULL
) ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

INSERT INTO `membership_subscribers` (
  `id`, `user_id`, `name`, `email`, `phone`, `company`, `request_id`, `membership_tier_id`, `membership_tier_name`,
  `requested_tier_id`, `requested_tier_name`, `payment_status`, `approval_status`, `proof_status`, `proof_attachment_name`,
  `date_joined`, `amount_paid`, `currency`, `payment_method`, `transaction_id`, `assigned_broker`, `assigned_care_agent`, `assigned_care_email`, `receipt_verified`
) VALUES
(
  'sub-seed-1',
  'usr-alexander-vance',
  'Alexander Vance',
  'alexander.vance@vanceholdings.com',
  '+1 (415) 890-4219',
  'Vance Capital Holdings LLC',
  'REQ-2026-MEMB',
  'gold',
  'Gold Executive',
  'gold',
  'Gold Executive',
  'ACTIVE',
  'APPROVED',
  'RECEIPT_ATTACHED',
  'JPM_Wire_Receipt_1042.pdf',
  '2026-03-15',
  1450.00,
  'USD',
  'BANK_WIRE',
  'tx-seed-1',
  'Marcus Vance',
  'Jeffery Dean',
  'jeffery@accountant.com',
  1
) ON DUPLICATE KEY UPDATE `payment_status`=VALUES(`payment_status`);

-- Initial Encrypted Broker Chat Welcome Messages
INSERT INTO `broker_messages` (`id`, `user_id`, `sender_role`, `sender_name`, `text`, `timestamp`, `is_encrypted`) VALUES
('msg-init-1', 'usr-alexander-vance', 'SYSTEM', 'Broker Security Guard', 'Encrypted session established. AES-256 GCM channel active with Marcus Vance (Assigned Private Broker).', '10:00 AM', 1),
('msg-init-2', 'usr-alexander-vance', 'BROKER', 'Marcus Vance', 'Hello Alexander. I am monitoring your credit facility portfolio. How may our underwriting desk assist you today?', '10:01 AM', 1)
ON DUPLICATE KEY UPDATE `text`=VALUES(`text`);

-- Default System Settings: Support Config, Bank Wire Coordinates & Domain Config
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('support_config', '{
  \"agentName\": \"Jeffery Dean\",
  \"agentEmail\": \"jeffery@accountant.com\",
  \"agentSecondaryEmail\": \"jeffery@sterlingwealthbroker.com\",
  \"agentTitle\": \"Senior Customer Care Specialist\",
  \"agentPhone\": \"+1 (800) 842-9912\",
  \"telegramHandle\": \"@SterlingCareDesk\",
  \"postPaymentInstructions\": \"Please provide your wire receipt or transaction hash to your designated Customer Care Agent for priority verification.\",
  \"autoSendConfirmationEmail\": true,
  \"bankWire\": {
    \"bankName\": \"JPMorgan Chase Bank, N.A.\",
    \"accountName\": \"Sterling Wealth Brokerage Global Escrow LLC\",
    \"accountNumber\": \"88421094218\",
    \"iban\": \"US88CHAS120088421094218\",
    \"swiftBic\": \"CHASUS33\",
    \"routingCode\": \"021000021\",
    \"bankAddress\": \"270 Park Avenue, New York, NY 10017, USA\",
    \"referencePrefix\": \"SWB-WIRE\"
  },
  \"regionalDesks\": [
    {
      \"id\": \"americas\",
      \"regionName\": \"Americas & U.S. Headquarters\",
      \"officeAddress\": \"Financial District, 450 Montgomery St, Suite 1400, San Francisco, CA 94104\",
      \"email\": \"underwrite.us@sterlingwealthbroker.com\",
      \"phone\": \"+1 (415) 890-4200\",
      \"sla\": \"24-48 Hours Turnaround\"
    },
    {
      \"id\": \"emea\",
      \"regionName\": \"EMEA Corporate Underwriting\",
      \"officeAddress\": \"City of London, 100 Bishopsgate, Level 22, London EC2N 4AG, United Kingdom\",
      \"email\": \"underwrite.emea@sterlingwealthbroker.com\",
      \"phone\": \"+44 20 7946 0912\",
      \"sla\": \"Same-Day European Hours\"
    },
    {
      \"id\": \"apac\",
      \"regionName\": \"APAC Private Wealth Desk\",
      \"officeAddress\": \"Marina Bay Financial Centre, Tower 2, Singapore 018983\",
      \"email\": \"underwrite.apac@sterlingwealthbroker.com\",
      \"phone\": \"+65 6789 2200\",
      \"sla\": \"Expedited Sovereign Review\"
    }
  ]
}'),
('site_config', '{
  \"domain\": \"investproasset.com\",
  \"siteUrl\": \"https://investproasset.com\",
  \"contactFormRecipient\": \"support-broker@consultant.com\",
  \"mailFrom\": \"noreply@investproasset.com\"
}')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);

SET FOREIGN_KEY_CHECKS = 1;
