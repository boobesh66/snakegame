import React from 'react';
import { Direction, GameStatus } from '../types/game';
import { triggerHaptic } from '../utils/haptics';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from 'lucide-react';

interface TouchControlsProps {
  currentDirection: Direction;
  gameStatus: GameStatus;
  onDirectionPress: (dir: Direction) => void;
  onTogglePause: () => void;
  onReset: () => void;
  visible: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  currentDirection,
  gameStatus,
  onDirectionPress,
  onTogglePause,
  onReset,
  visible,
}) => {
  if (!visible) return null;

  const handlePress = (dir: Direction, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic('tap');
    onDirectionPress(dir);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 pt-3 pb-2 select-none game-touch-zone">
      <div className="flex items-center justify-between gap-4">
        {/* Quick Function Buttons (Reset & Pause) */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={onTogglePause}
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={gameStatus === 'PLAYING' ? 'Pause Game' : 'Resume Game'}
          >
            {gameStatus === 'PLAYING' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Restart Game"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Ergonomic 4-Way D-Pad Layout */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          {/* UP BUTTON */}
          <button
            type="button"
            onPointerDown={(e) => handlePress('UP', e)}
            className={`absolute top-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-lg ${
              currentDirection === 'UP'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/90'
            }`}
            aria-label="Move Up"
          >
            <ArrowUp className="w-7 h-7" />
          </button>

          {/* LEFT BUTTON */}
          <button
            type="button"
            onPointerDown={(e) => handlePress('LEFT', e)}
            className={`absolute left-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-lg ${
              currentDirection === 'LEFT'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/90'
            }`}
            aria-label="Move Left"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>

          {/* CENTER DOCK / PIVOT */}
          <div className="w-12 h-12 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>

          {/* RIGHT BUTTON */}
          <button
            type="button"
            onPointerDown={(e) => handlePress('RIGHT', e)}
            className={`absolute right-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-lg ${
              currentDirection === 'RIGHT'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/90'
            }`}
            aria-label="Move Right"
          >
            <ArrowRight className="w-7 h-7" />
          </button>

          {/* DOWN BUTTON */}
          <button
            type="button"
            onPointerDown={(e) => handlePress('DOWN', e)}
            className={`absolute bottom-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-lg ${
              currentDirection === 'DOWN'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/90'
            }`}
            aria-label="Move Down"
          >
            <ArrowDown className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] text-slate-400">
        Swipe arena or tap D-pad · Both inputs active
      </div>
    </div>
  );
};
