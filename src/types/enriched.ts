import type { Kundendaten } from './app';

export type EnrichedKundendaten = Kundendaten & {
  letzter_termin_5_leistungName: string;
  letzter_termin_6_leistungName: string;
  letzter_termin_1_leistungName: string;
  letzter_termin_2_leistungName: string;
  letzter_termin_3_leistungName: string;
  letzter_termin_4_leistungName: string;
  letzter_termin_7_leistungName: string;
  letzter_termin_8_leistungName: string;
  letzter_termin_9_leistungName: string;
  letzter_termin_10_leistungName: string;
};
