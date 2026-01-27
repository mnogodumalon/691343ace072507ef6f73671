// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Kundendaten, Leistungskatalog, Leistungskatalog2, Impressum, Terminanfrage } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
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

export class LivingAppsService {
  // --- KUNDENDATEN ---
  static async getKundendaten(): Promise<Kundendaten[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KUNDENDATEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getKundendatenEntry(id: string): Promise<Kundendaten | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KUNDENDATEN}/records/${id}`);
    return { record_id: data.id, ...data };
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

  // --- LEISTUNGSKATALOG ---
  static async getLeistungskatalog(): Promise<Leistungskatalog[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getLeistungskatalogEntry(id: string): Promise<Leistungskatalog | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records/${id}`);
    return { record_id: data.id, ...data };
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

  // --- LEISTUNGSKATALOG_2 ---
  static async getLeistungskatalog2(): Promise<Leistungskatalog2[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG_2}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getLeistungskatalog2Entry(id: string): Promise<Leistungskatalog2 | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG_2}/records/${id}`);
    return { record_id: data.id, ...data };
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

  // --- IMPRESSUM ---
  static async getImpressum(): Promise<Impressum[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.IMPRESSUM}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getImpressumEntry(id: string): Promise<Impressum | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.IMPRESSUM}/records/${id}`);
    return { record_id: data.id, ...data };
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
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getTerminanfrageEntry(id: string): Promise<Terminanfrage | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.TERMINANFRAGE}/records/${id}`);
    return { record_id: data.id, ...data };
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

}