import {
  MANO_X, LINE_COLOR, LINE_WIDTH, ACTION_WINDOW,
  SKY_TOP, SKY_BOTTOM, ACCENT_COLOR,
} from './constants.js';
import { createGameState, startGame, handleAction, update } from './game.js';
import { drawMano } from './mano.js';
import {
  drawRoad, drawGroundLine, drawGap, drawWall, drawBird, drawBoulder, drawWarning,
} from './obstacles.js';

// ── DOM ──
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const olTitle = document.getElementById('olTitle');
const olSub = document.getElementById('olSub');
const olScore = document.getElementById('olScore');
const olBest = document.getElementById('olBest');
const olBtn = document.getElementById('olBtn');
const buttons = document.querySelectorAll('.btn');
const tutorial = document.getElementById('tutorial');
const tutorialOk = document.getElementById('tutorialOk');
const tutorialForget = document.getElementById('tutorialForget');

let W, H, groundY, dpr;
let lastResizeW = 0, lastResizeH = 0;
const game = createGameState();

// ── Background elements (parallax) ──
const buildings = [];
function initBuildings() {
  buildings.length = 0;
  for (let i = 0; i < 12; i++) {
    buildings.push({
      x: i * (W / 6) + Math.random() * 40 - 20,
      w: 20 + Math.random() * 40,
      h: 30 + Math.random() * 60,
      shade: 0.03 + Math.random() * 0.05,
    });
  }
}

// ── Canvas resize ──
function resize() {
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const rw = Math.round(rect.width);
  const rh = Math.round(rect.height);
  if (rw !== lastResizeW || rh !== lastResizeH) {
    lastResizeW = rw;
    lastResizeH = rh;
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    groundY = H * 0.68;
    initBuildings();
  }
}
window.addEventListener('resize', resize);
resize();

// ── Menu ──
function showMenu(isDead) {
  game.state = 'menu';
  if (isDead) {
    if (game.score > game.best) {
      game.best = game.score;
      localStorage.setItem('mano_best', String(game.best));
    }
    olTitle.textContent = 'Game Over';
    olSub.textContent = '';
    olScore.textContent = 'Score: ' + game.score;
    olBest.textContent = 'Best: ' + game.best;
    olBtn.textContent = 'RETRY';
  } else {
    olTitle.textContent = 'Menő Manó';
    olSub.textContent = 'La Linea Runner';
    olScore.textContent = game.best > 0 ? 'Best: ' + game.best : '';
    olBest.textContent = '';
    olBtn.textContent = 'PLAY';
  }
  overlay.classList.remove('hidden');
}

function onStart() {
  // Show tutorial on first play if not dismissed
  if (!localStorage.getItem('mano_skip_tutorial') && !game.tutorialShown) {
    game.tutorialShown = true;
    tutorial.classList.remove('hidden');
    return;
  }
  startGame(game);
  overlay.classList.add('hidden');
  clearButtonEffects();
}

function dismissTutorial() {
  if (tutorialForget.checked) {
    localStorage.setItem('mano_skip_tutorial', '1');
  }
  tutorial.classList.add('hidden');
  startGame(game);
  overlay.classList.add('hidden');
  clearButtonEffects();
}

tutorialOk.addEventListener('click', (e) => { e.stopPropagation(); dismissTutorial(); });

olBtn.addEventListener('click', (e) => { e.stopPropagation(); onStart(); });

// ── Input ──
function clearButtonEffects() {
  buttons.forEach(b => b.classList.remove('correct', 'wrong', 'pressed'));
}

function flashButton(action, success) {
  clearButtonEffects();
  buttons.forEach(b => {
    if (b.dataset.action === action) {
      b.classList.add(success ? 'correct' : 'wrong');
    }
  });
  setTimeout(clearButtonEffects, 500);
}

function onAction(action) {
  const result = handleAction(game, action);
  if (result) flashButton(result.action, result.success);
}

