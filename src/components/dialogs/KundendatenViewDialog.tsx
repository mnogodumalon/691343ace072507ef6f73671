import type { Kundendaten, Leistungskatalog } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IconPencil } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

interface KundendatenViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Kundendaten | null;
  onEdit: (record: Kundendaten) => void;
  leistungskatalogList: Leistungskatalog[];
}

export function KundendatenViewDialog({ open, onClose, record, onEdit, leistungskatalogList }: KundendatenViewDialogProps) {
  function getLeistungskatalogDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return leistungskatalogList.find(r => r.record_id === id)?.fields.leistungsname ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kundendaten anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Vorname</Label>
            <p className="text-sm">{record.fields.vorname ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Nachname</Label>
            <p className="text-sm">{record.fields.nachname ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">E-Mail</Label>
            <p className="text-sm">{record.fields.email ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Telefon</Label>
            <p className="text-sm">{record.fields.telefon ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Straße</Label>
            <p className="text-sm">{record.fields.strasse ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hausnummer</Label>
            <p className="text-sm">{record.fields.hausnummer ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Postleitzahl</Label>
            <p className="text-sm">{record.fields.postleitzahl ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Stadt</Label>
            <p className="text-sm">{record.fields.stadt ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_5)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_5_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_5_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_6)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_6_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_6_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_1_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_2_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_3_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_4)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_4_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_4_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_7)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_7_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_7_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_8)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_8_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_8_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_9)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_9_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_9_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_10)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_10_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Massageleistung</Label>
            <p className="text-sm">{getLeistungskatalogDisplayName(record.fields.letzter_termin_10_leistung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_1)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_1_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_2)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_2_dauer?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Datum & Uhrzeit</Label>
            <p className="text-sm">{formatDate(record.fields.letzter_termin_3)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer</Label>
            <Badge variant="secondary">{record.fields.letzter_termin_3_dauer?.label ?? '—'}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}