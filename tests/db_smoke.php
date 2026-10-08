<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/lib/runtime.php';

/* Hard stop: this TEST must never run against a non-disposable database. */
$host = getenv('VOTE_DB_HOST');
$name = getenv('VOTE_DB_NAME');
if ($host !== '127.0.0.1' || $name !== 'vote_ci') {
    fwrite(STDERR, "REFUSED: DB smoke test requires 127.0.0.1 / vote_ci\n");
    exit(2);
}

$db = vote_db_connection();
if ($db === null) {
    fwrite(STDERR, "FAIL: isolated test database unavailable\n");
    exit(1);
}
$sql = file_get_contents(__DIR__ . '/../db/00-bootstrap.sql');
if ($sql === false) {
    fwrite(STDERR, "FAIL: bootstrap not readable\n");
    exit(1);
}
// This one-statement bootstrap is intentionally rerun to prove idempotence.
$db->exec($sql);
$db->exec($sql);
$stmt = $db->prepare('INSERT IGNORE INTO vote_schema_migrations (migration_key) VALUES (?)');
$stmt->execute(['00-bootstrap']);
$stmt->execute(['00-bootstrap']);
$count = (int) $db->query("SELECT COUNT(*) FROM vote_schema_migrations WHERE migration_key = '00-bootstrap'")->fetchColumn();
if ($count !== 1 || !vote_db_ready()) {
    fwrite(STDERR, "FAIL: bootstrap or readiness not idempotent\n");
    exit(1);
}
echo "PASS: isolated MariaDB bootstrap rerun, schema uniqueness and readiness\n";
