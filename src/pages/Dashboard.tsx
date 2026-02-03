import { useState, useEffect, useMemo } from 'react';
import type { Terminanfrage, Kundendaten, Leistungskatalog } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO, formatDistance, isToday, isThisWeek, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Plus,
  CalendarDays,
  User,
} from 'lucide-react';

// Types for enriched data
interface EnrichedTerminanfrage extends Terminanfrage {
  leistungName?: string;
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Hero skeleton */}
      <Skeleton className="h-48 w-full rounded-lg mb-6" />

      {/* Stats row skeleton */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-28 flex-shrink-0 rounded-lg" />
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ onAddBooking }: { onAddBooking: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
        <CheckCircle className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Keine offenen Anfragen</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Alle Terminanfragen wurden bearbeitet. Neue Anfragen erscheinen hier automatisch.
      </p>
      <Button onClick={onAddBooking}>
        <Plus className="h-4 w-4 mr-2" />
        Neue Buchung erstellen
      </Button>
    </div>
  );
}

// Error state component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error.message}</p>
          <Button variant="outline" onClick={onRetry}>
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// New booking form component
function NewBookingForm({
  leistungen,
  onSubmit,
  submitting,
}: {
  leistungen: Leistungskatalog[];
  onSubmit: (data: Terminanfrage['fields']) => Promise<void>;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState({
    kunde_vorname: '',
    kunde_nachname: '',
    kunde_telefon: '',
    e_mail_adresse: '',
    wunschtermin_date: '',
    wunschtermin_time: '',
    gesamtdauer: '' as 'dauer_30' | 'dauer_45' | 'dauer_60' | '',
    massageleistung_id: '',
    anmerkungen: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const wunschtermin = formData.wunschtermin_date && formData.wunschtermin_time
      ? `${formData.wunschtermin_date}T${formData.wunschtermin_time}`
      : undefined;

    const data: Terminanfrage['fields'] = {
      kunde_vorname: formData.kunde_vorname || undefined,
      kunde_nachname: formData.kunde_nachname || undefined,
      kunde_telefon: formData.kunde_telefon || undefined,
      e_mail_adresse: formData.e_mail_adresse || undefined,
      wunschtermin,
      gesamtdauer: formData.gesamtdauer || undefined,
      massageleistung: formData.massageleistung_id
        ? createRecordUrl(APP_IDS.LEISTUNGSKATALOG, formData.massageleistung_id)
        : undefined,
      anmerkungen: formData.anmerkungen || undefined,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vorname">Vorname</Label>
          <Input
            id="vorname"
            value={formData.kunde_vorname}
            onChange={(e) => setFormData({ ...formData, kunde_vorname: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nachname">Nachname</Label>
          <Input
            id="nachname"
            value={formData.kunde_nachname}
            onChange={(e) => setFormData({ ...formData, kunde_nachname: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefon">Telefon</Label>
        <Input
          id="telefon"
          type="tel"
          value={formData.kunde_telefon}
          onChange={(e) => setFormData({ ...formData, kunde_telefon: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.e_mail_adresse}
          onChange={(e) => setFormData({ ...formData, e_mail_adresse: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="datum">Datum</Label>
          <Input
            id="datum"
            type="date"
            value={formData.wunschtermin_date}
            onChange={(e) => setFormData({ ...formData, wunschtermin_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zeit">Uhrzeit</Label>
          <Input
            id="zeit"
            type="time"
            value={formData.wunschtermin_time}
            onChange={(e) => setFormData({ ...formData, wunschtermin_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dauer">Dauer</Label>
        <Select
          value={formData.gesamtdauer || 'none'}
          onValueChange={(v) => setFormData({ ...formData, gesamtdauer: v === 'none' ? '' : v as 'dauer_30' | 'dauer_45' | 'dauer_60' })}
        >
          <SelectTrigger id="dauer">
            <SelectValue placeholder="Dauer auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Bitte auswählen</SelectItem>
            <SelectItem value="dauer_30">30 Minuten</SelectItem>
            <SelectItem value="dauer_45">45 Minuten</SelectItem>
            <SelectItem value="dauer_60">60 Minuten</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="leistung">Massage-Leistung</Label>
        <Select
          value={formData.massageleistung_id || 'none'}
          onValueChange={(v) => setFormData({ ...formData, massageleistung_id: v === 'none' ? '' : v })}
        >
          <SelectTrigger id="leistung">
            <SelectValue placeholder="Leistung auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Bitte auswählen</SelectItem>
            {leistungen.map((l) => (
              <SelectItem key={l.record_id} value={l.record_id}>
                {l.fields.leistungsname || 'Unbenannt'} {l.fields.preis ? `(${l.fields.preis}€)` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="anmerkungen">Anmerkungen</Label>
        <Textarea
          id="anmerkungen"
          value={formData.anmerkungen}
          onChange={(e) => setFormData({ ...formData, anmerkungen: e.target.value })}
          placeholder="Besondere Wünsche oder Hinweise..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Wird gespeichert...' : 'Buchung erstellen'}
      </Button>
    </form>
  );
}

// Appointment card component
function AppointmentCard({
  anfrage,
  onClick,
  index,
}: {
  anfrage: EnrichedTerminanfrage;
  onClick: () => void;
  index: number;
}) {
  const customerName = [anfrage.fields.kunde_vorname, anfrage.fields.kunde_nachname]
    .filter(Boolean)
    .join(' ') || 'Unbekannter Kunde';

  const wunschtermin = anfrage.fields.wunschtermin
    ? format(parseISO(anfrage.fields.wunschtermin), 'dd.MM.yyyy HH:mm', { locale: de })
    : 'Kein Termin';

  const timeAgo = formatDistance(parseISO(anfrage.createdat), new Date(), {
    addSuffix: true,
    locale: de,
  });

  const durationMap: Record<string, string> = {
    dauer_30: '30 Min.',
    dauer_45: '45 Min.',
    dauer_60: '60 Min.',
  };

  return (
    <div
      className="bg-card rounded-lg border border-border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Left accent border */}
        <div className="w-1 h-full min-h-[60px] bg-primary rounded-full flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{customerName}</h3>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {timeAgo}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-2 truncate">
            {anfrage.leistungName || 'Keine Leistung angegeben'}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {wunschtermin}
            </span>
            {anfrage.fields.gesamtdauer && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {durationMap[anfrage.fields.gesamtdauer] || anfrage.fields.gesamtdauer}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail sheet for appointment
function AppointmentDetailSheet({
  anfrage,
  open,
  onOpenChange,
}: {
  anfrage: EnrichedTerminanfrage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!anfrage) return null;

  const customerName = [anfrage.fields.kunde_vorname, anfrage.fields.kunde_nachname]
    .filter(Boolean)
    .join(' ') || 'Unbekannter Kunde';

  const wunschtermin = anfrage.fields.wunschtermin
    ? format(parseISO(anfrage.fields.wunschtermin), 'EEEE, dd. MMMM yyyy, HH:mm', { locale: de })
    : 'Kein Termin angegeben';

  const durationMap: Record<string, string> = {
    dauer_30: '30 Minuten',
    dauer_45: '45 Minuten',
    dauer_60: '60 Minuten',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl">{customerName}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto">
          {/* Termin info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Termindetails
            </h4>
            <div className="bg-accent/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{wunschtermin}</span>
              </div>
              {anfrage.fields.gesamtdauer && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{durationMap[anfrage.fields.gesamtdauer]}</span>
                </div>
              )}
              {anfrage.leistungName && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{anfrage.leistungName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Kontakt */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Kontakt
            </h4>
            <div className="space-y-2">
              {anfrage.fields.kunde_telefon && (
                <a
                  href={`tel:${anfrage.fields.kunde_telefon}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <span>{anfrage.fields.kunde_telefon}</span>
                </a>
              )}
              {anfrage.fields.e_mail_adresse && (
                <a
                  href={`mailto:${anfrage.fields.e_mail_adresse}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="truncate">{anfrage.fields.e_mail_adresse}</span>
                </a>
              )}
            </div>
          </div>

          {/* Anmerkungen */}
          {anfrage.fields.anmerkungen && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Anmerkungen
              </h4>
              <p className="text-sm bg-muted/50 rounded-lg p-4">
                {anfrage.fields.anmerkungen}
              </p>
            </div>
          )}

          {/* Adresse */}
          {(anfrage.fields.kunde_strasse || anfrage.fields.kunde_stadt) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Adresse
              </h4>
              <p className="text-sm">
                {[
                  [anfrage.fields.kunde_strasse, anfrage.fields.kunde_hausnummer].filter(Boolean).join(' '),
                  [anfrage.fields.kunde_postleitzahl, anfrage.fields.kunde_stadt].filter(Boolean).join(' '),
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Stats pill component
function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full flex-shrink-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

// Weekly chart component
function WeeklyChart({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Main Dashboard component
export default function Dashboard() {
  const [terminanfragen, setTerminanfragen] = useState<Terminanfrage[]>([]);
  const [kunden, setKunden] = useState<Kundendaten[]>([]);
  const [leistungen, setLeistungen] = useState<Leistungskatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedAnfrage, setSelectedAnfrage] = useState<EnrichedTerminanfrage | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [terminanfragenData, kundenData, leistungenData] = await Promise.all([
        LivingAppsService.getTerminanfrage(),
        LivingAppsService.getKundendaten(),
        LivingAppsService.getLeistungskatalog(),
      ]);
      setTerminanfragen(terminanfragenData);
      setKunden(kundenData);
      setLeistungen(leistungenData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create leistungen lookup map
  const leistungenMap = useMemo(() => {
    const map = new Map<string, Leistungskatalog>();
    leistungen.forEach((l) => map.set(l.record_id, l));
    return map;
  }, [leistungen]);

  // Enrich terminanfragen with leistung names
  const enrichedAnfragen: EnrichedTerminanfrage[] = useMemo(() => {
    return terminanfragen.map((anfrage) => {
      const leistungId = extractRecordId(anfrage.fields.massageleistung);
      const leistung = leistungId ? leistungenMap.get(leistungId) : null;
      return {
        ...anfrage,
        leistungName: leistung?.fields.leistungsname,
      };
    }).sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime());
  }, [terminanfragen, leistungenMap]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();

    const todayAppointments = terminanfragen.filter((t) => {
      if (!t.fields.wunschtermin) return false;
      return isToday(parseISO(t.fields.wunschtermin));
    }).length;

    const weekAppointments = terminanfragen.filter((t) => {
      if (!t.fields.wunschtermin) return false;
      return isThisWeek(parseISO(t.fields.wunschtermin), { locale: de });
    }).length;

    const totalCustomers = kunden.length;

    return {
      openRequests: terminanfragen.length,
      todayAppointments,
      weekAppointments,
      totalCustomers,
    };
  }, [terminanfragen, kunden]);

  // Weekly chart data
  const weeklyChartData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: de });
    const weekEnd = endOfWeek(now, { locale: de });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day) => {
      const count = terminanfragen.filter((t) => {
        if (!t.fields.wunschtermin) return false;
        return isSameDay(parseISO(t.fields.wunschtermin), day);
      }).length;

      return {
        name: format(day, 'EEE', { locale: de }),
        count,
      };
    });
  }, [terminanfragen]);

  // Handle new booking submission
  const handleSubmitBooking = async (data: Terminanfrage['fields']) => {
    setSubmitting(true);
    try {
      await LivingAppsService.createTerminanfrageEntry(data);
      setDialogOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle card click
  const handleCardClick = (anfrage: EnrichedTerminanfrage) => {
    setSelectedAnfrage(anfrage);
    setSheetOpen(true);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <h1 className="text-lg font-semibold">Mein Massage-Studio</h1>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <User className="h-4 w-4 text-accent-foreground" />
          </div>
        </header>

        <div className="p-4 pb-24">
          {/* Hero KPI */}
          <div
            className="bg-accent rounded-xl p-6 mb-6 text-center animate-fade-in-up"
            style={{ animationDelay: '0ms' }}
          >
            <div className="relative inline-flex items-center justify-center">
              <span className="text-6xl font-bold text-accent-foreground">
                {stats.openRequests}
              </span>
              {stats.openRequests > 0 && (
                <span className="absolute -top-1 -right-3 w-3 h-3 bg-primary rounded-full animate-pulse-dot" />
              )}
            </div>
            <p className="text-accent-foreground/80 mt-2 font-medium">Offene Anfragen</p>
          </div>

          {/* Quick Stats Row */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
            <StatPill icon={Calendar} value={stats.todayAppointments} label="Heute" />
            <StatPill icon={CalendarDays} value={stats.weekAppointments} label="Diese Woche" />
            <StatPill icon={Users} value={stats.totalCustomers} label="Kunden" />
          </div>

          {/* Appointment Requests Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Neue Anfragen</h2>
              {enrichedAnfragen.length > 0 && (
                <Badge variant="secondary">{enrichedAnfragen.length}</Badge>
              )}
            </div>

            {enrichedAnfragen.length === 0 ? (
              <EmptyState onAddBooking={() => setDialogOpen(true)} />
            ) : (
              <div className="space-y-3">
                {enrichedAnfragen.slice(0, 10).map((anfrage, index) => (
                  <AppointmentCard
                    key={anfrage.record_id}
                    anfrage={anfrage}
                    onClick={() => handleCardClick(anfrage)}
                    index={index}
                  />
                ))}
                {enrichedAnfragen.length > 10 && (
                  <Button variant="outline" className="w-full">
                    Alle {enrichedAnfragen.length} Anfragen anzeigen
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Fixed Bottom Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-base">
                <Plus className="h-5 w-5 mr-2" />
                Neue Buchung
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neue Buchung erstellen</DialogTitle>
              </DialogHeader>
              <NewBookingForm
                leistungen={leistungen}
                onSubmit={handleSubmitBooking}
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Detail Sheet */}
        <AppointmentDetailSheet
          anfrage={selectedAnfrage}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border bg-card p-6 flex flex-col">
          {/* Logo/Title */}
          <h1 className="text-xl font-semibold mb-8">Mein Massage-Studio</h1>

          {/* Hero KPI */}
          <div
            className="bg-accent rounded-xl p-6 text-center mb-6 animate-fade-in-up"
            style={{ animationDelay: '0ms' }}
          >
            <div className="relative inline-flex items-center justify-center">
              <span className="text-7xl font-bold text-accent-foreground">
                {stats.openRequests}
              </span>
              {stats.openRequests > 0 && (
                <span className="absolute -top-1 -right-4 w-3.5 h-3.5 bg-primary rounded-full animate-pulse-dot" />
              )}
            </div>
            <p className="text-accent-foreground/80 mt-2 font-medium">Offene Anfragen</p>
          </div>

          {/* Secondary Stats */}
          <div className="space-y-3">
            <Card
              className="animate-fade-in-up hover:shadow-md transition-shadow"
              style={{ animationDelay: '100ms' }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayAppointments}</p>
                  <p className="text-sm text-muted-foreground">Termine heute</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="animate-fade-in-up hover:shadow-md transition-shadow"
              style={{ animationDelay: '200ms' }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.weekAppointments}</p>
                  <p className="text-sm text-muted-foreground">Termine diese Woche</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="animate-fade-in-up hover:shadow-md transition-shadow"
              style={{ animationDelay: '300ms' }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">Kunden gesamt</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Terminanfragen</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Buchung
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Neue Buchung erstellen</DialogTitle>
                </DialogHeader>
                <NewBookingForm
                  leistungen={leistungen}
                  onSubmit={handleSubmitBooking}
                  submitting={submitting}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Appointment List - Takes 2 columns */}
            <div className="xl:col-span-2">
              {enrichedAnfragen.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <EmptyState onAddBooking={() => setDialogOpen(true)} />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {enrichedAnfragen.slice(0, 10).map((anfrage, index) => (
                    <AppointmentCard
                      key={anfrage.record_id}
                      anfrage={anfrage}
                      onClick={() => handleCardClick(anfrage)}
                      index={index}
                    />
                  ))}
                  {enrichedAnfragen.length > 10 && (
                    <Button variant="outline" className="w-full">
                      Alle {enrichedAnfragen.length} Anfragen anzeigen
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Weekly Chart */}
            <div className="xl:col-span-1">
              <Card
                className="animate-fade-in-up"
                style={{ animationDelay: '400ms' }}
              >
                <CardHeader>
                  <CardTitle className="text-base">Buchungen diese Woche</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeeklyChart data={weeklyChartData} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Desktop Detail Sheet */}
        <AppointmentDetailSheet
          anfrage={selectedAnfrage}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </div>
  );
}
