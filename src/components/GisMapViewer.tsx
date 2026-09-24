import React, { useState, useMemo } from 'react';
import { 
  HazardZone, 
  RoadConnectivity, 
  SensorTelemetry, 
  FieldReport 
} from '../types/disaster';
import { 
  Layers, 
  ShieldAlert, 
  Activity, 
  Eye, 
  Navigation, 
  Users, 
  Maximize2, 
  Filter,
  Sparkles,
  Compass,
  AlertTriangle,
  Info
} from 'lucide-react';

interface GisMapViewerProps {
  zones: HazardZone[];
  roads: RoadConnectivity[];
  sensors: SensorTelemetry[];
  reports: FieldReport[];
  selectedZone: HazardZone | null;
  onSelectZone: (zone: HazardZone) => void;
  onRunAIPrediction: (zone: HazardZone) => void;
  onOpenReportModal: () => void;
}

// Coordinate projection helper for North Eastern Region
// Longitude range: 88.0°E to 96.5°E -> SVG X: 80 to 920
// Latitude range: 22.5°N to 28.5°N -> SVG Y: 560 to 60 (inverted for screen coords)
function projectCoords(lat: number, lng: number): { x: number; y: number } {
  const minLng = 88.0;
  const maxLng = 96.5;
  const minLat = 22.5;
  const maxLat = 28.5;

  const x = 70 + ((lng - minLng) / (maxLng - minLng)) * 860;
  const y = 560 - ((lat - minLat) / (maxLat - minLat)) * 500;
  return { x: Math.max(30, Math.min(970, x)), y: Math.max(30, Math.min(580, y)) };
}

