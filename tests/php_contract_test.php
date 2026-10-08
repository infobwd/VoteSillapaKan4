<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/lib/runtime.php';

function check_vote(bool $value, string $label): void {
    if (!$value) {
        fwrite(STDERR, "FAIL: $label\n");
        exit(1);
    }
    echo "PASS: $label\n";
}

[$code, $body] = vote_api_response('GET', 'health');
check_vote($code === 200, 'health returns HTTP 200');
check_vote(($body['votingEnabled'] ?? null) === false, 'voting is not enabled');
check_vote(($body['phase'] ?? null) === 'VOTE-1', 'correct phase');

[$code, $body] = vote_api_response('GET', 'vote');
check_vote($code === 404, 'vote endpoint is not exposed');
check_vote(($body['votingEnabled'] ?? null) === false, 'unknown route cannot imply voting is available');

[$code, $body] = vote_api_response('POST', 'health');
check_vote($code === 405, 'mutating method blocked');

[$code, $body] = vote_api_response('HEAD', 'health');
check_vote($code === 200, 'HEAD may check liveness');

[$code, $body] = vote_api_response('GET', '__unknown__');
check_vote($code === 404, 'unknown action denied');

echo "PASS: scaffold API contract\n";
