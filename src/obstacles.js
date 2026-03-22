import { LINE_COLOR, GAP_WIDTH, WALL_HEIGHT, WALL_WIDTH } from './constants.js';

export function drawGround(ctx, obstacles, groundY, W) {
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  const gapObs = obstacles
    .filter(o => o.type === 'gap')
    .slice()
    .sort((a, b) => a.x - b.x);

  ctx.beginPath();
  ctx.moveTo(0, groundY);
  let prevX = 0;

  for (const gap of gapObs) {
    const gx1 = gap.x - GAP_WIDTH / 2;
    const gx2 = gap.x + GAP_WIDTH / 2;
    if (gx1 > prevX) {
      ctx.lineTo(Math.max(gx1, 0), groundY);
    }
    if (gx2 > 0 && gx1 < W) {
      ctx.moveTo(Math.min(Math.max(gx2, 0), W), groundY);
    }
    prevX = gx2;
  }
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // Draw bridges over acted gaps
  for (const gap of gapObs) {
    if (!gap.acted) continue;
    const gx1 = gap.x - GAP_WIDTH / 2;
    const gx2 = gap.x + GAP_WIDTH / 2;
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gx1, groundY);
    ctx.quadraticCurveTo(gap.x, groundY - 14, gx2, groundY);
    ctx.stroke();
    // planks
    ctx.lineWidth = 1.5;
    for (let px = gx1 + 8; px < gx2 - 4; px += 10) {
      ctx.beginPath();
      const t = (px - gx1) / GAP_WIDTH;
      const py = groundY - Math.sin(t * Math.PI) * 14;
      ctx.moveTo(px, py - 3);
      ctx.lineTo(px, py + 3);
      ctx.stroke();
    }
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 3;
  }
}

export function drawWall(ctx, obs, groundY, actionType) {
  const wx = obs.x - WALL_WIDTH / 2;
  ctx.fillStyle = '#555';
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.fillRect(wx, groundY - WALL_HEIGHT, WALL_WIDTH, WALL_HEIGHT);
  ctx.strokeRect(wx, groundY - WALL_HEIGHT, WALL_WIDTH, WALL_HEIGHT);

  if (obs.acted) {
    if (actionType === 'ladder') {
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2;
      const lx = obs.x - WALL_WIDTH / 2 - 16;
      ctx.beginPath();
      ctx.moveTo(lx, groundY);
      ctx.lineTo(lx + 6, groundY - WALL_HEIGHT - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lx + 14, groundY);
      ctx.lineTo(lx + 20, groundY - WALL_HEIGHT - 6);
      ctx.stroke();
      for (let ry = groundY - 12; ry > groundY - WALL_HEIGHT - 4; ry -= 12) {
        const t = (groundY - ry) / (WALL_HEIGHT + 6);
        ctx.beginPath();
        ctx.moveTo(lx + t * 6, ry);
        ctx.lineTo(lx + 14 + t * 6, ry);
        ctx.stroke();
      }
    } else if (actionType === 'trampoline') {
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2.5;
      const tx = obs.x - WALL_WIDTH / 2 - 30;
      ctx.beginPath();
      ctx.moveTo(tx, groundY);
      ctx.lineTo(tx + 10, groundY - 16);
      ctx.lineTo(tx + 30, groundY - 16);
      ctx.lineTo(tx + 40, groundY);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(tx + 20, groundY - 18, 18, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export function drawBird(ctx, obs, groundY) {
  const bx = obs.x;
  const by = groundY - 50 + Math.sin(bx * 0.04) * 8;
  const wingPhase = Math.sin(Date.now() * 0.012 + bx) * 12;
  ctx.strokeStyle = '#e57373';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // body
  ctx.beginPath();
  ctx.ellipse(bx, by, 12, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  // wings
  ctx.beginPath();
  ctx.moveTo(bx - 4, by - 4);
  ctx.quadraticCurveTo(bx - 10, by - 14 + wingPhase, bx - 18, by - 8 + wingPhase);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + 4, by - 4);
  ctx.quadraticCurveTo(bx + 10, by - 14 + wingPhase, bx + 18, by - 8 + wingPhase);
  ctx.stroke();
  // beak
  ctx.beginPath();
  ctx.moveTo(bx - 12, by - 1);
  ctx.lineTo(bx - 20, by + 1);
  ctx.stroke();
  // eye
  ctx.fillStyle = '#e57373';
  ctx.beginPath();
  ctx.arc(bx - 6, by - 2, 1.5, 0, Math.PI * 2);
  ctx.fill();
}
