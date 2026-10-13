import React from 'react';
import { ControlSettings, Difficulty, GameMode } from '../types/game';
import { X, Volume2, Vibrate, Sliders, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  settings: ControlSettings;
  onUpdateSettings: (newSettings: Partial<ControlSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Game Preferences</h3>
            <p className="text-xs text-slate-400 mt-0.5">Control layouts, audio, and gameplay dynamics</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Control Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Mobile Control Layout</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'SWIPE_AND_DPAD', label: 'Swipe + D-Pad' },
              { id: 'SWIPE_ONLY', label: 'Swipe Only' },
              { id: 'DPAD_ONLY', label: 'D-Pad Only' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onUpdateSettings({ touchMode: option.id as ControlSettings['touchMode'] })}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  settings.touchMode === option.id
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Granular Speed Level & Slider */}
        <div className="space-y-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Snake Speed (Level {settings.speedLevel || 4})</span>
            </label>
            <span className="text-[11px] font-mono text-emerald-400">
              {settings.speedLevel === 1 ? '155ms (Relaxed)' :
               settings.speedLevel === 2 ? '130ms (Casual)' :
               settings.speedLevel === 3 ? '110ms (Moderate)' :
               settings.speedLevel === 4 ? '95ms (Standard)' :
               settings.speedLevel === 5 ? '80ms (Fast)' :
               settings.speedLevel === 6 ? '68ms (Turbo)' :
               settings.speedLevel === 7 ? '54ms (Extreme)' : '42ms (Hyper)'}
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={settings.speedLevel || 4}
            onChange={(e) => {
              const lvl = Number(e.target.value);
              const diff: Difficulty =
                lvl <= 2 ? 'CASUAL' :
                lvl <= 4 ? 'NORMAL' :
                lvl <= 6 ? 'TURBO' : 'EXTREME';
              onUpdateSettings({ speedLevel: lvl, difficulty: diff });
            }}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { lvl: 2, diff: 'CASUAL' as Difficulty, label: 'Casual' },
              { lvl: 4, diff: 'NORMAL' as Difficulty, label: 'Normal' },
              { lvl: 6, diff: 'TURBO' as Difficulty, label: 'Turbo' },
              { lvl: 8, diff: 'EXTREME' as Difficulty, label: 'Extreme' },
            ].map((preset) => (
              <button
                key={preset.lvl}
                type="button"
                onClick={() => onUpdateSettings({ speedLevel: preset.lvl, difficulty: preset.diff })}
                className={`py-1.5 text-xs font-medium rounded-xl border transition-all ${
                  settings.speedLevel === preset.lvl
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Progressive Acceleration Checkbox */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <label className="text-slate-300 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.progressiveSpeed}
                onChange={(e) => onUpdateSettings({ progressiveSpeed: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Progressive Speed Acceleration</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {settings.progressiveSpeed ? 'Speeds up with length' : 'Constant pace'}
            </span>
          </div>
        </div>


        {/* Game Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Game Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CLASSIC', label: 'Classic Walls' },
              { id: 'WRAP', label: 'Wrap Screen' },
              { id: 'OBSTACLES', label: 'Obstacles' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateSettings({ gameMode: m.id as GameMode })}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  settings.gameMode === m.id
                    ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Haptic Toggles */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">Sound Effects</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">Mobile Haptics</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.hapticsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors mt-2"
        >
          Save & Return
        </button>
      </div>
    </div>
  );
};