export const GisMapViewer: React.FC<GisMapViewerProps> = ({
  zones,
  roads,
  sensors,
  reports,
  selectedZone,
  onSelectZone,
  onRunAIPrediction,
  onOpenReportModal,
}) => {
  const [filterState, setFilterState] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [showReports, setShowReports] = useState<boolean>(true);

  // Filtered zones
  const filteredZones = useMemo(() => {
    return zones.filter(z => {
      const matchState = filterState === 'All' || z.location.state === filterState;
      const matchSev = filterSeverity === 'all' || z.riskSeverity === filterSeverity;
      return matchState && matchSev;
    });
  }, [zones, filterState, filterSeverity]);

  // Aggregate stats
  const totalPopAtRisk = useMemo(() => {
    return zones.reduce((acc, z) => acc + (z.populationAtRisk || 0), 0);
  }, [zones]);

  const criticalCount = useMemo(() => {
    return zones.filter(z => z.riskSeverity === 'critical').length;
  }, [zones]);

  const blockedRoadsCount = useMemo(() => {
    return roads.filter(r => r.status === 'blocked').length;
  }, [roads]);

  return (
    <div className="space-y-4">
      {/* Top metrics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Critical Threat Zones</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1 flex items-baseline gap-2">
            {criticalCount}
            <span className="text-xs font-sans text-slate-500 font-normal">/ {zones.length} active</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Population at Immediate Risk</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {totalPopAtRisk.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Blocked Highway Lifelines</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1 flex items-baseline gap-2">
            {blockedRoadsCount}
            <span className="text-xs font-sans text-slate-500 font-normal">of {roads.length} arterial</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">IoT Geotech Telemetry</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 flex items-baseline gap-2">
            {sensors.length}
            <span className="text-xs font-sans text-emerald-700 font-medium">stations 100% online</span>
          </div>
        </div>
      </div>

      {/* Main Map + Side Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Canvas Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col relative shadow-sm">
          {/* Controls Bar on Top of Map */}
          <div className="p-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-slate-600 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-600" /> State:
              </span>
              {['All', 'Sikkim', 'Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterState(st)}
                  className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                    filterState === st
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {st === 'Arunachal Pradesh' ? 'Arunachal' : st}
                </button>
              ))}
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowZones(!showZones)}
                className={`px-2 py-1 rounded-md border text-[11px] transition-colors flex items-center gap-1 ${
                  showZones
                    ? 'bg-rose-50 border-rose-300 text-rose-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${showZones ? 'bg-rose-500' : 'bg-slate-300'}`} />
                Zones
              </button>
              <button
                onClick={() => setShowRoads(!showRoads)}
                className={`px-2 py-1 rounded-md border text-[11px] transition-colors flex items-center gap-1 ${
                  showRoads
                    ? 'bg-amber-50 border-amber-300 text-amber-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${showRoads ? 'bg-amber-500' : 'bg-slate-300'}`} />
                Roads
              </button>
              <button
                onClick={() => setShowSensors(!showSensors)}
                className={`px-2 py-1 rounded-md border text-[11px] transition-colors flex items-center gap-1 ${
                  showSensors
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${showSensors ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                IoT
              </button>
              <button
                onClick={() => setShowReports(!showReports)}
                className={`px-2 py-1 rounded-md border text-[11px] transition-colors flex items-center gap-1 ${
                  showReports
                    ? 'bg-sky-50 border-sky-300 text-sky-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${showReports ? 'bg-sky-500' : 'bg-slate-300'}`} />
                Reports
              </button>
            </div>
          </div>

          {/* SVG GIS Map Stage */}
          <div className="relative w-full h-[480px] sm:h-[560px] bg-gradient-to-b from-[#f0fdf4] via-[#f8fafc] to-[#ecfdf5] overflow-hidden select-none">
            {/* Compass rose */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-center opacity-80 pointer-events-none text-emerald-800">
              <Compass className="w-8 h-8 text-emerald-700 stroke-1" />
              <span className="text-[10px] font-mono font-bold tracking-widest mt-0.5 text-emerald-800">NER GIS</span>
            </div>

            {/* Radar scanner sweep indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-25">
              <div className="w-full h-full rounded-full border border-emerald-500/30 animate-radar-sweep bg-gradient-to-tr from-emerald-500/15 via-transparent to-transparent" />
            </div>

            {/* SVG GIS Canvas */}
            <svg 
              viewBox="0 0 1000 620" 
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <defs>
                {/* Glow filters */}
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                {/* Elevation topography hatch pattern */}
                <pattern id="contourHatchLight" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
                  <line x1="0" y1="0" x2="0" y2="40" stroke="#cbd5e1" strokeWidth="0.8" strokeOpacity="0.4" />
                </pattern>
              </defs>

              {/* Topographic Background Hatch */}
              <rect width="1000" height="620" fill="url(#contourHatchLight)" />

              {/* Geographic grid lines & coordinate labels */}
              <g stroke="#cbd5e1" strokeWidth="0.6" strokeDasharray="4 4" opacity="0.6">
                <line x1="100" y1="0" x2="100" y2="620" />
                <line x1="300" y1="0" x2="300" y2="620" />
                <line x1="500" y1="0" x2="500" y2="620" />
                <line x1="700" y1="0" x2="700" y2="620" />
                <line x1="900" y1="0" x2="900" y2="620" />
                
                <line x1="0" y1="120" x2="1000" y2="120" />
                <line x1="0" y1="260" x2="1000" y2="260" />
                <line x1="0" y1="400" x2="1000" y2="400" />
                <line x1="0" y1="540" x2="1000" y2="540" />
              </g>

              {/* Coordinate Text */}
              <g fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="500">
                <text x="105" y="605">89°E</text>
                <text x="305" y="605">91°E</text>
                <text x="505" y="605">93°E</text>
                <text x="705" y="605">95°E</text>
                <text x="905" y="605">97°E</text>
                
                <text x="15" y="125">28°N</text>
                <text x="15" y="265">26°N</text>
                <text x="15" y="405">24°N</text>
                <text x="15" y="545">22°N</text>
              </g>

              {/* Stylized NER State Boundary Polygons (Lush green topography) */}
              {/* Sikkim */}
              <path
                d="M 90 120 L 140 100 L 160 145 L 145 190 L 100 175 Z"
                fill="#dcfce7"
                fillOpacity="0.8"
                stroke="#86efac"
                strokeWidth="1.5"
              />
              <text x="105" y="150" fill="#166534" fontSize="11" fontWeight="700" opacity="0.8">SIKKIM</text>

              {/* Arunachal Pradesh (Himalayan Arc) */}
              <path
                d="M 170 140 L 360 80 L 520 60 L 760 90 L 920 170 L 860 230 L 710 240 L 560 210 L 400 230 L 310 210 Z"
                fill="#ecfdf5"
                fillOpacity="0.85"
                stroke="#6ee7b7"
                strokeWidth="1.5"
              />
              <text x="550" y="140" fill="#065f46" fontSize="13" fontWeight="700" opacity="0.8">ARUNACHAL PRADESH</text>

              {/* Assam (Brahmaputra Valley) */}
              <path
                d="M 230 230 L 400 235 L 560 215 L 710 245 L 820 250 L 760 340 L 580 340 L 520 380 L 480 340 L 330 320 L 220 270 Z"
                fill="#f0fdf4"
                fillOpacity="0.9"
                stroke="#86efac"
                strokeWidth="1.5"
              />
              <text x="440" y="275" fill="#15803d" fontSize="13" fontWeight="700" opacity="0.8">ASSAM</text>

              {/* Meghalaya Plateau */}
              <path
                d="M 230 325 L 440 325 L 470 380 L 260 380 Z"
                fill="#d1fae5"
                fillOpacity="0.8"
                stroke="#6ee7b7"
                strokeWidth="1.5"
              />
              <text x="310" y="355" fill="#047857" fontSize="11" fontWeight="700" opacity="0.8">MEGHALAYA</text>

              {/* Nagaland */}
              <path
                d="M 720 250 L 820 255 L 790 350 L 705 340 Z"
                fill="#dcfce7"
                fillOpacity="0.85"
                stroke="#86efac"
                strokeWidth="1.5"
              />
              <text x="735" y="300" fill="#166534" fontSize="11" fontWeight="700" opacity="0.8">NAGALAND</text>

              {/* Manipur */}
              <path
                d="M 705 345 L 790 355 L 760 460 L 670 440 Z"
                fill="#ecfdf5"
                fillOpacity="0.85"
                stroke="#6ee7b7"
                strokeWidth="1.5"
              />
              <text x="700" y="405" fill="#065f46" fontSize="11" fontWeight="700" opacity="0.8">MANIPUR</text>

              {/* Mizoram */}
              <path
                d="M 590 420 L 665 425 L 640 540 L 570 530 Z"
                fill="#d1fae5"
                fillOpacity="0.85"
                stroke="#86efac"
                strokeWidth="1.5"
              />
              <text x="595" y="480" fill="#047857" fontSize="11" fontWeight="700" opacity="0.8">MIZORAM</text>

              {/* Tripura */}
              <path
                d="M 470 410 L 540 405 L 530 500 L 460 480 Z"
                fill="#f0fdf4"
                fillOpacity="0.85"
                stroke="#86efac"
                strokeWidth="1.5"
              />
              <text x="475" y="450" fill="#15803d" fontSize="10" fontWeight="700" opacity="0.8">TRIPURA</text>

              {/* Major Highway Roads Overlay */}
              {showRoads && (
                <g>
                  {/* NH-10 (Siliguri - Gangtok) - Blocked */}
                  <path
                    d="M 85 240 Q 110 180 125 155"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="6 3"
                  />
                  <text x="95" y="210" fill="#b91c1c" fontSize="9" fontWeight="700">NH-10 [BLOCKED]</text>

                  {/* NH-29 (Dimapur - Kohima - Imphal) - Caution */}
                  <path
                    d="M 620 330 Q 710 330 735 340 T 710 410"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <text x="640" y="325" fill="#b45309" fontSize="9" fontWeight="700">NH-29 [CAUTION]</text>

                  {/* NH-06 (Guwahati - Shillong - Silchar) - Open */}
                  <path
                    d="M 360 260 L 370 330 Q 480 360 560 380"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <text x="375" y="315" fill="#047857" fontSize="9" fontWeight="700">NH-06 [OPEN]</text>

                  {/* NH-37 (Imphal - Jiribam) - Restricted */}
                  <path
                    d="M 580 390 L 690 410"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                  />
                  <text x="600" y="415" fill="#b45309" fontSize="9" fontWeight="700">NH-37 [NIGHT CLOSED]</text>

                  {/* BCT Corridor (Tawang Sela Axis) */}
                  <path
                    d="M 380 230 L 370 160 L 330 110"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <text x="345" y="145" fill="#b45309" fontSize="9" fontWeight="700">BCT / Sela Axis</text>
                </g>
              )}

              {/* IoT Sensors Overlay */}
              {showSensors && sensors.map((sensor) => {
                const parentZone = zones.find(z => z.id === sensor.zoneId);
                if (!parentZone) return null;
                const { x, y } = projectCoords(parentZone.location.lat + 0.05, parentZone.location.lng - 0.05);

                return (
                  <g key={sensor.id} className="cursor-pointer" transform={`translate(${x}, ${y})`}>
                    <circle r="4" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                    <circle r="8" fill="none" stroke="#059669" strokeWidth="1" opacity="0.7" />
                  </g>
                );
              })}

              {/* Crowdsourced Field Reports Overlay */}
              {showReports && reports.map((report) => {
                const { x, y } = projectCoords(report.location.lat, report.location.lng);
                return (
                  <g key={report.id} className="cursor-pointer" transform={`translate(${x}, ${y})`}>
                    <polygon points="0,-7 6,4 -6,4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />
                  </g>
                );
              })}

              {/* Hazard Zones Hotspots */}
              {showZones && filteredZones.map((zone) => {
                const { x, y } = projectCoords(zone.location.lat, zone.location.lng);
                const isSelected = selectedZone?.id === zone.id;
                const isCritical = zone.riskSeverity === 'critical';
                const isHigh = zone.riskSeverity === 'high';
                const isModerate = zone.riskSeverity === 'moderate';

                const color = isCritical ? '#dc2626' : isHigh ? '#ea580c' : isModerate ? '#ca8a04' : '#059669';
                const radius = Math.max(10, (zone.riskScore / 100) * 22);

                return (
                  <g 
                    key={zone.id} 
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => onSelectZone(zone)}
                  >
                    {/* Pulsing ring for critical/high */}
                    {(isCritical || isHigh) && (
                      <circle
                        cx={x}
                        cy={y}
                        r={radius * 1.6}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        opacity="0.5"
                        className="animate-ping"
                        style={{ transformOrigin: `${x}px ${y}px`, animationDuration: isCritical ? '2s' : '3s' }}
                      />
                    )}

                    {/* Outer hazard impact envelope */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={color}
                      fillOpacity={isSelected ? 0.35 : 0.2}
                      stroke={color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter={isCritical ? 'url(#glow-red)' : undefined}
                    />

                    {/* Center node */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Zone Label */}
                    <text
                      x={x + 10}
                      y={y + 4}
                      fill="#0f172a"
                      fontSize={isSelected ? '12' : '10'}
                      fontWeight={isSelected ? '800' : '700'}
                      filter="drop-shadow(0px 1px 1px rgba(255,255,255,0.9))"
                    >
                      {zone.location.district} ({zone.riskScore}%)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-2.5 text-[11px] space-y-1.5 pointer-events-auto shadow-sm">
              <div className="text-slate-700 font-bold mb-1">GIS Map Legend</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-xs" />
                <span className="text-slate-700 font-medium">Critical Failure Zone (&gt;80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700 font-medium">High Landslide Risk (60-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-rose-600 border-dashed" />
                <span className="text-slate-700 font-medium">Blocked Highway Lifeline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-slate-700 font-medium">Active Geotechnical IoT Station</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rotate-45 bg-sky-500" />
                <span className="text-slate-700 font-medium">Verified Citizen Field Report</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Inspector: Selected Zone Details & AI Action Trigger */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          {selectedZone ? (
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-500">
                    {selectedZone.location.district} · {selectedZone.location.state}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      selectedZone.riskSeverity === 'critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : selectedZone.riskSeverity === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {selectedZone.riskSeverity} Risk ({selectedZone.riskScore}%)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                  {selectedZone.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Corridor: <span className="text-slate-800 font-medium">{selectedZone.affectedRoad}</span>
                </p>
              </div>

              {/* Geotechnical Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">Slope Gradient</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {selectedZone.slopeAngleDeg}°
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">Soil Moisture</div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${
                    selectedZone.soilMoisturePct > 80 ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {selectedZone.soilMoisturePct}%
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">24h Rainfall</div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${
                    selectedZone.rainfall24hMm > 100 ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {selectedZone.rainfall24hMm} mm
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium">Inclinometer Velocity</div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${
                    selectedZone.displacementRateMmDay > 10 ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {selectedZone.displacementRateMmDay} mm/day
                  </div>
                </div>
              </div>

              {/* Geological Profile & Lithology */}
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-xs space-y-1.5">
                <div className="text-emerald-900 font-bold">Lithology & Ground Mechanics:</div>
                <div className="text-slate-700 font-mono text-[11px] leading-relaxed">
                  {selectedZone.geologyType}
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1 border-t border-emerald-200/60">
                  <span>Vegetation: {selectedZone.vegetationCoverPct}% cover</span>
                  <span>Pore Pressure: {selectedZone.poreWaterPressureKPa} kPa</span>
                </div>
              </div>

              {/* Vulnerable Communities at Risk */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span className="font-medium">Vulnerable Habitations</span>
                  <span className="font-mono text-amber-700 font-bold">{selectedZone.populationAtRisk.toLocaleString()} residents</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedZone.nearbyVillages.map(v => (
                    <span key={v} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Predictive Analytics Simulator Trigger */}
              <div className="pt-2">
                <button
                  onClick={() => onRunAIPrediction(selectedZone)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Run AI Geotechnical Risk Simulation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Compass className="w-12 h-12 stroke-1 text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700">Select any hazard zone on the GIS map</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Click any pulsing node to inspect real-time IoT sensors, slope geometry, and simulate failure probabilities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
