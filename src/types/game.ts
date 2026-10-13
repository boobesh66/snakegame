export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Coordinate {
  x: number;
  y: number;
}

export type FoodType = 'APPLE' | 'GOLDEN_STAR' | 'SPEED_CHILLI' | 'FROST_BERRY' | 'GHOST_ORB';

export interface FoodItem {
  id: string;
  x: number;
  y: number;
  type: FoodType;
  points: number;
  expiresAt?: number; // timestamp when temporary bonus disappears
  durationMs?: number; // total duration for countdown ring
  powerUpEffect?: {
    type: 'SPEED' | 'SLOW' | 'GHOST';
    durationSeconds: number;
  };
}

export type GameMode = 'CLASSIC' | 'WRAP' | 'OBSTACLES';

export type Difficulty = 'CASUAL' | 'NORMAL' | 'TURBO' | 'EXTREME';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  bgColor: string;
  gridLineColor: string;
  arenaBorderColor: string;
  snakeHeadColor: string;
  snakeBodyStart: string;
  snakeBodyEnd: string;
  snakeGlowColor: string;
  eyeColor: string;
  accentColor: string;
  obstacleColor: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number; // 0 to 1
  decay: number;
}

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
  durationMs: number;
}

export interface ActivePowerUp {
  type: 'SPEED' | 'SLOW' | 'GHOST';
  expiresAt: number;
  durationSeconds: number;
}

export type GameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface GameStats {
  highScore: number;
  totalApplesEaten: number;
  gamesPlayed: number;
  maxLength: number;
  longestSurvivalSecs: number;
  recentScores: {
    score: number;
    mode: GameMode;
    length: number;
    date: string;
  }[];
}

export interface ControlSettings {
  touchMode: 'SWIPE_AND_DPAD' | 'SWIPE_ONLY' | 'DPAD_ONLY';
  swipeSensitivity: number; // minimum distance in px
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  themeId: string;
  difficulty: Difficulty;
  gameMode: GameMode;
}
