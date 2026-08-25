import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  Plane,
  Ship,
  Box,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe2,
  Navigation,
  Sparkles,
  Lock,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { LandingChatbot } from '../components/LandingChatbot';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Box className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-brand-300">
              OptiLoad <span className="text-brand-400 font-extrabold">3D</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/optimizer" className="hover:text-brand-400 transition-colors">3D Truck Loading</Link>
            <Link to="/air-optimizer" className="hover:text-brand-400 transition-colors">Air Cargo HUD</Link>
            <Link to="/sea-optimizer" className="hover:text-brand-400 transition-colors">Sea Hold Solver</Link>
            <Link to="/route" className="hover:text-brand-400 transition-colors font-semibold text-cyan-400">Route Planner</Link>
            <Link to="/book" className="hover:text-brand-400 transition-colors">Book Service</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/optimizer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
            >
              Launch Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Next-Gen Multi-Modal Cargo Loading & Route Optimization Engine
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Maximize Container Payload. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-cyan-300 to-indigo-400">
              Cut Fuel & Carbon Footprint.
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Real-time 3D WebGL bin-packing algorithms, center-of-gravity balance solvers for aircraft & vessels, and live road topology routing.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/optimizer')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:opacity-95 text-white font-bold text-base shadow-xl shadow-brand-500/25 flex items-center gap-3 transition-all hover:scale-105"
            >
              Start 3D Optimizer <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/route')}
              className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-base flex items-center gap-3 transition-all hover:scale-105"
            >
              <Navigation className="w-5 h-5 text-cyan-400" /> Route Planner
            </button>
          </div>
        </div>
      </section>

      {/* Multi-Modal Logistics Hub Cards */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-slate-200">
          Multi-Modal Logistics Solvers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Truck Card */}
          <div
            onClick={() => navigate('/optimizer')}
            className="group cursor-pointer p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-2 shadow-xl backdrop-blur-sm relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Truck className="w-7 h-7 text-brand-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Land Cargo 3D Optimizer</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Weight-aware 3D bin packing for 11+ Indian truck fleets. Supports axle distribution, LIFO reverse loading, and fragile cargo stacking.
            </p>
            <div className="flex items-center gap-2 text-brand-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Launch Truck Studio <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Air Card */}
          <div
            onClick={() => navigate('/air-optimizer')}
            className="group cursor-pointer p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-2 shadow-xl backdrop-blur-sm relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plane className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Air Cargo & W&B HUD</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Interactive weight & balance trim HUD for transmissive aircraft fuselages. Maintains Center of Gravity (CoG) over main wing lift zones.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Launch Air Studio <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Sea Card */}
          <div
            onClick={() => navigate('/sea-optimizer')}
            className="group cursor-pointer p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-2 shadow-xl backdrop-blur-sm relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Ship className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Sea Container Hold Solver</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Semi-transparent vessel hold visualization enforcing 70%+ floor under-support rules for heavy machinery, steel coils, and TEU containers.
            </p>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Launch Vessel Studio <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <Zap className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">98.4%</div>
            <div className="text-xs text-slate-400">Average Volume Utilization</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <BarChart3 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">18% Fuel</div>
            <div className="text-xs text-slate-400">Savings via Route Optimization</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <Globe2 className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">OSRM + Nominatim</div>
            <div className="text-xs text-slate-400">Open-Source Geo Routing</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">Axle Load Safety</div>
            <div className="text-xs text-slate-400">Legal Weight Compliance</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>OptiLoad 3D &copy; {new Date().getFullYear()} — Multi-Modal Cargo & Route Optimizer</div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Portal Login</Link>
            <Link to="/book" className="hover:text-slate-300 transition-colors">Book Service</Link>
            <Link to="/admin" className="hover:text-slate-300 transition-colors">Admin Dashboard</Link>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant Chatbot */}
      <LandingChatbot />
    </div>
  );
};
export default Landing;
