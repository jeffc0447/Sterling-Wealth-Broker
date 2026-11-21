<?php
/**
 * Sterling Wealth Brokerage - MySQL Database Connection Configuration
 *
 * Reads credentials automatically from `.env` (via env.php), with safe fallback defaults.
 * Supports standard cPanel MySQL / MariaDB (localhost:3306 or custom socket).
 */

require_once __DIR__ . '/env.php';

defined('APP_DEBUG') || define('APP_DEBUG', envBool('APP_DEBUG', false));
defined('DB_HOST') || define('DB_HOST', (string)envValue('DB_HOST', 'localhost'));
defined('DB_PORT') || define('DB_PORT', (string)envValue('DB_PORT', '3306'));
defined('DB_NAME') || define('DB_NAME', (string)envValue('DB_NAME', 'investpro_sterlingdb'));
defined('DB_USER') || define('DB_USER', (string)envValue('DB_USER', 'investpro_sterlinguser'));
defined('DB_PASS') || define('DB_PASS', (string)envValue('DB_PASS', ''));
defined('DB_CHARSET') || define('DB_CHARSET', (string)envValue('DB_CHARSET', 'utf8mb4'));
defined('DB_SOCKET') || define('DB_SOCKET', (string)envValue('DB_SOCKET', ''));

class Database {
    private static ?PDO $instance = null;

    /**
     * Build PDO DSN string for MySQL/MariaDB.
     */
    public static function buildDsn(): string {
        if (DB_SOCKET !== '') {
            return sprintf(
                'mysql:unix_socket=%s;dbname=%s;charset=%s',
                DB_SOCKET,
                DB_NAME,
                DB_CHARSET
            );
        }

        return sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );
    }

    /**
     * Get singleton PDO connection instance.
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = self::buildDsn();

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci',
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=UTF-8');
                $payload = [
                    'success' => false,
                    'error'   => 'Database Connection Failure',
                    'message' => 'Could not connect to MySQL database on cPanel host. Verify backend/.env or backend/config/db.php credentials.',
                ];
                if (APP_DEBUG) {
                    $payload['details'] = $e->getMessage();
                }
                echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }
        }

        return self::$instance;
    }

    /**
     * Non-exiting connection test helper for diagnostics (setup_check.php).
     */
    public static function testConnection(): array {
        $dsn = self::buildDsn();
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        $version = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);

        return [
            'pdo'            => $pdo,
            'server_version' => $version,
        ];
    }
}
