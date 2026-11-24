<?php
/**
 * Sterling Wealth Brokerage - Automated Email Notification Engine & SMTP Mailer
 *
 * Supports:
 * 1. Native PHP SMTP client (SSL/465, STARTTLS/587, PLAIN/25) with zero external packages
 * 2. cPanel PHP mail() fallback
 * 3. Branded HTML email templates for every platform lifecycle event
 * 4. Automatic MySQL audit logging into `email_notifications`
 */

require_once __DIR__ . '/env.php';

class EmailNotifier {
    /**
     * Strip CR/LF characters to prevent email header injection.
     */
    public static function sanitizeHeaderValue(string $value): string {
        return trim(str_replace(["\r", "\n", "\0"], ' ', $value));
    }

    /**
     * Load effective email settings by merging .env defaults with MySQL system_settings overrides.
     */
    public static function getConfig(?PDO $pdo = null): array {
        $siteName = (string)envValue('MAIL_FROM_NAME', 'Sterling Wealth Broker');
        $siteDomain = (string)envValue('SITE_DOMAIN', 'investproasset.com');
        $siteUrl = (string)envValue('SITE_URL', 'https://investproasset.com');

        $config = [
            'enabled'         => true,
            'driver'          => strtolower((string)envValue('MAIL_DRIVER', 'mail')), // 'smtp' or 'mail'
            'fromEmail'       => (string)envValue('MAIL_FROM_EMAIL', 'noreply@' . $siteDomain),
            'fromName'        => $siteName,
            'replyToEmail'    => (string)envValue('CONTACT_RECIPIENT_EMAIL', 'support-broker@consultant.com'),
            'adminAlertEmail' => (string)envValue('ADMIN_ALERT_EMAIL', (string)envValue('CONTACT_RECIPIENT_EMAIL', 'support-broker@consultant.com')),
            'siteDomain'      => $siteDomain,
            'siteUrl'         => $siteUrl,
            'smtpHost'        => (string)envValue('SMTP_HOST', ''),
            'smtpPort'        => (int)envValue('SMTP_PORT', 465),
            'smtpEncryption'  => strtolower((string)envValue('SMTP_ENCRYPTION', 'ssl')), // 'ssl', 'tls', 'none'
            'smtpUsername'    => (string)envValue('SMTP_USER', ''),
            'smtpPassword'    => (string)envValue('SMTP_PASS', ''),
            'triggers'        => [
                'EMAIL_OTP_VERIFICATION'     => true,
                'WELCOME_REGISTRATION'       => true,
                'KYC_APPROVED'               => true,
                'KYC_REJECTED'               => true,
                'TIER_PAYMENT_SUBMITTED'     => true,
                'TIER_UPGRADE_APPROVED'      => true,
                'TIER_UPGRADE_REJECTED'      => true,
                'LOAN_APPLICATION_SUBMITTED' => true,
                'LOAN_STATUS_UPDATED'        => true,
                'CONTACT_INQUIRY'            => true,
            ],
        ];

        if ($pdo !== null) {
            try {
                $stmt = $pdo->prepare('SELECT setting_value FROM system_settings WHERE setting_key = "email_settings" LIMIT 1');
                $stmt->execute();
                $row = $stmt->fetch();
                if ($row && !empty($row['setting_value'])) {
                    $saved = json_decode($row['setting_value'], true);
                    if (is_array($saved)) {
                        foreach (['enabled', 'driver', 'fromEmail', 'fromName', 'replyToEmail', 'adminAlertEmail', 'smtpHost', 'smtpEncryption', 'smtpUsername'] as $key) {
                            if (isset($saved[$key]) && $saved[$key] !== '') {
                                $config[$key] = $saved[$key];
                            }
                        }
                        if (isset($saved['smtpPort']) && (int)$saved['smtpPort'] > 0) {
                            $config['smtpPort'] = (int)$saved['smtpPort'];
                        }
                        if (!empty($saved['smtpPassword']) && $saved['smtpPassword'] !== '••••••••') {
                            $config['smtpPassword'] = (string)$saved['smtpPassword'];
                        }
                        if (!empty($saved['triggers']) && is_array($saved['triggers'])) {
                            $config['triggers'] = array_merge($config['triggers'], $saved['triggers']);
                        }
                    }
                }
            } catch (Throwable $e) {
                // Ignore if table or row not yet initialized
            }
        }

        return $config;
    }

