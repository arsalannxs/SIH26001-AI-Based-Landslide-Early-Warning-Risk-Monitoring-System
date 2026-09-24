import React, { useState, useEffect } from 'react';
import { HazardZone } from '../types/disaster';
import { AIPredictionResult } from '../../server/aiService';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Radio, 
  RotateCcw,
  CheckCircle2,
  Sliders,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { sound } from '../utils/sound';

interface AIPredictorModalProps {
  zone: HazardZone | null;
  isOpen: boolean;
  onClose: () => void;
  onBroadcastAlert: (zone: HazardZone, prediction: AIPredictionResult) => void;
}

export const AIPredictorModal: React.FC<AIPredictorModalProps> = ({
  zone,
  isOpen,
  onClose,
  onBroadcastAlert
}) => {
  if (!isOpen || !zone) return null;

  // Simulator inputs
  const [rainfall24h, setRainfall24h] = useState<number>(zone.rainfall24hMm);
  const [soilMoisture, setSoilMoisture] = useState<number>(zone.soilMoisturePct);
  const [displacementRate, setDisplacementRate] = useState<number>(zone.displacementRateMmDay);
  const [slopeAngle, setSlopeAngle] = useState<number>(zone.slopeAngleDeg);

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<AIPredictionResult | null>(null);

  // Sync inputs when zone changes
  useEffect(() => {
    if (zone) {
      setRainfall24h(zone.rainfall24hMm);
      setSoilMoisture(zone.soilMoisturePct);
      setDisplacementRate(zone.displacementRateMmDay);
      setSlopeAngle(zone.slopeAngleDeg);
      runPrediction({
        ...zone,
        rainfall24hMm: zone.rainfall24hMm,
        soilMoisturePct: zone.soilMoisturePct,
        displacementRateMmDay: zone.displacementRateMmDay,
        slopeAngleDeg: zone.slopeAngleDeg
      });
    }
  }, [zone]);

  const runPrediction = async (customParams?: Partial<HazardZone>) => {
    setLoading(true);
    try {
      const payload = {
        ...zone,
        rainfall24hMm: customParams?.rainfall24hMm ?? rainfall24h,
        soilMoisturePct: customParams?.soilMoisturePct ?? soilMoisture,
        displacementRateMmDay: customParams?.displacementRateMmDay ?? displacementRate,
        slopeAngleDeg: customParams?.slopeAngleDeg ?? slopeAngle,
      };

      const res = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setPrediction(data);
      if (data.severity === 'critical') {
        sound.playAlertChime('critical');
      } else {
        sound.playSuccessTone();
      }
    } catch (e) {
      console.error('Error running AI prediction:', e);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (type: 'cloudburst' | 'prolonged' | 'excavation' | 'moderate') => {
    if (type === 'cloudburst') {
      setRainfall24h(240);
      setSoilMoisture(94);
      setDisplacementRate(24.5);
      runPrediction({ rainfall24hMm: 240, soilMoisturePct: 94, displacementRateMmDay: 24.5 });
    } else if (type === 'prolonged') {
      setRainfall24h(160);
      setSoilMoisture(86);
      setDisplacementRate(14.0);
      runPrediction({ rainfall24hMm: 160, soilMoisturePct: 86, displacementRateMmDay: 14.0 });
    } else if (type === 'excavation') {
      setSlopeAngle(62);
      setDisplacementRate(18.0);
      runPrediction({ slopeAngleDeg: 62, displacementRateMmDay: 18.0 });
    } else {
      setRainfall24h(45);
      setSoilMoisture(52);
      setDisplacementRate(2.1);
      runPrediction({ rainfall24hMm: 45, soilMoisturePct: 52, displacementRateMmDay: 2.1 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                AI Landslide Predictive Analytics Engine
                <span className="text-[11px] font-mono text-emerald-800 font-semibold px-2 py-0.5 rounded bg-white border border-emerald-200">
                  Gemini 3.8 Flash Geotechnical Model
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Evaluating {zone.name} ({zone.location.district}, {zone.location.state})
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Quick Scenario Presets */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>Simulate Extreme Weather & Geotechnical Scenarios:</span>
              <span className="text-[11px] text-slate-500 font-normal">Instant What-If Stress Testing</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => applyPreset('cloudburst')}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-left transition-colors"
              >
                <div className="text-xs font-bold text-rose-800">Monsoon Cloudburst</div>
                <div className="text-[11px] text-rose-700 font-mono mt-0.5 font-medium">240mm Rain · 94% Moist</div>
              </button>
              <button
                onClick={() => applyPreset('prolonged')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-colors"
              >
                <div className="text-xs font-bold text-amber-800">3-Day Continuous Rain</div>
                <div className="text-[11px] text-amber-700 font-mono mt-0.5 font-medium">160mm Rain · Saturated</div>
              </button>
              <button
                onClick={() => applyPreset('excavation')}
                className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/70 text-left transition-colors"
              >
                <div className="text-xs font-bold text-orange-800">Unplanned Hill Cutting</div>
                <div className="text-[11px] text-orange-700 font-mono mt-0.5 font-medium">62° Slope · Toe Failure</div>
              </button>
              <button
                onClick={() => applyPreset('moderate')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-colors"
              >
                <div className="text-xs font-bold text-emerald-800">Post-Rain Stabilization</div>
                <div className="text-[11px] text-emerald-700 font-mono mt-0.5 font-medium">45mm Rain · Moderate</div>
              </button>
            </div>
          </div>

          {/* Interactive Parameter Sliders */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fine-Tune Physical Trigger Parameters:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 24h Rainfall */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>24-Hour Rainfall</span>
                  <span className="font-mono text-emerald-700 font-bold">{rainfall24h} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  value={rainfall24h}
                  onChange={(e) => setRainfall24h(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Soil Moisture */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Soil Moisture Saturation</span>
                  <span className="font-mono text-amber-700 font-bold">{soilMoisture}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="98"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Displacement Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Inclinometer Velocity</span>
                  <span className="font-mono text-rose-700 font-bold">{displacementRate} mm/day</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="0.5"
                  value={displacementRate}
                  onChange={(e) => setDisplacementRate(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              {/* Slope Angle */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Slope Cut Angle</span>
                  <span className="font-mono text-sky-700 font-bold">{slopeAngle}°</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="70"
                  value={slopeAngle}
                  onChange={(e) => setSlopeAngle(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => runPrediction()}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Physics & ML Model...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Re-Calculate Failure Probability</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Prediction Outputs */}
          {prediction && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Composite Risk Score */}
                <div className={`p-4 rounded-xl border ${
                  prediction.severity === 'critical'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : prediction.severity === 'high'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className="text-xs uppercase font-bold tracking-wider opacity-90">
                    Composite Landslide Risk
                  </div>
                  <div className="text-3xl font-extrabold font-mono mt-1">
                    {prediction.riskScore}%
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        prediction.severity === 'critical'
                          ? 'bg-rose-600'
                          : prediction.severity === 'high'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${prediction.riskScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono mt-1.5 uppercase font-bold">
                    Level: {prediction.severity} Threat
                  </div>
                </div>

                {/* Estimated Time to Failure */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800">
                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Time Window to Slope Rupture</span>
                  </div>
                  <div className="text-2xl font-bold font-mono mt-1 text-slate-900">
                    {prediction.estimatedTimeToFailureHours
                      ? `< ${prediction.estimatedTimeToFailureHours} Hours`
                      : 'Not Imminent'}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    Recommended Evacuation Radius: <span className="text-slate-900 font-mono font-bold">{prediction.recommendedEvacuationRadiusMeters}m</span>
                  </div>
                </div>

                {/* AI Confidence Score */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800">
                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Model Confidence</span>
                  </div>
                  <div className="text-2xl font-bold font-mono mt-1 text-emerald-700">
                    {prediction.confidenceScore}%
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Multi-parameter correlation verified against historical NER landslide records.
                  </div>
                </div>
              </div>

              {/* Mechanism & Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <span className="text-slate-700 font-bold">Geological Failure Mechanism:</span>
                  <p className="text-slate-900 text-sm font-semibold mt-0.5">
                    {prediction.failureMechanism}
                  </p>
                </div>

                <div>
                  <span className="text-slate-700 font-bold">Primary Trigger Factors:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {prediction.contributingFactors.map((factor, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs">
                        • {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-700 font-bold">Action Prioritization for District Authorities & BRO:</span>
                  <ul className="mt-1 space-y-1 text-slate-700">
                    {prediction.immediatePreventiveMeasures.map((measure, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{measure}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button: Broadcast Alert directly to community */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => onBroadcastAlert(zone, prediction)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Radio className="w-4 h-4 text-white" />
                  <span>Broadcast Early Warning Alert for This Zone</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
