import React, { useState, useEffect } from 'react';
import { Train, Clock, MapPin, Search, ArrowRight, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api';
import { cacheUtil } from '../utils/cache';
import StationAutocomplete from './StationAutocomplete';

export default function StationTrains({ initialStationCode, onCheckLiveStatus }) {
  const cachedStationTrains = cacheUtil.get('station_trains_last');
  const [stationCode, setStationCode] = useState(
    initialStationCode || cachedStationTrains?.stationCode || 'NDLS'
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(cachedStationTrains?.data || null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (initialStationCode) {
      setStationCode(initialStationCode);
    }
  }, [initialStationCode]);

  const fetchStationTrains = async (codeToFetch) => {
    const target = (codeToFetch || stationCode).trim();
    if (!target) {
      setError('Please enter a station code.');
      return;
    }
    setError('');
    setLoading(true);
    setCurrentPage(1);
    try {
      const res = await api.getStationTrains(target);
      if (res && res.data) {
        setData(res.data);
        cacheUtil.set('station_trains_last', {
          stationCode: target,
          data: res.data,
        });
      } else {
        setError('No train schedule found for this station.');
      }
    } catch (err) {
      setError('Failed to fetch station trains.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const station = data?.station || {};
  const trains = data?.trains || [];

  const totalPages = Math.ceil(trains.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentTrains = trains.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Train className="w-4 h-4" />
            <span>Station Stoppage Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Station Trains & Halts
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse all express, passenger, and superfast trains passing through or originating from a station.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchStationTrains();
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
                  <span>Get Trains</span>
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

      {/* Station Results */}
      {data && (
        <div className="space-y-6">
          {/* Station Summary Banner */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="px-3.5 py-2 rounded-xl bg-orange-500/20 text-orange-400 font-mono font-extrabold text-xl border border-orange-500/30">
                {station.code || stationCode}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{station.name || 'Station Information'}</h3>
                {station.city && <p className="text-xs text-slate-400">{station.city}</p>}
              </div>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 self-start sm:self-auto">
              <p className="text-[10px] uppercase text-slate-400 font-bold">Total Passing Trains</p>
              <p className="text-lg font-bold text-orange-400 font-mono">{trains.length} Trains</p>
            </div>
          </div>

          {/* Trains List */}
          <div className="grid grid-cols-1 gap-3">
            {currentTrains.map((item, idx) => {
              const train = item.train || {};
              const stop = item.stop || {};
              const runDays = train.runDays || [];

              return (
                <div
                  key={idx}
                  className="glass-panel hover:border-orange-500/40 rounded-xl p-4 sm:p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 font-mono font-bold text-xs border border-orange-500/30">
                        {train.number || 'N/A'}
                      </span>
                      <h4 className="text-base font-bold text-white">{train.name || 'Train'}</h4>
                      {train.type && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                          {train.type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-2 text-xs text-slate-400">
                      <span>{train.source?.name || 'Origin'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                      <span>{train.destination?.name || 'Destination'}</span>
                      {stop.distance !== undefined && (
                        <span className="text-slate-500">• {stop.distance} km from source</span>
                      )}
                    </div>
                  </div>

                  {/* Timings & Stop Type */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-3 text-xs">
                        {stop.arrival && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">ARR</span>
                            <span className="font-mono font-bold text-slate-200">{stop.arrival}</span>
                          </div>
                        )}
                        {stop.departure && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">DEP</span>
                            <span className="font-mono font-bold text-orange-400">{stop.departure}</span>
                          </div>
                        )}
                      </div>
                      {stop.stopType && (
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold text-slate-400">
                          {stop.stopType}
                        </span>
                      )}
                    </div>

                    {onCheckLiveStatus && train.number && (
                      <button
                        type="button"
                        onClick={() => onCheckLiveStatus(train.number)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition"
                      >
                        Live
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
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
            <Train className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Explore Station Trains Directory</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select or type a railway station code/name above and click <strong className="text-orange-400">"Get Trains"</strong> to view all passing, originating, and terminating express and passenger trains.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