    /**
     * Render branded HTML & plain-text email templates for platform events.
     */
    public static function buildTemplate(string $eventType, array $vars, array $config): array {
        $brandName = htmlspecialchars((string)($vars['brandName'] ?? $config['fromName'] ?? 'Sterling Wealth Broker'), ENT_QUOTES, 'UTF-8');
        $siteUrl = htmlspecialchars((string)($config['siteUrl'] ?? 'https://investproasset.com'), ENT_QUOTES, 'UTF-8');
        $recipientName = htmlspecialchars((string)($vars['name'] ?? 'Valued Member'), ENT_QUOTES, 'UTF-8');
        $supportEmail = htmlspecialchars((string)($config['replyToEmail'] ?? 'support-broker@consultant.com'), ENT_QUOTES, 'UTF-8');

        $subject = 'Notification from ' . ($config['fromName'] ?? 'Sterling Wealth Broker');
        $heading = 'Institutional Notification';
        $badgeText = 'AUTOMATED NOTICE';
        $accentColor = '#10b981';
        $bodyContent = '';
        $textSummary = '';

        switch ($eventType) {
            case 'EMAIL_OTP_VERIFICATION':
                $otpCode = htmlspecialchars((string)($vars['otpCode'] ?? '000000'), ENT_QUOTES, 'UTF-8');
                $tierName = htmlspecialchars((string)($vars['tierName'] ?? 'Gold Executive'), ENT_QUOTES, 'UTF-8');
                $subject = "{$otpCode} is your verification code — {$config['fromName']}";
                $heading = 'Verify Your Email Address';
                $badgeText = 'SECURITY VERIFICATION';
                $bodyContent = <<<HTML
                  <p>Hello {$recipientName},</p>
                  <p>Thank you for initiating your institutional membership registration (<strong>{$tierName}</strong>). Enter the 6-digit verification code below to verify your email and submit your KYC dossier:</p>
                  <div style="margin: 22px 0; padding: 18px; background: #0f172a; border: 1px solid #10b981; border-radius: 10px; text-align: center;">
                    <span style="font-family: monospace; font-size: 30px; letter-spacing: 8px; font-weight: bold; color: #34d399;">{$otpCode}</span>
                  </div>
                  <p style="font-size: 12px; color: #64748b;">This verification code expires in 15 minutes. If you did not request this registration, please disregard this notice.</p>
                HTML;
                $textSummary = "Hello {$recipientName}, your 6-digit verification code is {$otpCode}.";
                break;

            case 'WELCOME_REGISTRATION':
                $regId = htmlspecialchars((string)($vars['registrationId'] ?? 'REG-PENDING'), ENT_QUOTES, 'UTF-8');
                $tierName = htmlspecialchars((string)($vars['tierName'] ?? 'Gold Executive'), ENT_QUOTES, 'UTF-8');
                $subject = "Welcome to {$config['fromName']} — Application {$regId} Received";
                $heading = 'Membership Registration Received';
                $badgeText = 'ONBOARDING DESK';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>We have received your membership enrollment for <strong>{$tierName}</strong> (Reference: <code>{$regId}</code>).</p>
                  <p>Our Compliance &amp; AML Desk is reviewing your uploaded KYC credentials and will notify you by email as soon as your profile is cleared.</p>
                  <div style="margin: 18px 0; padding: 14px; background: #f1f5f9; border-left: 4px solid #10b981; border-radius: 6px; font-size: 13px;">
                    <strong>Reference ID:</strong> {$regId}<br/>
                    <strong>Selected Tier:</strong> {$tierName}<br/>
                    <strong>Current Status:</strong> Under Compliance Review
                  </div>
                HTML;
                $textSummary = "Welcome {$recipientName}! Application {$regId} for {$tierName} has been received and queued for KYC review.";
                break;

            case 'KYC_APPROVED':
                $regId = htmlspecialchars((string)($vars['registrationId'] ?? 'VERIFIED'), ENT_QUOTES, 'UTF-8');
                $tierName = htmlspecialchars((string)($vars['tierName'] ?? 'Gold Executive'), ENT_QUOTES, 'UTF-8');
                $reviewer = htmlspecialchars((string)($vars['reviewedBy'] ?? 'Compliance Desk'), ENT_QUOTES, 'UTF-8');
                $subject = "KYC & Account Approved — Welcome to {$config['fromName']}";
                $heading = 'Identity & Account Approved';
                $badgeText = 'KYC VERIFIED';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>Congratulations! Your KYC identity dossier (<strong>{$regId}</strong>) has been verified and approved by <strong>{$reviewer}</strong>.</p>
                  <p>Your <strong>{$tierName}</strong> portal access is now active. You may sign in at <a href="{$siteUrl}">{$siteUrl}</a> to access your encrypted document vault and submit credit facility requests.</p>
                HTML;
                $textSummary = "Congratulations {$recipientName}, your KYC ({$regId}) has been approved for {$tierName}.";
                break;

            case 'KYC_REJECTED':
                $regId = htmlspecialchars((string)($vars['registrationId'] ?? 'REG'), ENT_QUOTES, 'UTF-8');
                $reason = htmlspecialchars((string)($vars['reason'] ?? 'Submitted identification requires clearer high-resolution documentation.'), ENT_QUOTES, 'UTF-8');
                $subject = "Action Required: KYC Re-submission Needed ({$regId})";
                $heading = 'KYC Documentation Action Required';
                $badgeText = 'COMPLIANCE NOTICE';
                $accentColor = '#f43f5e';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>Our Compliance Officer reviewed your registration file (<strong>{$regId}</strong>) and requires updated KYC documentation before activation:</p>
                  <div style="margin: 18px 0; padding: 14px; background: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 6px; color: #881337; font-size: 13px;">
                    <strong>Compliance Note:</strong><br/>{$reason}
                  </div>
                  <p>Please reply to <a href="mailto:{$supportEmail}">{$supportEmail}</a> or sign in to re-upload a clear verification copy.</p>
                HTML;
                $textSummary = "KYC action required for {$regId}: {$reason}";
                break;

            case 'TIER_PAYMENT_SUBMITTED':
                $reqId = htmlspecialchars((string)($vars['requestId'] ?? 'REQ-PENDING'), ENT_QUOTES, 'UTF-8');
                $tierName = htmlspecialchars((string)($vars['tierName'] ?? 'Gold Executive'), ENT_QUOTES, 'UTF-8');
                $amount = htmlspecialchars((string)($vars['amount'] ?? '$0.00'), ENT_QUOTES, 'UTF-8');
                $method = htmlspecialchars((string)($vars['paymentMethod'] ?? 'BANK_WIRE'), ENT_QUOTES, 'UTF-8');
                $careAgent = htmlspecialchars((string)($vars['careAgent'] ?? 'Jeff Campbell'), ENT_QUOTES, 'UTF-8');
                $careEmail = htmlspecialchars((string)($vars['careEmail'] ?? 'jeff@sterlingwealthbroker.com'), ENT_QUOTES, 'UTF-8');
                $subject = "Payment Receipt Logged [{$reqId}] — {$tierName}";
                $heading = 'Membership Settlement Pending Verification';
                $badgeText = 'ESCROW VERIFICATION';
                $accentColor = '#f59e0b';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>We have logged your settlement submission for <strong>{$tierName}</strong>. Per institutional treasury rules, membership tiers are manually activated after funds clear.</p>
                  <div style="margin: 18px 0; padding: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;">
                    <strong>Request ID:</strong> {$reqId}<br/>
                    <strong>Requested Package:</strong> {$tierName}<br/>
                    <strong>Amount:</strong> {$amount}<br/>
                    <strong>Method:</strong> {$method}<br/>
                    <strong>Assigned Care Agent:</strong> {$careAgent} (<a href="mailto:{$careEmail}">{$careEmail}</a>)
                  </div>
                  <p>You will receive an automated confirmation email immediately once our desk activates your tier privileges.</p>
                HTML;
                $textSummary = "Payment logged for {$tierName} ({$amount}) under request {$reqId}. Assigned agent: {$careAgent}.";
                break;

            case 'TIER_UPGRADE_APPROVED':
                $tierName = htmlspecialchars((string)($vars['tierName'] ?? 'Gold Executive'), ENT_QUOTES, 'UTF-8');
                $reqId = htmlspecialchars((string)($vars['requestId'] ?? 'ACTIVE'), ENT_QUOTES, 'UTF-8');
                $agent = htmlspecialchars((string)($vars['agentName'] ?? 'Treasury & Underwriting Desk'), ENT_QUOTES, 'UTF-8');
                $subject = "Membership Activated: {$tierName} [{$reqId}]";
                $heading = 'Membership Tier Activated';
                $badgeText = 'TIER ACTIVE';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>Your settlement (<strong>{$reqId}</strong>) has been verified by <strong>{$agent}</strong> and your account has been upgraded to <strong>{$tierName}</strong>.</p>
                  <p>Your expanded borrowing limit, priority underwriting SLA, and wholesale APR discounts are now unlocked inside your Client Portal.</p>
                  <div style="margin: 20px 0;">
                    <a href="{$siteUrl}/portal" style="display: inline-block; padding: 12px 22px; background: #10b981; color: #020617; font-weight: bold; text-decoration: none; border-radius: 8px;">Open Client Portal</a>
                  </div>
                HTML;
                $textSummary = "Membership upgraded and activated to {$tierName} ({$reqId}).";
                break;

            case 'TIER_UPGRADE_REJECTED':
                $tierName = htmlspecialchars((string)($vars['tierName'] ?? 'Requested Tier'), ENT_QUOTES, 'UTF-8');
                $reqId = htmlspecialchars((string)($vars['requestId'] ?? 'REQ'), ENT_QUOTES, 'UTF-8');
                $reason = htmlspecialchars((string)($vars['reason'] ?? 'Unable to reconcile remittance proof against escrow ledger.'), ENT_QUOTES, 'UTF-8');
                $subject = "Payment Verification Issue [{$reqId}] — Action Required";
                $heading = 'Settlement Proof Requires Attention';
                $badgeText = 'VERIFICATION DECLINED';
                $accentColor = '#f43f5e';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>Our treasury desk could not verify your settlement proof for <strong>{$tierName}</strong> (Request: <code>{$reqId}</code>).</p>
                  <div style="margin: 18px 0; padding: 14px; background: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 6px; color: #881337; font-size: 13px;">
                    <strong>Reason:</strong><br/>{$reason}
                  </div>
                  <p>Please sign in to your Client Portal to upload an updated receipt or contact <a href="mailto:{$supportEmail}">{$supportEmail}</a>.</p>
                HTML;
                $textSummary = "Settlement proof rejected for {$reqId}: {$reason}";
                break;

            case 'LOAN_APPLICATION_SUBMITTED':
                $appNum = htmlspecialchars((string)($vars['applicationNumber'] ?? 'SWB-NEW'), ENT_QUOTES, 'UTF-8');
                $instrument = htmlspecialchars((string)($vars['instrumentTitle'] ?? 'Credit Facility'), ENT_QUOTES, 'UTF-8');
                $amount = htmlspecialchars((string)($vars['requestedAmount'] ?? '$0'), ENT_QUOTES, 'UTF-8');
                $subject = "Loan Application Received [{$appNum}] — {$instrument}";
                $heading = 'Credit Facility Application Logged';
                $badgeText = 'UNDERWRITING QUEUE';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>Your credit facility application <strong>{$appNum}</strong> has been transmitted to our underwriting syndicate desk.</p>
                  <div style="margin: 18px 0; padding: 14px; background: #f1f5f9; border-left: 4px solid #10b981; border-radius: 6px; font-size: 13px;">
                    <strong>Application Reference:</strong> {$appNum}<br/>
                    <strong>Instrument:</strong> {$instrument}<br/>
                    <strong>Requested Facility:</strong> {$amount}<br/>
                    <strong>Stage:</strong> Preliminary Underwriting Review
                  </div>
                HTML;
                $textSummary = "Loan application {$appNum} ({$instrument} for {$amount}) received by underwriting.";
                break;

            case 'LOAN_STATUS_UPDATED':
                $appNum = htmlspecialchars((string)($vars['applicationNumber'] ?? 'SWB'), ENT_QUOTES, 'UTF-8');
                $status = htmlspecialchars((string)($vars['status'] ?? 'UNDER_REVIEW'), ENT_QUOTES, 'UTF-8');
                $partner = htmlspecialchars((string)($vars['partnerBank'] ?? 'Syndicate Lending Desk'), ENT_QUOTES, 'UTF-8');
                $note = htmlspecialchars((string)($vars['note'] ?? 'Your application has progressed to the next underwriting milestone.'), ENT_QUOTES, 'UTF-8');
                $subject = "Loan Update [{$appNum}]: Status Changed to {$status}";
                $heading = 'Loan Application Status Update';
                $badgeText = 'PIPELINE UPDATE';
                $accentColor = ($status === 'REJECTED') ? '#f43f5e' : '#10b981';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>There is an update on your loan application <strong>{$appNum}</strong>:</p>
                  <div style="margin: 18px 0; padding: 14px; background: #f8fafc; border-left: 4px solid {$accentColor}; border-radius: 6px; font-size: 13px;">
                    <strong>New Status:</strong> {$status}<br/>
                    <strong>Desk / Partner Institution:</strong> {$partner}<br/>
                    <strong>Underwriter Note:</strong> {$note}
                  </div>
                HTML;
                $textSummary = "Loan {$appNum} updated to {$status} ({$partner}). {$note}";
                break;

            case 'CONTACT_INQUIRY':
                $inqNum = htmlspecialchars((string)($vars['inquiryNumber'] ?? 'INQ-NEW'), ENT_QUOTES, 'UTF-8');
                $product = htmlspecialchars((string)($vars['productType'] ?? 'General Underwriting'), ENT_QUOTES, 'UTF-8');
                $capital = htmlspecialchars((string)($vars['capitalNeeded'] ?? 'Not Specified'), ENT_QUOTES, 'UTF-8');
                $subject = "[{$inqNum}] Inquiry Acknowledgement — {$config['fromName']}";
                $heading = 'We Received Your Syndicate Inquiry';
                $badgeText = 'INQUIRY LOGGED';
                $bodyContent = <<<HTML
                  <p>Dear {$recipientName},</p>
                  <p>Thank you for contacting {$brandName}. Your inquiry (<strong>{$inqNum}</strong>) has been routed to our brokerage support desk at <a href="mailto:{$supportEmail}">{$supportEmail}</a>.</p>
                  <div style="margin: 18px 0; padding: 14px; background: #f1f5f9; border-left: 4px solid #10b981; border-radius: 6px; font-size: 13px;">
                    <strong>Reference:</strong> {$inqNum}<br/>
                    <strong>Product Interest:</strong> {$product}<br/>
                    <strong>Target Capital:</strong> {$capital}
                  </div>
                  <p>A senior underwriter will respond within 1 business day.</p>
                HTML;
                $textSummary = "Inquiry {$inqNum} received for {$product} ({$capital}).";
                break;

            default:
                $customMsg = nl2br(htmlspecialchars((string)($vars['message'] ?? 'This is a live email delivery test from your cPanel automated notification system.'), ENT_QUOTES, 'UTF-8'));
                $subject = (string)($vars['subject'] ?? "Automated System Test — {$config['fromName']}");
                $heading = htmlspecialchars((string)($vars['heading'] ?? 'Automated Email System Verification'), ENT_QUOTES, 'UTF-8');
                $badgeText = 'SYSTEM TEST';
                $bodyContent = <<<HTML
                  <p>Hello {$recipientName},</p>
                  <p>{$customMsg}</p>
                HTML;
                $textSummary = strip_tags((string)($vars['message'] ?? 'Automated email delivery verification test.'));
                break;
        }

        $year = date('Y');
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0; padding:24px; background-color:#f1f5f9; font-family: Arial, Helvetica, sans-serif; color:#0f172a;">
  <div style="max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(15,23,42,0.08);">
    <div style="background:#020617; color:#ffffff; padding:22px 26px; border-bottom:3px solid {$accentColor};">
      <div style="font-size:10px; letter-spacing:2px; text-transform:uppercase; color:{$accentColor}; font-weight:bold; margin-bottom:6px;">{$badgeText}</div>
      <div style="font-size:20px; font-weight:bold; color:#ffffff;">{$brandName}</div>
      <div style="font-size:13px; color:#94a3b8; margin-top:4px;">{$heading}</div>
    </div>
    <div style="padding:26px; font-size:14px; line-height:1.65; color:#1e293b;">
      {$bodyContent}
      <hr style="border:none; border-top:1px solid #e2e8f0; margin:24px 0 16px;" />
      <p style="font-size:12px; color:#64748b; margin:0;">
        Need direct assistance? Contact <a href="mailto:{$supportEmail}" style="color:#059669;">{$supportEmail}</a>.<br/>
        &copy; {$year} {$brandName} &bull; <a href="{$siteUrl}" style="color:#059669;">{$siteUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>
HTML;

        return [
            'subject' => self::sanitizeHeaderValue($subject),
            'html'    => $html,
            'text'    => $textSummary,
        ];
    }

    /**
     * Send an email via native PHP SMTP socket or PHP mail().
     */
    public static function sendRaw(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody,
        array $config
    ): array {
        $cleanTo = self::sanitizeHeaderValue($toEmail);
        $cleanToName = self::sanitizeHeaderValue($toName);
        $cleanSubject = self::sanitizeHeaderValue($subject);
        $fromEmail = self::sanitizeHeaderValue((string)($config['fromEmail'] ?? 'noreply@investproasset.com'));
        $fromName = self::sanitizeHeaderValue((string)($config['fromName'] ?? 'Sterling Wealth Broker'));
        $replyTo = self::sanitizeHeaderValue((string)($config['replyToEmail'] ?? $fromEmail));

        if (!filter_var($cleanTo, FILTER_VALIDATE_EMAIL)) {
            return ['sent' => false, 'transport' => 'validation', 'error' => 'Invalid recipient email address'];
        }

        // 1. Try native SMTP if configured
        $driver = strtolower((string)($config['driver'] ?? 'mail'));
        $smtpHost = trim((string)($config['smtpHost'] ?? ''));
        $smtpPort = (int)($config['smtpPort'] ?? 465);
        $smtpUser = trim((string)($config['smtpUsername'] ?? ''));
        $smtpPass = (string)($config['smtpPassword'] ?? '');
        $smtpEnc = strtolower((string)($config['smtpEncryption'] ?? 'ssl'));

        if ($driver === 'smtp' && $smtpHost !== '' && $smtpUser !== '' && $smtpPass !== '') {
            $smtpResult = self::sendViaSmtpSocket(
                $smtpHost,
                $smtpPort,
                $smtpEnc,
                $smtpUser,
                $smtpPass,
                $fromEmail,
                $fromName,
                $replyTo,
                $cleanTo,
                $cleanToName,
                $cleanSubject,
                $htmlBody
            );
            if ($smtpResult['sent']) {
                return $smtpResult;
            }
            // Fallback to PHP mail() if SMTP socket fails on restrictive shared host
            $fallback = self::sendViaPhpMail($cleanTo, $cleanSubject, $htmlBody, $fromEmail, $fromName, $replyTo);
            if ($fallback['sent']) {
                return ['sent' => true, 'transport' => 'php_mail_fallback', 'error' => null];
            }
            return $smtpResult;
        }

        // 2. Standard cPanel PHP mail()
        return self::sendViaPhpMail($cleanTo, $cleanSubject, $htmlBody, $fromEmail, $fromName, $replyTo);
    }

    private static function sendViaPhpMail(
        string $toEmail,
        string $subject,
        string $htmlBody,
        string $fromEmail,
        string $fromName,
        string $replyTo
    ): array {
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            "From: {$fromName} <{$fromEmail}>",
            "Reply-To: {$replyTo}",
            "Return-Path: {$fromEmail}",
            'X-Mailer: PHP/' . PHP_VERSION,
        ];
        $headerStr = implode("\r\n", $headers);

        $ok = @mail($toEmail, $subject, $htmlBody, $headerStr, "-f{$fromEmail}");
        if (!$ok) {
            $ok = @mail($toEmail, $subject, $htmlBody, $headerStr);
        }

        return [
            'sent'      => (bool)$ok,
            'transport' => 'php_mail',
            'error'     => $ok ? null : 'PHP mail() returned false (check cPanel Exim / mail server configuration or enable SMTP)',
        ];
    }

