import React from 'react';
import { X, Smartphone, Keyboard, Sparkles } from 'lucide-react';

interface ControlsGuideModalProps {
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">How to Play & Controls</h3>
            <p className="text-xs text-slate-400 mt-0.5">Optimized for mobile touch gestures and desktop keys</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Mobile Touch Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Touch Controls</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-400 shrink-0">Swipe Gestures:</span>
              <span>Swipe your thumb anywhere across the arena grid in any direction (Up, Down, Left, Right). You can drag smoothly without lifting your finger to make quick consecutive turns.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-400 shrink-0">On-Screen D-Pad:</span>
              <span>Use the ergonomic 4-way direction buttons below the grid for tactile, precise thumb control.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-400 shrink-0">Pause / Resume:</span>
              <span>Tap the pause button or tap directly on the arena surface to toggle pause.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Desktop Keyboard */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <Keyboard className="w-4 h-4" />
            <span>Desktop Keyboard Controls</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="font-semibold text-white mb-1">Directional Keys</div>
              <p className="text-slate-400">Arrow Keys (<kbd className="text-white font-mono">↑</kbd>, <kbd className="text-white font-mono">↓</kbd>, <kbd className="text-white font-mono">←</kbd>, <kbd className="text-white font-mono">→</kbd>) or <kbd className="text-white font-mono">W</kbd>, <kbd className="text-white font-mono">A</kbd>, <kbd className="text-white font-mono">S</kbd>, <kbd className="text-white font-mono">D</kbd></p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="font-semibold text-white mb-1">Pause & Quick Restart</div>
              <p className="text-slate-400"><kbd className="text-white font-mono">Space</kbd> or <kbd className="text-white font-mono">P</kbd> to Pause. <kbd className="text-white font-mono">R</kbd> to Restart run.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Food & Power-ups */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Power-Up Fruits & Bonuses</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <div className="w-4 h-4 rounded-full bg-red-500 shrink-0 shadow-sm" />
              <div>
                <span className="font-bold text-white">Classic Apple (+10 pts)</span>
                <span className="text-slate-400 block">Increases snake length and fuels combo streak.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <div className="w-4 h-4 rounded-full bg-amber-400 shrink-0 shadow-sm" />
              <div>
                <span className="font-bold text-white">Golden Starfruit (+50 pts)</span>
                <span className="text-slate-400 block">Disappears after 8 seconds. Grants big bonus points!</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <div className="w-4 h-4 rounded-full bg-orange-500 shrink-0 shadow-sm" />
              <div>
                <span className="font-bold text-white">Speed Chilli (+30 pts)</span>
                <span className="text-slate-400 block">6 seconds of hyper speed and automatic 2X score multiplier.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <div className="w-4 h-4 rounded-full bg-sky-400 shrink-0 shadow-sm" />
              <div>
                <span className="font-bold text-white">Frost Berry (+25 pts)</span>
                <span className="text-slate-400 block">6 seconds of slow-motion precision for navigating tight spots.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <div className="w-4 h-4 rounded-full bg-purple-500 shrink-0 shadow-sm" />
              <div>
                <span className="font-bold text-white">Ghost Orb (+40 pts)</span>
                <span className="text-slate-400 block">6 seconds to phase harmlessly through boundaries and obstacles.</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors"
        >
          Got It, Let's Play
        </button>
      </div>
    </div>
  );
};
