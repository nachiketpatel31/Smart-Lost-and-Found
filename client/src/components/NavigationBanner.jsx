import React from 'react';
import { Navigation, CheckCircle2, Square, AlertCircle, Compass } from 'lucide-react';

const NavigationBanner = ({
  active,
  distanceMeters,
  durationMinutes,
  isArrived,
  isRouteFallback,
  isFollowingUser = true,
  onRecenter,
  onEndNavigation
}) => {
  if (!active) return null;

  // Format Distance (e.g. 🚶 240 m or 1.2 km)
  const formattedDistance =
    distanceMeters >= 1000
      ? `🚶 ${(distanceMeters / 1000).toFixed(1)} km`
      : `🚶 ${Math.round(distanceMeters)} m`;

  // Format Walking Time (e.g. ⏱️ ~3 min walk)
  const formattedTime = `⏱️ ~${Math.max(1, Math.round(durationMinutes))} min walk`;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-indigo-500/30 space-y-3 sm:space-y-4 animate-fadeIn">
      {/* Top Header bar with status indicator & touch-friendly controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" /> Live Foreground Navigation
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onRecenter}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
              isFollowingUser
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-amber-300" /> 📍 Center on Location
          </button>
          <button
            type="button"
            onClick={onEndNavigation}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            <Square className="w-3.5 h-3.5 fill-current" /> ⏹️ End Navigation
          </button>
        </div>
      </div>

      {/* Arrival Alert Notice vs Distance/ETA display */}
      {isArrived ? (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center gap-2.5 text-emerald-200 text-xs font-bold animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>✅ You have reached the reported location area.</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {formattedDistance}
              </span>
              <span className="text-sm sm:text-base font-semibold text-amber-300">
                {formattedTime}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <span>🔵 You</span>
              <span className="text-slate-500 font-mono">━━━━ Walking Path ━━━━</span>
              <span>📍 Item Location</span>
            </p>
          </div>
        </div>
      )}

      {/* Fallback Notice */}
      {isRouteFallback && !isArrived && (
        <div className="text-[11px] text-amber-300/90 italic flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>Route overlay is an approximation. Displaying direct pedestrian distance & ETA.</span>
        </div>
      )}
    </div>
  );
};

export default NavigationBanner;
