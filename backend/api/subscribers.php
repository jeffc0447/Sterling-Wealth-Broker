<?php
/**
 * Sterling Wealth Brokerage - Membership Subscribers & Tier Upgrade Management
 * Implements the requirement: "All membership tier package should be upgraded manually from the admin panel after payment is made."
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');
$input = getJsonInput();

switch ($action) {
    case 'list':
        $filter = $_GET['filter'] ?? 'all';
        if ($filter === 'pending') {
            $stmt = $pdo->query('SELECT * FROM membership_subscribers WHERE payment_status = "PENDING" ORDER BY created_at DESC');
        } elseif ($filter === 'active') {
            $stmt = $pdo->query('SELECT * FROM membership_subscribers WHERE payment_status = "ACTIVE" ORDER BY created_at DESC');
        } else {
            $stmt = $pdo->query('SELECT * FROM membership_subscribers ORDER BY created_at DESC');
        }
        $subscribers = $stmt->fetchAll();
        sendJson(['subscribers' => $subscribers]);
        break;

    case 'approve_upgrade':
        $subscriberId = $input['subscriberId'] ?? ($_POST['subscriberId'] ?? null);
        $agentName = $input['agentName'] ?? ($_POST['agentName'] ?? 'Eleanor Sterling (Managing Principal)');
        $auditNote = $input['auditNote'] ?? ($_POST['auditNote'] ?? 'Bank funds cleared and reconciled against treasury ledger.');

        if (!$subscriberId) {
            sendError('subscriberId is required', 400);
        }

        // Fetch subscriber record
        $stmtSub = $pdo->prepare('SELECT * FROM membership_subscribers WHERE id = :id LIMIT 1');
        $stmtSub->execute([':id' => $subscriberId]);
        $sub = $stmtSub->fetch();

        if (!$sub) {
            sendError('Subscriber request not found', 404);
        }

        $userId = $sub['user_id'];
        $newTierId = $sub['requested_tier_id'] ?: $sub['membership_tier_id'];
        $newTierName = $sub['requested_tier_name'] ?: $sub['membership_tier_name'];
        $now = date('Y-m-d H:i:s');

        // Begin transaction
        $pdo->beginTransaction();

        try {
            // 1. Upgrade user account in users table
            $stmtUser = $pdo->prepare('
                UPDATE users
                SET membership_tier_id = :tier,
                    membership_status = "ACTIVE",
                    renewal_date = :renewal
                WHERE id = :uid
            ');
            $stmtUser->execute([
                ':tier'    => $newTierId,
                ':renewal' => date('Y-m-d', strtotime('+1 year')),
                ':uid'     => $userId
            ]);

            // 2. Update subscriber record
            $stmtUpdateSub = $pdo->prepare('
                UPDATE membership_subscribers
                SET payment_status = "ACTIVE",
                    approval_status = "APPROVED",
                    membership_tier_id = :tier,
                    membership_tier_name = :tname,
                    receipt_verified = 1,
                    verified_by_agent = :agent,
                    verified_at = :now,
                    payment_receipt_note = :note
                WHERE id = :id
            ');
            $stmtUpdateSub->execute([
                ':tier'  => $newTierId,
                ':tname' => $newTierName,
                ':agent' => $agentName,
                ':now'   => $now,
                ':note'  => $auditNote,
                ':id'    => $subscriberId
            ]);

            // 3. Mark corresponding transaction as COMPLETED
            if (!empty($sub['transaction_id'])) {
                $stmtTx = $pdo->prepare('UPDATE transactions SET status = "COMPLETED" WHERE id = :tx_id');
                $stmtTx->execute([':tx_id' => $sub['transaction_id']]);
            }

            // 4. Mark wire proof as VERIFIED if exists
            $stmtWire = $pdo->prepare('UPDATE wire_proofs SET status = "VERIFIED", audit_note = :note WHERE user_id = :uid AND status = "PENDING"');
            $stmtWire->execute([':note' => $auditNote, ':uid' => $userId]);

            $pdo->commit();

            sendJson([
                'message'      => "Membership successfully upgraded to $newTierName and activated",
                'subscriberId' => $subscriberId,
                'newTierId'    => $newTierId,
                'status'       => 'ACTIVE'
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendError('Failed to process upgrade approval: ' . $e->getMessage(), 500);
        }
        break;

    case 'reject_upgrade':
        $subscriberId = $input['subscriberId'] ?? ($_POST['subscriberId'] ?? null);
        $agentName = $input['agentName'] ?? ($_POST['agentName'] ?? 'Jeff Campbell');
        $reason = $input['reason'] ?? ($_POST['reason'] ?? 'Receipt document unreadable or bank wire confirmation did not match ledger.');

        if (!$subscriberId) {
            sendError('subscriberId is required', 400);
        }

        $now = date('Y-m-d H:i:s');

        $stmt = $pdo->prepare('
            UPDATE membership_subscribers
            SET approval_status = "REJECTED",
                verified_by_agent = :agent,
                verified_at = :now,
                rejection_reason = :reason
            WHERE id = :id
        ');

        $stmt->execute([
            ':agent'  => $agentName,
            ':now'    => $now,
            ':reason' => $reason,
            ':id'     => $subscriberId
        ]);

        sendJson([
            'message'      => 'Subscriber upgrade request marked as rejected with compliance rationale',
            'subscriberId' => $subscriberId
        ]);
        break;

    case 'resubmit_proof':
        $subscriberId = $input['subscriberId'] ?? ($_POST['subscriberId'] ?? null);
        $fileName = $input['fileName'] ?? ($_POST['fileName'] ?? 'Updated_Wire_Receipt.pdf');
        $note = $input['note'] ?? ($_POST['note'] ?? 'Client re-submitted official banking receipt copy.');

        if (!$subscriberId) {
            sendError('subscriberId is required', 400);
        }

        $stmt = $pdo->prepare('
            UPDATE membership_subscribers
            SET approval_status = "AWAITING_PAYMENT_VERIFICATION",
                proof_status = "RECEIPT_ATTACHED",
                proof_attachment_name = :fname,
                payment_receipt_note = :note
            WHERE id = :id
        ');

        $stmt->execute([
            ':fname' => $fileName,
            ':note'  => $note,
            ':id'    => $subscriberId
        ]);

        sendJson(['message' => 'Updated payment receipt received and queued for admin audit']);
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
