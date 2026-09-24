import React, { useState } from 'react';
import { DatabaseState } from '../../server/db';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Layers, 
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { sound } from '../utils/sound';

interface MongoAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbState: DatabaseState | null;
  onConnectMongo: (uri: string) => Promise<{ success: boolean; message: string; state: DatabaseState }>;
  onSeedDatabase: () => Promise<void>;
  onRefreshStatus: () => Promise<void>;
}

export const MongoAtlasModal: React.FC<MongoAtlasModalProps> = ({
  isOpen,
  onClose,
  dbState,
  onConnectMongo,
  onSeedDatabase,
  onRefreshStatus
}) => {
  if (!isOpen) return null;

  const [mongoUri, setMongoUri] = useState<string>('');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;

    setConnecting(true);
    setResultMessage(null);
    try {
      const res = await onConnectMongo(mongoUri.trim());
      if (res.success) {
        setResultMessage({ type: 'success', text: res.message });
        sound.playSuccessTone();
      } else {
        setResultMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Failed connecting to MongoDB Atlas' });
    } finally {
      setConnecting(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onSeedDatabase();
      sound.playSuccessTone();
      setResultMessage({ type: 'success', text: 'Database successfully refreshed with initial NER disaster collections.' });
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                MongoDB Atlas Cloud Database Integration
              </h2>
              <p className="text-xs text-slate-500">
                Persistent storage for early warning telemetry & field reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Live Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold">Active Database Engine:</span>
              <span
                className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5 ${
                  dbState?.connected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {dbState?.connected ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    MongoDB Atlas Cluster
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3 h-3 text-amber-600" />
                    Local In-Memory Adapter
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200 font-mono">
              <div>
                <span className="text-slate-500">Database Name:</span>
                <div className="text-slate-900 font-bold truncate">{dbState?.databaseName || 'ner_disaster_db'}</div>
              </div>
              <div>
                <span className="text-slate-500">Cluster Host:</span>
                <div className="text-slate-700 font-medium truncate">{dbState?.clusterHost || 'Local Resilient Store'}</div>
              </div>
            </div>

            {/* Collection Document Counts */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-700 mb-1.5 block">
                Synchronized Collections & Documents:
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-sans font-medium">Zones</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{dbState?.counts.zones ?? 0}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-sans font-medium">Roads</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{dbState?.counts.roads ?? 0}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-sans font-medium">Sensors</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{dbState?.counts.sensors ?? 0}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-sans font-medium">Reports</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{dbState?.counts.reports ?? 0}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-sans font-medium">Alerts</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{dbState?.counts.alerts ?? 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Custom Atlas URI Form */}
          <form onSubmit={handleConnect} className="space-y-3">
            <div>
              <label className="text-slate-800 font-bold block mb-1">
                Connect your MongoDB Atlas Connection String:
              </label>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Paste your MongoDB Atlas SRV URI string. The application will immediately ping your cluster, initialize the <code className="text-emerald-700 font-semibold">ner_disaster_db</code> database, and sync telemetry.
              </p>
              <input
                type="text"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                placeholder="mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-medium">
                Defaults to local fallback if unconfigured.
              </span>
              <button
                type="submit"
                disabled={connecting || !mongoUri.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 disabled:opacity-50 transition-colors"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Atlas Ping...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Connect & Ping Atlas</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feedback message */}
          {resultMessage && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                resultMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {resultMessage.text}
            </div>
          )}

          {/* Database Tools / Seeding */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-slate-800 font-bold">Seed NER Disaster Datasets</div>
              <div className="text-[11px] text-slate-500">
                Populate all 8 NER states, highways, sensors, and verified sample field reports.
              </div>
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Seeding...' : 'Seed Collections'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
