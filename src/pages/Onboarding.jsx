import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import {
  Home, ChevronRight, ChevronLeft, Check, Plus, X, Trash2,
  Building2, Layers, Search, MapPin,
  Refrigerator, Zap, Droplets, Flame, Wind,
  AlertTriangle, Shield,
  FileText, Upload, Sparkles, Loader2, ArrowRight,
  CheckCircle2, Lightbulb, Eye, Edit3, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, Clock,
  BedDouble, Bath
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getHomeData, saveHomeData, generateId, calculateCompletion
} from '../lib/homeDataStore';

// ─── Step Progress Bar ───────────────────────────────────────────────
const StepProgress = ({ currentStep, totalSteps, steps }) => (
  <div className="flex items-center gap-1 w-full max-w-2xl mx-auto px-4">
    {steps.map((step, i) => (
      <div key={i} className="flex-1 flex items-center gap-1">
        <div className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
          i < currentStep ? 'bg-blue-600' : i === currentStep ? 'bg-blue-400' : 'bg-gray-200'
        }`} />
      </div>
    ))}
  </div>
);

// ─── Reusable Form Field ─────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = 'text', suffix, className = '', disabled = false, verified }) => (
  <div className={className}>
    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 tracking-wide uppercase mb-1.5">
      {label}
      {verified && <CheckCircle2 className="w-3 h-3 text-green-500" />}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 transition-all ${
          suffix ? 'pr-12' : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${
          verified ? 'border-green-200 bg-green-50/50' : ''
        }`}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>
      )}
    </div>
  </div>
);

// ─── Step Layout Wrapper ─────────────────────────────────────────────
const StepLayout = ({ title, subtitle, icon: Icon, children, tip }) => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
    transition={{ duration: 0.3 }}
    className="max-w-2xl mx-auto px-4"
  >
    <div className="mb-8">
      {Icon && (
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-blue-600" strokeWidth={1.5} />
        </div>
      )}
      <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">{title}</h2>
      <p className="text-gray-500">{subtitle}</p>
    </div>
    {tip && (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">{tip}</p>
      </div>
    )}
    {children}
  </motion.div>
);

// ─── Data Source Badge ───────────────────────────────────────────────
const SourceBadge = ({ source }) => {
  const styles = {
    document: { bg: 'bg-purple-50', text: 'text-purple-700', icon: FileText, label: 'From Document' },
    lookup: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Search, label: 'Public Records' },
    manual: { bg: 'bg-gray-50', text: 'text-gray-600', icon: Edit3, label: 'Manual Entry' },
    unverified: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertCircle, label: 'Needs Verification' },
  };
  const s = styles[source] || styles.manual;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
};


