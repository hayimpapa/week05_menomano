export const MANO_X = 70;
export const BASE_SPEED = 1.8;
export const SPEED_INC = 0.08;
export const MAX_SPEED = 7;
export const OBS_MIN_GAP = 280;
export const OBS_MAX_GAP = 500;
export const ACTION_WINDOW = 120;
export const GAP_WIDTH = 80;
export const WALL_HEIGHT = 70;
export const WALL_WIDTH = 18;

export const LINE_COLOR = '#e8e8e8';
export const BG_GRAD_TOP = '#16213e';
export const BG_GRAD_BOT = '#0f3460';

export const OBS_TYPES = ['gap', 'wall', 'bird'];
export const VALID_ACTIONS = {
  gap: ['bridge'],
  wall: ['trampoline', 'ladder'],
  bird: ['duck'],
};
