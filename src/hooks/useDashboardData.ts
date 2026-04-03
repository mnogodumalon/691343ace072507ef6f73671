import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Leistungskatalog, Impressum, Kundendaten } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [leistungskatalog, setLeistungskatalog] = useState<Leistungskatalog[]>([]);
  const [impressum, setImpressum] = useState<Impressum[]>([]);
  const [kundendaten, setKundendaten] = useState<Kundendaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [leistungskatalogData, impressumData, kundendatenData] = await Promise.all([
        LivingAppsService.getLeistungskatalog(),
        LivingAppsService.getImpressum(),
        LivingAppsService.getKundendaten(),
      ]);
      setLeistungskatalog(leistungskatalogData);
      setImpressum(impressumData);
      setKundendaten(kundendatenData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [leistungskatalogData, impressumData, kundendatenData] = await Promise.all([
          LivingAppsService.getLeistungskatalog(),
          LivingAppsService.getImpressum(),
          LivingAppsService.getKundendaten(),
        ]);
        setLeistungskatalog(leistungskatalogData);
        setImpressum(impressumData);
        setKundendaten(kundendatenData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const leistungskatalogMap = useMemo(() => {
    const m = new Map<string, Leistungskatalog>();
    leistungskatalog.forEach(r => m.set(r.record_id, r));
    return m;
  }, [leistungskatalog]);

  return { leistungskatalog, setLeistungskatalog, impressum, setImpressum, kundendaten, setKundendaten, loading, error, fetchAll, leistungskatalogMap };
}