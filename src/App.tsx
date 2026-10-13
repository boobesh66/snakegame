/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSnakeGame } from './hooks/useSnakeGame';
import { SnakeCanvas } from './components/SnakeCanvas';
import { TouchControls } from './components/TouchControls';
import { GameHeader } from './components/GameHeader';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { ThemesModal } from './components/ThemesModal';
import { SettingsModal } from './components/SettingsModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { StatsPanel } from './components/StatsPanel';
import { THEMES, DEFAULT_THEME_ID } from './utils/themes';
import { sound } from './utils/audio';
import { setHapticsEnabled } from './utils/haptics';
import { loadSettings, saveSettings, loadGameStats } from './utils/storage';
import { ControlSettings, Direction } from './types/game';
import { Trophy, HelpCircle, Palette, Sparkles, Smartphone, Keyboard, ShieldAlert } from 'lucide-react';

import heroBannerImg from './assets/images/arcade_snake_hero_1791877027887.jpg';
import snakeMascotImg from './assets/images/snake_badge_mascot_1791877027128.jpg';

export default function App() {
  const [settings, setSettings] = useState<ControlSettings>(loadSettings);
  const [stats, setStats] = useState(loadGameStats);

  // Active modals
  const [showThemesModal, setShowThemesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Game Engine
  const {
    snake,
    direction,
    foodItems,
    obstacles,
    gameStatus,
    score,
    highScore,
    combo,
    comboExpiry,
    activePowerUp,
    survivalTime,
    particles,
    scorePopups,
    changeDirection,
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    resetGame,
  } = useSnakeGame(settings.gameMode, settings.difficulty);

  // Active Theme
  const currentTheme = THEMES[settings.themeId] || THEMES[DEFAULT_THEME_ID];

  // Sync settings updates
  const handleUpdateSettings = (newSettings: Partial<ControlSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      if (typeof newSettings.soundEnabled === 'boolean') {
        sound.setMuted(!newSettings.soundEnabled);
      }
      if (typeof newSettings.hapticsEnabled === 'boolean') {
        setHapticsEnabled(newSettings.hapticsEnabled);
      }
      return updated;
    });
  };

  const handleToggleSound = () => {
    handleUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleSelectTheme = (themeId: string) => {
    handleUpdateSettings({ themeId });
  };

  // Keyboard navigation & game controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when modal inputs or forms might be open
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      // Direction keys
      let newDir: Direction | null = null;
      if (e.key === 'ArrowUp' || key === 'w') newDir = 'UP';
      else if (e.key === 'ArrowDown' || key === 's') newDir = 'DOWN';
      else if (e.key === 'ArrowLeft' || key === 'a') newDir = 'LEFT';
      else if (e.key === 'ArrowRight' || key === 'd') newDir = 'RIGHT';

      if (newDir) {
        e.preventDefault();
        changeDirection(newDir);
        return;
      }

      // Space or P to Pause / Resume
      if (e.key === ' ' || key === 'p') {
        e.preventDefault();
        if (gameStatus === 'GAME_OVER') {
          resetGame();
        } else {
          togglePause();
        }
        return;
      }

      // R to Restart
      if (key === 'r') {
        e.preventDefault();
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, togglePause, resetGame, gameStatus]);

  // Refresh lifetime stats on game over or periodically
  useEffect(() => {
    if (gameStatus === 'GAME_OVER') {
      setStats(loadGameStats());
    }
  }, [gameStatus]);

  // Handle start or resume from canvas click
  const handleStartOrResume = useCallback(() => {
    if (gameStatus === 'READY') {
      startGame();
    } else if (gameStatus === 'PAUSED') {
      resumeGame();
    }
  }, [gameStatus, startGame, resumeGame]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Bar Navigation */}
      <GameHeader
        onNewRun={resetGame}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenThemes={() => setShowThemesModal(true)}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenHelp={() => setShowGuideModal(true)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Game Arena & Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
        {/* Left Column (Desktop Stats & Info Card) */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
          {/* Brand Card with Generated Artwork */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-32 w-full overflow-hidden bg-slate-950">
              <img
                src={heroBannerImg}
                alt="PLAY TO PLAY Arcade Snake"
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src={snakeMascotImg}
                  alt="Snake Mascot"
                  className="w-8 h-8 rounded-lg object-cover border border-emerald-500/40"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">PLAY TO PLAY</h3>
                  <p className="text-[11px] text-emerald-400">Next-Gen Snake Arcade</p>
                </div>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2.5">
                Full dual-control support: touch swipe gestures, on-screen thumb buttons, and desktop WASD / Arrow keys.
              </div>
            </div>
          </div>

          {/* Quick Mode & Speed Switcher */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Game Mode</span>
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Settings
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800/60">
              {(['CLASSIC', 'WRAP', 'OBSTACLES'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    handleUpdateSettings({ gameMode: m });
                    resetGame();
                  }}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                    settings.gameMode === m
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'CLASSIC' ? 'Classic' : m === 'WRAP' ? 'Wrap' : 'Obstacles'}
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-slate-300 pt-1">Difficulty Speed</div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800/60">
              {(['CASUAL', 'NORMAL', 'TURBO', 'EXTREME'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    handleUpdateSettings({ difficulty: d });
                  }}
                  className={`py-1.5 text-[10px] font-semibold rounded-lg capitalize transition-all ${
                    settings.difficulty === d
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Controls Quick Reminder */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <Keyboard className="w-4 h-4" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Move</span>
                <span className="font-mono text-slate-200">WASD / Arrow Keys</span>
              </div>
              <div className="flex justify-between">
                <span>Pause</span>
                <span className="font-mono text-slate-200">Space or P</span>
              </div>
              <div className="flex justify-between">
                <span>Restart</span>
                <span className="font-mono text-slate-200">R</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Game Arena Column */}
        <section className="flex flex-col items-center w-full max-w-[540px]">
          {/* HUD Scores & Progress Bar */}
          <GameHUD
            score={score}
            highScore={highScore}
            snakeLength={snake.length}
            combo={combo}
            comboExpiry={comboExpiry}
            activePowerUp={activePowerUp}
            mode={settings.gameMode}
            difficulty={settings.difficulty}
            survivalTime={survivalTime}
          />

          {/* Canvas Arena */}
          <SnakeCanvas
            snake={snake}
            direction={direction}
            foodItems={foodItems}
            obstacles={obstacles}
            activePowerUp={activePowerUp}
            particles={particles}
            scorePopups={scorePopups}
            theme={currentTheme}
            gameStatus={gameStatus}
            onDirectionChange={changeDirection}
            onStartOrResume={handleStartOrResume}
            swipeSensitivity={settings.swipeSensitivity}
          />

          {/* Mobile Touch Controls (D-Pad & Actions) */}
          <div className="w-full">
            <TouchControls
              currentDirection={direction}
              gameStatus={gameStatus}
              onDirectionPress={changeDirection}
              onTogglePause={togglePause}
              onReset={resetGame}
              visible={settings.touchMode !== 'SWIPE_ONLY'}
            />
          </div>

          {/* Quick Mobile Action Bar (Help, Themes, Stats) */}
          <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-400 md:hidden">
            <button
              type="button"
              onClick={() => setShowThemesModal(true)}
              className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Themes</span>
            </button>
            <button
              type="button"
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Stats</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Controls</span>
            </button>
          </div>
        </section>

        {/* Right Column (Desktop Powerups & Mini Leaderboard) */}
        <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
          {/* Powerups Reference Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Power-Up Guide</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Apple</span>
                  <p className="text-[11px] text-slate-400">+10 pts · Boosts combo</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Golden Starfruit</span>
                  <p className="text-[11px] text-slate-400">+50 pts · Expiring bonus</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <div className="w-3.5 h-3.5 rounded-full bg-orange-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Speed Chilli</span>
                  <p className="text-[11px] text-slate-400">+30 pts · 2x Multiplier sprint</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <div className="w-3.5 h-3.5 rounded-full bg-sky-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Frost Berry</span>
                  <p className="text-[11px] text-slate-400">+25 pts · Slow-motion precision</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <div className="w-3.5 h-3.5 rounded-full bg-purple-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Ghost Orb</span>
                  <p className="text-[11px] text-slate-400">+40 pts · Phase through walls</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Best Runs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Recent Records</span>
              </div>
              <button
                type="button"
                onClick={() => setShowStatsModal(true)}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                View All
              </button>
            </div>

            {stats.recentScores.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Play your first run to populate records!
              </p>
            ) : (
              <div className="space-y-1.5 text-xs">
                {stats.recentScores.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/60"
                  >
                    <span className="font-bold text-white tabular-nums">{item.score} pts</span>
                    <span className="text-[11px] text-slate-400 capitalize">{item.mode.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Footer strictly adhering to Anti-Slop (No fake engines, clean copyright and links) */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PLAY TO PLAY &copy; 2026 · Pure Arcade Snake</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Controls
            </button>
            <button
              type="button"
              onClick={() => setShowThemesModal(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Themes
            </button>
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {gameStatus === 'GAME_OVER' && (
        <GameOverModal
          score={score}
          highScore={highScore}
          snakeLength={snake.length}
          survivalSecs={survivalTime}
          mode={settings.gameMode}
          onRestart={resetGame}
          onOpenThemes={() => setShowThemesModal(true)}
        />
      )}

      {showThemesModal && (
        <ThemesModal
          currentThemeId={settings.themeId}
          onSelectTheme={handleSelectTheme}
          onClose={() => setShowThemesModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showGuideModal && (
        <ControlsGuideModal onClose={() => setShowGuideModal(false)} />
      )}

      {showStatsModal && (
        <StatsPanel stats={stats} onClose={() => setShowStatsModal(false)} />
      )}
    </div>
  );
}
