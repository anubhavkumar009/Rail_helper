import React, { useState, useEffect } from 'react';
import { Train, Clock, Wifi, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { api } from '../api';

export default function Navbar({ activeTab, setActiveTab, onOpenEmergency }) {
  const [time, setTime] = useState(new Date());
  const [apiStatus, setApiStatus] = useState({ online: true, hasKey: false });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.checkHealth().then((res) => {
      setApiStatus({
        online: res.status === 'online',
        hasKey: Boolean(res.has_api_key),
      });
    });
  }, []);

  const tabs = [
    { id: 'live', label: 'Live Status', icon: Activity },
    { id: 'schedule', label: 'Train Schedule', icon: Clock },
    { id: 'between', label: 'Trains Between', icon: Train },
    { id: 'seats', label: 'Seat Availability', icon: Sparkles },
    { id: 'search', label: 'Station Search', icon: Train },
    { id: 'station-trains', label: 'Station Trains', icon: Train },
    { id: 'board', label: 'Live Station Board', icon: Wifi },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B1528]/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer" onClick={() => setActiveTab('live')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-blue-600 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
              <Train className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-orange-400 bg-clip-text text-transparent truncate">
                  My Rail Helper
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex-shrink-0">
                  Live V1
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">Your Smart Indian Railway Information Assistant</p>
            </div>
          </div>

          {/* Right side stats & live clock */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Live IST Clock (Hidden on phones, visible on laptops & tablets) */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-orange-400 animate-pulse flex-shrink-0" />
              <span className="whitespace-nowrap">
                {time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}{' '}
                <span className="text-slate-500 text-[10px]">IST</span>
              </span>
            </div>

            {/* Live Now Indicator (Dot only on phones, full text on laptops) */}
            <div 
              className="flex items-center space-x-1.5 sm:space-x-2 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs shadow-inner"
              title="Live Indian Railway Information Service Active"
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              </span>
              <span className="hidden sm:inline font-semibold tracking-wide text-emerald-400 whitespace-nowrap text-xs">
                Live Now
              </span>
            </div>

            {/* Helpline Badge (Hidden on phones, visible on laptops/tablets) */}
            <button
              onClick={() => onOpenEmergency ? onOpenEmergency('madad') : window.location.href = 'tel:139'}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold transition hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              title="Rail Madad 24x7 Helpline (Dial 139)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span>Dial 139</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 sm:pb-0 pt-1 no-scrollbar border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
