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
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { KundendatenDialog } from '@/components/dialogs/KundendatenDialog';
import { LeistungskatalogDialog } from '@/components/dialogs/LeistungskatalogDialog';
import { AI_PHOTO_SCAN } from '@/config/ai-features';
import {
  IconAlertCircle, IconTool, IconRefresh, IconCheck,
  IconUsers, IconSearch, IconPlus, IconPencil, IconTrash,
  IconCalendar, IconClock, IconList, IconStar
} from '@tabler/icons-react';

const APPGROUP_ID = '691343ace072507ef6f73671';
const REPAIR_ENDPOINT = '/claude/build/repair';

// Collect all appointment fields (up to 10)
const TERMIN_KEYS = Array.from({ length: 10 }, (_, i) => i + 1);

function getLatestTermin(k: EnrichedKundendaten): { datum: string; leistung: string; dauer: string } | null {
  let latest: { datum: string; leistung: string; dauer: string } | null = null;
  for (const n of TERMIN_KEYS) {
    const datumKey = n === 1 ? 'letzter_termin_1' : `letzter_termin_${n}`;
    const datum = (k.fields as any)[datumKey];
    if (!datum) continue;
    const leistungNameKey = `letzter_termin_${n}_leistungName` as keyof EnrichedKundendaten;
    const dauerKey = `letzter_termin_${n}_dauer`;
    const leistung = String((k as any)[leistungNameKey] ?? '');
    const dauerVal = (k.fields as any)[dauerKey];
    const dauer = dauerVal?.label ?? '';
    if (!latest || datum > latest.datum) {
      latest = { datum, leistung, dauer };
    }
  }
  return latest;
}

function getAllTermine(k: EnrichedKundendaten): { datum: string; leistung: string; dauer: string }[] {
  const termine: { datum: string; leistung: string; dauer: string }[] = [];
  for (const n of TERMIN_KEYS) {
    const datumKey = n === 1 ? 'letzter_termin_1' : `letzter_termin_${n}`;
    const datum = (k.fields as any)[datumKey];
    if (!datum) continue;
    const leistungNameKey = `letzter_termin_${n}_leistungName` as keyof EnrichedKundendaten;
    const dauerKey = `letzter_termin_${n}_dauer`;
    const leistung = String((k as any)[leistungNameKey] ?? '');
    const dauerVal = (k.fields as any)[dauerKey];
    const dauer = dauerVal?.label ?? '';
    termine.push({ datum, leistung, dauer });
  }
  return termine.sort((a, b) => b.datum.localeCompare(a.datum));
}

