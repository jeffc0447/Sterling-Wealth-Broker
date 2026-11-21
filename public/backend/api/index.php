<?php
/**
 * Sterling Wealth Brokerage - Unified API Gateway / Router
 * Supports both direct script invocation (e.g. auth.php) and REST style routes (/backend/api/auth)
 */

require_once __DIR__ . '/../config/cors.php';

$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($requestUri, PHP_URL_PATH);

// Extract endpoint name
$segments = array_values(array_filter(explode('/', trim($path, '/'))));
$endpoint = end($segments) ?: ($_GET['endpoint'] ?? 'setup_check');

// Map clean endpoint names to physical php files
$routeMap = [
    'auth'        => __DIR__ . '/auth.php',
    'loans'       => __DIR__ . '/loans.php',
    'documents'   => __DIR__ . '/documents.php',
    'checkout'    => __DIR__ . '/checkout.php',
    'subscribers' => __DIR__ . '/subscribers.php',
    'chat'        => __DIR__ . '/chat.php',
    'contact'     => __DIR__ . '/contact.php',
    'admin'       => __DIR__ . '/admin.php',
    'setup_check' => __DIR__ . '/setup_check.php',
];

if (isset($routeMap[$endpoint]) && file_exists($routeMap[$endpoint])) {
    require $routeMap[$endpoint];
    exit;
}

// Fallback: Default API Info
sendJson([
    'platform'  => 'Sterling Wealth Brokerage API',
    'domain'    => 'investproasset.com',
    'version'   => '1.0.0',
    'runtime'   => 'PHP ' . PHP_VERSION,
    'endpoints' => [
        'auth'        => '/backend/api/auth.php (login, register, me)',
        'loans'       => '/backend/api/loans.php (instruments, tiers, list, apply, update_status)',
        'documents'   => '/backend/api/documents.php (list, upload, verify)',
        'checkout'    => '/backend/api/checkout.php (process, transactions)',
        'subscribers' => '/backend/api/subscribers.php (list, approve_upgrade, reject_upgrade, resubmit_proof)',
        'chat'        => '/backend/api/chat.php (history, send)',
        'contact'     => '/backend/api/contact.php (submit, list -> support-broker@consultant.com)',
        'admin'       => '/backend/api/admin.php (get_config, save_config, stats)',
        'setup_check' => '/backend/api/setup_check.php (cPanel database health diagnostic)'
    ]
]);
