<?php
/**
 * Sterling Wealth Brokerage - Contact Form Mail & Inquiry Endpoint
 * Dispatches confidential inquiries to support-broker@consultant.com and logs to MySQL.
 */

require_once __DIR__ . '/../config/cors.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? 'submit');
$recipientEmail = defined('CONTACT_RECIPIENT_EMAIL') ? CONTACT_RECIPIENT_EMAIL : 'support-broker@consultant.com';
$fromEmail = defined('MAIL_FROM_EMAIL') ? MAIL_FROM_EMAIL : 'noreply@investproasset.com';
$fromName = defined('MAIL_FROM_NAME') ? MAIL_FROM_NAME : 'Sterling Wealth Broker';
$siteDomain = defined('SITE_DOMAIN') ? SITE_DOMAIN : 'investproasset.com';

if ($action === 'list') {
    require_once __DIR__ . '/../config/db.php';
    $pdo = Database::getConnection();
    $stmt = $pdo->query('SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT 100');
    sendJson(['inquiries' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed. Use POST to submit an inquiry.', 405);
}

$input = getJsonInput();
if (empty($input) && !empty($_POST)) {
    $input = $_POST;
}

$fullName      = trim((string)($input['fullName'] ?? $input['full_name'] ?? ''));
$email         = trim((string)($input['email'] ?? ''));
$phone         = trim((string)($input['phone'] ?? ''));
$company       = trim((string)($input['company'] ?? ''));
$capitalNeeded = trim((string)($input['capitalNeeded'] ?? $input['capital_needed'] ?? 'Not Specified'));
$productType   = trim((string)($input['productType'] ?? $input['product_type'] ?? 'General Underwriting Inquiry'));
$message       = trim((string)($input['message'] ?? ''));

if ($fullName === '' || $email === '' || $phone === '') {
    sendError('Full Legal Name, Email, and Direct Contact Phone are required.', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Please provide a valid corporate or personal email address.', 400);
}

// Sanitize header values to prevent CRLF injection
$safeName = str_replace(["\r", "\n"], ' ', $fullName);
$safeEmail = str_replace(["\r", "\n"], '', $email);
$inquiryId = 'inq-' . uniqid();
$inquiryNumber = 'INQ-' . strtoupper(substr(md5($inquiryId . microtime(true)), 0, 8));
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$submittedAt = gmdate('Y-m-d H:i:s') . ' UTC';

// Compose email for support-broker@consultant.com
$subject = "[{$inquiryNumber}] New Underwriting Inquiry: {$productType} - {$safeName}";

$escapedName = htmlspecialchars($safeName, ENT_QUOTES, 'UTF-8');
$escapedEmail = htmlspecialchars($safeEmail, ENT_QUOTES, 'UTF-8');
$escapedPhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$escapedCompany = htmlspecialchars($company ?: 'Not Provided', ENT_QUOTES, 'UTF-8');
$escapedCapital = htmlspecialchars($capitalNeeded, ENT_QUOTES, 'UTF-8');
$escapedProduct = htmlspecialchars($productType, ENT_QUOTES, 'UTF-8');
$escapedMessage = nl2br(htmlspecialchars($message ?: 'No additional remarks provided.', ENT_QUOTES, 'UTF-8'));

$htmlBody = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 24px;">
  <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #020617; color: #ffffff; padding: 20px 24px; border-bottom: 3px solid #10b981;">
      <h2 style="margin: 0; font-size: 18px;">Sterling Wealth Broker &mdash; Confidential Contact Inquiry</h2>
      <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Origin Domain: {$siteDomain} &bull; Reference: {$inquiryNumber}</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 160px;"><strong>Full Legal Name:</strong></td>
          <td style="padding: 8px 0; color: #0f172a;">{$escapedName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Client Email:</strong></td>
          <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:{$escapedEmail}">{$escapedEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Direct Phone:</strong></td>
          <td style="padding: 8px 0; color: #0f172a;">{$escapedPhone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Entity / Company:</strong></td>
          <td style="padding: 8px 0; color: #0f172a;">{$escapedCompany}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Capital Needed:</strong></td>
          <td style="padding: 8px 0; color: #047857; font-weight: bold;">{$escapedCapital}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Product of Interest:</strong></td>
          <td style="padding: 8px 0; color: #0f172a;">{$escapedProduct}</td>
        </tr>
      </table>

      <div style="margin-top: 18px; padding: 14px; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #10b981;">
        <div style="font-size: 12px; font-weight: bold; color: #334155; margin-bottom: 6px;">Transaction Details / Message:</div>
        <div style="font-size: 13px; line-height: 1.6; color: #0f172a;">{$escapedMessage}</div>
      </div>

      <p style="margin-top: 20px; font-size: 11px; color: #64748b;">
        Submitted via https://{$siteDomain} on {$submittedAt} (Client IP: {$ipAddress}).
      </p>
    </div>
  </div>
</body>
</html>
HTML;

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    "From: {$fromName} <{$fromEmail}>",
    "Reply-To: {$safeName} <{$safeEmail}>",
    "Return-Path: {$fromEmail}",
    'X-Mailer: PHP/' . PHP_VERSION,
];

$mailSent = @mail($recipientEmail, $subject, $htmlBody, implode("\r\n", $headers), "-f{$fromEmail}");
if (!$mailSent) {
    // Retry without -f flag on restrictive shared hosts
    $mailSent = @mail($recipientEmail, $subject, $htmlBody, implode("\r\n", $headers));
}

// Persist inquiry to MySQL (best-effort if DB is configured)
$dbSaved = false;
try {
    require_once __DIR__ . '/../config/db.php';
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('
        INSERT INTO contact_inquiries (
            id, inquiry_number, full_name, email, phone, company,
            capital_needed, product_type, message, recipient_email,
            mail_dispatched, status, ip_address
        ) VALUES (
            :id, :num, :name, :email, :phone, :company,
            :capital, :product, :message, :recipient,
            :dispatched, "NEW", :ip
        )
    ');
    $stmt->execute([
        ':id'         => $inquiryId,
        ':num'        => $inquiryNumber,
        ':name'       => $safeName,
        ':email'      => $safeEmail,
        ':phone'      => $phone,
        ':company'    => $company,
        ':capital'    => $capitalNeeded,
        ':product'    => $productType,
        ':message'    => $message,
        ':recipient'  => $recipientEmail,
        ':dispatched' => $mailSent ? 1 : 0,
        ':ip'         => $ipAddress,
    ]);
    $dbSaved = true;
} catch (Throwable $e) {
    // Do not block inquiry response if DB schema hasn't added table yet
    $dbSaved = false;
}

sendJson([
    'inquiryId'     => $inquiryId,
    'inquiryNumber' => $inquiryNumber,
    'recipient'     => $recipientEmail,
    'mailSent'      => $mailSent,
    'dbSaved'       => $dbSaved,
    'message'       => "Your confidential inquiry ({$inquiryNumber}) has been routed to {$recipientEmail}."
]);
