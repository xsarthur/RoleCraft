import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node validate-t1-fixture.mjs <fixture.json>');
  process.exit(2);
}
const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
if (fixture.retry_limit !== 1) {
  console.error(JSON.stringify({ok:false, reason:'retry_limit_must_equal_1', observed:fixture.retry_limit}));
  process.exit(1);
}
console.log(JSON.stringify({ok:true, fixture_id:fixture.fixture_id, retry_limit:fixture.retry_limit}));
