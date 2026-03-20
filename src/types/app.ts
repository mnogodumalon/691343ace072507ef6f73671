// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface Leistungskatalog2 {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    gueltig_von_2?: string; // Format: YYYY-MM-DD oder ISO String
    gueltig_bis_2?: string; // Format: YYYY-MM-DD oder ISO String
    leistungsname_2?: string;
    beschreibung_2?: string;
    dauer_minuten_2?: number;
    preis_2?: number;
    gutschein_code_2?: string;
    gutschein_beschreibung_2?: string;
    rabatt_typ_2?: LookupValue;
    rabatt_wert_2?: number;
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
    rabatt_typ?: LookupValue;
    rabatt_wert?: number;
    gueltig_von?: string; // Format: YYYY-MM-DD oder ISO String
    gueltig_bis?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Impressum {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    email_impressum?: string;
    ust_id?: string;
    rechtliche_hinweise?: string;
    inhaber?: string;
    hausnummer_impressum?: string;
    stadt_impressum?: string;
    handelsregister?: string;
    firmenname?: string;
    strasse_impressum?: string;
    postleitzahl_impressum?: string;
    telefon_impressum?: string;
    aufsichtsbehoerde?: string;
  };
}

export interface Terminanfrage {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    e_mail_adresse?: string;
    anzahl_anwendungen?: LookupValue;
    gesamtdauer?: LookupValue;
    kunde_telefon?: string;
    kunde_hausnummer?: string;
    kunde_stadt?: string;
    wunschtermin?: string; // Format: YYYY-MM-DD oder ISO String
    ausgewaehlte_leistung_2?: string; // applookup -> URL zu 'Leistungskatalog2' Record
    kunde_nachname?: string;
    kunde_postleitzahl?: string;
    massageleistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    kunde_vorname?: string;
    kunde_strasse?: string;
    anmerkungen?: string;
    ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu?: boolean;
    ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen?: boolean;
  };
}

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
    letzter_termin_5?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_5_dauer?: LookupValue;
    letzter_termin_5_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_6?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_6_dauer?: LookupValue;
    letzter_termin_6_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_1_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_2_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_3_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_4?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_4_dauer?: LookupValue;
    letzter_termin_4_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_7?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_7_dauer?: LookupValue;
    letzter_termin_7_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_8?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_8_dauer?: LookupValue;
    letzter_termin_8_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_9?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_9_dauer?: LookupValue;
    letzter_termin_9_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_10?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_10_dauer?: LookupValue;
    letzter_termin_10_leistung?: string; // applookup -> URL zu 'Leistungskatalog' Record
    letzter_termin_1?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_1_dauer?: LookupValue;
    letzter_termin_2?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_2_dauer?: LookupValue;
    letzter_termin_3?: string; // Format: YYYY-MM-DD oder ISO String
    letzter_termin_3_dauer?: LookupValue;
  };
}

