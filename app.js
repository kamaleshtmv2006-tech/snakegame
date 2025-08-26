// Friends-inspired Snake (Canvas)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const tile = 20;
const tiles = canvas.width / tile;
let snake, dir, food, obstacles, powerUps, score, high, speed, shield, boost, musicOn, paused, gameOver, tickAccum;

const statusEl = document.getElementById('status');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high');
const speedEl = document.getElementById('speed');
const boostBar = document.getElementById('boostBar');
const bgAudio = document.getElementById('bg');

high = parseInt(localStorage.getItem('fs_high') || '0', 10);
highEl.textContent = high;

function reset() {
  snake = [{x: 5, y: 5}];
  dir = {x: 1, y: 0};
  food = spawnFood();
  obstacles = spawnObstacles(20);
  powerUps = [];
  score = 0;
  speed = 6; // base ticks per second
  shield = 0;
  boost = 0;
  musicOn = false;
  paused = false;
  gameOver = false;
  tickAccum = 0;
  powerUps.push(spawnPowerUp('coffee'));
  powerUps.push(spawnPowerUp('shield'));
  powerUps.push(spawnPowerUp('pizza'));
  updateUI();
  draw();
}

function spawnFood() {
  return randEmpty();
}

function spawnObstacles(n) {
  const obs = [];
  while (obs.length < n) {
    const p = randEmpty();
    if (!rectOverlap({x:p.x,y:p.y}, {x:12,y:12},{x:5,y:5})) obs.push(p);
  }
  return obs;
}

function spawnPowerUp(type) {
  const p = randEmpty();
  return {x:p.x, y:p.y, type, ttl: 600}; // ~100s
}

function randEmpty() {
  while (true) {
    const p = {x: Math.floor(Math.random()*tiles), y: Math.floor(Math.random()*tiles)};
    if (!snake.some(s=>s.x===p.x && s.y===p.y) &&
        (!food || (food.x!==p.x || food.y!==p.y)) &&
        !obstacles.some(o=>o.x===p.x && o.y===p.y) &&
        !powerUps.some(u=>u.x===p.x && u.y===p.y)) {
      return p;
    }
  }
}

function rectOverlap(a, b, c) { // simple distance check from c to a within b
  return Math.abs(a.x-c.x) < b.x && Math.abs(a.y-c.y) < b.y;
}

function update(dt) {
  if (paused || gameOver) return;

  // speed calc
  const currentSpeed = speed + (boost>0 ? 4 : 0); // boost adds speed
  speedEl.textContent = (currentSpeed/6).toFixed(1) + 'x';

  tickAccum += dt;
  const tickInterval = 1000/currentSpeed;
  while (tickAccum >= tickInterval) {
    tickAccum -= tickInterval;
    step();
  }

  // degrade timers
  if (boost>0) boost -= dt; 
  powerUps.forEach(p=>p.ttl-=dt);
  powerUps = powerUps.filter(p=>p.ttl>0);
  boostBar.style.width = Math.max(0, Math.min(100, (boost/4000)*100)) + '%'; // 4s boost
}

function step() {
  // next head
  const hx = (snake[0].x + dir.x + tiles) % tiles;
  const hy = (snake[0].y + dir.y + tiles) % tiles;
  const next = {x:hx, y:hy};

  // collisions
  const hitsSelf = snake.some((s,i)=> i>0 && s.x===hx && s.y===hy);
  const hitsObs = obstacles.some(o=> o.x===hx && o.y===hy);

  if (hitsSelf || hitsObs) {
    if (shield > 0) {
      shield--; // consume shield, survive, remove obstacle if any
      obstacles = obstacles.filter(o=> !(o.x===hx && o.y===hy));
    } else {
      gameOver = true;
      statusEl.textContent = 'Game Over';
      if (score>high) { high = score; localStorage.setItem('fs_high', String(high)); }
      highEl.textContent = high;
      return;
    }
  }

  snake.unshift(next);

  // eat food
  if (next.x===food.x && next.y===food.y) {
    score += 1;
    food = spawnFood();
    // sometimes add new obstacle
    if (Math.random()<0.2) obstacles.push(randEmpty());
  } else {
    snake.pop();
  }

  // power-ups
  const idx = powerUps.findIndex(p=>p.x===hx && p.y===hy);
  if (idx>=0) {
    const p = powerUps[idx];
    if (p.type==='coffee') { boost = 4000; statusEl.textContent = 'Boosted!'; }
    if (p.type==='shield') { shield += 1; statusEl.textContent = 'Shield +1'; }
    if (p.type==='pizza')  { score += 5; speed = Math.max(4, speed-1); statusEl.textContent='Slow-mo + Bonus'; }
    powerUps.splice(idx,1);
    setTimeout(()=> powerUps.push(spawnPowerUp(['coffee','shield','pizza'][Math.floor(Math.random()*3)])), 2000);
  }

  updateUI();
}

