import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichTerminanfrage, enrichKundendaten } from '@/lib/enrich';
import type { EnrichedTerminanfrage, EnrichedKundendaten } from '@/types/enriched';
import type { Terminanfrage, Kundendaten } from '@/types/app';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TerminanfrageDialog } from '@/components/dialogs/TerminanfrageDialog';
import { KundendatenDialog } from '@/components/dialogs/KundendatenDialog';
import {
  IconAlertCircle, IconPlus, IconUser, IconCalendar, IconClock,
  IconPhone, IconMail, IconTrash, IconPencil, IconUsers,
  IconClipboardList, IconSparkles, IconCheck,
} from '@tabler/icons-react';

export default function DashboardOverview() {
  const {
    leistungskatalog2, leistungskatalog, terminanfrage, kundendaten,
    leistungskatalog2Map, leistungskatalogMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const enrichedTerminanfrage = enrichTerminanfrage(terminanfrage, { leistungskatalog2Map, leistungskatalogMap });
  const enrichedKundendaten = enrichKundendaten(kundendaten, { leistungskatalogMap });

  // Dialog state
  const [terminDialog, setTerminDialog] = useState(false);
  const [editTermin, setEditTermin] = useState<EnrichedTerminanfrage | null>(null);
  const [deleteTermin, setDeleteTermin] = useState<EnrichedTerminanfrage | null>(null);

  const [kundDialog, setKundDialog] = useState(false);
  const [editKunde, setEditKunde] = useState<EnrichedKundendaten | null>(null);
  const [deleteKunde, setDeleteKunde] = useState<EnrichedKundendaten | null>(null);

  const [activeTab, setActiveTab] = useState<'anfragen' | 'kunden'>('anfragen');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const stats = useMemo(() => {
    const heute = new Date();
    const heutStr = heute.toISOString().slice(0, 10);
    const anfrageHeute = enrichedTerminanfrage.filter(t => t.fields.wunschtermin?.slice(0, 10) === heutStr).length;
    const anfrageGesamt = enrichedTerminanfrage.length;
    const kundenGesamt = enrichedKundendaten.length;
    const leistungenGesamt = leistungskatalog.length;
    return { anfrageHeute, anfrageGesamt, kundenGesamt, leistungenGesamt };
  }, [enrichedTerminanfrage, enrichedKundendaten, leistungskatalog]);

  // Filtered lists
  const filteredTermine = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return enrichedTerminanfrage;
    return enrichedTerminanfrage.filter(t =>
      `${t.fields.kunde_vorname} ${t.fields.kunde_nachname}`.toLowerCase().includes(q) ||
      t.fields.e_mail_adresse?.toLowerCase().includes(q) ||
      t.massageleistungName?.toLowerCase().includes(q)
    );
  }, [enrichedTerminanfrage, searchQuery]);

  const filteredKunden = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return enrichedKundendaten;
    return enrichedKundendaten.filter(k =>
      `${k.fields.vorname} ${k.fields.nachname}`.toLowerCase().includes(q) ||
      k.fields.email?.toLowerCase().includes(q) ||
      k.fields.telefon?.toLowerCase().includes(q)
    );
  }, [enrichedKundendaten, searchQuery]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const handleCreateTermin = async (fields: Terminanfrage['fields']) => {
    await LivingAppsService.createTerminanfrageEntry(fields);
    fetchAll();
  };

  const handleUpdateTermin = async (fields: Terminanfrage['fields']) => {
    if (!editTermin) return;
    await LivingAppsService.updateTerminanfrageEntry(editTermin.record_id, fields);
    fetchAll();
  };

  const handleDeleteTermin = async () => {
    if (!deleteTermin) return;
    await LivingAppsService.deleteTerminanfrageEntry(deleteTermin.record_id);
    setDeleteTermin(null);
    fetchAll();
  };

  const handleCreateKunde = async (fields: Kundendaten['fields']) => {
    await LivingAppsService.createKundendatenEntry(fields);
    fetchAll();
  };

  const handleUpdateKunde = async (fields: Kundendaten['fields']) => {
    if (!editKunde) return;
    await LivingAppsService.updateKundendatenEntry(editKunde.record_id, fields);
    fetchAll();
  };

  const handleDeleteKunde = async () => {
    if (!deleteKunde) return;
    await LivingAppsService.deleteKundendatenEntry(deleteKunde.record_id);
    setDeleteKunde(null);
    fetchAll();
  };

  return (
    <div className="space-y-6 p-1">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Terminanfragen"
          value={String(stats.anfrageGesamt)}
          description="Gesamt"
          icon={<IconClipboardList size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Heute"
          value={String(stats.anfrageHeute)}
          description="Anfragen für heute"
          icon={<IconCalendar size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Kunden"
          value={String(stats.kundenGesamt)}
          description="Registriert"
          icon={<IconUsers size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Leistungen"
          value={String(stats.leistungenGesamt)}
          description="Im Katalog"
          icon={<IconSparkles size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Main Workspace */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-4 border-b bg-muted/30">
          {/* Tab toggle */}
          <div className="flex rounded-lg border bg-background overflow-hidden shrink-0">
            <button
              onClick={() => { setActiveTab('anfragen'); setSearchQuery(''); }}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'anfragen' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Terminanfragen
            </button>
            <button
              onClick={() => { setActiveTab('kunden'); setSearchQuery(''); }}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'kunden' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Kundendaten
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[160px]">
            <input
              type="text"
              placeholder={activeTab === 'anfragen' ? 'Suche nach Name, E-Mail...' : 'Suche nach Name, E-Mail...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Add button */}
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => {
              if (activeTab === 'anfragen') {
                setEditTermin(null);
                setTerminDialog(true);
              } else {
                setEditKunde(null);
                setKundDialog(true);
              }
            }}
          >
            <IconPlus size={16} className="shrink-0 mr-1" />
            <span>{activeTab === 'anfragen' ? 'Anfrage' : 'Kunde'}</span>
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'anfragen' ? (
          filteredTermine.length === 0 ? (
            <EmptyState
              icon={<IconClipboardList size={48} stroke={1.5} className="text-muted-foreground" />}
              title="Keine Terminanfragen"
              subtitle={searchQuery ? 'Keine Ergebnisse für Ihre Suche.' : 'Noch keine Anfragen eingegangen.'}
              action={!searchQuery ? (
                <Button size="sm" onClick={() => { setEditTermin(null); setTerminDialog(true); }}>
                  <IconPlus size={16} className="mr-1" />Neue Anfrage
                </Button>
              ) : undefined}
            />
          ) : (
            <div className="divide-y">
              {filteredTermine.map(t => (
                <TerminanfrageCard
                  key={t.record_id}
                  termin={t}
                  onEdit={() => { setEditTermin(t); setTerminDialog(true); }}
                  onDelete={() => setDeleteTermin(t)}
                />
              ))}
            </div>
          )
        ) : (
          filteredKunden.length === 0 ? (
            <EmptyState
              icon={<IconUsers size={48} stroke={1.5} className="text-muted-foreground" />}
              title="Keine Kunden"
              subtitle={searchQuery ? 'Keine Ergebnisse für Ihre Suche.' : 'Noch keine Kunden erfasst.'}
              action={!searchQuery ? (
                <Button size="sm" onClick={() => { setEditKunde(null); setKundDialog(true); }}>
                  <IconPlus size={16} className="mr-1" />Neuer Kunde
                </Button>
              ) : undefined}
            />
          ) : (
            <div className="divide-y">
              {filteredKunden.map(k => (
                <KundendatenCard
                  key={k.record_id}
                  kunde={k}
                  onEdit={() => { setEditKunde(k); setKundDialog(true); }}
                  onDelete={() => setDeleteKunde(k)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Dialogs */}
      <TerminanfrageDialog
        open={terminDialog}
        onClose={() => { setTerminDialog(false); setEditTermin(null); }}
        onSubmit={editTermin ? handleUpdateTermin : handleCreateTermin}
        defaultValues={editTermin?.fields}
        leistungskatalog_2List={leistungskatalog2}
        leistungskatalogList={leistungskatalog}
        enablePhotoScan={AI_PHOTO_SCAN['Terminanfrage']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Terminanfrage']}
      />

      <KundendatenDialog
        open={kundDialog}
        onClose={() => { setKundDialog(false); setEditKunde(null); }}
        onSubmit={editKunde ? handleUpdateKunde : handleCreateKunde}
        defaultValues={editKunde?.fields}
        leistungskatalogList={leistungskatalog}
        enablePhotoScan={AI_PHOTO_SCAN['Kundendaten']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Kundendaten']}
      />

      <ConfirmDialog
        open={!!deleteTermin}
        title="Anfrage löschen"
        description={`Soll die Terminanfrage von ${deleteTermin?.fields.kunde_vorname ?? ''} ${deleteTermin?.fields.kunde_nachname ?? ''} wirklich gelöscht werden?`}
        onConfirm={handleDeleteTermin}
        onClose={() => setDeleteTermin(null)}
      />

      <ConfirmDialog
        open={!!deleteKunde}
        title="Kunde löschen"
        description={`Soll der Kundendatensatz von ${deleteKunde?.fields.vorname ?? ''} ${deleteKunde?.fields.nachname ?? ''} wirklich gelöscht werden?`}
        onConfirm={handleDeleteKunde}
        onClose={() => setDeleteKunde(null)}
      />
    </div>
  );
}

// --- Terminanfrage Card ---
function TerminanfrageCard({
  termin,
  onEdit,
  onDelete,
}: {
  termin: EnrichedTerminanfrage;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { fields } = termin;
  const name = [fields.kunde_vorname, fields.kunde_nachname].filter(Boolean).join(' ') || '(Unbekannt)';
  const isToday = fields.wunschtermin?.slice(0, 10) === new Date().toISOString().slice(0, 10);
  const agbOk = fields.ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu;
  const dsgvoOk = fields.ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground truncate">{name}</span>
          {isToday && <Badge variant="default" className="text-xs shrink-0">Heute</Badge>}
          {agbOk && dsgvoOk && (
            <span className="flex items-center gap-0.5 text-xs text-green-600 shrink-0">
              <IconCheck size={12} /> AGB
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {fields.wunschtermin && (
            <span className="flex items-center gap-1 shrink-0">
              <IconCalendar size={13} className="shrink-0" />
              {formatDate(fields.wunschtermin)}
            </span>
          )}
          {fields.gesamtdauer && (
            <span className="flex items-center gap-1 shrink-0">
              <IconClock size={13} className="shrink-0" />
              {fields.gesamtdauer.label} Min.
            </span>
          )}
          {termin.massageleistungName && (
            <span className="truncate max-w-[200px]">{termin.massageleistungName}</span>
          )}
          {termin.ausgewaehlte_leistung_2Name && !termin.massageleistungName && (
            <span className="truncate max-w-[200px]">{termin.ausgewaehlte_leistung_2Name}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {fields.e_mail_adresse && (
            <span className="flex items-center gap-1">
              <IconMail size={12} className="shrink-0" />
              <span className="truncate max-w-[180px]">{fields.e_mail_adresse}</span>
            </span>
          )}
          {fields.kunde_telefon && (
            <span className="flex items-center gap-1 shrink-0">
              <IconPhone size={12} className="shrink-0" />
              {fields.kunde_telefon}
            </span>
          )}
          {fields.anzahl_anwendungen && (
            <span className="shrink-0">{fields.anzahl_anwendungen.label}× Anwendung</span>
          )}
        </div>

        {fields.anmerkungen && (
          <p className="text-xs text-muted-foreground italic line-clamp-2 mt-0.5">
            „{fields.anmerkungen}"
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Bearbeiten">
          <IconPencil size={15} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} title="Löschen">
          <IconTrash size={15} />
        </Button>
      </div>
    </div>
  );
}

// --- Kundendaten Card ---
function KundendatenCard({
  kunde,
  onEdit,
  onDelete,
}: {
  kunde: EnrichedKundendaten;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { fields } = kunde;
  const name = [fields.vorname, fields.nachname].filter(Boolean).join(' ') || '(Unbekannt)';

  // Find most recent visit
  const terminDates = [
    fields.letzter_termin_1, fields.letzter_termin_2, fields.letzter_termin_3,
    fields.letzter_termin_4, fields.letzter_termin_5, fields.letzter_termin_6,
    fields.letzter_termin_7, fields.letzter_termin_8, fields.letzter_termin_9,
    fields.letzter_termin_10,
  ].filter(Boolean) as string[];

  const terminCount = terminDates.length;
  const latestTermin = terminDates.sort((a, b) => b.localeCompare(a))[0];

  const address = [
    fields.strasse && fields.hausnummer ? `${fields.strasse} ${fields.hausnummer}` : fields.strasse,
    fields.postleitzahl && fields.stadt ? `${fields.postleitzahl} ${fields.stadt}` : fields.stadt,
  ].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground truncate">{name}</span>
          {terminCount > 0 && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {terminCount} Besuch{terminCount !== 1 ? 'e' : ''}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {fields.email && (
            <span className="flex items-center gap-1">
              <IconMail size={13} className="shrink-0" />
              <span className="truncate max-w-[200px]">{fields.email}</span>
            </span>
          )}
          {fields.telefon && (
            <span className="flex items-center gap-1 shrink-0">
              <IconPhone size={13} className="shrink-0" />
              {fields.telefon}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {address && (
            <span className="flex items-center gap-1 truncate max-w-[250px]">
              <IconUser size={12} className="shrink-0" />
              {address}
            </span>
          )}
          {latestTermin && (
            <span className="flex items-center gap-1 shrink-0">
              <IconCalendar size={12} className="shrink-0" />
              Letzter Termin: {formatDate(latestTermin)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Bearbeiten">
          <IconPencil size={15} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} title="Löschen">
          <IconTrash size={15} />
        </Button>
      </div>
    </div>
  );
}

// --- Empty State ---
function EmptyState({ icon, title, subtitle, action }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
      {icon}
      <div className="text-center">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

// --- Loading skeleton ---
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

// --- Error state ---
function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}

