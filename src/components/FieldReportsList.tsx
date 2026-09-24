import React, { useState } from 'react';
import { FieldReport } from '../types/disaster';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  User, 
  AlertTriangle, 
  Filter, 
  Sparkles,
  Phone,
  RefreshCw
} from 'lucide-react';

interface FieldReportsListProps {
  reports: FieldReport[];
  onOpenReportModal: () => void;
  onRefresh: () => void;
}

export const FieldReportsList: React.FC<FieldReportsListProps> = ({
  reports,
  onOpenReportModal,
  onRefresh
}) => {
  const [filterHazard, setFilterHazard] = useState<string>('all');

  const filtered = reports.filter(r => {
    if (filterHazard === 'all') return true;
    return r.hazardType === filterHazard;
  });

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Crowdsourced Field Reports & Citizen Ground Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geo-tagged ground photographs of slope cracks, retaining failures, and road blockages verified by AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh reports"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-700/20"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>+ Submit New Report</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
        <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-emerald-600" /> Hazard:
        </span>
        {[
          { id: 'all', label: 'All Hazards' },
          { id: 'tension_cracks', label: 'Tension Cracks' },
          { id: 'soil_slumping', label: 'Soil Slumping' },
          { id: 'debris_flow', label: 'Debris Flow' },
          { id: 'road_culvert_failure', label: 'Culvert / Wall' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterHazard(item.id)}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
              filterHazard === item.id
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rep) => {
          const isCritical = rep.severity === 'critical';
          const isHigh = rep.severity === 'high';

          return (
            <div
              key={rep.id}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs hover:border-emerald-300 transition-colors"
            >
              <div>
                {/* Photo or SVG container */}
                {rep.photoUrl ? (
                  <div className="h-44 w-full bg-slate-100 border-b border-slate-200 flex items-center justify-center overflow-hidden relative">
                    <img
                      src={rep.photoUrl}
                      alt={rep.hazardType}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-md text-[10px] font-mono text-emerald-800 border border-emerald-300 flex items-center gap-1 font-bold shadow-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      AI Verified
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border-b border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                    <Camera className="w-8 h-8 text-slate-300 mb-1" />
                    <span className="text-[11px] text-slate-500 font-mono">Telemetry Data Record</span>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1 font-mono font-medium">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {rep.location.district}, {rep.location.state}
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isHigh
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {rep.severity}
                    </span>
                  </div>

                  {/* Landmark and Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {rep.landmark}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      {rep.description}
                    </p>
                  </div>

                  {/* AI Geotechnical Analysis Pill */}
                  {rep.aiAnalysis && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          AI Optical Measurements:
                        </span>
                        <span className="font-mono text-slate-900 font-semibold">
                          Failure Prob: {rep.aiAnalysis.failureProbabilityPct}%
                        </span>
                      </div>
                      {rep.aiAnalysis.crackWidthEstMm && (
                        <div className="text-[11px] text-slate-700 font-mono">
                          Crack Width: <strong className="text-rose-600">{rep.aiAnalysis.crackWidthEstMm} mm</strong>
                        </div>
                      )}
                      {rep.aiAnalysis.recommendedAction && (
                        <div className="text-[11px] text-slate-600 leading-tight">
                          <span className="text-slate-900 font-medium">Advisory:</span> {rep.aiAnalysis.recommendedAction}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {rep.reporterName} ({rep.reporterRole.replace('_', ' ')})
                </span>
                <span className="font-mono text-slate-400">{rep.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
