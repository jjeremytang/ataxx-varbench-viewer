'use strict';
importScripts('seed-spec.js');

class MT19937_64 {
  constructor(seed){this.N=312;this.M=156;this.A=0xB5026F5AA96619E9n;this.UM=0xFFFFFFFF80000000n;this.LM=0x7FFFFFFFn;this.mt=new Array(this.N).fill(0n);this.mti=this.N+1;this.seed(BigInt.asUintN(64,seed));}
  seed(seed){this.mt[0]=seed;for(this.mti=1;this.mti<this.N;this.mti++){const x=this.mt[this.mti-1]^(this.mt[this.mti-1]>>62n);this.mt[this.mti]=BigInt.asUintN(64,6364136223846793005n*x+BigInt(this.mti));}}
  next(){let x;const mag=[0n,this.A];if(this.mti>=this.N){let i=0;for(;i<this.N-this.M;i++){x=(this.mt[i]&this.UM)|(this.mt[i+1]&this.LM);this.mt[i]=this.mt[i+this.M]^(x>>1n)^mag[Number(x&1n)];}for(;i<this.N-1;i++){x=(this.mt[i]&this.UM)|(this.mt[i+1]&this.LM);this.mt[i]=this.mt[i+(this.M-this.N)]^(x>>1n)^mag[Number(x&1n)];}x=(this.mt[this.N-1]&this.UM)|(this.mt[0]&this.LM);this.mt[this.N-1]=this.mt[this.M-1]^(x>>1n)^mag[Number(x&1n)];this.mti=0;}x=this.mt[this.mti++];x^=(x>>29n)&0x5555555555555555n;x^=(x<<17n)&0x71D67FFFEDA60000n;x^=(x<<37n)&0xFFF7EEE000000000n;x^=x>>43n;return BigInt.asUintN(64,x);}
}

const key=(r,c)=>`${r},${c}`;
const inBounds=(r,c,n)=>r>=0&&r<n&&c>=0&&c<n;
const starts=n=>[[0,0],[n-1,n-1],[0,n-1],[n-1,0]];

function findEscape(start,n,p){for(let d=1;d<=2;d++)for(let dr=-d;dr<=d;dr++)for(let dc=-d;dc<=d;dc++){if(Math.max(Math.abs(dr),Math.abs(dc))!==d)continue;const r=start[0]+dr,c=start[1]+dc;if(inBounds(r,c,n)&&!p.has(key(r,c)))return[r,c];}throw new Error('找不到可保留的開局空格。');}
function shuffle(a,rng){for(let i=a.length;i>1;i--){const j=Number(rng.next()%BigInt(i));[a[i-1],a[j]]=[a[j],a[i-1]];}}
function generateLevel(n,density,seed){const p=new Set(starts(n).map(x=>key(...x)));for(const s of starts(n))p.add(key(...findEscape(s,n,p)));const visited=new Set(),orbits=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++){const k1=key(r,c);if(visited.has(k1))continue;const rr=n-1-r,cc=n-1-c,k2=key(rr,cc);visited.add(k1);visited.add(k2);if(p.has(k1)||p.has(k2))continue;const o=[[r,c]];if(k1!==k2)o.push([rr,cc]);orbits.push(o);}const target=Math.min(Math.round(density*n*n),n*n-p.size),rng=new MT19937_64(seed);shuffle(orbits,rng);const blocked=[];for(const o of orbits)if(blocked.length+o.length<=target)blocked.push(...o);return blocked;}

class Game{
  constructor(n,blocked){this.size=n;this.board=Array.from({length:n},()=>Array(n).fill('.'));this.player='R';this.passes=0;this.moves=0;for(const[r,c]of blocked)this.board[r][c]='#';this.board[0][0]='R';this.board[n-1][n-1]='R';this.board[0][n-1]='B';this.board[n-1][0]='B';}
  clone(){const g=Object.create(Game.prototype);g.size=this.size;g.board=this.board.map(r=>r.slice());g.player=this.player;g.passes=this.passes;g.moves=this.moves;return g;}
  count(x){let n=0;for(const row of this.board)for(const v of row)if(v===x)n++;return n;}
  terminal(){return this.count('R')===0||this.count('B')===0||this.count('.')===0||this.passes>=2;}
  winner(){const r=this.count('R'),b=this.count('B');return r===b?null:r>b?'R':'B';}
  legal(){if(this.terminal())return[];const out=[];for(let r=0;r<this.size;r++)for(let c=0;c<this.size;c++)if(this.board[r][c]===this.player)for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){const d=Math.max(Math.abs(dr),Math.abs(dc));if(d===0||d>2)continue;const nr=r+dr,nc=c+dc;if(inBounds(nr,nc,this.size)&&this.board[nr][nc]==='.')out.push({type:d===1?'Clone':'Jump',from:[r,c],to:[nr,nc]});}return out;}
  apply(m){if(this.terminal())return false;if(m.type==='Pass'){if(this.legal().length)return false;this.passes++;this.moves++;this.player=this.player==='R'?'B':'R';return true;}const[fr,fc]=m.from,[tr,tc]=m.to;if(!inBounds(fr,fc,this.size)||!inBounds(tr,tc,this.size)||this.board[fr][fc]!==this.player||this.board[tr][tc]!=='.')return false;const d=Math.max(Math.abs(fr-tr),Math.abs(fc-tc));if((d===1?'Clone':d===2?'Jump':'Invalid')!==m.type)return false;if(m.type==='Jump')this.board[fr][fc]='.';this.board[tr][tc]=this.player;const enemy=this.player==='R'?'B':'R';for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const r=tr+dr,c=tc+dc;if(inBounds(r,c,this.size)&&this.board[r][c]===enemy)this.board[r][c]=this.player;}this.passes=0;this.moves++;this.player=enemy;return true;}
  encode(){return this.board.map(r=>r.join('')).join('');}
}

