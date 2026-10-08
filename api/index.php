<?php
declare(strict_types=1);
require_once __DIR__ . '/lib/runtime.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

$method = (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET');
$action = $_GET['action'] ?? '';
if (!is_string($action)) {
    $action = '';
}

[$code, $body] = vote_api_response($method, $action);
http_response_code($code);
if ($code === 405) {
    header('Allow: GET, HEAD');
}
if ($method !== 'HEAD') {
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
}
