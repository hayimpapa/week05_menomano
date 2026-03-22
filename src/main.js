import { MANO_X, LINE_COLOR, BG_GRAD_TOP, BG_GRAD_BOT } from './constants.js';
import { createGameState, startGame, handleAction, update } from './game.js';
import { drawMano } from './mano.js';
import { drawGround, drawWall, drawBird } from './obstacles.js';

// ── DOM elements ──
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const olTitle = document.getElementById('olTitle');
const olSub = document.getElementById('olSub');
const olScore = document.getElementById('olScore');
const olBest = document.getElementById('olBest');
const olBtn = document.getElementById('olBtn');
const buttons = document.querySelectorAll('.btn');

let W, H, groundY, dpr;
const game = createGameState();

// ── Canvas resize ──
function resize() {
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  groundY = H * 0.72;
}
window.addEventListener('resize', resize);
resize();

// ── Menu ──
function showMenu(isDead) {
  game.state = 'menu';
  if (isDead) {
    olTitle.textContent = 'Game Over!';
    olSub.textContent = '';
    olScore.textContent = 'Score: ' + game.score;
    olBest.textContent = 'Best: ' + game.best;
    olBtn.textContent = 'RETRY';
  } else {
    olTitle.textContent = 'Menő Manó';
    olSub.textContent = 'La Linea Runner';
    olScore.textContent = game.best > 0 ? 'Best: ' + game.best : '';
    olBest.textContent = '';
    olBtn.textContent = 'START';
  }
  overlay.classList.remove('hidden');
}

function onStart() {
  startGame(game);
  overlay.classList.add('hidden');
  clearButtonEffects();
}

olBtn.addEventListener('click', onStart);
olBtn.addEventListener('touchend', (e) => { e.preventDefault(); onStart(); });

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
  setTimeout(clearButtonEffects, 400);
}

function onAction(action) {
  const result = handleAction(game, action);
  if (result) {
    flashButton(result.action, result.success);
  }
}

buttons.forEach(btn => {
  const action = btn.dataset.action;
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    onAction(action);
  });
  btn.addEventListener('pointerup', () => btn.classList.remove('pressed'));
  btn.addEventListener('pointerleave', () => btn.classList.remove('pressed'));
});

const KEY_MAP = {
  '1': 'bridge', '2': 'trampoline', '3': 'ladder', '4': 'duck',
  'a': 'bridge', 's': 'trampoline', 'd': 'ladder', 'f': 'duck',
};
document.addEventListener('keydown', (e) => {
  const action = KEY_MAP[e.key.toLowerCase()];
  if (action) onAction(action);
  if (e.key === ' ' || e.key === 'Enter') {
    if (game.state === 'menu') onStart();
  }
});

// ── Drawing ──
function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, BG_GRAD_TOP);
  grad.addColorStop(1, BG_GRAD_BOT);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawHUD() {
  ctx.fillStyle = '#ffd54f';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Score: ' + game.score, W - 16, 32);

  ctx.fillStyle = '#888';
  ctx.font = '15px "Segoe UI", sans-serif';
  ctx.fillText('Best: ' + game.best, W - 16, 52);

  ctx.fillStyle = '#555';
  ctx.textAlign = 'left';
  ctx.font = '13px "Segoe UI", sans-serif';
  ctx.fillText('Speed: ' + game.speed.toFixed(1) + 'x', 12, 28);
}

function drawDeathEffect() {
  if (game.state !== 'dead') return;
  const alpha = game.deadTimer / 60;
  ctx.fillStyle = `rgba(255,0,0,${alpha * 0.3})`;
  ctx.fillRect(0, 0, W, H);

  // Tantrum squiggles
  ctx.strokeStyle = `rgba(255,200,200,${alpha})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Date.now() * 0.01;
    const r = 20 + (60 - game.deadTimer) * 0.8;
    ctx.beginPath();
    ctx.moveTo(MANO_X + Math.cos(angle) * r, groundY - 30 + Math.sin(angle) * r);
    ctx.lineTo(MANO_X + Math.cos(angle) * (r + 10), groundY - 30 + Math.sin(angle) * (r + 10));
    ctx.stroke();
  }
}

function draw() {
  drawBackground();
  drawGround(ctx, game.obstacles, groundY, W);

  for (const obs of game.obstacles) {
    if (obs.type === 'wall') drawWall(ctx, obs, groundY, game.actionType);
    if (obs.type === 'bird') drawBird(ctx, obs, groundY);
  }

  const walkCycle = Math.sin(game.manoAnim * 0.15);
  const isDucking = game.manoSquish || (game.state === 'acting' && game.actionType === 'duck');
  drawMano(ctx, MANO_X, groundY + game.manoY, walkCycle, isDucking, game.state, game.actionType);

  drawHUD();
  drawDeathEffect();
}

// ── Game loop ──
function loop() {
  resize();
  const result = update(game, W);
  if (result === 'show_menu') {
    showMenu(true);
  }
  draw();
  requestAnimationFrame(loop);
}

// ── Init ──
showMenu(false);
loop();
