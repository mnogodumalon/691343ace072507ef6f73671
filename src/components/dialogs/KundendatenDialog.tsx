import { useState, useEffect, useRef, useCallback } from 'react';
import type { Kundendaten, Leistungskatalog } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId, createRecordUrl, cleanFieldsForApi, getUserProfile } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IconCamera, IconCircleCheck, IconFileText, IconLoader2, IconPhotoPlus, IconSparkles, IconUpload, IconX } from '@tabler/icons-react';
import { fileToDataUri, extractFromPhoto, extractPhotoMeta, reverseGeocode } from '@/lib/ai';
import { lookupKey } from '@/lib/formatters';

interface KundendatenDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (fields: Kundendaten['fields']) => Promise<void>;
  defaultValues?: Kundendaten['fields'];
  leistungskatalogList: Leistungskatalog[];
  enablePhotoScan?: boolean;
  enablePhotoLocation?: boolean;
}

export function KundendatenDialog({ open, onClose, onSubmit, defaultValues, leistungskatalogList, enablePhotoScan = true, enablePhotoLocation = true }: KundendatenDialogProps) {
  const [fields, setFields] = useState<Partial<Kundendaten['fields']>>({});
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
      const clean = cleanFieldsForApi({ ...fields }, 'kundendaten');
      await onSubmit(clean as Kundendaten['fields']);
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
      contextParts.push(`<available-records field="letzter_termin_5_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_6_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_1_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_2_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_3_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_4_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_7_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_8_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_9_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      contextParts.push(`<available-records field="letzter_termin_10_leistung" entity="Leistungskatalog">\n${JSON.stringify(leistungskatalogList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      if (usePersonalInfo) {
        try {
          const profile = await getUserProfile();
          contextParts.push(`<user-profile>\nThe following is the logged-in user\'s personal information. Use this to pre-fill relevant fields like name, email, address, company etc. when appropriate:\n${JSON.stringify(profile, null, 2)}\n</user-profile>`);
        } catch (err) {
          console.warn('Failed to fetch user profile:', err);
        }
      }
      const photoContext = contextParts.length ? contextParts.join('\n') : undefined;
      const schema = `{\n  "vorname": string | null, // Vorname\n  "nachname": string | null, // Nachname\n  "email": string | null, // E-Mail\n  "telefon": string | null, // Telefon\n  "strasse": string | null, // Straße\n  "hausnummer": string | null, // Hausnummer\n  "postleitzahl": string | null, // Postleitzahl\n  "stadt": string | null, // Stadt\n  "letzter_termin_5": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_5_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n  "letzter_termin_5_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_6": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_6_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n  "letzter_termin_6_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_1_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_2_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_3_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_4": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_4_dauer": LookupValue | null, // Dauer (select one key: "dauer_45" | "dauer_60" | "dauer_30") mapping: dauer_45=45, dauer_60=60, dauer_30=30\n  "letzter_termin_4_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_7": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_7_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n  "letzter_termin_7_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_8": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_8_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n  "letzter_termin_8_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_9": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_9_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n  "letzter_termin_9_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_10": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_10_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n  "letzter_termin_10_leistung": string | null, // Display name from Leistungskatalog (see <available-records>)\n  "letzter_termin_1": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_1_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n  "letzter_termin_2": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_2_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n  "letzter_termin_3": string | null, // YYYY-MM-DDTHH:MM\n  "letzter_termin_3_dauer": LookupValue | null, // Dauer (select one key: "dauer_30" | "dauer_45" | "dauer_60") mapping: dauer_30=30, dauer_45=45, dauer_60=60\n}`;
      const raw = await extractFromPhoto<Record<string, unknown>>(uri, schema, photoContext, DIALOG_INTENT);
      setFields(prev => {
        const merged = { ...prev } as Record<string, unknown>;
        function matchName(name: string, candidates: string[]): boolean {
          const n = name.toLowerCase().trim();
          return candidates.some(c => c.toLowerCase().includes(n) || n.includes(c.toLowerCase()));
        }
        const applookupKeys = new Set<string>(["letzter_termin_5_leistung", "letzter_termin_6_leistung", "letzter_termin_1_leistung", "letzter_termin_2_leistung", "letzter_termin_3_leistung", "letzter_termin_4_leistung", "letzter_termin_7_leistung", "letzter_termin_8_leistung", "letzter_termin_9_leistung", "letzter_termin_10_leistung"]);
        for (const [k, v] of Object.entries(raw)) {
          if (applookupKeys.has(k)) continue;
          if (v != null) merged[k] = v;
        }
        const letzter_termin_5_leistungName = raw['letzter_termin_5_leistung'] as string | null;
        if (letzter_termin_5_leistungName) {
          const letzter_termin_5_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_5_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_5_leistungMatch) merged['letzter_termin_5_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_5_leistungMatch.record_id);
        }
        const letzter_termin_6_leistungName = raw['letzter_termin_6_leistung'] as string | null;
        if (letzter_termin_6_leistungName) {
          const letzter_termin_6_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_6_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_6_leistungMatch) merged['letzter_termin_6_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_6_leistungMatch.record_id);
        }
        const letzter_termin_1_leistungName = raw['letzter_termin_1_leistung'] as string | null;
        if (letzter_termin_1_leistungName) {
          const letzter_termin_1_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_1_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_1_leistungMatch) merged['letzter_termin_1_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_1_leistungMatch.record_id);
        }
        const letzter_termin_2_leistungName = raw['letzter_termin_2_leistung'] as string | null;
        if (letzter_termin_2_leistungName) {
          const letzter_termin_2_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_2_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_2_leistungMatch) merged['letzter_termin_2_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_2_leistungMatch.record_id);
        }
        const letzter_termin_3_leistungName = raw['letzter_termin_3_leistung'] as string | null;
        if (letzter_termin_3_leistungName) {
          const letzter_termin_3_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_3_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_3_leistungMatch) merged['letzter_termin_3_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_3_leistungMatch.record_id);
        }
        const letzter_termin_4_leistungName = raw['letzter_termin_4_leistung'] as string | null;
        if (letzter_termin_4_leistungName) {
          const letzter_termin_4_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_4_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_4_leistungMatch) merged['letzter_termin_4_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_4_leistungMatch.record_id);
        }
        const letzter_termin_7_leistungName = raw['letzter_termin_7_leistung'] as string | null;
        if (letzter_termin_7_leistungName) {
          const letzter_termin_7_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_7_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_7_leistungMatch) merged['letzter_termin_7_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_7_leistungMatch.record_id);
        }
        const letzter_termin_8_leistungName = raw['letzter_termin_8_leistung'] as string | null;
        if (letzter_termin_8_leistungName) {
          const letzter_termin_8_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_8_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_8_leistungMatch) merged['letzter_termin_8_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_8_leistungMatch.record_id);
        }
        const letzter_termin_9_leistungName = raw['letzter_termin_9_leistung'] as string | null;
        if (letzter_termin_9_leistungName) {
          const letzter_termin_9_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_9_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_9_leistungMatch) merged['letzter_termin_9_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_9_leistungMatch.record_id);
        }
        const letzter_termin_10_leistungName = raw['letzter_termin_10_leistung'] as string | null;
        if (letzter_termin_10_leistungName) {
          const letzter_termin_10_leistungMatch = leistungskatalogList.find(r => matchName(letzter_termin_10_leistungName!, [String(r.fields.leistungsname ?? '')]));
          if (letzter_termin_10_leistungMatch) merged['letzter_termin_10_leistung'] = createRecordUrl(APP_IDS.LEISTUNGSKATALOG, letzter_termin_10_leistungMatch.record_id);
        }
        return merged as Partial<Kundendaten['fields']>;
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

  const DIALOG_INTENT = defaultValues ? 'Kundendaten bearbeiten' : 'Kundendaten hinzufügen';

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
            <Label htmlFor="vorname">Vorname</Label>
            <Input
              id="vorname"
              value={fields.vorname ?? ''}
              onChange={e => setFields(f => ({ ...f, vorname: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nachname">Nachname</Label>
            <Input
              id="nachname"
              value={fields.nachname ?? ''}
              onChange={e => setFields(f => ({ ...f, nachname: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={fields.email ?? ''}
              onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              value={fields.telefon ?? ''}
              onChange={e => setFields(f => ({ ...f, telefon: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strasse">Straße</Label>
            <Input
              id="strasse"
              value={fields.strasse ?? ''}
              onChange={e => setFields(f => ({ ...f, strasse: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hausnummer">Hausnummer</Label>
            <Input
              id="hausnummer"
              value={fields.hausnummer ?? ''}
              onChange={e => setFields(f => ({ ...f, hausnummer: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postleitzahl">Postleitzahl</Label>
            <Input
              id="postleitzahl"
              value={fields.postleitzahl ?? ''}
              onChange={e => setFields(f => ({ ...f, postleitzahl: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stadt">Stadt</Label>
            <Input
              id="stadt"
              value={fields.stadt ?? ''}
              onChange={e => setFields(f => ({ ...f, stadt: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_5">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_5"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_5 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_5: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_5_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_5_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_5_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_5_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_5_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_5_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_5_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_5_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_6">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_6"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_6 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_6: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_6_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_6_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_6_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_6_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_6_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_6_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_6_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_6_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_1_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_1_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_1_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_1_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_2_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_2_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_2_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_2_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_3_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_3_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_3_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_3_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_4">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_4"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_4 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_4: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_4_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_4_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_4_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_4_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_4_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_4_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_4_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_4_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_7">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_7"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_7 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_7: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_7_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_7_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_7_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_7_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_7_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_7_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_7_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_7_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_8">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_8"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_8 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_8: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_8_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_8_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_8_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_8_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_8_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_8_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_8_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_8_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_9">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_9"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_9 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_9: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_9_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_9_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_9_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_9_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_9_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_9_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_9_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_9_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_10">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_10"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_10 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_10: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_10_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_10_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_10_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_10_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_10_leistung">Massageleistung</Label>
            <Select
              value={extractRecordId(fields.letzter_termin_10_leistung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_10_leistung: v === 'none' ? undefined : createRecordUrl(APP_IDS.LEISTUNGSKATALOG, v) }))}
            >
              <SelectTrigger id="letzter_termin_10_leistung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
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
            <Label htmlFor="letzter_termin_1">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_1"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_1 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_1: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_1_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_1_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_1_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_1_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_2">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_2"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_2 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_2: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_2_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_2_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_2_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_2_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_3">Datum & Uhrzeit</Label>
            <Input
              id="letzter_termin_3"
              type="datetime-local"
              step="60"
              value={fields.letzter_termin_3 ?? ''}
              onChange={e => setFields(f => ({ ...f, letzter_termin_3: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letzter_termin_3_dauer">Dauer</Label>
            <Select
              value={lookupKey(fields.letzter_termin_3_dauer) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, letzter_termin_3_dauer: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="letzter_termin_3_dauer"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="dauer_30">30</SelectItem>
                <SelectItem value="dauer_45">45</SelectItem>
                <SelectItem value="dauer_60">60</SelectItem>
              </SelectContent>
            </Select>
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