export default function DashboardOverview() {
  const {
    leistungskatalog, kundendaten,
    leistungskatalogMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const enrichedKundendaten = enrichKundendaten(kundendaten, { leistungskatalogMap });

  const [search, setSearch] = useState('');
  const [selectedKunde, setSelectedKunde] = useState<EnrichedKundendaten | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editKunde, setEditKunde] = useState<EnrichedKundendaten | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedKundendaten | null>(null);
  const [leistungDialogOpen, setLeistungDialogOpen] = useState(false);
  const [editLeistung, setEditLeistung] = useState<Leistungskatalog | null>(null);
  const [deleteLeistungTarget, setDeleteLeistungTarget] = useState<Leistungskatalog | null>(null);
  const [activeTab, setActiveTab] = useState<'kunden' | 'leistungen'>('kunden');

  const filteredKunden = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return enrichedKundendaten;
    return enrichedKundendaten.filter(k => {
      const name = `${k.fields.vorname ?? ''} ${k.fields.nachname ?? ''}`.toLowerCase();
      const email = (k.fields.email ?? '').toLowerCase();
      const tel = (k.fields.telefon ?? '').toLowerCase();
      return name.includes(q) || email.includes(q) || tel.includes(q);
    });
  }, [enrichedKundendaten, search]);

  const filteredLeistungen = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return leistungskatalog;
    return leistungskatalog.filter(l =>
      (l.fields.leistungsname ?? '').toLowerCase().includes(q) ||
      (l.fields.beschreibung ?? '').toLowerCase().includes(q)
    );
  }, [leistungskatalog, search]);

  // KPI stats
  const totalKunden = enrichedKundendaten.length;
  const totalLeistungen = leistungskatalog.length;
  const avgPreis = leistungskatalog.length > 0
    ? leistungskatalog.reduce((s, l) => s + (l.fields.preis ?? 0), 0) / leistungskatalog.length
    : 0;
  const kundenMitTermin = enrichedKundendaten.filter(k => getLatestTermin(k) !== null).length;

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const handleDeleteKunde = async () => {
    if (!deleteTarget) return;
    await LivingAppsService.deleteKundendatenEntry(deleteTarget.record_id);
    setDeleteTarget(null);
    if (selectedKunde?.record_id === deleteTarget.record_id) setSelectedKunde(null);
    fetchAll();
  };

  const handleDeleteLeistung = async () => {
    if (!deleteLeistungTarget) return;
    await LivingAppsService.deleteLeistungskatalogEntry(deleteLeistungTarget.record_id);
    setDeleteLeistungTarget(null);
    fetchAll();
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Kunden"
          value={String(totalKunden)}
          description="Gesamt registriert"
          icon={<IconUsers size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Mit Terminen"
          value={String(kundenMitTermin)}
          description="Haben Behandlungen"
          icon={<IconCalendar size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Leistungen"
          value={String(totalLeistungen)}
          description="Im Katalog"
          icon={<IconList size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Ø Preis"
          value={avgPreis > 0 ? formatCurrency(avgPreis) : '—'}
          description="Durchschnittspreis"
          icon={<IconStar size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Tab Bar + Search + Add */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-border overflow-hidden shrink-0">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'kunden' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'}`}
            onClick={() => { setActiveTab('kunden'); setSearch(''); setSelectedKunde(null); }}
          >
            Kunden
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'leistungen' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'}`}
            onClick={() => { setActiveTab('leistungen'); setSearch(''); setSelectedKunde(null); }}
          >
            Leistungskatalog
          </button>
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none shrink-0" />
          <Input
            className="pl-9"
            placeholder={activeTab === 'kunden' ? 'Kunde suchen…' : 'Leistung suchen…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {activeTab === 'kunden' ? (
          <Button size="sm" className="shrink-0" onClick={() => { setEditKunde(null); setDialogOpen(true); }}>
            <IconPlus size={16} className="shrink-0" />
            <span className="hidden sm:inline ml-1">Neuer Kunde</span>
          </Button>
        ) : (
          <Button size="sm" className="shrink-0" onClick={() => { setEditLeistung(null); setLeistungDialogOpen(true); }}>
            <IconPlus size={16} className="shrink-0" />
            <span className="hidden sm:inline ml-1">Neue Leistung</span>
          </Button>
        )}
      </div>

      {/* Main Content */}
      {activeTab === 'kunden' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Kundenliste */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm text-foreground">
                {filteredKunden.length} Kunde{filteredKunden.length !== 1 ? 'n' : ''}
              </h2>
            </div>
            {filteredKunden.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <IconUsers size={40} className="text-muted-foreground" stroke={1.5} />
                <p className="text-sm text-muted-foreground">
                  {search ? 'Kein Treffer' : 'Noch keine Kunden'}
                </p>
                {!search && (
                  <Button size="sm" variant="outline" onClick={() => { setEditKunde(null); setDialogOpen(true); }}>
                    <IconPlus size={14} className="mr-1 shrink-0" />Ersten Kunden anlegen
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border overflow-y-auto max-h-[520px]">
                {filteredKunden.map(k => {
                  const name = [k.fields.vorname, k.fields.nachname].filter(Boolean).join(' ') || 'Unbekannt';
                  const latest = getLatestTermin(k);
                  const isSelected = selectedKunde?.record_id === k.record_id;
                  return (
                    <div
                      key={k.record_id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => setSelectedKunde(isSelected ? null : k)}
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {(k.fields.vorname?.[0] ?? '?').toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {latest ? `Letzter Termin: ${formatDate(latest.datum)}` : k.fields.email ?? 'Keine Termine'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={e => { e.stopPropagation(); setEditKunde(k); setDialogOpen(true); }}
                        >
                          <IconPencil size={14} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={e => { e.stopPropagation(); setDeleteTarget(k); }}
                        >
                          <IconTrash size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kunden-Detail / Behandlungshistorie */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {selectedKunde ? (
              <>
                <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-sm text-foreground truncate">
                      {[selectedKunde.fields.vorname, selectedKunde.fields.nachname].filter(Boolean).join(' ')}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">{selectedKunde.fields.email ?? ''}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => { setEditKunde(selectedKunde); setDialogOpen(true); }}>
                    <IconPencil size={14} className="mr-1 shrink-0" />Bearbeiten
                  </Button>
                </div>
                {/* Kontakt */}
                <div className="px-4 py-3 border-b border-border grid grid-cols-2 gap-2 text-sm">
                  {selectedKunde.fields.telefon && (
                    <div>
                      <p className="text-xs text-muted-foreground">Telefon</p>
                      <p className="font-medium truncate">{selectedKunde.fields.telefon}</p>
                    </div>
                  )}
                  {(selectedKunde.fields.strasse || selectedKunde.fields.stadt) && (
                    <div>
                      <p className="text-xs text-muted-foreground">Adresse</p>
                      <p className="font-medium truncate">
                        {[selectedKunde.fields.strasse, selectedKunde.fields.hausnummer].filter(Boolean).join(' ')}{selectedKunde.fields.stadt ? `, ${selectedKunde.fields.stadt}` : ''}
                      </p>
                    </div>
                  )}
                </div>
                {/* Behandlungshistorie */}
                <div className="px-4 py-3">
                  <h3 className="text-xs font-medium text-muted-foreground mb-3">Behandlungshistorie</h3>
                  {(() => {
                    const termine = getAllTermine(selectedKunde);
                    if (termine.length === 0) {
                      return (
                        <div className="flex flex-col items-center py-8 gap-2">
                          <IconCalendar size={32} className="text-muted-foreground" stroke={1.5} />
                          <p className="text-sm text-muted-foreground">Noch keine Termine eingetragen</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2 overflow-y-auto max-h-72">
                        {termine.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/40 px-3 py-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <IconCalendar size={14} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">
                                {t.leistung || '—'}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground">{formatDate(t.datum)}</span>
                                {t.dauer && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <IconClock size={11} className="shrink-0" />{t.dauer} Min.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
                <IconUsers size={40} className="text-muted-foreground" stroke={1.5} />
                <p className="text-sm text-muted-foreground">Kunden auswählen für Details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Leistungskatalog */
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">
              {filteredLeistungen.length} Leistung{filteredLeistungen.length !== 1 ? 'en' : ''}
            </h2>
          </div>
          {filteredLeistungen.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <IconList size={40} className="text-muted-foreground" stroke={1.5} />
              <p className="text-sm text-muted-foreground">
                {search ? 'Kein Treffer' : 'Noch keine Leistungen'}
              </p>
              {!search && (
                <Button size="sm" variant="outline" onClick={() => { setEditLeistung(null); setLeistungDialogOpen(true); }}>
                  <IconPlus size={14} className="mr-1 shrink-0" />Erste Leistung anlegen
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Leistung</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Dauer</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Preis</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Gutschein</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeistungen.map(l => (
                    <tr key={l.record_id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground truncate max-w-[180px]">{l.fields.leistungsname ?? '—'}</p>
                        {l.fields.beschreibung && (
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">{l.fields.beschreibung}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                        {l.fields.dauer_minuten ? `${l.fields.dauer_minuten} Min.` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {l.fields.preis != null ? formatCurrency(l.fields.preis) : '—'}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {l.fields.gutschein_code ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-green-500/10 text-green-700 text-xs font-medium">
                            {l.fields.gutschein_code}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => { setEditLeistung(l); setLeistungDialogOpen(true); }}
                          >
                            <IconPencil size={14} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteLeistungTarget(l)}
                          >
                            <IconTrash size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <KundendatenDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (fields) => {
          if (editKunde) {
            await LivingAppsService.updateKundendatenEntry(editKunde.record_id, fields);
          } else {
            await LivingAppsService.createKundendatenEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={editKunde?.fields}
        leistungskatalogList={leistungskatalog}
        enablePhotoScan={AI_PHOTO_SCAN['Kundendaten']}
      />

      <LeistungskatalogDialog
        open={leistungDialogOpen}
        onClose={() => setLeistungDialogOpen(false)}
        onSubmit={async (fields) => {
          if (editLeistung) {
            await LivingAppsService.updateLeistungskatalogEntry(editLeistung.record_id, fields);
          } else {
            await LivingAppsService.createLeistungskatalogEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={editLeistung?.fields}
        enablePhotoScan={AI_PHOTO_SCAN['Leistungskatalog']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Kunde löschen"
        description={`Möchtest du ${[deleteTarget?.fields.vorname, deleteTarget?.fields.nachname].filter(Boolean).join(' ')} wirklich löschen?`}
        onConfirm={handleDeleteKunde}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteLeistungTarget}
        title="Leistung löschen"
        description={`Möchtest du "${deleteLeistungTarget?.fields.leistungsname ?? 'diese Leistung'}" wirklich löschen?`}
        onConfirm={handleDeleteLeistung}
        onClose={() => setDeleteLeistungTarget(null)}
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
      <div className="flex gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-80 rounded-2xl" />
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
