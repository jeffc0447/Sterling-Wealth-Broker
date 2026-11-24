<?php
/**
 * Sterling Wealth Brokerage - Loan Applications & Instruments API
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mailer.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');
$input = getJsonInput();

switch ($action) {
    case 'instruments':
        $stmt = $pdo->query('SELECT * FROM financial_instruments ORDER BY min_amount ASC');
        $rows = $stmt->fetchAll();
        $instruments = array_map(function($r) {
            $r['eligibility'] = json_decode($r['eligibility_json'] ?? '[]', true);
            $r['documentsRequired'] = json_decode($r['documents_required_json'] ?? '[]', true);
            $r['partnerLenders'] = json_decode($r['partner_lenders_json'] ?? '[]', true);
            unset($r['eligibility_json'], $r['documents_required_json'], $r['partner_lenders_json']);
            return $r;
        }, $rows);

        sendJson(['instruments' => $instruments]);
        break;

    case 'tiers':
        $stmt = $pdo->query('SELECT * FROM membership_tiers ORDER BY price ASC');
        $rows = $stmt->fetchAll();
        $tiers = array_map(function($r) {
            $r['features'] = json_decode($r['features_json'] ?? '[]', true);
            $r['allowedInstruments'] = json_decode($r['allowed_instruments_json'] ?? '[]', true);
            $r['colorScheme'] = json_decode($r['color_scheme_json'] ?? '{}', true);
            unset($r['features_json'], $r['allowed_instruments_json'], $r['color_scheme_json']);
            return $r;
        }, $rows);

        sendJson(['tiers' => $tiers]);
        break;

    case 'list':
        $userId = $_GET['user_id'] ?? null;
        if ($userId) {
            $stmt = $pdo->prepare('SELECT * FROM loan_applications WHERE user_id = :uid ORDER BY created_at DESC');
            $stmt->execute([':uid' => $userId]);
        } else {
            // Admin list
            $stmt = $pdo->query('SELECT * FROM loan_applications ORDER BY created_at DESC');
        }
        $rows = $stmt->fetchAll();
        $applications = array_map(function($r) {
            $r['underwriterNotes'] = json_decode($r['underwriter_notes_json'] ?? '[]', true);
            unset($r['underwriter_notes_json']);
            return $r;
        }, $rows);

        sendJson(['applications' => $applications]);
        break;

    case 'apply':
        $userId = $input['userId'] ?? ($_POST['userId'] ?? null);
        $applicantName = $input['applicantName'] ?? ($_POST['applicantName'] ?? '');
        $applicantEmail = $input['applicantEmail'] ?? ($_POST['applicantEmail'] ?? '');
        $applicantPhone = $input['applicantPhone'] ?? ($_POST['applicantPhone'] ?? '');
        $instrumentId = $input['instrumentId'] ?? ($_POST['instrumentId'] ?? '');
        $instrumentTitle = $input['instrumentTitle'] ?? ($_POST['instrumentTitle'] ?? '');
        $requestedAmount = floatval($input['requestedAmount'] ?? ($_POST['requestedAmount'] ?? 0));
        $termMonths = intval($input['termMonths'] ?? ($_POST['termMonths'] ?? 36));
        $purpose = $input['purpose'] ?? ($_POST['purpose'] ?? '');
        $annualIncome = floatval($input['annualIncome'] ?? ($_POST['annualIncome'] ?? 0));
        $creditScore = $input['creditScore'] ?? ($_POST['creditScore'] ?? '750-800');
        $tierAtSubmission = $input['tierAtSubmission'] ?? ($_POST['tierAtSubmission'] ?? 'gold');

        if (!$userId || empty($instrumentTitle) || $requestedAmount <= 0) {
            sendError('Invalid loan application data provided', 400);
        }

        $appId = 'app-' . bin2hex(random_bytes(4));
        $appNumber = 'SWB-' . date('Y') . '-' . rand(10000, 99999);
        $now = date('Y-m-d H:i:s');

        $initialNotes = json_encode([
            "[" . date('Y-m-d') . "] Application received via Client Portal. Preliminary risk scan initiated."
        ]);

        $stmt = $pdo->prepare('
            INSERT INTO loan_applications (
                id, application_number, user_id, applicant_name, applicant_email, applicant_phone,
                instrument_id, instrument_title, requested_amount, term_months, purpose,
                annual_income, credit_score, status, underwriter_notes_json, assigned_broker,
                submitted_at, last_updated, tier_at_submission
            ) VALUES (
                :id, :num, :uid, :name, :email, :phone,
                :inst_id, :inst_title, :amount, :term, :purpose,
                :income, :score, "PENDING", :notes, "Marcus Vance",
                :submitted, :updated, :tier
            )
        ');

        $stmt->execute([
            ':id'         => $appId,
            ':num'        => $appNumber,
            ':uid'        => $userId,
            ':name'       => $applicantName,
            ':email'      => $applicantEmail,
            ':phone'      => $applicantPhone,
            ':inst_id'    => $instrumentId,
            ':inst_title' => $instrumentTitle,
            ':amount'     => $requestedAmount,
            ':term'       => $termMonths,
            ':purpose'    => $purpose,
            ':income'     => $annualIncome,
            ':score'      => $creditScore,
            ':notes'      => $initialNotes,
            ':submitted'  => $now,
            ':updated'    => $now,
            ':tier'       => $tierAtSubmission
        ]);

        if (!empty($applicantEmail)) {
            EmailNotifier::dispatchEvent(
                $pdo,
                'LOAN_APPLICATION_SUBMITTED',
                $applicantEmail,
                $applicantName ?: 'Valued Member',
                [
                    'applicationNumber' => $appNumber,
                    'instrumentTitle'   => $instrumentTitle,
                    'requestedAmount'   => '$' . number_format($requestedAmount, 2),
                ],
                $appId
            );
        }

        sendJson([
            'message'           => 'Loan application successfully submitted to underwriting queue',
            'applicationId'     => $appId,
            'applicationNumber' => $appNumber
        ], 201);
        break;

    case 'update_status':
        $appId = $input['applicationId'] ?? ($_POST['applicationId'] ?? null);
        $newStatus = $input['status'] ?? ($_POST['status'] ?? null);
        $note = $input['note'] ?? ($_POST['note'] ?? null);
        $partnerBank = $input['partnerBank'] ?? ($_POST['partnerBank'] ?? null);

        if (!$appId || !$newStatus) {
            sendError('applicationId and status are required', 400);
        }

        // Fetch current notes
        $stmtFetch = $pdo->prepare('SELECT underwriter_notes_json FROM loan_applications WHERE id = :id');
        $stmtFetch->execute([':id' => $appId]);
        $row = $stmtFetch->fetch();
        $notes = json_decode($row['underwriter_notes_json'] ?? '[]', true);

        if ($note) {
            $notes[] = "[" . date('Y-m-d H:i') . "] " . $note;
        }

        $stmtUpdate = $pdo->prepare('
            UPDATE loan_applications
            SET status = :status,
                partner_bank = COALESCE(:partner, partner_bank),
                underwriter_notes_json = :notes,
                last_updated = :updated
            WHERE id = :id
        ');

        $stmtUpdate->execute([
            ':status'  => $newStatus,
            ':partner' => $partnerBank,
            ':notes'   => json_encode($notes),
            ':updated' => date('Y-m-d H:i:s'),
            ':id'      => $appId
        ]);

        $stmtLoanInfo = $pdo->prepare('SELECT application_number, applicant_name, applicant_email, partner_bank FROM loan_applications WHERE id = :id LIMIT 1');
        $stmtLoanInfo->execute([':id' => $appId]);
        $loanInfo = $stmtLoanInfo->fetch();
        if ($loanInfo && !empty($loanInfo['applicant_email'])) {
            EmailNotifier::dispatchEvent(
                $pdo,
                'LOAN_STATUS_UPDATED',
                $loanInfo['applicant_email'],
                $loanInfo['applicant_name'] ?? 'Valued Member',
                [
                    'applicationNumber' => $loanInfo['application_number'],
                    'status'            => $newStatus,
                    'partnerBank'       => $partnerBank ?: ($loanInfo['partner_bank'] ?: 'Syndicate Lending Desk'),
                    'note'              => $note ?: 'Your application has progressed to the next underwriting stage.',
                ],
                $appId
            );
        }

        sendJson(['message' => "Application status updated to $newStatus"]);
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
