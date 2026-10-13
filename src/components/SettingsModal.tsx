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

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Base Game Speed</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['CASUAL', 'NORMAL', 'TURBO', 'EXTREME'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => onUpdateSettings({ difficulty: diff })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium capitalize transition-all ${
                  settings.difficulty === diff
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff.toLowerCase()}
              </button>
            ))}
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
