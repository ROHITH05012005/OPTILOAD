import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Truck, Lock, LogIn, Sparkles, Box, Compass } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { useLocation, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, showAuthModal } = useAuth();

  const pathTitles: Record<string, string> = {
    '/dashboard': 'Executive Mission Control',
    '/admin': 'Logistics Command Center',
    '/driver': 'Driver Mobile Console',
    '/inventory': 'Cargo Inventory Management',
    '/trucks': 'Commercial Fleet Specifications',
    '/optimizer': '3D Truck Load Optimizer',
    '/air-optimizer': 'Air Cargo ULD Optimizer',
    '/sea-optimizer': 'Maritime Container Optimizer',
    '/route': 'Road Logistics Route Planner',
    '/air-route': 'Air Flight Route Planner',
    '/sea-route': 'Maritime Sea-Lane Planner',
    '/performance': 'AI Model Analytics & SHAP',
  };

  const pageTitle = pathTitles[location.pathname] || 'OptiLoad Enterprise';

  // -------------------------------------------------------------
  // GUEST MODE: NO SIDEBAR AT ALL. Clean, full-width top navbar.
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
        {/* Guest Clean Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-6 sm:gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-tr from-brand-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  Opti<span className="text-brand-500">Load</span>
                  <span className="text-[9px] bg-brand-500/10 text-brand-600 dark:text-brand-300 font-bold px-1 rounded border border-brand-500/20">FREE</span>
                </span>
                <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">Quick Estimator</span>
              </div>
            </Link>

            {/* Quick Guest Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition ${isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                Free 3D Estimator
              </NavLink>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            <DarkModeToggle />

            <button
              onClick={showAuthModal}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

            {/* Guest Full-Width Canvas */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>

            {/* Clean Guest Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">OptiLoad India</span>
                <span>— Free 3D Cargo Space Estimator</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span>Need Multi-Modal RL Routing &amp; Telemetry?</span>
                <button
                  onClick={showAuthModal}
                  className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
                >
                  Sign In (Role Access)
                </button>
              </div>
            </footer>
          </div>
          );
  }

          // -------------------------------------------------------------
          // AUTHENTICATED MODE: FULL ENTERPRISE WORKSPACE WITH SIDEBAR
          // -------------------------------------------------------------
          return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 transition-colors">
            {/* Enterprise Left Sidebar */}
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Main Enterprise Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
              {/* Mobile Header Bar */}
              <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setMobileOpen(true)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    aria-label="Open Navigation Menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-600 p-1.5 rounded-md">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xs tracking-tight">{pageTitle}</span>
                  </div>
                </div>
                <DarkModeToggle />
              </header>

              {/* Page Content Canvas */}
              <main className="flex-1 p-3 md:p-5 lg:p-6 max-w-[1920px] w-full mx-auto">
                {children}
              </main>

              {/* Global Enterprise Footer */}
              <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-300">OptiLoad India</span>
                  <span>— AI Multi-Modal Logistics & 3D Load Optimization Platform</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    FastAPI + PyTorch Active
                  </span>
                  <span>&copy; {new Date().getFullYear()} OptiLoad Technologies</span>
                </div>
              </footer>
            </div>
          </div>
          );
};