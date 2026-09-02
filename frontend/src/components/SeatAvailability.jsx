import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Train, MapPin, CheckCircle2, AlertCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { api, TRAVEL_CLASSES, QUOTAS } from '../api';
import { cacheUtil } from '../utils/cache';
import StationAutocomplete from './StationAutocomplete';

export default function SeatAvailability({ initialTrainNumber, initialSource, initialDestination }) {
  const cachedSeats = cacheUtil.get('seats_last');

  const [trainNumber, setTrainNumber] = useState(
    initialTrainNumber || cachedSeats?.trainNumber || '22436'
  );
  const [source, setSource] = useState(
    initialSource || cachedSeats?.source || 'NDLS'
  );
  const [destination, setDestination] = useState(
    initialDestination || cachedSeats?.destination || 'BSB'
  );
  
  // Default to tomorrow's date or cached date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [journeyDate, setJourneyDate] = useState(cachedSeats?.journeyDate || defaultDateStr);
  const [classCode, setClassCode] = useState(
    cachedSeats?.classCode || (trainNumber === '22436' ? 'CC' : '3A')
  );
  const [quotaCode, setQuotaCode] = useState(cachedSeats?.quotaCode || 'GN');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(cachedSeats?.data || null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTrainNumber) {
      setTrainNumber(initialTrainNumber);
      if (initialTrainNumber === '22436') setClassCode('CC');
    }
    if (initialSource) setSource(initialSource);
    if (initialDestination) setDestination(initialDestination);
  }, [initialTrainNumber, initialSource, initialDestination]);

  const fetchAvailability = async () => {
    if (!trainNumber || !source || !destination || !journeyDate) {
      setError('Please fill in all search criteria');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.getSeatAvailability(
        trainNumber.trim(),
        source.trim(),
        destination.trim(),
        journeyDate,
        classCode,
        quotaCode
      );
      if (res && res.data && Array.isArray(res.data.calendar) && res.data.calendar.length > 0) {
        setData(res.data);
        setError('');
        cacheUtil.set('seats_last', {
          trainNumber: trainNumber.trim(),
          source: source.trim(),
          destination: destination.trim(),
          journeyDate,
          classCode,
          quotaCode,
          data: res.data,
        });
      } else if (res && res.error) {
        setData(null);
        let msg = typeof res.error === 'string' ? res.error : 'Seat data not available for this selection.';
        if (msg.includes('Class does not exist')) {
          msg += ` (Tip: Train ${trainNumber} may only have ${trainNumber === '22436' ? 'CC / EC' : 'specific classes'}. Try switching the Travel Class)`;
        }
        setError(msg);
      } else {
        setData(null);
        setError('No seat availability records found for the selected date and class.');
      }
    } catch (err) {
      setData(null);
      const backendErr = err?.response?.data?.detail || err?.response?.data?.error;
      let msg = backendErr || 'Failed to check seat availability. Please verify train number, stations, and travel class.';
      if (msg.includes('Class does not exist')) {
        msg += ` (Tip: Train ${trainNumber} may only have ${trainNumber === '22436' ? 'CC / EC' : 'specific classes'}. Try selecting Chair Car CC / EC)`;
      }
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calendar = data?.calendar || [];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>IRCTC Quota & Class Seat Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Seat Availability & Forecast
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Check real-time berths across AC First (1A), 2A, 3A, 3E, Chair Car (CC), Sleeper (SL), and Tatkal quotas.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAvailability();
            }}
            className="mt-6 space-y-4"
          >
            {/* Row 1: Train & Stations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Train Number <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <Train className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    placeholder="e.g. 22436"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <StationAutocomplete
                  label="From Station"
                  value={source}
                  onChange={setSource}
                  placeholder="Source Code (e.g. NDLS)"
                  required
                />
              </div>

              <div>
                <StationAutocomplete
                  label="To Station"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Dest Code (e.g. BSB)"
                  required
                />
              </div>
            </div>

            {/* Row 2: Date, Class & Quota */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Journey Date <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Travel Class
                </label>
                <select
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                >
                  {TRAVEL_CLASSES.map((tc) => (
                    <option key={tc.code} value={tc.code}>
                      {tc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Quota
                </label>
                <select
                  value={quotaCode}
                  onChange={(e) => setQuotaCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                >
                  {QUOTAS.map((q) => (
                    <option key={q.code} value={q.code}>
                      {q.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking Availability...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Check Availability</span>
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

      {/* Calendar Grid View */}
      {data && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white">
                Seat Availability Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Train <strong className="text-orange-400 font-mono">{trainNumber}</strong> • Class:{' '}
                <strong className="text-slate-200">{classCode}</strong> • Quota:{' '}
                <strong className="text-slate-200">{quotaCode}</strong>
              </p>
            </div>

            {/* Status Legend */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Available</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300">RAC</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-300">Waitlist</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {calendar.map((item, idx) => {
              const statusCode = item.statusCode?.toUpperCase() || '';
              const rawStatus = item.status || '';
              const isAvail = statusCode === 'AVAILABLE' || rawStatus.includes('AVAILABLE');
              const isRAC = statusCode === 'RAC' || rawStatus.includes('RAC');
              const isWL = statusCode.includes('WAITLIST') || statusCode === 'WL' || rawStatus.includes('WL') || rawStatus.includes('WAITLIST');

              let borderColor = 'border-slate-800';
              let badgeBg = 'bg-slate-800 text-slate-300';
              let statText = rawStatus || statusCode;
              let subtitle = 'Seat Status';

              if (isAvail) {
                borderColor = 'border-emerald-500/40 hover:border-emerald-500';
                badgeBg = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
                const seats = item.availableSeats ?? (rawStatus.match(/\d+/) ? rawStatus.match(/\d+/)[0] : '');
                statText = seats ? `AVAILABLE ${seats}` : 'AVAILABLE';
                subtitle = 'Confirmed berth guaranteed';
              } else if (isRAC) {
                borderColor = 'border-amber-500/40 hover:border-amber-500';
                badgeBg = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
                const racNum = item.waitlistNumber ?? (rawStatus.match(/\d+/) ? rawStatus.match(/\d+/)[0] : '');
                statText = racNum ? (String(racNum).toUpperCase().startsWith('RAC') ? racNum : `RAC ${racNum}`) : 'RAC';
                subtitle = 'Reserved Against Cancellation';
              } else if (isWL) {
                borderColor = 'border-rose-500/40 hover:border-rose-500';
                badgeBg = 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
                const wlNum = item.waitlistNumber ?? '';
                const wlType = item.waitlistType || 'WL';
                if (wlNum) {
                  if (String(wlNum).toUpperCase().includes('WL') || String(wlNum).toUpperCase().includes('WAITING')) {
                    statText = String(wlNum).toUpperCase();
                  } else {
                    statText = `WAITING ${wlNum}`;
                  }
                } else if (rawStatus) {
                  statText = `WAITING (${rawStatus})`;
                } else {
                  statText = 'WAITLIST';
                }
                subtitle = rawStatus && rawStatus !== statText ? rawStatus : `${wlType} clearance queue`;
              }

              // Pretty Date format: e.g. "02 Sep (Wed)"
              let displayDate = item.rawDate || item.date || 'Date';
              try {
                if (displayDate.includes('-')) {
                  const dObj = new Date(displayDate);
                  if (!isNaN(dObj.getTime())) {
                    displayDate = dObj.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      weekday: 'short',
                    });
                  }
                }
              } catch (e) {
                // Fallback to raw string
              }

              return (
                <div
                  key={idx}
                  className={`glass-panel p-4 rounded-xl border ${borderColor} transition-all duration-200 flex flex-col justify-between space-y-3 shadow-md hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {displayDate}
                    </span>
                    {isAvail ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isRAC ? (
                      <Clock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>

                  <div>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold tracking-wide ${badgeBg}`}>
                      {statText}
                    </span>
                  </div>

                  <p className="text-[10px] font-medium text-slate-400 truncate" title={subtitle}>
                    {subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty Initial State View (0 API Calls on load) */}
      {!data && !loading && (
        <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Check IRCTC Seat Availability</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select train number, route, travel date, class (1A, 2A, 3A, 3E, CC, SL) and quota, then click <strong className="text-orange-400">"Check Availability"</strong> to view multi-day confirmation statuses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