export const APP_IDS = {
  LEISTUNGSKATALOG_2: '692a00a775bdd48e383a981e',
  LEISTUNGSKATALOG: '6913437daff7287a0f9bab21',
  IMPRESSUM: '692ef3bf7b163c49a87dc883',
  TERMINANFRAGE: '691343895f81839bc1f243fe',
  KUNDENDATEN: '69134384a7881852231ba8c7',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  leistungskatalog_2: {
    rabatt_typ_2: [{ key: "prozent", label: "Prozentualer Rabatt" }, { key: "betrag", label: "Fester Betrag" }],
  },
  leistungskatalog: {
    rabatt_typ: [{ key: "prozent", label: "Prozentualer Rabatt" }, { key: "betrag", label: "Fester Betrag" }],
  },
  terminanfrage: {
    anzahl_anwendungen: [{ key: "anzahl_1", label: "1" }, { key: "anzahl_2", label: "2" }, { key: "anzahl_3", label: "3" }, { key: "anzahl_4", label: "4" }, { key: "anzahl_5", label: "5" }, { key: "anzahl_6", label: "6" }, { key: "anzahl_7", label: "7" }, { key: "anzahl_8", label: "8" }, { key: "anzahl_9", label: "9" }, { key: "anzahl_10", label: "10" }],
    gesamtdauer: [{ key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }, { key: "dauer_30", label: "30" }],
  },
  kundendaten: {
    letzter_termin_5_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_6_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_4_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_7_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_8_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_9_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_10_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_1_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_2_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
    letzter_termin_3_dauer: [{ key: "dauer_30", label: "30" }, { key: "dauer_45", label: "45" }, { key: "dauer_60", label: "60" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'leistungskatalog_2': {
    'gueltig_von_2': 'date/date',
    'gueltig_bis_2': 'date/date',
    'leistungsname_2': 'string/text',
    'beschreibung_2': 'string/textarea',
    'dauer_minuten_2': 'number',
    'preis_2': 'number',
    'gutschein_code_2': 'string/text',
    'gutschein_beschreibung_2': 'string/textarea',
    'rabatt_typ_2': 'lookup/select',
    'rabatt_wert_2': 'number',
  },
  'leistungskatalog': {
    'leistungsname': 'string/text',
    'beschreibung': 'string/textarea',
    'dauer_minuten': 'number',
    'preis': 'number',
    'gutschein_code': 'string/text',
    'gutschein_beschreibung': 'string/textarea',
    'rabatt_typ': 'lookup/select',
    'rabatt_wert': 'number',
    'gueltig_von': 'date/date',
    'gueltig_bis': 'date/date',
  },
  'impressum': {
    'email_impressum': 'string/email',
    'ust_id': 'string/text',
    'rechtliche_hinweise': 'string/textarea',
    'inhaber': 'string/text',
    'hausnummer_impressum': 'string/text',
    'stadt_impressum': 'string/text',
    'handelsregister': 'string/text',
    'firmenname': 'string/text',
    'strasse_impressum': 'string/text',
    'postleitzahl_impressum': 'string/text',
    'telefon_impressum': 'string/tel',
    'aufsichtsbehoerde': 'string/text',
  },
  'terminanfrage': {
    'e_mail_adresse': 'string/text',
    'anzahl_anwendungen': 'lookup/select',
    'gesamtdauer': 'lookup/select',
    'kunde_telefon': 'string/tel',
    'kunde_hausnummer': 'string/text',
    'kunde_stadt': 'string/text',
    'wunschtermin': 'date/datetimeminute',
    'ausgewaehlte_leistung_2': 'applookup/select',
    'kunde_nachname': 'string/text',
    'kunde_postleitzahl': 'string/text',
    'massageleistung': 'applookup/select',
    'kunde_vorname': 'string/text',
    'kunde_strasse': 'string/text',
    'anmerkungen': 'string/textarea',
    'ich_habe_die_allgemeinen_geschaeftsbedigungen_agb_gelesen_und_stimme_diesen_hiermit_zu': 'bool',
    'ich_habe_die_datenschutzerklaerung_zur_kenntnis_genommen': 'bool',
  },
  'kundendaten': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'postleitzahl': 'string/text',
    'stadt': 'string/text',
    'letzter_termin_5': 'date/datetimeminute',
    'letzter_termin_5_dauer': 'lookup/select',
    'letzter_termin_5_leistung': 'applookup/select',
    'letzter_termin_6': 'date/datetimeminute',
    'letzter_termin_6_dauer': 'lookup/select',
    'letzter_termin_6_leistung': 'applookup/select',
    'letzter_termin_1_leistung': 'applookup/select',
    'letzter_termin_2_leistung': 'applookup/select',
    'letzter_termin_3_leistung': 'applookup/select',
    'letzter_termin_4': 'date/datetimeminute',
    'letzter_termin_4_dauer': 'lookup/select',
    'letzter_termin_4_leistung': 'applookup/select',
    'letzter_termin_7': 'date/datetimeminute',
    'letzter_termin_7_dauer': 'lookup/select',
    'letzter_termin_7_leistung': 'applookup/select',
    'letzter_termin_8': 'date/datetimeminute',
    'letzter_termin_8_dauer': 'lookup/select',
    'letzter_termin_8_leistung': 'applookup/select',
    'letzter_termin_9': 'date/datetimeminute',
    'letzter_termin_9_dauer': 'lookup/select',
    'letzter_termin_9_leistung': 'applookup/select',
    'letzter_termin_10': 'date/datetimeminute',
    'letzter_termin_10_dauer': 'lookup/select',
    'letzter_termin_10_leistung': 'applookup/select',
    'letzter_termin_1': 'date/datetimeminute',
    'letzter_termin_1_dauer': 'lookup/select',
    'letzter_termin_2': 'date/datetimeminute',
    'letzter_termin_2_dauer': 'lookup/select',
    'letzter_termin_3': 'date/datetimeminute',
    'letzter_termin_3_dauer': 'lookup/select',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateLeistungskatalog2 = StripLookup<Leistungskatalog2['fields']>;
export type CreateLeistungskatalog = StripLookup<Leistungskatalog['fields']>;
export type CreateImpressum = StripLookup<Impressum['fields']>;
export type CreateTerminanfrage = StripLookup<Terminanfrage['fields']>;
export type CreateKundendaten = StripLookup<Kundendaten['fields']>;