function updateUI() {
  scoreEl.textContent = score;
  statusEl.textContent ||= 'Playing';
}

function drawGrid() {
  ctx.strokeStyle = '#1f2433';
  ctx.lineWidth = 1;
  for (let i=0;i<=tiles;i++) {
    ctx.beginPath(); ctx.moveTo(i*tile,0); ctx.lineTo(i*tile,canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*tile); ctx.lineTo(canvas.width,i*tile); ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0,0,canvas.width, canvas.height);
  // background vignette
  const g = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width/1.2);
  g.addColorStop(0,'#0c111c'); g.addColorStop(1,'#0b0d12');
  ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);

  drawGrid();

  // obstacles
  ctx.fillStyle = '#f97316';
  obstacles.forEach(o=> { ctx.fillRect(o.x*tile, o.y*tile, tile, tile); });

  // food
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(food.x*tile + tile/2, food.y*tile + tile/2, tile*0.35, 0, Math.PI*2);
  ctx.fill();

  // powerups
  powerUps.forEach(p=>{
    if (p.type==='coffee') ctx.fillStyle = '#eab308';
    if (p.type==='shield') ctx.fillStyle = '#22c55e';
    if (p.type==='pizza')  ctx.fillStyle = '#ef4444';
    ctx.fillRect(p.x*tile+4, p.y*tile+4, tile-8, tile-8);
  });

  // snake
  for (let i=0;i<snake.length;i++) {
    const s = snake[i];
    ctx.fillStyle = i===0 ? '#60a5fa' : '#93c5fd';
    ctx.fillRect(s.x*tile+2, s.y*tile+2, tile-4, tile-4);
  }

  // HUD
  if (paused) {
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 32px system-ui'; ctx.textAlign='center';
    ctx.fillText('Paused', canvas.width/2, canvas.height/2);
  }
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 32px system-ui'; ctx.textAlign='center';
    ctx.fillText('Game Over - Press Reset', canvas.width/2, canvas.height/2);
  }
  requestAnimationFrame(draw);
}

// Input
window.addEventListener('keydown', e=>{
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)) e.preventDefault();
  if (['ArrowUp','w','W'].includes(e.key) && dir.y!==1) dir={x:0,y:-1};
  if (['ArrowDown','s','S'].includes(e.key) && dir.y!==-1) dir={x:0,y:1};
  if (['ArrowLeft','a','A'].includes(e.key) && dir.x!==1) dir={x:-1,y:0};
  if (['ArrowRight','d','D'].includes(e.key) && dir.x!==-1) dir={x:1,y:0};
});

document.getElementById('mobileControls').addEventListener('click', e=>{
  const d = e.target.getAttribute('data-dir');
  if (!d) return;
  if (d==='up' && dir.y!==1) dir={x:0,y:-1};
  if (d==='down' && dir.y!==-1) dir={x:0,y:1};
  if (d==='left' && dir.x!==1) dir={x:-1,y:0};
  if (d==='right' && dir.x!==-1) dir={x:1,y:0};
});

document.getElementById('btn-start').onclick = ()=> { paused=false; statusEl.textContent='Playing'; };
document.getElementById('btn-pause').onclick = ()=> { paused=!paused; statusEl.textContent = paused?'Paused':'Playing'; };
document.getElementById('btn-reset').onclick = ()=> { reset(); };
document.getElementById('btn-music').onclick = ()=> {
  musicOn = !musicOn;
  if (musicOn) { bgAudio.volume = 0.25; bgAudio.play().catch(()=>{}); }
  else bgAudio.pause();
};

let last = performance.now();
function loop(now) {
  const dt = now - last; last = now;
  update(dt);
  requestAnimationFrame(loop);
}
reset();
requestAnimationFrame(loop);
