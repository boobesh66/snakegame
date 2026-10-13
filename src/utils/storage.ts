import { GameStats, ControlSettings, GameMode } from '../types/game';
import { DEFAULT_THEME_ID } from './themes';

const STATS_KEY = 'play_to_play_stats';
const SETTINGS_KEY = 'play_to_play_settings';

const DEFAULT_STATS: GameStats = {
  highScore: 0,
  totalApplesEaten: 0,
  gamesPlayed: 0,
  maxLength: 3,
  longestSurvivalSecs: 0,
  recentScores: [],
};

const DEFAULT_SETTINGS: ControlSettings = {
  touchMode: 'SWIPE_AND_DPAD',
  swipeSensitivity: 24,
  soundEnabled: true,
  hapticsEnabled: true,
  themeId: DEFAULT_THEME_ID,
  difficulty: 'NORMAL',
  speedLevel: 4,
  progressiveSpeed: true,
  gameMode: 'CLASSIC',
};

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATS, ...parsed };
    }
  } catch {}
  return DEFAULT_STATS;
}

export function saveGameStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function recordGameRun(score: number, mode: GameMode, length: number, survivalSecs: number): GameStats {
  const current = loadGameStats();
  const isNewHigh = score > current.highScore;
  const newHighScore = Math.max(current.highScore, score);
  const newMaxLength = Math.max(current.maxLength, length);
  const newLongestSurvival = Math.max(current.longestSurvivalSecs, survivalSecs);
  
  const updatedHistory = [
    {
      score,
      mode,
      length,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    ...current.recentScores.slice(0, 9),
  ];

  const updated: GameStats = {
    highScore: newHighScore,
    totalApplesEaten: current.totalApplesEaten + (length > 3 ? length - 3 : 0),
    gamesPlayed: current.gamesPlayed + 1,
    maxLength: newMaxLength,
    longestSurvivalSecs: newLongestSurvival,
    recentScores: updatedHistory,
  };

  saveGameStats(updated);
  return updated;
}

export function loadSettings(): ControlSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ControlSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
