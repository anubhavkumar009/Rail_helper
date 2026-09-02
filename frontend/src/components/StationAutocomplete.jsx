import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { api, POPULAR_STATIONS } from '../api';

export default function StationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter Station Name or Code...',
  label,
  required = false,
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Instant local station filter (0 API calls)
    const res = api.searchStations(query, 8, false);
    if (res && res.data) {
      setSuggestions(res.data);
    }
  }, [query]);

  const handleSelect = (station) => {
    setQuery(station.code);
    onChange(station.code, station);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-orange-400">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <MapPin className="w-4 h-4 text-orange-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            onChange(e.target.value.toUpperCase());
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition shadow-inner"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#111928] border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {isLoading && (
            <div className="p-3 text-xs text-slate-400 flex items-center justify-center space-x-2">
              <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span>Searching stations...</span>
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <ul className="divide-y divide-slate-800">
              {suggestions.map((st, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(st)}
                  className="px-3.5 py-2.5 hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-mono font-bold text-xs border border-orange-500/30">
                      {st.code}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-orange-300 transition">
                        {st.name}
                      </p>
                      {st.city && <p className="text-xs text-slate-400">{st.city}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-300 uppercase">Select</span>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-3 text-xs text-slate-400 text-center">
              No matching stations found. You can still use <span className="text-orange-400 font-bold font-mono">"{query}"</span> as code.
            </div>
          )}

          {/* Quick Popular Station Presets */}
          {suggestions.length === 0 && query.length < 2 && (
            <div className="p-2.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Popular Major Stations
              </p>
              <div className="grid grid-cols-2 gap-1">
                {POPULAR_STATIONS.map((ps) => (
                  <button
                    key={ps.code}
                    type="button"
                    onClick={() => handleSelect(ps)}
                    className="text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span className="font-semibold">{ps.name}</span>
                    <span className="font-mono text-orange-400 text-[11px]">{ps.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
