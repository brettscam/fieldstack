import { useState, useEffect, useCallback } from "react";
import { supabase, isConfigured, TABLES } from "./supabase";
import { MOCK_DATA } from "./mockData";

// ============================================
// Field mapping: Supabase snake_case <-> App camelCase
// ============================================
const FIELD_MAP = {
  [TABLES.CONTACTS]: {
    toApp: { name: "Name", email: "Email", phone: "Phone", company: "Company", role: "Role", notes: "Notes" },
    toDb: { Name: "name", Email: "email", Phone: "phone", Company: "company", Role: "role", Notes: "notes" },
  },
  [TABLES.COMPANIES]: {
    toApp: { name: "Name", industry: "Industry", address: "Address", phone: "Phone", website: "Website" },
    toDb: { Name: "name", Industry: "industry", Address: "address", Phone: "phone", Website: "website" },
  },
  [TABLES.OPPORTUNITIES]: {
    toApp: { name: "Name", company: "Company", contact: "Contact", value: "Value", stage: "Stage", created_date: "CreatedDate", expected_close: "ExpectedClose", notes: "Notes" },
    toDb: { Name: "name", Company: "company", Contact: "contact", Value: "value", Stage: "stage", CreatedDate: "created_date", ExpectedClose: "expected_close", Notes: "notes" },
  },
  [TABLES.JOBS]: {
    toApp: { job_id: "JobId", name: "Name", site: "Site", crew: "Crew", phase: "Phase", progress: "Progress", status: "Status", value: "Value", company: "Company", contact: "Contact", start_date: "StartDate", end_date: "EndDate", opportunity_id: "OpportunityId" },
    toDb: { JobId: "job_id", Name: "name", Site: "site", Crew: "crew", Phase: "phase", Progress: "progress", Status: "status", Value: "value", Company: "company", Contact: "contact", StartDate: "start_date", EndDate: "end_date", OpportunityId: "opportunity_id" },
  },
  [TABLES.SCHEDULE_PHASES]: {
    toApp: { job_id: "JobId", phase_name: "PhaseName", start_date: "StartDate", end_date: "EndDate", duration: "Duration", sort_order: "Order", status: "Status" },
    toDb: { JobId: "job_id", PhaseName: "phase_name", StartDate: "start_date", EndDate: "end_date", Duration: "duration", Order: "sort_order", Status: "status" },
  },
};

// Map table name to mock data key
const MOCK_KEY = {
  [TABLES.CONTACTS]: "Contacts",
  [TABLES.COMPANIES]: "Companies",
  [TABLES.OPPORTUNITIES]: "Opportunities",
  [TABLES.JOBS]: "Jobs",
  [TABLES.SCHEDULE_PHASES]: "Schedule Phases",
};

function mapToApp(table, row) {
  const map = FIELD_MAP[table]?.toApp;
  if (!map) return { id: row.id, ...row };
  const result = { id: row.id };
  for (const [dbKey, appKey] of Object.entries(map)) {
    if (row[dbKey] !== undefined) result[appKey] = row[dbKey];
  }
  return result;
}

function mapToDb(table, fields) {
  const map = FIELD_MAP[table]?.toDb;
  if (!map) return fields;
  const result = {};
  for (const [appKey, dbKey] of Object.entries(map)) {
    if (fields[appKey] !== undefined) result[dbKey] = fields[appKey];
  }
  return result;
}

// ============================================
// Generic hooks
// ============================================

export function useRecords(table, options = {}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const live = isConfigured();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (live) {
        let query = supabase.from(table).select("*");
        if (options.orderBy) query = query.order(options.orderBy, { ascending: options.ascending !== false });
        if (options.filter) {
          for (const [col, val] of Object.entries(options.filter)) {
            query = query.eq(col, val);
          }
        }
        const { data, error: err } = await query;
        if (err) throw err;
        setRecords((data || []).map(row => mapToApp(table, row)));
      } else {
        setRecords(MOCK_DATA[MOCK_KEY[table]] || []);
      }
    } catch (err) {
      setError(err.message || String(err));
      setRecords(MOCK_DATA[MOCK_KEY[table]] || []);
    }
    setLoading(false);
  }, [table, live]);

  useEffect(() => { refresh(); }, [refresh]);

  return { records, loading, error, refresh, setRecords };
}

