<?php
declare(strict_types=1);

/**
 * VOTE-1 scaffold: read-only health endpoints only.
 * No authentication, voting, registration, or result endpoints are exposed.
 */
function vote_db_connection(): ?PDO
{
    if (!extension_loaded('pdo_mysql')) {
        return null;
    }

    $keys = ['VOTE_DB_HOST', 'VOTE_DB_PORT', 'VOTE_DB_NAME', 'VOTE_DB_USER', 'VOTE_DB_PASSWORD'];
    foreach ($keys as $key) {
        if (getenv($key) === false || getenv($key) === '') {
            return null;
        }
    }

    $host = (string) getenv('VOTE_DB_HOST');
    $port = (string) getenv('VOTE_DB_PORT');
    $name = (string) getenv('VOTE_DB_NAME');
    $user = (string) getenv('VOTE_DB_USER');
    $password = (string) getenv('VOTE_DB_PASSWORD');

    if (!ctype_digit($port) || (int) $port < 1 || (int) $port > 65535) {
        return null;
    }

    try {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);
        return new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 3,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
    } catch (PDOException $e) {
        // Never expose DSN, credentials or database exception details to the client.
        error_log('[vote] database unavailable');
        return null;
    }
}

function vote_db_ready(): bool
{
    $db = vote_db_connection();
    if ($db === null) {
        return false;
    }
    try {
        $db->query('SELECT COUNT(*) FROM vote_schema_migrations')->fetchColumn();
        return true;
    } catch (PDOException $e) {
        error_log('[vote] readiness check failed');
        return false;
    }
}

/** @return array{0:int, 1:array<string,mixed>} */
function vote_api_response(string $method, string $action): array
{
    if ($method !== 'GET' && $method !== 'HEAD') {
        return [405, [
            'status' => 'error',
            'code' => 'METHOD_NOT_ALLOWED',
            'message' => 'Method not allowed'
        ]];
    }

    if ($action === 'health') {
        return [200, [
            'status' => 'ok',
            'service' => 'VoteSillapaKan4',
            'phase' => 'VOTE-1',
            'votingEnabled' => false
        ]];
    }
    if ($action === 'ready') {
        $ready = vote_db_ready();
        return [$ready ? 200 : 503, [
            'status' => $ready ? 'ok' : 'unavailable',
            'ready' => $ready,
            'votingEnabled' => false
        ]];
    }

    return [404, [
        'status' => 'error',
        'code' => 'NOT_FOUND',
        'message' => 'Route not found',
        'votingEnabled' => false
    ]];
}
