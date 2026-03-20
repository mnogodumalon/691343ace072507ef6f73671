// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS, LOOKUP_OPTIONS, FIELD_TYPES } from '@/types/app';
import type { Leistungskatalog2, Leistungskatalog, Impressum, Terminanfrage, Kundendaten } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: unknown): string | null {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

/** Upload a file to LivingApps. Returns the file URL for use in record fields. */
export async function uploadFile(file: File | Blob, filename?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, filename ?? (file instanceof File ? file.name : 'upload'));
  const res = await fetch(`${API_BASE_URL}/files`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(`File upload failed: ${res.status}`);
  const data = await res.json();
  return data.url;
}

function enrichLookupFields<T extends { fields: Record<string, unknown> }>(
  records: T[], entityKey: string
): T[] {
  const opts = LOOKUP_OPTIONS[entityKey];
  if (!opts) return records;
  return records.map(r => {
    const fields = { ...r.fields };
    for (const [fieldKey, options] of Object.entries(opts)) {
      const val = fields[fieldKey];
      if (typeof val === 'string') {
        const m = options.find(o => o.key === val);
        fields[fieldKey] = m ?? { key: val, label: val };
      } else if (Array.isArray(val)) {
        fields[fieldKey] = val.map(v => {
          if (typeof v === 'string') {
            const m = options.find(o => o.key === v);
            return m ?? { key: v, label: v };
          }
          return v;
        });
      }
    }
    return { ...r, fields } as T;
  });
}

/** Normalize fields for API writes: strip lookup objects to keys, fix date formats. */
export function cleanFieldsForApi(
  fields: Record<string, unknown>,
  entityKey: string
): Record<string, unknown> {
  const clean: Record<string, unknown> = { ...fields };
  for (const [k, v] of Object.entries(clean)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && 'key' in v) clean[k] = (v as any).key;
    if (Array.isArray(v)) clean[k] = v.map((item: any) => item && typeof item === 'object' && 'key' in item ? item.key : item);
  }
  const types = FIELD_TYPES[entityKey];
  if (types) {
    for (const [k, ft] of Object.entries(types)) {
      const val = clean[k];
      if (typeof val !== 'string' || !val) continue;
      if (ft === 'date/datetimeminute') clean[k] = val.slice(0, 16);
      else if (ft === 'date/date') clean[k] = val.slice(0, 10);
    }
  }
  return clean;
}

let _cachedUserProfile: Record<string, unknown> | null = null;

export async function getUserProfile(): Promise<Record<string, unknown>> {
  if (_cachedUserProfile) return _cachedUserProfile;
  const raw = await callApi('GET', '/user');
  const skip = new Set(['id', 'image', 'lang', 'gender', 'title', 'fax', 'menus', 'initials']);
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v != null && !skip.has(k)) data[k] = v;
  }
  _cachedUserProfile = data;
  return data;
}

export interface HeaderProfile {
  firstname: string;
  surname: string;
  email: string;
  image: string | null;
  company: string | null;
}

let _cachedHeaderProfile: HeaderProfile | null = null;

export async function getHeaderProfile(): Promise<HeaderProfile> {
  if (_cachedHeaderProfile) return _cachedHeaderProfile;
  const raw = await callApi('GET', '/user');
  _cachedHeaderProfile = {
    firstname: raw.firstname ?? '',
    surname: raw.surname ?? '',
    email: raw.email ?? '',
    image: raw.image ?? null,
    company: raw.company ?? null,
  };
  return _cachedHeaderProfile;
}

export interface AppGroupInfo {
  id: string;
  name: string;
  image: string | null;
  createdat: string;
  /** Resolved link: /objects/{id}/ if the dashboard exists, otherwise /gateway/apps/{firstAppId}?template=list_page */
  href: string;
}

let _cachedAppGroups: AppGroupInfo[] | null = null;

export async function getAppGroups(): Promise<AppGroupInfo[]> {
  if (_cachedAppGroups) return _cachedAppGroups;
  const raw = await callApi('GET', '/appgroups?with=apps');
  const groups: AppGroupInfo[] = Object.values(raw)
    .map((g: any) => {
      const firstAppId = Object.keys(g.apps ?? {})[0] ?? g.id;
      return {
        id: g.id,
        name: g.name,
        image: g.image ?? null,
        createdat: g.createdat ?? '',
        href: `/gateway/apps/${firstAppId}?template=list_page`,
        _firstAppId: firstAppId,
      };
    })
    .sort((a, b) => b.createdat.localeCompare(a.createdat));

  // Check which appgroups have a working dashboard at /objects/{id}/
  const checks = await Promise.allSettled(
    groups.map(g => fetch(`/objects/${g.id}/`, { method: 'HEAD', credentials: 'include' }))
  );
  checks.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.ok) {
      groups[i].href = `/objects/${groups[i].id}/`;
    }
  });

  // Clean up internal helper property
  groups.forEach(g => delete (g as any)._firstAppId);

  _cachedAppGroups = groups;
  return _cachedAppGroups;
}

