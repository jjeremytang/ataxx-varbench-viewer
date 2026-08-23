(function(global){
  'use strict';

  const SPEC_VERSION = 2;
  const MAX_CASE_ID = (1n << 53n) - 1n;
  const BOARD_SIZES = [10, 12, 15];
  const DENSITIES = [10, 15, 20, 25, 30];
  const AGENTS = [
    {id:'random', type:'random', depth:0, label:'Random'},
    {id:'greedy', type:'greedy', depth:0, label:'Greedy'},
    {id:'ab2', type:'alphabeta', depth:2, label:'Alpha-Beta (d=2)'},
    {id:'ab3', type:'alphabeta', depth:3, label:'Alpha-Beta (d=3)'},
    {id:'ab4', type:'alphabeta', depth:4, label:'Alpha-Beta (d=4)'}
  ];

  function findIndex(array, value, field){
    const i=array.findIndex(x=>String(x)===String(value));
    if(i<0)throw new Error(`${field} 不在 Seed Spec v2 支援範圍。`);
    return i;
  }

  function agentIndex(id){
    const i=AGENTS.findIndex(x=>x.id===id);
    if(i<0)throw new Error(`未知 Agent：${id}`);
    return i;
  }

  function encode(options){
    const caseId=BigInt(options.caseId);
    if(caseId<0n||caseId>MAX_CASE_ID)throw new Error('case_id 超出 Seed Spec v2 範圍。');
    const board=findIndex(BOARD_SIZES,options.boardSize,'棋盤大小');
    const density=findIndex(DENSITIES,options.densityPercent,'障礙比例');
    const red=agentIndex(options.redAgent);
    const blue=agentIndex(options.blueAgent);
    return (caseId<<11n)|BigInt(board)|(BigInt(density)<<2n)|(BigInt(red)<<5n)|(BigInt(blue)<<8n);
  }

  function decode(seedInput){
    const seed=BigInt.asUintN(64,BigInt(seedInput));
    const board=Number(seed&3n)%BOARD_SIZES.length;
    const density=Number((seed>>2n)&7n)%DENSITIES.length;
    const red=Number((seed>>5n)&7n)%AGENTS.length;
    const blue=Number((seed>>8n)&7n)%AGENTS.length;
    return{
      version:SPEC_VERSION,
      seed,
      caseId:seed>>11n,
      boardSize:BOARD_SIZES[board],
      densityPercent:DENSITIES[density],
      redAgent:{...AGENTS[red]},
      blueAgent:{...AGENTS[blue]}
    };
  }

  global.AtaxxSeedSpec={SPEC_VERSION,MAX_CASE_ID,BOARD_SIZES:[...BOARD_SIZES],DENSITIES:[...DENSITIES],AGENTS:AGENTS.map(x=>({...x})),encode,decode};
})(window);
