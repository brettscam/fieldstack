// FieldStack — Airtable Data Layer
// Configure these values to connect to your Airtable base

const CONFIG = {
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY || "",
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || "",
};

const BASE_URL = "https://api.airtable.com/v0";

function headers() {
  return {
    Authorization: `Bearer ${CONFIG.apiKey}`,
    "Content-Type": "application/json",
  };
}

function tableUrl(table, recordId) {
  const base = `${BASE_URL}/${CONFIG.baseId}/${encodeURIComponent(table)}`;
  return recordId ? `${base}/${recordId}` : base;
}

// Check if Airtable is configured
export function isConfigured() {
  return Boolean(CONFIG.apiKey && CONFIG.baseId);
}

// Generic CRUD operations
export async function listRecords(table, { sort, filterByFormula, maxRecords, view } = {}) {
  const params = new URLSearchParams();
  if (sort) sort.forEach((s, i) => {
    params.append(`sort[${i}][field]`, s.field);
    params.append(`sort[${i}][direction]`, s.direction || "asc");
  });
  if (filterByFormula) params.append("filterByFormula", filterByFormula);
  if (maxRecords) params.append("maxRecords", maxRecords);
  if (view) params.append("view", view);

  const url = `${tableUrl(table)}?${params.toString()}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Airtable error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.records.map(r => ({ id: r.id, ...r.fields }));
}

export async function getRecord(table, recordId) {
  const res = await fetch(tableUrl(table, recordId), { headers: headers() });
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
  const data = await res.json();
  return { id: data.id, ...data.fields };
}

export async function createRecord(table, fields) {
  const res = await fetch(tableUrl(table), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Airtable error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { id: data.id, ...data.fields };
}

export async function updateRecord(table, recordId, fields) {
  const res = await fetch(tableUrl(table, recordId), {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Airtable error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { id: data.id, ...data.fields };
}

export async function deleteRecord(table, recordId) {
  const res = await fetch(tableUrl(table, recordId), {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
  return true;
}

// Batch create (Airtable supports up to 10 at a time)
export async function batchCreate(table, recordsFields) {
  const results = [];
  for (let i = 0; i < recordsFields.length; i += 10) {
    const batch = recordsFields.slice(i, i + 10);
    const res = await fetch(tableUrl(table), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ records: batch.map(fields => ({ fields })) }),
    });
    if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
    const data = await res.json();
    results.push(...data.records.map(r => ({ id: r.id, ...r.fields })));
  }
  return results;
}

// Table name constants
export const TABLES = {
  CONTACTS: "Contacts",
  COMPANIES: "Companies",
  OPPORTUNITIES: "Opportunities",
  JOBS: "Jobs",
  SCHEDULE_PHASES: "Schedule Phases",
};
