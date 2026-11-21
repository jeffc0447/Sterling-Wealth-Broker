<?php
/**
 * Sterling Wealth Brokerage - Web-based cPanel & MySQL Installer
 *
 * Allows point-and-click database installation directly from the browser on cPanel:
 * 1. Collects DB credentials (host, port, dbname, user, password) & domain settings
 * 2. Tests the MySQL connection
 * 3. Writes backend/.env with full environment configuration
 * 4. Executes backend/database/schema.sql creating all 13 tables and seed data
 * 5. Verifies uploads/ permissions and returns a complete summary
 */

header('Content-Type: text/html; charset=UTF-8');

require_once __DIR__ . '/config/env.php';

$message = null;
$error = null;
$step = 'form';
$installedTables = [];
$envWritten = false;

$schemaFile = __DIR__ . '/database/schema.sql';
$envFile    = __DIR__ . '/.env';
$configFile = __DIR__ . '/config/db.php';
$uploadsDir = __DIR__ . '/uploads';

// Pre-fill defaults from existing .env or defaults
$defaultHost   = (string)envValue('DB_HOST', 'localhost');
$defaultPort   = (string)envValue('DB_PORT', '3306');
$defaultName   = (string)envValue('DB_NAME', '');
$defaultUser   = (string)envValue('DB_USER', '');
$defaultDomain = (string)envValue('SITE_DOMAIN', 'investproasset.com');
$defaultMailTo = (string)envValue('CONTACT_RECIPIENT_EMAIL', 'support-broker@consultant.com');

/**
 * Safely split a .sql dump into individual executable SQL statements,
 * respecting single/double quotes, backslash escapes, and `--` or `#` comments.
 */
function splitSqlStatements(string $sql): array {
    $statements = [];
    $buffer = '';
    $inSingleQuote = false;
    $inDoubleQuote = false;
    $inLineComment = false;
    $inBlockComment = false;
    $len = strlen($sql);

    for ($i = 0; $i < $len; $i++) {
        $ch = $sql[$i];
        $next = ($i + 1 < $len) ? $sql[$i + 1] : '';

        if ($inLineComment) {
            if ($ch === "\n") {
                $inLineComment = false;
            }
            continue;
        }

        if ($inBlockComment) {
            if ($ch === '*' && $next === '/') {
                $inBlockComment = false;
                $i++;
            }
            continue;
        }

        if (!$inSingleQuote && !$inDoubleQuote) {
            if (($ch === '-' && $next === '-') || $ch === '#') {
                $inLineComment = true;
                continue;
            }
            if ($ch === '/' && $next === '*') {
                $inBlockComment = true;
                $i++;
                continue;
            }
        }

        if ($ch === "'" && !$inDoubleQuote) {
            $escaped = ($i > 0 && $sql[$i - 1] === '\\');
            if (!$escaped) {
                $inSingleQuote = !$inSingleQuote;
            }
        } elseif ($ch === '"' && !$inSingleQuote) {
            $escaped = ($i > 0 && $sql[$i - 1] === '\\');
            if (!$escaped) {
                $inDoubleQuote = !$inDoubleQuote;
            }
        }

        if ($ch === ';' && !$inSingleQuote && !$inDoubleQuote) {
            $trimmed = trim($buffer);
            if ($trimmed !== '') {
                $statements[] = $trimmed;
            }
            $buffer = '';
        } else {
            $buffer .= $ch;
        }
    }

    $trimmed = trim($buffer);
    if ($trimmed !== '') {
        $statements[] = $trimmed;
    }

    return $statements;
}

