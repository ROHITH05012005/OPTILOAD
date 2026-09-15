import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Truck, Package, Map, Box, X,
  BarChart3, TrendingUp, Anchor, Navigation, Plane,
  Waves, ChevronLeft, ChevronRight, LogOut,
  Shield, LogIn, Sparkles
} from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isLoggedIn, userRole, username, showAuthModal, logout } = useAuth();
  const isAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'dealer';

  const isActive = (path: string) => location.pathname === path;

  const navGroups = [
    {
      title: 'Operations',
      items: [
        ...(!isAdmin ? [{ name: 'Dashboard', path: '/dashboard', icon: BarChart3, badge: 'Free', isPro: false }] : []),
        { name: 'Command Center', path: '/admin', icon: Shield, badge: isLoggedIn ? null : 'Pro 🔒', isPro: !isLoggedIn },
        { name: 'AI Analytics', path: '/performance', icon: TrendingUp, badge: isLoggedIn ? 'AI' : 'Pro 🔒', isPro: !isLoggedIn },
      ]
    },
    {
      title: '3D Packing',
      items: [
        { name: '3D Truck Load', path: '/optimizer', icon: Box, badge: isLoggedIn ? 'Land' : 'Pro 🔒', isPro: !isLoggedIn },
        { name: 'Air Cargo ULD', path: '/air-optimizer', icon: Plane, badge: isLoggedIn ? 'Air' : 'Pro 🔒', isPro: !isLoggedIn },
        { name: 'Sea Container', path: '/sea-optimizer', icon: Anchor, badge: isLoggedIn ? 'Sea' : 'Pro 🔒', isPro: !isLoggedIn },
      ]
    },
    {
      title: 'Multi-Modal Routing',
      items: [
        { name: 'Road Routes (RL)', path: '/route', icon: Map, badge: isLoggedIn ? null : 'Pro 🔒', isPro: !isLoggedIn },
        { name: 'Air Routes', path: '/air-route', icon: Navigation, badge: isLoggedIn ? null : 'Pro 🔒', isPro: !isLoggedIn },
        { name: 'Sea Sea-Lanes', path: '/sea-route', icon: Waves, badge: isLoggedIn ? null : 'Pro 🔒', isPro: !isLoggedIn },
      ]
    },
    {
      title: 'Assets & Fleet',
      items: [
        { name: 'Cargo Inventory', path: '/inventory', icon: Package, badge: 'Free', isPro: false },
        { name: 'Fleet Trucks', path: '/trucks', icon: Truck, badge: 'Free', isPro: false },
        { name: 'Book Shipment', path: '/book', icon: Box, badge: 'Free', isPro: false },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/90 relative">
        <Link 
          to={isAdmin ? "/admin" : "/dashboard"} 
          className={`flex items-center gap-2.5 group ${collapsed && !mobileOpen ? 'w-full justify-center' : ''}`}
          title={isAdmin ? "OptiLoad Command Center" : "OptiLoad Dashboard"}
        >
          <div className="bg-gradient-to-tr from-brand-600 to-blue-500 p-2 rounded-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Truck className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Opti<span className="text-brand-500">Load</span>
                <span className="text-[9px] bg-brand-500/10 text-brand-600 dark:text-brand-300 font-bold px-1 rounded border border-brand-500/20">IN</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider">AI LOGISTICS</span>
            </div>
          )}
        </Link>

        {/* Desktop Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden md:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all ${
            collapsed 
              ? 'absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md rounded-full p-1 z-50 text-slate-600 dark:text-slate-300 hover:scale-110'
              : ''
          }`}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Status Banner */}
      {(!collapsed || mobileOpen) && (
        <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${
              isLoggedIn
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}>
              {isLoggedIn ? 'Pro Account' : 'Free Tier'}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[95px]">
              {isLoggedIn ? (username || 'Account') : 'Guest'}
            </span>
          </div>
          {!isLoggedIn && (
            <button
              onClick={showAuthModal}
              className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-bold uppercase"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Navigation Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-3 custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {(!collapsed || mobileOpen) && (
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    setMobileOpen(false);
                    if (item.isPro && !isLoggedIn) {
                      showAuthModal();
                    }
                  }}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  } ${collapsed && !mobileOpen ? 'justify-center px-1' : ''}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  {(!collapsed || mobileOpen) && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {(!collapsed || mobileOpen) && item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      active
                        ? 'bg-white/20 text-white'
                        : item.isPro
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Controls & Dark Mode */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Core AI Online
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-mono">v2.1</span>
          </div>
        )}

        <div className={`flex items-center ${collapsed && !mobileOpen ? 'flex-col gap-2' : 'justify-between'} px-1`}>
          <DarkModeToggle />
          {isLoggedIn ? (
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center gap-1.5 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              {(!collapsed || mobileOpen) && <span>Logout</span>}
            </button>
          ) : (
            <button
              onClick={showAuthModal}
              title="Sign In"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white transition-all text-xs font-semibold shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              {(!collapsed || mobileOpen) && <span>Sign In</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block flex-shrink-0 h-screen sticky top-0 transition-all duration-200 z-40 ${
          collapsed ? 'w-20' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-xs h-full z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
