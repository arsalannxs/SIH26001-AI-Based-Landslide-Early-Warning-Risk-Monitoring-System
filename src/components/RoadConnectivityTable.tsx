import React, { useState } from 'react';
import { RoadConnectivity, RoadStatus } from '../types/disaster';
import { 
  Navigation, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Truck, 
  Shield, 
  ExternalLink,
  Edit2
} from 'lucide-react';
import { sound } from '../utils/sound';

interface RoadConnectivityTableProps {
  roads: RoadConnectivity[];
  onUpdateRoadStatus: (roadId: string, status: RoadStatus, reason?: string) => Promise<void>;
}

export const RoadConnectivityTable: React.FC<RoadConnectivityTableProps> = ({
  roads,
  onUpdateRoadStatus
}) => {
  const [filter, setFilter] = useState<'all' | 'blocked' | 'caution' | 'open'>('all');
  const [editingRoad, setEditingRoad] = useState<RoadConnectivity | null>(null);
  const [editStatus, setEditStatus] = useState<RoadStatus>('caution');
  const [editReason, setEditReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const filteredRoads = roads.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleSaveStatus = async () => {
    if (!editingRoad) return;
    setSubmitting(true);
    try {
      await onUpdateRoadStatus(editingRoad.id, editStatus, editReason);
      sound.playSuccessTone();
      setEditingRoad(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600" />
            North Eastern Strategic Road Connectivity & Highway Lifelines
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of critical national highways, border corridors, and essential supply routes.
          </p>
        </div>

        {/* Filter segment tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Roads ({roads.length})
          </button>
          <button
            onClick={() => setFilter('blocked')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              filter === 'blocked' ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blocked ({roads.filter(r => r.status === 'blocked').length})
          </button>
          <button
            onClick={() => setFilter('caution')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              filter === 'caution' ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Caution ({roads.filter(r => r.status === 'caution' || r.status === 'restricted').length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              filter === 'open' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clear ({roads.filter(r => r.status === 'open').length})
          </button>
        </div>
      </div>

      {/* Roads List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoads.map((road) => {
          const isBlocked = road.status === 'blocked';
          const isCaution = road.status === 'caution' || road.status === 'restricted';
          const isOpen = road.status === 'open';

          return (
            <div
              key={road.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between bg-white shadow-xs ${
                isBlocked
                  ? 'border-rose-300 ring-1 ring-rose-100'
                  : isCaution
                  ? 'border-amber-300 ring-1 ring-amber-100'
                  : 'border-slate-200 hover:border-emerald-200'
              }`}
            >
              <div>
                {/* Status and Highway Number */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {road.highwayNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {road.state} · {road.lengthKm} km
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                      isBlocked
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isCaution
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isBlocked ? 'Blocked' : road.status === 'restricted' ? 'Restricted' : road.status === 'caution' ? 'Caution' : 'Open'}
                  </span>
                </div>

                {/* Road Title & Segment */}
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {road.name}
                </h3>
                <p className="text-xs text-slate-600 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {road.segment}
                </p>

                {/* Blockage Cause */}
                {road.blockageReason && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="text-slate-600 font-semibold">Obstruction / Condition:</div>
                    <div className="text-slate-800 mt-0.5 leading-relaxed font-sans">
                      {road.blockageReason}
                    </div>
                  </div>
                )}

                {/* Alternate Route & Crew Info */}
                <div className="mt-3 space-y-2 text-xs">
                  {road.alternateRoute && (
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <span className="text-slate-500 shrink-0 font-semibold">Diversion:</span>
                      <span className="text-emerald-800 font-mono text-[11px] font-medium">{road.alternateRoute}</span>
                    </div>
                  )}

                  {road.clearingCrewAssigned && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Clearing Force: <span className="text-slate-900 font-medium">{road.clearingCrewAssigned}</span></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-400 font-mono text-[11px]">
                  Reported: {road.lastReported}
                  {road.estimatedClearanceHours ? ` · ETA: ~${road.estimatedClearanceHours}h` : ''}
                </div>

                <button
                  onClick={() => {
                    setEditingRoad(road);
                    setEditStatus(road.status);
                    setEditReason(road.blockageReason || '');
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1 text-[11px] transition-colors border border-emerald-200"
                >
                  <Edit2 className="w-3 h-3 text-emerald-600" />
                  <span>Update Road Status</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Road Status Modal */}
      {editingRoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Update Status: {editingRoad.highwayNumber}
              </h3>
              <button onClick={() => setEditingRoad(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Passability State:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['open', 'caution', 'restricted', 'blocked'] as RoadStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`p-2 rounded-lg border text-center uppercase font-mono font-bold text-xs ${
                        editStatus === st
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Reason / Clearance Update:</label>
                <textarea
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., BRO excavator deployed. Debris cleared on single lane."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingRoad(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