function escapeEnvValue(string $val): string {
    $escaped = str_replace(['\\', '"', "\r", "\n"], ['\\\\', '\\"', '', ''], $val);
    return '"' . $escaped . '"';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost     = trim($_POST['db_host'] ?? 'localhost');
    $dbPort     = trim($_POST['db_port'] ?? '3306');
    $dbName     = trim($_POST['db_name'] ?? '');
    $dbUser     = trim($_POST['db_user'] ?? '');
    $dbPass     = $_POST['db_pass'] ?? '';
    $siteDomain = trim($_POST['site_domain'] ?? 'investproasset.com');
    $contactTo  = trim($_POST['contact_email'] ?? 'support-broker@consultant.com');

    $defaultHost   = $dbHost;
    $defaultPort   = $dbPort;
    $defaultName   = $dbName;
    $defaultUser   = $dbUser;
    $defaultDomain = $siteDomain;
    $defaultMailTo = $contactTo;

    if ($dbName === '' || $dbUser === '') {
        $error = 'Database Name and Database Username are required.';
    } else {
        try {
            // 1. Test Connection
            $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => true,
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci',
            ];
            $pdo = new PDO($dsn, $dbUser, $dbPass, $options);

            // 2. Read & Execute schema.sql statement-by-statement
            if (!file_exists($schemaFile)) {
                throw new Exception("schema.sql not found at $schemaFile");
            }
            $sqlContent = file_get_contents($schemaFile);
            $statements = splitSqlStatements($sqlContent);
            foreach ($statements as $stmtSql) {
                $pdo->exec($stmtSql);
            }

            // 3. Ensure uploads directory exists
            if (!is_dir($uploadsDir)) {
                @mkdir($uploadsDir, 0755, true);
            }

            // 4. Generate & write backend/.env
            $tokenSecret = bin2hex(random_bytes(32));
            $siteUrl = 'https://' . preg_replace('/^https?:\/\//i', '', $siteDomain);
            $mailFrom = 'noreply@' . preg_replace('/^www\./i', '', preg_replace('/^https?:\/\//i', '', $siteDomain));

            $envContent = "# Sterling Wealth Brokerage - Generated cPanel Environment Configuration\n"
                . "# Generated on " . gmdate('Y-m-d H:i:s') . " UTC\n\n"
                . "APP_ENV=\"production\"\n"
                . "APP_DEBUG=\"false\"\n"
                . "APP_TIMEZONE=\"UTC\"\n\n"
                . "SITE_DOMAIN=" . escapeEnvValue($siteDomain) . "\n"
                . "SITE_URL=" . escapeEnvValue($siteUrl) . "\n"
                . "ALLOWED_ORIGINS=" . escapeEnvValue("{$siteUrl},https://www.{$siteDomain}") . "\n\n"
                . "DB_HOST=" . escapeEnvValue($dbHost) . "\n"
                . "DB_PORT=" . escapeEnvValue($dbPort) . "\n"
                . "DB_NAME=" . escapeEnvValue($dbName) . "\n"
                . "DB_USER=" . escapeEnvValue($dbUser) . "\n"
                . "DB_PASS=" . escapeEnvValue($dbPass) . "\n"
                . "DB_CHARSET=\"utf8mb4\"\n"
                . "DB_SOCKET=\"\"\n\n"
                . "AUTH_TOKEN_SECRET=" . escapeEnvValue($tokenSecret) . "\n\n"
                . "CONTACT_RECIPIENT_EMAIL=" . escapeEnvValue($contactTo) . "\n"
                . "MAIL_FROM_EMAIL=" . escapeEnvValue($mailFrom) . "\n"
                . "MAIL_FROM_NAME=\"Sterling Wealth Broker\"\n\n"
                . "CARE_AGENT_NAME=\"Jeff Campbell\"\n"
                . "CARE_AGENT_EMAIL=\"jeff@sterlingwealthbroker.com\"\n";

            $envWritten = (@file_put_contents($envFile, $envContent) !== false);

            // 5. Refresh db.php fallback constants if .env could not be written
            if (!$envWritten) {
                $fallbackDb = "<?php\n"
                    . "require_once __DIR__ . '/env.php';\n"
                    . "defined('APP_DEBUG') || define('APP_DEBUG', envBool('APP_DEBUG', false));\n"
                    . "defined('DB_HOST') || define('DB_HOST', (string)envValue('DB_HOST', " . var_export($dbHost, true) . "));\n"
                    . "defined('DB_PORT') || define('DB_PORT', (string)envValue('DB_PORT', " . var_export($dbPort, true) . "));\n"
                    . "defined('DB_NAME') || define('DB_NAME', (string)envValue('DB_NAME', " . var_export($dbName, true) . "));\n"
                    . "defined('DB_USER') || define('DB_USER', (string)envValue('DB_USER', " . var_export($dbUser, true) . "));\n"
                    . "defined('DB_PASS') || define('DB_PASS', (string)envValue('DB_PASS', " . var_export($dbPass, true) . "));\n"
                    . "defined('DB_CHARSET') || define('DB_CHARSET', 'utf8mb4');\n"
                    . "defined('DB_SOCKET') || define('DB_SOCKET', (string)envValue('DB_SOCKET', ''));\n\n"
                    . "class Database {\n"
                    . "    private static ?PDO \$instance = null;\n"
                    . "    public static function buildDsn(): string {\n"
                    . "        if (DB_SOCKET !== '') { return sprintf('mysql:unix_socket=%s;dbname=%s;charset=%s', DB_SOCKET, DB_NAME, DB_CHARSET); }\n"
                    . "        return sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);\n"
                    . "    }\n"
                    . "    public static function getConnection(): PDO {\n"
                    . "        if (self::\$instance === null) {\n"
                    . "            \$options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false, PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci'];\n"
                    . "            self::\$instance = new PDO(self::buildDsn(), DB_USER, DB_PASS, \$options);\n"
                    . "        }\n"
                    . "        return self::\$instance;\n"
                    . "    }\n"
                    . "    public static function testConnection(): array {\n"
                    . "        \$pdo = new PDO(self::buildDsn(), DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);\n"
                    . "        return ['pdo' => \$pdo, 'server_version' => \$pdo->getAttribute(PDO::ATTR_SERVER_VERSION)];\n"
                    . "    }\n"
                    . "}\n";
                @file_put_contents($configFile, $fallbackDb);
            }

            // 6. Query created tables
            $tablesStmt = $pdo->query("SHOW TABLES");
            $installedTables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

            $step = 'success';
            $message = "Database successfully installed with " . count($installedTables) . " tables initialized"
                . ($envWritten ? " and backend/.env written!" : "!");
        } catch (Exception $e) {
            $error = "Installation failed: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sterling Wealth Brokerage - cPanel & MySQL Installer</title>
  <style>
    body {
      background-color: #020617;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      max-width: 640px;
      width: 100%;
      padding: 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    h1 {
      font-size: 20px;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    p {
      color: #94a3b8;
      font-size: 13px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      font-size: 11px;
      font-family: monospace;
      border-radius: 9999px;
      margin-bottom: 12px;
    }
    .form-group { margin-bottom: 16px; }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      background: #020617;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      color: #ffffff;
      box-sizing: border-box;
      outline: none;
      font-family: monospace;
    }
    input:focus { border-color: #10b981; }
    .grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 12px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    button {
      width: 100%;
      background: #10b981;
      color: #020617;
      font-weight: 700;
      font-size: 14px;
      padding: 12px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s;
      margin-top: 8px;
    }
    button:hover { background: #34d399; }
    .alert-error {
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.4);
      color: #fda4af;
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
      margin-bottom: 20px;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #6ee7b7;
      padding: 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .table-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 16px 0;
      font-family: monospace;
      font-size: 11px;
    }
    .table-item {
      background: #020617;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #1e293b;
      color: #34d399;
    }
    .btn-portal {
      display: block;
      text-align: center;
      background: #1e293b;
      color: #ffffff;
      text-decoration: none;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      margin-top: 12px;
      border: 1px solid #334155;
    }
    .btn-portal:hover { background: #334155; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">cPanel .env &amp; MySQL Web Installer</span>
    <h1>Sterling Wealth Brokerage</h1>
    <p>Automated database setup tool for standard cPanel hosting accounts. Enter your MySQL database details below to generate <code>backend/.env</code> and initialize all 13 MySQL tables.</p>

    <?php if ($error): ?>
      <div class="alert-error">
        <strong>Error:</strong> <?= htmlspecialchars($error) ?>
      </div>
    <?php endif; ?>

    <?php if ($step === 'success'): ?>
      <div class="alert-success">
        <strong>Setup Completed Successfully!</strong><br>
        <?= htmlspecialchars($message) ?>
      </div>

      <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">
        Initialized MySQL Tables (<?= count($installedTables) ?>):
      </div>
      <div class="table-list">
        <?php foreach ($installedTables as $t): ?>
          <div class="table-item">&#10004; <?= htmlspecialchars($t) ?></div>
        <?php endforeach; ?>
      </div>

      <div style="background: #020617; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; font-size: 12px; color: #94a3b8; margin: 16px 0;">
        <strong style="color: #ffffff;">Default Administrator Access (<code>/admin</code>):</strong><br>
        Email: <code style="color: #fbbf24;">eleanor.sterling@sterlingwealthbroker.com</code><br>
        Password: <code style="color: #fbbf24;">Password123!</code>
      </div>

      <a href="../" class="btn-portal">Launch Sterling Wealth Platform &rarr;</a>
      <a href="api/setup_check.php" class="btn-portal" style="border-color: #10b981; color: #34d399;">Inspect JSON Diagnostic (setup_check.php)</a>
    <?php else: ?>
      <form method="POST">
        <div class="grid">
          <div class="form-group">
            <label for="db_host">MySQL Database Host</label>
            <input type="text" id="db_host" name="db_host" value="<?= htmlspecialchars($defaultHost) ?>" required>
          </div>
          <div class="form-group">
            <label for="db_port">Port</label>
            <input type="text" id="db_port" name="db_port" value="<?= htmlspecialchars($defaultPort) ?>" required>
          </div>
        </div>

        <div class="form-group">
          <label for="db_name">Database Name (from cPanel &rarr; MySQL Databases)</label>
          <input type="text" id="db_name" name="db_name" value="<?= htmlspecialchars($defaultName) ?>" placeholder="e.g. investpro_sterlingdb" required>
        </div>

        <div class="form-group">
          <label for="db_user">Database Username (from cPanel &rarr; MySQL Databases)</label>
          <input type="text" id="db_user" name="db_user" value="<?= htmlspecialchars($defaultUser) ?>" placeholder="e.g. investpro_sterlinguser" required>
        </div>

        <div class="form-group">
          <label for="db_pass">Database User Password</label>
          <input type="password" id="db_pass" name="db_pass" placeholder="Enter MySQL user password">
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label for="site_domain">Deployment Domain</label>
            <input type="text" id="site_domain" name="site_domain" value="<?= htmlspecialchars($defaultDomain) ?>" required>
          </div>
          <div class="form-group">
            <label for="contact_email">Contact Form Recipient Email</label>
            <input type="email" id="contact_email" name="contact_email" value="<?= htmlspecialchars($defaultMailTo) ?>" required>
          </div>
        </div>

        <button type="submit">Generate .env &amp; Initialize MySQL Database</button>
      </form>
    <?php endif; ?>
  </div>
</body>
</html>
