import { useState, useEffect, useMemo } from 'react';
import type { Terminanfrage, Leistungskatalog, Kundendaten } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek, isToday, isSameDay, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Euro, Users, Plus, Clock } from 'lucide-react';

// Duration mapping
const DURATION_MAP: Record<string, number> = {
  'dauer_30': 30,
  'dauer_45': 45,
  'dauer_60': 60,
};

// Get duration label
function getDurationMinutes(gesamtdauer: string | undefined): number {
  if (!gesamtdauer) return 60;
  return DURATION_MAP[gesamtdauer] || 60;
}

// Format currency
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '0 €';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Loading skeleton for appointments
function AppointmentSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-start gap-4">
            <Skeleton className="w-14 h-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-1 w-full mt-3" />
        </div>
      ))}
    </div>
  );
}

// KPI Badge component for mobile
function KPIBadge({
  icon: Icon,
  value,
  label
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex-shrink-0 w-24 p-3 bg-card rounded-xl border border-border flex flex-col items-center justify-center gap-1">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

// Appointment card component
function AppointmentCard({
  appointment,
  service,
  expanded,
  onToggle,
}: {
  appointment: Terminanfrage;
  service: Leistungskatalog | null;
  expanded: boolean;
  onToggle: () => void;
}) {
  const time = appointment.fields.wunschtermin
    ? format(parseISO(appointment.fields.wunschtermin), 'HH:mm')
    : '--:--';

  const customerName = [
    appointment.fields.kunde_vorname,
    appointment.fields.kunde_nachname
  ].filter(Boolean).join(' ') || 'Unbekannter Kunde';

  const serviceName = service?.fields.leistungsname || 'Massage';
  const duration = getDurationMinutes(appointment.fields.gesamtdauer);
  const maxDuration = 60;
  const durationPercent = (duration / maxDuration) * 100;

  return (
    <div
      className="p-4 bg-card rounded-xl border border-border hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start gap-4">
        <div className="text-lg font-bold text-primary">{time}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{customerName}</div>
          <div className="text-sm text-muted-foreground truncate">{serviceName}</div>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">{duration} Min</div>
      </div>

      {/* Duration bar */}
      <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${durationPercent}%`,
            background: 'linear-gradient(90deg, hsl(152 35% 45%) 0%, hsl(152 35% 45% / 0.3) 100%)'
          }}
        />
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
          {appointment.fields.kunde_telefon && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefon:</span>
              <span>{appointment.fields.kunde_telefon}</span>
            </div>
          )}
          {appointment.fields.e_mail_adresse && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">E-Mail:</span>
              <span className="truncate ml-2">{appointment.fields.e_mail_adresse}</span>
            </div>
          )}
          {(appointment.fields.kunde_strasse || appointment.fields.kunde_stadt) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Adresse:</span>
              <span className="text-right">
                {[
                  appointment.fields.kunde_strasse,
                  appointment.fields.kunde_hausnummer
                ].filter(Boolean).join(' ')}
                {appointment.fields.kunde_strasse && appointment.fields.kunde_stadt && <br />}
                {[
                  appointment.fields.kunde_postleitzahl,
                  appointment.fields.kunde_stadt
                ].filter(Boolean).join(' ')}
              </span>
            </div>
          )}
          {appointment.fields.anmerkungen && (
            <div className="pt-2">
              <span className="text-muted-foreground block mb-1">Anmerkungen:</span>
              <span className="text-sm">{appointment.fields.anmerkungen}</span>
            </div>
          )}
          {service?.fields.preis && (
            <div className="flex justify-between pt-2 font-medium">
              <span>Preis:</span>
              <span>{formatCurrency(service.fields.preis)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Add appointment form
function AddAppointmentForm({
  services,
  onSubmit,
  onCancel,
  submitting,
}: {
  services: Leistungskatalog[];
  onSubmit: (data: Terminanfrage['fields']) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Terminanfrage['fields']>>({
    gesamtdauer: 'dauer_60',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build the complete data
    const submitData: Terminanfrage['fields'] = {
      kunde_vorname: formData.kunde_vorname,
      kunde_nachname: formData.kunde_nachname,
      kunde_telefon: formData.kunde_telefon,
      e_mail_adresse: formData.e_mail_adresse,
      wunschtermin: formData.wunschtermin,
      massageleistung: formData.massageleistung,
      gesamtdauer: formData.gesamtdauer,
      anmerkungen: formData.anmerkungen,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="vorname">Vorname *</Label>
          <Input
            id="vorname"
            required
            value={formData.kunde_vorname || ''}
            onChange={(e) => setFormData({ ...formData, kunde_vorname: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nachname">Nachname *</Label>
          <Input
            id="nachname"
            required
            value={formData.kunde_nachname || ''}
            onChange={(e) => setFormData({ ...formData, kunde_nachname: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefon">Telefon</Label>
        <Input
          id="telefon"
          type="tel"
          value={formData.kunde_telefon || ''}
          onChange={(e) => setFormData({ ...formData, kunde_telefon: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.e_mail_adresse || ''}
          onChange={(e) => setFormData({ ...formData, e_mail_adresse: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wunschtermin">Datum & Uhrzeit *</Label>
        <Input
          id="wunschtermin"
          type="datetime-local"
          required
          value={formData.wunschtermin || ''}
          onChange={(e) => {
            // datetime-local gives us YYYY-MM-DDTHH:MM format (no seconds)
            setFormData({ ...formData, wunschtermin: e.target.value });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="leistung">Leistung</Label>
        <Select
          value={formData.massageleistung ? extractRecordId(formData.massageleistung) || 'none' : 'none'}
          onValueChange={(v) => setFormData({
            ...formData,
            massageleistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v)
          })}
        >
          <SelectTrigger id="leistung">
            <SelectValue placeholder="Leistung wählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Keine Auswahl</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.record_id} value={service.record_id}>
                {service.fields.leistungsname} ({service.fields.dauer_minuten} Min - {formatCurrency(service.fields.preis)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dauer">Dauer</Label>
        <Select
          value={formData.gesamtdauer || 'dauer_60'}
          onValueChange={(v) => setFormData({ ...formData, gesamtdauer: v as Terminanfrage['fields']['gesamtdauer'] })}
        >
          <SelectTrigger id="dauer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dauer_30">30 Minuten</SelectItem>
            <SelectItem value="dauer_45">45 Minuten</SelectItem>
            <SelectItem value="dauer_60">60 Minuten</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="anmerkungen">Notizen</Label>
        <Textarea
          id="anmerkungen"
          value={formData.anmerkungen || ''}
          onChange={(e) => setFormData({ ...formData, anmerkungen: e.target.value })}
          placeholder="Besondere Wünsche oder Anmerkungen..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? 'Speichern...' : 'Termin speichern'}
        </Button>
      </div>
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
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [appts, srvcs, custs] = await Promise.all([
          LivingAppsService.getTerminanfrage(),
          LivingAppsService.getLeistungskatalog(),
          LivingAppsService.getKundendaten(),
        ]);
        setAppointments(appts);
        setServices(srvcs);
        setCustomers(custs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Create service lookup map
  const serviceMap = useMemo(() => {
    const map = new Map<string, Leistungskatalog>();
    services.forEach((s) => map.set(s.record_id, s));
    return map;
  }, [services]);

  // Get service for an appointment
  const getServiceForAppointment = (appointment: Terminanfrage): Leistungskatalog | null => {
    const serviceId = extractRecordId(appointment.fields.massageleistung);
    return serviceId ? serviceMap.get(serviceId) || null : null;
  };

  // Today's appointments
  const todayAppointments = useMemo(() => {
    const today = new Date();
    return appointments
      .filter((a) => {
        if (!a.fields.wunschtermin) return false;
        return isToday(parseISO(a.fields.wunschtermin));
      })
      .sort((a, b) => {
        const dateA = a.fields.wunschtermin || '';
        const dateB = b.fields.wunschtermin || '';
        return dateA.localeCompare(dateB);
      });
  }, [appointments]);

  // Upcoming appointments (next 7 days, excluding today)
  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return appointments
      .filter((a) => {
        if (!a.fields.wunschtermin) return false;
        const date = parseISO(a.fields.wunschtermin);
        return !isToday(date) && date > today && date <= nextWeek;
      })
      .sort((a, b) => {
        const dateA = a.fields.wunschtermin || '';
        const dateB = b.fields.wunschtermin || '';
        return dateA.localeCompare(dateB);
      })
      .slice(0, 5);
  }, [appointments]);

  // This week's appointments count
  const weekAppointmentsCount = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: de });
    const weekEnd = endOfWeek(now, { locale: de });
    return appointments.filter((a) => {
      if (!a.fields.wunschtermin) return false;
      const date = parseISO(a.fields.wunschtermin);
      return date >= weekStart && date <= weekEnd;
    }).length;
  }, [appointments]);

  // Monthly revenue calculation
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return appointments
      .filter((a) => {
        if (!a.fields.wunschtermin) return false;
        const date = parseISO(a.fields.wunschtermin);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, a) => {
        const service = getServiceForAppointment(a);
        return sum + (service?.fields.preis || 0);
      }, 0);
  }, [appointments, serviceMap]);

  // Weekly chart data
  const weeklyChartData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: de });
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    return days.map((day, index) => {
      const date = addDays(weekStart, index);
      const count = appointments.filter((a) => {
        if (!a.fields.wunschtermin) return false;
        return isSameDay(parseISO(a.fields.wunschtermin), date);
      }).length;
      return { name: day, termine: count };
    });
  }, [appointments]);

  // Handle form submission
  const handleAddAppointment = async (data: Terminanfrage['fields']) => {
    setSubmitting(true);
    try {
      await LivingAppsService.createTerminanfrageEntry(data);
      // Refresh data
      const appts = await LivingAppsService.getTerminanfrage();
      setAppointments(appts);
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to create appointment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Current date formatted
  const currentDate = format(new Date(), 'EEEE, d. MMMM', { locale: de });
  const shortDate = format(new Date(), 'EEE, d. MMM', { locale: de });

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive text-lg font-medium mb-2">Fehler beim Laden</div>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:block p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Massage Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{currentDate}</span>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Termin hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Neuen Termin erstellen</DialogTitle>
                </DialogHeader>
                <AddAppointmentForm
                  services={services}
                  onSubmit={handleAddAppointment}
                  onCancel={() => setDialogOpen(false)}
                  submitting={submitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Two-column layout */}
        <div className="grid grid-cols-[1fr_320px] gap-8">
          {/* Left column - Main content */}
          <div className="space-y-8">
            {/* Today's appointments (Hero) */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Heute</h2>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {todayAppointments.length} Termine
                </span>
              </div>

              {loading ? (
                <AppointmentSkeleton />
              ) : todayAppointments.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Keine Termine heute</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Zeit für eine Pause!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.record_id}
                      appointment={appointment}
                      service={getServiceForAppointment(appointment)}
                      expanded={expandedAppointment === appointment.record_id}
                      onToggle={() => setExpandedAppointment(
                        expandedAppointment === appointment.record_id ? null : appointment.record_id
                      )}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Weekly chart */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Diese Woche</h2>
              <Card>
                <CardContent className="pt-6">
                  {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyChartData}>
                          <defs>
                            <linearGradient id="colorTermine" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(152 35% 45%)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(152 35% 45%)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(30 5% 50%)' }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(30 5% 50%)' }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(0 0% 100%)',
                              border: '1px solid hsl(40 20% 88%)',
                              borderRadius: '8px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            }}
                            formatter={(value: number) => [`${value} Termine`, '']}
                          />
                          <Area
                            type="monotone"
                            dataKey="termine"
                            stroke="hsl(152 35% 45%)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTermine)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right column - Stats & Info */}
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Termine diese Woche
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-3xl font-bold">{weekAppointmentsCount}</div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Umsatz (Monat)
                  </CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-3xl font-bold">{formatCurrency(monthlyRevenue)}</div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Kunden gesamt
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <div className="text-3xl font-bold">{customers.length}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Top Leistungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Leistungen verfügbar</p>
                ) : (
                  <div className="space-y-3">
                    {services.slice(0, 5).map((service) => (
                      <div key={service.record_id} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{service.fields.leistungsname}</span>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.fields.dauer_minuten}′
                          </span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(service.fields.preis)}
                          </span>
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

      {/* Mobile Layout */}
      <div className="md:hidden pb-24">
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Massage Dashboard</h1>
          <span className="text-sm text-muted-foreground">{shortDate}</span>
        </header>

        {/* Hero - Today's Appointments */}
        <section className="px-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Heute</h2>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {loading ? '...' : todayAppointments.length}
            </span>
          </div>

          {loading ? (
            <AppointmentSkeleton />
          ) : todayAppointments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Keine Termine heute</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.record_id}
                  appointment={appointment}
                  service={getServiceForAppointment(appointment)}
                  expanded={expandedAppointment === appointment.record_id}
                  onToggle={() => setExpandedAppointment(
                    expandedAppointment === appointment.record_id ? null : appointment.record_id
                  )}
                />
              ))}
            </div>
          )}
        </section>

        {/* KPI Strip - Horizontal scroll */}
        <section className="px-4 mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {loading ? (
              <>
                <Skeleton className="w-24 h-20 flex-shrink-0 rounded-xl" />
                <Skeleton className="w-24 h-20 flex-shrink-0 rounded-xl" />
                <Skeleton className="w-24 h-20 flex-shrink-0 rounded-xl" />
              </>
            ) : (
              <>
                <KPIBadge icon={Calendar} value={weekAppointmentsCount} label="Diese Woche" />
                <KPIBadge icon={Euro} value={formatCurrency(monthlyRevenue)} label="Umsatz" />
                <KPIBadge icon={Users} value={customers.length} label="Kunden" />
              </>
            )}
          </div>
        </section>

        {/* Upcoming appointments */}
        <section className="px-4 mb-6">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Kommende Termine
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine weiteren Termine in den nächsten 7 Tagen</p>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => {
                const date = appointment.fields.wunschtermin
                  ? format(parseISO(appointment.fields.wunschtermin), 'EEE, d. MMM', { locale: de })
                  : '';
                const time = appointment.fields.wunschtermin
                  ? format(parseISO(appointment.fields.wunschtermin), 'HH:mm')
                  : '';
                const customerName = [
                  appointment.fields.kunde_vorname,
                  appointment.fields.kunde_nachname
                ].filter(Boolean).join(' ') || 'Unbekannt';
                const service = getServiceForAppointment(appointment);

                return (
                  <div
                    key={appointment.record_id}
                    className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="text-xs text-muted-foreground w-20">
                      <div>{date}</div>
                      <div className="font-medium text-foreground">{time}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{customerName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {service?.fields.leistungsname || 'Massage'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 text-base">
                <Plus className="h-5 w-5 mr-2" />
                Termin hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neuen Termin erstellen</DialogTitle>
              </DialogHeader>
              <AddAppointmentForm
                services={services}
                onSubmit={handleAddAppointment}
                onCancel={() => setDialogOpen(false)}
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
