import React, { useState } from 'react';
import { Search, Train, MapPin, Clock, ArrowRight, Activity, AlertTriangle, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { api, POPULAR_TRAINS } from '../api';
import { cacheUtil } from '../utils/cache';

export default function LiveTrainStatus({ onSelectSchedule, initialTrainNumber }) {
  const cachedLive = cacheUtil.get('live_last');
  const [trainNumber, setTrainNumber] = useState(
    initialTrainNumber || cachedLive?.trainNumber || '22436'
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(cachedLive?.data || null);
  const [error, setError] = useState('');

  const fetchLiveStatus = async (trainNoToFetch) => {
    const target = (trainNoToFetch || trainNumber).trim();
    if (!target) {
      setError('Please enter a valid train number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.getLiveTrainStatus(target);
      if (res && res.data) {
        setData(res.data);
        cacheUtil.set('live_last', {
          trainNumber: target,
          data: res.data,
        });
      } else {
        setError('Train status information could not be retrieved.');
      }
    } catch (err) {
      setError('Failed to fetch train status. Please check train number.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (no) => {
    setTrainNumber(no);
    setError('');
  };

  // Helper for coach layout render
  const renderCoaches = (coachString) => {
    if (!coachString || coachString === 'Not Available') return null;
    const coaches = coachString.split('-');
    return (
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center space-x-2 mb-2">
          <Layers className="w-4 h-4 text-orange-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Coach Composition / Rake Layout
          </h4>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {coaches.map((c, i) => {
            const isLoco = c.includes('LOCO') || c.includes('ENG');
            const isExec = c.startsWith('E');
            const isAC = c.startsWith('A') || c.startsWith('B') || c.startsWith('M') || c.startsWith('C') || c.startsWith('H');
            const isGen = c.startsWith('GEN') || c.startsWith('GS') || c.startsWith('UR');
            
            let bg = 'bg-slate-800 text-slate-300 border-slate-700';
            if (isLoco) bg = 'bg-rose-900/60 text-rose-300 border-rose-600 font-bold';
            else if (isExec) bg = 'bg-amber-900/50 text-amber-300 border-amber-600 font-semibold';
            else if (isAC) bg = 'bg-blue-900/50 text-blue-300 border-blue-600';
            else if (isGen) bg = 'bg-emerald-900/40 text-emerald-300 border-emerald-700';

            return (
              <div
                key={i}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-md border text-[11px] font-mono text-center shadow-sm ${bg}`}
              >
                {c}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const trainObj = data?.train || {};
  const currentLoc = data?.currentLocation || {};
  const prevHalt = data?.previousHalt || {};
  const nextHalt = data?.nextHalt || {};
  const delay = currentLoc?.delayMinutes ?? 0;

  // Format last updated date time
  const formatDateTime = (isoString) => {
    if (!isoString || isoString === 'Not Available') return 'Recently updated';
    try {
      const parts = isoString.split('T');
      const date = parts[0];
      const time = parts[1] ? parts[1].split('+')[0] : '';
      return `${date} at ${time}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Real-Time GPS Tracking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Train Running Status
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track current station location, delays, upcoming halts, and coach rake position.
          </p>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchLiveStatus();
            }}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Train className="w-5 h-5 text-orange-400" />
              </div>
              <input
                type="text"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="Enter 5-digit Train Number (e.g. 22436)"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 font-mono text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Train</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Trains */}
          <div className="mt-4 flex items-center flex-wrap gap-2">
            <span className="text-xs text-slate-400 mr-1">Popular Trains:</span>
            {POPULAR_TRAINS.map((pt) => (
              <button
                key={pt.number}
                type="button"
                onClick={() => handleQuickSelect(pt.number)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-orange-500/20 hover:text-orange-300 border border-slate-700/80 text-xs font-mono text-slate-300 transition"
              >
                {pt.number} - {pt.name}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Status Result View */}
      {data && (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
            {/* Top Row: Train Number, Name & Delay Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-mono font-extrabold text-lg border border-orange-500/30">
                    {data.trainNumber || trainNumber}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {data.trainName || trainObj.name || 'Express Train'}
                  </h3>
                </div>
                <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {trainObj.type || 'Superfast Express'}
                  </span>
                  {trainObj.category && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {trainObj.category}
                    </span>
                  )}
                  <span>• Last updated: {formatDateTime(data.lastUpdatedAt)}</span>
                </div>
              </div>

              {/* Delay Pill */}
              <div className="flex items-center space-x-3">
                {delay === 0 ? (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider">Running On Time</p>
                      <p className="text-[11px] text-emerald-300/80">0 minutes delay</p>
                    </div>
                  </div>
                ) : delay > 0 ? (
                  <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider">Delayed</p>
                      <p className="text-[11px] text-amber-300/80">By {delay} minutes</p>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-sky-400" />
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider">Ahead of Schedule</p>
                      <p className="text-[11px] text-sky-300/80">By {Math.abs(delay)} minutes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Route & Progress Stepper */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Previous Halt */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Previous Halt
                </span>
                <div className="my-2">
                  <h4 className="text-base font-bold text-slate-200">
                    {prevHalt.stationName || 'Originated Station'}
                  </h4>
                  {prevHalt.stationCode && (
                    <span className="text-xs font-mono text-slate-400">({prevHalt.stationCode})</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Departed: <span className="text-slate-200 font-mono">{prevHalt.departureTime || '--:--'}</span>
                </p>
              </div>

              {/* Current Location */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/15 via-slate-900/80 to-blue-900/20 border border-orange-500/30 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-orange-400 tracking-wider flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    <span>Current Position</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-bold uppercase">
                    {data.status || 'Running'}
                  </span>
                </div>
                <div className="my-2">
                  <h4 className="text-lg font-extrabold text-white">
                    {currentLoc.stationName || 'En-Route'}
                  </h4>
                  {currentLoc.stationCode && (
                    <span className="text-xs font-mono text-orange-300">({currentLoc.stationCode})</span>
                  )}
                </div>
                {currentLoc.speedKmph !== undefined && (
                  <p className="text-xs text-slate-300">
                    Speed: <span className="text-orange-400 font-bold font-mono">{currentLoc.speedKmph} km/h</span>
                  </p>
                )}
              </div>

              {/* Next Halt */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Next Upcoming Halt
                </span>
                <div className="my-2">
                  <h4 className="text-base font-bold text-slate-200">
                    {nextHalt.stationName || 'Destination Station'}
                  </h4>
                  {nextHalt.stationCode && (
                    <span className="text-xs font-mono text-slate-400">({nextHalt.stationCode})</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Expected:{' '}
                  <span className="text-orange-400 font-bold font-mono">
                    {nextHalt.expectedArrival || nextHalt.scheduledArrival || '--:--'}
                  </span>
                </p>
              </div>
            </div>

            {/* Source to Destination Banner */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Source</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {trainObj.source?.name || 'Origin Station'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Destination</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {trainObj.destination?.name || 'Final Terminal'}
                  </p>
                </div>
              </div>

              {onSelectSchedule && (
                <button
                  type="button"
                  onClick={() => onSelectSchedule(data.trainNumber || trainNumber)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-orange-400 hover:text-orange-300 border border-slate-700 transition flex items-center justify-center space-x-1.5 self-start sm:self-auto"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>View Full Schedule Route</span>
                </button>
              )}
            </div>

            {/* Coaches Composition */}
            {renderCoaches(trainObj.coachPosition)}
          </div>
        </div>
      )}

      {/* Empty Initial State View (0 API Calls on load) */}
      {!data && !loading && (
        <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mx-auto flex items-center justify-center">
            <Train className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Ready to Track Train</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select or type a 5-digit Indian Railways train number above and click <strong className="text-orange-400">"Track Train"</strong> to fetch real-time location, delay, and upcoming halt timings.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <span>• No API calls are consumed until you click "Track Train"</span>
          </div>
        </div>
      )}
    </div>
  );
}
