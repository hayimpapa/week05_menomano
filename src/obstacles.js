import {
  LINE_COLOR, LINE_WIDTH, GAP_WIDTH, WALL_HEIGHT, WALL_WIDTH,
  BOULDER_RADIUS, ACCENT_COLOR, ROAD_COLOR,
} from './constants.js';

/**
 * Draw the road surface with scrolling lane markings.
 */
export function drawRoad(ctx, groundY, W, H, scrollOffset) {
  const roadTop = groundY - 45;
  const roadBottom = groundY + 50;

  // ── Asphalt surface ──
  ctx.fillStyle = ROAD_COLOR;
  ctx.fillRect(0, roadTop, W, roadBottom - roadTop);

  // ── Road edge lines (solid white) ──
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, roadTop);
  ctx.lineTo(W, roadTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, roadBottom);
  ctx.lineTo(W, roadBottom);
  ctx.stroke();

  // ── Scrolling dashed center line ──
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2.5;
  const dashLen = 30;
  const gapLen = 25;
  const totalLen = dashLen + gapLen;
  const offset = scrollOffset % totalLen;

  for (let x = -offset; x < W + dashLen; x += totalLen) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + dashLen, groundY);
    ctx.stroke();
  }

  // ── Subtle road texture (sparse dots) ──
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  // Use scroll offset for seed to make dots scroll with road
  const seed = Math.floor(scrollOffset * 0.1);
  for (let i = 0; i < 30; i++) {
    const hash = ((seed + i * 7919) * 104729) % 100000;
    const px = ((hash % 1000) / 1000) * (W + 200) - scrollOffset % 200;
    const py = roadTop + ((hash % 731) / 731) * (roadBottom - roadTop);
    ctx.fillRect(px, py, 2, 1);
  }
}

/**
 * Draw the walking line (La Linea's line).
 * Breaks at gaps, shows bridges on acted gaps.
 */
export function drawGroundLine(ctx, obstacles, groundY, W) {
  const gapObs = obstacles
    .filter(o => o.type === 'gap')
    .sort((a, b) => a.x - b.x);

  // ── The continuous white line ──
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = 'round';

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
  ctx.lineTo(W + 10, groundY);
  ctx.stroke();
}

/**
 * Draw a gap (pothole in the road).
 * Dark void with jagged edges and cracks radiating outward.
 */
export function drawGap(ctx, obs, groundY) {
  const cx = obs.x;
  const hw = GAP_WIDTH / 2;
  const gx1 = cx - hw;
  const gx2 = cx + hw;

  if (!obs.acted) {
    // ── Dark void ──
    const depth = 35;
    ctx.fillStyle = '#050508';
    ctx.beginPath();
    ctx.moveTo(gx1 + 4, groundY);
    ctx.lineTo(gx1 - 2, groundY + depth * 0.6);
    ctx.lineTo(gx1 + 8, groundY + depth);
    ctx.lineTo(gx2 - 8, groundY + depth);
    ctx.lineTo(gx2 + 2, groundY + depth * 0.6);
    ctx.lineTo(gx2 - 4, groundY);
    ctx.closePath();
    ctx.fill();

    // ── Jagged crack edges ──
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx1 + 2, groundY - 2);
    ctx.lineTo(gx1 + 6, groundY + 4);
    ctx.lineTo(gx1 - 1, groundY + 12);
    ctx.lineTo(gx1 + 3, groundY + 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(gx2 - 2, groundY - 2);
    ctx.lineTo(gx2 - 6, groundY + 4);
    ctx.lineTo(gx2 + 1, groundY + 12);
    ctx.lineTo(gx2 - 3, groundY + 20);
    ctx.stroke();

    // ── Radiating cracks ──
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1.5;
    // Left crack
    ctx.beginPath();
    ctx.moveTo(gx1 + 2, groundY);
    ctx.lineTo(gx1 - 12, groundY - 3);
    ctx.lineTo(gx1 - 18, groundY - 8);
    ctx.stroke();
    // Right crack
    ctx.beginPath();
    ctx.moveTo(gx2 - 2, groundY);
    ctx.lineTo(gx2 + 12, groundY - 3);
    ctx.lineTo(gx2 + 18, groundY - 8);
    ctx.stroke();

    // ── Danger stripes near edges ──
    ctx.fillStyle = 'rgba(255, 100, 50, 0.15)';
    ctx.fillRect(gx1 - 6, groundY - 6, 6, 12);
    ctx.fillRect(gx2, groundY - 6, 6, 12);
  } else {
    // ── Bridge ──
    drawBridge(ctx, cx, groundY, hw);
  }
}

