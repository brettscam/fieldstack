import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Eye,
  X,
  Droplets,
  Flame,
  Zap,
  Thermometer,
  Home,
  Trees,
  Car,
  ChevronRight
} from 'lucide-react';

// Emergency marker definitions
const EMERGENCY_MARKERS = [
  {
    id: 'water_shutoff',
    label: 'Water Main Shutoff',
    icon: Droplets,
    color: 'bg-blue-500',
    ringColor: 'ring-blue-400',
    position: { top: '78%', left: '28%' },
    location: 'Front Yard',
    detail: 'Blue Lid · Turn Clockwise to Close',
    pulse: true,
  },
  {
    id: 'gas_shutoff',
    label: 'Gas Shutoff',
    icon: Flame,
    color: 'bg-orange-500',
    ringColor: 'ring-orange-400',
    position: { top: '42%', left: '12%' },
    location: 'North Wall (Left Side)',
    detail: 'Wrench Attached · Turn Perpendicular to Pipe',
    pulse: true,
  },
  {
    id: 'electrical_panel',
    label: 'Electrical Panel',
    icon: Zap,
    color: 'bg-yellow-500',
    ringColor: 'ring-yellow-400',
    position: { top: '55%', left: '82%' },
    location: 'Garage',
    detail: '200A Main Panel · Main Breaker Top Left',
    pulse: true,
  },
  {
    id: 'water_heater',
    label: 'Water Heater',
    icon: Thermometer,
    color: 'bg-cyan-500',
    ringColor: 'ring-cyan-400',
    position: { top: '60%', left: '75%' },
    location: 'Garage',
    detail: 'Rheem Performance Platinum 50 Gal (2023)',
    pulse: false,
  },
];

// Room data for the flat floor plan
const ROOMS = [
  { id: 'living', name: 'Living Room', dims: "18' × 22'", x: 5, y: 18, w: 30, h: 28, color: '#EEF2FF' },
  { id: 'kitchen', name: 'Kitchen', dims: "16'4\" × 18'2\"", x: 35, y: 18, w: 25, h: 22, color: '#F0FDF4' },
  { id: 'dining', name: 'Dining', dims: "12' × 14'", x: 35, y: 40, w: 18, h: 16, color: '#FFF7ED' },
  { id: 'master', name: 'Master Bed', dims: "16' × 18'", x: 5, y: 50, w: 28, h: 24, color: '#F5F3FF' },
  { id: 'bed2', name: 'Bed 2', dims: "12' × 14'", x: 35, y: 58, w: 18, h: 16, color: '#FDF2F8' },
  { id: 'bed3', name: 'Bed 3', dims: "12' × 14'", x: 55, y: 58, w: 18, h: 16, color: '#FFF1F2' },
  { id: 'bath_master', name: 'Master Bath', dims: "10' × 12'", x: 5, y: 46, w: 15, h: 10, color: '#ECFEFF', isBath: true },
  { id: 'bath_guest', name: 'Guest Bath', dims: "8' × 10'", x: 60, y: 40, w: 13, h: 12, color: '#ECFEFF', isBath: true },
  { id: 'garage', name: 'Garage', dims: "20' × 22'", x: 60, y: 18, w: 20, h: 20, color: '#F1F5F9', isGarage: true },
];

