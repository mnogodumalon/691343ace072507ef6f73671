import { useState, useEffect, useRef, useCallback } from 'react';
import type { Terminanfrage, Leistungskatalog2, Leistungskatalog } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId, createRecordUrl, cleanFieldsForApi, getUserProfile } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IconCamera, IconCircleCheck, IconFileText, IconLoader2, IconPhotoPlus, IconSparkles, IconUpload, IconX } from '@tabler/icons-react';
import { fileToDataUri, extractFromPhoto, extractPhotoMeta, reverseGeocode } from '@/lib/ai';
import { lookupKey } from '@/lib/formatters';

interface TerminanfrageDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (fields: Terminanfrage['fields']) => Promise<void>;
  defaultValues?: Terminanfrage['fields'];
  leistungskatalog_2List: Leistungskatalog2[];
  leistungskatalogList: Leistungskatalog[];
  enablePhotoScan?: boolean;
  enablePhotoLocation?: boolean;
}

export function TerminanfrageDialog({ open, onClose, onSubmit, defaultValues, leistungskatalog_2List, leistungskatalogList, enablePhotoScan = false, enablePhotoLocation = true }: TerminanfrageDialogProps) {
  const [fields, setFields] = useState<Partial<Terminanfrage['fields']>>({});
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [usePersonalInfo, setUsePersonalInfo] = useState(() => {
    try { return localStorage.getItem('ai-use-personal-info') === 'true'; } catch { return false; }
  });
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFields(defaultValues ?? {});
      setPreview(null);
      setScanSuccess(false);
    }
  }, [open, defaultValues]);
  useEffect(() => {
    try { localStorage.setItem('ai-use-personal-info', String(usePersonalInfo)); } catch {}
  }, [usePersonalInfo]);
  async function handleShowProfileInfo() {
    if (showProfileInfo) { setShowProfileInfo(false); return; }
    setProfileLoading(true);
    try {
      const p = await getUserProfile();
      setProfileData(p);
    } catch {
      setProfileData(null);
    } finally {
      setProfileLoading(false);
      setShowProfileInfo(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const clean = cleanFieldsForApi({ ...fields }, 'terminanfrage');
      await onSubmit(clean as Terminanfrage['fields']);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoScan(file: File) {
    setScanning(true);
    setScanSuccess(false);
    try {
      const [uri, meta] = await Promise.all([fileToDataUri(file), extractPhotoMeta(file)]);
      if (file.type.startsWith('image/')) setPreview(uri);
      const gps = enablePhotoLocation ? meta?.gps ?? null : null;
      const parts: string[] = [];
      let geoAddr = '';
      if (gps) {
        geoAddr = await reverseGeocode(gps.latitude, gps.longitude);
        parts.push(`Location coordinates: ${gps.latitude}, ${gps.longitude}`);
        if (geoAddr) parts.push(`Reverse-geocoded address: ${geoAddr}`);
      }
      if (meta?.dateTime) {
        parts.push(`Date taken: ${meta.dateTime.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')}`);
      }
      const contextParts: string[] = [];
      if (parts.length) {
        contextParts.push(`<photo-metadata>\nThe following metadata was extracted from the photo\'s EXIF data:\n${parts.join('\n')}\n</photo-metadata>`);
      }
      contextParts.push(`<available-records field="ausgewaehlte_leistung_2" entity="Leistungskatalog 2">\n${JSON.stringify(leistungskatalog_2List.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="massageleistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      if (usePersonalInfo) {
        try {
          const profile = await getUserProfile();
          contextParts.push(`<user-profile>\nThe following is the logged-in user\'s personal information. Use this to pre-fill relevant fields like name, email, address, company etc. when appropriate:\n${JSON.stringify(profile, null, 2)}\n</user-profile>`);
        } catch (err) {
          console.warn('Failed to fetch user profile:', err);
        }
      }
      const photoContext = contextParts.length ? contextParts.join('\n') : undefined;
      const schema = `{\n  "e_mail_adresse": string | null, // E-mail\n  "anzahl_anwendungen": LookupValue | null, // Anzahl der Anwendungen (select one key: "anzahl_1" | "anzahl_2" | "anzahl_3" | "anzahl_4" | "anzahl_5" | "anzahl_6" | "anzahl_7" | "anzahl_8" | "anzahl_9" | "anzahl_10") mapping: anzahl_1=1, anzahl_2=2, anzahl_3=3, anzahl_4=4, anzahl_5=5, anzahl_6=6, anzahl_7=7, anzahl_8=8, anzahl_9=9, anzahl_10=10\n  "gesamtdauer": LookupValue | null, // Gesamtdauer (Minuten) (select one key: "dauer_45" | "dauer_60" | "dauer_30") mapping: dauer_45=45, dauer_60=60, dauer_30=30\n  "kunde_telefon": string | null, // Telefon\n  "kunde_hausnummer": string | null, // Hausnummer\n  "kunde_stadt": string | null, // Stadt\n  "wunschtermin": string | null, // YYYY-MM-DDTHH:MM\n  "ausgewaehlte_leistung_2": string | null, // Display name from Leistungskatalog 2 (see <available-records>)\n  "kunde_nachname": string | null, // Nachname\n  "kunde_postleitzahl": string | null, // Postleitzahl\n  "massageleistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "kunde_vorname": string | null, // Vorname\n  "kunde_strasse": string | null, // Straße\n  "anmerkungen": string | null, // Besondere Wünsche oder Anmerkungen\n  "ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu": boolean | null, // Ich habe die Allgemeinen Geschäftsbedigungen (AGB) gelesen und stimme diesen hiermit zu\n  "ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen": boolean | null, // Ich habe die Datenschutzerklärung zur Kenntnis genommen\n}`;
      const raw = await extractFromPhoto<Record<string, unknown>>(uri, schema, photoContext, DIALOG_INTENT);
      setFields(prev => {
        const merged = { ...prev } as Record<string, unknown>;
        function matchName(name: string, candidates: string[]): boolean {
          const n = name.toLowerCase().trim();
          return candidates.some(c => c.toLowerCase().includes(n) || n.includes(c.toLowerCase()));
        }
        const applookupKeys = new Set<string>(["ausgewaehlte_leistung_2", "massageleistung"]);
        for (const [k, v] of Object.entries(raw)) {
          if (applookupKeys.has(k)) continue;
          if (v != null) merged[k] = v;
        }
        const ausgewaehlte_leistung_2Name = raw['ausgewaehlte_leistung_2'] as string | null;
        if (ausgewaehlte_leistung_2Name) {
          const ausgewaehlte_leistung_2Match = leistungskatalog_2List.find(r => matchName(ausgewaehlte_leistung_2Name!, [String(r.fields.leistungsname_2 ?? '')]));
          if (ausgewaehlte_leistung_2Match) merged['ausgewaehlte_leistung_2'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG_2, ausgewaehlte_leistung_2Match.record_id);
        }
        const massageleistungName = raw['massageleistung'] as string | null;
        if (massageleistungName) {
          const massageleistungMatch = leistungskatalogList.find(r => matchName(massageleistungName!, [String(r.fields.leistungsname ?? '')]));
          if (massageleistungMatch) merged['massageleistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, massageleistungMatch.record_id);
        }
        return merged as Partial<Terminanfrage['fields']>;
      });
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 3000);
    } catch (err) {
      console.error('Scan fehlgeschlagen:', err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setScanning(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handlePhotoScan(f);
    e.target.value = '';
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handlePhotoScan(file);
    }
  }, []);

  const DIALOG_INTENT = defaultValues ? 'Terminanfrage bearbeiten' : 'Terminanfrage hinzufügen';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{DIALOG_INTENT}</DialogTitle>
        </DialogHeader>

        {enablePhotoScan && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div>
              <div className="flex items-center gap-1.5 font-medium">
                <IconSparkles className="h-4 w-4 text-primary" />
                KI-Assistent
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Versteht deine Fotos / Dokumente und füllt alles für dich aus</p>
            </div>
            <div className="flex items-start gap-2 pl-0.5">
              <Checkbox
                id="ai-use-personal-info"
                checked={usePersonalInfo}
                onCheckedChange={(v) => setUsePersonalInfo(!!v)}
                className="mt-0.5"
              />
              <span className="text-xs text-muted-foreground leading-snug">
                <Label htmlFor="ai-use-personal-info" className="text-xs font-normal text-muted-foreground cursor-pointer inline">
                  KI-Assistent darf zusätzlich Informationen zu meiner Person verwenden
                </Label>
                {' '}
                <button type="button" onClick={handleShowProfileInfo} className="text-xs text-primary hover:underline whitespace-nowrap">
                  {profileLoading ? 'Lade...' : '(mehr Infos)'}
                </button>
              </span>
            </div>
            {showProfileInfo && (
              <div className="rounded-md border bg-muted/50 p-2 text-xs max-h-40 overflow-y-auto">
                <p className="font-medium mb-1">Folgende Infos über dich können von der KI genutzt werden:</p>
                {profileData ? Object.values(profileData).map((v, i) => (
                  <span key={i}>{i > 0 && ", "}{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                )) : (
                  <span className="text-muted-foreground">Profil konnte nicht geladen werden</span>
                )}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !scanning && fileInputRef.current?.click()}
              className={`
                relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                ${scanning
                  ? 'border-primary/40 bg-primary/5'
                  : scanSuccess
                    ? 'border-green-500/40 bg-green-50/50 dark:bg-green-950/20'
                    : dragOver
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              {scanning ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconLoader2 className="h-7 w-7 text-primary animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">KI analysiert...</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Felder werden automatisch ausgefüllt</p>
                  </div>
                </div>
              ) : scanSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <IconCircleCheck className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Felder ausgefüllt!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Prüfe die Werte und passe sie ggf. an</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-14 w-14 rounded-full bg-primary/8 flex items-center justify-center">
                    <IconPhotoPlus className="h-7 w-7 text-primary/70" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Foto oder Dokument hierher ziehen oder auswählen</p>
                  </div>
                </div>
              )}

              {preview && !scanning && (
                <div className="absolute top-2 right-2">
                  <div className="relative group">
                    <img src={preview} alt="" className="h-10 w-10 rounded-md object-cover border shadow-sm" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setPreview(null); }}
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-muted-foreground/80 text-white flex items-center justify-center"
                    >
                      <IconX className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="flex-1 h-9 text-xs" disabled={scanning}
                onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                <IconCamera className="h-3.5 w-3.5 mr-1.5" />Kamera
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1 h-9 text-xs" disabled={scanning}
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <IconUpload className="h-3.5 w-3.5 mr-1.5" />Foto wählen
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1 h-9 text-xs" disabled={scanning}
                onClick={e => {
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'application/pdf,.pdf';
                    fileInputRef.current.click();
                    setTimeout(() => { if (fileInputRef.current) fileInputRef.current.accept = 'image/*,application/pdf'; }, 100);
                  }
                }}>
                <IconFileText className="h-3.5 w-3.5 mr-1.5" />Dokument
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="e_mail_adresse">E-mail</Label>
            <Input
              id="e_mail_adresse"
              value={fields.e_mail_adresse ?? ''}
              onChange={e => setFields(f => ({ ...f, e_mail_adresse: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anzahl_anwendungen">Anzahl der Anwendungen</Label>
            <Select
              value={lookupKey(fields.anzahl_anwendungen) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, anzahl_anwendungen: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="anzahl_anwendungen"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="anzahl_1">1</SelectItem>
                <SelectItem value="anzahl_2">2</SelectItem>
                <SelectItem value="anzahl_3">3</SelectItem>
                <SelectItem value="anzahl_4">4</SelectItem>
                <SelectItem value="anzahl_5">5</SelectItem>
                <SelectItem value="anzahl_6">6</SelectItem>
                <SelectItem value="anzahl_7">7</SelectItem>
                <SelectItem value="anzahl_8">8</SelectItem>
                <SelectItem value="anzahl_9">9</SelectItem>
                <SelectItem value="anzahl_10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gesamtdauer">Gesamtdauer (Minuten)</Label>
            <Select
              value={lookupKey(fields.gesamtdauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, gesamtdauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="gesamtdauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kunde_telefon">Telefon</Label>
            <Input
              id="kunde_telefon"
              value={fields.kunde_telefon ?? ''}
              onChange={e => setFields(f => ({ ...f, kunde_telefon: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kunde_hausnummer">Hausnummer</Label>
            <Input
              id="kunde_hausnummer"
              value={fields.kunde_hausnummer ?? ''}
              onChange={e => setFields(f => ({ ...f, kunde_hausnummer: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kunde_stadt">Stadt</Label>
            <Input
              id="kunde_stadt"
              value={fields.kunde_stadt ?? ''}
              onChange={e => setFields(f => ({ ...f, kunde_stadt: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wunschtermin">Gewünschter Termin</Label>
            <Input
              id="wunschtermin"
              type="datetime-local"
              step="60"
              value={fields.wunschtermin ?? ''}
              onChange={e => setFields(f => ({ ...f, wunschtermin: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ausgewaehlte_leistung_2">Wohlfühlpässe und Aktionen</Label>
            <Select
              value={extractRecordId(fields.ausgewaehlte_leistung_2) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, ausgewaehlte_leistung_2: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG_2, v) }))}
            >
              <SelectTrigger id="ausgewaehlte_leistung_2"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {leistungskatalog_2List.map(r => (
                  <SelectItem key={r.record_id} value={r.record_id}>
                    {r.fields.leistungsname_2 ?? r.record_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kunde_nachname">Nachname</Label>
            <Input
              id="kunde_nachname"
              value={fields.kunde_nachname ?? ''}
              onChange={e => setFields(f => ({ ...f, kunde_nachname: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kunde_postleitzahl">Postleitzahl</Label>
            <Input
              id="kunde_postleitzahl"
              value={fields.kunde_postleitzahl ?? ''}
              onChange={e => setFields(f => ({ ...f, kunde_postleitzahl: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="massageleistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.massageleistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, massageleistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="massageleistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {leistungskatalogList.map(r => (
                  <SelectItem key={r.record_id} value={r.record_id}>
                    {r.fields.leistungsname ?? r.record_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kunde_vorname">Vorname</Label>
            <Input
              id="kunde_vorname"
              value={fields.kunde_vorname ?? ''}
              onChange={e => setFields(f => ({ ...f, kunde_vorname: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kunde_strasse">Straße</Label>
            <Input
              id="kunde_strasse"
              value={fields.kunde_strasse ?? ''}
              onChange={e => setFields(f => ({ ...f, kunde_strasse: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anmerkungen">Besondere Wünsche oder Anmerkungen</Label>
            <Textarea
              id="anmerkungen"
              value={fields.anmerkungen ?? ''}
              onChange={e => setFields(f => ({ ...f, anmerkungen: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu">Ich habe die Allgemeinen Geschäftsbedigungen (AGB) gelesen und stimme diesen hiermit zu</Label>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu"
                checked={!!fields.ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu}
                onCheckedChange={(v) => setFields(f => ({ ...f, ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu: !!v }))}
              />
              <Label htmlFor="ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu" className="font-normal">Ich habe die Allgemeinen Geschäftsbedigungen (AGB) gelesen und stimme diesen hiermit zu</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen">Ich habe die Datenschutzerklärung zur Kenntnis genommen</Label>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen"
                checked={!!fields.ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen}
                onCheckedChange={(v) => setFields(f => ({ ...f, ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen: !!v }))}
              />
              <Label htmlFor="ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen" className="font-normal">Ich habe die Datenschutzerklärung zur Kenntnis genommen</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Speichern...' : defaultValues ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}