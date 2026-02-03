import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, formatDistance, isToday, isThisWeek, isFuture, startOfDay, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, Clock, Users, Calendar, AlertCircle } from 'lucide-react';

import type { Terminanfrage, Leistungskatalog, Kundendaten } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

// Duration mapping
const DURATION_MAP: Record<string, string> = {
  dauer_30: '30',
  dauer_45: '45',
  dauer_60: '60',
};

// Format currency
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen p-4 md:p-8 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Hero Card Skeleton */}
        <Skeleton className="h-52 w-full rounded-xl" />

        {/* Stats Skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <Skeleton className="h-20 w-28 shrink-0 rounded-lg" />
          <Skeleton className="h-20 w-28 shrink-0 rounded-lg" />
          <Skeleton className="h-20 w-28 shrink-0 rounded-lg" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
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

// Empty State Component
function EmptyState({ onAddAppointment }: { onAddAppointment: () => void }) {
  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Keine Termine vorhanden</h3>
      <p className="text-muted-foreground mb-4">
        Fügen Sie Ihren ersten Termin hinzu, um loszulegen.
      </p>
      <Button onClick={onAddAppointment}>
        <Plus className="h-4 w-4 mr-2" />
        Erste Terminanfrage
      </Button>
    </div>
  );
}

// Hero Appointment Card
function HeroAppointmentCard({
  appointment,
  serviceName,
  onClick,
}: {
  appointment: Terminanfrage;
  serviceName: string;
  onClick: () => void;
}) {
  const appointmentDate = appointment.fields.wunschtermin
    ? parseISO(appointment.fields.wunschtermin)
    : null;

  const getRelativeTime = () => {
    if (!appointmentDate) return '';
    if (isToday(appointmentDate)) {
      return `Heute, ${format(appointmentDate, 'HH:mm', { locale: de })}`;
    }
    return format(appointmentDate, "EEEE, d. MMMM 'um' HH:mm", { locale: de });
  };

  const getTimeDistance = () => {
    if (!appointmentDate) return '';
    return formatDistance(appointmentDate, new Date(), {
      addSuffix: true,
      locale: de,
    });
  };

  const duration = appointment.fields.gesamtdauer
    ? DURATION_MAP[appointment.fields.gesamtdauer]
    : null;

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-primary"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      onClick={onClick}
    >
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Nächster Termin</p>
            <p className="text-2xl md:text-3xl font-semibold">
              {getRelativeTime()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getTimeDistance()}
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div>
              <p className="text-lg font-medium">
                {appointment.fields.kunde_vorname} {appointment.fields.kunde_nachname}
              </p>
              <p className="text-muted-foreground">{serviceName || 'Keine Leistung ausgewählt'}</p>
            </div>

            <div className="flex items-center gap-2">
              {duration && (
                <Badge variant="secondary" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {duration} Min
                </Badge>
              )}
            </div>
          </div>

          {/* Desktop only: show phone */}
          {appointment.fields.kunde_telefon && (
            <p className="hidden md:block text-sm text-muted-foreground">
              Tel: {appointment.fields.kunde_telefon}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
}) {
  return (
    <div className="shrink-0 bg-muted rounded-lg p-4 min-w-[100px] md:min-w-0 md:w-full transition-transform duration-200 hover:scale-[1.02]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{title}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

// Appointment List Item
function AppointmentListItem({
  appointment,
  serviceName,
  onClick,
}: {
  appointment: Terminanfrage;
  serviceName: string;
  onClick: () => void;
}) {
  const appointmentDate = appointment.fields.wunschtermin
    ? parseISO(appointment.fields.wunschtermin)
    : null;

  const duration = appointment.fields.gesamtdauer
    ? DURATION_MAP[appointment.fields.gesamtdauer]
    : null;

  return (
    <div
      className="bg-card rounded-lg p-4 cursor-pointer transition-colors duration-200 hover:bg-accent"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">
              {appointmentDate
                ? format(appointmentDate, 'HH:mm', { locale: de })
                : '-'}
            </span>
            <span className="text-sm text-muted-foreground">
              {appointmentDate
                ? format(appointmentDate, 'EEE, d. MMM', { locale: de })
                : '-'}
            </span>
          </div>
          <p className="text-sm truncate">
            {appointment.fields.kunde_vorname} {appointment.fields.kunde_nachname}
          </p>
          <p className="text-xs text-muted-foreground truncate">{serviceName}</p>
        </div>
        {duration && (
          <Badge variant="outline" className="shrink-0">
            {duration} Min
          </Badge>
        )}
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service }: { service: Leistungskatalog }) {
  return (
    <div className="shrink-0 w-36 md:w-full bg-card border rounded-lg p-3 transition-all duration-200 hover:shadow-sm">
      <p className="font-medium text-sm truncate">{service.fields.leistungsname}</p>
      <p className="text-primary font-semibold mt-1">
        {formatCurrency(service.fields.preis)}
      </p>
      {service.fields.dauer_minuten && (
        <p className="text-xs text-muted-foreground mt-1">
          {service.fields.dauer_minuten} Min
        </p>
      )}
    </div>
  );
}

// New Appointment Dialog
function NewAppointmentDialog({
  open,
  onOpenChange,
  services,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Leistungskatalog[];
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    kunde_vorname: '',
    kunde_nachname: '',
    kunde_telefon: '',
    e_mail_adresse: '',
    wunschtermin_date: '',
    wunschtermin_time: '',
    massageleistung: '',
    gesamtdauer: '',
    anmerkungen: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Format datetime: YYYY-MM-DDTHH:MM (no seconds!)
      const wunschtermin = formData.wunschtermin_date && formData.wunschtermin_time
        ? `${formData.wunschtermin_date}T${formData.wunschtermin_time}`
        : undefined;

      const data: Terminanfrage['fields'] = {
        kunde_vorname: formData.kunde_vorname,
        kunde_nachname: formData.kunde_nachname,
        kunde_telefon: formData.kunde_telefon || undefined,
        e_mail_adresse: formData.e_mail_adresse || undefined,
        wunschtermin,
        massageleistung: formData.massageleistung
          ? createRecordUrl(APP_IDS.LEISTUNGSKATALOG, formData.massageleistung)
          : undefined,
        gesamtdauer: formData.gesamtdauer as Terminanfrage['fields']['gesamtdauer'],
        anmerkungen: formData.anmerkungen || undefined,
      };

      await LivingAppsService.createTerminanfrageEntry(data);

      // Reset form
      setFormData({
        kunde_vorname: '',
        kunde_nachname: '',
        kunde_telefon: '',
        e_mail_adresse: '',
        wunschtermin_date: '',
        wunschtermin_time: '',
        massageleistung: '',
        gesamtdauer: '',
        anmerkungen: '',
      });

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error('Failed to create appointment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Terminanfrage</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vorname">Vorname *</Label>
              <Input
                id="vorname"
                value={formData.kunde_vorname}
                onChange={(e) => setFormData({ ...formData, kunde_vorname: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nachname">Nachname *</Label>
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
              <Label htmlFor="datum">Datum *</Label>
              <Input
                id="datum"
                type="date"
                value={formData.wunschtermin_date}
                onChange={(e) => setFormData({ ...formData, wunschtermin_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zeit">Uhrzeit *</Label>
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
            <Label htmlFor="leistung">Massageleistung</Label>
            <Select
              value={formData.massageleistung || 'none'}
              onValueChange={(v) => setFormData({ ...formData, massageleistung: v === 'none' ? '' : v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Leistung auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Auswahl</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.record_id} value={service.record_id}>
                    {service.fields.leistungsname} - {formatCurrency(service.fields.preis)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dauer">Dauer *</Label>
            <Select
              value={formData.gesamtdauer || 'none'}
              onValueChange={(v) => setFormData({ ...formData, gesamtdauer: v === 'none' ? '' : v })}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Dauer auswählen..." />
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
            <Label htmlFor="anmerkungen">Anmerkungen</Label>
            <Textarea
              id="anmerkungen"
              value={formData.anmerkungen}
              onChange={(e) => setFormData({ ...formData, anmerkungen: e.target.value })}
              placeholder="Besondere Wünsche oder Hinweise..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Wird gespeichert...' : 'Termin anlegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Appointment Detail Dialog
function AppointmentDetailDialog({
  appointment,
  serviceName,
  open,
  onOpenChange,
}: {
  appointment: Terminanfrage | null;
  serviceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!appointment) return null;

  const appointmentDate = appointment.fields.wunschtermin
    ? parseISO(appointment.fields.wunschtermin)
    : null;

  const duration = appointment.fields.gesamtdauer
    ? DURATION_MAP[appointment.fields.gesamtdauer]
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Termindetails</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Datum & Uhrzeit</p>
            <p className="font-semibold text-lg">
              {appointmentDate
                ? format(appointmentDate, "EEEE, d. MMMM yyyy 'um' HH:mm", { locale: de })
                : '-'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Kunde</p>
              <p className="font-medium">
                {appointment.fields.kunde_vorname} {appointment.fields.kunde_nachname}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dauer</p>
              <p className="font-medium">{duration ? `${duration} Minuten` : '-'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Leistung</p>
            <p className="font-medium">{serviceName || 'Keine Leistung ausgewählt'}</p>
          </div>

          {appointment.fields.kunde_telefon && (
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p className="font-medium">{appointment.fields.kunde_telefon}</p>
            </div>
          )}

          {appointment.fields.e_mail_adresse && (
            <div>
              <p className="text-sm text-muted-foreground">E-Mail</p>
              <p className="font-medium">{appointment.fields.e_mail_adresse}</p>
            </div>
          )}

          {appointment.fields.anmerkungen && (
            <div>
              <p className="text-sm text-muted-foreground">Anmerkungen</p>
              <p className="text-sm">{appointment.fields.anmerkungen}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [appointments, setAppointments] = useState<Terminanfrage[]>([]);
  const [services, setServices] = useState<Leistungskatalog[]>([]);
  const [customers, setCustomers] = useState<Kundendaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Terminanfrage | null>(null);

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
    services.forEach((s) => map.set(s.record_id, s));
    return map;
  }, [services]);

  // Get service name by appointment
  const getServiceName = (appointment: Terminanfrage): string => {
    const serviceId = extractRecordId(appointment.fields.massageleistung);
    if (!serviceId) return '';
    const service = serviceMap.get(serviceId);
    return service?.fields.leistungsname || '';
  };

  // Filter and sort upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const now = startOfDay(new Date());
    const nextWeek = addDays(now, 7);

    return appointments
      .filter((a) => {
        if (!a.fields.wunschtermin) return false;
        const date = parseISO(a.fields.wunschtermin);
        return isFuture(date) || isToday(date);
      })
      .sort((a, b) => {
        const dateA = a.fields.wunschtermin ? parseISO(a.fields.wunschtermin).getTime() : 0;
        const dateB = b.fields.wunschtermin ? parseISO(b.fields.wunschtermin).getTime() : 0;
        return dateA - dateB;
      });
  }, [appointments]);

  // Stats calculations
  const stats = useMemo(() => {
    const todayCount = appointments.filter((a) => {
      if (!a.fields.wunschtermin) return false;
      return isToday(parseISO(a.fields.wunschtermin));
    }).length;

    const weekCount = appointments.filter((a) => {
      if (!a.fields.wunschtermin) return false;
      const date = parseISO(a.fields.wunschtermin);
      return isThisWeek(date, { locale: de });
    }).length;

    const customerCount = customers.length;

    return { todayCount, weekCount, customerCount };
  }, [appointments, customers]);

  // Next appointment (hero)
  const nextAppointment = upcomingAppointments[0] || null;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen animate-in fade-in duration-200">
      {/* Mobile FAB */}
      <Button
        className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        onClick={() => setNewAppointmentOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">
            <span className="md:hidden">Termine</span>
            <span className="hidden md:inline">Massage-Dashboard</span>
          </h1>
          <Button
            className="hidden md:flex"
            onClick={() => setNewAppointmentOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Terminanfrage
          </Button>
        </header>

        {/* Desktop: Two-column layout */}
        <div className="grid md:grid-cols-[2fr_1fr] gap-6 md:gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Hero: Next Appointment */}
            {nextAppointment ? (
              <HeroAppointmentCard
                appointment={nextAppointment}
                serviceName={getServiceName(nextAppointment)}
                onClick={() => setSelectedAppointment(nextAppointment)}
              />
            ) : (
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6 md:p-8">
                  <EmptyState onAddAppointment={() => setNewAppointmentOpen(true)} />
                </CardContent>
              </Card>
            )}

            {/* Mobile: Stats Row (horizontal scroll) */}
            <div className="md:hidden">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-3 pb-2">
                  <StatCard
                    title="Heute"
                    value={stats.todayCount}
                    icon={Calendar}
                  />
                  <StatCard
                    title="Diese Woche"
                    value={stats.weekCount}
                    icon={Clock}
                  />
                  <StatCard
                    title="Kunden"
                    value={stats.customerCount}
                    icon={Users}
                  />
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <section>
                <div className="mb-3">
                  <h2 className="text-base font-semibold">Kommende Termine</h2>
                  <p className="text-sm text-muted-foreground">Nächste 7 Tage</p>
                </div>
                <div className="space-y-2">
                  {upcomingAppointments.slice(0, 5).map((appointment, index) => (
                    <div
                      key={appointment.record_id}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <AppointmentListItem
                        appointment={appointment}
                        serviceName={getServiceName(appointment)}
                        onClick={() => setSelectedAppointment(appointment)}
                      />
                    </div>
                  ))}
                </div>
                {upcomingAppointments.length > 5 && (
                  <p className="text-sm text-primary mt-3 cursor-pointer hover:underline">
                    Alle {upcomingAppointments.length} Termine anzeigen
                  </p>
                )}
              </section>
            )}
          </div>

          {/* Right Column (Desktop only) */}
          <div className="hidden md:block space-y-6">
            {/* Stats Cards */}
            <div className="space-y-3">
              <StatCard
                title="Heute"
                value={stats.todayCount}
                icon={Calendar}
                subtitle={stats.todayCount > 0 ? 'Termine geplant' : 'Keine Termine'}
              />
              <StatCard
                title="Diese Woche"
                value={stats.weekCount}
                icon={Clock}
                subtitle="Termine insgesamt"
              />
              <StatCard
                title="Kunden gesamt"
                value={stats.customerCount}
                icon={Users}
              />
            </div>

            {/* Popular Services */}
            {services.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Beliebte Leistungen</h2>
                <div className="space-y-2">
                  {services.slice(0, 5).map((service) => (
                    <ServiceCard key={service.record_id} service={service} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Mobile: Popular Services (horizontal scroll) */}
        <section className="md:hidden mt-6">
          <h2 className="text-base font-semibold mb-3">Beliebte Leistungen</h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {services.slice(0, 5).map((service) => (
                <ServiceCard key={service.record_id} service={service} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      </div>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={newAppointmentOpen}
        onOpenChange={setNewAppointmentOpen}
        services={services}
        onSuccess={fetchData}
      />

      {/* Appointment Detail Dialog */}
      <AppointmentDetailDialog
        appointment={selectedAppointment}
        serviceName={selectedAppointment ? getServiceName(selectedAppointment) : ''}
        open={!!selectedAppointment}
        onOpenChange={(open) => !open && setSelectedAppointment(null)}
      />
    </div>
  );
}
