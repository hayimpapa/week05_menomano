import { LINE_COLOR } from './constants.js';

/**
 * Draws Mano in authentic La Linea style.
 *
 * Key features from the original Osvaldo Cavandoli character:
 * - Large, bulbous hooked nose (the most iconic feature)
 * - Round head that flows into the nose seamlessly
 * - Thick continuous white line drawing style
 * - Slightly pot-bellied, rounded body
 * - Expressive hands with visible fingers
 * - Short, stubby legs with big feet
 */

export function drawMano(ctx, mx, baseY, walkCycle, isDucking, state, actionType) {
  ctx.strokeStyle = LINE_COLOR;
  ctx.fillStyle = LINE_COLOR;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isDucking) {
    drawDuckingMano(ctx, mx, baseY);
  } else {
    drawWalkingMano(ctx, mx, baseY, walkCycle);
  }
}

function drawWalkingMano(ctx, mx, baseY, walkCycle) {
  // Scale factor for the character (roughly 55px tall)
  const footY = baseY;
  const hipY = baseY - 18;
  const waistY = baseY - 22;
  const chestY = baseY - 36;
  const shoulderY = baseY - 42;
  const neckY = baseY - 44;
  const headCenterY = baseY - 54;

  // ── Legs with walk animation (short, stubby La Linea legs) ──
  const legSwing = walkCycle * 6;

  // Left leg
  ctx.beginPath();
  ctx.moveTo(mx - 4 + legSwing, footY);
  // Foot (flat, slightly extended)
  ctx.lineTo(mx - 8 + legSwing, footY);
  ctx.moveTo(mx - 4 + legSwing, footY);
  // Leg up to hip
  ctx.lineTo(mx - 3 + legSwing * 0.3, hipY);
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(mx + 4 - legSwing, footY);
  // Foot
  ctx.lineTo(mx + 8 - legSwing, footY);
  ctx.moveTo(mx + 4 - legSwing, footY);
  // Leg up to hip
  ctx.lineTo(mx + 3 - legSwing * 0.3, hipY);
  ctx.stroke();

  // ── Body (slightly pot-bellied, La Linea style) ──
  ctx.beginPath();
  ctx.moveTo(mx, hipY);
  // Slight belly curve forward
  ctx.quadraticCurveTo(mx + 4, waistY, mx + 2, chestY);
  ctx.lineTo(mx, shoulderY);
  ctx.stroke();

  // ── Arms with swing (expressive, with hand detail) ──
  const armSwing = walkCycle * 5;

  // Back arm (behind body)
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mx, shoulderY + 4);
  const backArmEndX = mx - 8 - armSwing;
  const backArmEndY = shoulderY + 18;
  ctx.quadraticCurveTo(mx - 5, shoulderY + 12, backArmEndX, backArmEndY);
  ctx.stroke();
  // Back hand - small fingers
  drawHand(ctx, backArmEndX, backArmEndY, -1, 0.7);

  // Front arm
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(mx + 1, shoulderY + 4);
  const frontArmEndX = mx + 8 + armSwing;
  const frontArmEndY = shoulderY + 18;
  ctx.quadraticCurveTo(mx + 5, shoulderY + 12, frontArmEndX, frontArmEndY);
  ctx.stroke();
  // Front hand - small fingers
  drawHand(ctx, frontArmEndX, frontArmEndY, 1, 0.7);

  // ── Head + Nose (the signature La Linea look) ──
  ctx.lineWidth = 3.5;
  drawHead(ctx, mx, headCenterY, neckY);
}

function drawDuckingMano(ctx, mx, baseY) {
  const footY = baseY;
  const crouchY = baseY - 10;
  const bodyTopY = baseY - 20;
  const headY = baseY - 28;

  // Feet (flat on ground)
  ctx.beginPath();
  ctx.moveTo(mx - 8, footY);
  ctx.lineTo(mx + 2, footY);
  ctx.stroke();

  // Crouched legs (bent)
  ctx.beginPath();
  ctx.moveTo(mx - 4, footY);
  ctx.quadraticCurveTo(mx - 10, crouchY, mx - 2, bodyTopY);
  ctx.stroke();

  // Hunched body
  ctx.beginPath();
  ctx.moveTo(mx - 2, bodyTopY);
  ctx.quadraticCurveTo(mx + 6, bodyTopY - 4, mx + 4, headY + 6);
  ctx.stroke();

  // Arms tucked in front
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mx + 2, bodyTopY);
  ctx.lineTo(mx + 10, bodyTopY + 2);
  ctx.stroke();
  drawHand(ctx, mx + 10, bodyTopY + 2, 1, 0.5);

  // Head (smaller due to perspective, looking forward)
  ctx.lineWidth = 3.5;
  drawHeadDucking(ctx, mx + 2, headY);
}

