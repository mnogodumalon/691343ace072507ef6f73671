import type { EnrichedKundendaten, EnrichedTerminanfrage } from '@/types/enriched';
import type { Kundendaten, Leistungskatalog, Leistungskatalog2, Terminanfrage } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface TerminanfrageMaps {
  leistungskatalog2Map: Map<string, Leistungskatalog2>;
  leistungskatalogMap: Map<string, Leistungskatalog>;
}

export function enrichTerminanfrage(
  terminanfrage: Terminanfrage[],
  maps: TerminanfrageMaps
): EnrichedTerminanfrage[] {
  return terminanfrage.map(r => ({
    ...r,
    ausgewaehlte_leistung_2Name: resolveDisplay(r.fields.ausgewaehlte_leistung_2, maps.leistungskatalog2Map, 'leistungsname_2'),
    massageleistungName: resolveDisplay(r.fields.massageleistung, maps.leistungskatalogMap, 'leistungsname'),
  }));
}

interface KundendatenMaps {
  leistungskatalogMap: Map<string, Leistungskatalog>;
}

export function enrichKundendaten(
  kundendaten: Kundendaten[],
  maps: KundendatenMaps
): EnrichedKundendaten[] {
  return kundendaten.map(r => ({
    ...r,
    letzter_termin_5_leistungName: resolveDisplay(r.fields.letzter_termin_5_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_6_leistungName: resolveDisplay(r.fields.letzter_termin_6_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_1_leistungName: resolveDisplay(r.fields.letzter_termin_1_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_2_leistungName: resolveDisplay(r.fields.letzter_termin_2_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_3_leistungName: resolveDisplay(r.fields.letzter_termin_3_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_4_leistungName: resolveDisplay(r.fields.letzter_termin_4_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_7_leistungName: resolveDisplay(r.fields.letzter_termin_7_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_8_leistungName: resolveDisplay(r.fields.letzter_termin_8_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_9_leistungName: resolveDisplay(r.fields.letzter_termin_9_leistung, maps.leistungskatalogMap, 'leistungsname'),
    letzter_termin_10_leistungName: resolveDisplay(r.fields.letzter_termin_10_leistung, maps.leistungskatalogMap, 'leistungsname'),
  }));
}
