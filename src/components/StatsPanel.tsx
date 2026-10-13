import React from 'react';
import { GameStats } from '../types/game';
import { X, Trophy, Apple, Activity, Award } from 'lucide-react';

interface StatsPanelProps {
  stats: GameStats;
  onClose: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Arcade Records & Stats</h3>
            <p className="text-xs text-slate-400 mt-0.5">Lifetime snake progression on this device</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Metric Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-center">
            <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
            <div className="text-[11px] text-slate-400 uppercase font-medium">All-Time High</div>
            <div className="text-xl font-extrabold text-amber-400 tabular-nums">
              {stats.highScore.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-center">
            <Apple className="w-4 h-4 text-red-400 mx-auto mb-1.5" />
            <div className="text-[11px] text-slate-400 uppercase font-medium">Apples Eaten</div>
            <div className="text-xl font-extrabold text-white tabular-nums">
              {stats.totalApplesEaten.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-center">
            <Award className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
            <div className="text-[11px] text-slate-400 uppercase font-medium">Max Length</div>
            <div className="text-xl font-extrabold text-white tabular-nums">
              {stats.maxLength}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-center">
            <Activity className="w-4 h-4 text-sky-400 mx-auto mb-1.5" />
            <div className="text-[11px] text-slate-400 uppercase font-medium">Total Runs</div>
            <div className="text-xl font-extrabold text-white tabular-nums">
              {stats.gamesPlayed}
            </div>
          </div>
        </div>

        {/* Recent Runs History */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">Recent Runs</div>
          {stats.recentScores.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/40">
              No completed runs recorded yet. Start playing!
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {stats.recentScores.map((run, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 tabular-nums">#{idx + 1}</span>
                    <span className="font-bold text-white tabular-nums">{run.score.toLocaleString()} pts</span>
                    <span className="text-slate-500 capitalize">({run.mode.toLowerCase()})</span>
                  </div>
                  <div className="text-right text-slate-400 tabular-nums">
                    <span>Len: {run.length}</span>
                    <span className="mx-1 text-slate-600">·</span>
                    <span>{run.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
