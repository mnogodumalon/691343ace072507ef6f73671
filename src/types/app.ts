// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Kundendaten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    postleitzahl?: string;
    stadt?: string;
  };
}

export interface Leistungskatalog {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    leistungsname?: string;
    beschreibung?: string;
    dauer_minuten?: number;
    preis?: number;
    gutschein_code?: string;
    gutschein_beschreibung?: string;
    rabatt_typ?: 'prozent' | 'betrag';
    rabatt_wert?: number;
    gueltig_von?: string; // Format: YYYY-MM-DD oder ISO String
    gueltig_bis?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Leistungskatalog2 {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    leistungsname_2?: string;
    beschreibung_2?: string;
    dauer_minuten_2?: number;
    preis_2?: number;
    gutschein_code_2?: string;
    gutschein_beschreibung_2?: string;
    rabatt_typ_2?: 'prozent' | 'betrag';
    rabatt_wert_2?: number;
    gueltig_von_2?: string; // Format: YYYY-MM-DD oder ISO String
    gueltig_bis_2?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Impressum {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    firmenname?: string;
    inhaber?: string;
    strasse_impressum?: string;
    hausnummer_impressum?: string;
    postleitzahl_impressum?: string;
    stadt_impressum?: string;
    telefon_impressum?: string;
    email_impressum?: string;
    handelsregister?: string;
    ust_id?: string;
    aufsichtsbehoerde?: string;
    rechtliche_hinweise?: string;
  };
}

export interface Terminanfrage {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    e_mail_adresse?: string;
    anzahl_anwendungen?: 'anzahl_1' | 'anzahl_2' | 'anzahl_3' | 'anzahl_4' | 'anzahl_5' | 'anzahl_6' | 'anzahl_7' | 'anzahl_8' | 'anzahl_9' | 'anzahl_10';
    gesamtdauer?: 'dauer_30' | 'dauer_45' | 'dauer_60';
    ausgewaehlte_leistung_2?: string; // applookup -> URL zu 'Leistungskatalog2' Record
    ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu?: boolean;
    ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen?: boolean;
    kunde_vorname?: string;
    kunde_nachname?: string;
    kunde_telefon?: string;
    kunde_strasse?: string;
    kunde_hausnummer?: string;
    kunde_postleitzahl?: string;
    kunde_stadt?: string;
    wunschtermin?: string; // Format: YYYY-MM-DD oder ISO String
    anmerkungen?: string;
    massageleistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
  };
}

export const APP_IDS = {
  KUNDENDATEN: '69134384a7881852231ba8c7',
  LEISTUNGSKATALOG: '6913437daff7287a0f9bab21',
  LEISTUNGSKATALOG_2: '692a00a775bdd48e383a981e',
  IMPRESSUM: '692ef3bf7b163c49a87dc883',
  TERMINANFRAGE: '691343895f81839bc1f243fe',
} as const;

// Helper Types for creating new records
export type CreateKundendaten = Kundendaten['fields'];
export type CreateLeistungskatalog = Leistungskatalog['fields'];
export type CreateLeistungskatalog2 = Leistungskatalog2['fields'];
export type CreateImpressum = Impressum['fields'];
export type CreateTerminanfrage = Terminanfrage['fields'];