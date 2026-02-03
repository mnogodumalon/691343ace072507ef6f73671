import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isToday, isTomorrow, isThisWeek, addDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Clock, Users, FileText, Plus, AlertCircle } from 'lucide-react';

import type { Terminanfrage, Leistungskatalog, Kundendaten } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';

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
  DialogFooter,
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

// Duration mapping
const DURATION_MAP: Record<string, string> = {
  'dauer_30': '30 Min',
  'dauer_45': '45 Min',
  'dauer_60': '60 Min',
};

// Helper to format time from datetime string
function formatTime(dateString: string | undefined): string {
  if (!dateString) return '--:--';
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm', { locale: de });
  } catch {
    return '--:--';
  }
}

// Helper to format date
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE, d. MMMM', { locale: de });
  } catch {
    return '';
  }
}

// Helper to get day label
function getDayLabel(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Heute';
    if (isTomorrow(date)) return 'Morgen';
    return format(date, 'EEEE, d. MMM', { locale: de });
  } catch {
    return '';
  }
}

// Group appointments by day
function groupByDay(appointments: Terminanfrage[]): Map<string, Terminanfrage[]> {
  const groups = new Map<string, Terminanfrage[]>();

  appointments.forEach(apt => {
    if (!apt.fields.wunschtermin) return;
    const dateKey = apt.fields.wunschtermin.split('T')[0];
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(apt);
  });

  // Sort each group by time
  groups.forEach((apts, key) => {
    groups.set(key, apts.sort((a, b) => {
      const timeA = a.fields.wunschtermin || '';
      const timeB = b.fields.wunschtermin || '';
      return timeA.localeCompare(timeB);
    }));
  });

  return groups;
}

// Loading state component
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
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

// Empty appointments state
function EmptyAppointments() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
        <Calendar className="h-8 w-8 text-accent-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Keine Termine heute</h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        Heute stehen keine Termine an. Zeit für eine Pause oder nutze die Gelegenheit für Neues!
      </p>
    </div>
  );
}

// Appointment card component
function AppointmentCard({
  appointment,
  serviceName,
  isLarge = false
}: {
  appointment: Terminanfrage;
  serviceName: string;
  isLarge?: boolean;
}) {
  const duration = appointment.fields.gesamtdauer
    ? DURATION_MAP[appointment.fields.gesamtdauer]
    : '';

  return (
    <div
      className={`
        bg-card rounded-lg border-l-4 border-l-primary border border-border
        transition-all duration-150 hover:shadow-md hover:-translate-y-0.5
        ${isLarge ? 'p-5' : 'p-4'}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-foreground ${isLarge ? 'text-2xl' : 'text-xl'}`}>
            {formatTime(appointment.fields.wunschtermin)}
          </div>
          <div className={`font-medium text-foreground mt-1 ${isLarge ? 'text-lg' : 'text-base'}`}>
            {appointment.fields.kunde_vorname} {appointment.fields.kunde_nachname}
          </div>
          <div className="text-muted-foreground text-sm mt-1 truncate">
            {serviceName || 'Massage'}
          </div>
        </div>
        {duration && (
          <Badge variant="secondary" className="shrink-0">
            {duration}
          </Badge>
        )}
      </div>
    </div>
  );
}

// Stat badge component (mobile)
function StatBadge({
  icon: Icon,
  value,
  label
}: {
  icon: React.ElementType;
  value: number;
  label: string;
}) {
  return (
    <div className="flex-shrink-0 bg-muted rounded-lg px-4 py-3 min-w-[100px]">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-lg font-bold">{value}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">{label}</div>
    </div>
  );
}

