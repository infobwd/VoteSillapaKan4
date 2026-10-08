import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
test('Landing declares voting closed', () => {
  assert.match(read('src/App.tsx'), /ยังไม่เปิดลงคะแนน/);
  assert.match(read('src/App.tsx'), /votingEnabled/);
});
test('Backend exposes only health/ready, and rejects writes', () => {
  const runtime = read('api/lib/runtime.php');
  assert.match(runtime, /METHOD_NOT_ALLOWED/);
  assert.match(runtime, /NOT_FOUND/);
  assert.match(runtime, /votingEnabled' => false/);
  assert.doesNotMatch(runtime, /function (submitVote|castVote|registerVoter)/);
});
test('Separate database and no production secrets in checked-in example', () => {
  const env = read('.env.example');
  assert.match(env, /VOTE_DB_NAME=vote_staging/);
  assert.doesNotMatch(env, /sillapa73|BWL_DB_PATH|real_password|production_secret/i);
  assert.match(read('tests/db_smoke.php'), /vote_ci/);
});
test('Source contract keeps activity and level separate', () => {
  const design = read('docs/DATA_INTEGRATION_CONTRACT.md');
  assert.match(design, /activity_id/);
  assert.match(design, /level_code/);
});