function greedy(game){const moves=game.legal();if(!moves.length)return{type:'Pass'};const own=game.player;let best=moves[0],score=-Infinity;for(const m of moves){const n=game.clone();n.apply(m);const s=n.count(own);if(s>score){score=s;best=m;}}return best;}
function evaluate(game,root){const enemy=root==='R'?'B':'R',diff=game.count(root)-game.count(enemy);if(game.terminal()){const w=game.winner();if(w===null)return diff;return w===root?100000+diff:-100000+diff;}const mobility=game.legal().length;return diff*10+(game.player===root?mobility:-mobility);}
function search(game,depth,alpha,beta,root){if(depth===0||game.terminal())return evaluate(game,root);const moves=game.legal();if(!moves.length){const n=game.clone();n.apply({type:'Pass'});return search(n,depth-1,alpha,beta,root);}if(game.player===root){let best=-Infinity;for(const m of moves){const n=game.clone();n.apply(m);best=Math.max(best,search(n,depth-1,alpha,beta,root));alpha=Math.max(alpha,best);if(alpha>=beta)break;}return best;}let best=Infinity;for(const m of moves){const n=game.clone();n.apply(m);best=Math.min(best,search(n,depth-1,alpha,beta,root));beta=Math.min(beta,best);if(alpha>=beta)break;}return best;}
function alphabeta(game,depth){const moves=game.legal();if(!moves.length)return{type:'Pass'};const root=game.player;let best=moves[0],bestScore=-Infinity,alpha=-Infinity;for(const m of moves){const n=game.clone();n.apply(m);const s=search(n,depth-1,alpha,Infinity,root);if(s>bestScore){bestScore=s;best=m;}alpha=Math.max(alpha,bestScore);}return best;}
function choose(game,agent,rng){if(agent.type==='random'){const moves=game.legal();return moves.length?moves[Number(rng.next()%BigInt(moves.length))]:{type:'Pass'};}if(agent.type==='greedy')return greedy(game);return alphabeta(game,agent.depth);}
function moveText(m){return m.type==='Pass'?'Pass':`${m.type} (${m.from[0]},${m.from[1]}) → (${m.to[0]},${m.to[1]})`;}

function simulate(masterSeed){const spec=AtaxxSeedSpec.decode(masterSeed);const blocked=generateLevel(spec.boardSize,spec.density,spec.levelSeed);const game=new Game(spec.boardSize,blocked);const rrng=new MT19937_64(spec.redRngSeed),brng=new MT19937_64(spec.blueRngSeed);const frames=[{turn:0,player:'Start',agent:'-',move:'Initial position',board:game.encode(),red:2,blue:2}];let turn=1;while(!game.terminal()&&turn<=5000){const player=game.player,agent=player==='R'?spec.redAgent:spec.blueAgent,rng=player==='R'?rrng:brng;const m=choose(game,agent,rng);if(!game.apply(m))throw new Error('Agent 產生非法走法。');frames.push({turn,player:player==='R'?'Red':'Blue',agent:agent.label,move:moveText(m),board:game.encode(),red:game.count('R'),blue:game.count('B')});if(turn===1||turn%5===0)postMessage({type:'progress',turn});turn++;}if(!game.terminal())throw new Error('對局超過 5000 手。');const r=game.count('R'),b=game.count('B');return{spec:{...spec,masterSeed:String(spec.masterSeed),levelSeed:String(spec.levelSeed),redRngSeed:String(spec.redRngSeed),blueRngSeed:String(spec.blueRngSeed)},blocked:blocked.length,frames,winner:r===b?'Draw':r>b?'Red':'Blue'};}

onmessage=e=>{try{postMessage({type:'start'});const result=simulate(BigInt(e.data.masterSeed));postMessage({type:'done',result});}catch(err){postMessage({type:'error',message:err instanceof Error?err.message:String(err)});}};
