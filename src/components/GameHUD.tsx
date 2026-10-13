import React, { useEffect, useState } from 'react';
import { ActivePowerUp, GameMode, Difficulty } from '../types/game';
import { Flame, Snowflake, Ghost, Zap } from 'lucide-react';

interface GameHUDProps {
  score: number;
  highScore: number;
  snakeLength: number;
  combo: number;
  comboExpiry: number;
  activePowerUp: ActivePowerUp | null;
  mode: GameMode;
  difficulty: Difficulty;
  speedLevel?: number;
  isBoosting?: boolean;
  currentIntervalMs?: number;
  survivalTime: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  snakeLength,
  combo,
  comboExpiry,
  activePowerUp,
  mode,
  difficulty,
  speedLevel = 4,
  isBoosting = false,
  currentIntervalMs = 95,
  survivalTime,
}) => {
  const [comboPercent, setComboPercent] = useState<number>(0);
  const [powerUpTimeLeft, setPowerUpTimeLeft] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (comboExpiry > now) {
        const remaining = comboExpiry - now;
        setComboPercent(Math.max(0, Math.min(100, (remaining / 4200) * 100)));
      } else {
        setComboPercent(0);
      }

      if (activePowerUp) {
        const remaining = Math.max(0, Math.ceil((activePowerUp.expiresAt - now) / 1000));
        setPowerUpTimeLeft(remaining);
      } else {
        setPowerUpTimeLeft(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [comboExpiry, activePowerUp]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-[540px] mb-3 space-y-2">
      {/* Top Scores & Metrics Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg">
        {/* Current Score */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Score</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Combo Tracker */}
        {combo > 1 && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-xs sm:text-sm animate-bounce">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{combo}X COMBO</span>
            </div>
            <div className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${comboPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* High Score & Survival Time */}
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Best Record</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
            {highScore.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Secondary Clean Metadata Row */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>Mode: <strong className="text-slate-200 capitalize font-medium">{mode.toLowerCase()}</strong></span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <span>Speed:</span>
            {isBoosting ? (
              <span className="text-amber-400 font-bold animate-pulse">⚡ BOOSTING ({currentIntervalMs}ms)</span>
            ) : (
              <strong className="text-emerald-400 font-mono font-medium">
                Lvl {speedLevel} ({currentIntervalMs}ms)
              </strong>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 tabular-nums">
          <span>Length: <strong className="text-slate-200 font-medium">{snakeLength}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Time: <strong className="text-slate-200 font-medium">{formatTime(survivalTime)}</strong></span>
        </div>
      </div>


        <div className="flex items-center gap-2 tabular-nums">
          <span>Length: <strong className="text-slate-200 font-medium">{snakeLength}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Time: <strong className="text-slate-200 font-medium">{formatTime(survivalTime)}</strong></span>
        </div>
      </div>

      {/* Active Power-up alert bar */}
      {activePowerUp && (
        <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-2">
            {activePowerUp.type === 'SPEED' && <Flame className="w-4 h-4 text-orange-400" />}
            {activePowerUp.type === 'SLOW' && <Snowflake className="w-4 h-4 text-sky-400" />}
            {activePowerUp.type === 'GHOST' && <Ghost className="w-4 h-4 text-purple-400" />}
            <span className="font-semibold text-white">
              {activePowerUp.type === 'SPEED' && 'Hyper Speed (2x Multiplier)'}
              {activePowerUp.type === 'SLOW' && 'Frost Slow-Motion'}
              {activePowerUp.type === 'GHOST' && 'Ghost Pass (Phasing Walls)'}
            </span>
          </div>
          <span className="font-mono font-bold text-emerald-400 tabular-nums">
            {powerUpTimeLeft}s
          </span>
        </div>
      )}
    </div>
  );
};
