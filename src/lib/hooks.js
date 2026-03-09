import { useState, useEffect, useCallback } from "react";
import * as airtable from "./airtable";
import { MOCK_DATA } from "./mockData";

// Determine if we're using live Airtable or mock data
function useLive() {
  return airtable.isConfigured();
}

// Generic hook for fetching a list from Airtable (or mock data)
export function useRecords(table, options = {}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const live = useLive();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (live) {
        const data = await airtable.listRecords(table, options);
        setRecords(data);
      } else {
        // Use mock data
        setRecords(MOCK_DATA[table] || []);
      }
    } catch (err) {
      setError(err.message);
      // Fallback to mock on error
      setRecords(MOCK_DATA[table] || []);
    }
    setLoading(false);
  }, [table, live]);

  useEffect(() => { refresh(); }, [refresh]);

  return { records, loading, error, refresh, setRecords };
}

// Hook for a single record
export function useRecord(table, recordId) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const live = useLive();

  useEffect(() => {
    if (!recordId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        if (live) {
          const data = await airtable.getRecord(table, recordId);
          setRecord(data);
        } else {
          const all = MOCK_DATA[table] || [];
          setRecord(all.find(r => r.id === recordId) || null);
        }
      } catch {
        const all = MOCK_DATA[table] || [];
        setRecord(all.find(r => r.id === recordId) || null);
      }
      setLoading(false);
    })();
  }, [table, recordId, live]);

  return { record, loading, setRecord };
}

// Mutation helpers
export function useMutation(table) {
  const [saving, setSaving] = useState(false);
  const live = useLive();

  const create = useCallback(async (fields) => {
    setSaving(true);
    try {
      if (live) {
        const result = await airtable.createRecord(table, fields);
        setSaving(false);
        return result;
      }
      // Mock: generate a fake record
      const mock = { id: "rec" + Math.random().toString(36).slice(2, 10), ...fields };
      MOCK_DATA[table] = [...(MOCK_DATA[table] || []), mock];
      setSaving(false);
      return mock;
    } catch (err) {
      setSaving(false);
      throw err;
    }
  }, [table, live]);

  const update = useCallback(async (recordId, fields) => {
    setSaving(true);
    try {
      if (live) {
        const result = await airtable.updateRecord(table, recordId, fields);
        setSaving(false);
        return result;
      }
      // Mock: update in place
      const arr = MOCK_DATA[table] || [];
      const idx = arr.findIndex(r => r.id === recordId);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...fields };
      setSaving(false);
      return arr[idx];
    } catch (err) {
      setSaving(false);
      throw err;
    }
  }, [table, live]);

  const remove = useCallback(async (recordId) => {
    setSaving(true);
    try {
      if (live) {
        await airtable.deleteRecord(table, recordId);
      }
      MOCK_DATA[table] = (MOCK_DATA[table] || []).filter(r => r.id !== recordId);
      setSaving(false);
    } catch (err) {
      setSaving(false);
      throw err;
    }
  }, [table, live]);

  return { create, update, remove, saving };
}

// Convenience hooks per table
export function useContacts() { return useRecords(airtable.TABLES.CONTACTS); }
export function useCompanies() { return useRecords(airtable.TABLES.COMPANIES); }
export function useOpportunities() { return useRecords(airtable.TABLES.OPPORTUNITIES); }
export function useJobs() { return useRecords(airtable.TABLES.JOBS); }
export function useSchedulePhases(jobId) {
  const result = useRecords(airtable.TABLES.SCHEDULE_PHASES);
  if (jobId) {
    return { ...result, records: result.records.filter(r => r.JobId === jobId) };
  }
  return result;
}
