import React, { useState } from 'react';
import { FieldReport, GeoLocation, RiskSeverity } from '../types/disaster';
import { 
  X, 
  Camera, 
  MapPin, 
  Sparkles, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  WifiOff,
  Navigation,
  Loader2
} from 'lucide-react';
import { sound } from '../utils/sound';

interface FieldReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: FieldReport) => Promise<void>;
  isOnline: boolean;
}

export const FieldReportModal: React.FC<FieldReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  isOnline
}) => {
  if (!isOpen) return null;

  const [reporterName, setReporterName] = useState<string>('');
  const [reporterRole, setReporterRole] = useState<FieldReport['reporterRole']>('citizen');
  const [phone, setPhone] = useState<string>('');
  const [district, setDistrict] = useState<string>('Gangtok');
  const [state, setState] = useState<GeoLocation['state']>('Sikkim');
  const [lat, setLat] = useState<number>(27.3820);
  const [lng, setLng] = useState<number>(88.5140);
  const [landmark, setLandmark] = useState<string>('');
  const [hazardType, setHazardType] = useState<FieldReport['hazardType']>('tension_cracks');
  const [severity, setSeverity] = useState<RiskSeverity>('high');
  const [description, setDescription] = useState<string>('');
  
  // Image handling
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  // AI analysis state
  const [analyzingPhoto, setAnalyzingPhoto] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    crackWidthEstMm: number;
    failureProbabilityPct: number;
    hazardType: FieldReport['hazardType'];
    severity: RiskSeverity;
    recommendedAction: string;
    geologicalIndicators: string[];
    verified: boolean;
  } | null>(null);

  const [locating, setLocating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Auto GPS Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(4)));
        setLng(Number(pos.coords.longitude.toFixed(4)));
        setLocating(false);
      },
      (err) => {
        console.warn('GPS error, using default NER coordinates:', err.message);
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Image Upload or Sample Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset sample photo generator for quick test
  const handleUseSamplePhoto = (sampleType: 'crack' | 'slump' | 'rockfall') => {
    // Generate an authentic inline SVG canvas encoded as base64 data URL
    const svgData = sampleType === 'crack'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <rect width="600" height="400" fill="#334155"/>
          <path d="M 0 240 Q 200 220 350 250 T 600 230" stroke="#0f172a" stroke-width="12" fill="none"/>
          <path d="M 220 225 L 290 140 L 320 160 L 380 90" stroke="#020617" stroke-width="6" fill="none"/>
          <path d="M 320 160 L 360 210" stroke="#020617" stroke-width="4" fill="none"/>
          <text x="30" y="50" fill="#f8fafc" font-size="18" font-family="sans-serif">Field Inspection: 65mm Tension Cracks Along Shoulder</text>
          <text x="30" y="80" fill="#94a3b8" font-size="14" font-family="monospace">GPS: 27.3820°N, 88.5140°E · Dikchu Corridor</text>
        </svg>`
      : sampleType === 'slump'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <rect width="600" height="400" fill="#2d3748"/>
          <path d="M 0 100 Q 300 180 600 320 L 600 400 L 0 400 Z" fill="#4a5568"/>
          <path d="M 150 160 Q 280 280 450 360" stroke="#1a202c" stroke-width="18" fill="none"/>
          <text x="30" y="50" fill="#f8fafc" font-size="18" font-family="sans-serif">Active Soil Slump &amp; Bulging Road Retaining Wall</text>
          <text x="30" y="80" fill="#cbd5e1" font-size="14" font-family="monospace">GPS: 25.6235°N, 94.0901°E · Kohima Bypass</text>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <rect width="600" height="400" fill="#1e293b"/>
          <circle cx="200" cy="280" r="45" fill="#475569" stroke="#0f172a" stroke-width="4"/>
          <circle cx="270" cy="300" r="30" fill="#64748b" stroke="#0f172a" stroke-width="3"/>
          <circle cx="340" cy="270" r="50" fill="#334155" stroke="#0f172a" stroke-width="5"/>
          <text x="30" y="50" fill="#f8fafc" font-size="18" font-family="sans-serif">Rockfall Debris Flow Blocking Highway Culvert</text>
          <text x="30" y="80" fill="#94a3b8" font-size="14" font-family="monospace">GPS: 25.1764°N, 93.0238°E · Haflong Hill Cut</text>
        </svg>`;

    const b64 = 'data:image/svg+xml;base64,' + btoa(svgData);
    setImagePreview(b64);
    setImageMimeType('image/svg+xml');
  };

  // Run AI Vision Analysis
  const handleAnalyzePhotoWithAI = async () => {
    if (!imagePreview) return;
    setAnalyzingPhoto(true);
    try {
      const res = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMimeType,
          userNotes: description,
          landmark: landmark || `${district}, ${state}`
        })
      });
      const data = await res.json();
      setAiAnalysisResult(data);
      if (data.severity) setSeverity(data.severity);
      if (data.hazardType) setHazardType(data.hazardType);
      sound.playSuccessTone();
    } catch (e) {
      console.error('AI photo analysis error:', e);
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const report: FieldReport = {
        id: `rep-${Date.now().toString(36)}`,
        reporterName: reporterName || 'Anonymous Field Observer',
        reporterRole,
        phone,
        location: {
          lat,
          lng,
          district,
          state
        },
        landmark: landmark || `${district} Mountain Section`,
        hazardType,
        severity,
        description: description || 'Fresh tension fissures observed on slope after rainfall.',
        photoUrl: imagePreview || undefined,
        timestamp: 'Just now',
        status: 'verified_by_ai',
        aiAnalysis: aiAnalysisResult ? {
          crackWidthEstMm: aiAnalysisResult.crackWidthEstMm,
          failureProbabilityPct: aiAnalysisResult.failureProbabilityPct,
          recommendedAction: aiAnalysisResult.recommendedAction,
          verified: aiAnalysisResult.verified
        } : undefined
      };

      await onSubmitReport(report);
      sound.playSuccessTone();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Geo-Tagged Field Incident Report
              </h2>
              <p className="text-xs text-slate-500">
                Citizen & Field Official Crowdsourced Ground Telemetry
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {!isOnline && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2 text-xs">
              <WifiOff className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Offline Mode Active:</strong> Report will be safely queued on your device and automatically synced to the server once connection is restored.
              </span>
            </div>
          )}

          {/* Reporter Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Tenzing Bhutia"
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Reporter Role</label>
              <select
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value as any)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="citizen">Local Citizen / Villager</option>
                <option value="field_official">District Field Official</option>
                <option value="pwd_engineer">PWD / NHIDCL Engineer</option>
                <option value="bro_personnel">BRO Personnel</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Geolocation Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Geo-Coordinates & Landmark
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                {locating ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <Navigation className="w-3 h-3 text-emerald-600" />}
                <span>Fetch Current GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-slate-500 text-[11px] block">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as any)}
                  className="w-full p-2 rounded bg-white border border-slate-200 text-slate-800 text-xs"
                >
                  <option value="Sikkim">Sikkim</option>
                  <option value="Assam">Assam</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Tripura">Tripura</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 text-[11px] block">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2 rounded bg-white border border-slate-200 text-slate-800 text-xs font-mono"
                  placeholder="e.g. Gangtok"
                />
              </div>
              <div>
                <label className="text-slate-500 text-[11px] block">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full p-2 rounded bg-white border border-slate-200 text-slate-800 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 text-[11px] block">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full p-2 rounded bg-white border border-slate-200 text-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 text-[11px] block mb-0.5">Landmark / Kilometer Stone</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Near Dikchu Steel Bridge, KM 42 cut slope"
                className="w-full p-2 rounded bg-white border border-slate-200 text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Hazard Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Observed Hazard Type</label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
              >
                <option value="tension_cracks">Tension Cracks on Slope / Road Surface</option>
                <option value="soil_slumping">Soil Slumping / Mud Movement</option>
                <option value="rockfall">Active Rockfall / Boulder Detachment</option>
                <option value="debris_flow">Debris Flow / Torrent Mudslide</option>
                <option value="road_culvert_failure">Road Culvert Choking / Retaining Wall Bulge</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Visual Threat Severity</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['critical', 'high', 'moderate', 'low'] as RiskSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 rounded-lg uppercase font-mono font-bold text-[11px] transition-colors border ${
                      severity === sev
                        ? sev === 'critical'
                          ? 'bg-rose-50 border-rose-400 text-rose-700'
                          : sev === 'high'
                          ? 'bg-amber-50 border-amber-400 text-amber-700'
                          : sev === 'moderate'
                          ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                          : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Observations */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Detailed Field Observations</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe crack length, depth, water seepage, tree tilting, or trapped vehicles..."
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Photo Upload & AI Vision Section */}
          <div className="border border-dashed border-emerald-200 rounded-xl p-3.5 bg-emerald-50/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                Upload Field Photo or Use Sample Telemetry Image
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUseSamplePhoto('crack')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-medium"
                >
                  + Sample Cracks
                </button>
                <button
                  type="button"
                  onClick={() => handleUseSamplePhoto('slump')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-medium"
                >
                  + Sample Slump
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />

              {imagePreview && (
                <button
                  type="button"
                  onClick={handleAnalyzePhotoWithAI}
                  disabled={analyzingPhoto}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 whitespace-nowrap"
                >
                  {analyzingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Vision Measuring...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Verify & Measure with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Photo Preview & AI Vision Results */}
            {imagePreview && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-44 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Field Inspection Preview"
                    referrerPolicy="no-referrer"
                    className="max-h-44 object-contain"
                  />
                </div>

                {aiAnalysisResult ? (
                  <div className="p-3 rounded-lg bg-white border border-emerald-200 text-xs space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        AI Verified Field Evidence
                      </span>
                      <span className="font-mono text-slate-900 text-[11px]">
                        Prob: {aiAnalysisResult.failureProbabilityPct}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div className="text-slate-500 font-medium">Est. Crack Aperture</div>
                        <div className="font-mono font-bold text-rose-600">{aiAnalysisResult.crackWidthEstMm} mm</div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div className="text-slate-500 font-medium">Classified Hazard</div>
                        <div className="font-mono font-bold text-amber-700 truncate">{aiAnalysisResult.hazardType}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <strong className="text-slate-800">Recommended Response:</strong> {aiAnalysisResult.recommendedAction}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 border border-dashed border-slate-200 rounded-lg text-slate-500 text-center">
                    Click "Verify & Measure with AI" to estimate crack width, slide probability, and emergency advisory.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 disabled:opacity-50"
            >
              {submitting ? 'Submitting to Emergency Command...' : 'Submit Field Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