export function useRecord(table, recordId) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const live = isConfigured();

  useEffect(() => {
    if (!recordId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        if (live) {
          const { data, error } = await supabase.from(table).select("*").eq("id", recordId).single();
          if (error) throw error;
          setRecord(mapToApp(table, data));
        } else {
          const all = MOCK_DATA[MOCK_KEY[table]] || [];
          setRecord(all.find(r => r.id === recordId) || null);
        }
      } catch {
        const all = MOCK_DATA[MOCK_KEY[table]] || [];
        setRecord(all.find(r => r.id === recordId) || null);
      }
      setLoading(false);
    })();
  }, [table, recordId, live]);

  return { record, loading, setRecord };
}

export function useMutation(table) {
  const [saving, setSaving] = useState(false);
  const live = isConfigured();

  const create = useCallback(async (fields) => {
    setSaving(true);
    try {
      if (live) {
        const dbFields = mapToDb(table, fields);
        const { data, error } = await supabase.from(table).insert(dbFields).select().single();
        if (error) throw error;
        setSaving(false);
        return mapToApp(table, data);
      }
      const mock = { id: "rec" + Math.random().toString(36).slice(2, 10), ...fields };
      const key = MOCK_KEY[table];
      MOCK_DATA[key] = [...(MOCK_DATA[key] || []), mock];
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
        const dbFields = mapToDb(table, fields);
        const { data, error } = await supabase.from(table).update(dbFields).eq("id", recordId).select().single();
        if (error) throw error;
        setSaving(false);
        return mapToApp(table, data);
      }
      const key = MOCK_KEY[table];
      const arr = MOCK_DATA[key] || [];
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
        const { error } = await supabase.from(table).delete().eq("id", recordId);
        if (error) throw error;
      }
      const key = MOCK_KEY[table];
      MOCK_DATA[key] = (MOCK_DATA[key] || []).filter(r => r.id !== recordId);
      setSaving(false);
    } catch (err) {
      setSaving(false);
      throw err;
    }
  }, [table, live]);

  return { create, update, remove, saving };
}

// ============================================
// Convenience hooks per table
// ============================================

export function useContacts() { return useRecords(TABLES.CONTACTS); }
export function useCompanies() { return useRecords(TABLES.COMPANIES); }
export function useOpportunities() { return useRecords(TABLES.OPPORTUNITIES); }
export function useJobs() { return useRecords(TABLES.JOBS); }
export function useSchedulePhases(jobId) {
  const result = useRecords(TABLES.SCHEDULE_PHASES);
  if (jobId) {
    return { ...result, records: result.records.filter(r => r.JobId === jobId) };
  }
  return result;
}

// Mock-only hooks for new data
export function useTeamMembers(jobId) {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    const all = MOCK_DATA["Team Members"] || [];
    setRecords(jobId ? all.filter(r => r.JobId === jobId) : all);
  }, [jobId]);
  return { records, setRecords };
}

export function useEstimates(oppId) {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    const all = MOCK_DATA["Estimates"] || [];
    setRecords(oppId ? all.filter(r => r.OpportunityId === oppId) : all);
  }, [oppId]);
  return { records };
}

export function useSalesTargets() {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    setRecords(MOCK_DATA["Sales Targets"] || []);
  }, []);
  return { records };
}

export function useAllTeamMembers() {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    setRecords(MOCK_DATA["Team Members"] || []);
  }, []);
  return { records };
}

export function useMilestones(jobId) {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    const all = MOCK_DATA["Milestones"] || [];
    setRecords(jobId ? all.filter(r => r.JobId === jobId) : all);
  }, [jobId]);
  return { records };
}

// ============================================
// Auth hooks
// ============================================

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured()) {
      setUser({ id: "mock", email: "smithers@fieldstack.app", name: "Smithers" });
      setLoading(false);
      return;
    }

    let subscription;
    let timeout;

    // Timeout fallback: if Supabase doesn't respond in 5s, fall back to mock mode
    timeout = setTimeout(() => {
      setUser({ id: "mock", email: "demo@fieldstack.app", name: "Demo User" });
      setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setUser(session?.user || null);
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      // Supabase unreachable or bad credentials — fall back to login screen
      setUser(null);
      setLoading(false);
    });

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      subscription = data?.subscription;
    } catch {
      // Ignore auth listener failures
    }

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signIn, signUp, signOut };
}
