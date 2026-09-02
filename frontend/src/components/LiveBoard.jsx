import React, { useState, useEffect } from 'react';
import { Wifi, Clock, Train, MapPin, AlertTriangle, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { api } from '../api';
import { cacheUtil } from '../utils/cache';
import StationAutocomplete from './StationAutocomplete';

export default function LiveBoard({ initialStationCode, onCheckLiveStatus }) {
  const cachedBoard = cacheUtil.get('board_last');
  const [stationCode, setStationCode] = useState(
    initialStationCode || cachedBoard?.stationCode || 'NDLS'
  );
  const [hours, setHours] = useState(cachedBoard?.hours || 4);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(cachedBoard?.data || null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (initialStationCode) {
      setStationCode(initialStationCode);
    }
  }, [initialStationCode]);

  const fetchLiveBoard = async (codeToFetch, hoursToFetch) => {
    const target = (codeToFetch || stationCode).trim();
    if (!target) {
      setError('Please select or enter a station code.');
      return;
    }
    setError('');
    setLoading(true);
    setCurrentPage(1);
    try {
      const hoursToUse = hoursToFetch || hours;
      const res = await api.getStationLiveBoard(target, hoursToUse);
      if (res && res.data) {
        setData(res.data);
        cacheUtil.set('board_last', {
          stationCode: target,
          hours: hoursToUse,
          data: res.data,
        });
      } else {
        setError('No live departure data available for this station.');
      }
    } catch (err) {
      setError('Failed to fetch station live board.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const station = data?.station || {};
  const windowObj = data?.window || {};
  const trains = data?.trains || [];

  const totalPages = Math.ceil(trains.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentTrains = trains.slice(startIndex, startIndex + pageSize);

  const formatExpectedTime = (isoString) => {
    if (!isoString) return null;
    try {
      return isoString.split('T')[1].split('+')[0];
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Digital Platform Display Screen</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Station Live Departure & Arrival Board
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time digital board showing expected arrival/departure timings, platform numbers, and live delay tags.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchLiveBoard();
            }}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <StationAutocomplete
                value={stationCode}
                onChange={setStationCode}
                placeholder="Enter Station Code or City (e.g. NDLS)"
              />
            </div>
            
            <select
              value={hours}
              onChange={(e) => {
                setHours(Number(e.target.value));
              }}
              className="px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value={2}>Next 2 Hours</option>
              <option value={4}>Next 4 Hours</option>
              <option value={8}>Next 8 Hours</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>View Live Board</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Board Display */}
      {data && (
        <div className="space-y-4">
          {/* Station Display Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-[#0a1324] to-slate-950 rounded-2xl p-6 border-2 border-amber-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-extrabold text-amber-400 text-xl">
                {station.code || stationCode}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-white tracking-wide uppercase">
                    {station.name || 'Station Board'}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-xs text-slate-400">
                  Time Window: <span className="text-amber-400 font-mono">{windowObj.from || '--:--'}</span> to{' '}
                  <span className="text-amber-400 font-mono">{windowObj.to || '--:--'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">Total Trains</span>
                <span className="text-sm font-bold text-white">{trains.length}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchLiveBoard()}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition flex items-center space-x-1.5"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Electronic Display Cards / Table */}
          <div className="grid grid-cols-1 gap-3">
            {currentTrains.map((item, idx) => {
              const train = item.train || {};
              const stop = item.stop || {};
              const live = item.live || {};
              const delay = live.delayMinutes;
              const expectedArr = formatExpectedTime(live.expectedArrivalTime);
              const expectedDep = formatExpectedTime(live.expectedDepartureTime);
              const platform = stop.platform || 'N/A';

              let delayBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
              let delayLabel = 'On Time';

              if (delay !== undefined && delay !== 'N/A') {
                if (delay > 0) {
                  delayBadge = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
                  delayLabel = `Delayed by ${delay}m`;
                } else if (delay < 0) {
                  delayBadge = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
                  delayLabel = `Early by ${Math.abs(delay)}m`;
                }
              }

              return (
                <div
                  key={idx}
                  className="bg-[#0e1626] hover:bg-[#121c30] rounded-xl p-4 sm:p-5 border border-slate-800/90 transition shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Train info */}
                  <div className="flex items-start space-x-3.5">
                    <span className="px-2.5 py-1 rounded bg-slate-900 font-mono font-bold text-orange-400 text-sm border border-slate-700">
                      {train.number}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-bold text-white">{train.name}</h4>
                        {train.type && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                            {train.type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-400 font-mono">
                        <span>Sch Arr: <strong className="text-slate-200">{stop.arrival || '--'}</strong></span>
                        <span>•</span>
                        <span>Sch Dep: <strong className="text-slate-200">{stop.departure || '--'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Expected Timings & Platform */}
                  <div className="flex items-center flex-wrap gap-4">
                    {/* Expected Arrival/Departure */}
                    {(expectedArr || expectedDep) && (
                      <div className="text-xs font-mono">
                        {expectedArr && (
                          <p className="text-slate-400">
                            Exp. Arr: <span className="text-orange-400 font-bold">{expectedArr}</span>
                          </p>
                        )}
                        {expectedDep && (
                          <p className="text-slate-400">
                            Exp. Dep: <span className="text-orange-400 font-bold">{expectedDep}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Platform Badge */}
                    <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono">
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Platform</span>
                      <span className="text-sm font-extrabold text-amber-400">{platform}</span>
                    </div>

                    {/* Delay / Live Status Tag */}
                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${delayBadge}`}>
                      {delayLabel}
                    </div>

                    {onCheckLiveStatus && train.number && (
                      <button
                        type="button"
                        onClick={() => onCheckLiveStatus(train.number)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition"
                      >
                        Track
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Showing {startIndex + 1} - {Math.min(startIndex + pageSize, trains.length)} of {trains.length}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty Initial State View (0 API Calls on load) */}
      {!data && !loading && (
        <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mx-auto flex items-center justify-center">
            <Wifi className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Live Station Departure & Arrival Board</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a station and time window above, then click <strong className="text-orange-400">"View Live Board"</strong> to display the real-time digital LED board with platform numbers and delay status.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <span>• No API calls are consumed until you click "View Live Board"</span>
          </div>
        </div>
      )}
    </div>
  );
}