buttons.forEach(btn => {
  const action = btn.dataset.action;
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    onAction(action);
  });
  btn.addEventListener('pointerup', () => btn.classList.remove('pressed'));
  btn.addEventListener('pointercancel', () => btn.classList.remove('pressed'));
  btn.addEventListener('pointerleave', () => btn.classList.remove('pressed'));
});

const KEY_MAP = {
  '1': 'bridge', '2': 'ladder', '3': 'smash', '4': 'duck',
  'a': 'bridge', 's': 'ladder', 'd': 'smash', 'f': 'duck',
  'arrowleft': 'bridge', 'arrowup': 'ladder', 'arrowright': 'smash', 'arrowdown': 'duck',
};
document.addEventListener('keydown', (e) => {
  const action = KEY_MAP[e.key.toLowerCase()];
  if (action) {
    e.preventDefault();
    onAction(action);
  }
  if ((e.key === ' ' || e.key === 'Enter') && game.state === 'menu') onStart();
});

// ══════════════════════════════════════════
// DRAWING
// ══════════════════════════════════════════

function drawSky() {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY - 45);
  grad.addColorStop(0, SKY_TOP);
  grad.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, groundY - 45);

  // Stars (subtle, twinkling)
  const time = Date.now() * 0.001;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 20; i++) {
    const sx = ((i * 1973 + 47) % 997) / 997 * W;
    const sy = ((i * 863 + 131) % 601) / 601 * (groundY - 80);
    const twinkle = 0.3 + Math.sin(time * (1 + i * 0.3) + i) * 0.3;
    ctx.globalAlpha = twinkle;
    ctx.beginPath();
    ctx.arc(sx, sy, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawCityscape() {
  const skylineY = groundY - 45;
  const parallax = game.scrollOffset * 0.15;

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (const b of buildings) {
    const bx = ((b.x - parallax) % (W + 80)) - 40;
    ctx.fillRect(bx, skylineY - b.h, b.w, b.h);

    // Windows (tiny dots)
    ctx.fillStyle = `rgba(255,200,100,${b.shade})`;
    for (let wy = skylineY - b.h + 8; wy < skylineY - 4; wy += 10) {
      for (let wx = bx + 4; wx < bx + b.w - 4; wx += 8) {
        ctx.fillRect(wx, wy, 3, 4);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
  }
}

function drawBelowRoad() {
  const roadBottom = groundY + 50;
  // Dark ground below road
  const grad = ctx.createLinearGradient(0, roadBottom, 0, H);
  grad.addColorStop(0, '#1a1a1a');
  grad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, roadBottom, W, H - roadBottom);
}

function drawParticles() {
  for (const p of game.particles) {
    const alpha = (p.life / p.maxLife) * 0.4;
    ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, groundY + p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawScorePopups() {
  for (const sp of game.scorePopups) {
    const alpha = sp.life / sp.maxLife;
    ctx.fillStyle = `rgba(255, 213, 79, ${alpha})`;
    ctx.font = `bold 20px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(sp.text, sp.x + 20, groundY + sp.y);
  }
}

function drawHUD() {
  // Score (left side, bold)
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px -apple-system, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(String(game.score), 16, 36);

  // "Score" label
  ctx.fillStyle = '#555';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillText('SCORE', 16, 50);

  // Best (right side)
  ctx.fillStyle = ACCENT_COLOR;
  ctx.textAlign = 'right';
  ctx.font = 'bold 16px -apple-system, sans-serif';
  ctx.fillText(String(game.best), W - 16, 30);
  ctx.fillStyle = '#555';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillText('BEST', W - 16, 44);

  // Speed indicator (subtle bar)
  const speedPct = (game.speed - 2) / 5;
  if (speedPct > 0) {
    const barW = 60;
    const barX = (W - barW) / 2;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, 14, barW, 4);
    ctx.fillStyle = speedPct > 0.7 ? '#f44336' : speedPct > 0.4 ? ACCENT_COLOR : '#4caf50';
    ctx.fillRect(barX, 14, barW * Math.min(speedPct, 1), 4);
  }
}

function drawDeathEffect() {
  if (game.state !== 'dead') return;
  const a = game.deadTimer / 70;

  // Red vignette
  const grad = ctx.createRadialGradient(MANO_X, groundY - 30, 20, MANO_X, groundY - 30, 200);
  grad.addColorStop(0, `rgba(255, 0, 0, ${a * 0.4})`);
  grad.addColorStop(1, `rgba(255, 0, 0, ${a * 0.15})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // La Linea tantrum: angry squiggles radiating outward
  ctx.strokeStyle = `rgba(255, 200, 200, ${a * 0.8})`;
  ctx.lineWidth = 2.5;
  const expand = (70 - game.deadTimer) * 1.2;
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + Date.now() * 0.008;
    const r = 15 + expand;
    const cx = MANO_X + Math.cos(ang) * r;
    const cy = groundY - 35 + Math.sin(ang) * r;
    // Squiggly lines (zigzag)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * 8 + 3, cy + Math.sin(ang) * 8 - 3);
    ctx.lineTo(cx + Math.cos(ang) * 14 - 3, cy + Math.sin(ang) * 14 + 3);
    ctx.lineTo(cx + Math.cos(ang) * 20, cy + Math.sin(ang) * 20);
    ctx.stroke();
  }

  // "Tantrum symbols" (like comic book anger marks)
  if (game.deadTimer > 30) {
    const symAlpha = a * 0.6;
    ctx.strokeStyle = `rgba(255, 150, 150, ${symAlpha})`;
    ctx.lineWidth = 2;
    // Cross marks
    for (let i = 0; i < 3; i++) {
      const sx = MANO_X - 30 + i * 30 + Math.sin(Date.now() * 0.01 + i) * 5;
      const sy = groundY - 70 - i * 10;
      ctx.beginPath();
      ctx.moveTo(sx - 4, sy - 4); ctx.lineTo(sx + 4, sy + 4);
      ctx.moveTo(sx + 4, sy - 4); ctx.lineTo(sx - 4, sy + 4);
      ctx.stroke();
    }
  }
}

function draw() {
  // Screen shake
  ctx.save();
  if (game.shakeTimer > 0) {
    const sx = (Math.random() - 0.5) * game.shakeIntensity;
    const sy = (Math.random() - 0.5) * game.shakeIntensity;
    ctx.translate(sx, sy);
  }

  // Clear
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(-10, -10, W + 20, H + 20);

  // Background layers
  drawSky();
  drawCityscape();
  drawBelowRoad();

  // Road
  drawRoad(ctx, groundY, W, H, game.scrollOffset);

  // Gaps (draw below the line)
  for (const obs of game.obstacles) {
    if (obs.type === 'gap') drawGap(ctx, obs, groundY);
  }

  // The walking line
  drawGroundLine(ctx, game.obstacles, groundY, W);

  // Walls, boulders, and birds
  for (const obs of game.obstacles) {
    if (obs.type === 'wall') drawWall(ctx, obs, groundY);
    if (obs.type === 'boulder') drawBoulder(ctx, obs, groundY);
    if (obs.type === 'bird') drawBird(ctx, obs, groundY);
  }

  // Warnings
  if (game.state === 'running') {
    for (const obs of game.obstacles) {
      drawWarning(ctx, obs, groundY, MANO_X, ACTION_WINDOW);
    }
  }

  // Dust particles
  drawParticles();

  // Mano
  const walkCycle = Math.sin(game.manoAnim * 0.15);
  const isDucking = game.manoSquish || (game.state === 'acting' && game.actionType === 'duck');
  const isPunching = game.state === 'acting' && game.actionType === 'smash';
  drawMano(ctx, MANO_X, groundY + game.manoY, walkCycle, isDucking, isPunching);

  // Score popups
  drawScorePopups();

  // HUD
  drawHUD();

  // Death overlay
  drawDeathEffect();

  ctx.restore();
}

// ── Game loop ──
function loop() {
  resize();
  const result = update(game, W);
  if (result === 'show_menu') showMenu(true);
  draw();
  requestAnimationFrame(loop);
}

// ── Init ──
showMenu(false);
loop();
