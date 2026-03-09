import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { getHomeData, calculateCompletion } from '../lib/homeDataStore';
import {
  Home,
  MessageCircle,
  Grid3X3,
  AlertTriangle,
  Wifi,
  Key,
  Trash2,
  Wind,
  Mic,
  Send,
  MapPin,
  ChevronRight,
  Book,
  ShoppingCart,
  Droplets,
  Flame,
  Zap,
  Phone,
  ArrowLeft,
  Ruler,
  Palette,
  Refrigerator,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  Wrench
} from 'lucide-react';

// Health Score Ring Component
const HealthScoreRing = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <motion.circle
          cx="100" cy="100" r="88" fill="none" stroke="#2563EB" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-light text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {animatedScore}%
        </motion.span>
        <span className="text-sm font-medium text-gray-400 tracking-widest uppercase mt-1">Healthy</span>
      </div>
    </div>
  );
};

// Quick Info Card Component
const QuickInfoCard = ({ icon: Icon, title, primary, secondary, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 hover:shadow-md transition-shadow duration-300"
  >
    <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-4`}>
      <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
    </div>
    <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-1">{title}</p>
    <p className="text-lg font-semibold text-gray-900 tracking-tight">{primary}</p>
    {secondary && <p className="text-sm text-gray-500 mt-0.5">{secondary}</p>}
  </motion.div>
);

// Sub-nav for HomeBase internal views
const SubNav = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'rooms', icon: Grid3X3, label: 'Rooms' },
    { id: 'emergency', icon: AlertTriangle, label: 'Emergency' },
  ];

  return (
    <div className="sticky top-[3.5rem] z-20 flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-xl border-b border-gray-100">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === item.id
              ? item.id === 'emergency'
                ? 'bg-red-50 text-red-600'
                : 'bg-blue-50 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <item.icon className="w-4 h-4" strokeWidth={1.5} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// Dashboard View
const DashboardView = () => {
  const homeData = getHomeData();
  const completion = calculateCompletion(homeData);
  const hasStartedOnboarding = homeData.onboardingComplete || completion.overall.percentage > 0;
  const wifiName = homeData.smartHome?.wifi?.networkName;
  const wifiPass = homeData.smartHome?.wifi?.password;
  const doorLock = homeData.smartHome?.doorLocks?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="px-6 pt-10 pb-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-3">
            Your Complete Home Manual
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {homeData.property?.address
              ? `${homeData.property.address}, ${homeData.property.city || ''}`
              : 'Every detail about your home in one comprehensive digital manual'}
          </p>
        </motion.div>

        {/* Setup CTA */}
        {!homeData.onboardingComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Link
              to={createPageUrl('Onboarding')}
              className="block bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-[1.02] duration-300"
            >
              <div className="flex items-start gap-6 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    {hasStartedOnboarding ? 'Continue Home Setup' : 'Set Up Your Home'}
                  </h2>
                  <p className="text-purple-100 text-sm leading-relaxed">
                    {hasStartedOnboarding
                      ? `You're ${completion.overall.percentage}% complete. Pick up where you left off.`
                      : 'Guided wizard with AI-powered document import. Takes about 10 minutes.'}
                  </p>
                </div>
                <ArrowRight className="w-8 h-8 text-white/80" />
              </div>
              {hasStartedOnboarding && (
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-700"
                    style={{ width: `${completion.overall.percentage}%` }}
                  />
                </div>
              )}
            </Link>
          </motion.div>
        )}

        {/* Hero CTA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Link
            to={createPageUrl('HomeBaseManual')}
            className="block bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 duration-300"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white mb-2">Open Full Manual</h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Interactive property map, complete room specs, appliance warranties, emergency shutoffs, and all home documentation
                </p>
              </div>
              <ChevronRight className="w-8 h-8 text-white/80" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-white/90 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="font-semibold text-lg">{completion.overall.percentage}%</p>
                <p className="text-xs text-white/70">Complete</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="font-semibold text-lg">{completion.overall.completed}</p>
                <p className="text-xs text-white/70">Data Points</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="font-semibold text-lg">Map</p>
                <p className="text-xs text-white/70">Property View</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Quick Access Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 text-center">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickInfoCard
              icon={Wifi}
              title="WiFi"
              primary={wifiName || "Redwood_Mesh"}
              secondary={wifiPass || "GiantTrees26!"}
              color="bg-blue-600"
              delay={0.5}
            />
            <QuickInfoCard
              icon={Key}
              title="Access"
              primary={doorLock?.code || "4821#"}
              secondary={doorLock?.location || "Front Door"}
              color="bg-emerald-500"
              delay={0.6}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Room Detail View
const RoomDetailView = () => (
  <div className="min-h-screen bg-[#F9F9F9]">
    <div className="px-6 pt-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm font-medium text-gray-400 tracking-widest uppercase mb-2">Room Detail</p>
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Kitchen</h1>
      </motion.div>

      {/* Room Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-slate-100 to-slate-200 aspect-video"
      >
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
          alt="Kitchen"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700">
          360° View
        </div>
      </motion.div>

      {/* Specs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Specifications
        </h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Ceiling Height</p>
              <p className="text-xl font-semibold text-gray-900">9' 6"</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Dimensions</p>
              <p className="text-xl font-semibold text-gray-900">14' x 18'</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Square Footage</p>
              <p className="text-xl font-semibold text-gray-900">252 sq ft</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Windows</p>
              <p className="text-xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Colors Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Paint Colors
        </h2>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F0] border border-gray-200" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Wall Paint</p>
              <p className="text-sm text-gray-500">Benjamin Moore "Chantilly Lace"</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B3142]" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Cabinet Paint</p>
              <p className="text-sm text-gray-500">Farrow & Ball "Hague Blue"</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        </div>
      </motion.div>

      {/* Appliances Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
          <Refrigerator className="w-4 h-4" />
          Appliances
        </h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Refrigerator className="w-7 h-7 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Refrigerator</p>
              <p className="text-sm text-gray-500">Sub-Zero Classic BI-42U</p>
              <p className="text-xs text-gray-400 mt-1">Installed 2021 · Warranty Active</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-colors">
              <Book className="w-4 h-4" />
              <span className="text-sm font-medium">Manual</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Order Filter</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

// Emergency View
const EmergencyView = () => {
  const emergencyItems = [
    {
      icon: Droplets,
      title: 'Water Main Shutoff',
      location: 'Front Yard',
      detail: 'Blue Lid · Turn Clockwise',
      color: 'bg-blue-500',
    },
    {
      icon: Flame,
      title: 'Gas Shutoff',
      location: 'Left Side of House',
      detail: 'Wrench Attached',
      color: 'bg-orange-500',
    },
    {
      icon: Zap,
      title: 'Electrical Panel',
      location: 'Garage',
      detail: 'Panel A · Main Breaker Top Left',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-6 pt-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-medium text-red-500 tracking-widest uppercase">Emergency Mode</p>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Critical Shutoffs</h1>
        </motion.div>

        {/* Emergency Call Button */}
        <motion.a
          href="tel:911"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl mb-8 transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span className="font-semibold">Call 911</span>
        </motion.a>

        {/* Emergency Items */}
        <div className="space-y-4">
          {emergencyItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-slate-800 rounded-3xl p-6 border border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-300">{item.location}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.detail}</p>
                </div>
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Show on Property Map</span>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pb-8"
        >
          <h2 className="text-xs font-medium text-slate-500 tracking-widest uppercase mb-4">Emergency Contacts</h2>
          <div className="space-y-3">
            {[
              { name: 'Plumber', company: 'ABC Plumbing', phone: '(555) 123-4567' },
              { name: 'Electrician', company: 'Bright Spark Electric', phone: '(555) 234-5678' },
              { name: 'HVAC', company: 'Cool Air Services', phone: '(555) 345-6789' },
            ].map((contact, i) => (
              <a
                key={i}
                href={`tel:${contact.phone.replace(/\D/g, '')}`}
                className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700"
              >
                <div>
                  <p className="font-medium text-white">{contact.name}</p>
                  <p className="text-sm text-slate-400">{contact.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 text-sm">{contact.phone}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main App Component
export default function HomeBase() {
  const [activeView, setActiveView] = useState('home');

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <DashboardView />;
      case 'rooms':
        return <RoomDetailView />;
      case 'emergency':
        return <EmergencyView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <SubNav activeView={activeView} setActiveView={setActiveView} />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