// Stat card component (desktop)
function StatCard({
  icon: Icon,
  value,
  label
}: {
  icon: React.ElementType;
  value: number;
  label: string;
}) {
  return (
    <Card className="transition-all duration-150 hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// New appointment form
function NewAppointmentForm({
  services,
  onSubmit,
  onClose,
  isSubmitting
}: {
  services: Leistungskatalog[];
  onSubmit: (data: Terminanfrage['fields']) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    kunde_vorname: '',
    kunde_nachname: '',
    kunde_telefon: '',
    e_mail_adresse: '',
    massageleistung: '',
    gesamtdauer: '' as string,
    wunschtermin_date: '',
    wunschtermin_time: '',
    anmerkungen: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build the wunschtermin in correct format YYYY-MM-DDTHH:MM
    const wunschtermin = formData.wunschtermin_date && formData.wunschtermin_time
      ? `${formData.wunschtermin_date}T${formData.wunschtermin_time}`
      : undefined;

    await onSubmit({
      kunde_vorname: formData.kunde_vorname || undefined,
      kunde_nachname: formData.kunde_nachname || undefined,
      kunde_telefon: formData.kunde_telefon || undefined,
      e_mail_adresse: formData.e_mail_adresse || undefined,
      massageleistung: formData.massageleistung
        ? createRecordUrl(APP_IDS.LEISTUNGSKATALOG, formData.massageleistung)
        : undefined,
      gesamtdauer: formData.gesamtdauer as Terminanfrage['fields']['gesamtdauer'] || undefined,
      wunschtermin,
      anmerkungen: formData.anmerkungen || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vorname">Vorname</Label>
          <Input
            id="vorname"
            value={formData.kunde_vorname}
            onChange={e => setFormData(prev => ({ ...prev, kunde_vorname: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nachname">Nachname</Label>
          <Input
            id="nachname"
            value={formData.kunde_nachname}
            onChange={e => setFormData(prev => ({ ...prev, kunde_nachname: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefon">Telefon</Label>
          <Input
            id="telefon"
            type="tel"
            value={formData.kunde_telefon}
            onChange={e => setFormData(prev => ({ ...prev, kunde_telefon: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.e_mail_adresse}
            onChange={e => setFormData(prev => ({ ...prev, e_mail_adresse: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service">Massageleistung</Label>
        <Select
          value={formData.massageleistung || 'none'}
          onValueChange={v => setFormData(prev => ({ ...prev, massageleistung: v === 'none' ? '' : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Leistung auswählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Keine Auswahl</SelectItem>
            {services.map(service => (
              <SelectItem key={service.record_id} value={service.record_id}>
                {service.fields.leistungsname || 'Unbenannt'}
                {service.fields.preis ? ` - ${service.fields.preis}€` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Dauer</Label>
        <Select
          value={formData.gesamtdauer || 'none'}
          onValueChange={v => setFormData(prev => ({ ...prev, gesamtdauer: v === 'none' ? '' : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Dauer auswählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Keine Auswahl</SelectItem>
            <SelectItem value="dauer_30">30 Minuten</SelectItem>
            <SelectItem value="dauer_45">45 Minuten</SelectItem>
            <SelectItem value="dauer_60">60 Minuten</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            type="date"
            value={formData.wunschtermin_date}
            onChange={e => setFormData(prev => ({ ...prev, wunschtermin_date: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Uhrzeit</Label>
          <Input
            id="time"
            type="time"
            value={formData.wunschtermin_time}
            onChange={e => setFormData(prev => ({ ...prev, wunschtermin_time: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anmerkungen</Label>
        <Textarea
          id="notes"
          value={formData.anmerkungen}
          onChange={e => setFormData(prev => ({ ...prev, anmerkungen: e.target.value }))}
          placeholder="Besondere Wünsche oder Hinweise..."
          rows={3}
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Speichern...' : 'Termin anlegen'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Main Dashboard component
export default function Dashboard() {
  const [appointments, setAppointments] = useState<Terminanfrage[]>([]);
  const [services, setServices] = useState<Leistungskatalog[]>([]);
  const [customers, setCustomers] = useState<Kundendaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appointmentsData, servicesData, customersData] = await Promise.all([
        LivingAppsService.getTerminanfrage(),
        LivingAppsService.getLeistungskatalog(),
        LivingAppsService.getKundendaten(),
      ]);

      setAppointments(appointmentsData);
      setServices(servicesData);
      setCustomers(customersData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create service lookup map
  const serviceMap = useMemo(() => {
    const map = new Map<string, Leistungskatalog>();
    services.forEach(s => map.set(s.record_id, s));
    return map;
  }, [services]);

  // Get service name for an appointment
  const getServiceName = (appointment: Terminanfrage): string => {
    const serviceId = extractRecordId(appointment.fields.massageleistung);
    if (!serviceId) return 'Massage';
    const service = serviceMap.get(serviceId);
    return service?.fields.leistungsname || 'Massage';
  };

  // Filter today's appointments
  const todayAppointments = useMemo(() => {
    const today = new Date();
    return appointments
      .filter(apt => {
        if (!apt.fields.wunschtermin) return false;
        try {
          const aptDate = parseISO(apt.fields.wunschtermin);
          return isToday(aptDate);
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const timeA = a.fields.wunschtermin || '';
        const timeB = b.fields.wunschtermin || '';
        return timeA.localeCompare(timeB);
      });
  }, [appointments]);

  // Filter this week's appointments
  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    return appointments.filter(apt => {
      if (!apt.fields.wunschtermin) return false;
      try {
        const aptDate = parseISO(apt.fields.wunschtermin);
        return aptDate >= weekStart && aptDate <= weekEnd;
      } catch {
        return false;
      }
    }).length;
  }, [appointments]);

  // Get upcoming appointments (next 7 days, excluding today)
  const upcomingAppointments = useMemo(() => {
    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);

    return appointments
      .filter(apt => {
        if (!apt.fields.wunschtermin) return false;
        try {
          const aptDate = parseISO(apt.fields.wunschtermin);
          return aptDate > endOfDay(new Date()) && aptDate <= nextWeek;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const timeA = a.fields.wunschtermin || '';
        const timeB = b.fields.wunschtermin || '';
        return timeA.localeCompare(timeB);
      })
      .slice(0, 15);
  }, [appointments]);

  // Group upcoming by day
  const upcomingByDay = useMemo(() => groupByDay(upcomingAppointments), [upcomingAppointments]);

  // Handle new appointment submission
  const handleNewAppointment = async (data: Terminanfrage['fields']) => {
    try {
      setIsSubmitting(true);
      await LivingAppsService.createTerminanfrageEntry(data);
      setDialogOpen(false);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to create appointment:', err);
      alert('Fehler beim Erstellen des Termins. Bitte erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const todayFormatted = format(new Date(), 'EEEE, d. MMMM', { locale: de });

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-200">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <header className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 px-4 py-4 border-b border-border">
          <h1 className="text-lg font-semibold">Massage-Buchungssystem</h1>
          <p className="text-sm text-muted-foreground">{todayFormatted}</p>
        </header>

        {/* Content */}
        <main className="px-4 pb-24">
          {/* Hero Section - Today's Appointments */}
          <section className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-sm font-semibold">Heute</h2>
              {todayAppointments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {todayAppointments.length}
                </Badge>
              )}
            </div>

            {todayAppointments.length === 0 ? (
              <EmptyAppointments />
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(apt => (
                  <AppointmentCard
                    key={apt.record_id}
                    appointment={apt}
                    serviceName={getServiceName(apt)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Quick Stats - Horizontal scroll */}
          <section className="py-4 -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <StatBadge icon={Calendar} value={thisWeekCount} label="Diese Woche" />
              <StatBadge icon={FileText} value={appointments.length} label="Offene Anfragen" />
              <StatBadge icon={Users} value={customers.length} label="Kunden" />
            </div>
          </section>

          {/* Upcoming Appointments */}
          <section className="py-4">
            <h2 className="text-sm font-semibold mb-4">Nächste 7 Tage</h2>

            {upcomingByDay.size === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine weiteren Termine in den nächsten 7 Tagen
              </p>
            ) : (
              <div className="space-y-6">
                {Array.from(upcomingByDay.entries()).map(([dateKey, dayAppointments]) => (
                  <div key={dateKey}>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      {getDayLabel(dateKey + 'T00:00')}
                    </h3>
                    <div className="space-y-2">
                      {dayAppointments.map(apt => (
                        <div
                          key={apt.record_id}
                          className="flex items-center gap-3 py-2 text-sm"
                        >
                          <span className="font-medium w-12">
                            {formatTime(apt.fields.wunschtermin)}
                          </span>
                          <span className="flex-1 truncate">
                            {apt.fields.kunde_vorname} {apt.fields.kunde_nachname}
                          </span>
                          <span className="text-muted-foreground text-xs truncate max-w-24">
                            {getServiceName(apt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-base font-medium">
                <Plus className="mr-2 h-5 w-5" />
                Neue Terminanfrage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neue Terminanfrage</DialogTitle>
              </DialogHeader>
              <NewAppointmentForm
                services={services}
                onSubmit={handleNewAppointment}
                onClose={() => setDialogOpen(false)}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Massage-Buchungssystem</h1>
              <p className="text-sm text-muted-foreground">{todayFormatted}</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Neue Terminanfrage
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Neue Terminanfrage</DialogTitle>
                </DialogHeader>
                <NewAppointmentForm
                  services={services}
                  onSubmit={handleNewAppointment}
                  onClose={() => setDialogOpen(false)}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-5 gap-8">
            {/* Left Column - 60% - Today's Appointments */}
            <div className="col-span-3">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-lg font-semibold">Heute</h2>
                {todayAppointments.length > 0 && (
                  <Badge variant="secondary">
                    {todayAppointments.length} Termine
                  </Badge>
                )}
              </div>

              {todayAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-16">
                    <EmptyAppointments />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map(apt => (
                    <AppointmentCard
                      key={apt.record_id}
                      appointment={apt}
                      serviceName={getServiceName(apt)}
                      isLarge
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - 40% - Stats & Upcoming */}
            <div className="col-span-2 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard icon={Calendar} value={thisWeekCount} label="Diese Woche" />
                <StatCard icon={FileText} value={appointments.length} label="Anfragen" />
                <StatCard icon={Users} value={customers.length} label="Kunden" />
              </div>

              {/* Upcoming Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Nächste 7 Tage</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingByDay.size === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Keine weiteren Termine
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {Array.from(upcomingByDay.entries()).map(([dateKey, dayAppointments]) => (
                        <div key={dateKey}>
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            {getDayLabel(dateKey + 'T00:00')}
                          </h3>
                          <div className="space-y-2">
                            {dayAppointments.map(apt => (
                              <div
                                key={apt.record_id}
                                className="flex items-center gap-3 py-2 text-sm rounded-md hover:bg-muted px-2 -mx-2 transition-colors"
                              >
                                <span className="font-medium w-12">
                                  {formatTime(apt.fields.wunschtermin)}
                                </span>
                                <span className="flex-1 truncate">
                                  {apt.fields.kunde_vorname} {apt.fields.kunde_nachname}
                                </span>
                                <span className="text-muted-foreground text-xs truncate max-w-32">
                                  {getServiceName(apt)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Requests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Neue Anfragen</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Keine Anfragen
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {appointments
                        .sort((a, b) => b.createdat.localeCompare(a.createdat))
                        .slice(0, 5)
                        .map(apt => (
                          <div
                            key={apt.record_id}
                            className="flex items-center gap-3 py-2 text-sm rounded-md hover:bg-muted px-2 -mx-2 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {apt.fields.kunde_vorname} {apt.fields.kunde_nachname}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {apt.fields.wunschtermin ? formatDate(apt.fields.wunschtermin) : 'Kein Termin'}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {getServiceName(apt)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