/**
 * Draws the iconic La Linea head with the huge hooked nose.
 * The nose is the most distinctive feature - it's large, bulbous,
 * and hooks downward prominently from the face.
 */
function drawHead(ctx, mx, headCenterY, neckY) {
  // Neck
  ctx.beginPath();
  ctx.moveTo(mx, neckY);
  ctx.lineTo(mx, headCenterY + 7);
  ctx.stroke();

  // The head and nose are drawn as one continuous shape.
  // Starting from the back of the head, going over the top,
  // flowing into the large nose, and back around.
  ctx.beginPath();

  // Back of head / back of skull (start from neck, go up and around)
  ctx.moveTo(mx - 2, headCenterY + 5);

  // Back curve of head
  ctx.quadraticCurveTo(mx - 10, headCenterY + 2, mx - 10, headCenterY - 3);

  // Top of head
  ctx.quadraticCurveTo(mx - 8, headCenterY - 12, mx, headCenterY - 11);

  // Forehead slopes into nose bridge
  ctx.quadraticCurveTo(mx + 6, headCenterY - 10, mx + 9, headCenterY - 6);

  // The BIG nose - bridge going outward and downward
  ctx.quadraticCurveTo(mx + 16, headCenterY - 4, mx + 19, headCenterY);

  // Nose tip curves down (the iconic hook)
  ctx.quadraticCurveTo(mx + 21, headCenterY + 3, mx + 18, headCenterY + 5);

  // Under nose back to face
  ctx.quadraticCurveTo(mx + 14, headCenterY + 6, mx + 8, headCenterY + 3);

  ctx.stroke();

  // Mouth area - small line under nose
  ctx.beginPath();
  ctx.moveTo(mx + 6, headCenterY + 4);
  ctx.quadraticCurveTo(mx + 3, headCenterY + 7, mx, headCenterY + 5);
  ctx.stroke();

  // Chin / jaw line back to neck
  ctx.beginPath();
  ctx.moveTo(mx, headCenterY + 5);
  ctx.quadraticCurveTo(mx - 4, headCenterY + 8, mx - 2, headCenterY + 5);
  ctx.stroke();

  // Eye - small dot, placed behind the nose bridge
  ctx.beginPath();
  ctx.arc(mx + 5, headCenterY - 4, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeadDucking(ctx, mx, headCenterY) {
  // Smaller ducking head, nose pointing more forward
  ctx.beginPath();

  // Back of head
  ctx.moveTo(mx - 2, headCenterY + 4);
  ctx.quadraticCurveTo(mx - 7, headCenterY, mx - 6, headCenterY - 5);

  // Top of head
  ctx.quadraticCurveTo(mx - 2, headCenterY - 9, mx + 3, headCenterY - 7);

  // Nose (pointing more forward when ducking)
  ctx.quadraticCurveTo(mx + 10, headCenterY - 5, mx + 14, headCenterY - 2);
  ctx.quadraticCurveTo(mx + 16, headCenterY + 1, mx + 13, headCenterY + 3);
  ctx.quadraticCurveTo(mx + 9, headCenterY + 4, mx + 5, headCenterY + 2);

  ctx.stroke();

  // Mouth
  ctx.beginPath();
  ctx.moveTo(mx + 4, headCenterY + 3);
  ctx.lineTo(mx + 1, headCenterY + 4);
  ctx.stroke();

  // Eye
  ctx.beginPath();
  ctx.arc(mx + 4, headCenterY - 2, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws expressive La Linea hands with 3-4 small finger lines.
 */
function drawHand(ctx, x, y, dir, scale) {
  const s = scale || 1;
  ctx.lineWidth = 2;

  // 3 small finger lines fanning out
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    const angle = (dir > 0 ? 0 : Math.PI) + i * 0.4;
    ctx.lineTo(
      x + Math.cos(angle) * 5 * s,
      y + Math.sin(angle) * 5 * s - 2 * s
    );
    ctx.stroke();
  }

  // Restore line width
  ctx.lineWidth = 3.5;
}
