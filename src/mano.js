import { LINE_COLOR, LINE_WIDTH } from './constants.js';

/**
 * Draws Mano in authentic La Linea (Osvaldo Cavandoli) style.
 *
 * The character is defined by:
 * - Thick, continuous white line on dark background
 * - ENORMOUS protruding hooked nose (the signature feature)
 * - Round bald head flowing seamlessly into the nose
 * - Pot-bellied rounded body
 * - Short stubby legs, small feet
 * - Expressive swinging arms
 */

export function drawMano(ctx, mx, baseY, walkCycle, isDucking) {
  ctx.save();
  ctx.strokeStyle = LINE_COLOR;
  ctx.fillStyle = LINE_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isDucking) {
    drawDuckingMano(ctx, mx, baseY);
  } else {
    drawWalkingMano(ctx, mx, baseY, walkCycle);
  }
  ctx.restore();
}

function drawWalkingMano(ctx, mx, baseY, walk) {
  // Proportions (total ~68px tall)
  const footY = baseY;
  const ankleY = baseY - 3;
  const kneeY = baseY - 12;
  const hipY = baseY - 20;
  const bellyY = baseY - 28;
  const chestY = baseY - 38;
  const shoulderY = baseY - 44;
  const neckY = baseY - 48;
  const headY = baseY - 58;

  const legSwing = walk * 7;
  const armSwing = walk * 6;

  // ── LEFT LEG ──
  ctx.beginPath();
  // Foot
  ctx.moveTo(mx - 10 + legSwing, footY);
  ctx.lineTo(mx - 2 + legSwing, footY);
  ctx.stroke();
  // Shin to knee to hip
  ctx.beginPath();
  ctx.moveTo(mx - 4 + legSwing, ankleY);
  ctx.quadraticCurveTo(mx - 5 + legSwing * 0.6, kneeY, mx - 2, hipY);
  ctx.stroke();

  // ── RIGHT LEG ──
  ctx.beginPath();
  ctx.moveTo(mx + 2 - legSwing, footY);
  ctx.lineTo(mx + 10 - legSwing, footY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx + 4 - legSwing, ankleY);
  ctx.quadraticCurveTo(mx + 5 - legSwing * 0.6, kneeY, mx + 2, hipY);
  ctx.stroke();

  // ── BODY (pot-bellied, organic curve) ──
  ctx.beginPath();
  ctx.moveTo(mx, hipY);
  // Belly curves outward
  ctx.quadraticCurveTo(mx + 8, bellyY + 2, mx + 6, bellyY);
  // Chest narrows back
  ctx.quadraticCurveTo(mx + 4, chestY + 4, mx + 1, chestY);
  // Up to shoulders
  ctx.lineTo(mx, shoulderY);
  ctx.stroke();

  // ── BACK ARM (behind body) ──
  ctx.lineWidth = LINE_WIDTH - 0.5;
  ctx.beginPath();
  ctx.moveTo(mx - 1, shoulderY + 2);
  const backElbowX = mx - 7 - armSwing * 0.5;
  const backElbowY = shoulderY + 10;
  const backHandX = mx - 10 - armSwing;
  const backHandY = shoulderY + 20;
  ctx.quadraticCurveTo(backElbowX, backElbowY, backHandX, backHandY);
  ctx.stroke();
  // Hand
  drawHand(ctx, backHandX, backHandY, -1);

  // ── FRONT ARM ──
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(mx + 2, shoulderY + 2);
  const frontElbowX = mx + 8 + armSwing * 0.5;
  const frontElbowY = shoulderY + 10;
  const frontHandX = mx + 12 + armSwing;
  const frontHandY = shoulderY + 20;
  ctx.quadraticCurveTo(frontElbowX, frontElbowY, frontHandX, frontHandY);
  ctx.stroke();
  drawHand(ctx, frontHandX, frontHandY, 1);

  // ── NECK ──
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(mx, shoulderY);
  ctx.lineTo(mx + 1, neckY);
  ctx.stroke();

  // ── HEAD + NOSE (the signature) ──
  drawHead(ctx, mx + 1, headY, neckY);
}

