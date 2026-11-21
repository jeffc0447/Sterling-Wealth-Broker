<?php
/**
 * Sterling Wealth Brokerage - Admin Configuration & System Management API
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'get_config');
$input = getJsonInput();

switch ($action) {
    case 'get_config':
        $stmt = $pdo->prepare('SELECT setting_value FROM system_settings WHERE setting_key = "support_config" LIMIT 1');
        $stmt->execute();
        $row = $stmt->fetch();
        $config = $row ? json_decode($row['setting_value'], true) : null;
        sendJson(['config' => $config]);
        break;

    case 'save_config':
        $newConfig = $input['config'] ?? ($_POST['config'] ?? null);
        if (!$newConfig || !is_array($newConfig)) {
            sendError('Invalid configuration object', 400);
        }

        // Validate regional desk emails end with @sterlingwealthbroker.com
        if (!empty($newConfig['regionalDesks']) && is_array($newConfig['regionalDesks'])) {
            foreach ($newConfig['regionalDesks'] as &$desk) {
                if (!empty($desk['email']) && !str_ends_with(strtolower($desk['email']), '@sterlingwealthbroker.com')) {
                    $prefix = explode('@', $desk['email'])[0];
                    $desk['email'] = $prefix . '@sterlingwealthbroker.com';
                }
            }
        }

        $jsonStr = json_encode($newConfig, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        $stmt = $pdo->prepare('
            INSERT INTO system_settings (setting_key, setting_value)
            VALUES ("support_config", :val)
            ON DUPLICATE KEY UPDATE setting_value = :val2
        ');
        $stmt->execute([':val' => $jsonStr, ':val2' => $jsonStr]);

        sendJson([
            'message' => 'Institutional support configuration, bank coordinates, and regional desks updated in MySQL',
            'config'  => $newConfig
        ]);
        break;

    case 'stats':
        $stats = [
            'totalUsers'       => (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'totalLoans'       => (int)$pdo->query('SELECT COUNT(*) FROM loan_applications')->fetchColumn(),
            'pendingLoans'     => (int)$pdo->query('SELECT COUNT(*) FROM loan_applications WHERE status = "PENDING"')->fetchColumn(),
            'pendingKYC'       => (int)$pdo->query('SELECT COUNT(*) FROM vault_documents WHERE status = "PENDING_REVIEW"')->fetchColumn(),
            'totalCapital'     => (float)$pdo->query('SELECT COALESCE(SUM(total_active_capital), 0) FROM users')->fetchColumn(),
            'pendingUpgrades'  => (int)$pdo->query('SELECT COUNT(*) FROM membership_subscribers WHERE payment_status = "PENDING"')->fetchColumn(),
            'totalTransactions'=> (int)$pdo->query('SELECT COUNT(*) FROM transactions')->fetchColumn(),
        ];
        sendJson(['stats' => $stats]);
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
