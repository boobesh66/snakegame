import React from 'react';
import { Volume2, VolumeX, Settings, HelpCircle, Trophy } from 'lucide-react';

interface GameHeaderProps {
  onNewRun: () => void;
  onOpenSettings: () => void;
  onOpenThemes: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  onNewRun,
  onOpenSettings,
  onOpenThemes,
  onOpenStats,
  onOpenHelp,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-emerald-400 font-extrabold text-lg leading-none">P</span>
            </div>
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-wider text-white whitespace-nowrap uppercase">
            PLAY TO PLAY
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={onOpenThemes}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
          >
            Themes & Skins
          </button>
          <button
            type="button"
            onClick={onOpenStats}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Controls Guide</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Preferences</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action and Quick Audio Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={onNewRun}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap shrink-0"
          >
            New Run
          </button>
        </div>
      </div>
    </header>
  );
};
