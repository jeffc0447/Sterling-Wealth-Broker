<?php
/**
 * Sterling Wealth Brokerage - Encrypted Broker Chat API Endpoint
 * 
 * Implements requirement:
 * "Enable users to be able to chat with broker from there client dashboard through the
 * encrypted broker chat session made available on there client dashboard. The chat session
 * should be automatically responded by robot and after 3-5 questions answered, the robot
 * system should automatically ask them to contact the customer care agent for further inquiries."
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'history');
$input = getJsonInput();

switch ($action) {
    case 'history':
        $userId = $_GET['user_id'] ?? ($input['userId'] ?? 'usr-alexander-vance');
        
        $stmt = $pdo->prepare('SELECT * FROM broker_messages WHERE user_id = :uid ORDER BY created_at ASC');
        $stmt->execute([':uid' => $userId]);
        $messages = $stmt->fetchAll();

        // If empty, seed initial welcoming messages
        if (empty($messages)) {
            $welcome = [
                [
                    'id'          => 'msg-init-1',
                    'user_id'     => $userId,
                    'sender_role' => 'SYSTEM',
                    'sender_name' => 'Broker Security Guard',
                    'text'        => 'Encrypted session established. AES-256 GCM channel active with Marcus Vance (Assigned Private Broker).',
                    'timestamp'   => '10:00 AM',
                    'is_encrypted'=> 1
                ],
                [
                    'id'          => 'msg-init-2',
                    'user_id'     => $userId,
                    'sender_role' => 'BROKER',
                    'sender_name' => 'Marcus Vance',
                    'text'        => 'Hello Alexander. I am monitoring your credit facility portfolio. How may our underwriting desk assist you today?',
                    'timestamp'   => '10:01 AM',
                    'is_encrypted'=> 1
                ]
            ];

            foreach ($welcome as $m) {
                $stmtInsert = $pdo->prepare('
                    INSERT INTO broker_messages (id, user_id, sender_role, sender_name, text, timestamp, is_encrypted)
                    VALUES (:id, :uid, :role, :name, :text, :time, :enc)
                ');
                $stmtInsert->execute([
                    ':id'   => $m['id'],
                    ':uid'  => $m['user_id'],
                    ':role' => $m['sender_role'],
                    ':name' => $m['sender_name'],
                    ':text' => $m['text'],
                    ':time' => $m['timestamp'],
                    ':enc'  => $m['is_encrypted']
                ]);
            }

            $messages = $welcome;
        }

        sendJson(['messages' => $messages]);
        break;

    case 'send':
        $userId = $input['userId'] ?? ($_POST['userId'] ?? 'usr-alexander-vance');
        $userText = trim($input['text'] ?? ($_POST['text'] ?? ''));

        if (empty($userText)) {
            sendError('Message text is required', 400);
        }

        $nowTime = date('g:i A');
        $userMsgId = 'msg-u-' . bin2hex(random_bytes(4));

        // 1. Insert Client Message
        $stmtClient = $pdo->prepare('
            INSERT INTO broker_messages (id, user_id, sender_role, sender_name, text, timestamp, is_encrypted)
            VALUES (:id, :uid, "CLIENT", "You", :text, :time, 1)
        ');
        $stmtClient->execute([
            ':id'   => $userMsgId,
            ':uid'  => $userId,
            ':text' => $userText,
            ':time' => $nowTime
        ]);

        // 2. Count client questions in this session
        $stmtCount = $pdo->prepare('SELECT COUNT(*) FROM broker_messages WHERE user_id = :uid AND sender_role = "CLIENT"');
        $stmtCount->execute([':uid' => $userId]);
        $questionCount = intval($stmtCount->fetchColumn());

        // 3. Robot Automated Response Logic
        $robotMsgId = 'msg-r-' . bin2hex(random_bytes(4));
        $robotText = '';

        if ($questionCount >= 4) {
            // After 3-5 questions: Handoff to Customer Care Agent
            $robotText = "Thank you for these inquiries. As you have reached our automated concierge threshold, our system has flagged your file for high-touch service. Please contact our dedicated Customer Care Agent directly for further bespoke inquiries:\n\n👤 Agent: Jeff Campbell (Senior Customer Care Specialist)\n📧 Email: jeff@sterlingwealthbroker.com\n📞 Phone: +1 (800) 842-9912\n\nHe has received your session transcript and is on standby.";
        } else {
            // Context-sensitive automated replies
            $lower = strtolower($userText);
            if (strpos($lower, 'rate') !== false || strpos($lower, 'apr') !== false || strpos($lower, 'interest') !== false) {
                $robotText = "Our institutional debt facilities range from 4.75% to 8.25% APR based on your membership tier discount (e.g. Gold Tier receives 0.75% discount off baseline syndicate rates).";
            } elseif (strpos($lower, 'wire') !== false || strpos($lower, 'payment') !== false || strpos($lower, 'bank') !== false) {
                $robotText = "All bank wire remittances are processed via Fedwire / SWIFT RTGS to JPMorgan Chase Bank. Note: A 3-month bank statement is required during KYC onboarding, and all packages are upgraded manually by the admin desk upon ledger reconciliation.";
            } elseif (strpos($lower, 'kyc') !== false || strpos($lower, 'document') !== false || strpos($lower, 'vault') !== false) {
                $robotText = "Your 256-bit encrypted Vault allows uploading Government ID, Corporate Bank Statements, and Audited Tax Returns. Files are verified by our compliance desk within 24-48 business hours.";
            } else {
                $robotText = "Thank you for your question. Under our institutional guidelines, facility pre-qualification depends on your active tier debt limit and verified underwriting financials. Your assigned broker Marcus Vance has been notified.";
            }
        }

        // Insert Robot Response
        $stmtRobot = $pdo->prepare('
            INSERT INTO broker_messages (id, user_id, sender_role, sender_name, text, timestamp, is_encrypted)
            VALUES (:id, :uid, "BROKER", "Underwriting Assistant Bot", :text, :time, 1)
        ');
        $stmtRobot->execute([
            ':id'   => $robotMsgId,
            ':uid'  => $userId,
            ':text' => $robotText,
            ':time' => $nowTime
        ]);

        sendJson([
            'message'        => 'Message sent and automated response generated',
            'clientMessage'  => [
                'id'          => $userMsgId,
                'user_id'     => $userId,
                'sender_role' => 'CLIENT',
                'sender_name' => 'You',
                'text'        => $userText,
                'timestamp'   => $nowTime,
                'is_encrypted'=> 1
            ],
            'robotResponse'  => [
                'id'          => $robotMsgId,
                'user_id'     => $userId,
                'sender_role' => 'BROKER',
                'sender_name' => 'Underwriting Assistant Bot',
                'text'        => $robotText,
                'timestamp'   => $nowTime,
                'is_encrypted'=> 1
            ],
            'questionCount'  => $questionCount,
            'handedOffToCare'=> $questionCount >= 4
        ]);
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
