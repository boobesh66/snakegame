import React from 'react';
import { GameMode } from '../types/game';
import { Trophy, RotateCcw, ArrowRight } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  snakeLength: number;
  survivalSecs: number;
  mode: GameMode;
  onRestart: () => void;
  onOpenThemes: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  snakeLength,
  survivalSecs,
  mode,
  onRestart,
  onOpenThemes,
}) => {
  const isNewRecord = score >= highScore && score > 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Banner */}
        <div>
          {isNewRecord ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>New Personal Record!</span>
            </div>
          ) : (
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
              Game Over
            </p>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {score.toLocaleString()} <span className="text-lg font-medium text-slate-400">PTS</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-left">
          <div className="p-2.5 rounded-xl bg-slate-950/50">
            <div className="text-[11px] text-slate-400 uppercase font-medium">Length</div>
            <div className="text-lg font-bold text-white tabular-nums">{snakeLength}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50">
            <div className="text-[11px] text-slate-400 uppercase font-medium">Time</div>
            <div className="text-lg font-bold text-white tabular-nums">{formatTime(survivalSecs)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50">
            <div className="text-[11px] text-slate-400 uppercase font-medium">Mode</div>
            <div className="text-lg font-bold text-white capitalize">{mode.toLowerCase()}</div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onRestart}
            autoFocus
            className="w-full h-12 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onOpenThemes}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-medium text-sm flex items-center justify-center gap-2 border border-slate-700/60 active:scale-[0.98] transition-all"
          >
            <span>Change Snake Skin / Theme</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Pro Tip: Use swipe or WASD keys. Press Space to quick-restart.
        </p>
      </div>
    </div>
  );
};
