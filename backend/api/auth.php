<?php
/**
 * Sterling Wealth Brokerage - Authentication API Endpoint
 * Handles User Login, Registration, Session Validation
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mailer.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'login');
$input = getJsonInput();

switch ($action) {
    case 'login':
        $email = trim($input['email'] ?? ($_POST['email'] ?? ''));
        $password = $input['password'] ?? ($_POST['password'] ?? '');

        if (empty($email) || empty($password)) {
            sendError('Email and password are required', 400);
        }

        // Query user by email
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            // Check admins table
            $stmtAdmin = $pdo->prepare('SELECT * FROM admins WHERE email = :email LIMIT 1');
            $stmtAdmin->execute([':email' => $email]);
            $admin = $stmtAdmin->fetch();

            if ($admin && password_verify($password, $admin['password_hash'])) {
                unset($admin['password_hash']);
                $admin['permissions'] = json_decode($admin['permissions_json'] ?? '[]', true);
                unset($admin['permissions_json']);
                
                $token = createSignedToken([
                    'id'      => $admin['id'],
                    'email'   => $admin['email'],
                    'role'    => $admin['role'],
                    'isAdmin' => true,
                ]);
                setSessionCookie('swb_admin_session', $token);

                sendJson([
                    'message'  => 'Admin authentication successful',
                    'isAdmin'  => true,
                    'admin'    => $admin,
                    'token'    => $token
                ]);
            }

            sendError('Account not found or has been deleted. Please create a new membership account.', 401, ['deleted' => true]);
        }

        // Verify user password
        if (!password_verify($password, $user['password_hash'])) {
            sendError('Invalid email or password credentials', 401);
        }

        unset($user['password_hash']);
        $user['billingAddress'] = json_decode($user['billing_address_json'] ?? '{}', true);
        unset($user['billing_address_json']);

        // Check for pending upgrade
        $stmtSub = $pdo->prepare('SELECT * FROM membership_subscribers WHERE user_id = :uid AND payment_status = "PENDING" ORDER BY created_at DESC LIMIT 1');
        $stmtSub->execute([':uid' => $user['id']]);
        $pendingSub = $stmtSub->fetch();

        $token = createSignedToken([
            'id'      => $user['id'],
            'email'   => $user['email'],
            'isAdmin' => false,
        ]);
        setSessionCookie('swb_client_session', $token);

        sendJson([
            'message'        => 'Client authentication successful',
            'user'           => $user,
            'pendingUpgrade' => $pendingSub ?: null,
            'token'          => $token
        ]);
        break;

    case 'register':
        $name = trim($input['name'] ?? ($_POST['name'] ?? ''));
        $email = trim($input['email'] ?? ($_POST['email'] ?? ''));
        $rawPass = $input['password'] ?? ($_POST['password'] ?? '');
        $password = (is_string($rawPass) && $rawPass !== '') ? $rawPass : bin2hex(random_bytes(16));
        $phone = trim($input['phone'] ?? ($_POST['phone'] ?? ''));
        $company = trim($input['company'] ?? ($_POST['company'] ?? ''));
        $rawTier = $input['tier'] ?? ($_POST['tier'] ?? null);
        $allowedTiers = ['silver', 'gold', 'platinum', 'diamond'];
        $chosenTier = (is_string($rawTier) && in_array(strtolower(trim($rawTier)), $allowedTiers, true))
            ? strtolower(trim($rawTier))
            : null;

        if (empty($name) || empty($email)) {
            sendError('Name and email are required', 400);
        }

        // Check existing email
        $stmtCheck = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $stmtCheck->execute([':email' => $email]);
        if ($stmtCheck->fetch()) {
            sendError('An account with this email address already exists. Please log in.', 409);
        }

        $requestedUserId = trim((string)($input['userId'] ?? ($_POST['userId'] ?? '')));
        $userId = preg_match('/^usr-[a-zA-Z0-9_-]{3,40}$/', $requestedUserId)
            ? $requestedUserId
            : 'usr-' . bin2hex(random_bytes(6));
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $memberSince = date('Y-m-d');
        $renewalDate = date('Y-m-d', strtotime('+1 year'));
        $initialMembershipStatus = $chosenTier !== null ? 'PENDING_REVIEW' : 'UNASSIGNED';
        $billingAddressJson = isset($input['billingAddress']) && is_array($input['billingAddress'])
            ? json_encode($input['billingAddress'], JSON_UNESCAPED_UNICODE)
            : null;

        $stmtInsert = $pdo->prepare('
            INSERT INTO users (
                id, name, email, phone, company, password_hash, membership_tier_id,
                membership_status, member_since, renewal_date, kyc_status,
                assigned_broker, broker_direct_line, two_factor_enabled, total_active_capital, billing_address_json
            ) VALUES (
                :id, :name, :email, :phone, :company, :pass, NULL,
                :mstatus, :since, :renewal, "IN_REVIEW",
                "Marcus Vance", "+1 (800) 555-4921", 1, 0.00, :billing
            )
        ');

        $stmtInsert->execute([
            ':id'      => $userId,
            ':name'    => $name,
            ':email'   => $email,
            ':phone'   => $phone,
            ':company' => $company,
            ':pass'    => $passwordHash,
            ':mstatus' => $initialMembershipStatus,
            ':since'   => $memberSince,
            ':renewal' => $renewalDate,
            ':billing' => $billingAddressJson,
        ]);

        // Persist KYC Registration dossier if submitted from Registration KYC Wizard
        $kycReg = $input['kycRegistration'] ?? null;
        if (is_array($kycReg)) {
            $regId = trim((string)($kycReg['id'] ?? ('REG-' . date('Y') . '-' . rand(1000, 9999))));
            $loanReason = trim((string)($kycReg['loanReason'] ?? 'Institutional facility inquiry'));
            try {
                $stmtReg = $pdo->prepare('
                    INSERT INTO registration_applications (
                        id, user_id, full_name, email, phone, company, selected_tier,
                        desired_amount, loan_purpose, credit_score, submission_date, status, notes
                    ) VALUES (
                        :id, :uid, :fname, :email, :phone, :company, :tier,
                        0.00, :purpose, "N/A", :sdate, "PENDING_REVIEW", :notes
                    )
                    ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), selected_tier = VALUES(selected_tier)
                ');
                $stmtReg->execute([
                    ':id'      => $regId,
                    ':uid'     => $userId,
                    ':fname'   => $name,
                    ':email'   => $email,
                    ':phone'   => $phone,
                    ':company' => $company,
                    ':tier'    => $chosenTier,
                    ':purpose' => $loanReason,
                    ':sdate'   => date('Y-m-d H:i:s'),
                    ':notes'   => 'KYC dossier submitted during registration.',
                ]);
            } catch (Exception $e) {
                // Backward-compatible fallback if schema lacks user_id column on existing DB
                try {
                    $stmtRegLegacy = $pdo->prepare('
                        INSERT INTO registration_applications (
                            id, full_name, email, phone, company, selected_tier,
                            desired_amount, loan_purpose, credit_score, submission_date, status, notes
                        ) VALUES (
                            :id, :fname, :email, :phone, :company, :tier,
                            0.00, :purpose, "N/A", :sdate, "PENDING_REVIEW", :notes
                        )
                    ');
                    $stmtRegLegacy->execute([
                        ':id'      => $regId,
                        ':fname'   => $name,
                        ':email'   => $email,
                        ':phone'   => $phone,
                        ':company' => $company,
                        ':tier'    => $chosenTier,
                        ':purpose' => $loanReason,
                        ':sdate'   => date('Y-m-d H:i:s'),
                        ':notes'   => 'KYC dossier submitted during registration.',
                    ]);
                } catch (Exception $ignored) {}
            }

            if (!empty($kycReg['kycDocument']) && is_array($kycReg['kycDocument'])) {
                $doc = $kycReg['kycDocument'];
                $docId = 'doc-' . bin2hex(random_bytes(4));
                $stmtDoc = $pdo->prepare('
                    INSERT INTO vault_documents (
                        id, user_id, type, title, file_name, file_size, mime_type,
                        upload_date, status, encryption_hash
                    ) VALUES (
                        :id, :uid, "GOVERNMENT_ID", :title, :fname, :fsize, :mime,
                        :udate, "PENDING_REVIEW", :hash
                    )
                ');
                $stmtDoc->execute([
                    ':id'    => $docId,
                    ':uid'   => $userId,
                    ':title' => (string)($doc['documentType'] ?? 'GOVERNMENT_ID'),
                    ':fname' => (string)($doc['fileName'] ?? 'KYC_Document.pdf'),
                    ':fsize' => (string)($doc['fileSize'] ?? '1.0 MB'),
                    ':mime'  => (string)($doc['mimeType'] ?? 'application/pdf'),
                    ':udate' => date('Y-m-d'),
                    ':hash'  => (string)($doc['hash'] ?? ('0x' . hash('sha256', $docId . $userId))),
                ]);
            }
        }

        // If user explicitly chose a membership tier during registration, stage it for manual Customer Care Support approval
        $pendingUpgrade = null;
        $chosenTierLabel = 'No Tier Selected Yet (Choose After Sign-Up)';
        if ($chosenTier !== null) {
            $stmtTier = $pdo->prepare('SELECT id, name, price FROM membership_tiers WHERE id = :tid LIMIT 1');
            $stmtTier->execute([':tid' => $chosenTier]);
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
            $chosenTierLabel = $tierRow['name'] ?? ($tierNames[$chosenTier] ?? ucfirst($chosenTier));
            $tierPrice = isset($tierRow['price']) ? floatval($tierRow['price']) : ($tierPrices[$chosenTier] ?? 0.00);

            $subId = 'sub-' . bin2hex(random_bytes(4));
            $reqId = 'REQ-' . rand(1000, 9999) . '-MEMB';
            $txRef = 'REG-REQ-' . strtoupper(bin2hex(random_bytes(3)));

            $stmtStageSub = $pdo->prepare('
                INSERT INTO membership_subscribers (
                    id, user_id, name, email, phone, company, request_id,
                    membership_tier_id, membership_tier_name, requested_tier_id, requested_tier_name,
                    payment_status, approval_status, proof_status, date_joined,
                    amount_paid, currency, payment_method, transaction_id,
                    assigned_care_agent, assigned_care_email, payment_receipt_note
                ) VALUES (
                    :id, :uid, :name, :email, :phone, :company, :req_id,
                    NULL, "No Active Tier", :req_tier, :req_tname,
                    "PENDING", "AWAITING_PAYMENT_VERIFICATION", "AWAITING_PROOF", :joined,
                    :amt, "USD", "WIRE_TRANSFER", :tx_id,
                    "Jeffery Dean", "jeffery@accountant.com",
                    "User selected this membership package during registration. Pending manual review and approval by Customer Care Support."
                )
            ');
            $stmtStageSub->execute([
                ':id'        => $subId,
                ':uid'       => $userId,
                ':name'      => $name,
                ':email'     => $email,
                ':phone'     => $phone,
                ':company'   => $company,
                ':req_id'    => $reqId,
                ':req_tier'  => $chosenTier,
                ':req_tname' => $chosenTierLabel,
                ':joined'    => $memberSince,
                ':amt'       => $tierPrice,
                ':tx_id'     => $txRef,
            ]);

            $pendingUpgrade = [
                'id'                => $subId,
                'requestId'         => $reqId,
                'requestedTierId'   => $chosenTier,
                'requestedTierName' => $chosenTierLabel,
                'requestedAmount'   => $tierPrice,
                'status'            => 'PENDING_VERIFICATION',
            ];
        }

        // Fetch newly created user
        $stmtUser = $pdo->prepare('SELECT id, name, email, phone, company, membership_tier_id, membership_status, member_since, renewal_date, kyc_status, assigned_broker, broker_direct_line FROM users WHERE id = :id');
        $stmtUser->execute([':id' => $userId]);
        $newUser = $stmtUser->fetch();

        $token = createSignedToken([
            'id'      => $userId,
            'email'   => $email,
            'isAdmin' => false,
        ]);
        setSessionCookie('swb_client_session', $token);

        // Automated Welcome & Registration Alert Email
        EmailNotifier::dispatchEvent(
            $pdo,
            'WELCOME_REGISTRATION',
            $email,
            $name,
            [
                'registrationId' => $userId,
                'tierName'       => $chosenTier !== null
                    ? "{$chosenTierLabel} (Pending Customer Care Review)"
                    : 'No Tier Selected Yet (Choose After Sign-Up)',
            ],
            $userId
        );

        sendJson([
            'message'        => 'Registration successful',
            'user'           => $newUser,
            'pendingUpgrade' => $pendingUpgrade,
            'token'          => $token
        ], 201);
        break;

    case 'me':
        $token = getBearerToken() ?? ($_COOKIE['swb_client_session'] ?? null);
        if (!$token) {
            sendError('Unauthorized: missing token', 401);
        }

        $decoded = verifySignedToken($token);
        if (!$decoded || !isset($decoded['id'])) {
            clearSessionCookie('swb_client_session');
            sendError('Invalid or expired token', 401);
        }

        $stmt = $pdo->prepare('SELECT id, name, email, phone, company, membership_tier_id, membership_status, member_since, renewal_date, kyc_status, assigned_broker, broker_direct_line, two_factor_enabled, total_active_capital, billing_address_json FROM users WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $decoded['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            clearSessionCookie('swb_client_session');
            sendError('User account not found or has been deleted', 404, ['deleted' => true, 'exists' => false]);
        }

        $user['billingAddress'] = json_decode($user['billing_address_json'] ?? '{}', true);
        unset($user['billing_address_json']);

        sendJson([
            'exists'  => true,
            'deleted' => false,
            'user'    => $user
        ]);
        break;

    case 'verify_session':
        $token = getBearerToken() ?? ($_COOKIE['swb_client_session'] ?? null);
        $decoded = $token ? verifySignedToken($token) : null;
        $userId = trim((string)($decoded['id'] ?? ($input['userId'] ?? ($_GET['userId'] ?? ''))));
        $email = trim((string)($decoded['email'] ?? ($input['email'] ?? ($_GET['email'] ?? ''))));

        if ($userId === '' && $email === '') {
            sendJson(['exists' => false, 'deleted' => true]);
        }

        $found = false;
        if ($userId !== '') {
            $stmt = $pdo->prepare('SELECT id FROM users WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $userId]);
            $found = (bool)$stmt->fetch();
        }
        if (!$found && $email !== '') {
            $stmtEmail = $pdo->prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1');
            $stmtEmail->execute([':email' => $email]);
            $found = (bool)$stmtEmail->fetch();
        }

        if (!$found) {
            clearSessionCookie('swb_client_session');
        }

        sendJson([
            'exists'  => $found,
            'deleted' => !$found,
        ]);
        break;

    case 'update_membership_dates':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendError('Method not allowed. Use POST.', 405);
        }
        $token = getBearerToken();
        if (!$token) {
            $cookieToken = $_COOKIE['swb_client_session'] ?? null;
            if ($cookieToken && isValidCsrfContext()) {
                $token = $cookieToken;
            }
        }
        if (!$token) {
            sendError('Unauthorized: missing session token.', 401);
        }
        $decoded = verifySignedToken($token);
        if (!$decoded || empty($decoded['id']) || !empty($decoded['isAdmin'])) {
            sendError('Unauthorized: invalid client session.', 401);
        }

        $clientId = (string)$decoded['id'];
        $renewalDate = trim((string)($input['renewalDate'] ?? ''));
        $termStart = trim((string)($input['termStart'] ?? ''));

        if ($renewalDate === '' || strlen($renewalDate) > 50) {
            sendError('Valid renewal date is required.', 400);
        }

        $stmtUpdateUser = $pdo->prepare('
            UPDATE users
            SET renewal_date = :rdate,
                member_since = COALESCE(NULLIF(:mstart, ""), member_since)
            WHERE id = :uid
        ');
        $stmtUpdateUser->execute([
            ':rdate'  => $renewalDate,
            ':mstart' => $termStart,
            ':uid'    => $clientId,
        ]);

        if ($stmtUpdateUser->rowCount() === 0) {
            $stmtExists = $pdo->prepare('SELECT id FROM users WHERE id = :uid LIMIT 1');
            $stmtExists->execute([':uid' => $clientId]);
            if (!$stmtExists->fetch()) {
                clearSessionCookie('swb_client_session');
                sendError('Account not found or deleted.', 404, ['deleted' => true]);
            }
        }

        $stmtUpdateSub = $pdo->prepare('
            UPDATE membership_subscribers
            SET next_billing_date = :nbd,
                last_renewal_date = COALESCE(NULLIF(:lrd, ""), last_renewal_date)
            WHERE user_id = :uid
        ');
        $stmtUpdateSub->execute([
            ':nbd' => $renewalDate,
            ':lrd' => $termStart,
            ':uid' => $clientId,
        ]);

        sendJson([
            'message'     => 'Membership dates updated successfully.',
            'renewalDate' => $renewalDate,
            'termStart'   => $termStart,
        ]);
        break;

    case 'logout':
        clearSessionCookie('swb_client_session');
        clearSessionCookie('swb_admin_session');
        sendJson(['message' => 'Session terminated']);
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
