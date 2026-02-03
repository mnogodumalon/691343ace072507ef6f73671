import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isToday, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Clock, Users, Euro, Inbox, Plus, Phone, Mail, MapPin, FileText } from 'lucide-react';
import type { Terminanfrage, Leistungskatalog, Kundendaten } from '@/types/app';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

// Duration mapping for display
const DURATION_MAP: Record<string, number> = {
  'dauer_30': 30,
  'dauer_45': 45,
  'dauer_60': 60,
};

// Appointment with resolved service data
interface EnrichedAppointment extends Terminanfrage {
  serviceName?: string;
  servicePrice?: number;
}

// Form data for new appointment
interface NewAppointmentForm {
  kunde_vorname: string;
  kunde_nachname: string;
  kunde_telefon: string;
  e_mail_adresse: string;
  wunschtermin_date: string;
  wunschtermin_time: string;
  massageleistung: string;
  gesamtdauer: string;
  anmerkungen: string;
}

const initialFormData: NewAppointmentForm = {
  kunde_vorname: '',
  kunde_nachname: '',
  kunde_telefon: '',
  e_mail_adresse: '',
  wunschtermin_date: '',
  wunschtermin_time: '',
  massageleistung: '',
  gesamtdauer: '',
  anmerkungen: '',
};

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Terminanfrage[]>([]);
  const [services, setServices] = useState<Leistungskatalog[]>([]);
  const [customers, setCustomers] = useState<Kundendaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<EnrichedAppointment | null>(null);
  const [formData, setFormData] = useState<NewAppointmentForm>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [appointmentsData, servicesData, customersData] = await Promise.all([
          LivingAppsService.getTerminanfrage(),
          LivingAppsService.getLeistungskatalog(),
          LivingAppsService.getKundendaten(),
        ]);
        setAppointments(appointmentsData);
        setServices(servicesData);
        setCustomers(customersData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Create lookup map for services
  const serviceMap = useMemo(() => {
    const map = new Map<string, Leistungskatalog>();
    services.forEach(s => map.set(s.record_id, s));
    return map;
  }, [services]);

  // Enrich appointments with service data
  const enrichedAppointments = useMemo(() => {
    return appointments.map(apt => {
      const serviceId = extractRecordId(apt.fields.massageleistung);
      const service = serviceId ? serviceMap.get(serviceId) : null;
      return {
        ...apt,
        serviceName: service?.fields.leistungsname || 'Unbekannte Leistung',
        servicePrice: service?.fields.preis,
      } as EnrichedAppointment;
    });
  }, [appointments, serviceMap]);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    const today = new Date();
    return enrichedAppointments
      .filter(apt => {
        if (!apt.fields.wunschtermin) return false;
        const aptDate = parseISO(apt.fields.wunschtermin);
        return isToday(aptDate);
      })
      .sort((a, b) => {
        const dateA = a.fields.wunschtermin || '';
        const dateB = b.fields.wunschtermin || '';
        return dateA.localeCompare(dateB);
      });
  }, [enrichedAppointments]);

  // Upcoming appointments (next 7 days, excluding today)
  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    const weekEnd = addDays(today, 7);
    return enrichedAppointments
      .filter(apt => {
        if (!apt.fields.wunschtermin) return false;
        const aptDate = parseISO(apt.fields.wunschtermin);
        return !isToday(aptDate) && isWithinInterval(aptDate, { start: today, end: weekEnd });
      })
      .sort((a, b) => {
        const dateA = a.fields.wunschtermin || '';
        const dateB = b.fields.wunschtermin || '';
        return dateA.localeCompare(dateB);
      });
  }, [enrichedAppointments]);

  // Group upcoming by date
  const upcomingByDate = useMemo(() => {
    const groups = new Map<string, EnrichedAppointment[]>();
    upcomingAppointments.forEach(apt => {
      if (!apt.fields.wunschtermin) return;
      const dateKey = apt.fields.wunschtermin.split('T')[0];
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(apt);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [upcomingAppointments]);

  // Stats calculations
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: de });
    const weekEnd = endOfWeek(now, { locale: de });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // This week's appointments
    const thisWeekCount = enrichedAppointments.filter(apt => {
      if (!apt.fields.wunschtermin) return false;
      const aptDate = parseISO(apt.fields.wunschtermin);
      return isWithinInterval(aptDate, { start: weekStart, end: weekEnd });
    }).length;

    // Recent requests (last 7 days created)
    const sevenDaysAgo = addDays(now, -7);
    const recentRequests = appointments.filter(apt => {
      const createdAt = parseISO(apt.createdat);
      return isWithinInterval(createdAt, { start: sevenDaysAgo, end: now });
    }).length;

    // Total customers
    const totalCustomers = customers.length;

    // Monthly revenue (sum of prices for this month's appointments)
    const monthlyRevenue = enrichedAppointments
      .filter(apt => {
        if (!apt.fields.wunschtermin) return false;
        const aptDate = parseISO(apt.fields.wunschtermin);
        return isWithinInterval(aptDate, { start: monthStart, end: monthEnd });
      })
      .reduce((sum, apt) => sum + (apt.servicePrice || 0), 0);

    return { thisWeekCount, recentRequests, totalCustomers, monthlyRevenue };
  }, [enrichedAppointments, appointments, customers]);

  // Current time for indicator
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle form submission
  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const wunschtermin = formData.wunschtermin_date && formData.wunschtermin_time
        ? `${formData.wunschtermin_date}T${formData.wunschtermin_time}`
        : undefined;

      await LivingAppsService.createTerminanfrageEntry({
        kunde_vorname: formData.kunde_vorname || undefined,
        kunde_nachname: formData.kunde_nachname || undefined,
        kunde_telefon: formData.kunde_telefon || undefined,
        e_mail_adresse: formData.e_mail_adresse || undefined,
        wunschtermin,
        massageleistung: formData.massageleistung ? `https://my.living-apps.de/rest/apps/6913437daff7287a0f9bab21/records/${formData.massageleistung}` : undefined,
        gesamtdauer: formData.gesamtdauer as Terminanfrage['fields']['gesamtdauer'] || undefined,
        anmerkungen: formData.anmerkungen || undefined,
      });

      // Refresh data
      const newAppointments = await LivingAppsService.getTerminanfrage();
      setAppointments(newAppointments);
      setFormData(initialFormData);
      setCreateDialogOpen(false);
    } catch (err) {
      console.error('Failed to create appointment:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // Format currency
  function formatCurrency(value: number | undefined): string {
    if (value == null) return '-';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto mt-20">
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive font-medium mb-2">Fehler beim Laden</p>
              <p className="text-muted-foreground text-sm mb-4">{error.message}</p>
              <Button onClick={() => window.location.reload()}>Erneut versuchen</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <header className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-semibold text-foreground">Termine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de })}
          </p>
        </header>

        {/* Hero Section - Today's Schedule */}
        <section className="px-4 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Heute</h2>
            <Badge variant="secondary" className="rounded-full">
              {todayAppointments.length} {todayAppointments.length === 1 ? 'Termin' : 'Termine'}
            </Badge>
          </div>

          {todayAppointments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">Keine Termine heute</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Genießen Sie Ihren freien Tag!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt, index) => {
                const aptTime = apt.fields.wunschtermin ? parseISO(apt.fields.wunschtermin) : null;
                const isPast = aptTime ? isBefore(aptTime, currentTime) : false;
                const duration = apt.fields.gesamtdauer ? DURATION_MAP[apt.fields.gesamtdauer] : null;

                return (
                  <Card
                    key={apt.record_id}
                    className={`cursor-pointer transition-all hover:shadow-md ${isPast ? 'opacity-60' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-lg font-bold text-primary">
                            {aptTime ? format(aptTime, 'HH:mm', { locale: de }) : '-'}
                          </p>
                          <p className="font-semibold text-foreground mt-1">
                            {apt.fields.kunde_vorname} {apt.fields.kunde_nachname}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {apt.serviceName}
                          </p>
                        </div>
                        {duration && (
                          <Badge variant="outline" className="text-xs">
                            {duration} Min
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Stats Row - Horizontal Scroll */}
        <section className="pb-6 overflow-x-auto">
          <div className="flex gap-3 px-4 min-w-max">
            <StatCardMobile
              icon={Calendar}
              value={stats.thisWeekCount}
              label="Diese Woche"
            />
            <StatCardMobile
              icon={Users}
              value={stats.totalCustomers}
              label="Kunden gesamt"
            />
            <StatCardMobile
              icon={Inbox}
              value={stats.recentRequests}
              label="Neue Anfragen"
              highlight={stats.recentRequests > 5}
            />
          </div>
        </section>

        {/* Upcoming Appointments */}
        <section className="px-4 pb-24">
          <h2 className="text-lg font-semibold text-foreground mb-4">Nächste 7 Tage</h2>
          {upcomingByDate.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">Keine weiteren Termine geplant</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingByDate.map(([dateKey, apts]) => (
                <div key={dateKey}>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {format(parseISO(dateKey), 'EEEE, d. MMMM', { locale: de })}
                  </p>
                  <div className="space-y-2">
                    {apts.map(apt => {
                      const aptTime = apt.fields.wunschtermin ? parseISO(apt.fields.wunschtermin) : null;
                      const duration = apt.fields.gesamtdauer ? DURATION_MAP[apt.fields.gesamtdauer] : null;

                      return (
                        <Card
                          key={apt.record_id}
                          className="cursor-pointer transition-all hover:shadow-md"
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-primary">
                                  {aptTime ? format(aptTime, 'HH:mm', { locale: de }) : '-'}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {apt.fields.kunde_vorname} {apt.fields.kunde_nachname}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {apt.serviceName}
                                  </p>
                                </div>
                              </div>
                              {duration && (
                                <Badge variant="outline" className="text-xs">
                                  {duration} Min
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Fixed Bottom Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t lg:hidden">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-base font-semibold rounded-xl shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Termin erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neuen Termin erstellen</DialogTitle>
                <DialogDescription>
                  Erfassen Sie die Termindetails für Ihren Kunden.
                </DialogDescription>
              </DialogHeader>
              <CreateAppointmentForm
                formData={formData}
                setFormData={setFormData}
                services={services}
                onSubmit={handleCreateAppointment}
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 border-b">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Termine</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de })}
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Neuen Termin erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Neuen Termin erstellen</DialogTitle>
                <DialogDescription>
                  Erfassen Sie die Termindetails für Ihren Kunden.
                </DialogDescription>
              </DialogHeader>
              <CreateAppointmentForm
                formData={formData}
                setFormData={setFormData}
                services={services}
                onSubmit={handleCreateAppointment}
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </header>

        {/* Main Content */}
        <div className="flex gap-8 p-8">
          {/* Left Column - 70% */}
          <div className="flex-1 min-w-0" style={{ flexBasis: '70%' }}>
            {/* Today's Schedule */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Heute, {format(new Date(), 'd. MMMM', { locale: de })}
                </h2>
                <Badge variant="secondary" className="rounded-full">
                  {todayAppointments.length} {todayAppointments.length === 1 ? 'Termin' : 'Termine'}
                </Badge>
              </div>

              {todayAppointments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                    <p className="text-lg text-muted-foreground font-medium">Keine Termine heute</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">Genießen Sie Ihren freien Tag!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {/* Current time indicator */}
                  <div className="relative">
                    <div
                      className="absolute left-0 right-0 flex items-center gap-2 z-10 pointer-events-none"
                      style={{
                        top: '0',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1 h-0.5 bg-primary opacity-50" />
                      <span className="text-xs font-medium text-primary bg-background px-2">
                        {format(currentTime, 'HH:mm', { locale: de })}
                      </span>
                    </div>
                  </div>

                  {todayAppointments.map((apt, index) => {
                    const aptTime = apt.fields.wunschtermin ? parseISO(apt.fields.wunschtermin) : null;
                    const isPast = aptTime ? isBefore(aptTime, currentTime) : false;
                    const duration = apt.fields.gesamtdauer ? DURATION_MAP[apt.fields.gesamtdauer] : null;

                    return (
                      <Card
                        key={apt.record_id}
                        className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${isPast ? 'opacity-60' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-6">
                            <div className="text-center min-w-[60px]">
                              <p className="text-2xl font-bold text-primary">
                                {aptTime ? format(aptTime, 'HH:mm', { locale: de }) : '-'}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="text-lg font-semibold text-foreground">
                                {apt.fields.kunde_vorname} {apt.fields.kunde_nachname}
                              </p>
                              <p className="text-muted-foreground">
                                {apt.serviceName}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {duration && (
                                <Badge variant="outline">{duration} Min</Badge>
                              )}
                              {apt.servicePrice && (
                                <span className="text-sm text-muted-foreground">
                                  {formatCurrency(apt.servicePrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Upcoming Appointments */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6">Kommende Termine</h2>
              {upcomingByDate.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Keine weiteren Termine in den nächsten 7 Tagen</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {upcomingByDate.map(([dateKey, apts]) => (
                    <div key={dateKey}>
                      <div className="sticky top-0 bg-background py-2 z-10">
                        <p className="text-sm font-semibold text-muted-foreground">
                          {format(parseISO(dateKey), 'EEEE, d. MMMM', { locale: de })}
                        </p>
                      </div>
                      <div className="space-y-2 mt-2">
                        {apts.map(apt => {
                          const aptTime = apt.fields.wunschtermin ? parseISO(apt.fields.wunschtermin) : null;
                          const duration = apt.fields.gesamtdauer ? DURATION_MAP[apt.fields.gesamtdauer] : null;

                          return (
                            <Card
                              key={apt.record_id}
                              className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.005]"
                              onClick={() => setSelectedAppointment(apt)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <span className="text-base font-bold text-primary min-w-[50px]">
                                    {aptTime ? format(aptTime, 'HH:mm', { locale: de }) : '-'}
                                  </span>
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">
                                      {apt.fields.kunde_vorname} {apt.fields.kunde_nachname}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {apt.serviceName}
                                    </p>
                                  </div>
                                  {duration && (
                                    <Badge variant="outline" className="text-xs">
                                      {duration} Min
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - 30% */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCardDesktop
                icon={Calendar}
                value={stats.thisWeekCount}
                label="Diese Woche"
              />
              <StatCardDesktop
                icon={Inbox}
                value={stats.recentRequests}
                label="Neue Anfragen"
                highlight={stats.recentRequests > 5}
              />
              <StatCardDesktop
                icon={Users}
                value={stats.totalCustomers}
                label="Kunden gesamt"
              />
              <StatCardDesktop
                icon={Euro}
                value={formatCurrency(stats.monthlyRevenue)}
                label="Umsatz (Monat)"
              />
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Letzte Aktivitäten</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Aktivitäten
                  </p>
                ) : (
                  <div className="space-y-4">
                    {appointments
                      .slice()
                      .sort((a, b) => b.createdat.localeCompare(a.createdat))
                      .slice(0, 5)
                      .map(apt => (
                        <div key={apt.record_id} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {apt.fields.kunde_vorname} {apt.fields.kunde_nachname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Neue Anfrage · {format(parseISO(apt.createdat), 'd. MMM, HH:mm', { locale: de })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Appointment Detail Sheet */}
      <Sheet open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Termindetails</SheetTitle>
            <SheetDescription>
              Informationen zum ausgewählten Termin
            </SheetDescription>
          </SheetHeader>
          {selectedAppointment && (
            <div className="mt-6 space-y-6">
              {/* Date & Time */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {selectedAppointment.fields.wunschtermin
                      ? format(parseISO(selectedAppointment.fields.wunschtermin), 'HH:mm', { locale: de })
                      : '-'}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedAppointment.fields.wunschtermin
                      ? format(parseISO(selectedAppointment.fields.wunschtermin), 'EEEE, d. MMMM yyyy', { locale: de })
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Kunde</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-lg font-semibold">
                    {selectedAppointment.fields.kunde_vorname} {selectedAppointment.fields.kunde_nachname}
                  </p>
                  {selectedAppointment.fields.kunde_telefon && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedAppointment.fields.kunde_telefon}`} className="text-primary hover:underline">
                        {selectedAppointment.fields.kunde_telefon}
                      </a>
                    </div>
                  )}
                  {selectedAppointment.fields.e_mail_adresse && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedAppointment.fields.e_mail_adresse}`} className="text-primary hover:underline">
                        {selectedAppointment.fields.e_mail_adresse}
                      </a>
                    </div>
                  )}
                  {(selectedAppointment.fields.kunde_strasse || selectedAppointment.fields.kunde_stadt) && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">
                        {[
                          selectedAppointment.fields.kunde_strasse,
                          selectedAppointment.fields.kunde_hausnummer,
                          selectedAppointment.fields.kunde_postleitzahl,
                          selectedAppointment.fields.kunde_stadt
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Service Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Behandlung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold">{selectedAppointment.serviceName}</p>
                  <div className="flex items-center gap-4">
                    {selectedAppointment.fields.gesamtdauer && (
                      <Badge variant="outline">
                        {DURATION_MAP[selectedAppointment.fields.gesamtdauer]} Minuten
                      </Badge>
                    )}
                    {selectedAppointment.servicePrice && (
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(selectedAppointment.servicePrice)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedAppointment.fields.anmerkungen && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Anmerkungen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedAppointment.fields.anmerkungen}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Mobile Stat Card Component
function StatCardMobile({
  icon: Icon,
  value,
  label,
  highlight = false
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`min-w-[140px] flex-shrink-0 ${highlight ? 'border-destructive' : ''}`}>
      <CardContent className="p-4">
        <Icon className={`w-5 h-5 mb-2 ${highlight ? 'text-destructive' : 'text-muted-foreground'}`} />
        <p className={`text-2xl font-bold ${highlight ? 'text-destructive' : 'text-foreground'}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// Desktop Stat Card Component
function StatCardDesktop({
  icon: Icon,
  value,
  label,
  highlight = false
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`transition-all hover:shadow-md hover:scale-[1.02] cursor-default ${highlight ? 'border-destructive' : ''}`}>
      <CardContent className="p-4">
        <Icon className={`w-5 h-5 mb-3 ${highlight ? 'text-destructive' : 'text-muted-foreground'}`} />
        <p className={`text-2xl font-bold ${highlight ? 'text-destructive' : 'text-foreground'}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

// Create Appointment Form Component
function CreateAppointmentForm({
  formData,
  setFormData,
  services,
  onSubmit,
  submitting,
}: {
  formData: NewAppointmentForm;
  setFormData: React.Dispatch<React.SetStateAction<NewAppointmentForm>>;
  services: Leistungskatalog[];
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vorname">Vorname</Label>
          <Input
            id="vorname"
            value={formData.kunde_vorname}
            onChange={(e) => setFormData(prev => ({ ...prev, kunde_vorname: e.target.value }))}
            placeholder="Max"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nachname">Nachname</Label>
          <Input
            id="nachname"
            value={formData.kunde_nachname}
            onChange={(e) => setFormData(prev => ({ ...prev, kunde_nachname: e.target.value }))}
            placeholder="Mustermann"
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
          onChange={(e) => setFormData(prev => ({ ...prev, kunde_telefon: e.target.value }))}
          placeholder="+49 123 456789"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.e_mail_adresse}
          onChange={(e) => setFormData(prev => ({ ...prev, e_mail_adresse: e.target.value }))}
          placeholder="max@beispiel.de"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="datum">Datum</Label>
          <Input
            id="datum"
            type="date"
            value={formData.wunschtermin_date}
            onChange={(e) => setFormData(prev => ({ ...prev, wunschtermin_date: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="uhrzeit">Uhrzeit</Label>
          <Input
            id="uhrzeit"
            type="time"
            value={formData.wunschtermin_time}
            onChange={(e) => setFormData(prev => ({ ...prev, wunschtermin_time: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="leistung">Massage-Leistung</Label>
        <Select
          value={formData.massageleistung || "none"}
          onValueChange={(v) => setFormData(prev => ({ ...prev, massageleistung: v === "none" ? "" : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Leistung auswählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Keine Auswahl</SelectItem>
            {services.map(service => (
              <SelectItem key={service.record_id} value={service.record_id}>
                {service.fields.leistungsname} {service.fields.preis ? `(${service.fields.preis}€)` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dauer">Gesamtdauer</Label>
        <Select
          value={formData.gesamtdauer || "none"}
          onValueChange={(v) => setFormData(prev => ({ ...prev, gesamtdauer: v === "none" ? "" : v }))}
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

      <div className="space-y-2">
        <Label htmlFor="anmerkungen">Anmerkungen</Label>
        <Textarea
          id="anmerkungen"
          value={formData.anmerkungen}
          onChange={(e) => setFormData(prev => ({ ...prev, anmerkungen: e.target.value }))}
          placeholder="Besondere Wünsche oder Hinweise..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? 'Wird erstellt...' : 'Termin erstellen'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Loading */}
      <div className="lg:hidden p-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-36 flex-shrink-0 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Desktop Loading */}
      <div className="hidden lg:block max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
        <div className="flex gap-8">
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
          <div className="w-80 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
