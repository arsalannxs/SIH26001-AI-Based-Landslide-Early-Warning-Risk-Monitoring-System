import React from 'react';
import { 
  SensorTelemetry, 
  WeatherLinkedRiskForecast, 
  EmergencyResource 
} from '../types/disaster';
import { 
  CloudRain, 
  Activity, 
  Battery, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  TrendingUp,
  Cpu,
  Layers,
  Thermometer
} from 'lucide-react';

interface WeatherSensorsPanelProps {
  sensors: SensorTelemetry[];
  weatherForecasts: WeatherLinkedRiskForecast[];
  emergencyResources: EmergencyResource[];
}

export const WeatherSensorsPanel: React.FC<WeatherSensorsPanelProps> = ({
  sensors,
  weatherForecasts,
  emergencyResources
}) => {
  return (
    <div className="space-y-6">
      {/* IMD Weather Linked Landslide Risk Forecasts */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-emerald-600" />
              IMD Precipitation Thresholds & Weather-Linked Risk Forecast
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative rainfall intensity-duration thresholds (I = a · D^-b) and empirical landslide trigger probabilities for Eastern Himalayas.
            </p>
          </div>
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            India Meteorological Department (IMD) Live Feed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weatherForecasts.map((wf, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {wf.state}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      wf.imdAlertLevel === 'Red'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : wf.imdAlertLevel === 'Orange'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    {wf.imdAlertLevel} Alert
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {wf.district}
                </h3>

                {/* 3-Day Forecast rain pills */}
                <div className="grid grid-cols-3 gap-1.5 text-center mt-3 font-mono text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-sans font-medium">Day 1 (24h)</div>
                    <div className="font-bold text-emerald-700 mt-0.5">{wf.day1RainMm} mm</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-sans font-medium">Day 2 (48h)</div>
                    <div className="font-bold text-emerald-700 mt-0.5">{wf.day2RainMm} mm</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-sans font-medium">Day 3 (72h)</div>
                    <div className="font-bold text-emerald-700 mt-0.5">{wf.day3RainMm} mm</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Trigger Probability:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {wf.landslideProbabilityPct}%
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-950 leading-snug">
                <strong>Prep Directive:</strong> {wf.recommendedPrep}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geotechnical IoT Telemetry Stations */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              In-Situ Geotechnical IoT Telemetry Networks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Deep borehole inclinometers, vibrating wire piezometers, and surface wire crack extensometers.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">
            Polling Frequency: 500ms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => {
            const isWarning = sensor.status === 'warning' || sensor.currentValue >= sensor.thresholdValue;

            return (
              <div
                key={sensor.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono uppercase font-medium">
                      {sensor.type.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-mono font-bold">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                      {sensor.batteryPct}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {sensor.zoneName}
                  </h3>

                  {/* Current Reading Display */}
                  <div className="mt-3 flex items-baseline justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Current Value</div>
                      <div className={`text-2xl font-extrabold font-mono mt-0.5 ${
                        isWarning ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {sensor.currentValue} <span className="text-xs font-normal text-slate-500">{sensor.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Threshold Limit</div>
                      <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                        &gt; {sensor.thresholdValue} {sensor.unit}
                      </div>
                    </div>
                  </div>

                  {/* Historical Trend Sparkline */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>06:00</span>
                      <span>Trend Curve</span>
                      <span>14:00 (Peak)</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-8 w-full pt-1">
                      {sensor.history.map((pt, i) => {
                        const maxVal = Math.max(...sensor.history.map(h => h.value), sensor.thresholdValue);
                        const heightPct = Math.min(100, Math.max(15, (pt.value / maxVal) * 100));

                        return (
                          <div
                            key={i}
                            className="flex-1 bg-slate-200 rounded-t overflow-hidden relative group"
                            title={`${pt.timestamp}: ${pt.value} ${sensor.unit}`}
                          >
                            <div
                              className={`w-full transition-all ${
                                pt.value >= sensor.thresholdValue ? 'bg-rose-500' : 'bg-emerald-600'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-mono">ID: {sensor.id}</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      isWarning ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isWarning ? 'Threshold Exceeded' : 'Nominal Stability'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Response Prioritization & Quick Directory */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Emergency Response Forces & Civil Protection Prioritization
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              NDRF search and rescue battalions, BRO road clearance task forces, and district trauma centers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {emergencyResources.map((res) => (
            <div
              key={res.id}
              className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {res.type.replace('_', ' ')}
                </span>
                <span className={`text-[10px] font-mono font-bold uppercase ${
                  res.status === 'deployed' ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  ● {res.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-xs leading-snug">
                {res.unitName}
              </h3>

              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{res.location} ({res.state})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-900 font-mono font-medium">
                  <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{res.contactNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
