<?php
/**
 * Sterling Wealth Brokerage - cPanel & MySQL Setup Health Check
 * Tests PHP version, .env configuration, PDO MySQL driver, database connection, and table status
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$uploadsDir = __DIR__ . '/../uploads';

$results = [
    'timestamp'         => date('Y-m-d H:i:s T'),
    'deployment_domain' => defined('SITE_DOMAIN') ? SITE_DOMAIN : 'investproasset.com',
    'contact_recipient' => defined('CONTACT_RECIPIENT_EMAIL') ? CONTACT_RECIPIENT_EMAIL : 'support-broker@consultant.com',
    'php_version'       => PHP_VERSION,
    'php_compatible'    => version_compare(PHP_VERSION, '7.4.0', '>='),
    'env_config'        => [
        'env_file_loaded' => defined('STERLING_ENV_LOADED') ? STERLING_ENV_LOADED : false,
        'env_source'      => defined('STERLING_ENV_SOURCE') ? STERLING_ENV_SOURCE : 'fallback-defaults',
        'app_env'         => defined('APP_ENV') ? APP_ENV : 'production',
        'site_url'        => defined('SITE_URL') ? SITE_URL : 'https://investproasset.com',
        'uploads_writable'=> is_dir($uploadsDir) && is_writable($uploadsDir),
    ],
    'mail_config'       => [
        'driver'          => strtolower((string)envValue('MAIL_DRIVER', 'mail')),
        'from_email'      => defined('MAIL_FROM_EMAIL') ? MAIL_FROM_EMAIL : 'noreply@investproasset.com',
        'smtp_configured' => ((string)envValue('SMTP_HOST', '') !== '' && (string)envValue('SMTP_USER', '') !== ''),
        'admin_alert'     => (string)envValue('ADMIN_ALERT_EMAIL', defined('CONTACT_RECIPIENT_EMAIL') ? CONTACT_RECIPIENT_EMAIL : 'support-broker@consultant.com'),
    ],
    'extensions'        => [
        'pdo'       => extension_loaded('pdo'),
        'pdo_mysql' => extension_loaded('pdo_mysql'),
        'json'      => extension_loaded('json'),
        'mbstring'  => extension_loaded('mbstring'),
        'openssl'   => extension_loaded('openssl'),
    ],
    'database'          => [
        'connected'      => false,
        'host'           => defined('DB_HOST') ? DB_HOST : 'localhost',
        'database'       => defined('DB_NAME') ? DB_NAME : 'investpro_sterlingdb',
        'user'           => defined('DB_USER') ? DB_USER : 'investpro_sterlinguser',
        'server_version' => null,
        'error'          => null,
        'tables'         => []
    ]
];

$requiredTables = [
    'users',
    'admins',
    'membership_tiers',
    'financial_instruments',
    'loan_applications',
    'vault_documents',
    'transactions',
    'wire_proofs',
    'membership_subscribers',
    'registration_applications',
    'broker_messages',
    'system_settings',
    'contact_inquiries',
    'email_notifications'
];

try {
    $connInfo = Database::testConnection();
    $pdo = $connInfo['pdo'];
    $results['database']['connected'] = true;
    $results['database']['server_version'] = $connInfo['server_version'];

    // Check all 13 tables
    foreach ($requiredTables as $tbl) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM `{$tbl}`");
            $count = (int)$stmt->fetchColumn();
            $results['database']['tables'][$tbl] = [
                'exists' => true,
                'rows'   => $count
            ];
        } catch (Exception $e) {
            $results['database']['tables'][$tbl] = [
                'exists' => false,
                'error'  => $e->getMessage()
            ];
        }
    }

    $allTablesPresent = true;
    foreach ($results['database']['tables'] as $t) {
        if (!$t['exists']) {
            $allTablesPresent = false;
            break;
        }
    }
    $results['all_tables_installed'] = $allTablesPresent;

} catch (Exception $e) {
    $results['database']['connected'] = false;
    $results['database']['error'] = $e->getMessage();
    $results['all_tables_installed'] = false;
}

sendJson($results);
