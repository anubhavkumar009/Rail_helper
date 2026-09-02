import React, { useState } from 'react';
import { ArrowLeftRight, Train, Clock, MapPin, Calendar, AlertTriangle, RefreshCw, Sparkles, Activity } from 'lucide-react';
import { api } from '../api';
import { cacheUtil } from '../utils/cache';
import StationAutocomplete from './StationAutocomplete';

export default function TrainsBetween({ onCheckLiveStatus, onCheckSeats, initialSource, initialDestination }) {
  const cachedBetween = cacheUtil.get('between_last');
  const [source, setSource] = useState(initialSource || cachedBetween?.source || 'NDLS');
  const [destination, setDestination] = useState(initialDestination || cachedBetween?.destination || 'BSB');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(cachedBetween?.data || null);
  const [error, setError] = useState('');

  const fetchTrains = async () => {
    if (!source || !destination) {
      setError('Please select both source and destination stations.');
      return;
    }
    if (source.trim().toUpperCase() === destination.trim().toUpperCase()) {
      setError('Source and Destination cannot be the same station.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.getTrainsBetween(source.trim(), destination.trim());
      if (res && res.data) {
        setData(res.data);
        cacheUtil.set('between_last', {
          source: source.trim(),
          destination: destination.trim(),
          data: res.data,
        });
      } else {
        setError('No trains found between these stations.');
      }
    } catch (err) {
      setError('Failed to search trains. Please verify station codes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const trainsList = data?.trains || [];

  return (
    <div className="space-y-6">
      {/* Search Panel */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Train className="w-4 h-4" />
            <span>Route Journey Planner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Find Trains Between Stations
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Search direct trains, departure & arrival timings, running days, and total stoppage counts.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTrains();
            }}
            className="mt-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end">
              {/* Source Station */}
              <div className="md:col-span-5">
                <StationAutocomplete
                  label="From Station"
                  value={source}
                  onChange={setSource}
                  placeholder="Enter Source Code or City"
                  required
                />
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center pb-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-orange-300 border border-slate-700 transition shadow-md"
                  title="Swap Stations"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* Destination Station */}
              <div className="md:col-span-5">
                <StationAutocomplete
                  label="To Station"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Enter Destination Code or City"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              {/* Popular Routes */}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className="text-slate-400">Popular Routes:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSource('NDLS');
                    setDestination('MMCT');
                  }}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-orange-400 border border-slate-700"
                >
                  Delhi ➔ Mumbai
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSource('NDLS');
                    setDestination('BSB');
                  }}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-orange-400 border border-slate-700"
                >
                  Delhi ➔ Varanasi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSource('NDLS');
                    setDestination('HWH');
                  }}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-orange-400 border border-slate-700"
                >
                  Delhi ➔ Kolkata
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-7 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching Trains...</span>
                  </>
                ) : (
                  <>
                    <Train className="w-4 h-4" />
                    <span>Find Trains</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Train Results List */}
      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Available Trains ({data.count || trainsList.length})
            </h3>
            <span className="text-xs text-slate-400">
              Route: <strong className="text-orange-400 font-mono">{source}</strong> to{' '}
              <strong className="text-orange-400 font-mono">{destination}</strong>
            </span>
          </div>

          {trainsList.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center text-slate-400 text-sm">
              No direct trains found between {source} and {destination}.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {trainsList.map((t, idx) => {
                const train = t.train || {};
                const from = t.from || {};
                const to = t.to || {};
                const runDays = train.runDays || [];

                return (
                  <div
                    key={idx}
                    className="glass-panel hover:border-orange-500/40 rounded-2xl p-5 sm:p-6 transition-all duration-200 space-y-4 shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Train Name & Number */}
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-mono font-bold text-sm border border-orange-500/30">
                            {train.number}
                          </span>
                          <h4 className="text-lg font-bold text-white">{train.name}</h4>
                          {train.type && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold">
                              {train.type}
                            </span>
                          )}
                        </div>
                        
                        {/* Running Days */}
                        <div className="flex items-center space-x-1 mt-2.5">
                          <span className="text-[11px] text-slate-400 mr-1.5">Runs on:</span>
                          {DAYS.map((d) => {
                            const isRunning = runDays.some(
                              (rd) => rd.toUpperCase().includes(d) || rd.toUpperCase() === 'DAILY'
                            );
                            return (
                              <span
                                key={d}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  isRunning
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-900 text-slate-600'
                                }`}
                              >
                                {d[0]}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Journey Metrics */}
                      <div className="flex items-center space-x-6 text-slate-300">
                        {/* Origin */}
                        <div>
                          <p className="text-base font-bold text-white font-mono">{from.departure || '--:--'}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[120px]">{from.name || source}</p>
                          {from.city && <p className="text-[10px] text-slate-500">{from.city}</p>}
                        </div>

                        {/* Divider with duration & halts */}
                        <div className="flex flex-col items-center px-2">
                          <span className="text-[11px] font-mono text-slate-400">{t.duration || 'Direct'}</span>
                          <div className="w-20 sm:w-28 h-0.5 bg-slate-700 relative my-1.5">
                            <div className="w-2 h-2 rounded-full bg-orange-500 absolute -top-[3px] left-1/2 -translate-x-1/2" />
                          </div>
                          <span className="text-[10px] text-slate-400">{t.totalHaltsBetween ?? '--'} Halts</span>
                        </div>

                        {/* Destination */}
                        <div>
                          <p className="text-base font-bold text-white font-mono">{to.arrival || '--:--'}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[120px]">{to.name || destination}</p>
                          {to.city && <p className="text-[10px] text-slate-500">{to.city}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                      <span className="text-slate-400 font-mono">
                        Distance: <strong className="text-slate-200">{t.distance || '--'} KM</strong>
                      </span>

                      <div className="flex items-center space-x-2">
                        {onCheckLiveStatus && (
                          <button
                            type="button"
                            onClick={() => onCheckLiveStatus(train.number)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center space-x-1.5"
                          >
                            <Activity className="w-3.5 h-3.5 text-orange-400" />
                            <span>Live Status</span>
                          </button>
                        )}
                        {onCheckSeats && (
                          <button
                            type="button"
                            onClick={() => onCheckSeats(train.number, source, destination)}
                            className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold transition flex items-center space-x-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Check Seats</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <h3 className="text-lg font-bold text-white">Find Trains on Any Route</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select origin and destination stations above and click <strong className="text-orange-400">"Find Trains"</strong> to view direct trains, departure timings, and running days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
