import {
  MANO_X, BASE_SPEED, SPEED_INC, MAX_SPEED,
  OBS_MIN_GAP, OBS_MAX_GAP, ACTION_WINDOW,
  GAP_WIDTH, WALL_WIDTH, WALL_HEIGHT,
  VALID_ACTIONS,
} from './constants.js';

export function createGameState() {
  return {
    state: 'menu', // menu | running | acting | dead
    score: 0,
    best: parseInt(localStorage.getItem('mano_best') || '0', 10),
    speed: BASE_SPEED,
    obstacles: [],
    nextObsDist: 300,
    manoAnim: 0,
    actionTimer: 0,
    actionType: '',
    actionSuccess: false,
    manoY: 0,
    manoSquish: false,
    deadTimer: 0,
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
}

export function spawnObstacle(game, W) {
  const types = game.score < 3
    ? ['gap', 'wall']
    : ['gap', 'wall', 'bird', 'gap', 'wall', 'bird'];
  const type = types[Math.floor(Math.random() * types.length)];
  game.obstacles.push({ type, x: W + 40, passed: false, acted: false });
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
    game.actionType = action;
    game.actionSuccess = true;
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
  game.deadTimer = 60;
}

function updateAction(game) {
  if (game.state !== 'acting') return;
  game.actionTimer--;

  if (game.actionType === 'trampoline' || game.actionType === 'ladder') {
    const t = 1 - game.actionTimer / 40;
    game.manoY = -Math.sin(t * Math.PI) * (WALL_HEIGHT + 20);
  } else if (game.actionType === 'duck') {
    game.manoSquish = true;
  } else if (game.actionType === 'bridge') {
    const t = 1 - game.actionTimer / 40;
    game.manoY = -Math.sin(t * Math.PI) * 6;
  }

  if (game.actionTimer <= 0) {
    game.state = 'running';
    game.actionType = '';
    game.manoY = 0;
    game.manoSquish = false;
    game.score++;
    game.speed = Math.min(MAX_SPEED, BASE_SPEED + game.score * SPEED_INC);
  }
}

function checkCollision(game) {
  for (const obs of game.obstacles) {
    if (obs.acted || obs.passed) continue;
    if (obs.type === 'gap') {
      const gx1 = obs.x - GAP_WIDTH / 2;
      const gx2 = obs.x + GAP_WIDTH / 2;
      if (MANO_X > gx1 && MANO_X < gx2) {
        die(game);
        return;
      }
    } else if (obs.type === 'wall') {
      if (Math.abs(obs.x - MANO_X) < WALL_WIDTH / 2 + 8) {
        die(game);
        return;
      }
    } else if (obs.type === 'bird') {
      if (Math.abs(obs.x - MANO_X) < 18) {
        die(game);
        return;
      }
    }
  }
}

export function update(game, W) {
  if (game.state === 'running' || game.state === 'acting') {
    game.manoAnim++;

    for (const obs of game.obstacles) {
      obs.x -= game.speed;
    }

    for (const obs of game.obstacles) {
      if (!obs.passed && obs.x < MANO_X - 60) {
        obs.passed = true;
      }
    }

    game.obstacles = game.obstacles.filter(o => o.x > -100);

    game.nextObsDist -= game.speed;
    if (game.nextObsDist <= 0) {
      spawnObstacle(game, W);
    }

    updateAction(game);

    if (game.state === 'running') {
      checkCollision(game);
    }
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
