import React from 'react';
import { Database, AlertTriangle, Radio, Wifi, WifiOff, CloudRain, ShieldCheck } from 'lucide-react';
import { DatabaseState } from '../../server/db';

interface NavbarProps {
  activeTab: 'gis' | 'roads' | 'reports' | 'alerts' | 'weather';
  onSelectTab: (tab: 'gis' | 'roads' | 'reports' | 'alerts' | 'weather') => void;
  onOpenReportModal: () => void;
  onOpenMongoModal: () => void;
  dbState: DatabaseState | null;
  isOnline: boolean;
  offlineReportsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenReportModal,
  onOpenMongoModal,
  dbState,
  isOnline,
  offlineReportsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 px-4 lg:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-600/30 text-white">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <a href="#" className="text-base lg:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              NER Drishti
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                AI Landslide EWDS
              </span>
            </a>
            <p className="text-xs text-slate-500 hidden sm:block">
              Ministry of Development of North Eastern Region (MDoNER)
            </p>
          </div>
        </div>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          <button
            onClick={() => onSelectTab('gis')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'gis'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
            }`}
          >
            GIS Live Map
          </button>
          <button
            onClick={() => onSelectTab('roads')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'roads'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
            }`}
          >
            Road Lifelines
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors relative ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
            }`}
          >
            Field Reports
            {offlineReportsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {offlineReportsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('alerts')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'alerts'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
            }`}
          >
            Early Warnings
          </button>
          <button
            onClick={() => onSelectTab('weather')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'weather'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
            }`}
          >
            Weather & Sensors
          </button>
        </nav>

        {/* Zone 3: Primary Actions and DB Status */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Network sync indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="text-[11px] font-mono text-amber-600 font-semibold">Offline ({offlineReportsCount})</span>
              </>
            )}
          </div>

          {/* MongoDB Atlas trigger button */}
          <button
            onClick={onOpenMongoModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-emerald-50 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs"
            title="MongoDB Atlas Database Settings"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline text-[11px] font-mono text-emerald-800">
              {dbState?.connected ? 'Atlas Online' : 'Local DB'}
            </span>
          </button>

          {/* New Incident Report CTA */}
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="flex md:hidden items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
        <button
          onClick={() => onSelectTab('gis')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'gis' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
        >
          GIS Map
        </button>
        <button
          onClick={() => onSelectTab('roads')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'roads' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
        >
          Roads
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
        >
          Reports ({offlineReportsCount})
        </button>
        <button
          onClick={() => onSelectTab('alerts')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'alerts' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
        >
          Alerts
        </button>
        <button
          onClick={() => onSelectTab('weather')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${activeTab === 'weather' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
        >
          Sensors
        </button>
      </div>
    </header>
  );
};
