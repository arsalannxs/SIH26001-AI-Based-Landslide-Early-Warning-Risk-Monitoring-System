import { FieldReport } from '../types/disaster';

const OFFLINE_QUEUE_KEY = 'ner_drishti_offline_reports_queue';

export function getOfflineReports(): FieldReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed reading offline queue:', e);
    return [];
  }
}

export function saveOfflineReport(report: FieldReport): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOfflineReports();
    current.push({ ...report, offlineCreated: true });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed saving offline report:', e);
  }
}

export function clearOfflineReport(reportId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOfflineReports();
    const filtered = current.filter(r => r.id !== reportId);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed clearing offline report:', e);
  }
}

export async function syncOfflineReports(): Promise<{ syncedCount: number; errors: number }> {
  const reports = getOfflineReports();
  if (reports.length === 0) return { syncedCount: 0, errors: 0 };

  let syncedCount = 0;
  let errors = 0;

  for (const report of reports) {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...report, offlineCreated: false })
      });
      if (res.ok) {
        clearOfflineReport(report.id);
        syncedCount++;
      } else {
        errors++;
      }
    } catch (e) {
      errors++;
    }
  }

  return { syncedCount, errors };
}
