const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));

for (const rel of [
  'index.html',
  'reader.html',
  'code.html',
  'viewer.html',
  'assets/site.css',
  'assets/site.js',
  'seed-spec.js',
  'content/catalog.json',
]) {
  assert.ok(exists(rel), `missing required site file: ${rel}`);
}

const catalog = JSON.parse(read('content/catalog.json'));
assert.equal(catalog.site_schema, 1);
assert.match(catalog.private_source_commit, /^[0-9a-f]{40}$/);
assert.ok(catalog.items.length >= 10, 'catalog should expose useful research content');

const ids = new Set();
for (const item of catalog.items) {
  assert.ok(item.id && item.type && item.title && item.source_path && item.snapshot_path,
    `incomplete catalog item: ${JSON.stringify(item)}`);
  assert.ok(['doc', 'code'].includes(item.type), `invalid catalog type: ${item.type}`);
  assert.ok(!ids.has(item.id), `duplicate catalog id: ${item.id}`);
  ids.add(item.id);
  assert.ok(exists(item.snapshot_path), `catalog snapshot missing: ${item.snapshot_path}`);
}

for (const requiredId of ['spec','status','rules','v4-results','ataxx-cpp','search-cpp','seed-spec-cpp']) {
  assert.ok(ids.has(requiredId), `missing required catalog entry: ${requiredId}`);
}

const index = read('index.html');
for (const href of ['reader.html?id=spec', 'code.html?id=ataxx-cpp', 'viewer.html']) {
  assert.ok(index.includes(href), `index missing navigation link: ${href}`);
}

const reader = read('reader.html');
assert.ok(reader.includes('assets/site.js'));
assert.ok(reader.includes('SITE.initReader'));
const code = read('code.html');
assert.ok(code.includes('SITE.initCode'));
const viewer = read('viewer.html');
assert.ok(viewer.includes('Seed Spec v3'));
assert.ok(viewer.includes('seed-spec.js'));

const readme = read('README.md');
assert.ok(readme.includes('Current: Seed Spec v3'));
assert.ok(readme.includes('read-only presentation layer'));

console.log(`Static site validation PASS: ${catalog.items.length} catalog items from ${catalog.private_source_commit}`);
