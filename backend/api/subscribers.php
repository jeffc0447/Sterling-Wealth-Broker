<?php
/**
 * Sterling Wealth Brokerage - Membership Subscribers & Tier Upgrade Management
 * Implements the requirement: "All membership tier package should be upgraded manually from the admin panel after payment is made."
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mailer.php';

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

    case 'request_tier':
        $userId = trim((string)($input['userId'] ?? ($_POST['userId'] ?? '')));
        $rawTierId = strtolower(trim((string)($input['tierId'] ?? ($_POST['tierId'] ?? ''))));
        $allowedTiers = ['silver', 'gold', 'platinum', 'diamond'];

        if (!$userId || !in_array($rawTierId, $allowedTiers, true)) {
            sendError('Valid userId and tierId are required', 400);
        }

        $stmtUser = $pdo->prepare('SELECT id, name, email, phone, company, membership_tier_id FROM users WHERE id = :uid LIMIT 1');
        $stmtUser->execute([':uid' => $userId]);
        $userRow = $stmtUser->fetch();
        if (!$userRow) {
            sendError('User account not found', 404);
        }

        $stmtTier = $pdo->prepare('SELECT id, name, price FROM membership_tiers WHERE id = :tid LIMIT 1');
        $stmtTier->execute([':tid' => $rawTierId]);
        $tierRow = $stmtTier->fetch();
        $tierNames = [
            'silver'   => 'Silver Access',
            'gold'     => 'Gold Executive',
            'platinum' => 'Platinum Prestige',
            'diamond'  => 'Diamond Syndicate',
        ];
        $tierPrices = [
            'silver'   => 495.00,
            'gold'     => 1450.00,
            'platinum' => 3850.00,
            'diamond'  => 8900.00,
        ];
        $reqTierName = $tierRow['name'] ?? ($tierNames[$rawTierId] ?? ucfirst($rawTierId));
        $reqAmount = isset($tierRow['price']) ? floatval($tierRow['price']) : ($tierPrices[$rawTierId] ?? 0.00);
        $currentTierId = !empty($userRow['membership_tier_id']) ? $userRow['membership_tier_id'] : null;

        $subId = 'sub-' . bin2hex(random_bytes(4));
        $reqId = 'REQ-' . rand(1000, 9999) . '-MEMB';
        $txRef = 'TIER-REQ-' . strtoupper(bin2hex(random_bytes(3)));

        $pdo->beginTransaction();
        try {
            if ($currentTierId === null) {
                $stmtStatus = $pdo->prepare('UPDATE users SET membership_status = "PENDING_REVIEW" WHERE id = :uid');
                $stmtStatus->execute([':uid' => $userId]);
            }

            $stmtInsertSub = $pdo->prepare('
                INSERT INTO membership_subscribers (
                    id, user_id, name, email, phone, company, request_id,
                    membership_tier_id, membership_tier_name, requested_tier_id, requested_tier_name,
                    payment_status, approval_status, proof_status, date_joined,
                    amount_paid, currency, payment_method, transaction_id,
                    assigned_care_agent, assigned_care_email, payment_receipt_note
                ) VALUES (
                    :id, :uid, :name, :email, :phone, :company, :req_id,
                    :cur_tier, :cur_tname, :req_tier, :req_tname,
                    "PENDING", "AWAITING_PAYMENT_VERIFICATION", "AWAITING_PROOF", :joined,
                    :amt, "USD", "WIRE_TRANSFER", :tx_id,
                    "Jeffery Dean", "jeffery@accountant.com",
                    "Membership tier package selected by client after sign-up. Pending manual Customer Care Support review in Admin Panel."
                )
            ');
            $stmtInsertSub->execute([
                ':id'        => $subId,
                ':uid'       => $userId,
                ':name'      => $userRow['name'],
                ':email'     => $userRow['email'],
                ':phone'     => $userRow['phone'] ?? '',
                ':company'   => $userRow['company'] ?? '',
                ':req_id'    => $reqId,
                ':cur_tier'  => $currentTierId,
                ':cur_tname' => $currentTierId ? ucfirst($currentTierId) : 'No Active Tier',
                ':req_tier'  => $rawTierId,
                ':req_tname' => $reqTierName,
                ':joined'    => date('Y-m-d'),
                ':amt'       => $reqAmount,
                ':tx_id'     => $txRef,
            ]);

            $pdo->commit();
            sendJson([
                'message'      => "Membership tier {$reqTierName} submitted for Customer Care Support review",
                'subscriberId' => $subId,
                'requestId'    => $reqId,
                'status'       => 'PENDING_REVIEW',
            ], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendError('Failed to submit tier selection: ' . $e->getMessage(), 500);
        }
        break;

    case 'approve_upgrade':
        $subscriberId = $input['subscriberId'] ?? ($_POST['subscriberId'] ?? null);
        $agentName = $input['agentName'] ?? ($_POST['agentName'] ?? 'Jeffery Dean (Customer Care Support)');
        $auditNote = $input['auditNote'] ?? ($_POST['auditNote'] ?? 'Membership package reviewed and approved by Customer Care Support.');

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
        if (empty($newTierId)) {
            sendError('No requested membership tier found on this record to approve', 400);
        }
        $newTierName = $sub['requested_tier_name'] ?: ($sub['membership_tier_name'] ?: ucfirst($newTierId));
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
                    requested_tier_id = NULL,
                    requested_tier_name = NULL,
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
                $stmtTx = $pdo->prepare('UPDATE transactions SET status = "COMPLETED" WHERE id = :tx_id OR invoice_number = :tx_id');
                $stmtTx->execute([':tx_id' => $sub['transaction_id']]);
            }

            // 4. Mark wire proof as VERIFIED if exists
            $stmtWire = $pdo->prepare('UPDATE wire_proofs SET status = "VERIFIED", audit_note = :note WHERE user_id = :uid AND status = "PENDING"');
            $stmtWire->execute([':note' => $auditNote, ':uid' => $userId]);

            $pdo->commit();

            if (!empty($sub['email'])) {
                EmailNotifier::dispatchEvent(
                    $pdo,
                    'TIER_UPGRADE_APPROVED',
                    $sub['email'],
                    $sub['name'] ?? 'Valued Member',
                    [
                        'tierName'  => $newTierName,
                        'requestId' => $sub['request_id'] ?? $subscriberId,
                        'agentName' => $agentName,
                    ],
                    $subscriberId
                );
            }

            sendJson([
                'message'      => "Membership successfully approved for $newTierName and activated",
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
        $agentName = $input['agentName'] ?? ($_POST['agentName'] ?? 'Jeffery Dean');
        $reason = $input['reason'] ?? ($_POST['reason'] ?? 'Receipt document unreadable or bank wire confirmation did not match ledger.');

        if (!$subscriberId) {
            sendError('subscriberId is required', 400);
        }

        $now = date('Y-m-d H:i:s');

        $stmt = $pdo->prepare('
            UPDATE membership_subscribers
            SET approval_status = "REJECTED",
                payment_status = "PAST_DUE",
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

        $stmtSubInfo = $pdo->prepare('SELECT email, name, request_id, requested_tier_name, membership_tier_name FROM membership_subscribers WHERE id = :id LIMIT 1');
        $stmtSubInfo->execute([':id' => $subscriberId]);
        $subInfo = $stmtSubInfo->fetch();
        if ($subInfo && !empty($subInfo['email'])) {
            EmailNotifier::dispatchEvent(
                $pdo,
                'TIER_UPGRADE_REJECTED',
                $subInfo['email'],
                $subInfo['name'] ?? 'Valued Member',
                [
                    'tierName'  => $subInfo['requested_tier_name'] ?: $subInfo['membership_tier_name'],
                    'requestId' => $subInfo['request_id'] ?: $subscriberId,
                    'reason'    => $reason,
                ],
                $subscriberId
            );
        }

        sendJson([
            'message'      => 'Subscriber tier request marked as rejected with compliance rationale',
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
                payment_status = "PENDING",
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
