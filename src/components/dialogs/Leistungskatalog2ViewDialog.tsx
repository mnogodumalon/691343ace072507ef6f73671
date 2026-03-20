import type { Leistungskatalog2 } from '@/types/app';
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

interface Leistungskatalog2ViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Leistungskatalog2 | null;
  onEdit: (record: Leistungskatalog2) => void;
}

export function Leistungskatalog2ViewDialog({ open, onClose, record, onEdit }: Leistungskatalog2ViewDialogProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leistungskatalog 2 anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Gültig von</Label>
            <p className="text-sm">{formatDate(record.fields.gueltig_von_2)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Gültig bis</Label>
            <p className="text-sm">{formatDate(record.fields.gueltig_bis_2)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground"> </Label>
            <p className="text-sm">{record.fields.leistungsname_2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Beschreibung</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.beschreibung_2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dauer (Minuten)</Label>
            <p className="text-sm">{record.fields.dauer_minuten_2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Preis (EUR)</Label>
            <p className="text-sm">{record.fields.preis_2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Gutscheincode</Label>
            <p className="text-sm">{record.fields.gutschein_code_2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Beschreibung</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.gutschein_beschreibung_2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rabatt-Typ</Label>
            <Badge variant="secondary">{record.fields.rabatt_typ_2?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rabattwert</Label>
            <p className="text-sm">{record.fields.rabatt_wert_2 ?? '—'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}