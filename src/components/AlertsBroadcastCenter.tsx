import React, { useState } from 'react';
import { EarlyWarningAlert, HazardZone } from '../types/disaster';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Send, 
  CheckCircle, 
  Globe, 
  AlertTriangle, 
  Users, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { sound } from '../utils/sound';

interface AlertsBroadcastCenterProps {
  alerts: EarlyWarningAlert[];
  zones: HazardZone[];
  onBroadcastNewAlert: (alert: EarlyWarningAlert) => Promise<void>;
}

export const AlertsBroadcastCenter: React.FC<AlertsBroadcastCenterProps> = ({
  alerts,
  zones,
  onBroadcastNewAlert
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  // New Alert Creation Drawer/Form
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [targetZoneId, setTargetZoneId] = useState<string>(zones[0]?.id || '');
  const [alertSeverity, setAlertSeverity] = useState<'critical' | 'high' | 'moderate'>('critical');
  const [customInstructions, setCustomInstructions] = useState<string>(
    'Evacuate downstream habitations immediately. Suspend all non-essential road travel.'
  );
  const [generatingBulletins, setGeneratingBulletins] = useState<boolean>(false);
  const [generatedLanguages, setGeneratedLanguages] = useState<any[]>([]);
  const [smsCounter, setSmsCounter] = useState<number>(14500);

  // Trigger Audio Alert & Siren
  const handlePlaySiren = (severity: 'critical' | 'high' | 'moderate') => {
    sound.playAlertChime(severity);
  };

  // Text to Speech playback for community alert
  const handleSpeakAlert = (alertId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      sound.playAlertChime();
      return;
    }

    if (isPlayingAudio === alertId) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(null);
    utterance.onerror = () => setIsPlayingAudio(null);

    setIsPlayingAudio(alertId);
    sound.playAlertChime();
    window.speechSynthesis.speak(utterance);
  };

  // Generate multilingual alert with AI
  const handleGenerateBulletins = async () => {
    const zone = zones.find(z => z.id === targetZoneId);
    if (!zone) return;

    setGeneratingBulletins(true);
    try {
      const res = await fetch('/api/ai/multilingual-bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: zone.name,
          state: zone.location.state,
          district: zone.location.district,
          severity: alertSeverity,
          instructions: [customInstructions]
        })
      });
      const data = await res.json();
      setGeneratedLanguages(data);
      sound.playSuccessTone();
    } catch (e) {
      console.error('Error generating bulletins:', e);
    } finally {
      setGeneratingBulletins(false);
    }
  };

  // Broadcast Alert
  const handleDispatchAlert = async () => {
    const zone = zones.find(z => z.id === targetZoneId);
    if (!zone) return;

    const newAlert: EarlyWarningAlert = {
      id: `alert-${Date.now().toString(36)}`,
      title: `${alertSeverity === 'critical' ? 'RED ALERT' : 'ORANGE ALERT'}: Slope Failure Warning for ${zone.name}`,
      severity: alertSeverity,
      affectedDistricts: [zone.location.district],
      state: zone.location.state,
      issuedAt: 'Just now',
      validUntil: 'Next 24 Hours',
      headline: `Urgent evacuation and highway restriction directive issued for ${zone.location.district} sector.`,
      instructions: [
        customInstructions,
        'Preposition emergency clearing earthmovers along main arterial cut slopes.',
        'Activate community village council communications.'
      ],
      languages: generatedLanguages.length > 0 ? generatedLanguages : [
        {
          language: 'English',
          headline: `ALERT: Landslide Threat at ${zone.name}`,
          message: customInstructions
        },
        {
          language: 'Hindi',
          headline: `चेतावनी: ${zone.name} में भूस्खलन का खतरा`,
          message: `${zone.location.district} में अत्यधिक वर्षा से पहाड़ी ढलान असुरक्षित है। प्रशासन के दिशा-निर्देशों का पालन करें।`
        },
        {
          language: 'Assamese',
          headline: `সতৰ্কবাৰ্তা: ${zone.name}ত ভূমিস্খলনৰ আশংকা`,
          message: `${zone.location.district}ত নেৰানেপেৰা বৰষুণৰ বাবে পাহাৰ খহি পৰাৰ সম্ভাৱনা। নিৰাপদ স্থানত আশ্ৰয় লওক।`
        }
      ],
      smsSentCount: smsCounter,
      evacuationRecommended: alertSeverity === 'critical'
    };

    await onBroadcastNewAlert(newAlert);
    sound.playAlertChime(alertSeverity);
    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Broadcast CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
            Automated Early Warning & Multilingual Broadcast Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time emergency sirens, SMS cellular push, and local vernacular broadcasts for remote NER communities.
          </p>
        </div>

        <button
          onClick={() => {
            setShowDispatchModal(true);
            if (generatedLanguages.length === 0) handleGenerateBulletins();
          }}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Emergency Alert Broadcast</span>
        </button>
      </div>

      {/* Language Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
        <span className="text-slate-500 font-medium mr-1 flex items-center gap-1 shrink-0">
          <Globe className="w-3.5 h-3.5 text-emerald-600" /> Dialect / Language:
        </span>
        {['English', 'Hindi', 'Assamese', 'Bengali', 'Mizo', 'Manipuri'].map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
              selectedLanguage === lang
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {lang === 'Assamese' ? 'অসমীয়া (Assamese)' : lang === 'Bengali' ? 'বাংলা (Bengali)' : lang === 'Hindi' ? 'हिन्दी (Hindi)' : lang}
          </button>
        ))}
      </div>

      {/* Active Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const activeLangContent = alert.languages?.find(l => l.language.toLowerCase() === selectedLanguage.toLowerCase()) 
            || alert.languages?.[0];

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border p-5 transition-all bg-white shadow-xs ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-100'
                  : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      isCritical
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {alert.severity} Alert
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {alert.state} ({alert.affectedDistricts.join(', ')})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {alert.issuedAt}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-mono font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    {alert.smsSentCount.toLocaleString()} SMS Dispatched
                  </span>
                </div>
              </div>

              {/* Multilingual Headline and Message */}
              <div className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                      [{selectedLanguage} Broadcast Feed]
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {activeLangContent?.headline || alert.headline}
                    </h3>
                  </div>

                  {/* Sound Trigger / Speech synthesis */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePlaySiren(alert.severity as any)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors"
                      title="Sound Emergency Siren"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSpeakAlert(alert.id, activeLangContent?.message || alert.headline)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>{isPlayingAudio === alert.id ? 'Stop Speech' : 'Play Loudspeaker'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {activeLangContent?.message || alert.instructions.join('. ')}
                </p>
              </div>

              {/* Action Directives */}
              <div className="pt-2 text-xs space-y-1.5">
                <div className="text-slate-700 font-bold">Immediate Civil Protection Directives:</div>
                <ul className="space-y-1 text-slate-600">
                  {alert.instructions.map((inst, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch Emergency Broadcast Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                Dispatch Automated Early Warning Broadcast
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Target Vulnerable Hazard Zone:</label>
                <select
                  value={targetZoneId}
                  onChange={(e) => setTargetZoneId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.location.district}, {z.location.state}) - Risk: {z.riskScore}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Alert Severity Level:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['critical', 'high', 'moderate'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setAlertSeverity(sev)}
                      className={`p-2 rounded-lg border text-center uppercase font-mono font-bold text-xs ${
                        alertSeverity === sev
                          ? sev === 'critical' ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-amber-50 border-amber-400 text-amber-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sev} Alert
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Emergency Evacuation Directive:</label>
                <textarea
                  rows={2}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* AI Multilingual Translator button */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-slate-600 text-[11px] font-medium">Synthesize in 6 NER regional languages:</span>
                <button
                  type="button"
                  onClick={handleGenerateBulletins}
                  disabled={generatingBulletins}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{generatingBulletins ? 'Translating with AI...' : 'Generate Multi-lingual Bulletins'}</span>
                </button>
              </div>

              {generatedLanguages.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-40 overflow-y-auto space-y-2 text-[11px]">
                  {generatedLanguages.map((item, idx) => (
                    <div key={idx} className="pb-1.5 border-b border-slate-200/80 last:border-0">
                      <div className="font-bold text-slate-800">{item.language}:</div>
                      <div className="text-slate-600">{item.headline}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchAlert}
                className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-700/20"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Publish Broadcast & Send SMS ({smsCounter.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
