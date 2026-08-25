import React, { useState, useEffect } from 'react';
import { Truck, Navigation, Plus, Search, AlertCircle, Locate, X, Leaf, Zap, Clock } from 'lucide-react';
import { optimizeRoute } from '../services/routing';
import { RouteStop, RouteResult } from '../types';
import { RouteMap } from '../components/RouteMap';
import { LocationAutocomplete } from '../components/LocationAutocomplete';

export const RoutePlanner: React.FC = () => {
  const [stops, setStops] = useState<RouteStop[]>([
    { id: '1', address: 'Bandra West, Mumbai', city: 'Mumbai, Maharashtra', lat: 19.0596, lng: 72.8295 },
    { id: '2', address: 'Hinjawadi, Pune', city: 'Pune, Maharashtra', lat: 18.5912, lng: 73.7389 }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string>('');
  const [optimizerMode, setOptimizerMode] = useState<'fastest' | 'eco'>('fastest');

  useEffect(() => {
    handleOptimize();
  }, []);

  const addStop = () => {
    setStops([...stops, { id: Date.now().toString(), address: '', city: '' }]);
  };

  const deleteStop = (index: number) => {
    if (stops.length <= 2) {
      setError('A minimum of 2 stops is required for route planning.');
      return;
    }
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const updateStopLocation = (index: number, locationData: { address: string; city: string; lat: number; lng: number }) => {
    const newStops = [...stops];
    newStops[index] = {
      ...newStops[index],
      address: locationData.address,
      city: locationData.city,
      lat: locationData.lat,
      lng: locationData.lng
    };
    setStops(newStops);
  };

  const handleOptimize = async () => {
    if (stops.length < 2) {
      setError('Please add at least 2 stops to optimize a route.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await optimizeRoute('Start', stops, optimizerMode);
      setResult(res);
    } catch (err: any) {
      console.error('Route optimization error:', err);
      setError(err?.message || 'Failed to optimize route. Please check location inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
              <Truck className="w-8 h-8 text-brand-200" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Land Cargo Route Planner</h1>
              <p className="text-brand-100 text-sm">Optimize multi-stop truck routes with real-time road topology & eco-savings</p>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-black/20 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setOptimizerMode('fastest')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              optimizerMode === 'fastest'
                ? 'bg-white text-brand-900 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            Fastest Route
          </button>
          <button
            onClick={() => setOptimizerMode('eco')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              optimizerMode === 'eco'
                ? 'bg-white text-brand-900 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-500" />
            Eco Route
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stops & Inputs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-brand-600" />
                Route Waypoints
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold dark:bg-brand-900/30 dark:text-brand-300">
                {stops.length} Stops
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {stops.map((stop, index) => (
                <div
                  key={stop.id || index}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {index === 0 ? '🟢 Origin' : index === stops.length - 1 ? '🔴 Destination' : `📍 Stop #${index + 1}`}
                    </span>
                    {stops.length > 2 && (
                      <button
                        onClick={() => deleteStop(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove Stop"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <LocationAutocomplete
                    value={stop.address || stop.city}
                    onChange={(val) => {
                      const newStops = [...stops];
                      newStops[index].address = val;
                      setStops(newStops);
                    }}
                    onSelectLocation={(loc) => updateStopLocation(index, loc)}
                    placeholder={index === 0 ? "Select starting location..." : "Select destination/stop..."}
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={addStop}
                className="flex-1 py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium text-sm hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Waypoint
              </button>
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Calculate Route
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Metric Overview Cards */}
          {result && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">
                  <Navigation className="w-4 h-4 text-brand-600" /> Total Distance
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round(result.totalDistanceKm)} km
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1">
                  <Clock className="w-4 h-4 text-indigo-600" /> Est. Duration
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(result.totalDurationMins / 60)}h {result.totalDurationMins % 60}m
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Road Routing Topology</span>
              {optimizerMode === 'eco' && (
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" /> Eco-Mode Active (~12% Fuel Saved)
                </span>
              )}
            </h2>
            <RouteMap
              stops={result?.stops || stops}
              geometry={result?.overviewPolyline}
              intermodalGeometry={result?.intermodalPolyline}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default RoutePlanner;
