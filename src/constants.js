// ── Game tuning ──
export const MANO_X = 80;
export const BASE_SPEED = 2.0;
export const SPEED_INC = 0.07;
export const MAX_SPEED = 7;
export const DEAD_DURATION = 90;

// ── Difficulty presets (starting speed) ──
export const DIFFICULTIES = {
  easy:   { label: 'Easy',   baseSpeed: 1.5 },
  normal: { label: 'Normal', baseSpeed: 2.0 },
  hard:   { label: 'Hard',   baseSpeed: 3.5 },
};
export const OBS_MIN_GAP = 300;
export const OBS_MAX_GAP = 520;
export const ACTION_WINDOW = 150;
export const GAP_WIDTH = 90;
export const WALL_HEIGHT = 75;
export const WALL_WIDTH = 22;

// ── Visual ──
export const LINE_COLOR = '#ffffff';
export const LINE_WIDTH = 3.5;
export const ROAD_COLOR = '#2a2a2a';
export const ROAD_EDGE = '#3a3a3a';
export const ROAD_MARKING = '#555';
export const SKY_TOP = '#0a0f1a';
export const SKY_BOTTOM = '#1a2540';
export const ACCENT_COLOR = '#ffd54f';

// ── Obstacle config ──
export const BOULDER_RADIUS = 28;
export const OBS_TYPES = ['gap', 'wall', 'bird', 'boulder'];
export const VALID_ACTIONS = {
  gap: ['bridge'],
  wall: ['ladder'],
  boulder: ['smash'],
  bird: ['duck'],
};
