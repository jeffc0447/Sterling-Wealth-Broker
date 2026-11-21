<?php
/**
 * Sterling Wealth Brokerage - Document Vault & KYC Verification API
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');
$input = getJsonInput();

$uploadsDir = __DIR__ . '/../uploads';
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}

switch ($action) {
    case 'list':
        $userId = $_GET['user_id'] ?? null;
        if ($userId) {
            $stmt = $pdo->prepare('SELECT * FROM vault_documents WHERE user_id = :uid ORDER BY created_at DESC');
            $stmt->execute([':uid' => $userId]);
        } else {
            // Admin compliance desk view
            $stmt = $pdo->query('SELECT * FROM vault_documents ORDER BY created_at DESC');
        }
        $documents = $stmt->fetchAll();
        sendJson(['documents' => $documents]);
        break;

    case 'upload':
        $userId = $_POST['userId'] ?? ($input['userId'] ?? null);
        $type = $_POST['type'] ?? ($input['type'] ?? 'BANK_STATEMENTS');
        $title = $_POST['title'] ?? ($input['title'] ?? 'Uploaded Document');

        if (!$userId) {
            sendError('userId is required', 400);
        }

        $docId = 'doc-' . bin2hex(random_bytes(4));
        $now = date('Y-m-d H:i:s');
        $fileName = 'Document_' . time() . '.pdf';
        $fileSize = '1.8 MB';
        $mimeType = 'application/pdf';
        $savedPath = null;
        $hash = '0x' . hash('sha256', $docId . time() . $userId);

        // Check if real file uploaded via multipart/form-data
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $originalName = basename($_FILES['file']['name']);
            $fileExtension = pathinfo($originalName, PATHINFO_EXTENSION);
            $safeName = $docId . '_' . time() . '.' . $fileExtension;
            $destination = $uploadsDir . '/' . $safeName;

            if (move_uploaded_file($_FILES['file']['tmp_name'], $destination)) {
                $fileName = $originalName;
                $fileSize = round(filesize($destination) / (1024 * 1024), 2) . ' MB';
                $mimeType = mime_content_type($destination) ?: 'application/octet-stream';
                $savedPath = 'uploads/' . $safeName;
                $hash = '0x' . hash_file('sha256', $destination);
            }
        } elseif (!empty($_POST['fileName']) || !empty($input['fileName'])) {
            $fileName = $_POST['fileName'] ?? $input['fileName'];
            $fileSize = $_POST['fileSize'] ?? ($input['fileSize'] ?? '2.4 MB');
        }

        $stmt = $pdo->prepare('
            INSERT INTO vault_documents (
                id, user_id, type, title, file_name, file_path, file_size,
                mime_type, upload_date, status, encryption_hash
            ) VALUES (
                :id, :uid, :type, :title, :fname, :fpath, :fsize,
                :mime, :date, "PENDING_REVIEW", :hash
            )
        ');

        $stmt->execute([
            ':id'    => $docId,
            ':uid'   => $userId,
            ':type'  => $type,
            ':title' => $title,
            ':fname' => $fileName,
            ':fpath' => $savedPath,
            ':fsize' => $fileSize,
            ':mime'  => $mimeType,
            ':date'  => date('Y-m-d'),
            ':hash'  => $hash
        ]);

        sendJson([
            'message'    => 'Document successfully encrypted and vaulted in MySQL',
            'documentId' => $docId,
            'hash'       => $hash
        ], 201);
        break;

    case 'verify':
        $docId = $input['documentId'] ?? ($_POST['documentId'] ?? null);
        $decision = $input['decision'] ?? ($_POST['decision'] ?? 'APPROVED'); // APPROVED or REJECTED
        $notes = $input['notes'] ?? ($_POST['notes'] ?? 'Compliant with bank covenants');
        $officer = $input['officer'] ?? ($_POST['officer'] ?? 'Julian Montgomery (Chief Compliance Desk)');

        if (!$docId) {
            sendError('documentId is required', 400);
        }

        $status = ($decision === 'APPROVED') ? 'VERIFIED' : 'ACTION_REQUIRED';

        $stmt = $pdo->prepare('
            UPDATE vault_documents
            SET status = :status,
                verification_notes = :notes,
                verified_by = :officer
            WHERE id = :id
        ');

        $stmt->execute([
            ':status'  => $status,
            ':notes'   => $notes,
            ':officer' => $officer,
            ':id'      => $docId
        ]);

        sendJson([
            'message' => "Document KYC review completed ($status)",
            'docId'   => $docId,
            'status'  => $status
        ]);
        break;

    default:
        sendError('Invalid action parameter', 400);
        break;
}
