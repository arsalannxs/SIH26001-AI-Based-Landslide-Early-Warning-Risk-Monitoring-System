import React, { useState, useEffect, useCallback } from 'react';
import { 
  HazardZone, 
  RoadConnectivity, 
  SensorTelemetry, 
  FieldReport, 
  EarlyWarningAlert, 
  WeatherLinkedRiskForecast, 
  EmergencyResource, 
  RoadStatus 
} from './types/disaster';
import { DatabaseState } from '../server/db';
import { Navbar } from './components/Navbar';
import { GisMapViewer } from './components/GisMapViewer';
import { RoadConnectivityTable } from './components/RoadConnectivityTable';
import { FieldReportModal } from './components/FieldReportModal';
import { FieldReportsList } from './components/FieldReportsList';
import { AlertsBroadcastCenter } from './components/AlertsBroadcastCenter';
import { WeatherSensorsPanel } from './components/WeatherSensorsPanel';
import { AIPredictorModal } from './components/AIPredictorModal';
import { MongoAtlasModal } from './components/MongoAtlasModal';
import { 
  getOfflineReports, 
  saveOfflineReport, 
  syncOfflineReports 
} from './utils/offlineSync';
import { sound } from './utils/sound';
import { AIPredictionResult } from '../server/aiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'gis' | 'roads' | 'reports' | 'alerts' | 'weather'>('gis');
  
  // Data states
  const [zones, setZones] = useState<HazardZone[]>([]);
  const [roads, setRoads] = useState<RoadConnectivity[]>([]);
  const [sensors, setSensors] = useState<SensorTelemetry[]>([]);
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [weatherForecasts, setWeatherForecasts] = useState<WeatherLinkedRiskForecast[]>([]);
  const [emergencyResources, setEmergencyResources] = useState<EmergencyResource[]>([]);
  const [dbState, setDbState] = useState<DatabaseState | null>(null);

  // Inspector & Simulator
  const [selectedZone, setSelectedZone] = useState<HazardZone | null>(null);
  const [simulationZone, setSimulationZone] = useState<HazardZone | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isMongoModalOpen, setIsMongoModalOpen] = useState<boolean>(false);

  // Connectivity
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineCount, setOfflineCount] = useState<number>(0);

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      const [
        zonesRes,
        roadsRes,
        sensorsRes,
        reportsRes,
        alertsRes,
        weatherRes,
        resourcesRes,
        dbStatusRes
      ] = await Promise.all([
        fetch('/api/zones').then(r => r.json()),
        fetch('/api/roads').then(r => r.json()),
        fetch('/api/sensors').then(r => r.json()),
        fetch('/api/reports').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/weather-forecasts').then(r => r.json()),
        fetch('/api/emergency-resources').then(r => r.json()),
        fetch('/api/db/status').then(r => r.json())
      ]);

      if (Array.isArray(zonesRes)) {
        setZones(zonesRes);
        if (!selectedZone && zonesRes.length > 0) {
          setSelectedZone(zonesRes[0]);
        }
      }
      if (Array.isArray(roadsRes)) setRoads(roadsRes);
      if (Array.isArray(sensorsRes)) setSensors(sensorsRes);
      if (Array.isArray(reportsRes)) setReports(reportsRes);
      if (Array.isArray(alertsRes)) setAlerts(alertsRes);
      if (Array.isArray(weatherRes)) setWeatherForecasts(weatherRes);
      if (Array.isArray(resourcesRes)) setEmergencyResources(resourcesRes);
      if (dbStatusRes) setDbState(dbStatusRes);
    } catch (e) {
      console.warn('Data fetch error, running with resilient state:', e);
    }
  }, [selectedZone]);

  useEffect(() => {
    fetchData();

    // Check offline count
    setOfflineCount(getOfflineReports().length);

    // Online / Offline listeners
    const handleOnline = async () => {
      setIsOnline(true);
      const res = await syncOfflineReports();
      if (res.syncedCount > 0) {
        sound.playSuccessTone();
        setOfflineCount(getOfflineReports().length);
        fetchData();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData]);

  // Submit report handler (with offline fallback)
  const handleSubmitReport = async (newReport: FieldReport) => {
    if (!navigator.onLine) {
      saveOfflineReport(newReport);
      setOfflineCount(getOfflineReports().length);
      setReports(prev => [newReport, ...prev]);
      return;
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
      if (res.ok) {
        const saved = await res.json();
        setReports(prev => [saved, ...prev]);
        fetchData();
      } else {
        // Fallback to offline store
        saveOfflineReport(newReport);
        setOfflineCount(getOfflineReports().length);
        setReports(prev => [newReport, ...prev]);
      }
    } catch (e) {
      saveOfflineReport(newReport);
      setOfflineCount(getOfflineReports().length);
      setReports(prev => [newReport, ...prev]);
    }
  };

  // Update Road status handler
  const handleUpdateRoadStatus = async (roadId: string, status: RoadStatus, reason?: string) => {
    try {
      const res = await fetch(`/api/roads/${roadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        const updated = await res.json();
        setRoads(prev => prev.map(r => r.id === roadId ? updated : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Broadcast Alert handler
  const handleBroadcastAlert = async (newAlert: EarlyWarningAlert) => {
    try {
      const res = await fetch('/api/alerts/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
      if (res.ok) {
        const saved = await res.json();
        setAlerts(prev => [saved, ...prev]);
        sound.playAlertChime(newAlert.severity as any);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run AI Simulator on specific zone
  const handleRunAIPrediction = (zone: HazardZone) => {
    setSimulationZone(zone);
    setIsSimulatorOpen(true);
  };

  // Broadcast alert directly from AI Simulator
  const handleBroadcastFromSimulator = (zone: HazardZone, prediction: AIPredictionResult) => {
    const alert: EarlyWarningAlert = {
      id: `alert-${Date.now().toString(36)}`,
      title: `${prediction.severity.toUpperCase()} ALERT: ${zone.name}`,
      severity: prediction.severity,
      affectedDistricts: [zone.location.district],
      state: zone.location.state,
      issuedAt: 'Just now',
      validUntil: 'Next 24 Hours',
      headline: `AI early warning model indicates ${prediction.riskScore}% risk of ${prediction.failureMechanism}.`,
      instructions: prediction.immediatePreventiveMeasures,
      languages: [
        {
          language: 'English',
          headline: `LANDSLIDE ALERT: ${zone.name}`,
          message: prediction.geotechnicalSummary
        }
      ],
      smsSentCount: 16800,
      evacuationRecommended: prediction.severity === 'critical'
    };
    handleBroadcastAlert(alert);
    setIsSimulatorOpen(false);
  };

  // Connect MongoDB Atlas
  const handleConnectMongo = async (uri: string) => {
    const res = await fetch('/api/db/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri })
    });
    const data = await res.json();
    if (data.state) setDbState(data.state);
    fetchData();
    return data;
  };

  // Seed MongoDB Atlas
  const handleSeedDatabase = async () => {
    const res = await fetch('/api/db/seed', { method: 'POST' });
    const data = await res.json();
    if (data.state) setDbState(data.state);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenMongoModal={() => setIsMongoModalOpen(true)}
        dbState={dbState}
        isOnline={isOnline}
        offlineReportsCount={offlineCount}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'gis' && (
          <GisMapViewer
            zones={zones}
            roads={roads}
            sensors={sensors}
            reports={reports}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            onRunAIPrediction={handleRunAIPrediction}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'roads' && (
          <RoadConnectivityTable
            roads={roads}
            onUpdateRoadStatus={handleUpdateRoadStatus}
          />
        )}

        {activeTab === 'reports' && (
          <FieldReportsList
            reports={reports}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsBroadcastCenter
            alerts={alerts}
            zones={zones}
            onBroadcastNewAlert={handleBroadcastAlert}
          />
        )}

        {activeTab === 'weather' && (
          <WeatherSensorsPanel
            sensors={sensors}
            weatherForecasts={weatherForecasts}
            emergencyResources={emergencyResources}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-800">NER Drishti</span> · AI-Enabled Early Warning & Landslide Risk Monitoring System
            <div className="text-[11px] text-slate-500 mt-0.5">
              Developed for Ministry of Development of North Eastern Region (MDoNER) & Disaster Management Authorities
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-mono text-emerald-800 font-medium">
            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Sikkim</span>
            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Assam</span>
            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Meghalaya</span>
            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Arunachal</span>
            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Nagaland</span>
            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Manipur</span>
            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Mizoram</span>
            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Tripura</span>
          </div>
        </div>
      </footer>

      {/* Field Report Modal */}
      <FieldReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleSubmitReport}
        isOnline={isOnline}
      />

      {/* AI Geotechnical Predictor Modal */}
      <AIPredictorModal
        isOpen={isSimulatorOpen}
        zone={simulationZone}
        onClose={() => setIsSimulatorOpen(false)}
        onBroadcastAlert={handleBroadcastFromSimulator}
      />

      {/* MongoDB Atlas Modal */}
      <MongoAtlasModal
        isOpen={isMongoModalOpen}
        onClose={() => setIsMongoModalOpen(false)}
        dbState={dbState}
        onConnectMongo={handleConnectMongo}
        onSeedDatabase={handleSeedDatabase}
        onRefreshStatus={fetchData}
      />
    </div>
  );
}