// ═══════════════════════════════════════════════════════════════════════
//  STEP 0 — Welcome
// ═══════════════════════════════════════════════════════════════════════
const WelcomeStep = ({ onNext }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    className="max-w-2xl mx-auto px-4 text-center"
  >
    <div className="mb-8">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Home className="w-10 h-10 text-white" strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-3">
        Welcome to HomeBase
      </h1>
      <p className="text-lg text-gray-500 max-w-md mx-auto mb-2">
        Let's build your digital home profile — the smart way.
      </p>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        We'll pull data from your address and documents so you don't have to type it all manually.
      </p>
    </div>

    <div className="max-w-sm mx-auto space-y-3 mb-8">
      {[
        { icon: MapPin, label: 'Enter your address', desc: 'We\'ll look up public property records' },
        { icon: FileText, label: 'Upload documents', desc: 'Appraisals, disclosures, inspections' },
        { icon: Sparkles, label: 'AI extracts everything', desc: 'Dimensions, systems, appliances & more' },
        { icon: CheckCircle2, label: 'Review & verify', desc: 'Confirm what\'s right, fill in the gaps' },
      ].map(({ icon: Icon, label, desc }, i) => (
        <div key={i} className="flex items-center gap-4 text-left p-3 bg-white rounded-xl border border-gray-100">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="space-y-4 max-w-sm mx-auto">
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl transition-colors font-semibold text-lg shadow-lg"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="text-sm text-gray-400">Takes about 3 minutes with documents</p>
    </div>
  </motion.div>
);


// ═══════════════════════════════════════════════════════════════════════
//  STEP 1 — Address + Property Lookup
// ═══════════════════════════════════════════════════════════════════════
const AddressLookupStep = ({ data, onChange }) => {
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupResults, setLookupResults] = useState(null);
  const p = data.property;
  const update = (field, value) => onChange({ ...data, property: { ...p, [field]: value } });

  const canLookup = p.address && p.city && p.state;

  const doPropertyLookup = async () => {
    if (!canLookup) {
      toast.error('Enter at least address, city, and state');
      return;
    }
    setLookupLoading(true);
    try {
      const fullAddress = `${p.address}, ${p.city}, ${p.state} ${p.zip}`.trim();
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a property data assistant. Given this property address, provide realistic property details that would typically be available from public records, tax assessor data, and MLS listings.

Address: ${fullAddress}

Return ONLY valid JSON in this exact format (use empty string if unknown, do not fabricate specific serial numbers or model numbers):
{
  "property": {
    "yearBuilt": "",
    "sqft": "",
    "lotSize": "",
    "stories": "",
    "bedrooms": "",
    "bathrooms": ""
  },
  "rooms": [],
  "systems": {
    "hvac": { "type": "" },
    "waterHeater": { "type": "" },
    "electrical": { "amperage": "" }
  },
  "exterior": {
    "roof": { "type": "", "material": "" },
    "siding": { "material": "" }
  },
  "taxAssessorNotes": "Any relevant notes about what public records typically show for this type of property"
}

If you can reasonably infer details based on the address location, year, and typical construction for the area, include them. Otherwise leave empty. Return ONLY JSON.`
      });

      try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setLookupResults(parsed);

        // Auto-apply lookup results to empty fields
        const merged = { ...data };
        if (parsed.property) {
          for (const [key, value] of Object.entries(parsed.property)) {
            if (value && !merged.property[key]) {
              merged.property[key] = value;
            }
          }
        }
        // Track data sources
        merged._sources = { ...(merged._sources || {}), lookup: Object.keys(parsed.property || {}).filter(k => parsed.property[k]) };

        if (parsed.systems) {
          for (const section of ['hvac', 'waterHeater', 'electrical']) {
            if (parsed.systems[section]) {
              for (const [key, value] of Object.entries(parsed.systems[section])) {
                if (value && merged.systems[section] && !merged.systems[section][key]) {
                  merged.systems[section][key] = value;
                }
              }
            }
          }
        }
        if (parsed.exterior) {
          for (const section of ['roof', 'siding']) {
            if (parsed.exterior[section]) {
              for (const [key, value] of Object.entries(parsed.exterior[section])) {
                if (value && merged.exterior?.[section] && !merged.exterior[section][key]) {
                  merged.exterior[section][key] = value;
                }
              }
            }
          }
        }

        onChange(merged);
        setLookupDone(true);
        toast.success('Property data found! Review the details below.');
      } catch {
        toast.error('Could not parse property data. Continue to document upload.');
        setLookupDone(true);
      }
    } catch {
      toast.error('Lookup failed. No worries — documents will fill in the details.');
      setLookupDone(true);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <StepLayout
      title="Your Address"
      subtitle="Enter your address and we'll pull what we can from public records"
      icon={MapPin}
    >
      <div className="space-y-5">
        <Field label="Street Address" value={p.address} onChange={v => update('address', v)} placeholder="123 Main Street" />
        <div className="grid grid-cols-3 gap-3">
          <Field label="City" value={p.city} onChange={v => update('city', v)} placeholder="Mill Valley" className="col-span-1" />
          <Field label="State" value={p.state} onChange={v => update('state', v)} placeholder="CA" />
          <Field label="ZIP" value={p.zip} onChange={v => update('zip', v)} placeholder="94941" />
        </div>

        {/* Lookup Button */}
        {!lookupDone && (
          <button
            onClick={doPropertyLookup}
            disabled={lookupLoading || !canLookup}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl transition-all disabled:opacity-50 font-medium shadow-lg"
          >
            {lookupLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Searching public records...</>
            ) : (
              <><Search className="w-5 h-5" /> Look Up Property</>
            )}
          </button>
        )}

        {!canLookup && !lookupDone && (
          <p className="text-xs text-gray-400 text-center">Enter address, city, and state to enable lookup</p>
        )}

        {/* Lookup Results */}
        {lookupDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {lookupResults?.property && Object.values(lookupResults.property).some(Boolean) ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm">Property Data Found</h3>
                    <p className="text-xs text-blue-600">From public records — verify and edit as needed</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {p.yearBuilt && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Year Built</p>
                      <p className="text-lg font-semibold text-gray-900">{p.yearBuilt}</p>
                    </div>
                  )}
                  {p.sqft && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Square Feet</p>
                      <p className="text-lg font-semibold text-gray-900">{p.sqft}</p>
                    </div>
                  )}
                  {p.bedrooms && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Bedrooms</p>
                      <p className="text-lg font-semibold text-gray-900">{p.bedrooms}</p>
                    </div>
                  )}
                  {p.bathrooms && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Bathrooms</p>
                      <p className="text-lg font-semibold text-gray-900">{p.bathrooms}</p>
                    </div>
                  )}
                  {p.stories && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Stories</p>
                      <p className="text-lg font-semibold text-gray-900">{p.stories}</p>
                    </div>
                  )}
                  {p.lotSize && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Lot Size</p>
                      <p className="text-lg font-semibold text-gray-900">{p.lotSize} acres</p>
                    </div>
                  )}
                </div>
                {lookupResults.taxAssessorNotes && (
                  <p className="text-xs text-blue-700 mt-3 italic">{lookupResults.taxAssessorNotes}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Limited public records found</p>
                <p className="text-xs text-gray-400 mt-1">No worries — upload your documents next and we'll extract everything from there.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </StepLayout>
  );
};


// ═══════════════════════════════════════════════════════════════════════
//  STEP 2 — Upload Documents (Primary Data Source)
// ═══════════════════════════════════════════════════════════════════════
const DOCUMENT_TYPES = [
  { value: 'appraisal', label: 'Appraisal', icon: Building2, desc: 'Property dimensions, room count, condition details' },
  { value: 'disclosure', label: 'Seller Disclosure', icon: FileText, desc: 'Known issues, repairs, system ages, upgrades' },
  { value: 'inspection', label: 'Home Inspection', icon: Search, desc: 'Systems, appliances, structural details' },
  { value: 'listing', label: 'MLS Listing', icon: ExternalLink, desc: 'Property features, photos, descriptions' },
  { value: 'other', label: 'Other Document', icon: FileText, desc: 'Insurance, warranty, permits, etc.' },
];

const DocumentUploadStep = ({ data, onChange }) => {
  const [documents, setDocuments] = useState([]);
  const [pastedTexts, setPastedTexts] = useState([]);
  const [activePasteType, setActivePasteType] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [processingAll, setProcessingAll] = useState(false);
  const [processed, setProcessed] = useState(false);

  const handleFileChange = (e, docType) => {
    const newFiles = Array.from(e.target.files).map(f => ({
      file: f,
      name: f.name,
      type: docType,
      id: generateId(),
    }));
    setDocuments(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const addPastedText = () => {
    if (!pasteText.trim() || !activePasteType) return;
    setPastedTexts(prev => [...prev, {
      id: generateId(),
      type: activePasteType,
      text: pasteText.trim(),
      label: DOCUMENT_TYPES.find(d => d.value === activePasteType)?.label || 'Document',
    }]);
    setPasteText('');
    setActivePasteType(null);
    toast.success('Document text added');
  };

  const removeDocument = (id) => setDocuments(prev => prev.filter(d => d.id !== id));
  const removePastedText = (id) => setPastedTexts(prev => prev.filter(t => t.id !== id));

  const processAllDocuments = async () => {
    const allTexts = pastedTexts.map(t => t.text);
    if (allTexts.length === 0) {
      toast.error('Add at least one document (paste text from a PDF, appraisal, or disclosure)');
      return;
    }

    setProcessingAll(true);
    try {
      const combinedText = allTexts.map((text, i) => {
        const doc = pastedTexts[i];
        return `--- ${doc.label} ---\n${text}`;
      }).join('\n\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a home data extraction expert. I'm giving you text from one or more home documents (appraisals, disclosures, inspection reports, MLS listings).

Extract ALL structured home data and return it in this exact JSON format. Be thorough — pull out every detail you can find. Use empty strings for data not found. Do NOT fabricate data.

{
  "property": {
    "address": "", "city": "", "state": "", "zip": "",
    "yearBuilt": "", "sqft": "", "lotSize": "", "stories": "",
    "bedrooms": "", "bathrooms": ""
  },
  "rooms": [
    { "name": "", "type": "kitchen|living|bedroom|bathroom|dining|office|garage|laundry|other", "length": "", "width": "", "sqft": "", "flooring": "", "ceilingHeight": "", "level": "main|upper|lower|basement", "notes": "" }
  ],
  "appliances": [
    { "type": "", "brand": "", "model": "", "serialNumber": "", "installDate": "", "room": "", "notes": "" }
  ],
  "systems": {
    "hvac": { "brand": "", "model": "", "type": "", "installDate": "", "filterSize": "", "thermostat": "" },
    "waterHeater": { "brand": "", "model": "", "capacity": "", "type": "", "installDate": "" },
    "electrical": { "amperage": "", "circuits": "", "panelLocation": "" },
    "plumbing": { "mainShutoffLocation": "", "mainShutoffInstructions": "" }
  },
  "exterior": {
    "roof": { "type": "", "material": "", "installDate": "" },
    "gutters": { "type": "", "material": "" },
    "siding": { "material": "" }
  },
  "emergency": {
    "waterShutoff": { "location": "", "instructions": "" },
    "gasShutoff": { "location": "", "instructions": "" },
    "electricalPanel": { "location": "", "instructions": "" }
  },
  "paint": [
    { "room": "", "brand": "", "colorName": "", "colorCode": "", "finish": "", "notes": "" }
  ],
  "notes": "Any other important details found across the documents"
}

IMPORTANT EXTRACTION TIPS:
- For appraisals: Look carefully for GLA/Gross Living Area (this is the sqft), room counts, room dimensions, and the sketch/diagram section which describes the floor layout.
- Extract EVERY room with dimensions you can find (length × width). Appraisals often list rooms in a grid or sketch.
- For sqft: Look for "GLA", "Gross Living Area", "Living Area", "Total Sq Ft", "Above Grade", or similar fields.
- For layout: Note which floor/level each room is on (main, upper, lower, basement).

Return ONLY the JSON, no markdown or explanation.

Here are the documents:

${combinedText.slice(0, 30000)}`
      });

      try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);

        // Merge extracted data into home data
        const merged = { ...data };
        merged._sources = { ...(merged._sources || {}), documents: [] };

        // Merge property fields — document data overrides lookup data
        if (parsed.property) {
          for (const [key, value] of Object.entries(parsed.property)) {
            if (value) {
              // Documents are authoritative — override lookup/empty values
              const hadLookupValue = (data._sources?.lookup || []).includes(key);
              if (!merged.property[key] || hadLookupValue) {
                merged.property[key] = value;
              }
              merged._sources.documents.push(`property.${key}`);
            }
          }
        }

        // Add rooms
        if (parsed.rooms?.length) {
          const newRooms = parsed.rooms
            .filter(r => r.name)
            .map(r => ({ ...r, id: generateId(), _source: 'document' }));
          merged.rooms = [...(merged.rooms || []), ...newRooms];
        }

        // Add appliances
        if (parsed.appliances?.length) {
          const newAppliances = parsed.appliances
            .filter(a => a.type || a.brand)
            .map(a => ({ ...a, id: generateId(), _source: 'document' }));
          merged.appliances = [...(merged.appliances || []), ...newAppliances];
        }

        // Add paint
        if (parsed.paint?.length) {
          const newPaint = parsed.paint
            .filter(p => p.room || p.colorName)
            .map(p => ({ ...p, id: generateId(), _source: 'document' }));
          merged.paint = [...(merged.paint || []), ...newPaint];
        }

        // Merge systems — document data overrides lookup
        if (parsed.systems) {
          for (const section of ['hvac', 'waterHeater', 'electrical', 'plumbing']) {
            if (parsed.systems[section]) {
              for (const [key, value] of Object.entries(parsed.systems[section])) {
                if (value && merged.systems[section]) {
                  merged.systems[section][key] = value;
                  merged._sources.documents.push(`systems.${section}.${key}`);
                }
              }
            }
          }
        }

        // Merge exterior
        if (parsed.exterior) {
          for (const section of ['roof', 'gutters', 'siding']) {
            if (parsed.exterior[section]) {
              for (const [key, value] of Object.entries(parsed.exterior[section])) {
                if (value && merged.exterior?.[section] && !merged.exterior[section][key]) {
                  merged.exterior[section][key] = value;
                }
              }
            }
          }
        }

        // Merge emergency
        if (parsed.emergency) {
          for (const section of ['waterShutoff', 'gasShutoff', 'electricalPanel']) {
            if (parsed.emergency[section]) {
              for (const [key, value] of Object.entries(parsed.emergency[section])) {
                if (value && merged.emergency?.[section] && !merged.emergency[section][key]) {
                  merged.emergency[section][key] = value;
                }
              }
            }
          }
        }

        // Store document records
        const docs = [
          ...documents.map(d => ({
            id: d.id,
            name: d.name,
            type: d.type,
            uploadDate: new Date().toISOString(),
          })),
          ...pastedTexts.map(t => ({
            id: t.id,
            name: t.label,
            type: t.type,
            uploadDate: new Date().toISOString(),
          })),
        ];
        merged.documents = [...(merged.documents || []), ...docs];

        onChange(merged);
        setProcessed(true);

        const fieldCount = (merged._sources.documents || []).length +
          (parsed.rooms?.filter(r => r.name).length || 0) +
          (parsed.appliances?.filter(a => a.type || a.brand).length || 0);
        toast.success(`Extracted ${fieldCount}+ data points from your documents!`);
      } catch {
        toast.error('Could not parse extracted data. Try pasting cleaner text.');
      }
    } catch {
      toast.error('AI extraction failed. Try with shorter text sections.');
    } finally {
      setProcessingAll(false);
    }
  };

  const totalDocs = documents.length + pastedTexts.length;

  return (
    <StepLayout
      title="Upload Your Documents"
      subtitle="This is where the magic happens — upload your closing docs, appraisal, inspection, or disclosures and AI will extract everything"
      icon={FileText}
      tip="The more documents you provide, the more complete your home profile will be. Appraisals are especially good — they have dimensions, sqft, room counts, and more."
    >
      <div className="space-y-5">
        {/* Document Type Cards */}
        <div className="space-y-3">
          {DOCUMENT_TYPES.map(({ value, label, icon: Icon, desc }) => (
            <div key={value} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id={`upload-${value}`}
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, value)}
                    className="hidden"
                  />
                  <label
                    htmlFor={`upload-${value}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    File
                  </label>
                  <button
                    onClick={() => setActivePasteType(activePasteType === value ? null : value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activePasteType === value
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                    Paste
                  </button>
                </div>
              </div>

              {/* Paste text area */}
              <AnimatePresence>
                {activePasteType === value && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={`Paste the text content from your ${label.toLowerCase()} here...`}
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm text-gray-700"
                      />
                      <button
                        onClick={addPastedText}
                        disabled={!pasteText.trim()}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Add {label} Text
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Added documents list */}
        {(documents.length > 0 || pastedTexts.length > 0) && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-3">
              Documents Ready ({totalDocs})
            </p>
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700 truncate">{doc.name}</span>
                    <span className="text-xs text-gray-400">({DOCUMENT_TYPES.find(d => d.value === doc.type)?.label})</span>
                  </div>
                  <button onClick={() => removeDocument(doc.id)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {pastedTexts.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700">{doc.label}</span>
                    <span className="text-xs text-gray-400">({doc.text.length} chars)</span>
                  </div>
                  <button onClick={() => removePastedText(doc.id)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Button */}
        {totalDocs > 0 && !processed && (
          <button
            onClick={processAllDocuments}
            disabled={processingAll}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl transition-all disabled:opacity-60 font-semibold text-lg shadow-lg"
          >
            {processingAll ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Extracting data from {totalDocs} document{totalDocs > 1 ? 's' : ''}...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Extract Data from {totalDocs} Document{totalDocs > 1 ? 's' : ''}</>
            )}
          </button>
        )}

        {processed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900">Documents Processed!</h3>
            <p className="text-sm text-green-700 mt-1">Your home profile has been populated. Continue to review everything.</p>
            <p className="text-xs text-green-600 mt-2">You can add more documents or continue to review.</p>
          </motion.div>
        )}

        {totalDocs === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No documents added yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload files or paste text from your home documents above</p>
          </div>
        )}
      </div>
    </StepLayout>
  );
};


// ═══════════════════════════════════════════════════════════════════════
//  STEP 3 — Review & Verify
// ═══════════════════════════════════════════════════════════════════════
const ReviewVerifyStep = ({ data, onChange }) => {
  const [expandedSection, setExpandedSection] = useState('property');
  const [editMode, setEditMode] = useState({});
  const completion = calculateCompletion(data);
  const sources = data._sources || {};

  const toggleSection = (key) => setExpandedSection(expandedSection === key ? null : key);
  const toggleEdit = (key) => setEditMode(prev => ({ ...prev, [key]: !prev[key] }));

  const getFieldStatus = (value, fieldPath) => {
    if (!value) return 'missing';
    if (sources.documents?.includes(fieldPath)) return 'document';
    if (sources.lookup?.includes(fieldPath.split('.').pop())) return 'lookup';
    return 'manual';
  };

  const updateProperty = (field, value) => {
    onChange({ ...data, property: { ...data.property, [field]: value } });
  };

  const updateSystem = (system, field, value) => {
    onChange({
      ...data,
      systems: {
        ...data.systems,
        [system]: { ...data.systems[system], [field]: value }
      }
    });
  };

  const updateEmergency = (section, field, value) => {
    onChange({
      ...data,
      emergency: {
        ...data.emergency,
        [section]: { ...data.emergency[section], [field]: value }
      }
    });
  };

  const sections = [
    {
      key: 'property',
      label: 'Property Details',
      icon: Building2,
      fields: [
        { key: 'address', label: 'Address' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'zip', label: 'ZIP' },
        { key: 'yearBuilt', label: 'Year Built' },
        { key: 'sqft', label: 'Square Feet' },
        { key: 'lotSize', label: 'Lot Size' },
        { key: 'stories', label: 'Stories' },
        { key: 'bedrooms', label: 'Bedrooms' },
        { key: 'bathrooms', label: 'Bathrooms' },
      ]
    },
    {
      key: 'rooms',
      label: 'Rooms & Spaces',
      icon: Layers,
      isList: true,
    },
    {
      key: 'appliances',
      label: 'Appliances',
      icon: Refrigerator,
      isList: true,
    },
    {
      key: 'systems',
      label: 'Home Systems',
      icon: Zap,
      subsections: [
        { key: 'hvac', label: 'HVAC', fields: ['brand', 'model', 'type', 'installDate', 'filterSize'] },
        { key: 'waterHeater', label: 'Water Heater', fields: ['brand', 'model', 'capacity', 'type', 'installDate'] },
        { key: 'electrical', label: 'Electrical', fields: ['amperage', 'circuits', 'panelLocation'] },
        { key: 'plumbing', label: 'Plumbing', fields: ['mainShutoffLocation', 'mainShutoffInstructions'] },
      ]
    },
    {
      key: 'emergency',
      label: 'Emergency Info',
      icon: AlertTriangle,
      subsections: [
        { key: 'waterShutoff', label: 'Water Shutoff', fields: ['location', 'instructions'] },
        { key: 'gasShutoff', label: 'Gas Shutoff', fields: ['location', 'instructions'] },
        { key: 'electricalPanel', label: 'Electrical Panel', fields: ['location', 'instructions'] },
      ]
    },
  ];

  const getSectionCompletion = (key) => {
    const sec = completion[key];
    if (!sec) return { filled: 0, total: 0, pct: 0 };
    return { filled: sec.completed, total: sec.total, pct: sec.percentage };
  };

  return (
    <StepLayout
      title="Review & Verify"
      subtitle="Here's everything we found. Edit anything that's wrong, fill in what's missing."
      icon={Eye}
    >
      {/* Overall Progress */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Profile Completeness</h3>
            <p className="text-xs text-gray-500">{completion.overall.completed} of {completion.overall.total} data points</p>
          </div>
          <span className="text-2xl font-light text-blue-600">{completion.overall.percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
            style={{ width: `${completion.overall.percentage}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          <SourceBadge source="document" />
          <SourceBadge source="lookup" />
          <SourceBadge source="manual" />
          <SourceBadge source="unverified" />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map(section => {
          const isExpanded = expandedSection === section.key;
          const comp = getSectionCompletion(section.key);
          const Icon = section.icon;
          const isEditing = editMode[section.key];

          return (
            <div key={section.key} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    comp.pct === 100 ? 'bg-green-50' : comp.pct > 0 ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      comp.pct === 100 ? 'text-green-600' : comp.pct > 0 ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">{section.label}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${comp.pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${comp.pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{comp.filled}/{comp.total}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {comp.pct === 100 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {comp.pct > 0 && comp.pct < 100 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Needs review</span>
                  )}
                  {comp.pct === 0 && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Empty</span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gray-50">
                      {/* Property fields */}
                      {section.fields && (
                        <div className="pt-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-400">Click any field to edit</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {section.fields.map(field => {
                              const val = data.property[field.key];
                              const status = getFieldStatus(val, `property.${field.key}`);
                              return (
                                <div key={field.key} className={`p-3 rounded-xl border transition-all ${
                                  !val ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-gray-50'
                                }`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{field.label}</label>
                                    {val && <SourceBadge source={status} />}
                                    {!val && <span className="text-[10px] text-amber-600 font-medium">Missing</span>}
                                  </div>
                                  <input
                                    type="text"
                                    value={val || ''}
                                    onChange={(e) => updateProperty(field.key, e.target.value)}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    className="w-full bg-transparent text-sm text-gray-900 font-medium outline-none placeholder:text-gray-300"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* List items (rooms, appliances) */}
                      {section.isList && (
                        <div className="pt-3">
                          {data[section.key]?.length > 0 ? (
                            <div className="space-y-2">
                              {data[section.key].map((item, i) => (
                                <div key={item.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                      <section.icon className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.name || item.type || `${section.key.slice(0, -1)} ${i + 1}`}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {section.key === 'rooms' && (item.length && item.width ? `${item.length}' x ${item.width}'` : item.flooring || 'No dimensions')}
                                        {section.key === 'appliances' && [item.brand, item.model].filter(Boolean).join(' ')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {item._source && <SourceBadge source={item._source} />}
                                    <button
                                      onClick={() => {
                                        const updated = data[section.key].filter((_, j) => j !== i);
                                        onChange({ ...data, [section.key]: updated });
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-amber-50/50 rounded-xl border border-amber-100">
                              <p className="text-sm text-amber-700">No {section.key} found in your documents</p>
                              <p className="text-xs text-amber-500 mt-1">You can add these later from the dashboard</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Subsections (systems, emergency) */}
                      {section.subsections && (
                        <div className="pt-3 space-y-4">
                          {section.subsections.map(sub => (
                            <div key={sub.key}>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">{sub.label}</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {sub.fields.map(field => {
                                  const val = section.key === 'emergency'
                                    ? data.emergency?.[sub.key]?.[field]
                                    : data.systems?.[sub.key]?.[field];
                                  const status = getFieldStatus(val, `${section.key}.${sub.key}.${field}`);
                                  return (
                                    <div key={field} className={`p-2.5 rounded-lg border ${
                                      !val ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-gray-50'
                                    }`}>
                                      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-0.5">
                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                      </label>
                                      <input
                                        type="text"
                                        value={val || ''}
                                        onChange={(e) => {
                                          if (section.key === 'emergency') {
                                            updateEmergency(sub.key, field, e.target.value);
                                          } else {
                                            updateSystem(sub.key, field, e.target.value);
                                          }
                                        }}
                                        placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                                        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-300"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        Don't worry about filling everything now — you can always update from the dashboard
      </p>
    </StepLayout>
  );
};


// ═══════════════════════════════════════════════════════════════════════
//  STEP 4 — Complete
// ═══════════════════════════════════════════════════════════════════════
const CompleteStep = ({ data }) => {
  const completion = calculateCompletion(data);
  const docCount = data.documents?.length || 0;
  const roomCount = data.rooms?.length || 0;
  const applianceCount = data.appliances?.length || 0;

  return (
    <StepLayout
      title="Your Home Profile is Ready!"
      subtitle="Here's what we've captured"
      icon={CheckCircle2}
    >
      {/* Overall Score */}
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none" stroke="#2563EB" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - completion.overall.percentage / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-light text-gray-900">{completion.overall.percentage}%</span>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-purple-50 rounded-2xl p-4 text-center">
          <FileText className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-2xl font-light text-purple-900">{docCount}</p>
          <p className="text-xs text-purple-600">Documents</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <Layers className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-light text-blue-900">{roomCount}</p>
          <p className="text-xs text-blue-600">Rooms</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <Refrigerator className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-light text-green-900">{applianceCount}</p>
          <p className="text-xs text-green-600">Appliances</p>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="space-y-2">
        {[
          { key: 'property', label: 'Property Details', icon: Building2 },
          { key: 'rooms', label: 'Rooms & Spaces', icon: Layers },
          { key: 'appliances', label: 'Appliances', icon: Refrigerator },
          { key: 'systems', label: 'Systems', icon: Zap },
          { key: 'emergency', label: 'Emergency', icon: AlertTriangle },
        ].map(({ key, label, icon: Icon }) => {
          const sec = completion[key];
          if (!sec) return null;
          return (
            <div key={key} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
              <Icon className={`w-5 h-5 ${sec.percentage === 100 ? 'text-green-600' : sec.percentage > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <span className="text-xs text-gray-400">{sec.completed}/{sec.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div className={`h-1 rounded-full ${sec.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${sec.percentage}%` }} />
                </div>
              </div>
              {sec.percentage === 100 && <Check className="w-4 h-4 text-green-500" />}
            </div>
          );
        })}
      </div>

      {completion.overall.percentage < 100 && (
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Still have gaps?</p>
              <p className="text-xs text-amber-700 mt-1">You can add more documents, look up appliance details, and fill in missing info anytime from the HomeBase dashboard.</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-gray-400 mt-6">
        Your home profile will keep getting smarter as you add more info
      </p>
    </StepLayout>
  );
};


// ═══════════════════════════════════════════════════════════════════════
//  MAIN ONBOARDING WIZARD
// ═══════════════════════════════════════════════════════════════════════
const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'address', label: 'Address' },
  { id: 'documents', label: 'Documents' },
  { id: 'review', label: 'Review' },
  { id: 'complete', label: 'Complete' },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [homeData, setHomeData] = useState(() => getHomeData());
  const navigate = useNavigate();

  // Auto-save on data changes
  useEffect(() => {
    if (currentStep > 0) {
      saveHomeData(homeData);
    }
  }, [homeData, currentStep]);

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const finishOnboarding = () => {
    const updated = { ...homeData, onboardingComplete: true };
    saveHomeData(updated);
    navigate(createPageUrl('HomeBase'));
    toast.success('Home profile saved! Welcome to HomeBase.');
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm tracking-tight">HOMEBASE SETUP</span>
            </div>
            {!isFirstStep && (
              <span className="text-xs text-gray-400">
                Step {currentStep} of {STEPS.length - 1}
              </span>
            )}
          </div>
          {!isFirstStep && (
            <StepProgress currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="pt-8 pb-32">
        <AnimatePresence mode="wait">
          {currentStep === 0 && <WelcomeStep key="welcome" onNext={goNext} />}
          {currentStep === 1 && <AddressLookupStep key="address" data={homeData} onChange={setHomeData} />}
          {currentStep === 2 && <DocumentUploadStep key="documents" data={homeData} onChange={setHomeData} />}
          {currentStep === 3 && <ReviewVerifyStep key="review" data={homeData} onChange={setHomeData} />}
          {currentStep === 4 && <CompleteStep key="complete" data={homeData} />}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {!isFirstStep && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-40">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={goPrev}
              className="flex items-center gap-2 px-5 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {!isLastStep && currentStep < STEPS.length - 2 && (
                <button
                  onClick={goNext}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={isLastStep ? finishOnboarding : goNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  isLastStep
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLastStep ? (
                  <>
                    Go to HomeBase
                    <Home className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
