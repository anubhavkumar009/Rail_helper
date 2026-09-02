import React, { useState, useEffect } from 'react';
import { Search, Clock, MapPin, Train, ArrowRight, AlertTriangle, RefreshCw, Filter, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api, formatMinutesToTime, POPULAR_TRAINS } from '../api';
import { cacheUtil } from '../utils/cache';

export default function TrainSchedule({ initialTrainNumber }) {
  // Load previously searched schedule from session storage (persists on tab switch)
  const cachedSchedule = cacheUtil.get('schedule_last');
  const [trainNumber, setTrainNumber] = useState(
    initialTrainNumber || cachedSchedule?.trainNumber || '22436'
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(cachedSchedule?.data || null);
  const [error, setError] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showHaltsOnly, setShowHaltsOnly] = useState(false);

  useEffect(() => {
    if (initialTrainNumber && initialTrainNumber !== trainNumber) {
      setTrainNumber(initialTrainNumber);
    }
  }, [initialTrainNumber]);

  const fetchSchedule = async (noToFetch) => {
    const target = (noToFetch || trainNumber).trim();
    if (!target) {
      setError('Please enter a valid train number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.getTrainSchedule(target);
      if (res && res.data) {
        setData(res.data);
        // Persist in session cache
        cacheUtil.set('schedule_last', {
          trainNumber: target,
          data: res.data,
        });
      } else {
        setError('Schedule could not be loaded for this train.');
      }
    } catch (err) {
      setError('Failed to fetch train schedule.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const train = data?.train || {};
  const route = data?.route || [];

  // Determine stoppage count
  const haltStations = route.filter((st, index) => {
    const isFirst = index === 0;
    const isLast = index === route.length - 1;
    return (
      st.isHalt === true ||
      st.halt === true ||
      st.stopType === 'halt' ||
      st.stopType === 'origin' ||
      st.stopType === 'destination' ||
      isFirst ||
      isLast ||
      (st.scheduledArrival && st.scheduledDeparture && st.scheduledDeparture > st.scheduledArrival)
    );
  });

  const filteredRoute = route.filter((st, index) => {
    const isFirst = index === 0;
    const isLast = index === route.length - 1;
    const isHalt =
      st.isHalt === true ||
      st.halt === true ||
      st.stopType === 'halt' ||
      st.stopType === 'origin' ||
      st.stopType === 'destination' ||
      isFirst ||
      isLast ||
      (st.scheduledArrival && st.scheduledDeparture && st.scheduledDeparture > st.scheduledArrival);

    if (showHaltsOnly && !isHalt) return false;

    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (st.stationName && st.stationName.toLowerCase().includes(q)) ||
      (st.stationCode && st.stationCode.toLowerCase().includes(q))
    );
  });

  const totalDistance = train.distanceKm || (route.length > 0 ? route[route.length - 1].distanceFromSourceKm : 0);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4" />
            <span>Timetable & Stoppage Route Map</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Train Schedule & Stoppages
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Check all scheduled station halts, arrival/departure timings, distances, and stoppage duration.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSchedule();
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
                placeholder="Enter Train Number (e.g. 22436)"
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
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Get Schedule</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="mt-4 flex items-center flex-wrap gap-2">
            <span className="text-xs text-slate-400 mr-1">Popular Trains:</span>
            {POPULAR_TRAINS.map((pt) => (
              <button
                key={pt.number}
                type="button"
                onClick={() => {
                  setTrainNumber(pt.number);
                  setError('');
                }}
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

      {/* Schedule Results */}
      {data && (
        <div className="space-y-6">
          {/* Train Overview Banner */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-mono font-extrabold text-lg border border-orange-500/30">
                    {train.trainNumber || trainNumber}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {train.trainName || 'Express Train'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  Type: <span className="text-slate-200">{train.type || 'Superfast Express'}</span>
                </p>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Total Distance</p>
                  <p className="text-base font-bold text-white font-mono">{totalDistance} KM</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-[10px] uppercase text-emerald-400 font-bold">Official Stoppages</p>
                  <p className="text-base font-bold text-emerald-300 font-mono">{haltStations.length} Halts</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Route Span</p>
                  <p className="text-xs font-semibold text-slate-300 truncate">
                    {train.sourceStationName?.split(' ')[0] || 'Origin'} ➔ {train.destinationStationName?.split(' ')[0] || 'Dest'}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter & Stoppage Toggle Controls */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative max-w-xs w-full">
                  <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter station name or code..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Stoppage Filter Toggle */}
                <button
                  type="button"
                  onClick={() => setShowHaltsOnly(!showHaltsOnly)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
                    showHaltsOnly
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{showHaltsOnly ? 'Showing Halts Only' : 'Highlight Halts / Show All'}</span>
                </button>
              </div>

              <span className="text-xs text-slate-400">
                Showing <strong className="text-white">{filteredRoute.length}</strong> of {route.length} stations
              </span>
            </div>

            {/* Route Halts Table / Timeline */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/60">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Station Name</th>
                    <th className="py-3 px-3 font-mono">Code</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Arr.</th>
                    <th className="py-3 px-3">Dep.</th>
                    <th className="py-3 px-3">Halt Duration</th>
                    <th className="py-3 px-3">Distance</th>
                    <th className="py-3 px-3">Day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {filteredRoute.map((st, index) => {
                    const isFirst = index === 0 && (!showHaltsOnly || st.sequence === 1);
                    const isLast = (index === filteredRoute.length - 1) && (!showHaltsOnly || st.sequence === route.length);
                    const arr = formatMinutesToTime(st.scheduledArrival);
                    const dep = formatMinutesToTime(st.scheduledDeparture);
                    
                    let haltMinutes = 0;
                    if (st.scheduledArrival && st.scheduledDeparture && st.scheduledDeparture >= st.scheduledArrival) {
                      haltMinutes = st.scheduledDeparture - st.scheduledArrival;
                    }

                    const isHalt =
                      st.isHalt === true ||
                      st.halt === true ||
                      st.stopType === 'halt' ||
                      st.stopType === 'origin' ||
                      st.stopType === 'destination' ||
                      isFirst ||
                      isLast ||
                      haltMinutes > 0;

                    const progressPercent = totalDistance > 0 
                      ? Math.min(100, Math.round(((st.distanceFromSourceKm || 0) / totalDistance) * 100))
                      : 0;

                    return (
                      <tr
                        key={st.sequence || index}
                        className={`transition ${
                          isFirst
                            ? 'bg-orange-500/10 border-l-4 border-l-orange-500'
                            : isLast
                            ? 'bg-blue-500/10 border-l-4 border-l-blue-500'
                            : isHalt
                            ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-l-4 border-l-emerald-500/80 font-medium'
                            : 'hover:bg-slate-800/30 opacity-60'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-slate-400">{st.sequence || index + 1}</td>
                        
                        {/* Station Name */}
                        <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                          <div className="flex items-center space-x-2.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                isFirst
                                  ? 'bg-orange-500 ring-4 ring-orange-500/25 animate-pulse'
                                  : isLast
                                  ? 'bg-blue-500 ring-4 ring-blue-500/25'
                                  : isHalt
                                  ? 'bg-emerald-400 ring-4 ring-emerald-500/20'
                                  : 'bg-slate-600'
                              }`}
                            />
                            <span className={isHalt ? 'text-white font-bold' : 'text-slate-400'}>
                              {st.stationName}
                            </span>
                          </div>
                        </td>

                        {/* Station Code */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold border ${
                              isHalt
                                ? 'bg-slate-900 text-orange-400 border-orange-500/30'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            {st.stationCode}
                          </span>
                        </td>

                        {/* Stoppage / Pass Status Highlight */}
                        <td className="py-3 px-3 font-sans">
                          {isFirst ? (
                            <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 text-[10px] font-bold uppercase tracking-wider border border-orange-500/30">
                              Origin
                            </span>
                          ) : isLast ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                              Terminus
                            </span>
                          ) : isHalt ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              <span>Stoppage</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 uppercase">Pass</span>
                          )}
                        </td>

                        {/* Arr / Dep */}
                        <td className="py-3 px-3 text-slate-300">{isFirst ? 'Source' : arr}</td>
                        <td className="py-3 px-3 text-slate-300">{isLast ? 'Terminates' : dep}</td>

                        {/* Halt Duration */}
                        <td className="py-3 px-3">
                          {isFirst || isLast ? (
                            <span className="text-slate-500">--</span>
                          ) : isHalt && haltMinutes > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/60">
                              {haltMinutes} mins
                            </span>
                          ) : isHalt ? (
                            <span className="text-emerald-400 font-semibold">Halt</span>
                          ) : (
                            <span className="text-slate-600">--</span>
                          )}
                        </td>

                        {/* Distance */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-300">{st.distanceFromSourceKm ?? 0} km</span>
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Day */}
                        <td className="py-3 px-3 text-slate-400">Day {st.day || 1}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty Initial State View (0 API Calls on load) */}
      {!data && !loading && (
        <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Explore Train Timetable & Stoppages</h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter a train number and click <strong className="text-orange-400">"Get Schedule"</strong> to inspect scheduled station halts, arrival/departure timings, distances, and stoppage durations.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <span>• Highlighted green rows indicate confirmed commercial stoppages (halts)</span>
          </div>
        </div>
      )}
    </div>
  );
}