export class LivingAppsService {
  // --- LEISTUNGSKATALOG_2 ---
  static async getLeistungskatalog2(): Promise<Leistungskatalog2[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG_2}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Leistungskatalog2[];
    return enrichLookupFields(records, 'leistungskatalog_2');
  }
  static async getLeistungskatalog2Entry(id: string): Promise<Leistungskatalog2 | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG_2}/records/${id}`);
    const record = { record_id: data.id, ...data } as Leistungskatalog2;
    return enrichLookupFields([record], 'leistungskatalog_2')[0];
  }
  static async createLeistungskatalog2Entry(fields: Leistungskatalog2['fields']) {
    return callApi('POST', `/apps/${APP_IDS.LEISTUNGSKATALOG_2}/records`, { fields });
  }
  static async updateLeistungskatalog2Entry(id: string, fields: Partial<Leistungskatalog2['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.LEISTUNGSKATALOG_2}/records/${id}`, { fields });
  }
  static async deleteLeistungskatalog2Entry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.LEISTUNGSKATALOG_2}/records/${id}`);
  }

  // --- LEISTUNGSKATALOG ---
  static async getLeistungskatalog(): Promise<Leistungskatalog[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Leistungskatalog[];
    return enrichLookupFields(records, 'leistungskatalog');
  }
  static async getLeistungskatalogEntry(id: string): Promise<Leistungskatalog | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records/${id}`);
    const record = { record_id: data.id, ...data } as Leistungskatalog;
    return enrichLookupFields([record], 'leistungskatalog')[0];
  }
  static async createLeistungskatalogEntry(fields: Leistungskatalog['fields']) {
    return callApi('POST', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records`, { fields });
  }
  static async updateLeistungskatalogEntry(id: string, fields: Partial<Leistungskatalog['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records/${id}`, { fields });
  }
  static async deleteLeistungskatalogEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records/${id}`);
  }

  // --- IMPRESSUM ---
  static async getImpressum(): Promise<Impressum[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.IMPRESSUM}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Impressum[];
    return enrichLookupFields(records, 'impressum');
  }
  static async getImpressumEntry(id: string): Promise<Impressum | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.IMPRESSUM}/records/${id}`);
    const record = { record_id: data.id, ...data } as Impressum;
    return enrichLookupFields([record], 'impressum')[0];
  }
  static async createImpressumEntry(fields: Impressum['fields']) {
    return callApi('POST', `/apps/${APP_IDS.IMPRESSUM}/records`, { fields });
  }
  static async updateImpressumEntry(id: string, fields: Partial<Impressum['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.IMPRESSUM}/records/${id}`, { fields });
  }
  static async deleteImpressumEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.IMPRESSUM}/records/${id}`);
  }

  // --- TERMINANFRAGE ---
  static async getTerminanfrage(): Promise<Terminanfrage[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.TERMINANFRAGE}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Terminanfrage[];
    return enrichLookupFields(records, 'terminanfrage');
  }
  static async getTerminanfrageEntry(id: string): Promise<Terminanfrage | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.TERMINANFRAGE}/records/${id}`);
    const record = { record_id: data.id, ...data } as Terminanfrage;
    return enrichLookupFields([record], 'terminanfrage')[0];
  }
  static async createTerminanfrageEntry(fields: Terminanfrage['fields']) {
    return callApi('POST', `/apps/${APP_IDS.TERMINANFRAGE}/records`, { fields });
  }
  static async updateTerminanfrageEntry(id: string, fields: Partial<Terminanfrage['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.TERMINANFRAGE}/records/${id}`, { fields });
  }
  static async deleteTerminanfrageEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.TERMINANFRAGE}/records/${id}`);
  }

  // --- KUNDENDATEN ---
  static async getKundendaten(): Promise<Kundendaten[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KUNDENDATEN}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Kundendaten[];
    return enrichLookupFields(records, 'kundendaten');
  }
  static async getKundendatenEntry(id: string): Promise<Kundendaten | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KUNDENDATEN}/records/${id}`);
    const record = { record_id: data.id, ...data } as Kundendaten;
    return enrichLookupFields([record], 'kundendaten')[0];
  }
  static async createKundendatenEntry(fields: Kundendaten['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KUNDENDATEN}/records`, { fields });
  }
  static async updateKundendatenEntry(id: string, fields: Partial<Kundendaten['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KUNDENDATEN}/records/${id}`, { fields });
  }
  static async deleteKundendatenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KUNDENDATEN}/records/${id}`);
  }

}