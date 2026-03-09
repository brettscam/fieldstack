import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Plus, X, ChevronRight, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, Clock, Calendar,
  Wrench, Home, Flame, Droplets, Zap, Wind, Thermometer,
  Shield, Loader2, Sparkles, Edit3, Trash2, ArrowRight,
  RotateCcw, DollarSign, AlertCircle, TrendingUp,
  Filter, SortAsc
} from 'lucide-react';
import { toast } from 'sonner';
import { getHomeData, saveHomeData, generateId } from '../lib/homeDataStore';

// ─── Component Categories & Lifespans ────────────────────────────────
const COMPONENT_CATEGORIES = [
  {
    id: 'roof',
    label: 'Roof',
    icon: Home,
    color: 'bg-slate-600',
    lifespanYears: { asphalt: 25, metal: 50, tile: 50, wood: 30, flat: 15 },
    defaultLifespan: 25,
  },
  {
    id: 'hvac',
    label: 'HVAC System',
    icon: Thermometer,
    color: 'bg-blue-600',
    lifespanYears: { central_ac: 15, furnace: 20, heat_pump: 15, boiler: 25, mini_split: 20 },
    defaultLifespan: 15,
  },
  {
    id: 'water_heater',
    label: 'Water Heater',
    icon: Droplets,
    color: 'bg-cyan-600',
    lifespanYears: { tank: 10, tankless: 20, hybrid: 13 },
    defaultLifespan: 10,
  },
  {
    id: 'electrical',
    label: 'Electrical Panel',
    icon: Zap,
    color: 'bg-yellow-600',
    lifespanYears: { standard: 40 },
    defaultLifespan: 40,
  },
  {
    id: 'plumbing',
    label: 'Plumbing / Sewer Lateral',
    icon: Droplets,
    color: 'bg-indigo-600',
    lifespanYears: { copper: 50, pvc: 40, galvanized: 30, cast_iron: 50, clay: 50 },
    defaultLifespan: 40,
  },
  {
    id: 'flooring',
    label: 'Flooring',
    icon: Home,
    color: 'bg-amber-700',
    lifespanYears: { hardwood: 75, laminate: 15, carpet: 10, tile: 50, vinyl: 20, engineered: 30 },
    defaultLifespan: 20,
  },
  {
    id: 'appliance',
    label: 'Appliance',
    icon: Wrench,
    color: 'bg-gray-600',
    lifespanYears: { refrigerator: 13, dishwasher: 10, washer: 11, dryer: 13, oven: 15, microwave: 9, garbage_disposal: 12 },
    defaultLifespan: 12,
  },
  {
    id: 'windows',
    label: 'Windows',
    icon: Home,
    color: 'bg-sky-600',
    lifespanYears: { wood: 30, vinyl: 25, aluminum: 20, fiberglass: 40 },
    defaultLifespan: 25,
  },
  {
    id: 'exterior',
    label: 'Siding / Exterior',
    icon: Shield,
    color: 'bg-green-700',
    lifespanYears: { vinyl: 40, wood: 20, fiber_cement: 50, stucco: 50, brick: 100 },
    defaultLifespan: 30,
  },
  {
    id: 'paint',
    label: 'Interior / Exterior Paint',
    icon: Edit3,
    color: 'bg-purple-600',
    lifespanYears: { interior: 7, exterior: 5 },
    defaultLifespan: 7,
  },
];

