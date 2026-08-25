const assert = require('node:assert/strict');

global.window = global;
require('../seed-spec.js');

const S = global.AtaxxSeedSpec;
assert.ok(S, 'AtaxxSeedSpec global must exist');
assert.equal(S.SPEC_VERSION, 3);

const vectors = [
  {boardSize:10,densityPercent:10,redAgent:'random',blueAgent:'random',caseId:0n,seed:9223372036854775808n},
  {boardSize:10,densityPercent:20,redAgent:'ab2',blueAgent:'ab4',caseId:37n,seed:9223372036854852680n},
  {boardSize:15,densityPercent:30,redAgent:'ab4',blueAgent:'greedy',caseId:123456n,seed:9223372037107614098n},
  {boardSize:12,densityPercent:25,redAgent:'greedy',blueAgent:'ab3',caseId:999n,seed:9223372036856822573n},
];

for (const v of vectors) {
  const seed = S.encode(v);
  assert.equal(seed, v.seed, `known vector mismatch for case ${v.caseId}`);
  const d = S.decode(seed);
  assert.equal(d.version, 3);
  assert.equal(d.boardSize, v.boardSize);
  assert.equal(d.densityPercent, v.densityPercent);
  assert.equal(d.redAgent.id, v.redAgent);
  assert.equal(d.blueAgent.id, v.blueAgent);
  assert.equal(d.caseId, v.caseId);
}

const sameWorldA = S.decode(S.encode({
  boardSize:10,densityPercent:20,redAgent:'random',blueAgent:'random',caseId:37n
}));
const sameWorldB = S.decode(S.encode({
  boardSize:10,densityPercent:20,redAgent:'ab2',blueAgent:'ab4',caseId:37n
}));
assert.notEqual(sameWorldA.seed, sameWorldB.seed);
assert.equal(sameWorldA.worldKey, sameWorldB.worldKey);
assert.equal(sameWorldA.levelSeed, sameWorldB.levelSeed);

const legacy = S.decode(76872n);
assert.equal(legacy.version, 2);
assert.equal(legacy.boardSize, 10);
assert.equal(legacy.densityPercent, 20);
assert.equal(legacy.redAgent.id, 'ab2');
assert.equal(legacy.blueAgent.id, 'ab4');
assert.equal(legacy.caseId, 37n);

console.log(`Seed Spec regression PASS: v${S.SPEC_VERSION}, ${vectors.length} v3 vectors + v2 compatibility`);
