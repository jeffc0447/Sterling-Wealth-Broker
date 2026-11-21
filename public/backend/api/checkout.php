<?php
/**
 * Sterling Wealth Brokerage - Checkout & Settlement API Endpoint
 * Handles Multi-Rail Checkout (Card, Wire Transfer, Crypto) and Logs to MySQL
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'process');
$input = getJsonInput();

switch ($action) {
    case 'process':
        $userId = $input['userId'] ?? ($_POST['userId'] ?? null);
        $userName = $input['userName'] ?? ($_POST['userName'] ?? 'Valued Client');
        $tierId = $input['tierId'] ?? ($_POST['tierId'] ?? 'gold');
        $tierName = $input['tierName'] ?? ($_POST['tierName'] ?? 'Gold Executive');
        $amount = floatval($input['amount'] ?? ($_POST['amount'] ?? 12500.00));
        $paymentMethod = $input['paymentMethod'] ?? ($_POST['paymentMethod'] ?? 'BANK_WIRE');
        $billingAddress = $input['billingAddress'] ?? ($_POST['billingAddress'] ?? []);
        $cardLast4 = $input['cardLast4'] ?? ($_POST['cardLast4'] ?? null);
        $cryptoDetails = $input['cryptoDetails'] ?? ($_POST['cryptoDetails'] ?? null);
        $wireProof = $input['wireProof'] ?? ($_POST['wireProof'] ?? null);

        if (!$userId || $amount <= 0) {
            sendError('Invalid checkout request payload', 400);
        }

        $txId = 'tx-' . bin2hex(random_bytes(6));
        $invoiceNumber = 'INV-SWB-' . date('Y') . '-' . rand(1000, 9999);
        $dateNow = date('Y-m-d H:i:s');
        $txHash = $input['txHash'] ?? ('SWB-SETTLE-' . bin2hex(random_bytes(4)));

        // Transactions are staged as PROCESSING / PENDING for manual admin verification per broker protocol
        $txStatus = 'PROCESSING';

        $stmtTx = $pdo->prepare('
            INSERT INTO transactions (
                id, invoice_number, user_id, user_name, tier_id, tier_name,
                amount, currency, payment_method, status, date, tx_hash,
                crypto_details_json, billing_address_json, card_last4
            ) VALUES (
                :id, :invoice, :uid, :uname, :tid, :tname,
                :amount, "USD", :method, :status, :date, :txhash,
                :crypto, :billing, :card
            )
        ');

        $stmtTx->execute([
            ':id'      => $txId,
            ':invoice' => $invoiceNumber,
            ':uid'     => $userId,
            ':uname'   => $userName,
            ':tid'     => $tierId,
            ':tname'   => $tierName,
            ':amount'  => $amount,
            ':method'  => $paymentMethod,
            ':status'  => $txStatus,
            ':date'    => $dateNow,
            ':txhash'  => $txHash,
            ':crypto'  => $cryptoDetails ? json_encode($cryptoDetails) : null,
            ':billing' => json_encode($billingAddress),
            ':card'    => $cardLast4
        ]);

        // If Bank Wire Proof is attached, save to wire_proofs table
        $wireId = null;
        if ($wireProof && is_array($wireProof)) {
            $wireId = 'wire-' . bin2hex(random_bytes(4));
            $stmtWire = $pdo->prepare('
                INSERT INTO wire_proofs (
                    id, transaction_id, user_id, wire_reference_number, remitter_name,
                    remitter_bank, receipt_file_name, receipt_file_size, submission_date,
                    customer_care_notified, notified_agent_email, status
                ) VALUES (
                    :id, :tx_id, :uid, :ref, :remitter,
                    :bank, :file_name, :file_size, :sub_date,
                    1, "jeff@sterlingwealthbroker.com", "PENDING"
                )
            ');

            $stmtWire->execute([
                ':id'        => $wireId,
                ':tx_id'     => $txId,
                ':uid'       => $userId,
                ':ref'       => $wireProof['wireReferenceNumber'] ?? ('REF-' . rand(10000, 99999)),
                ':remitter'  => $wireProof['remitterName'] ?? $userName,
                ':bank'      => $wireProof['remitterBank'] ?? 'Bank of America',
                ':file_name' => $wireProof['receiptFileName'] ?? 'Wire_Remittance_Advice.pdf',
                ':file_size' => $wireProof['receiptFileSize'] ?? '1.2 MB',
                ':sub_date'  => date('Y-m-d H:i:s')
            ]);
        }

        // Create or update Membership Subscriber entry staged for manual Admin approval
        $subId = 'sub-' . bin2hex(random_bytes(4));
        $reqId = 'REQ-' . rand(1000, 9999) . '-MEMB';

        $stmtSub = $pdo->prepare('
            INSERT INTO membership_subscribers (
                id, user_id, name, email, request_id, membership_tier_id,
                membership_tier_name, requested_tier_id, requested_tier_name,
                payment_status, approval_status, proof_status, date_joined,
                amount_paid, currency, payment_method, transaction_id,
                billing_address_json, card_last4, assigned_care_agent, assigned_care_email
            ) VALUES (
                :id, :uid, :name, :email, :req_id, :current_tier,
                :current_tname, :req_tier, :req_tname,
                "PENDING", "AWAITING_PAYMENT_VERIFICATION", :proof_status, :joined,
                :amt, "USD", :method, :tx_id,
                :billing, :card, "Jeff Campbell", "jeff@sterlingwealthbroker.com"
            )
        ');

        // Look up user email
        $stmtUser = $pdo->prepare('SELECT email, membership_tier_id FROM users WHERE id = :uid LIMIT 1');
        $stmtUser->execute([':uid' => $userId]);
        $userRow = $stmtUser->fetch();
        $userEmail = $userRow['email'] ?? 'client@sterlingwealthbroker.com';
        $currentTierId = $userRow['membership_tier_id'] ?? 'silver';

        $stmtSub->execute([
            ':id'           => $subId,
            ':uid'          => $userId,
            ':name'         => $userName,
            ':email'        => $userEmail,
            ':req_id'       => $reqId,
            ':current_tier' => $currentTierId,
            ':current_tname'=> ucfirst($currentTierId),
            ':req_tier'     => $tierId,
            ':req_tname'    => $tierName,
            ':proof_status' => $wireProof ? 'RECEIPT_ATTACHED' : 'AWAITING_PROOF',
            ':joined'       => date('Y-m-d'),
            ':amt'          => $amount,
            ':method'       => $paymentMethod,
            ':tx_id'        => $txId,
            ':billing'      => json_encode($billingAddress),
            ':card'         => $cardLast4
        ]);

        sendJson([
            'message'        => 'Payment request recorded and staged for manual underwriting review',
            'transactionId'  => $txId,
            'invoiceNumber'  => $invoiceNumber,
            'requestId'      => $reqId,
            'wireProofId'    => $wireId,
            'status'         => 'PENDING_VERIFICATION'
        ], 201);
        break;

    case 'transactions':
        $userId = $_GET['user_id'] ?? null;
        if ($userId) {
            $stmt = $pdo->prepare('SELECT * FROM transactions WHERE user_id = :uid ORDER BY created_at DESC');
            $stmt->execute([':uid' => $userId]);
        } else {
            $stmt = $pdo->query('SELECT * FROM transactions ORDER BY created_at DESC');
        }
        $transactions = $stmt->fetchAll();
        sendJson(['transactions' => $transactions]);
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
