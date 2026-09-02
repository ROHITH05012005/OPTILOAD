import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  Map,
  Box,
  Menu,
  X,
  User,
  Shield,
  BarChart3,
  TrendingUp,
  Anchor,
  Navigation,
  Plane,
  Waves,
  Building,
  Briefcase,
  ChevronDown,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') || 'admin';
    setUserRole(savedRole);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchRole = (newRole: string) => {
    localStorage.setItem('userRole', newRole);
    localStorage.setItem('isLoggedIn', 'true');
    setUserRole(newRole);
    setRoleDropdownOpen(false);

    // Route to the role's primary landing workspace
    if (newRole === 'driver') {
      navigate('/driver');
    } else if (newRole === 'dealer') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // Industry-Standard Role-Specific Menus
  const adminNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Inventory', path: '/inventory', icon: <Package className="w-4 h-4" /> },
    { name: 'Trucks', path: '/trucks', icon: <Truck className="w-4 h-4" /> },
    { name: '3D Load', path: '/optimizer', icon: <Box className="w-4 h-4" /> },
    { name: 'Air Load', path: '/air-optimizer', icon: <Plane className="w-4 h-4" /> },
    { name: 'Sea Load', path: '/sea-optimizer', icon: <Anchor className="w-4 h-4" /> },
    { name: 'Road Routes', path: '/route', icon: <Map className="w-4 h-4" /> },
    { name: 'Air Routes', path: '/air-route', icon: <Navigation className="w-4 h-4" /> },
    { name: 'Sea Routes', path: '/sea-route', icon: <Waves className="w-4 h-4" /> },
    { name: 'Analytics', path: '/performance', icon: <TrendingUp className="w-4 h-4" /> },
    { name: 'Admin Hub', path: '/admin', icon: <Shield className="w-4 h-4" /> },
  ];

  const managerNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Inventory', path: '/inventory', icon: <Package className="w-4 h-4" /> },
    { name: '3D Load', path: '/optimizer', icon: <Box className="w-4 h-4" /> },
    { name: 'Air Load', path: '/air-optimizer', icon: <Plane className="w-4 h-4" /> },
    { name: 'Road Routes', path: '/route', icon: <Map className="w-4 h-4" /> },
    { name: 'Air Routes', path: '/air-route', icon: <Navigation className="w-4 h-4" /> },
    { name: 'Sea Routes', path: '/sea-route', icon: <Waves className="w-4 h-4" /> },
    { name: 'Operations Hub', path: '/admin', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Analytics', path: '/performance', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const dealerNavItems = [
    { name: 'Dealership Portal', path: '/admin', icon: <Building className="w-4 h-4" /> },
    { name: 'Book Consignment', path: '/book', icon: <CalendarCheck className="w-4 h-4" /> },
    { name: '3D Load Estimator', path: '/optimizer', icon: <Box className="w-4 h-4" /> },
    { name: 'Track Shipments', path: '/route', icon: <Map className="w-4 h-4" /> },
    { name: 'ESG Analytics', path: '/performance', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const driverNavItems = [
    { name: 'My Deliveries', path: '/driver', icon: <Truck className="w-4 h-4" /> },
    { name: 'Turn-by-Turn GPS', path: '/route', icon: <Navigation className="w-4 h-4" /> },
  ];

  const navItems = userRole === 'admin' ? adminNavItems :
                  userRole === 'manager' ? managerNavItems :
                  userRole === 'dealer' ? dealerNavItems :
                  userRole === 'driver' ? driverNavItems :
                  adminNavItems;

  const roleConfigs: Record<string, { label: string; badgeColor: string; icon: React.ReactNode }> = {
    admin: { label: 'Admin (Full Ops)', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Shield className="w-3.5 h-3.5 text-red-400" /> },
    manager: { label: 'Logistics Manager', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" /> },
    dealer: { label: 'Dealer / Shipper', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Building className="w-3.5 h-3.5 text-purple-400" /> },
    driver: { label: 'Fleet Driver', badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <User className="w-3.5 h-3.5 text-green-400" /> },
  };

  const activeRoleConfig = roleConfigs[userRole] || roleConfigs.admin;
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userUid');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-950/90 dark:bg-black/90 backdrop-blur-md text-white sticky top-0 z-50 shadow-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <div className="bg-brand-600 p-1.5 rounded-lg shadow-md shadow-brand-600/30">
              <Truck className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-xl tracking-tight text-white ml-2">
              Opti<span className="text-brand-400 font-extrabold">Load 3D</span>
            </span>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* 1-Click Interactive Role Switcher */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase rounded-lg border transition-all hover:scale-105 ${activeRoleConfig.badgeColor}`}
              >
                {activeRoleConfig.icon}
                <span>{userRole}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Workspace Role
                  </div>
                  {Object.entries(roleConfigs).map(([rKey, rCfg]) => (
                    <button
                      key={rKey}
                      onClick={() => handleSwitchRole(rKey)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        userRole === rKey
                          ? 'bg-brand-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {rCfg.icon}
                        <span>{rCfg.label}</span>
                      </div>
                      {userRole === rKey && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                  
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Nav Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive(item.path)
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="h-5 w-px bg-slate-800 mx-1"></div>
            <DarkModeToggle />
            
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
            >
              Sign Out
            </button>
          </div>


          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden items-center gap-3">
            <DarkModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 shadow-inner px-4 py-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Current Role: <span className="text-brand-400 uppercase">{userRole}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 pb-3 border-b border-slate-800">
            {Object.entries(roleConfigs).map(([rKey, rCfg]) => (
              <button
                key={rKey}
                onClick={() => {
                  handleSwitchRole(rKey);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold border ${
                  userRole === rKey
                    ? 'bg-brand-600 text-white border-brand-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {rCfg.icon}
                <span className="capitalize">{rKey}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};