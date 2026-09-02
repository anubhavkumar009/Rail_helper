import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LiveTrainStatus from './components/LiveTrainStatus';
import TrainSchedule from './components/TrainSchedule';
import TrainsBetween from './components/TrainsBetween';
import SeatAvailability from './components/SeatAvailability';
import StationSearch from './components/StationSearch';
import StationTrains from './components/StationTrains';
import LiveBoard from './components/LiveBoard';
import EmergencyModal from './components/EmergencyModal';
import { 
  Train, 
  ShieldAlert, 
  PhoneCall, 
  HeartPulse, 
  Sparkles, 
  Navigation, 
  Globe, 
  CheckCircle2, 
  ChevronRight,
  HelpCircle,
  Phone
} from 'lucide-react';

import { cacheUtil } from './utils/cache';

export default function App() {
  const [activeTab, setActiveTabState] = useState(() => cacheUtil.get('active_tab') || 'live');
  const [emergencyModalService, setEmergencyModalService] = useState(null);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    cacheUtil.set('active_tab', tabId);
  };

  // Shared state for smooth cross-navigation
  const [selectedTrain, setSelectedTrain] = useState('22436');
  const [selectedSource, setSelectedSource] = useState('NDLS');
  const [selectedDestination, setSelectedDestination] = useState('BSB');
  const [selectedStation, setSelectedStation] = useState('NDLS');

  // Handlers for switching tabs with context
  const handleSelectSchedule = (trainNo) => {
    setSelectedTrain(trainNo);
    setActiveTab('schedule');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckLiveStatus = (trainNo) => {
    setSelectedTrain(trainNo);
    setActiveTab('live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckSeats = (trainNo, src, dst) => {
    setSelectedTrain(trainNo);
    setSelectedSource(src);
    setSelectedDestination(dst);
    setActiveTab('seats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewLiveBoard = (stCode) => {
    setSelectedStation(stCode);
    setActiveTab('board');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewStationTrains = (stCode) => {
    setSelectedStation(stCode);
    setActiveTab('station-trains');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenEmergency={setEmergencyModalService} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dynamic Module Rendering */}
        {activeTab === 'live' && (
          <LiveTrainStatus
            initialTrainNumber={selectedTrain}
            onSelectSchedule={handleSelectSchedule}
          />
        )}

        {activeTab === 'schedule' && (
          <TrainSchedule initialTrainNumber={selectedTrain} />
        )}

        {activeTab === 'between' && (
          <TrainsBetween
            onCheckLiveStatus={handleCheckLiveStatus}
            onCheckSeats={handleCheckSeats}
          />
        )}

        {activeTab === 'seats' && (
          <SeatAvailability
            initialTrainNumber={selectedTrain}
            initialSource={selectedSource}
            initialDestination={selectedDestination}
          />
        )}

        {activeTab === 'search' && (
          <StationSearch
            onViewLiveBoard={handleViewLiveBoard}
            onViewStationTrains={handleViewStationTrains}
          />
        )}

        {activeTab === 'station-trains' && (
          <StationTrains
            initialStationCode={selectedStation}
            onCheckLiveStatus={handleCheckLiveStatus}
          />
        )}

        {activeTab === 'board' && (
          <LiveBoard
            initialStationCode={selectedStation}
            onCheckLiveStatus={handleCheckLiveStatus}
          />
        )}

        {/* Quick Railway Essentials & 24x7 Emergency Helplines */}
        <section className="mt-12 pt-8 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <span>24x7 Emergency Helplines & Railway Essentials</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant one-tap direct calling and emergency response guides for passengers
              </p>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Click any capsule for full IVRS guide & emergency options
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Rail Madad 139 */}
            <div 
              onClick={() => setEmergencyModalService('madad')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setEmergencyModalService('madad')}
              className="glass-card group rounded-xl p-4 flex items-center justify-between border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all flex-shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                      Rail Madad 139
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Unified
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">24x7 Grievance, PNR & Inquiries</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                <a
                  href="tel:139"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white border border-orange-500/30 transition shadow-sm text-xs font-semibold flex items-center space-x-1"
                  title="Direct Dial 139"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Call</span>
                </a>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* 2. Railway Security RPF */}
            <div 
              onClick={() => setEmergencyModalService('security')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setEmergencyModalService('security')}
              className="glass-card group rounded-xl p-4 flex items-center justify-between border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      Railway Security
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      RPF 182/139
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">RPF Police & Emergency Escort</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                <a
                  href="tel:139"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/30 transition shadow-sm text-xs font-semibold flex items-center space-x-1"
                  title="Direct Dial 139 / 182"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Call</span>
                </a>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* 3. Medical Helpline */}
            <div 
              onClick={() => setEmergencyModalService('medical')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setEmergencyModalService('medical')}
              className="glass-card group rounded-xl p-4 flex items-center justify-between border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all flex-shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Medical Helpline
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Doctor on Call
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">On-train Aid & Doctor at Station</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                <a
                  href="tel:139"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 transition shadow-sm text-xs font-semibold flex items-center space-x-1"
                  title="Direct Dial Medical Help"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Call</span>
                </a>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Emergency Modal */}
      <EmergencyModal
        isOpen={Boolean(emergencyModalService)}
        onClose={() => setEmergencyModalService(null)}
        serviceId={emergencyModalService}
      />

      {/* Modern Footer */}
      <footer className="mt-auto bg-[#050a14] border-t border-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold font-mono text-xs border border-orange-500/30">
              MR
            </div>
            <span className="font-semibold text-slate-200">My Rail Helper</span>
            <span>• Converted from Python CLI to React & Tailwind CSS</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>FastAPI Backend Connected</span>
            </span>
            <span>•</span>
            <span>RailRadar v1 API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
