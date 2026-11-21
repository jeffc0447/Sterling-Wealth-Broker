<?php
/**
 * Sterling Wealth Brokerage - Export schema.sql as direct file download
 */

$schemaPath = __DIR__ . '/../database/schema.sql';

if (!file_exists($schemaPath)) {
    http_response_code(404);
    echo "schema.sql not found.";
    exit;
}

header('Content-Type: application/sql; charset=UTF-8');
header('Content-Disposition: attachment; filename="sterling_wealth_schema.sql"');
header('Content-Length: ' . filesize($schemaPath));
header('Cache-Control: no-cache, no-store, must-revalidate');

readfile($schemaPath);
exit;