const STATUS_CONFIG = {
  good: { label: 'Good', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  aging: { label: 'Aging', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  due: { label: 'Replace Soon', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle },
  overdue: { label: 'Past Due', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle },
};

function getComponentStatus(installYear, lifespanYears) {
  if (!installYear || !lifespanYears) return 'good';
  const now = new Date().getFullYear();
  const age = now - parseInt(installYear);
  const remaining = lifespanYears - age;
  const pct = age / lifespanYears;

  if (remaining <= 0) return 'overdue';
  if (pct >= 0.85) return 'due';
  if (pct >= 0.65) return 'aging';
  return 'good';
}

function getYearsRemaining(installYear, lifespanYears) {
  if (!installYear || !lifespanYears) return null;
  const now = new Date().getFullYear();
  return lifespanYears - (now - parseInt(installYear));
}

function getLifespanPercent(installYear, lifespanYears) {
  if (!installYear || !lifespanYears) return 0;
  const now = new Date().getFullYear();
  const age = now - parseInt(installYear);
  return Math.min(100, Math.round((age / lifespanYears) * 100));
}

// ─── AI Project Suggestion ──────────────────────────────────────────
const AISuggestionBanner = ({ components, onAddSuggested }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const dueSoonCount = components.filter(c => {
    const status = getComponentStatus(c.installYear, c.lifespanYears);
    return status === 'due' || status === 'overdue';
  }).length;

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const homeData = getHomeData();
      const componentSummary = components.map(c => {
        const remaining = getYearsRemaining(c.installYear, c.lifespanYears);
        return `${c.name}: installed ${c.installYear}, ${remaining !== null ? remaining + ' years remaining' : 'unknown age'}, est. cost $${c.estimatedCost || '?'}`;
      }).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a home maintenance advisor. Based on these home components and their lifespans, suggest the top 3 priority projects the homeowner should plan for. Consider urgency, cost, and impact.

Home: ${homeData.property?.address || 'Unknown'}, built ${homeData.property?.yearBuilt || 'unknown'}
Components:
${componentSummary}

Return ONLY valid JSON array:
[
  { "title": "Project name", "reason": "Why this is priority", "timeframe": "When to do it", "estimatedCost": "$X,XXX - $X,XXX", "urgency": "high|medium|low" }
]`
      });

      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setSuggestions(JSON.parse(cleaned));
    } catch {
      toast.error('Could not generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (dismissed || components.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-5 mb-6 text-white"
    >
      {!suggestions ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Project Planner</h3>
              <p className="text-purple-200 text-xs">
                {dueSoonCount > 0
                  ? `${dueSoonCount} component${dueSoonCount > 1 ? 's' : ''} need${dueSoonCount === 1 ? 's' : ''} attention soon`
                  : 'Get personalized project priorities based on your home'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateSuggestions}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Suggestions'}
            </button>
            <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white/80">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Recommended Projects
            </h3>
            <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white/80">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        s.urgency === 'high' ? 'bg-red-500/30' : s.urgency === 'medium' ? 'bg-yellow-500/30' : 'bg-green-500/30'
                      }`}>{s.urgency}</span>
                      <span className="font-medium text-sm">{s.title}</span>
                    </div>
                    <p className="text-purple-200 text-xs mt-1">{s.reason}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-purple-300">
                      <span><Calendar className="w-3 h-3 inline mr-1" />{s.timeframe}</span>
                      <span><DollarSign className="w-3 h-3 inline mr-1" />{s.estimatedCost}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Add / Edit Component Modal ─────────────────────────────────────
const ComponentModal = ({ component, onSave, onClose }) => {
  const isEdit = !!component?.id;
  const [form, setForm] = useState({
    name: '',
    category: '',
    subtype: '',
    installYear: '',
    lifespanYears: '',
    brand: '',
    model: '',
    estimatedCost: '',
    notes: '',
    location: '',
    warrantyExpiry: '',
    lastServiceDate: '',
    ...component,
  });

  const category = COMPONENT_CATEGORIES.find(c => c.id === form.category);
  const subtypes = category ? Object.keys(category.lifespanYears) : [];

  const handleCategoryChange = (catId) => {
    const cat = COMPONENT_CATEGORIES.find(c => c.id === catId);
    setForm(prev => ({
      ...prev,
      category: catId,
      subtype: '',
      lifespanYears: cat?.defaultLifespan || '',
      name: prev.name || cat?.label || '',
    }));
  };

  const handleSubtypeChange = (subtype) => {
    const lifespan = category?.lifespanYears[subtype] || category?.defaultLifespan || '';
    setForm(prev => ({ ...prev, subtype, lifespanYears: lifespan }));
  };

  const handleSave = () => {
    if (!form.name || !form.category) {
      toast.error('Name and category are required');
      return;
    }
    onSave({
      ...form,
      id: form.id || generateId(),
      lifespanYears: parseInt(form.lifespanYears) || category?.defaultLifespan || 20,
      estimatedCost: form.estimatedCost,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Component' : 'Track a Component'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {COMPONENT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all ${
                      form.category === cat.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-100 hover:border-gray-200 text-gray-700'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtype */}
            {subtypes.length > 1 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {subtypes.map(st => (
                    <button
                      key={st}
                      onClick={() => handleSubtypeChange(st)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        form.subtype === st
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                      <span className="text-xs text-gray-400 ml-1">({category.lifespanYears[st]}yr)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Kitchen Refrigerator, Main HVAC"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Install Year + Lifespan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Year Installed</label>
                <input
                  type="number"
                  value={form.installYear}
                  onChange={e => setForm(prev => ({ ...prev, installYear: e.target.value }))}
                  placeholder="2015"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Expected Lifespan</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.lifespanYears}
                    onChange={e => setForm(prev => ({ ...prev, lifespanYears: e.target.value }))}
                    placeholder="25"
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">years</span>
                </div>
              </div>
            </div>

            {/* Brand + Model */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => setForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="e.g. Carrier, GAF"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={e => setForm(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Model #"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Kitchen, Garage, Basement"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Estimated Replacement Cost */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Est. Replacement Cost</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.estimatedCost}
                  onChange={e => setForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  placeholder="5,000"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Warranty + Last Service */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Warranty Expires</label>
                <input
                  type="text"
                  value={form.warrantyExpiry}
                  onChange={e => setForm(prev => ({ ...prev, warrantyExpiry: e.target.value }))}
                  placeholder="2028"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Last Serviced</label>
                <input
                  type="text"
                  value={form.lastServiceDate}
                  onChange={e => setForm(prev => ({ ...prev, lastServiceDate: e.target.value }))}
                  placeholder="2024"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any details — last repair, known issues, contractor info..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
              {isEdit ? 'Update' : 'Add Component'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Component Card ─────────────────────────────────────────────────
const ComponentCard = ({ component, onEdit, onDelete }) => {
  const category = COMPONENT_CATEGORIES.find(c => c.id === component.category);
  const Icon = category?.icon || Wrench;
  const status = getComponentStatus(component.installYear, component.lifespanYears);
  const remaining = getYearsRemaining(component.installYear, component.lifespanYears);
  const pct = getLifespanPercent(component.installYear, component.lifespanYears);
  const statusConf = STATUS_CONFIG[status];
  const StatusIcon = statusConf.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border ${statusConf.border} overflow-hidden hover:shadow-md transition-shadow`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${category?.color || 'bg-gray-600'} rounded-xl flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{component.name}</h3>
              <p className="text-xs text-gray-500">
                {component.brand && `${component.brand} `}
                {component.model && `${component.model} · `}
                {component.location && `${component.location}`}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.color}`}>
            <StatusIcon className="w-3 h-3" />
            {statusConf.label}
          </div>
        </div>

        {/* Lifespan Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">
              {component.installYear ? `Installed ${component.installYear}` : 'Install date unknown'}
            </span>
            <span className={`font-medium ${statusConf.color}`}>
              {remaining !== null
                ? remaining > 0 ? `~${remaining} years left` : `${Math.abs(remaining)} years overdue`
                : ''}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                status === 'overdue' ? 'bg-red-500' :
                status === 'due' ? 'bg-orange-500' :
                status === 'aging' ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
            <span>New</span>
            <span>{component.lifespanYears}yr lifespan</span>
          </div>
        </div>

        {/* Details Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {component.estimatedCost && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {component.estimatedCost}
              </span>
            )}
            {component.warrantyExpiry && (
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Warranty {parseInt(component.warrantyExpiry) >= new Date().getFullYear() ? 'active' : 'expired'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(component)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(component.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Timeline View ──────────────────────────────────────────────────
const TimelineView = ({ components }) => {
  const currentYear = new Date().getFullYear();
  const events = components
    .filter(c => c.installYear && c.lifespanYears)
    .map(c => ({
      ...c,
      expiryYear: parseInt(c.installYear) + parseInt(c.lifespanYears),
      remaining: getYearsRemaining(c.installYear, c.lifespanYears),
    }))
    .sort((a, b) => a.expiryYear - b.expiryYear);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Add components with install dates to see the timeline</p>
      </div>
    );
  }

  // Group by year
  const byYear = {};
  events.forEach(e => {
    const y = e.expiryYear;
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(e);
  });

  return (
    <div className="space-y-1">
      {Object.entries(byYear).map(([year, items]) => {
        const isPast = parseInt(year) < currentYear;
        const isCurrent = parseInt(year) === currentYear;
        return (
          <div key={year} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isPast ? 'bg-red-100 text-red-600' :
                isCurrent ? 'bg-orange-100 text-orange-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                {parseInt(year) - currentYear <= 0 ? '!' : `+${parseInt(year) - currentYear}`}
              </div>
              <div className="w-px flex-1 bg-gray-200" />
            </div>
            <div className="flex-1 pb-4">
              <p className={`text-sm font-semibold mb-2 ${isPast ? 'text-red-600' : isCurrent ? 'text-orange-600' : 'text-gray-700'}`}>
                {year} {isPast ? '(overdue)' : isCurrent ? '(this year!)' : ''}
              </p>
              <div className="space-y-2">
                {items.map(item => {
                  const cat = COMPONENT_CATEGORIES.find(c => c.id === item.category);
                  const CatIcon = cat?.icon || Wrench;
                  return (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isPast ? 'bg-red-50 border-red-200' : isCurrent ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'
                    }`}>
                      <div className={`w-8 h-8 ${cat?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                        <CatIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Installed {item.installYear} · {item.lifespanYears}yr lifespan</p>
                      </div>
                      {item.estimatedCost && (
                        <span className="text-xs font-medium text-gray-500">${item.estimatedCost}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Summary Stats ──────────────────────────────────────────────────
const SummaryStats = ({ components }) => {
  const stats = {
    total: components.length,
    good: components.filter(c => getComponentStatus(c.installYear, c.lifespanYears) === 'good').length,
    aging: components.filter(c => getComponentStatus(c.installYear, c.lifespanYears) === 'aging').length,
    due: components.filter(c => ['due', 'overdue'].includes(getComponentStatus(c.installYear, c.lifespanYears))).length,
    totalCost: components
      .filter(c => c.estimatedCost && ['due', 'overdue'].includes(getComponentStatus(c.installYear, c.lifespanYears)))
      .reduce((sum, c) => sum + (parseInt(String(c.estimatedCost).replace(/[^0-9]/g, '')) || 0), 0),
  };

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Tracked', value: stats.total, icon: Wrench, color: 'bg-blue-50 text-blue-600' },
        { label: 'Good', value: stats.good, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
        { label: 'Aging', value: stats.aging, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { label: 'Replace Soon', value: stats.due, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-light text-gray-900">{value}</p>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Import from Home Data ──────────────────────────────────────────
const ImportFromHomeData = ({ onImport, existingComponents }) => {
  const [loading, setLoading] = useState(false);
  const homeData = getHomeData();

  const canImport = homeData.onboardingComplete || homeData.systems?.hvac?.brand || homeData.appliances?.length > 0;

  if (!canImport || existingComponents.length > 0) return null;

  const doImport = async () => {
    setLoading(true);
    try {
      const imported = [];

      // Import from systems
      if (homeData.systems?.hvac?.brand || homeData.systems?.hvac?.type) {
        imported.push({
          id: generateId(),
          name: `${homeData.systems.hvac.brand || ''} HVAC`.trim(),
          category: 'hvac',
          subtype: homeData.systems.hvac.type || '',
          brand: homeData.systems.hvac.brand || '',
          model: homeData.systems.hvac.model || '',
          installYear: homeData.systems.hvac.installDate?.slice(0, 4) || '',
          lifespanYears: 15,
          location: '',
          notes: '',
          estimatedCost: '',
        });
      }
      if (homeData.systems?.waterHeater?.brand || homeData.systems?.waterHeater?.type) {
        imported.push({
          id: generateId(),
          name: `${homeData.systems.waterHeater.brand || ''} Water Heater`.trim(),
          category: 'water_heater',
          subtype: homeData.systems.waterHeater.type || '',
          brand: homeData.systems.waterHeater.brand || '',
          model: homeData.systems.waterHeater.model || '',
          installYear: homeData.systems.waterHeater.installDate?.slice(0, 4) || '',
          lifespanYears: homeData.systems.waterHeater.type === 'tankless' ? 20 : 10,
          location: '',
          notes: homeData.systems.waterHeater.capacity ? `${homeData.systems.waterHeater.capacity} capacity` : '',
          estimatedCost: '',
        });
      }
      if (homeData.systems?.electrical?.amperage) {
        imported.push({
          id: generateId(),
          name: `${homeData.systems.electrical.amperage}A Electrical Panel`,
          category: 'electrical',
          brand: '',
          model: '',
          installYear: homeData.property?.yearBuilt || '',
          lifespanYears: 40,
          location: homeData.systems.electrical.panelLocation || '',
          notes: homeData.systems.electrical.circuits ? `${homeData.systems.electrical.circuits} circuits` : '',
          estimatedCost: '',
        });
      }
      if (homeData.exterior?.roof?.material) {
        const roofType = homeData.exterior.roof.material?.toLowerCase().includes('asphalt') ? 'asphalt' :
          homeData.exterior.roof.material?.toLowerCase().includes('metal') ? 'metal' :
          homeData.exterior.roof.material?.toLowerCase().includes('tile') ? 'tile' : 'asphalt';
        const cat = COMPONENT_CATEGORIES.find(c => c.id === 'roof');
        imported.push({
          id: generateId(),
          name: `${homeData.exterior.roof.material} Roof`,
          category: 'roof',
          subtype: roofType,
          brand: '',
          model: '',
          installYear: homeData.exterior.roof.installDate?.slice(0, 4) || '',
          lifespanYears: cat.lifespanYears[roofType] || 25,
          location: '',
          notes: homeData.exterior.roof.type || '',
          estimatedCost: '',
        });
      }

      // Import appliances
      (homeData.appliances || []).forEach(app => {
        imported.push({
          id: generateId(),
          name: `${app.brand || ''} ${app.type || 'Appliance'}`.trim(),
          category: 'appliance',
          subtype: app.type?.toLowerCase().replace(/\s/g, '_') || '',
          brand: app.brand || '',
          model: app.model || '',
          installYear: app.installDate?.slice(0, 4) || '',
          lifespanYears: COMPONENT_CATEGORIES.find(c => c.id === 'appliance')
            ?.lifespanYears[app.type?.toLowerCase().replace(/\s/g, '_')] || 12,
          location: app.room || '',
          notes: app.notes || '',
          estimatedCost: '',
        });
      });

      if (imported.length > 0) {
        onImport(imported);
        toast.success(`Imported ${imported.length} components from your home profile`);
      } else {
        toast.info('No components found to import. Add them manually.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">Import from Home Profile</h3>
            <p className="text-xs text-blue-600">Auto-populate from your onboarding data</p>
          </div>
        </div>
        <button
          onClick={doImport}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
        </button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  MAIN PROJECTS PAGE
// ═══════════════════════════════════════════════════════════════════════
export default function Projects() {
  const [components, setComponents] = useState([]);
  const [view, setView] = useState('cards'); // cards | timeline
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  // Load from localStorage (seed sample data if empty)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('homebase_components');
      if (raw) {
        setComponents(JSON.parse(raw));
      } else {
        const sampleData = [
          {
            id: 'sample-1',
            name: 'GAF Timberline Roof',
            category: 'roof',
            subtype: 'asphalt',
            brand: 'GAF',
            model: 'Timberline HDZ',
            installYear: '2018',
            lifespanYears: 25,
            location: 'Whole House',
            warrantyExpiry: '2043',
            lastServiceDate: '2024',
            estimatedCost: '18,000',
            notes: 'Full tear-off and replacement. 25-year manufacturer warranty. Contractor: Bay Roofing Co.',
          },
          {
            id: 'sample-2',
            name: 'Carrier HVAC System',
            category: 'hvac',
            subtype: 'central_ac',
            brand: 'Carrier',
            model: '24ACC636A003',
            installYear: '2014',
            lifespanYears: 15,
            location: 'Utility Closet / Garage',
            warrantyExpiry: '2024',
            lastServiceDate: '2025',
            estimatedCost: '9,500',
            notes: 'Filter size 20x25x1". Service annually in spring. Warranty expired — consider replacement planning.',
          },
          {
            id: 'sample-3',
            name: 'Rheem Water Heater',
            category: 'water_heater',
            subtype: 'tank',
            brand: 'Rheem',
            model: 'Performance Platinum XE50T12EH45U0',
            installYear: '2023',
            lifespanYears: 10,
            location: 'Garage',
            warrantyExpiry: '2033',
            lastServiceDate: '2023',
            estimatedCost: '1,800',
            notes: '50-gallon tank. 10-year warranty on tank, 1-year on parts. Serial: A492194.',
          },
          {
            id: 'sample-4',
            name: '200A Electrical Panel',
            category: 'electrical',
            subtype: 'standard',
            brand: 'Square D',
            model: 'QO130L200PG',
            installYear: '2015',
            lifespanYears: 40,
            location: 'Garage',
            warrantyExpiry: '2025',
            lastServiceDate: '2022',
            estimatedCost: '4,500',
            notes: 'Upgraded from 100A in 2015. 16 circuits. Permit #2015-0621.',
          },
          {
            id: 'sample-5',
            name: 'Sub-Zero Refrigerator',
            category: 'appliance',
            subtype: 'refrigerator',
            brand: 'Sub-Zero',
            model: 'BI-42UFD/S/TH',
            installYear: '2021',
            lifespanYears: 20,
            location: 'Kitchen',
            warrantyExpiry: '2026',
            lastServiceDate: '2024',
            estimatedCost: '12,000',
            notes: 'Built-in integrated. 5-year full warranty. Replace water filter every 12 months (Part #7007067).',
          },
          {
            id: 'sample-6',
            name: 'Wolf Dual Fuel Range',
            category: 'appliance',
            subtype: 'oven',
            brand: 'Wolf',
            model: 'DF366',
            installYear: '2022',
            lifespanYears: 15,
            location: 'Kitchen',
            warrantyExpiry: '2027',
            lastServiceDate: '',
            estimatedCost: '8,500',
            notes: '36" dual fuel, 6 burners. 5-year warranty. Gas + electric.',
          },
          {
            id: 'sample-7',
            name: 'Milgard Windows',
            category: 'windows',
            subtype: 'vinyl',
            brand: 'Milgard',
            model: 'Tuscany Series',
            installYear: '2019',
            lifespanYears: 25,
            location: 'Whole House',
            warrantyExpiry: '',
            lastServiceDate: '',
            estimatedCost: '22,000',
            notes: 'Full house window replacement during kitchen remodel. Casement + double-hung styles. Lifetime limited warranty.',
          },
          {
            id: 'sample-8',
            name: 'Interior Paint',
            category: 'paint',
            subtype: 'interior',
            brand: 'Benjamin Moore',
            model: 'Chantilly Lace OC-65',
            installYear: '2021',
            lifespanYears: 7,
            location: 'Whole House',
            warrantyExpiry: '',
            lastServiceDate: '',
            estimatedCost: '6,500',
            notes: 'Full interior repaint during kitchen remodel. Touch-up paint stored in garage.',
          },
        ];
        setComponents(sampleData);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('homebase_components', JSON.stringify(components));
  }, [components]);

  const handleSave = (component) => {
    setComponents(prev => {
      const exists = prev.find(c => c.id === component.id);
      if (exists) {
        return prev.map(c => c.id === component.id ? component : c);
      }
      return [...prev, component];
    });
    setShowModal(false);
    setEditingComponent(null);
    toast.success(editingComponent ? 'Component updated' : 'Component added');
  };

  const handleDelete = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    toast.success('Component removed');
  };

  const handleEdit = (component) => {
    setEditingComponent(component);
    setShowModal(true);
  };

  const handleImport = (imported) => {
    setComponents(prev => [...prev, ...imported]);
  };

  // Filter + Sort
  const filtered = components.filter(c => {
    if (filterStatus === 'all') return true;
    return getComponentStatus(c.installYear, c.lifespanYears) === filterStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'urgency') {
      const order = { overdue: 0, due: 1, aging: 2, good: 3 };
      return (order[getComponentStatus(a.installYear, a.lifespanYears)] || 3) -
        (order[getComponentStatus(b.installYear, b.lifespanYears)] || 3);
    }
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'cost') {
      const costA = parseInt(String(a.estimatedCost).replace(/[^0-9]/g, '')) || 0;
      const costB = parseInt(String(b.estimatedCost).replace(/[^0-9]/g, '')) || 0;
      return costB - costA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-2">Projects</h1>
          <p className="text-gray-500">Track component lifespans, plan replacements, and stay ahead of maintenance.</p>
        </motion.div>

        {/* Import from Home Data */}
        <ImportFromHomeData onImport={handleImport} existingComponents={components} />

        {/* AI Suggestions */}
        <AISuggestionBanner components={components} />

        {/* Summary Stats */}
        {components.length > 0 && <SummaryStats components={components} />}

        {/* View Toggle + Filters */}
        {components.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-gray-100 rounded-xl p-0.5">
                <button
                  onClick={() => setView('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    view === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setView('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    view === 'timeline' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Timeline
                </button>
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 outline-none"
              >
                <option value="all">All Status</option>
                <option value="good">Good</option>
                <option value="aging">Aging</option>
                <option value="due">Replace Soon</option>
                <option value="overdue">Past Due</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 outline-none"
              >
                <option value="urgency">By Urgency</option>
                <option value="name">By Name</option>
                <option value="cost">By Cost</option>
              </select>
            </div>

            <button
              onClick={() => { setEditingComponent(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Component
            </button>
          </div>
        )}

        {/* Content */}
        {components.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Track Your Home's Components</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Add your roof, HVAC, appliances, water heater, and more. We'll track their lifespans and tell you when to plan replacements.
            </p>
            <button
              onClick={() => { setEditingComponent(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" /> Add Your First Component
            </button>
          </motion.div>
        ) : view === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map(c => (
              <ComponentCard key={c.id} component={c} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <TimelineView components={sorted} />
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <ComponentModal
              component={editingComponent}
              onSave={handleSave}
              onClose={() => { setShowModal(false); setEditingComponent(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}