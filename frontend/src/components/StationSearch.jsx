import React, { useState } from 'react';
import { Search, MapPin, Building2, CheckCircle2, AlertTriangle, RefreshCw, Radio, Train, Copy, Check } from 'lucide-react';
import { api, POPULAR_STATIONS } from '../api';

export default function StationSearch({ onViewLiveBoard, onViewStationTrains }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState(POPULAR_STATIONS);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const handleSearch = async (qToSearch) => {
    const target = (qToSearch !== undefined ? qToSearch : query).trim();
    if (!target) {
      setStations(POPULAR_STATIONS);
      return;
    }
    setError('');
    // First search offline database (0 API calls)
    const localRes = api.searchStations(target, 20, false);
    if (localRes && localRes.data && localRes.data.length > 0) {
      setStations(localRes.data);
      return;
    }

    // Only query remote if local has no match and user explicitly clicked search
    setLoading(true);
    try {
      const res = await api.searchStations(target, 20, true);
      if (res && res.data && res.data.length > 0) {
        setStations(res.data);
      } else {
        setStations([]);
        setError(`No stations found matching "${target}"`);
      }
    } catch (err) {
      setError('Failed to search stations.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>Indian Railway Station Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Search Railway Stations & Junctions
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Lookup station codes, city names, divisions, active junction statuses, and direct links to live departure boards.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  // Instant local filter on input change (0 API calls)
                  if (!e.target.value.trim()) {
                    setStations(POPULAR_STATIONS);
                  } else {
                    const local = api.searchStations(e.target.value, 20, false);
                    if (local && local.data) setStations(local.data);
                  }
                }}
                placeholder="Search by Station Name or Code (e.g. NDLS, Mumbai, Howrah)"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-inner"
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
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
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

      {/* Station Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {query ? `Search Results (${stations.length})` : 'Popular Major Junctions'}
          </h3>
        </div>

        {stations.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-slate-400 text-sm">
            No railway stations matched your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((st, idx) => {
              const code = st.code || 'NULL';
              const isCopied = copiedCode === code;

              return (
                <div
                  key={idx}
                  className="glass-panel hover:border-orange-500/40 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-mono font-bold text-sm border border-orange-500/30">
                          {code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCode(code)}
                          className="p-1 text-slate-500 hover:text-slate-200 transition"
                          title="Copy Station Code"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2 group-hover:text-orange-300 transition">
                        {st.name}
                      </h4>
                      {st.city && <p className="text-xs text-slate-400">{st.city}</p>}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => onViewLiveBoard && onViewLiveBoard(code)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center justify-center space-x-1.5"
                    >
                      <Radio className="w-3.5 h-3.5 text-orange-400" />
                      <span>Live Board</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewStationTrains && onViewStationTrains(code)}
                      className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-xs font-semibold text-orange-400 border border-orange-500/30 transition flex items-center justify-center space-x-1.5"
                    >
                      <Train className="w-3.5 h-3.5" />
                      <span>All Trains</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
