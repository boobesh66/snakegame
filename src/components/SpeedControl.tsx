import React from 'react';
import { Gauge, Zap, Flame, Turtle, Rabbit } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface SpeedControlProps {
  speedLevel: number; // 1 to 8
  onSpeedLevelChange: (level: number) => void;
  progressiveSpeed: boolean;
  onProgressiveSpeedToggle: (enabled: boolean) => void;
  isBoosting: boolean;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  currentIntervalMs: number;
}

const SPEED_LABELS: Record<number, { name: string; tag: string }> = {
  1: { name: 'Relaxed', tag: '155ms' },
  2: { name: 'Casual', tag: '130ms' },
  3: { name: 'Moderate', tag: '110ms' },
  4: { name: 'Standard', tag: '95ms' },
  5: { name: 'Fast', tag: '80ms' },
  6: { name: 'Turbo', tag: '68ms' },
  7: { name: 'Extreme', tag: '54ms' },
  8: { name: 'Hyper', tag: '42ms' },
};

export const SpeedControl: React.FC<SpeedControlProps> = ({
  speedLevel,
  onSpeedLevelChange,
  progressiveSpeed,
  onProgressiveSpeedToggle,
  isBoosting,
  onBoostStart,
  onBoostEnd,
  currentIntervalMs,
}) => {
  const currentInfo = SPEED_LABELS[speedLevel] || { name: 'Standard', tag: '95ms' };

  const handleLevelSelect = (lvl: number) => {
    triggerHaptic('tap');
    onSpeedLevelChange(lvl);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
      {/* Header with Live Speed Meter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Snake Speed</span>
              <span className="text-emerald-400 tabular-nums font-mono">
                Lvl {speedLevel}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {currentInfo.name} · <span className="tabular-nums font-mono">{currentIntervalMs}ms tick</span>
            </div>
          </div>
        </div>

        {/* Turbo Sprint Trigger (Touch & Desktop) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerHaptic('tap');
            onBoostStart();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onBoostEnd();
          }}
          onPointerLeave={onBoostEnd}
          onPointerCancel={onBoostEnd}
          className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all select-none active:scale-95 shadow-md ${
            isBoosting
              ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400 animate-pulse'
              : 'bg-slate-950/70 hover:bg-slate-800 text-amber-400 border-amber-500/40 hover:border-amber-400'
          }`}
          title="Hold Shift key or hold this button to sprint"
        >
          {isBoosting ? <Flame className="w-3.5 h-3.5 fill-current" /> : <Zap className="w-3.5 h-3.5" />}
          <span>{isBoosting ? 'SPRINTING!' : 'Hold Sprint ⚡'}</span>
        </button>
      </div>

      {/* Granular Speed Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Turtle className="w-3 h-3 text-slate-400" />
            <span>Slow</span>
          </span>
          <span className="flex items-center gap-1">
            <span>Hyper</span>
            <Rabbit className="w-3 h-3 text-emerald-400" />
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={8}
          step={1}
          value={speedLevel}
          onChange={(e) => handleLevelSelect(Number(e.target.value))}
          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
        />

        {/* Tick numbers */}
        <div className="flex justify-between px-1 text-[10px] text-slate-400 font-mono">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleLevelSelect(lvl)}
              className={`hover:text-emerald-400 transition-colors ${
                speedLevel === lvl ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Stepped Quick Presets */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        {[
          { level: 2, label: 'Casual' },
          { level: 4, label: 'Normal' },
          { level: 6, label: 'Turbo' },
          { level: 8, label: 'Insane' },
        ].map((preset) => (
          <button
            key={preset.level}
            type="button"
            onClick={() => handleLevelSelect(preset.level)}
            className={`py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
              speedLevel === preset.level
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Progressive Growth Acceleration Toggle */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <label className="text-slate-300 cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={progressiveSpeed}
            onChange={(e) => onProgressiveSpeedToggle(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span>Auto-accelerate as snake grows</span>
        </label>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {progressiveSpeed ? '+Speed with length' : 'Constant speed'}
        </span>
      </div>
    </div>
  );
};