    /**
     * Lightweight native PHP SMTP client (SSL/TLS/STARTTLS + AUTH LOGIN).
     */
    private static function sendViaSmtpSocket(
        string $host,
        int $port,
        string $encryption,
        string $username,
        string $password,
        string $fromEmail,
        string $fromName,
        string $replyTo,
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody
    ): array {
        $target = ($encryption === 'ssl' ? 'ssl://' : '') . $host;
        $errno = 0;
        $errstr = '';

        $ctx = stream_context_create([
            'ssl' => [
                'verify_peer'       => false,
                'verify_peer_name'  => false,
                'allow_self_signed' => true,
            ],
        ]);

        $fp = @stream_socket_client("{$target}:{$port}", $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
        if (!$fp) {
            return ['sent' => false, 'transport' => 'smtp', 'error' => "SMTP connect failed ({$errno}): {$errstr}"];
        }

        stream_set_timeout($fp, 12);

        $readResp = function () use ($fp): string {
            $data = '';
            while ($str = fgets($fp, 515)) {
                $data .= $str;
                if (isset($str[3]) && $str[3] === ' ') {
                    break;
                }
            }
            return $data;
        };

        $sendCmd = function (string $cmd) use ($fp, $readResp): string {
            fwrite($fp, $cmd . "\r\n");
            return $readResp();
        };

        $banner = $readResp();
        if (strpos($banner, '220') !== 0) {
            fclose($fp);
            return ['sent' => false, 'transport' => 'smtp', 'error' => 'Invalid SMTP banner: ' . trim($banner)];
        }

        $ehloHost = preg_replace('/[^a-zA-Z0-9.-]/', '', $_SERVER['SERVER_NAME'] ?? 'investproasset.com') ?: 'investproasset.com';
        $resp = $sendCmd("EHLO {$ehloHost}");
        if ($encryption === 'tls' && stripos($resp, 'STARTTLS') !== false) {
            $tlsResp = $sendCmd('STARTTLS');
            if (strpos($tlsResp, '220') !== 0 || !@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                fclose($fp);
                return ['sent' => false, 'transport' => 'smtp', 'error' => 'SMTP STARTTLS handshake failed'];
            }
            $sendCmd("EHLO {$ehloHost}");
        }

        $authResp = $sendCmd('AUTH LOGIN');
        if (strpos($authResp, '334') !== 0) {
            fclose($fp);
            return ['sent' => false, 'transport' => 'smtp', 'error' => 'SMTP AUTH LOGIN rejected: ' . trim($authResp)];
        }

        $sendCmd(base64_encode($username));
        $passResp = $sendCmd(base64_encode($password));
        if (strpos($passResp, '235') !== 0) {
            fclose($fp);
            return ['sent' => false, 'transport' => 'smtp', 'error' => 'SMTP authentication failed'];
        }

        $sendCmd("MAIL FROM:<{$fromEmail}>");
        $rcptResp = $sendCmd("RCPT TO:<{$toEmail}>");
        if (strpos($rcptResp, '250') !== 0 && strpos($rcptResp, '251') !== 0) {
            fclose($fp);
            return ['sent' => false, 'transport' => 'smtp', 'error' => 'SMTP RCPT TO rejected: ' . trim($rcptResp)];
        }

        $dataResp = $sendCmd('DATA');
        if (strpos($dataResp, '354') !== 0) {
            fclose($fp);
            return ['sent' => false, 'transport' => 'smtp', 'error' => 'SMTP DATA rejected: ' . trim($dataResp)];
        }

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $toHeader = $toName !== '' ? "{$toName} <{$toEmail}>" : "<{$toEmail}>";
        $msg = "Date: " . date('r') . "\r\n"
             . "From: {$fromName} <{$fromEmail}>\r\n"
             . "Reply-To: {$replyTo}\r\n"
             . "To: {$toHeader}\r\n"
             . "Subject: {$encodedSubject}\r\n"
             . "MIME-Version: 1.0\r\n"
             . "Content-Type: text/html; charset=UTF-8\r\n"
             . "Content-Transfer-Encoding: 8bit\r\n"
             . "\r\n"
             . str_replace("\r\n.", "\r\n..", $htmlBody)
             . "\r\n.";

        fwrite($fp, $msg . "\r\n");
        $finishResp = $readResp();
        $sendCmd('QUIT');
        fclose($fp);

        if (strpos($finishResp, '250') !== 0) {
            return ['sent' => false, 'transport' => 'smtp', 'error' => 'SMTP DATA finish failed: ' . trim($finishResp)];
        }

        return ['sent' => true, 'transport' => 'smtp', 'error' => null];
    }

    /**
     * Dispatch a named automated email event, send it, and log it in MySQL `email_notifications`.
     */
    public static function dispatchEvent(
        ?PDO $pdo,
        string $eventType,
        string $recipientEmail,
        string $recipientName,
        array $variables = [],
        ?string $relatedEntityId = null,
        ?string $overrideSubject = null,
        ?string $overrideHtml = null
    ): array {
        $config = self::getConfig($pdo);

        if (!$config['enabled']) {
            return [
                'dispatched' => false,
                'status'     => 'SKIPPED_DISABLED',
                'transport'  => 'none',
                'error'      => 'Automated email notifications are disabled in Admin Settings.',
            ];
        }

        if ($eventType !== 'CUSTOM_TEST' && isset($config['triggers'][$eventType]) && !$config['triggers'][$eventType]) {
            return [
                'dispatched' => false,
                'status'     => 'SKIPPED_TRIGGER_OFF',
                'transport'  => 'none',
                'error'      => "Trigger '{$eventType}' is turned off.",
            ];
        }

        $tpl = self::buildTemplate($eventType, array_merge(['name' => $recipientName], $variables), $config);
        $subject = $overrideSubject ? self::sanitizeHeaderValue($overrideSubject) : $tpl['subject'];
        $html = $overrideHtml ?: $tpl['html'];
        $text = $tpl['text'];

        $sendResult = self::sendRaw($recipientEmail, $recipientName, $subject, $html, $config);
        $status = $sendResult['sent'] ? 'SENT' : 'FAILED';
        $logId = 'mail-' . bin2hex(random_bytes(5));
        $sentAt = date('Y-m-d H:i:s');

        self::logToDatabase(
            $pdo,
            $logId,
            $eventType,
            $recipientEmail,
            $recipientName,
            $subject,
            $html,
            $text,
            $status,
            (string)$sendResult['transport'],
            $sendResult['error'],
            $relatedEntityId,
            $sentAt
        );

        return [
            'logId'      => $logId,
            'dispatched' => $sendResult['sent'],
            'status'     => $status,
            'transport'  => $sendResult['transport'],
            'subject'    => $subject,
            'error'      => $sendResult['error'],
            'sentAt'     => $sentAt,
        ];
    }

    /**
     * Persist an email notification record to MySQL `email_notifications` (best-effort).
     */
    public static function logToDatabase(
        ?PDO $pdo,
        string $id,
        string $eventType,
        string $recipientEmail,
        string $recipientName,
        string $subject,
        string $bodyHtml,
        string $bodyText,
        string $status,
        string $transport,
        ?string $errorMessage,
        ?string $relatedEntityId,
        string $sentAt
    ): void {
        if ($pdo === null) {
            return;
        }
        try {
            $stmt = $pdo->prepare('
                INSERT INTO email_notifications (
                    id, event_type, recipient_email, recipient_name, subject,
                    body_html, body_text, status, transport, error_message,
                    related_entity_id, sent_at
                ) VALUES (
                    :id, :event, :remail, :rname, :subject,
                    :html, :text, :status, :transport, :err,
                    :related, :sent_at
                )
            ');
            $stmt->execute([
                ':id'        => $id,
                ':event'     => $eventType,
                ':remail'    => $recipientEmail,
                ':rname'     => $recipientName,
                ':subject'   => $subject,
                ':html'      => $bodyHtml,
                ':text'      => $bodyText,
                ':status'    => $status,
                ':transport' => $transport,
                ':err'       => $errorMessage,
                ':related'   => $relatedEntityId,
                ':sent_at'   => $sentAt,
            ]);
        } catch (Throwable $e) {
            // Do not crash API responses if email_notifications table hasn't been created yet
        }
    }
}
