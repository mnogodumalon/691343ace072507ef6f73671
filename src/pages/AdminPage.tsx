import { useState, useMemo, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { Leistungskatalog2, Leistungskatalog, Impressum, Terminanfrage, Kundendaten } from '@/types/app';
import { LivingAppsService, extractRecordId, cleanFieldsForApi } from '@/services/livingAppsService';
import { Leistungskatalog2Dialog } from '@/components/dialogs/Leistungskatalog2Dialog';
import { Leistungskatalog2ViewDialog } from '@/components/dialogs/Leistungskatalog2ViewDialog';
import { LeistungskatalogDialog } from '@/components/dialogs/LeistungskatalogDialog';
import { LeistungskatalogViewDialog } from '@/components/dialogs/LeistungskatalogViewDialog';
import { ImpressumDialog } from '@/components/dialogs/ImpressumDialog';
import { ImpressumViewDialog } from '@/components/dialogs/ImpressumViewDialog';
import { TerminanfrageDialog } from '@/components/dialogs/TerminanfrageDialog';
import { TerminanfrageViewDialog } from '@/components/dialogs/TerminanfrageViewDialog';
import { KundendatenDialog } from '@/components/dialogs/KundendatenDialog';
import { KundendatenViewDialog } from '@/components/dialogs/KundendatenViewDialog';
import { BulkEditDialog } from '@/components/dialogs/BulkEditDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageShell } from '@/components/PageShell';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IconPencil, IconTrash, IconPlus, IconFilter, IconX, IconArrowsUpDown, IconArrowUp, IconArrowDown, IconSearch, IconCopy } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function fmtDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

// Field metadata per entity for bulk edit and column filters
const LEISTUNGSKATALOG2_FIELDS = [
  { key: 'gueltig_von_2', label: 'Gültig von', type: 'date/date' },
  { key: 'gueltig_bis_2', label: 'Gültig bis', type: 'date/date' },
  { key: 'leistungsname_2', label: ' ', type: 'string/text' },
  { key: 'beschreibung_2', label: 'Beschreibung', type: 'string/textarea' },
  { key: 'dauer_minuten_2', label: 'Dauer (Minuten)', type: 'number' },
  { key: 'preis_2', label: 'Preis (EUR)', type: 'number' },
  { key: 'gutschein_code_2', label: 'Gutscheincode', type: 'string/text' },
  { key: 'gutschein_beschreibung_2', label: 'Beschreibung', type: 'string/textarea' },
  { key: 'rabatt_typ_2', label: 'Rabatt-Typ', type: 'lookup/select', options: [{ key: 'prozent', label: 'Prozentualer Rabatt' }, { key: 'betrag', label: 'Fester Betrag' }] },
  { key: 'rabatt_wert_2', label: 'Rabattwert', type: 'number' },
];
const LEISTUNGSKATALOG_FIELDS = [
  { key: 'leistungsname', label: ' ', type: 'string/text' },
  { key: 'beschreibung', label: 'Beschreibung', type: 'string/textarea' },
  { key: 'dauer_minuten', label: 'Dauer (Minuten)', type: 'number' },
  { key: 'preis', label: 'Preis (EUR)', type: 'number' },
  { key: 'gutschein_code', label: 'Gutscheincode', type: 'string/text' },
  { key: 'gutschein_beschreibung', label: 'Beschreibung', type: 'string/textarea' },
  { key: 'rabatt_typ', label: 'Rabatt-Typ', type: 'lookup/select', options: [{ key: 'prozent', label: 'Prozentualer Rabatt' }, { key: 'betrag', label: 'Fester Betrag' }] },
  { key: 'rabatt_wert', label: 'Rabattwert', type: 'number' },
  { key: 'gueltig_von', label: 'Gültig von', type: 'date/date' },
  { key: 'gueltig_bis', label: 'Gültig bis', type: 'date/date' },
];
const IMPRESSUM_FIELDS = [
  { key: 'email_impressum', label: 'E-Mail', type: 'string/email' },
  { key: 'ust_id', label: 'Umsatzsteuer-ID', type: 'string/text' },
  { key: 'rechtliche_hinweise', label: 'Weitere rechtliche Hinweise', type: 'string/textarea' },
  { key: 'inhaber', label: 'Inhaber', type: 'string/text' },
  { key: 'hausnummer_impressum', label: 'Hausnummer', type: 'string/text' },
  { key: 'stadt_impressum', label: 'Stadt', type: 'string/text' },
  { key: 'handelsregister', label: 'Handelsregisternummer', type: 'string/text' },
  { key: 'firmenname', label: 'Firmenname', type: 'string/text' },
  { key: 'strasse_impressum', label: 'Straße', type: 'string/text' },
  { key: 'postleitzahl_impressum', label: 'Postleitzahl', type: 'string/text' },
  { key: 'telefon_impressum', label: 'Telefon', type: 'string/tel' },
  { key: 'aufsichtsbehoerde', label: 'Zuständige Aufsichtsbehörde', type: 'string/text' },
];
const TERMINANFRAGE_FIELDS = [
  { key: 'e_mail_adresse', label: 'E-mail', type: 'string/text' },
  { key: 'anzahl_anwendungen', label: 'Anzahl der Anwendungen', type: 'lookup/select', options: [{ key: 'anzahl_1', label: '1' }, { key: 'anzahl_2', label: '2' }, { key: 'anzahl_3', label: '3' }, { key: 'anzahl_4', label: '4' }, { key: 'anzahl_5', label: '5' }, { key: 'anzahl_6', label: '6' }, { key: 'anzahl_7', label: '7' }, { key: 'anzahl_8', label: '8' }, { key: 'anzahl_9', label: '9' }, { key: 'anzahl_10', label: '10' }] },
  { key: 'gesamtdauer', label: 'Gesamtdauer (Minuten)', type: 'lookup/select', options: [{ key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }, { key: 'dauer_30', label: '30' }] },
  { key: 'kunde_telefon', label: 'Telefon', type: 'string/tel' },
  { key: 'kunde_hausnummer', label: 'Hausnummer', type: 'string/text' },
  { key: 'kunde_stadt', label: 'Stadt', type: 'string/text' },
  { key: 'wunschtermin', label: 'Gewünschter Termin', type: 'date/datetimeminute' },
  { key: 'ausgewaehlte_leistung_2', label: 'Wohlfühlpässe und Aktionen', type: 'applookup/select', targetEntity: 'leistungskatalog_2', targetAppId: 'LEISTUNGSKATALOG_2', displayField: 'leistungsname_2' },
  { key: 'kunde_nachname', label: 'Nachname', type: 'string/text' },
  { key: 'kunde_postleitzahl', label: 'Postleitzahl', type: 'string/text' },
  { key: 'massageleistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'kunde_vorname', label: 'Vorname', type: 'string/text' },
  { key: 'kunde_strasse', label: 'Straße', type: 'string/text' },
  { key: 'anmerkungen', label: 'Besondere Wünsche oder Anmerkungen', type: 'string/textarea' },
  { key: 'ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu', label: 'Ich habe die Allgemeinen Geschäftsbedigungen (AGB) gelesen und stimme diesen hiermit zu', type: 'bool' },
  { key: 'ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen', label: 'Ich habe die Datenschutzerklärung zur Kenntnis genommen', type: 'bool' },
];
const KUNDENDATEN_FIELDS = [
  { key: 'vorname', label: 'Vorname', type: 'string/text' },
  { key: 'nachname', label: 'Nachname', type: 'string/text' },
  { key: 'email', label: 'E-Mail', type: 'string/email' },
  { key: 'telefon', label: 'Telefon', type: 'string/tel' },
  { key: 'strasse', label: 'Straße', type: 'string/text' },
  { key: 'hausnummer', label: 'Hausnummer', type: 'string/text' },
  { key: 'postleitzahl', label: 'Postleitzahl', type: 'string/text' },
  { key: 'stadt', label: 'Stadt', type: 'string/text' },
  { key: 'letzter_termin_5', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_5_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_5_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_6', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_6_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_6_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_1_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_2_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_3_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_4', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_4_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_4_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_7', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_7_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_7_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_8', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_8_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_8_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_9', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_9_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_9_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_10', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_10_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_10_leistung', label: 'Massageleistung', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsname' },
  { key: 'letzter_termin_1', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_1_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_2', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_2_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
  { key: 'letzter_termin_3', label: 'Datum & Uhrzeit', type: 'date/datetimeminute' },
  { key: 'letzter_termin_3_dauer', label: 'Dauer', type: 'lookup/select', options: [{ key: 'dauer_30', label: '30' }, { key: 'dauer_45', label: '45' }, { key: 'dauer_60', label: '60' }] },
];

const ENTITY_TABS = [
  { key: 'leistungskatalog_2', label: 'Leistungskatalog 2', pascal: 'Leistungskatalog2' },
  { key: 'leistungskatalog', label: 'Leistungskatalog', pascal: 'Leistungskatalog' },
  { key: 'impressum', label: 'Impressum', pascal: 'Impressum' },
  { key: 'terminanfrage', label: 'Terminanfrage', pascal: 'Terminanfrage' },
  { key: 'kundendaten', label: 'Kundendaten', pascal: 'Kundendaten' },
] as const;

type EntityKey = typeof ENTITY_TABS[number]['key'];

export default function AdminPage() {
  const data = useDashboardData();
  const { loading, error, fetchAll } = data;

  const [activeTab, setActiveTab] = useState<EntityKey>('leistungskatalog_2');
  const [selectedIds, setSelectedIds] = useState<Record<EntityKey, Set<string>>>(() => ({
    leistungskatalog_2: new Set(),
    leistungskatalog: new Set(),
    impressum: new Set(),
    terminanfrage: new Set(),
    kundendaten: new Set(),
  }));
  const [filters, setFilters] = useState<Record<EntityKey, Record<string, string>>>(() => ({
    leistungskatalog_2: {},
    leistungskatalog: {},
    impressum: {},
    terminanfrage: {},
    kundendaten: {},
  }));
  const [showFilters, setShowFilters] = useState(false);
  const [dialogState, setDialogState] = useState<{ entity: EntityKey; record: any } | null>(null);
  const [createEntity, setCreateEntity] = useState<EntityKey | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<{ entity: EntityKey; ids: string[] } | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState<EntityKey | null>(null);
  const [viewState, setViewState] = useState<{ entity: EntityKey; record: any } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const getRecords = useCallback((entity: EntityKey) => {
    switch (entity) {
      case 'leistungskatalog_2': return (data as any).leistungskatalog2 as Leistungskatalog2[] ?? [];
      case 'leistungskatalog': return (data as any).leistungskatalog as Leistungskatalog[] ?? [];
      case 'impressum': return (data as any).impressum as Impressum[] ?? [];
      case 'terminanfrage': return (data as any).terminanfrage as Terminanfrage[] ?? [];
      case 'kundendaten': return (data as any).kundendaten as Kundendaten[] ?? [];
      default: return [];
    }
  }, [data]);

  const getLookupLists = useCallback((entity: EntityKey) => {
    const lists: Record<string, any[]> = {};
    switch (entity) {
      case 'terminanfrage':
        lists.leistungskatalog_2List = (data as any).leistungskatalog2 ?? [];
        lists.leistungskatalogList = (data as any).leistungskatalog ?? [];
        break;
      case 'kundendaten':
        lists.leistungskatalogList = (data as any).leistungskatalog ?? [];
        break;
    }
    return lists;
  }, [data]);

  const getApplookupDisplay = useCallback((entity: EntityKey, fieldKey: string, url?: unknown) => {
    if (!url) return '—';
    const id = extractRecordId(url);
    if (!id) return '—';
    const lists = getLookupLists(entity);
    void fieldKey; // ensure used for noUnusedParameters
    if (entity === 'terminanfrage' && fieldKey === 'ausgewaehlte_leistung_2') {
      const match = (lists.leistungskatalog_2List ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname_2 ?? '—';
    }
    if (entity === 'terminanfrage' && fieldKey === 'massageleistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_5_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_6_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_1_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_2_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_3_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_4_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_7_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_8_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_9_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    if (entity === 'kundendaten' && fieldKey === 'letzter_termin_10_leistung') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsname ?? '—';
    }
    return String(url);
  }, [getLookupLists]);

  const getFieldMeta = useCallback((entity: EntityKey) => {
    switch (entity) {
      case 'leistungskatalog_2': return LEISTUNGSKATALOG2_FIELDS;
      case 'leistungskatalog': return LEISTUNGSKATALOG_FIELDS;
      case 'impressum': return IMPRESSUM_FIELDS;
      case 'terminanfrage': return TERMINANFRAGE_FIELDS;
      case 'kundendaten': return KUNDENDATEN_FIELDS;
      default: return [];
    }
  }, []);

  const getFilteredRecords = useCallback((entity: EntityKey) => {
    const records = getRecords(entity);
    const s = search.toLowerCase();
    const searched = !s ? records : records.filter((r: any) => {
      return Object.values(r.fields).some((v: any) => {
        if (v == null) return false;
        if (Array.isArray(v)) return v.some((item: any) => typeof item === 'object' && item !== null && 'label' in item ? String((item as any).label).toLowerCase().includes(s) : String(item).toLowerCase().includes(s));
        if (typeof v === 'object' && 'label' in (v as any)) return String((v as any).label).toLowerCase().includes(s);
        return String(v).toLowerCase().includes(s);
      });
    });
    const entityFilters = filters[entity] ?? {};
    const fieldMeta = getFieldMeta(entity);
    return searched.filter((r: any) => {
      return fieldMeta.every((fm: any) => {
        const fv = entityFilters[fm.key];
        if (!fv || fv === '') return true;
        const val = r.fields?.[fm.key];
        if (fm.type === 'bool') {
          if (fv === 'true') return val === true;
          if (fv === 'false') return val !== true;
          return true;
        }
        if (fm.type === 'lookup/select' || fm.type === 'lookup/radio') {
          const label = val && typeof val === 'object' && 'label' in val ? val.label : '';
          return String(label).toLowerCase().includes(fv.toLowerCase());
        }
        if (fm.type.includes('multiplelookup')) {
          if (!Array.isArray(val)) return false;
          return val.some((item: any) => String(item?.label ?? '').toLowerCase().includes(fv.toLowerCase()));
        }
        if (fm.type.includes('applookup')) {
          const display = getApplookupDisplay(entity, fm.key, val);
          return String(display).toLowerCase().includes(fv.toLowerCase());
        }
        return String(val ?? '').toLowerCase().includes(fv.toLowerCase());
      });
    });
  }, [getRecords, filters, getFieldMeta, getApplookupDisplay, search]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(''); setSortDir('asc'); }
    } else { setSortKey(key); setSortDir('asc'); }
  }

  function sortRecords<T extends { fields: Record<string, any> }>(recs: T[]): T[] {
    if (!sortKey) return recs;
    return [...recs].sort((a, b) => {
      let va: any = a.fields[sortKey], vb: any = b.fields[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'object' && 'label' in va) va = va.label;
      if (typeof vb === 'object' && 'label' in vb) vb = vb.label;
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }

  const toggleSelect = useCallback((entity: EntityKey, id: string) => {
    setSelectedIds(prev => {
      const next = { ...prev, [entity]: new Set(prev[entity]) };
      if (next[entity].has(id)) next[entity].delete(id);
      else next[entity].add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((entity: EntityKey) => {
    const filtered = getFilteredRecords(entity);
    setSelectedIds(prev => {
      const allSelected = filtered.every((r: any) => prev[entity].has(r.record_id));
      const next = { ...prev, [entity]: new Set(prev[entity]) };
      if (allSelected) {
        filtered.forEach((r: any) => next[entity].delete(r.record_id));
      } else {
        filtered.forEach((r: any) => next[entity].add(r.record_id));
      }
      return next;
    });
  }, [getFilteredRecords]);

  const clearSelection = useCallback((entity: EntityKey) => {
    setSelectedIds(prev => ({ ...prev, [entity]: new Set() }));
  }, []);

  const getServiceMethods = useCallback((entity: EntityKey) => {
    switch (entity) {
      case 'leistungskatalog_2': return {
        create: (fields: any) => LivingAppsService.createLeistungskatalog2Entry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateLeistungskatalog2Entry(id, fields),
        remove: (id: string) => LivingAppsService.deleteLeistungskatalog2Entry(id),
      };
      case 'leistungskatalog': return {
        create: (fields: any) => LivingAppsService.createLeistungskatalogEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateLeistungskatalogEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteLeistungskatalogEntry(id),
      };
      case 'impressum': return {
        create: (fields: any) => LivingAppsService.createImpressumEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateImpressumEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteImpressumEntry(id),
      };
      case 'terminanfrage': return {
        create: (fields: any) => LivingAppsService.createTerminanfrageEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateTerminanfrageEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteTerminanfrageEntry(id),
      };
      case 'kundendaten': return {
        create: (fields: any) => LivingAppsService.createKundendatenEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateKundendatenEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteKundendatenEntry(id),
      };
      default: return null;
    }
  }, []);

  async function handleCreate(entity: EntityKey, fields: any) {
    const svc = getServiceMethods(entity);
    if (!svc) return;
    await svc.create(fields);
    fetchAll();
    setCreateEntity(null);
  }

  async function handleUpdate(fields: any) {
    if (!dialogState) return;
    const svc = getServiceMethods(dialogState.entity);
    if (!svc) return;
    await svc.update(dialogState.record.record_id, fields);
    fetchAll();
    setDialogState(null);
  }

  async function handleBulkDelete() {
    if (!deleteTargets) return;
    const svc = getServiceMethods(deleteTargets.entity);
    if (!svc) return;
    setBulkLoading(true);
    try {
      for (const id of deleteTargets.ids) {
        await svc.remove(id);
      }
      clearSelection(deleteTargets.entity);
      fetchAll();
    } finally {
      setBulkLoading(false);
      setDeleteTargets(null);
    }
  }

  async function handleBulkClone() {
    const svc = getServiceMethods(activeTab);
    if (!svc) return;
    setBulkLoading(true);
    try {
      const records = getRecords(activeTab);
      const ids = Array.from(selectedIds[activeTab]);
      for (const id of ids) {
        const rec = records.find((r: any) => r.record_id === id);
        if (!rec) continue;
        const clean = cleanFieldsForApi(rec.fields, activeTab);
        await svc.create(clean as any);
      }
      clearSelection(activeTab);
      fetchAll();
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkEdit(fieldKey: string, value: any) {
    if (!bulkEditOpen) return;
    const svc = getServiceMethods(bulkEditOpen);
    if (!svc) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds[bulkEditOpen]);
      for (const id of ids) {
        await svc.update(id, { [fieldKey]: value });
      }
      clearSelection(bulkEditOpen);
      fetchAll();
    } finally {
      setBulkLoading(false);
      setBulkEditOpen(null);
    }
  }

  function updateFilter(entity: EntityKey, fieldKey: string, value: string) {
    setFilters(prev => ({
      ...prev,
      [entity]: { ...prev[entity], [fieldKey]: value },
    }));
  }

  function clearEntityFilters(entity: EntityKey) {
    setFilters(prev => ({ ...prev, [entity]: {} }));
  }

  const activeFilterCount = useMemo(() => {
    const f = filters[activeTab] ?? {};
    return Object.values(f).filter(v => v && v !== '').length;
  }, [filters, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-destructive">{error.message}</p>
        <Button onClick={fetchAll}>Erneut versuchen</Button>
      </div>
    );
  }

  const filtered = getFilteredRecords(activeTab);
  const sel = selectedIds[activeTab];
  const allFiltered = filtered.every((r: any) => sel.has(r.record_id)) && filtered.length > 0;
  const fieldMeta = getFieldMeta(activeTab);

  return (
    <PageShell
      title="Verwaltung"
      subtitle="Alle Daten verwalten"
      action={
        <Button onClick={() => setCreateEntity(activeTab)} className="shrink-0">
          <IconPlus className="h-4 w-4 mr-2" /> Hinzufügen
        </Button>
      }
    >
      <div className="flex gap-2 flex-wrap">
        {ENTITY_TABS.map(tab => {
          const count = getRecords(tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(''); setSortKey(''); setSortDir('asc'); fetchAll(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(f => !f)} className="gap-2">
            <IconFilter className="h-4 w-4" />
            Filtern
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => clearEntityFilters(activeTab)}>
              Filter zurücksetzen
            </Button>
          )}
        </div>
        {sel.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap bg-muted/60 rounded-lg px-3 py-1.5">
            <span className="text-sm font-medium">{sel.size} ausgewählt</span>
            <Button variant="outline" size="sm" onClick={() => setBulkEditOpen(activeTab)}>
              <IconPencil className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Feld bearbeiten</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkClone()}>
              <IconCopy className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Kopieren</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteTargets({ entity: activeTab, ids: Array.from(sel) })}>
              <IconTrash className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Ausgewählte löschen</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => clearSelection(activeTab)}>
              <IconX className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Auswahl aufheben</span>
            </Button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 rounded-lg border bg-muted/30">
          {fieldMeta.map((fm: any) => (
            <div key={fm.key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{fm.label}</label>
              {fm.type === 'bool' ? (
                <Select value={filters[activeTab]?.[fm.key] ?? ''} onValueChange={v => updateFilter(activeTab, fm.key, v === 'all' ? '' : v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Alle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nein</SelectItem>
                  </SelectContent>
                </Select>
              ) : fm.type === 'lookup/select' || fm.type === 'lookup/radio' ? (
                <Select value={filters[activeTab]?.[fm.key] ?? ''} onValueChange={v => updateFilter(activeTab, fm.key, v === 'all' ? '' : v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Alle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    {fm.options?.map((o: any) => (
                      <SelectItem key={o.key} value={o.label}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="h-8 text-xs"
                  placeholder="Filtern..."
                  value={filters[activeTab]?.[fm.key] ?? ''}
                  onChange={e => updateFilter(activeTab, fm.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[27px] bg-card shadow-lg overflow-x-auto">
        <Table className="[&_tbody_td]:px-6 [&_tbody_td]:py-2 [&_tbody_td]:text-base [&_tbody_td]:font-medium [&_tbody_tr:first-child_td]:pt-6 [&_tbody_tr:last-child_td]:pb-10">
          <TableHeader className="bg-secondary">
            <TableRow className="border-b border-input">
              <TableHead className="w-10 px-6">
                <Checkbox
                  checked={allFiltered}
                  onCheckedChange={() => toggleSelectAll(activeTab)}
                />
              </TableHead>
              {fieldMeta.map((fm: any) => (
                <TableHead key={fm.key} className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(fm.key)}>
                  <span className="inline-flex items-center gap-1">
                    {fm.label}
                    {sortKey === fm.key ? (sortDir === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />) : <IconArrowsUpDown size={14} className="opacity-30" />}
                  </span>
                </TableHead>
              ))}
              <TableHead className="w-24 uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortRecords(filtered).map((record: any) => (
              <TableRow key={record.record_id} className={`transition-colors cursor-pointer ${sel.has(record.record_id) ? "bg-primary/5" : "hover:bg-muted/50"}`} onClick={(e) => { if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) return; setViewState({ entity: activeTab, record }); }}>
                <TableCell>
                  <Checkbox
                    checked={sel.has(record.record_id)}
                    onCheckedChange={() => toggleSelect(activeTab, record.record_id)}
                  />
                </TableCell>
                {fieldMeta.map((fm: any) => {
                  const val = record.fields?.[fm.key];
                  if (fm.type === 'bool') {
                    return (
                      <TableCell key={fm.key}>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          val ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {val ? 'Ja' : 'Nein'}
                        </span>
                      </TableCell>
                    );
                  }
                  if (fm.type === 'lookup/select' || fm.type === 'lookup/radio') {
                    return <TableCell key={fm.key}><span className="inline-flex items-center bg-secondary border border-[#bfdbfe] text-[#2563eb] rounded-[10px] px-2 py-1 text-sm font-medium">{val?.label ?? '—'}</span></TableCell>;
                  }
                  if (fm.type.includes('multiplelookup')) {
                    return <TableCell key={fm.key}>{Array.isArray(val) ? val.map((v: any) => v?.label ?? v).join(', ') : '—'}</TableCell>;
                  }
                  if (fm.type.includes('applookup')) {
                    return <TableCell key={fm.key}><span className="inline-flex items-center bg-secondary border border-[#bfdbfe] text-[#2563eb] rounded-[10px] px-2 py-1 text-sm font-medium">{getApplookupDisplay(activeTab, fm.key, val)}</span></TableCell>;
                  }
                  if (fm.type.includes('date')) {
                    return <TableCell key={fm.key} className="text-muted-foreground">{fmtDate(val)}</TableCell>;
                  }
                  if (fm.type.startsWith('file')) {
                    return (
                      <TableCell key={fm.key}>
                        {val ? (
                          <div className="relative h-8 w-8 rounded bg-muted overflow-hidden">
                            <img src={val} alt="" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          </div>
                        ) : '—'}
                      </TableCell>
                    );
                  }
                  if (fm.type === 'string/textarea') {
                    return <TableCell key={fm.key} className="max-w-xs"><span className="truncate block">{val ?? '—'}</span></TableCell>;
                  }
                  if (fm.type === 'geo') {
                    return (
                      <TableCell key={fm.key} className="max-w-[200px]">
                        <span className="truncate block" title={val ? `${val.lat}, ${val.long}` : undefined}>
                          {val?.info ?? (val ? `${val.lat?.toFixed(4)}, ${val.long?.toFixed(4)}` : '—')}
                        </span>
                      </TableCell>
                    );
                  }
                  return <TableCell key={fm.key}>{val ?? '—'}</TableCell>;
                })}
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setDialogState({ entity: activeTab, record })}>
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTargets({ entity: activeTab, ids: [record.record_id] })}>
                      <IconTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={fieldMeta.length + 2} className="text-center py-16 text-muted-foreground">
                  Keine Ergebnisse gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(createEntity === 'leistungskatalog_2' || dialogState?.entity === 'leistungskatalog_2') && (
        <Leistungskatalog2Dialog
          open={createEntity === 'leistungskatalog_2' || dialogState?.entity === 'leistungskatalog_2'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'leistungskatalog_2' ? handleUpdate : (fields: any) => handleCreate('leistungskatalog_2', fields)}
          defaultValues={dialogState?.entity === 'leistungskatalog_2' ? dialogState.record?.fields : undefined}
          enablePhotoScan={AI_PHOTO_SCAN['Leistungskatalog2']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Leistungskatalog2']}
        />
      )}
      {(createEntity === 'leistungskatalog' || dialogState?.entity === 'leistungskatalog') && (
        <LeistungskatalogDialog
          open={createEntity === 'leistungskatalog' || dialogState?.entity === 'leistungskatalog'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'leistungskatalog' ? handleUpdate : (fields: any) => handleCreate('leistungskatalog', fields)}
          defaultValues={dialogState?.entity === 'leistungskatalog' ? dialogState.record?.fields : undefined}
          enablePhotoScan={AI_PHOTO_SCAN['Leistungskatalog']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Leistungskatalog']}
        />
      )}
      {(createEntity === 'impressum' || dialogState?.entity === 'impressum') && (
        <ImpressumDialog
          open={createEntity === 'impressum' || dialogState?.entity === 'impressum'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'impressum' ? handleUpdate : (fields: any) => handleCreate('impressum', fields)}
          defaultValues={dialogState?.entity === 'impressum' ? dialogState.record?.fields : undefined}
          enablePhotoScan={AI_PHOTO_SCAN['Impressum']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Impressum']}
        />
      )}
      {(createEntity === 'terminanfrage' || dialogState?.entity === 'terminanfrage') && (
        <TerminanfrageDialog
          open={createEntity === 'terminanfrage' || dialogState?.entity === 'terminanfrage'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'terminanfrage' ? handleUpdate : (fields: any) => handleCreate('terminanfrage', fields)}
          defaultValues={dialogState?.entity === 'terminanfrage' ? dialogState.record?.fields : undefined}
          leistungskatalog_2List={(data as any).leistungskatalog2 ?? []}
          leistungskatalogList={(data as any).leistungskatalog ?? []}
          enablePhotoScan={AI_PHOTO_SCAN['Terminanfrage']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Terminanfrage']}
        />
      )}
      {(createEntity === 'kundendaten' || dialogState?.entity === 'kundendaten') && (
        <KundendatenDialog
          open={createEntity === 'kundendaten' || dialogState?.entity === 'kundendaten'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'kundendaten' ? handleUpdate : (fields: any) => handleCreate('kundendaten', fields)}
          defaultValues={dialogState?.entity === 'kundendaten' ? dialogState.record?.fields : undefined}
          leistungskatalogList={(data as any).leistungskatalog ?? []}
          enablePhotoScan={AI_PHOTO_SCAN['Kundendaten']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Kundendaten']}
        />
      )}
      {viewState?.entity === 'leistungskatalog_2' && (
        <Leistungskatalog2ViewDialog
          open={viewState?.entity === 'leistungskatalog_2'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'leistungskatalog_2', record: r }); }}
        />
      )}
      {viewState?.entity === 'leistungskatalog' && (
        <LeistungskatalogViewDialog
          open={viewState?.entity === 'leistungskatalog'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'leistungskatalog', record: r }); }}
        />
      )}
      {viewState?.entity === 'impressum' && (
        <ImpressumViewDialog
          open={viewState?.entity === 'impressum'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'impressum', record: r }); }}
        />
      )}
      {viewState?.entity === 'terminanfrage' && (
        <TerminanfrageViewDialog
          open={viewState?.entity === 'terminanfrage'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'terminanfrage', record: r }); }}
          leistungskatalog_2List={(data as any).leistungskatalog2 ?? []}
          leistungskatalogList={(data as any).leistungskatalog ?? []}
        />
      )}
      {viewState?.entity === 'kundendaten' && (
        <KundendatenViewDialog
          open={viewState?.entity === 'kundendaten'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'kundendaten', record: r }); }}
          leistungskatalogList={(data as any).leistungskatalog ?? []}
        />
      )}

      <BulkEditDialog
        open={!!bulkEditOpen}
        onClose={() => setBulkEditOpen(null)}
        onApply={handleBulkEdit}
        fields={bulkEditOpen ? getFieldMeta(bulkEditOpen) : []}
        selectedCount={bulkEditOpen ? selectedIds[bulkEditOpen].size : 0}
        loading={bulkLoading}
        lookupLists={bulkEditOpen ? getLookupLists(bulkEditOpen) : {}}
      />

      <ConfirmDialog
        open={!!deleteTargets}
        onClose={() => setDeleteTargets(null)}
        onConfirm={handleBulkDelete}
        title="Ausgewählte löschen"
        description={`Sollen ${deleteTargets?.ids.length ?? 0} Einträge wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`}
      />
    </PageShell>
  );
}