<?php
/**
 * Sterling Wealth Brokerage - Lightweight PHP .env Loader
 *
 * Automatically locates and parses a .env file on cPanel shared hosting or local PHP:
 * Search order (first found wins, does not overwrite pre-set server env vars):
 *   1. Above webroot (e.g. /home/cpaneluser/.env)
 *   2. Root public_html/.env
 *   3. backend/.env
 *   4. backend/config/.env
 */

if (!defined('STERLING_ENV_LOADED')) {
    $candidatePaths = [
        dirname(__DIR__, 3) . '/.env' => '../.env (above public_html)',
        dirname(__DIR__, 2) . '/.env' => '.env (public_html root)',
        dirname(__DIR__) . '/.env'    => 'backend/.env',
        __DIR__ . '/.env'             => 'backend/config/.env',
    ];

    $loadedPathLabel = null;

    foreach ($candidatePaths as $path => $label) {
        if (@is_file($path) && @is_readable($path)) {
            $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                foreach ($lines as $rawLine) {
                    $line = trim($rawLine);
                    if ($line === '' || strpos($line, '#') === 0) {
                        continue;
                    }

                    // Strip optional `export ` prefix
                    if (stripos($line, 'export ') === 0) {
                        $line = trim(substr($line, 7));
                    }

                    $eqPos = strpos($line, '=');
                    if ($eqPos === false) {
                        continue;
                    }

                    $key = trim(substr($line, 0, $eqPos));
                    $value = trim(substr($line, $eqPos + 1));

                    if ($key === '') {
                        continue;
                    }

                    // Strip matching surrounding quotes or unquoted inline comments
                    $len = strlen($value);
                    if ($len >= 2 && (
                        ($value[0] === '"' && $value[$len - 1] === '"') ||
                        ($value[0] === "'" && $value[$len - 1] === "'")
                    )) {
                        $quoteChar = $value[0];
                        $value = substr($value, 1, -1);
                        if ($quoteChar === '"') {
                            $value = str_replace(['\\"', '\\n', '\\r', '\\t'], ['"', "\n", "\r", "\t"], $value);
                        }
                    } else {
                        $hashPos = strpos($value, ' #');
                        if ($hashPos !== false) {
                            $value = trim(substr($value, 0, $hashPos));
                        }
                    }

                    // Do not overwrite real server environment variables if already set
                    if (getenv($key) === false && !array_key_exists($key, $_ENV)) {
                        putenv("{$key}={$value}");
                        $_ENV[$key] = $value;
                        $_SERVER[$key] = $value;
                    }
                }
                $loadedPathLabel = $label;
                break;
            }
        }
    }

    define('STERLING_ENV_LOADED', $loadedPathLabel !== null);
    define('STERLING_ENV_SOURCE', $loadedPathLabel ?: 'fallback-defaults');
}

if (!function_exists('envValue')) {
    /**
     * Read an environment variable from $_ENV, $_SERVER, or getenv() with fallback.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    function envValue(string $key, $default = null) {
        if (array_key_exists($key, $_ENV) && $_ENV[$key] !== '') {
            return $_ENV[$key];
        }
        if (array_key_exists($key, $_SERVER) && $_SERVER[$key] !== '') {
            return $_SERVER[$key];
        }
        $val = getenv($key);
        if ($val !== false && $val !== '') {
            return $val;
        }
        return $default;
    }
}

if (!function_exists('envBool')) {
    function envBool(string $key, bool $default = false): bool {
        $val = envValue($key, null);
        if ($val === null) {
            return $default;
        }
        $normalized = strtolower(trim((string)$val));
        if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
            return true;
        }
        if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
            return false;
        }
        return $default;
    }
}
