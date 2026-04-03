import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichKundendaten } from '@/lib/enrich';
import type { EnrichedKundendaten } from '@/types/enriched';
import type { Leistungskatalog } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { KundendatenDialog } from '@/components/dialogs/KundendatenDialog';
import { LeistungskatalogDialog } from '@/components/dialogs/LeistungskatalogDialog';
import {
  IconAlertCircle, IconTool, IconRefresh, IconCheck,
  IconPlus, IconPencil, IconTrash, IconSearch, IconUser,
  IconClock, IconCalendar, IconTag, IconMassage, IconSparkles,
  IconPhone, IconMail, IconMapPin, IconChevronRight,
} from '@tabler/icons-react';
import { AI_PHOTO_SCAN } from '@/config/ai-features';
import type { CreateKundendaten, CreateLeistungskatalog } from '@/types/app';

const APPGROUP_ID = '691343ace072507ef6f73671';
const REPAIR_ENDPOINT = '/claude/build/repair';

// Helper: alle Termine eines Kunden gesammelt sortiert
interface Termin {
  date: string;
  dauer: string;
  leistungName: string;
  index: number;
}

function getTermine(k: EnrichedKundendaten): Termin[] {
  const entries: Termin[] = [];
  const pairs: [string | undefined, string | undefined, string, number][] = [
    [k.fields.letzter_termin_1, k.fields.letzter_termin_1_dauer?.label, k.letzter_termin_1_leistungName, 1],
    [k.fields.letzter_termin_2, k.fields.letzter_termin_2_dauer?.label, k.letzter_termin_2_leistungName, 2],
    [k.fields.letzter_termin_3, k.fields.letzter_termin_3_dauer?.label, k.letzter_termin_3_leistungName, 3],
    [k.fields.letzter_termin_4, k.fields.letzter_termin_4_dauer?.label, k.letzter_termin_4_leistungName, 4],
    [k.fields.letzter_termin_5, k.fields.letzter_termin_5_dauer?.label, k.letzter_termin_5_leistungName, 5],
    [k.fields.letzter_termin_6, k.fields.letzter_termin_6_dauer?.label, k.letzter_termin_6_leistungName, 6],
    [k.fields.letzter_termin_7, k.fields.letzter_termin_7_dauer?.label, k.letzter_termin_7_leistungName, 7],
    [k.fields.letzter_termin_8, k.fields.letzter_termin_8_dauer?.label, k.letzter_termin_8_leistungName, 8],
    [k.fields.letzter_termin_9, k.fields.letzter_termin_9_dauer?.label, k.letzter_termin_9_leistungName, 9],
    [k.fields.letzter_termin_10, k.fields.letzter_termin_10_dauer?.label, k.letzter_termin_10_leistungName, 10],
  ];
  for (const [date, dauer, leistungName, idx] of pairs) {
    if (date) entries.push({ date, dauer: dauer ?? '', leistungName, index: idx });
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

function getLatestTermin(k: EnrichedKundendaten): string | null {
  const termine = getTermine(k);
  return termine.length > 0 ? termine[0].date : null;
}

export default function DashboardOverview() {
  const {
    leistungskatalog, kundendaten,
    leistungskatalogMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const enrichedKundendaten = enrichKundendaten(kundendaten, { leistungskatalogMap });

  // --- State (alle Hooks vor early returns!) ---
  const [search, setSearch] = useState('');
  const [selectedKunde, setSelectedKunde] = useState<EnrichedKundendaten | null>(null);
  const [kundeDialogOpen, setKundeDialogOpen] = useState(false);
  const [editKunde, setEditKunde] = useState<EnrichedKundendaten | null>(null);
  const [deleteKunde, setDeleteKunde] = useState<EnrichedKundendaten | null>(null);
  const [leistungDialogOpen, setLeistungDialogOpen] = useState(false);
  const [editLeistung, setEditLeistung] = useState<Leistungskatalog | null>(null);
  const [deleteLeistung, setDeleteLeistung] = useState<Leistungskatalog | null>(null);
  const [activeTab, setActiveTab] = useState<'kunden' | 'leistungen' | 'gutscheine'>('kunden');

  const filteredKunden = useMemo(() => {
    const q = search.toLowerCase();
    return enrichedKundendaten.filter(k => {
      const name = `${k.fields.vorname ?? ''} ${k.fields.nachname ?? ''}`.toLowerCase();
      return name.includes(q) || (k.fields.email ?? '').toLowerCase().includes(q) || (k.fields.telefon ?? '').toLowerCase().includes(q);
    }).sort((a, b) => {
      const la = getLatestTermin(a) ?? '';
      const lb = getLatestTermin(b) ?? '';
      return lb.localeCompare(la);
    });
  }, [enrichedKundendaten, search]);

  const leistungenMitGutschein = useMemo(() =>
    leistungskatalog.filter(l => l.fields.gutschein_code),
    [leistungskatalog]
  );

  const avgPreis = useMemo(() => {
    const prices = leistungskatalog.filter(l => l.fields.preis != null).map(l => l.fields.preis!);
    return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  }, [leistungskatalog]);

  // Sync selectedKunde nach fetchAll
  const syncedSelected = useMemo(() => {
    if (!selectedKunde) return null;
    return enrichedKundendaten.find(k => k.record_id === selectedKunde.record_id) ?? null;
  }, [enrichedKundendaten, selectedKunde]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const displaySelected = syncedSelected;

  const handleCreateKunde = async (fields: CreateKundendaten) => {
    await LivingAppsService.createKundendatenEntry(fields);
    fetchAll();
  };

  const handleUpdateKunde = async (fields: CreateKundendaten) => {
    if (!editKunde) return;
    await LivingAppsService.updateKundendatenEntry(editKunde.record_id, fields);
    fetchAll();
  };

  const handleDeleteKunde = async () => {
    if (!deleteKunde) return;
    await LivingAppsService.deleteKundendatenEntry(deleteKunde.record_id);
    if (selectedKunde?.record_id === deleteKunde.record_id) setSelectedKunde(null);
    setDeleteKunde(null);
    fetchAll();
  };

  const handleCreateLeistung = async (fields: CreateLeistungskatalog) => {
    await LivingAppsService.createLeistungskatalogEntry(fields);
    fetchAll();
  };

  const handleUpdateLeistung = async (fields: CreateLeistungskatalog) => {
    if (!editLeistung) return;
    await LivingAppsService.updateLeistungskatalogEntry(editLeistung.record_id, fields);
    fetchAll();
  };

  const handleDeleteLeistung = async () => {
    if (!deleteLeistung) return;
    await LivingAppsService.deleteLeistungskatalogEntry(deleteLeistung.record_id);
    setDeleteLeistung(null);
    fetchAll();
  };

  return (
    <div className="space-y-6">
      {/* KPI-Zeile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Kunden"
          value={String(kundendaten.length)}
          description="Gesamt"
          icon={<IconUser size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Leistungen"
          value={String(leistungskatalog.length)}
          description="Im Katalog"
          icon={<IconMassage size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Gutscheine"
          value={String(leistungenMitGutschein.length)}
          description="Aktive Codes"
          icon={<IconTag size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Ø Preis"
          value={avgPreis > 0 ? formatCurrency(avgPreis) : '–'}
          description="Durchschnitt"
          icon={<IconSparkles size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-full sm:w-auto sm:inline-flex">
        {(['kunden', 'leistungen', 'gutscheine'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'kunden' ? 'Kunden' : tab === 'leistungen' ? 'Leistungen' : 'Gutscheine'}
          </button>
        ))}
      </div>

      {/* Kunden Tab */}
      {activeTab === 'kunden' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Kundenliste */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Suchen..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Button size="sm" className="shrink-0" onClick={() => { setEditKunde(null); setKundeDialogOpen(true); }}>
                <IconPlus size={14} className="mr-1 shrink-0" />
                <span className="hidden sm:inline">Neu</span>
              </Button>
            </div>

            {filteredKunden.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <IconUser size={40} className="text-muted-foreground" stroke={1.5} />
                <p className="text-sm text-muted-foreground">
                  {search ? 'Keine Kunden gefunden' : 'Noch keine Kunden angelegt'}
                </p>
                {!search && (
                  <Button size="sm" variant="outline" onClick={() => { setEditKunde(null); setKundeDialogOpen(true); }}>
                    <IconPlus size={14} className="mr-1" />Ersten Kunden anlegen
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1 overflow-y-auto max-h-[60vh]">
                {filteredKunden.map(k => {
                  const latestDate = getLatestTermin(k);
                  const isSelected = displaySelected?.record_id === k.record_id;
                  return (
                    <button
                      key={k.record_id}
                      onClick={() => setSelectedKunde(k)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/60 border border-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {(k.fields.vorname?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {k.fields.vorname} {k.fields.nachname}
                        </div>
                        {latestDate && (
                          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <IconCalendar size={11} className="shrink-0" />
                            {formatDate(latestDate)}
                          </div>
                        )}
                      </div>
                      <IconChevronRight size={14} className="text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kundendetail */}
          <div className="lg:col-span-3">
            {!displaySelected ? (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
                <IconUser size={40} className="text-muted-foreground" stroke={1.5} />
                <p className="text-sm text-muted-foreground">Wähle einen Kunden aus der Liste</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Kopfzeile */}
                <div className="px-5 py-4 bg-muted/40 border-b border-border flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg font-bold text-primary">
                    {(displaySelected.fields.vorname?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base truncate">
                      {displaySelected.fields.vorname} {displaySelected.fields.nachname}
                    </h2>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {displaySelected.fields.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconMail size={12} className="shrink-0" />{displaySelected.fields.email}
                        </span>
                      )}
                      {displaySelected.fields.telefon && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconPhone size={12} className="shrink-0" />{displaySelected.fields.telefon}
                        </span>
                      )}
                      {displaySelected.fields.stadt && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconMapPin size={12} className="shrink-0" />{displaySelected.fields.stadt}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditKunde(displaySelected); setKundeDialogOpen(true); }}
                      className="h-8 w-8 p-0"
                    >
                      <IconPencil size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteKunde(displaySelected)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                </div>

                {/* Terminverlauf */}
                <div className="px-5 py-4">
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Terminverlauf</h3>
                  {(() => {
                    const termine = getTermine(displaySelected);
                    if (termine.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground text-center py-4">Noch keine Termine erfasst</p>
                      );
                    }
                    return (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {termine.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/40">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <IconCalendar size={14} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {t.leistungName || 'Termin'}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <IconCalendar size={11} className="shrink-0" />{formatDate(t.date)}
                                </span>
                                {t.dauer && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <IconClock size={11} className="shrink-0" />{t.dauer} Min.
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">#{t.index}</Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leistungen Tab */}
      {activeTab === 'leistungen' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Leistungskatalog</h2>
            <Button size="sm" onClick={() => { setEditLeistung(null); setLeistungDialogOpen(true); }}>
              <IconPlus size={14} className="mr-1 shrink-0" />Neue Leistung
            </Button>
          </div>
          {leistungskatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
              <IconMassage size={40} className="text-muted-foreground" stroke={1.5} />
              <p className="text-sm text-muted-foreground">Noch keine Leistungen angelegt</p>
              <Button size="sm" variant="outline" onClick={() => { setEditLeistung(null); setLeistungDialogOpen(true); }}>
                <IconPlus size={14} className="mr-1" />Erste Leistung anlegen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {leistungskatalog.map(l => (
                <div key={l.record_id} className="bg-card border border-border rounded-2xl p-4 overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm truncate flex-1 min-w-0">{l.fields.leistungsname || '–'}</h3>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { setEditLeistung(l); setLeistungDialogOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <IconPencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteLeistung(l)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </div>
                  {l.fields.beschreibung && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{l.fields.beschreibung}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {l.fields.preis != null && (
                      <Badge variant="secondary" className="text-xs">
                        {formatCurrency(l.fields.preis)}
                      </Badge>
                    )}
                    {l.fields.dauer_minuten != null && (
                      <Badge variant="outline" className="text-xs">
                        <IconClock size={10} className="mr-1 shrink-0" />{l.fields.dauer_minuten} Min.
                      </Badge>
                    )}
                    {l.fields.rabatt_typ?.label && (
                      <Badge variant="outline" className="text-xs text-primary border-primary/30">
                        {l.fields.rabatt_typ.label}
                      </Badge>
                    )}
                  </div>
                  {(l.fields.gueltig_von || l.fields.gueltig_bis) && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <IconCalendar size={11} className="shrink-0" />
                      {l.fields.gueltig_von && formatDate(l.fields.gueltig_von)}
                      {l.fields.gueltig_von && l.fields.gueltig_bis && ' – '}
                      {l.fields.gueltig_bis && formatDate(l.fields.gueltig_bis)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gutscheine Tab */}
      {activeTab === 'gutscheine' && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Aktive Gutscheine</h2>
          {leistungenMitGutschein.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
              <IconTag size={40} className="text-muted-foreground" stroke={1.5} />
              <p className="text-sm text-muted-foreground">Noch keine Gutschein-Codes hinterlegt</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Füge einer Leistung im Tab "Leistungen" einen Gutscheincode hinzu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {leistungenMitGutschein.map(l => (
                <div key={l.record_id} className="bg-card border border-border rounded-2xl p-4 overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <IconTag size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-sm tracking-wide truncate">
                        {l.fields.gutschein_code}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{l.fields.leistungsname}</div>
                    </div>
                  </div>
                  {l.fields.gutschein_beschreibung && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{l.fields.gutschein_beschreibung}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {l.fields.rabatt_wert != null && l.fields.rabatt_typ?.key === 'prozent' && (
                      <Badge className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300/50">
                        {l.fields.rabatt_wert}% Rabatt
                      </Badge>
                    )}
                    {l.fields.rabatt_wert != null && l.fields.rabatt_typ?.key === 'betrag' && (
                      <Badge className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300/50">
                        {formatCurrency(l.fields.rabatt_wert)} Rabatt
                      </Badge>
                    )}
                    {l.fields.preis != null && (
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(l.fields.preis)}
                      </Badge>
                    )}
                  </div>
                  {(l.fields.gueltig_von || l.fields.gueltig_bis) && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <IconCalendar size={11} className="shrink-0" />
                      Gültig: {l.fields.gueltig_von && formatDate(l.fields.gueltig_von)}
                      {l.fields.gueltig_von && l.fields.gueltig_bis && ' – '}
                      {l.fields.gueltig_bis && formatDate(l.fields.gueltig_bis)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialoge */}
      <KundendatenDialog
        open={kundeDialogOpen}
        onClose={() => { setKundeDialogOpen(false); setEditKunde(null); }}
        onSubmit={async (fields) => {
          if (editKunde) {
            await handleUpdateKunde(fields);
          } else {
            await handleCreateKunde(fields);
          }
        }}
        defaultValues={editKunde?.fields}
        leistungskatalogList={leistungskatalog}
        enablePhotoScan={AI_PHOTO_SCAN['Kundendaten']}
      />

      <LeistungskatalogDialog
        open={leistungDialogOpen}
        onClose={() => { setLeistungDialogOpen(false); setEditLeistung(null); }}
        onSubmit={async (fields) => {
          if (editLeistung) {
            await handleUpdateLeistung(fields);
          } else {
            await handleCreateLeistung(fields);
          }
        }}
        defaultValues={editLeistung?.fields}
        enablePhotoScan={AI_PHOTO_SCAN['Leistungskatalog']}
      />

      <ConfirmDialog
        open={!!deleteKunde}
        title="Kunden löschen"
        description={`Möchtest du ${deleteKunde?.fields.vorname} ${deleteKunde?.fields.nachname} wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDeleteKunde}
        onClose={() => setDeleteKunde(null)}
      />

      <ConfirmDialog
        open={!!deleteLeistung}
        title="Leistung löschen"
        description={`Möchtest du "${deleteLeistung?.fields.leistungsname ?? 'diese Leistung'}" wirklich löschen?`}
        onConfirm={handleDeleteLeistung}
        onClose={() => setDeleteLeistung(null)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-10 w-64 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <Skeleton className="h-9 w-full rounded-lg" />
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const [repairing, setRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState('');
  const [repairDone, setRepairDone] = useState(false);
  const [repairFailed, setRepairFailed] = useState(false);

  const handleRepair = async () => {
    setRepairing(true);
    setRepairStatus('Reparatur wird gestartet...');
    setRepairFailed(false);

    const errorContext = JSON.stringify({
      type: 'data_loading',
      message: error.message,
      stack: (error.stack ?? '').split('\n').slice(0, 10).join('\n'),
      url: window.location.href,
    });

    try {
      const resp = await fetch(REPAIR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appgroup_id: APPGROUP_ID, error_context: errorContext }),
      });

      if (!resp.ok || !resp.body) {
        setRepairing(false);
        setRepairFailed(true);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data: ')) continue;
          const content = line.slice(6);
          if (content.startsWith('[STATUS]')) {
            setRepairStatus(content.replace(/^\[STATUS]\s*/, ''));
          }
          if (content.startsWith('[DONE]')) {
            setRepairDone(true);
            setRepairing(false);
          }
          if (content.startsWith('[ERROR]') && !content.includes('Dashboard-Links')) {
            setRepairFailed(true);
          }
        }
      }
    } catch {
      setRepairing(false);
      setRepairFailed(true);
    }
  };

  if (repairDone) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <IconCheck size={22} className="text-green-500" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">Dashboard repariert</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Das Problem wurde behoben. Bitte laden Sie die Seite neu.</p>
        </div>
        <Button size="sm" onClick={() => window.location.reload()}>
          <IconRefresh size={14} className="mr-1" />Neu laden
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {repairing ? repairStatus : error.message}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry} disabled={repairing}>Erneut versuchen</Button>
        <Button size="sm" onClick={handleRepair} disabled={repairing}>
          {repairing
            ? <span className="inline-block w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
            : <IconTool size={14} className="mr-1" />}
          {repairing ? 'Reparatur läuft...' : 'Dashboard reparieren'}
        </Button>
      </div>
      {repairFailed && <p className="text-sm text-destructive">Automatische Reparatur fehlgeschlagen. Bitte kontaktieren Sie den Support.</p>}
    </div>
  );
}
