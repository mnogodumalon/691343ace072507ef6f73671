import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Leistungskatalog2, Leistungskatalog, Impressum, Terminanfrage, Kundendaten } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [leistungskatalog2, setLeistungskatalog2] = useState<Leistungskatalog2[]>([]);
  const [leistungskatalog, setLeistungskatalog] = useState<Leistungskatalog[]>([]);
  const [impressum, setImpressum] = useState<Impressum[]>([]);
  const [terminanfrage, setTerminanfrage] = useState<Terminanfrage[]>([]);
  const [kundendaten, setKundendaten] = useState<Kundendaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [leistungskatalog2Data, leistungskatalogData, impressumData, terminanfrageData, kundendatenData] = await Promise.all([
        LivingAppsService.getLeistungskatalog2(),
        LivingAppsService.getLeistungskatalog(),
        LivingAppsService.getImpressum(),
        LivingAppsService.getTerminanfrage(),
        LivingAppsService.getKundendaten(),
      ]);
      setLeistungskatalog2(leistungskatalog2Data);
      setLeistungskatalog(leistungskatalogData);
      setImpressum(impressumData);
      setTerminanfrage(terminanfrageData);
      setKundendaten(kundendatenData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const leistungskatalog2Map = useMemo(() => {
    const m = new Map<string, Leistungskatalog2>();
    leistungskatalog2.forEach(r => m.set(r.record_id, r));
    return m;
  }, [leistungskatalog2]);

  const leistungskatalogMap = useMemo(() => {
    const m = new Map<string, Leistungskatalog>();
    leistungskatalog.forEach(r => m.set(r.record_id, r));
    return m;
  }, [leistungskatalog]);

  return { leistungskatalog2, setLeistungskatalog2, leistungskatalog, setLeistungskatalog, impressum, setImpressum, terminanfrage, setTerminanfrage, kundendaten, setKundendaten, loading, error, fetchAll, leistungskatalog2Map, leistungskatalogMap };
}