<?php
/**
 * CORS, Domain Deployment Config, and HTTP Response Utilities for PHP Backend
 * Production Domain: investproasset.com
 */

require_once __DIR__ . '/env.php';

$timezone = (string)envValue('APP_TIMEZONE', 'UTC');
if ($timezone !== '') {
    @date_default_timezone_set($timezone);
}

defined('APP_ENV') || define('APP_ENV', (string)envValue('APP_ENV', 'production'));
defined('SITE_DOMAIN') || define('SITE_DOMAIN', (string)envValue('SITE_DOMAIN', 'investproasset.com'));
defined('SITE_URL') || define('SITE_URL', (string)envValue('SITE_URL', 'https://investproasset.com'));
defined('CONTACT_RECIPIENT_EMAIL') || define('CONTACT_RECIPIENT_EMAIL', (string)envValue('CONTACT_RECIPIENT_EMAIL', 'support-broker@consultant.com'));
defined('MAIL_FROM_EMAIL') || define('MAIL_FROM_EMAIL', (string)envValue('MAIL_FROM_EMAIL', 'noreply@investproasset.com'));
defined('MAIL_FROM_NAME') || define('MAIL_FROM_NAME', (string)envValue('MAIL_FROM_NAME', 'Sterling Wealth Broker'));
$configuredSecret = (string)envValue('AUTH_TOKEN_SECRET', '');
if ($configuredSecret === '') {
    $secretFile = __DIR__ . '/.auth_secret';
    if (is_file($secretFile)) {
        $configuredSecret = trim((string)@file_get_contents($secretFile));
    }
    if ($configuredSecret === '') {
        $configuredSecret = bin2hex(random_bytes(32));
        @file_put_contents($secretFile, $configuredSecret);
        @chmod($secretFile, 0600);
    }
}
defined('AUTH_TOKEN_SECRET') || define('AUTH_TOKEN_SECRET', $configuredSecret);

$defaultOrigins = [
    'https://investproasset.com',
    'https://www.investproasset.com',
    'http://investproasset.com',
    'http://www.investproasset.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

$envOriginsRaw = (string)envValue('ALLOWED_ORIGINS', '');
$envOrigins = $envOriginsRaw !== ''
    ? array_values(array_filter(array_map('trim', explode(',', $envOriginsRaw))))
    : [];

$allowedOrigins = array_values(array_unique(array_merge($defaultOrigins, $envOrigins)));

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $escapedDomain = preg_quote(SITE_DOMAIN, '/');
    $isAllowed = in_array($origin, $allowedOrigins, true)
        || (bool)preg_match('/^https:\/\/([a-z0-9-]+\.)*' . $escapedDomain . '$/i', $origin)
        || (bool)preg_match('/^https:\/\/[a-z0-9-]+\.europe-west3\.run\.app$/i', $origin);

    if ($isAllowed) {
        header("Access-Control-Allow-Origin: $origin");
        header("Vary: Origin");
        header("Access-Control-Allow-Credentials: true");
    }
} else {
    header("Access-Control-Allow-Origin: " . SITE_URL);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");

// Handle preflight OPTIONS request
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header('Content-Type: application/json; charset=UTF-8');

/**
 * Send standard JSON response
 */
function sendJson(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send standard Error JSON response
 */
function sendError(string $message, int $statusCode = 400, $details = null): void {
    http_response_code($statusCode);
    $response = [
        'success' => false,
        'error'   => $message
    ];
    if ($details !== null) {
        $response['details'] = $details;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Read and decode incoming JSON request body
 */
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Basic session token extraction from Authorization header
 */
function getBearerToken(): ?string {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
    }
    return null;
}

/**
 * Base64URL encode / decode helpers
 */
function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    $decoded = base64_decode(strtr($data, '-_', '+/'), true);
    return $decoded !== false ? $decoded : '';
}

/**
 * Create an HMAC-SHA256 signed auth token
 */
function createSignedToken(array $payload): string {
    if (!isset($payload['iat'])) {
        $payload['iat'] = time();
    }
    if (!isset($payload['exp'])) {
        $payload['exp'] = time() + 86400 * 7; // 7 days
    }
    $headerB64 = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payloadB64 = base64UrlEncode(json_encode($payload));
    $sig = hash_hmac('sha256', $headerB64 . '.' . $payloadB64, AUTH_TOKEN_SECRET, true);
    return $headerB64 . '.' . $payloadB64 . '.' . base64UrlEncode($sig);
}

/**
 * Verify and decode an HMAC-SHA256 signed auth token
 */
function verifySignedToken(?string $token): ?array {
    if (!$token || !is_string($token)) {
        return null;
    }
    $parts = explode('.', $token);
    if (count($parts) === 3) {
        [$headerB64, $payloadB64, $sigB64] = $parts;
        $expectedSig = base64UrlEncode(hash_hmac('sha256', $headerB64 . '.' . $payloadB64, AUTH_TOKEN_SECRET, true));
        if (!hash_equals($expectedSig, $sigB64)) {
            return null;
        }
        $payload = json_decode(base64UrlDecode($payloadB64), true);
        if (!is_array($payload)) {
            return null;
        }
        if (isset($payload['exp']) && time() > intval($payload['exp'])) {
            return null;
        }
        return $payload;
    }
    return null;
}

/**
 * Set HttpOnly session cookie (supports HTTPS and reverse proxy detection)
 */
function setSessionCookie(string $cookieName, string $token, int $ttlSeconds = 604800): void {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (intval($_SERVER['SERVER_PORT'] ?? 80) === 443);

    $cookieOptions = [
        'expires'  => time() + $ttlSeconds,
        'path'     => '/',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => $isHttps ? 'None' : 'Lax',
    ];
    @setcookie($cookieName, $token, $cookieOptions);
}

/**
 * Clear an HttpOnly session cookie
 */
function clearSessionCookie(string $cookieName): void {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (intval($_SERVER['SERVER_PORT'] ?? 80) === 443);

    @setcookie($cookieName, '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => $isHttps ? 'None' : 'Lax',
    ]);
}

/**
 * Check Origin/CSRF header when authenticating via HttpOnly cookie on state-changing requests
 */
function isValidCsrfContext(): bool {
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH'])) {
        return true;
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? ($_SERVER['HTTP_HOST'] ?? '');
    if ($origin !== '' && $host !== '') {
        $originHost = parse_url($origin, PHP_URL_HOST);
        $cleanHost = explode(':', $host)[0];
        if ($originHost && strcasecmp($originHost, $cleanHost) === 0) {
            return true;
        }
    }
    return false;
}

/**
 * Verify admin session via Bearer token or HttpOnly admin cookie
 */
function requireAdminAuth(PDO $pdo): array {
    $bearer = getBearerToken();
    if ($bearer) {
        $payload = verifySignedToken($bearer);
        if ($payload && !empty($payload['isAdmin']) && !empty($payload['id'])) {
            $stmt = $pdo->prepare('SELECT id, name, email, role FROM admins WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $payload['id']]);
            $admin = $stmt->fetch();
            if ($admin) {
                return $admin;
            }
        }
    }

    $cookieToken = $_COOKIE['swb_admin_session'] ?? null;
    if ($cookieToken && isValidCsrfContext()) {
        $payload = verifySignedToken($cookieToken);
        if ($payload && !empty($payload['isAdmin']) && !empty($payload['id'])) {
            $stmt = $pdo->prepare('SELECT id, name, email, role FROM admins WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $payload['id']]);
            $admin = $stmt->fetch();
            if ($admin) {
                return $admin;
            }
        }
    }

    sendError('Unauthorized: Administrator authentication required.', 401);
    return [];
}

