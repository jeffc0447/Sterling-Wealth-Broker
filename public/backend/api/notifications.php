<?php
/**
 * Sterling Wealth Brokerage - Automated Email Notification API Endpoint
 *
 * Actions:
 *   POST ?action=send   -> Dispatch automated email notification & log in MySQL
 *   POST ?action=test   -> Send test email via current SMTP / PHP mail() settings
 *   GET  ?action=list   -> List recent email notification logs
 *   GET  ?action=config -> Retrieve non-secret email & SMTP configuration
 *   POST ?action=config -> Save automated email & SMTP configuration in MySQL
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mailer.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');
$input = getJsonInput();
if (empty($input) && !empty($_POST)) {
    $input = $_POST;
}

switch ($action) {
    case 'send':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendError('Method not allowed. Use POST.', 405);
        }

        $eventType       = trim((string)($input['eventType'] ?? 'CUSTOM_TEST'));
        $recipientEmail  = trim((string)($input['recipientEmail'] ?? ''));
        $recipientName   = trim((string)($input['recipientName'] ?? 'Valued Member'));
        $variables       = is_array($input['variables'] ?? null) ? $input['variables'] : [];
        $relatedEntityId = isset($input['relatedEntityId']) ? (string)$input['relatedEntityId'] : null;
        $overrideSubject = isset($input['subject']) ? (string)$input['subject'] : null;
        $overrideHtml    = isset($input['htmlBody']) ? (string)$input['htmlBody'] : null;

        if (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            sendError('Valid recipientEmail is required.', 400);
        }

        $result = EmailNotifier::dispatchEvent(
            $pdo,
            $eventType,
            $recipientEmail,
            $recipientName,
            $variables,
            $relatedEntityId,
            $overrideSubject,
            $overrideHtml
        );

        sendJson([
            'notification' => $result,
            'message'      => $result['dispatched']
                ? "Automated email ({$eventType}) dispatched to {$recipientEmail}."
                : "Email logged with status {$result['status']}.",
        ]);
        break;

    case 'test':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendError('Method not allowed. Use POST.', 405);
        }

        $toEmail = trim((string)($input['toEmail'] ?? $input['recipientEmail'] ?? ''));
        $toName  = trim((string)($input['toName'] ?? 'System Administrator'));
        $message = trim((string)($input['message'] ?? 'Live verification test from Sterling Wealth Broker Automated Email Notification System.'));

        if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            sendError('Please provide a valid test recipient email address.', 400);
        }

        $result = EmailNotifier::dispatchEvent(
            $pdo,
            'CUSTOM_TEST',
            $toEmail,
            $toName,
            [
                'subject' => 'Test Notification — ' . (defined('SITE_DOMAIN') ? SITE_DOMAIN : 'investproasset.com'),
                'heading' => 'cPanel Email System Test',
                'message' => $message,
            ],
            'TEST-' . date('YmdHis')
        );

        sendJson([
            'notification' => $result,
            'message'      => $result['dispatched']
                ? "Test email successfully sent to {$toEmail} via {$result['transport']}."
                : "Test email dispatch returned {$result['status']}: " . ($result['error'] ?? 'Unknown transport error'),
        ]);
        break;

    case 'list':
        try {
            $limit = min(200, max(10, (int)($_GET['limit'] ?? 100)));
            $stmt = $pdo->prepare('SELECT id, event_type, recipient_email, recipient_name, subject, body_html, body_text, status, transport, error_message, related_entity_id, sent_at, created_at FROM email_notifications ORDER BY created_at DESC LIMIT :lim');
            $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $logs = $stmt->fetchAll();
            sendJson(['logs' => $logs]);
        } catch (Throwable $e) {
            sendJson(['logs' => [], 'notice' => 'Run schema.sql or install.php to initialize email_notifications table.']);
        }
        break;

    case 'config':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $newCfg = $input['config'] ?? $input;
            if (!is_array($newCfg)) {
                sendError('Invalid email configuration payload.', 400);
            }

            $existing = EmailNotifier::getConfig($pdo);

            // Preserve existing SMTP password if masked or omitted
            $incomingPass = (string)($newCfg['smtpPassword'] ?? '');
            $resolvedPass = ($incomingPass !== '' && $incomingPass !== '••••••••')
                ? $incomingPass
                : (string)$existing['smtpPassword'];

            $merged = [
                'enabled'         => isset($newCfg['enabled']) ? (bool)$newCfg['enabled'] : (bool)$existing['enabled'],
                'driver'          => in_array(strtolower((string)($newCfg['driver'] ?? $existing['driver'])), ['smtp', 'mail'], true)
                    ? strtolower((string)($newCfg['driver'] ?? $existing['driver']))
                    : 'mail',
                'fromEmail'       => filter_var((string)($newCfg['fromEmail'] ?? ''), FILTER_VALIDATE_EMAIL)
                    ? (string)$newCfg['fromEmail']
                    : (string)$existing['fromEmail'],
                'fromName'        => EmailNotifier::sanitizeHeaderValue((string)($newCfg['fromName'] ?? $existing['fromName'])),
                'replyToEmail'    => filter_var((string)($newCfg['replyToEmail'] ?? ''), FILTER_VALIDATE_EMAIL)
                    ? (string)$newCfg['replyToEmail']
                    : (string)$existing['replyToEmail'],
                'adminAlertEmail' => filter_var((string)($newCfg['adminAlertEmail'] ?? ''), FILTER_VALIDATE_EMAIL)
                    ? (string)$newCfg['adminAlertEmail']
                    : (string)$existing['adminAlertEmail'],
                'smtpHost'        => trim((string)($newCfg['smtpHost'] ?? $existing['smtpHost'])),
                'smtpPort'        => max(1, min(65535, (int)($newCfg['smtpPort'] ?? $existing['smtpPort']))),
                'smtpEncryption'  => in_array(strtolower((string)($newCfg['smtpEncryption'] ?? $existing['smtpEncryption'])), ['ssl', 'tls', 'none'], true)
                    ? strtolower((string)($newCfg['smtpEncryption'] ?? $existing['smtpEncryption']))
                    : 'ssl',
                'smtpUsername'    => trim((string)($newCfg['smtpUsername'] ?? $existing['smtpUsername'])),
                'smtpPassword'    => $resolvedPass,
                'triggers'        => is_array($newCfg['triggers'] ?? null)
                    ? array_merge($existing['triggers'], $newCfg['triggers'])
                    : $existing['triggers'],
            ];

            $jsonStr = json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            $stmt = $pdo->prepare('
                INSERT INTO system_settings (setting_key, setting_value)
                VALUES ("email_settings", :val)
                ON DUPLICATE KEY UPDATE setting_value = :val2
            ');
            $stmt->execute([':val' => $jsonStr, ':val2' => $jsonStr]);

            // Mask password in response
            $safeOut = $merged;
            $safeOut['hasSmtpPassword'] = $resolvedPass !== '';
            $safeOut['smtpPassword'] = $resolvedPass !== '' ? '••••••••' : '';

            sendJson([
                'message' => 'Automated email & SMTP settings saved to MySQL.',
                'config'  => $safeOut,
            ]);
        } else {
            $cfg = EmailNotifier::getConfig($pdo);
            $cfg['hasSmtpPassword'] = $cfg['smtpPassword'] !== '';
            $cfg['smtpPassword'] = $cfg['smtpPassword'] !== '' ? '••••••••' : '';
            sendJson(['config' => $cfg]);
        }
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
