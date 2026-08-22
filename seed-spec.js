(function(global){
  'use strict';

  const MASK64 = (1n << 64n) - 1n;
  const SPEC_VERSION = 1;

  const BOARD_SIZES_V1 = [10, 12, 15];
  const DENSITIES_V1 = [10, 15, 20, 25, 30];

  // V1 is immutable. Future agents must use a new Seed Spec version so old seeds never change meaning.
  const AGENT_PROFILES_V1 = [
    {id:'random', type:'random', depth:0, label:'Random'},
    {id:'greedy', type:'greedy', depth:0, label:'Greedy'},
    {id:'ab2', type:'alphabeta', depth:2, label:'Alpha-Beta (d=2)'},
    {id:'ab3', type:'alphabeta', depth:3, label:'Alpha-Beta (d=3)'},
    {id:'ab4', type:'alphabeta', depth:4, label:'Alpha-Beta (d=4)'}
  ];

  const RESERVED_FUTURE_AGENT_IDS = [
    'cnn-v1',
    'gnn-v1',
    'selfplay-v1',
    'plr-v1',
    'topology-aware-plr-v1'
  ];

  const SALT_BOARD   = 0x11A7A001C0FFEE01n;
  const SALT_DENSITY = 0x22A7A002C0FFEE02n;
  const SALT_RED     = 0x33A7A003C0FFEE03n;
  const SALT_BLUE    = 0x44A7A004C0FFEE04n;
  const SALT_WORLD   = 0x55A7A005C0FFEE05n;
  const SALT_RED_RNG = 0x66A7A006C0FFEE06n;
  const SALT_BLU_RNG = 0x77A7A007C0FFEE07n;

  function u64(x){
    return BigInt.asUintN(64, BigInt(x));
  }

  function splitmix64(x){
    let z = u64(x + 0x9E3779B97F4A7C15n);
    z = u64((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n);
    z = u64((z ^ (z >> 27n)) * 0x94D049BB133111EBn);
    return u64(z ^ (z >> 31n));
  }

  function derive(masterSeed, salt){
    return splitmix64(u64(masterSeed) ^ salt);
  }

  function pick(array, value){
    return array[Number(value % BigInt(array.length))];
  }

  function cloneAgent(agent){
    return {id:agent.id, type:agent.type, depth:agent.depth, label:agent.label};
  }

  function decode(seedInput){
    const masterSeed = u64(seedInput);
    const boardSize = pick(BOARD_SIZES_V1, derive(masterSeed, SALT_BOARD));
    const densityPercent = pick(DENSITIES_V1, derive(masterSeed, SALT_DENSITY));
    const redAgent = cloneAgent(pick(AGENT_PROFILES_V1, derive(masterSeed, SALT_RED)));
    const blueAgent = cloneAgent(pick(AGENT_PROFILES_V1, derive(masterSeed, SALT_BLUE)));

    return {
      version: SPEC_VERSION,
      masterSeed,
      boardSize,
      densityPercent,
      density: densityPercent / 100,
      redAgent,
      blueAgent,
      levelSeed: derive(masterSeed, SALT_WORLD),
      redRngSeed: derive(masterSeed, SALT_RED_RNG),
      blueRngSeed: derive(masterSeed, SALT_BLU_RNG),
      matchupId: `${redAgent.id}-vs-${blueAgent.id}`
    };
  }

  function matches(decoded, filters){
    if (filters.boardSize && decoded.boardSize !== Number(filters.boardSize)) return false;
    if (filters.densityPercent && decoded.densityPercent !== Number(filters.densityPercent)) return false;
    if (filters.redAgent && decoded.redAgent.id !== filters.redAgent) return false;
    if (filters.blueAgent && decoded.blueAgent.id !== filters.blueAgent) return false;
    return true;
  }

  global.AtaxxSeedSpec = {
    SPEC_VERSION,
    BOARD_SIZES_V1: BOARD_SIZES_V1.slice(),
    DENSITIES_V1: DENSITIES_V1.slice(),
    AGENT_PROFILES_V1: AGENT_PROFILES_V1.map(cloneAgent),
    RESERVED_FUTURE_AGENT_IDS: RESERVED_FUTURE_AGENT_IDS.slice(),
    splitmix64,
    decode,
    matches,
    u64
  };
})(typeof self !== 'undefined' ? self : window);
