const STORAGE_KEY = 'homebase_home_data';

const defaultData = {
  property: {
    address: '',
    city: '',
    state: '',
    zip: '',
    yearBuilt: '',
    sqft: '',
    lotSize: '',
    stories: '',
    bedrooms: '',
    bathrooms: '',
  },
  rooms: [],
  appliances: [],
  paint: [],
  systems: {
    hvac: { brand: '', model: '', type: '', installDate: '', filterSize: '', thermostat: '' },
    waterHeater: { brand: '', model: '', capacity: '', type: '', installDate: '' },
    electrical: { amperage: '', circuits: '', panelLocation: '' },
    plumbing: { mainShutoffLocation: '', mainShutoffInstructions: '' },
  },
  smartHome: {
    wifi: { networkName: '', password: '' },
    doorLocks: [],
    security: { provider: '', panelLocation: '' },
    garage: { brand: '', code: '' },
  },
  emergency: {
    waterShutoff: { location: '', instructions: '' },
    gasShutoff: { location: '', instructions: '' },
    electricalPanel: { location: '', instructions: '' },
    contacts: [],
  },
  exterior: {
    roof: { type: '', material: '', installDate: '' },
    gutters: { type: '', material: '' },
    siding: { material: '' },
  },
  landscape: {
    trees: [],
    irrigation: { controller: '', zones: '' },
  },
  documents: [],
  onboardingComplete: false,
  lastUpdated: null,
};

export function getHomeData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...structuredClone(defaultData) };
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle schema evolution
    return { ...structuredClone(defaultData), ...parsed };
  } catch {
    return { ...structuredClone(defaultData) };
  }
}

export function saveHomeData(data) {
  const updated = { ...data, lastUpdated: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function updateSection(section, value) {
  const data = getHomeData();
  data[section] = value;
  return saveHomeData(data);
}

export function clearHomeData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function calculateCompletion(data) {
  const sections = {
    property: () => {
      const fields = ['address', 'city', 'state', 'yearBuilt', 'sqft', 'bedrooms', 'bathrooms'];
      const filled = fields.filter(f => data.property[f]).length;
      return { completed: filled, total: fields.length };
    },
    rooms: () => {
      const total = Math.max(parseInt(data.property.bedrooms || 0) + 3, 4); // bedrooms + kitchen + living + bathroom(s)
      return { completed: data.rooms.length, total };
    },
    appliances: () => {
      const total = Math.max(data.appliances.length, 3);
      return { completed: data.appliances.length, total };
    },
    paint: () => {
      const total = Math.max(data.paint.length, 2);
      return { completed: data.paint.length, total };
    },
    systems: () => {
      const fields = [
        data.systems.hvac.brand,
        data.systems.waterHeater.brand,
        data.systems.electrical.amperage,
        data.systems.electrical.panelLocation,
      ];
      const filled = fields.filter(Boolean).length;
      return { completed: filled, total: 4 };
    },
    smartHome: () => {
      const fields = [data.smartHome.wifi.networkName, data.smartHome.wifi.password];
      const filled = fields.filter(Boolean).length;
      const lockCount = data.smartHome.doorLocks.length > 0 ? 1 : 0;
      return { completed: filled + lockCount, total: 3 };
    },
    emergency: () => {
      const shutoffs = [
        data.emergency.waterShutoff.location,
        data.emergency.gasShutoff.location,
        data.emergency.electricalPanel.location,
      ].filter(Boolean).length;
      const contacts = Math.min(data.emergency.contacts.length, 3);
      return { completed: shutoffs + contacts, total: 6 };
    },
  };

  const result = {};
  let totalCompleted = 0;
  let totalItems = 0;

  for (const [key, calc] of Object.entries(sections)) {
    const r = calc();
    r.percentage = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
    result[key] = r;
    totalCompleted += r.completed;
    totalItems += r.total;
  }

  result.overall = {
    completed: totalCompleted,
    total: totalItems,
    percentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
  };

  return result;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