function drawBridge(ctx, cx, groundY, hw) {
  const gx1 = cx - hw;
  const gx2 = cx + hw;

  // Main bridge arc
  ctx.strokeStyle = ACCENT_COLOR;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(gx1, groundY);
  ctx.quadraticCurveTo(cx, groundY - 18, gx2, groundY);
  ctx.stroke();

  // Bridge planks
  ctx.strokeStyle = ACCENT_COLOR;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  for (let px = gx1 + 10; px < gx2 - 6; px += 11) {
    const t = (px - gx1) / GAP_WIDTH;
    const py = groundY - Math.sin(t * Math.PI) * 18;
    ctx.beginPath();
    ctx.moveTo(px, py - 4);
    ctx.lineTo(px, py + 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Support posts at ends
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(gx1, groundY);
  ctx.lineTo(gx1, groundY + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(gx2, groundY);
  ctx.lineTo(gx2, groundY + 10);
  ctx.stroke();
}

/**
 * Draw a wall (construction barrier on the road).
 * Orange and white striped barrier with reflectors.
 */
export function drawWall(ctx, obs, groundY) {
  const cx = obs.x;
  const hw = WALL_WIDTH / 2;
  const wx1 = cx - hw;
  const top = groundY - WALL_HEIGHT;

  // ── Main barrier body ──
  // Orange fill
  ctx.fillStyle = '#c44200';
  ctx.beginPath();
  ctx.moveTo(wx1 - 2, groundY);
  ctx.lineTo(wx1, top + 4);
  ctx.quadraticCurveTo(cx, top - 2, cx + hw, top + 4);
  ctx.lineTo(cx + hw + 2, groundY);
  ctx.closePath();
  ctx.fill();

  // White/orange stripes (construction barrier look)
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#ff6600';
  const stripeW = 10;
  for (let sy = top; sy < groundY; sy += stripeW * 2) {
    ctx.fillRect(wx1 - 4, sy, WALL_WIDTH + 8, stripeW);
  }
  ctx.restore();

  // ── Outline ──
  ctx.strokeStyle = '#ff8833';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(wx1 - 2, groundY);
  ctx.lineTo(wx1, top + 4);
  ctx.quadraticCurveTo(cx, top - 2, cx + hw, top + 4);
  ctx.lineTo(cx + hw + 2, groundY);
  ctx.stroke();

  // ── Reflector dots ──
  ctx.fillStyle = '#ffcc00';
  ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
  ctx.beginPath();
  ctx.arc(cx, top + 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, top + 28, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Base/footing ──
  ctx.fillStyle = '#444';
  ctx.fillRect(wx1 - 6, groundY - 4, WALL_WIDTH + 12, 4);

  if (obs.acted) {
    drawLadder(ctx, cx, groundY, top);
  }
}

function drawLadder(ctx, cx, groundY, top) {
  const lx = cx - WALL_WIDTH / 2 - 20;
  const lTop = top - 8;

  // Ladder rails (angled against barrier)
  ctx.strokeStyle = ACCENT_COLOR;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lx, groundY);
  ctx.lineTo(lx + 10, lTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lx + 16, groundY);
  ctx.lineTo(lx + 26, lTop);
  ctx.stroke();

  // Rungs
  ctx.lineWidth = 2.5;
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);
    const y = groundY - t * (groundY - lTop);
    const xOff = t * 10;
    ctx.beginPath();
    ctx.moveTo(lx + xOff, y);
    ctx.lineTo(lx + 16 + xOff, y);
    ctx.stroke();
  }
}

/**
 * Draw a bird (crow/pigeon).
 * More detailed with body, beak, tail feathers, animated wings.
 */
export function drawBird(ctx, obs, groundY) {
  const bx = obs.x;
  const by = groundY - 52 + Math.sin(bx * 0.035) * 10;
  const wingPhase = Math.sin(Date.now() * 0.014 + bx * 0.02);
  const wing = wingPhase * 14;

  ctx.save();

  // ── Shadow on ground ──
  const shadowAlpha = 0.15 + Math.sin(bx * 0.035) * 0.05;
  ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(bx, groundY + 2, 14, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Body (dark, filled) ──
  ctx.fillStyle = '#2a2a3a';
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.ellipse(bx, by, 14, 7, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // ── Wings ──
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = '#3a3a4a';

  // Left wing
  ctx.beginPath();
  ctx.moveTo(bx - 3, by - 4);
  ctx.quadraticCurveTo(bx - 12, by - 16 + wing, bx - 22, by - 6 + wing);
  ctx.quadraticCurveTo(bx - 14, by - 2 + wing * 0.3, bx - 3, by - 2);
  ctx.fill();
  ctx.stroke();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(bx + 3, by - 4);
  ctx.quadraticCurveTo(bx + 12, by - 16 + wing, bx + 22, by - 6 + wing);
  ctx.quadraticCurveTo(bx + 14, by - 2 + wing * 0.3, bx + 3, by - 2);
  ctx.fill();
  ctx.stroke();

  // ── Tail feathers ──
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx + 12, by);
  ctx.lineTo(bx + 22, by + 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + 12, by + 1);
  ctx.lineTo(bx + 20, by + 5);
  ctx.stroke();

  // ── Head ──
  ctx.fillStyle = '#333';
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bx - 10, by - 3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // ── Beak ──
  ctx.fillStyle = '#cc8800';
  ctx.strokeStyle = '#aa6600';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bx - 14, by - 4);
  ctx.lineTo(bx - 22, by - 2);
  ctx.lineTo(bx - 14, by - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ── Eye ──
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(bx - 11, by - 4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(bx - 11.5, by - 4, 1, 0, Math.PI * 2);
  ctx.fill();

  // ── Angry eyebrow ──
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bx - 14, by - 7);
  ctx.lineTo(bx - 9, by - 6);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw warning indicator for approaching obstacles.
 */
export function drawWarning(ctx, obs, groundY, MANO_X, ACTION_WINDOW) {
  if (obs.acted || obs.passed) return;
  const dist = obs.x - MANO_X;
  if (dist > ACTION_WINDOW + 40 || dist < -30) return;

  const urgency = Math.max(0, 1 - dist / (ACTION_WINDOW + 40));
  const pulse = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
  const alpha = urgency * pulse * 0.8;

  // Exclamation mark
  ctx.fillStyle = `rgba(255, 100, 50, ${alpha})`;
  ctx.font = 'bold 24px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  const wy = obs.type === 'bird'
    ? groundY - 85
    : obs.type === 'wall'
      ? groundY - WALL_HEIGHT - 20
      : obs.type === 'boulder'
        ? groundY - BOULDER_RADIUS * 2 - 10
        : groundY - 25;
  ctx.fillText('!', obs.x, wy);

  // Glow ring when very close
  if (urgency > 0.6) {
    ctx.strokeStyle = `rgba(255, 100, 50, ${(urgency - 0.6) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(obs.x, wy - 6, 16 + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Draw a boulder (rolling rock obstacle).
 * Rough circular rock with cracks. When smashed, shows debris fragments.
 */
export function drawBoulder(ctx, obs, groundY) {
  const cx = obs.x;
  const cy = groundY - BOULDER_RADIUS + 2;
  const r = BOULDER_RADIUS;

  if (!obs.acted) {
    ctx.save();

    // Rolling rotation
    const roll = cx * 0.04;

    // ── Shadow ──
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 3, r * 0.9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Main rock body (irregular circle) ──
    ctx.fillStyle = '#5a5040';
    ctx.strokeStyle = '#7a6a55';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 + roll;
      const wobble = 0.88 + ((i * 7 + 3) % 5) / 20;
      const px = cx + Math.cos(ang) * r * wobble;
      const py = cy + Math.sin(ang) * r * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ── Rock texture: cracks ──
    ctx.strokeStyle = '#3a3028';
    ctx.lineWidth = 1.5;
    // Crack 1
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 10);
    ctx.lineTo(cx - 2, cy);
    ctx.lineTo(cx + 5, cy + 8);
    ctx.stroke();
    // Crack 2
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 12);
    ctx.lineTo(cx + 2, cy - 4);
    ctx.lineTo(cx - 6, cy + 4);
    ctx.stroke();

    // ── Highlight (top-left) ──
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 8, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // ── Dark underside ──
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.arc(cx + 4, cy + 8, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else {
    // ── Smashed debris ──
    drawSmashDebris(ctx, cx, cy, groundY, r);
  }
}

function drawSmashDebris(ctx, cx, cy, groundY, r) {
  ctx.save();

  const time = Date.now() * 0.001;

  // Scattered rock fragments
  const fragments = [
    { dx: -18, dy: -12, size: 8, rot: 0.5 },
    { dx: 14, dy: -8, size: 10, rot: 1.2 },
    { dx: -8, dy: 10, size: 6, rot: 2.1 },
    { dx: 20, dy: 5, size: 7, rot: 3.0 },
    { dx: -22, dy: 2, size: 5, rot: 4.2 },
    { dx: 6, dy: -18, size: 6, rot: 5.5 },
    { dx: -4, dy: 14, size: 9, rot: 0.8 },
  ];

  for (const f of fragments) {
    ctx.fillStyle = '#5a5040';
    ctx.strokeStyle = '#7a6a55';
    ctx.lineWidth = 1.5;

    ctx.save();
    ctx.translate(cx + f.dx, cy + f.dy);
    ctx.rotate(f.rot);

    // Irregular fragment shape
    ctx.beginPath();
    ctx.moveTo(-f.size * 0.5, -f.size * 0.3);
    ctx.lineTo(f.size * 0.4, -f.size * 0.5);
    ctx.lineTo(f.size * 0.5, f.size * 0.3);
    ctx.lineTo(-f.size * 0.3, f.size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Impact star/burst lines
  ctx.strokeStyle = ACCENT_COLOR;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const innerR = 8;
    const outerR = 22;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * innerR, cy + Math.sin(ang) * innerR);
    ctx.lineTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
    ctx.stroke();
  }

  // Small dust cloud
  ctx.fillStyle = 'rgba(180, 160, 130, 0.2)';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
