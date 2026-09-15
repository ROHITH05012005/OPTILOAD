import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Box,
  ArrowRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Map,
  Plane,
  Anchor,
  Shield,
  Zap,
  PackageCheck,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GuestEstimator } from '../components/GuestEstimator';
import { LandingChatbot } from '../components/LandingChatbot';

export const Dashboard: React.FC = () => {
  const { isLoggedIn, showAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleProClick = (path: string) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      showAuthModal();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-2 text-slate-900 dark:text-slate-100">
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 sm:p-10 text-white shadow-xl">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>OptiLoad India • Smart Logistics Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Smart 3D Cargo Packing &amp; Freight Optimization
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Test your box dimensions in our free 3D space calculator below. Manage cargo inventory or sign in to run complete multi-modal route planning and machine learning models.
          </p>

          {/* Quick CTA row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">

            <button
              onClick={() => handleProClick('/optimizer')}
              className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-brand-600/25 transition flex items-center gap-2"
            >
              <span>Try 3D Load Optimizer</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {!isLoggedIn && (
              <button
                onClick={showAuthModal}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 transition underline underline-offset-4"
              >
                Already have an account? Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Free 3D Cargo Space Estimator */}
      <section id="guest-estimator-section" className="space-y-4 scroll-mt-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Free 3D Cargo Space Estimator</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Instant Fit Test
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add carton dimensions below to instantly calculate volume utilization, weight capacity, and 2D/3D arrangement.
            </p>
          </div>
          <Link
            to="/inventory"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>Open Inventory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <GuestEstimator />
      </section>

      {/* 3. Advanced Modules (Available after Sign-in) */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Advanced Logistics Modules</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {isLoggedIn ? '(Unlocked)' : '(Sign In to Access)'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with your account to access enterprise route planning, multi-modal air/sea, and AI models.
            </p>
          </div>

          {!isLoggedIn && (
            <button
              onClick={showAuthModal}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Sign in to unlock</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 3D Truck */}
          <button
            onClick={() => handleProClick('/optimizer')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/40 p-4 rounded-xl text-left transition flex items-center gap-3 shadow-xs hover:shadow-md group"
          >
            <div className="p-2.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">3D Truck Optimizer</p>
              <p className="text-[11px] text-slate-400 truncate">Physics Wall-Fill & CoG</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
          {/* Air */}
          <button
            onClick={() => handleProClick('/air-optimizer')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl text-left transition flex items-center gap-3 shadow-sm group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Air Cargo ULD</p>
              <p className="text-[11px] text-slate-400 truncate">Contour Boeing/Airbus</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Sea */}
          <button
            onClick={() => handleProClick('/sea-optimizer')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl text-left transition flex items-center gap-3 shadow-sm group"
          >
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Anchor className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Sea Container</p>
              <p className="text-[11px] text-slate-400 truncate">20ft / 40ft ISO Shipping</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Route */}
          <button
            onClick={() => handleProClick('/route')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl text-left transition flex items-center gap-3 shadow-sm group"
          >
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Map className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Route Planning</p>
              <p className="text-[11px] text-slate-400 truncate">Multi-stop Road Routing</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Performance */}
          <button
            onClick={() => handleProClick('/performance')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl text-left transition flex items-center gap-3 shadow-sm group"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">AI Performance</p>
              <p className="text-[11px] text-slate-400 truncate">Model Metrics &amp; SHAP</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Autonomous Floating Copilot Chatbot */}
      <LandingChatbot />
    </div>
  );
};