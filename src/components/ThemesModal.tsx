import React from 'react';
import { THEMES } from '../utils/themes';
import { X, Check } from 'lucide-react';

interface ThemesModalProps {
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
  onClose: () => void;
}

export const ThemesModal: React.FC<ThemesModalProps> = ({
  currentThemeId,
  onSelectTheme,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Visual Themes & Skins</h3>
            <p className="text-xs text-slate-400 mt-0.5">Customize arena background and snake palette</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {Object.values(THEMES).map((theme) => {
            const isSelected = theme.id === currentThemeId;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Visual Palette Preview Bar */}
                <div className="h-10 rounded-xl mb-3 flex items-center px-3 gap-2 overflow-hidden border border-white/10" style={{ backgroundColor: theme.bgColor }}>
                  <div
                    className="w-5 h-5 rounded-full shadow-sm"
                    style={{ backgroundColor: theme.snakeHeadColor }}
                  />
                  <div
                    className="w-4 h-4 rounded-full opacity-80"
                    style={{ backgroundColor: theme.snakeBodyStart }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full opacity-60"
                    style={{ backgroundColor: theme.snakeBodyEnd }}
                  />
                  <div className="ml-auto w-3 h-3 rounded-full bg-red-500" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{theme.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
