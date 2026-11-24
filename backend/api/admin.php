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

    case 'delete_user_profile':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            sendError('Method not allowed. Use POST or DELETE.', 405);
        }

        $admin = requireAdminAuth($pdo);

        $registrationId = trim((string)($input['registrationId'] ?? ($_POST['registrationId'] ?? '')));
        $subscriberId   = trim((string)($input['subscriberId'] ?? ($_POST['subscriberId'] ?? '')));
        $userId         = trim((string)($input['userId'] ?? ($_POST['userId'] ?? '')));
        $email          = trim(strtolower((string)($input['email'] ?? ($_POST['email'] ?? ''))));

        if ($registrationId === '' && $subscriberId === '' && $userId === '' && $email === '') {
            sendError('At least one identifier (registrationId, subscriberId, userId, or email) is required.', 400);
        }

        // Resolve linked userId and email from existing tables if only partial identifier provided
        if ($registrationId !== '') {
            try {
                $stmtReg = $pdo->prepare('SELECT user_id, email FROM registration_applications WHERE id = :id LIMIT 1');
                $stmtReg->execute([':id' => $registrationId]);
                $regRow = $stmtReg->fetch();
                if ($regRow) {
                    if ($userId === '' && !empty($regRow['user_id'])) {
                        $userId = (string)$regRow['user_id'];
                    }
                    if ($email === '' && !empty($regRow['email'])) {
                        $email = strtolower((string)$regRow['email']);
                    }
                }
            } catch (Exception $e) {
                $stmtRegFallback = $pdo->prepare('SELECT email FROM registration_applications WHERE id = :id LIMIT 1');
                $stmtRegFallback->execute([':id' => $registrationId]);
                $regRow = $stmtRegFallback->fetch();
                if ($regRow && $email === '' && !empty($regRow['email'])) {
                    $email = strtolower((string)$regRow['email']);
                }
            }
        }

        if ($subscriberId !== '') {
            $stmtSub = $pdo->prepare('SELECT user_id, email FROM membership_subscribers WHERE id = :id LIMIT 1');
            $stmtSub->execute([':id' => $subscriberId]);
            $subRow = $stmtSub->fetch();
            if ($subRow) {
                if ($userId === '' && !empty($subRow['user_id'])) {
                    $userId = (string)$subRow['user_id'];
                }
                if ($email === '' && !empty($subRow['email'])) {
                    $email = strtolower((string)$subRow['email']);
                }
            }
        }

        if ($userId === '' && $email !== '') {
            $stmtFindUser = $pdo->prepare('SELECT id FROM users WHERE LOWER(email) = :email LIMIT 1');
            $stmtFindUser->execute([':email' => $email]);
            $userRow = $stmtFindUser->fetch();
            if ($userRow && !empty($userRow['id'])) {
                $userId = (string)$userRow['id'];
            }
        }

        if ($email === '' && $userId !== '') {
            $stmtFindEmail = $pdo->prepare('SELECT email FROM users WHERE id = :uid LIMIT 1');
            $stmtFindEmail->execute([':uid' => $userId]);
            $userRow = $stmtFindEmail->fetch();
            if ($userRow && !empty($userRow['email'])) {
                $email = strtolower((string)$userRow['email']);
            }
        }

        $uploadsBase = realpath(__DIR__ . '/../uploads');
        $filesToUnlink = [];

        if ($userId !== '') {
            $stmtDocFiles = $pdo->prepare('SELECT file_path FROM vault_documents WHERE user_id = :uid AND file_path IS NOT NULL');
            $stmtDocFiles->execute([':uid' => $userId]);
            foreach ($stmtDocFiles->fetchAll() as $row) {
                if (!empty($row['file_path'])) {
                    $filesToUnlink[] = (string)$row['file_path'];
                }
            }

            $stmtWireFiles = $pdo->prepare('SELECT receipt_file_path FROM wire_proofs WHERE user_id = :uid AND receipt_file_path IS NOT NULL');
            $stmtWireFiles->execute([':uid' => $userId]);
            foreach ($stmtWireFiles->fetchAll() as $row) {
                if (!empty($row['receipt_file_path'])) {
                    $filesToUnlink[] = (string)$row['receipt_file_path'];
                }
            }
        }

        $pdo->beginTransaction();
        try {
            // 1. Delete from registration_applications
            if ($registrationId !== '') {
                $stmtDelReg = $pdo->prepare('DELETE FROM registration_applications WHERE id = :id');
                $stmtDelReg->execute([':id' => $registrationId]);
            }
            if ($email !== '') {
                $stmtDelRegEmail = $pdo->prepare('DELETE FROM registration_applications WHERE LOWER(email) = :email');
                $stmtDelRegEmail->execute([':email' => $email]);
            }
            if ($userId !== '') {
                try {
                    $stmtDelRegUid = $pdo->prepare('DELETE FROM registration_applications WHERE user_id = :uid');
                    $stmtDelRegUid->execute([':uid' => $userId]);
                } catch (Exception $ignored) {}
            }

            // 2. Delete from membership_subscribers
            if ($subscriberId !== '') {
                $stmtDelSubId = $pdo->prepare('DELETE FROM membership_subscribers WHERE id = :id');
                $stmtDelSubId->execute([':id' => $subscriberId]);
            }
            if ($userId !== '') {
                $stmtDelSubUid = $pdo->prepare('DELETE FROM membership_subscribers WHERE user_id = :uid');
                $stmtDelSubUid->execute([':uid' => $userId]);
            }
            if ($email !== '') {
                $stmtDelSubEmail = $pdo->prepare('DELETE FROM membership_subscribers WHERE LOWER(email) = :email');
                $stmtDelSubEmail->execute([':email' => $email]);
            }

            // 3. Delete vault_documents, wire_proofs, loan_applications, transactions, broker_messages
            if ($userId !== '') {
                $pdo->prepare('DELETE FROM vault_documents WHERE user_id = :uid')->execute([':uid' => $userId]);
                $pdo->prepare('DELETE FROM wire_proofs WHERE user_id = :uid')->execute([':uid' => $userId]);
                $pdo->prepare('DELETE FROM loan_applications WHERE user_id = :uid')->execute([':uid' => $userId]);
                $pdo->prepare('DELETE FROM transactions WHERE user_id = :uid')->execute([':uid' => $userId]);
                $pdo->prepare('DELETE FROM broker_messages WHERE user_id = :uid')->execute([':uid' => $userId]);
            }
            if ($email !== '') {
                $pdo->prepare('DELETE FROM loan_applications WHERE LOWER(applicant_email) = :email')->execute([':email' => $email]);
            }

            // 4. Delete user profile from users table
            $deletedUserRows = 0;
            if ($userId !== '') {
                $stmtDelUser = $pdo->prepare('DELETE FROM users WHERE id = :uid');
                $stmtDelUser->execute([':uid' => $userId]);
                $deletedUserRows += $stmtDelUser->rowCount();
            }
            if ($email !== '') {
                $stmtDelUserEmail = $pdo->prepare('DELETE FROM users WHERE LOWER(email) = :email');
                $stmtDelUserEmail->execute([':email' => $email]);
                $deletedUserRows += $stmtDelUserEmail->rowCount();
            }

            $pdo->commit();

            // Clean up uploaded files strictly inside uploads directory
            if ($uploadsBase !== false) {
                foreach ($filesToUnlink as $relPath) {
                    $candidate = realpath(__DIR__ . '/../' . ltrim($relPath, '/'));
                    if ($candidate !== false && strpos($candidate, $uploadsBase . DIRECTORY_SEPARATOR) === 0 && is_file($candidate)) {
                        @unlink($candidate);
                    }
                }
            }

            sendJson([
                'message'         => 'User profile, registration, and KYC records permanently deleted from server.',
                'deleted'         => true,
                'deletedUserId'   => $userId !== '' ? $userId : null,
                'deletedEmail'    => $email !== '' ? $email : null,
                'deletedUsersRow' => $deletedUserRows,
                'deletedByAdmin'  => $admin['email'] ?? $admin['name'] ?? 'admin',
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('delete_user_profile error: ' . $e->getMessage());
            sendError('Failed to delete user profile from server.', 500);
        }
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