// Parcel Property View - flat aerial layout
export default function HouseModel3D({ onRoomClick, darkMode }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [viewMode, setViewMode] = useState('parcel'); // 'parcel' or 'floorplan'

  const handleRoomClick = (room) => {
    if (onRoomClick) {
      onRoomClick({ name: room.name, description: room.dims, section: 'spaces' });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* View Mode Toggle */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200">
        <button
          onClick={() => setViewMode('parcel')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'parcel'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Property View
        </button>
        <button
          onClick={() => setViewMode('floorplan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'floorplan'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Floor Plan
        </button>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setShowMarkers(!showMarkers)}
          className={`p-2.5 rounded-xl shadow-lg transition-all text-xs font-medium flex items-center gap-1.5 ${
            showMarkers
              ? 'bg-red-500 text-white'
              : darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
          }`}
          title="Toggle Emergency Markers"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">{showMarkers ? 'Hide' : 'Show'} Shutoffs</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'parcel' ? (
          <motion.div
            key="parcel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {/* Parcel / Aerial View */}
            <div className={`w-full h-full relative ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-green-100 via-green-50 to-emerald-100'} rounded-2xl overflow-hidden`}>
              {/* Property boundary */}
              <div className="absolute inset-[8%] border-2 border-dashed border-green-300/60 rounded-xl" />

              {/* Lot features - Trees */}
              {[
                { top: '10%', left: '10%', size: 'w-14 h-14' },
                { top: '8%', left: '22%', size: 'w-12 h-12' },
                { top: '12%', left: '16%', size: 'w-16 h-16' },
                { top: '75%', left: '65%', size: 'w-10 h-10' },
                { top: '80%', left: '75%', size: 'w-12 h-12' },
              ].map((tree, i) => (
                <div
                  key={i}
                  className={`absolute ${tree.size} rounded-full bg-green-400/30 border border-green-500/20 flex items-center justify-center`}
                  style={{ top: tree.top, left: tree.left }}
                >
                  <Trees className="w-5 h-5 text-green-600/40" />
                </div>
              ))}

              {/* Driveway */}
              <div
                className={`absolute ${darkMode ? 'bg-slate-600' : 'bg-stone-200'} rounded-lg`}
                style={{ top: '30%', right: '5%', width: '8%', height: '25%' }}
              />
              <div
                className={`absolute ${darkMode ? 'bg-slate-600' : 'bg-stone-200'} rounded-lg`}
                style={{ bottom: '5%', right: '5%', width: '20%', height: '6%' }}
              />

              {/* House footprint */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`absolute ${
                  darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                } border-2 shadow-2xl rounded-xl cursor-pointer hover:shadow-3xl transition-shadow`}
                style={{ top: '20%', left: '18%', width: '58%', height: '55%' }}
                onClick={() => setViewMode('floorplan')}
              >
                {/* House label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`w-16 h-16 rounded-2xl ${darkMode ? 'bg-slate-600' : 'bg-blue-50'} flex items-center justify-center mb-3`}>
                    <Home className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    The Miller Residence
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'} mt-1`}>
                    2,847 sq ft · 4 Bed · 3.5 Bath
                  </p>
                  <div className={`mt-4 flex items-center gap-1.5 px-4 py-2 ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} text-white rounded-lg text-sm font-medium`}>
                    <Eye className="w-4 h-4" />
                    <span>View Floor Plan</span>
                  </div>
                </div>

                {/* Garage wing */}
                <div
                  className={`absolute ${darkMode ? 'bg-slate-600 border-slate-500' : 'bg-gray-100 border-gray-200'} border rounded-lg flex items-center justify-center`}
                  style={{ top: '10%', right: '-18%', width: '16%', height: '35%' }}
                >
                  <Car className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                </div>
              </motion.div>

              {/* Patio */}
              <div
                className={`absolute ${darkMode ? 'bg-slate-600/50 border-slate-500' : 'bg-amber-50 border-amber-200'} border rounded-lg`}
                style={{ top: '15%', left: '25%', width: '20%', height: '8%' }}
              >
                <p className={`text-center mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-amber-600/60'}`}>Patio</p>
              </div>

              {/* Property address label */}
              <div className={`absolute bottom-4 left-4 ${darkMode ? 'bg-slate-700/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-400'} tracking-widest uppercase`}>Property Parcel</p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0.31 Acres · R-1 Zoning</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'} mt-0.5`}>Mill Valley, CA</p>
              </div>

              {/* Emergency Markers on Parcel View */}
              <AnimatePresence>
                {showMarkers && EMERGENCY_MARKERS.map((marker) => (
                  <motion.button
                    key={marker.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    onClick={(e) => { e.stopPropagation(); setSelectedMarker(marker); }}
                    className={`absolute z-10 w-9 h-9 ${marker.color} rounded-full flex items-center justify-center shadow-lg cursor-pointer ring-2 ${marker.ringColor} ring-offset-2 ${darkMode ? 'ring-offset-slate-800' : 'ring-offset-green-50'}`}
                    style={{ top: marker.position.top, left: marker.position.left, transform: 'translate(-50%, -50%)' }}
                    title={marker.label}
                  >
                    <marker.icon className="w-4 h-4 text-white" />
                    {marker.pulse && (
                      <span className={`absolute inset-0 rounded-full ${marker.color} opacity-40 animate-ping`} />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="floorplan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {/* Floor Plan View */}
            <div className={`w-full h-full relative ${darkMode ? 'bg-slate-800' : 'bg-gray-50'} rounded-2xl overflow-hidden p-6`}>
              {/* Back to parcel button */}
              <button
                onClick={() => setViewMode('parcel')}
                className={`absolute top-14 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 ${
                  darkMode ? 'bg-slate-700 text-white' : 'bg-white text-gray-700'
                } rounded-lg shadow-md text-xs font-medium hover:scale-105 transition-transform`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to Property</span>
              </button>

              {/* Grid background */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `linear-gradient(${darkMode ? '#475569' : '#94a3b8'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? '#475569' : '#94a3b8'} 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Rooms */}
              <div className="relative w-full h-full">
                {ROOMS.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: ROOMS.indexOf(room) * 0.05 }}
                    className={`absolute border-2 rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                      hoveredRoom === room.id
                        ? darkMode
                          ? 'border-blue-400 shadow-lg shadow-blue-500/20 z-10'
                          : 'border-blue-400 shadow-lg shadow-blue-200 z-10'
                        : darkMode
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      left: `${room.x}%`,
                      top: `${room.y}%`,
                      width: `${room.w}%`,
                      height: `${room.h}%`,
                      backgroundColor: darkMode
                        ? hoveredRoom === room.id ? '#1e293b' : '#0f172a'
                        : room.color,
                    }}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => handleRoomClick(room)}
                  >
                    <p className={`text-xs font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-700'
                    } ${room.isBath || room.isGarage ? 'text-[10px]' : ''}`}>
                      {room.name}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                      {room.dims}
                    </p>
                    {hoveredRoom === room.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 text-blue-600"
                      >
                        <span className="text-[9px] font-medium">View specs</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {/* Emergency Markers on Floor Plan */}
                <AnimatePresence>
                  {showMarkers && EMERGENCY_MARKERS.map((marker) => {
                    // Remap marker positions for floor plan view
                    const floorPlanPositions = {
                      water_shutoff: { top: '85%', left: '25%' },
                      gas_shutoff: { top: '40%', left: '5%' },
                      electrical_panel: { top: '30%', left: '72%' },
                      water_heater: { top: '38%', left: '68%' },
                    };
                    const pos = floorPlanPositions[marker.id] || marker.position;

                    return (
                      <motion.button
                        key={marker.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setSelectedMarker(marker)}
                        className={`absolute z-10 w-8 h-8 ${marker.color} rounded-full flex items-center justify-center shadow-lg cursor-pointer ring-2 ${marker.ringColor} ring-offset-1 ${darkMode ? 'ring-offset-slate-800' : 'ring-offset-gray-50'}`}
                        style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                        title={marker.label}
                      >
                        <marker.icon className="w-3.5 h-3.5 text-white" />
                        {marker.pulse && (
                          <span className={`absolute inset-0 rounded-full ${marker.color} opacity-30 animate-ping`} />
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Legend */}
              <div className={`absolute bottom-4 left-4 ${darkMode ? 'bg-slate-700/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-gray-400'} tracking-widest uppercase mb-1.5`}>Floor Plan</p>
                <p className={`text-xs ${darkMode ? 'text-white' : 'text-gray-700'}`}>Click any room for full specs</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Marker Detail Panel */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`absolute bottom-4 right-4 ${
              darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
            } border rounded-2xl shadow-2xl p-5 w-80 z-30`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${selectedMarker.color} rounded-xl flex items-center justify-center`}>
                  <selectedMarker.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedMarker.label}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {selectedMarker.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className={`${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={`${darkMode ? 'bg-slate-600' : 'bg-gray-50'} rounded-xl p-3`}>
              <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                {selectedMarker.detail}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