function drawDuckingMano(ctx, mx, baseY) {
  const footY = baseY;
  const crouchY = baseY - 8;
  const bodyY = baseY - 16;
  const headY = baseY - 24;

  // ── Feet (spread for stability) ──
  ctx.beginPath();
  ctx.moveTo(mx - 12, footY);
  ctx.lineTo(mx - 2, footY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx + 2, footY);
  ctx.lineTo(mx + 10, footY);
  ctx.stroke();

  // ── Bent legs ──
  ctx.beginPath();
  ctx.moveTo(mx - 6, footY - 2);
  ctx.quadraticCurveTo(mx - 10, crouchY, mx - 2, bodyY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx + 6, footY - 2);
  ctx.quadraticCurveTo(mx + 10, crouchY, mx + 2, bodyY);
  ctx.stroke();

  // ── Hunched body ──
  ctx.beginPath();
  ctx.moveTo(mx, bodyY);
  ctx.quadraticCurveTo(mx + 8, bodyY - 2, mx + 5, headY + 6);
  ctx.stroke();

  // ── Arms covering head ──
  ctx.lineWidth = LINE_WIDTH - 0.5;
  ctx.beginPath();
  ctx.moveTo(mx + 4, bodyY - 2);
  ctx.quadraticCurveTo(mx + 12, bodyY - 6, mx + 14, headY + 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx - 1, bodyY - 2);
  ctx.lineTo(mx + 8, headY + 2);
  ctx.stroke();

  // ── Head (compressed, nose forward) ──
  ctx.lineWidth = LINE_WIDTH;
  drawDuckHead(ctx, mx + 3, headY);
}

/**
 * The iconic La Linea head.
 * The nose is the DEFINING feature - it's huge, bulbous, protruding far
 * to the right, with a pronounced downward hook.
 * The head and nose form one continuous flowing outline.
 */
function drawHead(ctx, mx, headY, neckY) {
  ctx.lineWidth = LINE_WIDTH + 0.5;

  // ── Head outline (one continuous path from back of skull through nose) ──
  ctx.beginPath();

  // Start at back-bottom of skull
  ctx.moveTo(mx - 4, headY + 8);

  // Back of skull curves up
  ctx.quadraticCurveTo(mx - 12, headY + 4, mx - 11, headY - 2);

  // Over the top of the head
  ctx.quadraticCurveTo(mx - 10, headY - 12, mx - 2, headY - 12);

  // Forehead (slight forward slope)
  ctx.quadraticCurveTo(mx + 5, headY - 12, mx + 10, headY - 8);

  // NOSE BRIDGE - extends far outward
  ctx.quadraticCurveTo(mx + 18, headY - 5, mx + 24, headY - 2);

  // NOSE TIP - the big bulbous hook curving downward
  ctx.quadraticCurveTo(mx + 28, headY, mx + 26, headY + 4);

  // UNDER NOSE - curves back toward face
  ctx.quadraticCurveTo(mx + 22, headY + 7, mx + 16, headY + 5);

  // Nostril indent
  ctx.quadraticCurveTo(mx + 13, headY + 4, mx + 10, headY + 5);

  ctx.stroke();

  // ── Mouth line ──
  ctx.lineWidth = LINE_WIDTH - 1;
  ctx.beginPath();
  ctx.moveTo(mx + 8, headY + 6);
  ctx.quadraticCurveTo(mx + 4, headY + 9, mx + 1, headY + 7);
  ctx.stroke();

  // ── Chin / jaw ──
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(mx + 1, headY + 7);
  ctx.quadraticCurveTo(mx - 2, headY + 10, mx - 4, headY + 8);
  ctx.stroke();

  // ── Eye (single dot, set back from nose) ──
  ctx.beginPath();
  ctx.arc(mx + 6, headY - 4, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawDuckHead(ctx, mx, headY) {
  ctx.lineWidth = LINE_WIDTH + 0.3;
  ctx.beginPath();

  // Compact head, nose pointing forward/down
  ctx.moveTo(mx - 3, headY + 5);
  ctx.quadraticCurveTo(mx - 8, headY + 2, mx - 7, headY - 3);
  ctx.quadraticCurveTo(mx - 4, headY - 8, mx + 2, headY - 7);

  // Nose (shorter, pointing forward since ducking)
  ctx.quadraticCurveTo(mx + 10, headY - 5, mx + 15, headY - 1);
  ctx.quadraticCurveTo(mx + 17, headY + 2, mx + 14, headY + 4);
  ctx.quadraticCurveTo(mx + 10, headY + 5, mx + 6, headY + 3);
  ctx.stroke();

  // Mouth
  ctx.lineWidth = LINE_WIDTH - 1;
  ctx.beginPath();
  ctx.moveTo(mx + 5, headY + 4);
  ctx.lineTo(mx + 1, headY + 5);
  ctx.stroke();

  // Eye
  ctx.beginPath();
  ctx.arc(mx + 4, headY - 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawHand(ctx, x, y, dir) {
  ctx.lineWidth = 2;
  // 3 finger lines fanning out
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    const angle = (dir > 0 ? -0.3 : Math.PI + 0.3) + i * 0.35;
    ctx.lineTo(x + Math.cos(angle) * 5, y + Math.sin(angle) * 5);
    ctx.stroke();
  }
  ctx.lineWidth = LINE_WIDTH;
}
