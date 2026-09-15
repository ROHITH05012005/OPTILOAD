import React, { useState, useMemo } from 'react';
import {
  Truck,
  Box,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Package,
  Layers,
  Zap,
  Scale
} from 'lucide-react';
import { TRUCK_OPTIONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface CargoBox {
  id: string;
  name: string;
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  weight: number; // kg
  quantity: number;
  color: string;
}

const PRESETS: { name: string; icon: string; items: Omit<CargoBox, 'id'>[] }[] = [
  {
    name: 'E-Commerce Cartons',
    icon: '📦',
    items: [
      { name: 'Apparel Box A', length: 40, width: 30, height: 25, weight: 8, quantity: 20, color: '#3b82f6' },
      { name: 'Shoe Carton B', length: 35, width: 25, height: 20, weight: 4, quantity: 15, color: '#10b981' },
    ]
  },
  {
    name: 'Industrial Warehouse',
    icon: '🏭',
    items: [
      { name: 'Metal Spare Crate', length: 80, width: 60, height: 50, weight: 85, quantity: 6, color: '#8b5cf6' },
      { name: 'Hardware Box', length: 50, width: 40, height: 35, weight: 35, quantity: 8, color: '#f59e0b' },
    ]
  },
  {
    name: 'Electronics Restock',
    icon: '📱',
    items: [
      { name: 'Laptop Bulk Carton', length: 60, width: 45, height: 30, weight: 15, quantity: 12, color: '#06b6d4' },
      { name: 'Accessories Case', length: 30, width: 30, height: 20, weight: 5, quantity: 25, color: '#ec4899' },
    ]
  }
];

export const GuestEstimator: React.FC = () => {
  const { showAuthModal } = useAuth();

  const [selectedTruckId, setSelectedTruckId] = useState<string>(TRUCK_OPTIONS[0].id);
  const [items, setItems] = useState<CargoBox[]>([
    { id: '1', name: 'Standard Carton A', length: 50, width: 40, height: 30, weight: 12, quantity: 15, color: '#3b82f6' },
    { id: '2', name: 'Parcel Box B', length: 35, width: 30, height: 25, weight: 8, quantity: 10, color: '#10b981' },
  ]);

  // Form input state for adding a custom box
  const [boxName, setBoxName] = useState('');
  const [boxL, setBoxL] = useState('45');
  const [boxW, setBoxW] = useState('35');
  const [boxH, setBoxH] = useState('30');
  const [boxWeight, setBoxWeight] = useState('10');
  const [boxQty, setBoxQty] = useState('10');

  const selectedTruck = useMemo(() => {
    return TRUCK_OPTIONS.find(t => t.id === selectedTruckId) || TRUCK_OPTIONS[0];
  }, [selectedTruckId]);

  // Truck volume in m³
  const truckVolumeM3 = useMemo(() => {
    return (selectedTruck.dimensions.length * selectedTruck.dimensions.width * selectedTruck.dimensions.height) / 1_000_000;
  }, [selectedTruck]);

  // Total Cargo Volume in m³
  const totalCargoVolumeM3 = useMemo(() => {
    return items.reduce((acc, item) => {
      const volOne = (item.length * item.width * item.height) / 1_000_000;
      return acc + (volOne * item.quantity);
    }, 0);
  }, [items]);

  // Total Cargo Weight in kg
  const totalCargoWeightKg = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
  }, [items]);

  // Total Box Count
  const totalBoxCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  // Volumetric utilization %
  const volumeUtilization = Math.min(100, Math.round((totalCargoVolumeM3 / truckVolumeM3) * 100));
  // Payload utilization %
  const weightUtilization = Math.min(100, Math.round((totalCargoWeightKg / selectedTruck.maxWeight) * 100));

  const isOverweight = totalCargoWeightKg > selectedTruck.maxWeight;
  const isOverVolume = totalCargoVolumeM3 > truckVolumeM3;

  const handleAddBox = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(boxL) || 10;
    const w = parseFloat(boxW) || 10;
    const h = parseFloat(boxH) || 10;
    const wt = parseFloat(boxWeight) || 1;
    const q = parseInt(boxQty, 10) || 1;

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];
    const randomColor = colors[items.length % colors.length];

    const newItem: CargoBox = {
      id: Date.now().toString(),
      name: boxName.trim() || `Carton #${items.length + 1}`,
      length: l,
      width: w,
      height: h,
      weight: wt,
      quantity: q,
      color: randomColor,
    };

    setItems([...items, newItem]);
    setBoxName('');
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    const newItems = preset.items.map((item, idx) => ({
      ...item,
      id: `${Date.now()}-${idx}`,
    }));
    setItems(newItems);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Free Instant Space Calculator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Will Your Cargo Fit?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select a vehicle, add box dimensions, and instantly verify volume utilization and weight limits. Free to test without creating an account.
        </p>
      </div>

      {/* 2. Main Two-Column Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vehicle & Cargo Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Step 1: Select Truck */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>1. Choose Transport Vehicle</span>
            </label>

            <select
              value={selectedTruckId}
              onChange={(e) => setSelectedTruckId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition"
            >
              {TRUCK_OPTIONS.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.name} — {truck.maxWeight.toLocaleString()} kg max
                </option>
              ))}
            </select>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400">Length</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedTruck.dimensions.length} cm</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Cargo Volume</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{truckVolumeM3.toFixed(1)} m³</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Max Payload</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedTruck.maxWeight} kg</p>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Try Quick Cargo Presets
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-center transition flex flex-col items-center gap-1 shadow-xs"
                >
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Add Custom Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-emerald-600" />
              <span>2. Add Custom Cargo Boxes</span>
            </label>

            <form onSubmit={handleAddBox} className="space-y-3">
              <input
                type="text"
                value={boxName}
                onChange={(e) => setBoxName(e.target.value)}
                placeholder="Carton label (e.g. Master Carton)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Length (cm)</label>
                  <input
                    type="number"
                    value={boxL}
                    onChange={(e) => setBoxL(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    required
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Width (cm)</label>
                  <input
                    type="number"
                    value={boxW}
                    onChange={(e) => setBoxW(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    required
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Height (cm)</label>
                  <input
                    type="number"
                    value={boxH}
                    onChange={(e) => setBoxH(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    required
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Weight / Box (kg)</label>
                  <input
                    type="number"
                    value={boxWeight}
                    onChange={(e) => setBoxWeight(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    required
                    min={0.1}
                    step={0.5}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Quantity</label>
                  <input
                    type="number"
                    value={boxQty}
                    onChange={(e) => setBoxQty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                    required
                    min={1}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs py-2.5 rounded-xl transition shadow-xs"
              >
                + Add Box to Container
              </button>
            </form>
          </div>

          {/* Current Cargo List Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Loaded Items ({items.length})</span>
              <button
                onClick={() => setItems([])}
                className="text-[10px] text-red-500 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear All
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="truncate">
                    <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                      {item.length}×{item.width}×{item.height} cm • {item.weight}kg
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="bg-slate-100 dark:bg-slate-800 font-bold font-mono px-2 py-0.5 rounded text-[11px] text-slate-800 dark:text-slate-200">
                    ×{item.quantity}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-400 hover:text-red-500 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Fit Visualizer & Utilization Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Fit Status Callout */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${isOverweight || isOverVolume
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            }`}>
            {isOverweight || isOverVolume ? (
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {isOverweight && isOverVolume
                  ? '⚠️ Exceeds Volume & Weight Capacity'
                  : isOverweight
                    ? '⚠️ Exceeds Maximum Payload Weight'
                    : isOverVolume
                      ? '⚠️ Cargo Volume Exceeds Container Dimensions'
                      : '✅ All Cargo Fits Comfortably within Safe Limits'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isOverweight || isOverVolume
                  ? 'Consider choosing a larger truck or reducing box quantities.'
                  : `${totalBoxCount} total items packed inside ${selectedTruck.name}.`}
              </p>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 gap-4">
            {/* Volume Utilization Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-brand-500" /> Space Volume
                </span>
                <span className="font-black text-base text-slate-900 dark:text-white">
                  {volumeUtilization}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${volumeUtilization > 95 ? 'bg-amber-500' : 'bg-brand-600'
                    }`}
                  style={{ width: `${Math.min(100, volumeUtilization)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Cargo: <b>{totalCargoVolumeM3.toFixed(2)} m³</b></span>
                <span>Limit: <b>{truckVolumeM3.toFixed(1)} m³</b></span>
              </div>
            </div>

            {/* Payload Weight Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-500" /> Payload Weight
                </span>
                <span className="font-black text-base text-slate-900 dark:text-white">
                  {weightUtilization}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${weightUtilization > 100 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                  style={{ width: `${Math.min(100, weightUtilization)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Total: <b>{totalCargoWeightKg.toLocaleString()} kg</b></span>
                <span>Max: <b>{selectedTruck.maxWeight.toLocaleString()} kg</b></span>
              </div>
            </div>
          </div>

          {/* Interactive Container Visualization Canvas */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span>Interactive Container Cross-Section</span>
                </h3>
                <p className="text-[11px] text-slate-400">Visual arrangement of packed parcels inside {selectedTruck.name}</p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                2D / 3D Layout Simulation
              </span>
            </div>

            {/* Truck Bed Simulation SVG */}
            <div className="relative w-full h-64 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-end p-4">
              {/* Truck Cabin Silhouette representation */}
              <div className="absolute top-3 left-4 text-xs font-bold text-slate-400 dark:text-slate-600 flex items-center gap-1.5 select-none">
                <Truck className="w-4 h-4" />
                <span>FRONT (CABIN)</span>
              </div>

              <div className="absolute top-3 right-4 text-xs font-bold text-slate-400 dark:text-slate-600 select-none">
                <span>REAR (DOOR)</span>
              </div>

              {/* Truck Floor Line */}
              <div className="w-full border-b-2 border-dashed border-slate-300 dark:border-slate-700 mb-2" />

              {/* Simulated Box Stacks Grid */}
              <div className="flex flex-wrap items-end gap-1.5 justify-center max-h-48 overflow-hidden">
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 my-auto">No cargo added yet. Add boxes above to preview fit.</p>
                ) : (
                  items.map((item) => {
                    // Render sample visual box blocks proportional to quantity
                    const sampleCount = Math.min(item.quantity, 14);
                    return Array.from({ length: sampleCount }).map((_, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="rounded shadow-xs transition-all hover:scale-110 flex items-center justify-center text-[9px] font-mono text-white font-bold select-none"
                        style={{
                          backgroundColor: item.color,
                          width: `${Math.max(28, Math.min(56, item.length * 0.7))}px`,
                          height: `${Math.max(22, Math.min(48, item.height * 0.7))}px`,
                        }}
                        title={`${item.name} (${item.length}×${item.width}×${item.height} cm)`}
                      >
                        {item.name.charAt(0)}
                      </div>
                    ));
                  })
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pro Feature Upgrade Callout (The RBAC Hook) */}
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ready for Full Enterprise Logistics?</span>
                </div>
                <h4 className="font-bold text-base text-white">
                  Unlock Full 3D Physics Packing &amp; Multi-Modal Routing
                </h4>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  Sign in with your role (Admin or Driver) to unlock Center of Gravity (CoG) balancing, turn-by-turn road navigation, air cargo ULDs, and the complete left sidebar.
                </p>
              </div>

              <button
                onClick={showAuthModal}
                className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center gap-2"
              >
                <span>Unlock Advanced (RBAC)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
