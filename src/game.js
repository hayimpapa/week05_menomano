import {
  MANO_X, BASE_SPEED, SPEED_INC, MAX_SPEED,
  OBS_MIN_GAP, OBS_MAX_GAP, ACTION_WINDOW,
  GAP_WIDTH, WALL_WIDTH, WALL_HEIGHT, BOULDER_RADIUS,
  VALID_ACTIONS,
} from './constants.js';

export function createGameState() {
  return {
    state: 'menu',
    score: 0,
    best: parseInt(localStorage.getItem('mano_best') || '0', 10),
    speed: BASE_SPEED,
    obstacles: [],
    nextObsDist: 300,
    manoAnim: 0,
    actionTimer: 0,
    actionType: '',
    manoY: 0,
    manoSquish: false,
    deadTimer: 0,
    scrollOffset: 0,
    shakeTimer: 0,
    shakeIntensity: 0,
    particles: [],
    scorePopups: [],
  };
}

export function startGame(game) {
  game.state = 'running';
  game.score = 0;
  game.speed = BASE_SPEED;
  game.obstacles = [];
  game.nextObsDist = 300;
  game.manoAnim = 0;
  game.actionTimer = 0;
  game.actionType = '';
  game.manoY = 0;
  game.manoSquish = false;
  game.deadTimer = 0;
  game.scrollOffset = 0;
  game.shakeTimer = 0;
  game.shakeIntensity = 0;
  game.particles = [];
  game.scorePopups = [];
}

export function spawnObstacle(game, W) {
  const types = game.score < 3
    ? ['gap', 'wall']
    : game.score < 6
      ? ['gap', 'wall', 'bird', 'gap', 'wall', 'bird']
      : ['gap', 'wall', 'bird', 'boulder', 'gap', 'wall', 'bird', 'boulder'];
  const type = types[Math.floor(Math.random() * types.length)];
  game.obstacles.push({
    type, x: W + 40,
    passed: false, acted: false, actedWith: '',
  });
  game.nextObsDist = OBS_MIN_GAP + Math.random() * (OBS_MAX_GAP - OBS_MIN_GAP);
}

export function handleAction(game, action) {
  if (game.state !== 'running') return null;

  let target = null;
  for (const obs of game.obstacles) {
    if (obs.acted || obs.passed) continue;
    const dist = obs.x - MANO_X;
    if (dist < ACTION_WINDOW && dist > -30) {
      target = obs;
      break;
    }
  }

  if (!target) {
    die(game);
    return { success: false, action };
  }

  const valid = VALID_ACTIONS[target.type];
  if (valid.includes(action)) {
    target.acted = true;
    target.actedWith = action;
    game.actionType = action;
    game.actionTimer = 40;
    game.state = 'acting';
    return { success: true, action };
  } else {
    die(game);
    return { success: false, action };
  }
}

function die(game) {
  game.state = 'dead';
  game.deadTimer = 70;
  game.shakeTimer = 20;
  game.shakeIntensity = 8;
}

function updateAction(game) {
  if (game.state !== 'acting') return;
  game.actionTimer--;

  if (game.actionType === 'ladder') {
    const t = 1 - game.actionTimer / 40;
    game.manoY = -Math.sin(t * Math.PI) * (WALL_HEIGHT + 20);
  } else if (game.actionType === 'duck') {
    game.manoSquish = true;
  } else if (game.actionType === 'bridge') {
    const t = 1 - game.actionTimer / 40;
    game.manoY = -Math.sin(t * Math.PI) * 8;
  } else if (game.actionType === 'smash') {
    // Wind-up then punch forward
    const t = 1 - game.actionTimer / 40;
    if (t < 0.3) {
      // Wind-up: lean back slightly
      game.manoY = -Math.sin(t / 0.3 * Math.PI * 0.5) * 4;
    } else {
      // Punch forward: small lunge
      game.manoY = -Math.sin((t - 0.3) / 0.7 * Math.PI) * 6;
    }
  }

  if (game.actionTimer <= 0) {
    game.state = 'running';
    game.actionType = '';
    game.manoY = 0;
    game.manoSquish = false;
    game.score++;
    game.speed = Math.min(MAX_SPEED, BASE_SPEED + game.score * SPEED_INC);

    // Score popup
    game.scorePopups.push({
      x: MANO_X, y: -60, text: '+1',
      life: 40, maxLife: 40,
    });
  }
}

function checkCollision(game) {
  for (const obs of game.obstacles) {
    if (obs.acted || obs.passed) continue;
    if (obs.type === 'gap') {
      const gx1 = obs.x - GAP_WIDTH / 2;
      const gx2 = obs.x + GAP_WIDTH / 2;
      if (MANO_X > gx1 && MANO_X < gx2) { die(game); return; }
    } else if (obs.type === 'wall') {
      if (Math.abs(obs.x - MANO_X) < WALL_WIDTH / 2 + 8) { die(game); return; }
    } else if (obs.type === 'boulder') {
      if (Math.abs(obs.x - MANO_X) < BOULDER_RADIUS + 6) { die(game); return; }
    } else if (obs.type === 'bird') {
      if (Math.abs(obs.x - MANO_X) < 18) { die(game); return; }
    }
  }
}

export function update(game, W) {
  if (game.state === 'running' || game.state === 'acting') {
    game.manoAnim++;
    game.scrollOffset += game.speed;

    for (const obs of game.obstacles) obs.x -= game.speed;
    for (const obs of game.obstacles) {
      if (!obs.passed && obs.x < MANO_X - 60) obs.passed = true;
    }
    game.obstacles = game.obstacles.filter(o => o.x > -100);

    game.nextObsDist -= game.speed;
    if (game.nextObsDist <= 0) spawnObstacle(game, W);

    updateAction(game);
    if (game.state === 'running') checkCollision(game);

    // Walking dust particles
    if (game.manoAnim % 8 === 0 && game.manoY >= -2) {
      game.particles.push({
        x: MANO_X - 5 + Math.random() * 10,
        y: 0, // relative to groundY
        vx: -0.5 - Math.random() * 1,
        vy: -0.5 - Math.random() * 1.5,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        size: 1.5 + Math.random() * 2,
      });
    }
  }

  // Update particles
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) game.particles.splice(i, 1);
  }

  // Update score popups
  for (let i = game.scorePopups.length - 1; i >= 0; i--) {
    const sp = game.scorePopups[i];
    sp.y -= 1.2;
    sp.life--;
    if (sp.life <= 0) game.scorePopups.splice(i, 1);
  }

  // Screen shake decay
  if (game.shakeTimer > 0) {
    game.shakeTimer--;
    game.shakeIntensity *= 0.88;
  }

  if (game.state === 'dead') {
    game.deadTimer--;
    if (game.deadTimer <= 0) {
      if (game.score > game.best) {
        game.best = game.score;
        localStorage.setItem('mano_best', String(game.best));
      }
      return 'show_menu';
    }
  }

  return null;
}
