import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Package, MapPin, BarChart3, Shield, Users, ArrowRight,
  Zap, TrendingUp, Clock, CheckCircle, Star, Sparkles, Globe, Box
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              OptiLoad
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:bg-cyan-50 transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-100">Next-Gen Logistics Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400 pb-2">
              Master Your Supply Chain
            </span>
            <span className="block text-4xl md:text-6xl text-slate-400 font-normal mt-2">
              with Immersive Analytics
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience the future of logistics with 3D load optimization, real-time fleet tracking,
            and AI-driven route planning. All in one premium platform.
          </p>

          <div className="flex justify-center items-center">
            <button
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-semibold text-lg text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                Intelligence
              </span> at Every Step
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Our platform combines cutting-edge technology with intuitive design to revolutionize your logistics operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Box className="w-6 h-6" />}
              title="3D Load Optimization"
              description="Visualize and optimize cargo placement with our advanced 3D bin-packing algorithm."
              color="cyan"
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Global Route Planning"
              description="AI-powered routing that considers traffic, weather, and vehicle constraints."
              color="purple"
            />
            <FeatureCard
              icon={<Truck className="w-6 h-6" />}
              title="Fleet Management"
              description="Real-time tracking and predictive maintenance for your entire fleet."
              color="blue"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Advanced Analytics"
              description="Deep insights into operational efficiency, costs, and performance metrics."
              color="green"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Enterprise Security"
              description="Bank-grade encryption and role-based access control for your data."
              color="red"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Driver Portal"
              description="Dedicated mobile-friendly interface for drivers to manage deliveries."
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-wide">OptiLoad</span>
              </div>
              <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-4">
                Next-generation intelligent logistics platform optimizing road, air, and maritime freight with real-time fleet telemetry, 3D cargo packing, and automated dispatch intelligence.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                System Operational • Cloud Firestore Realtime
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider text-slate-300">Solutions</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors text-left">3D Cargo Packing</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors text-left">Multi-Modal Route Planner</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors text-left">Live Fleet Telemetry</button></li>
                <li><button onClick={() => navigate('/book')} className="hover:text-cyan-400 transition-colors text-left">Book a Shipment</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider text-slate-300">Portals</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors text-left">Admin & Dispatch Console</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors text-left">Fleet Manager Hub</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors text-left">Dealer Inventory System</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors text-left">Commercial Driver Mobile</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
            <p>© {new Date().getFullYear()} OptiLoad India. All rights reserved.</p>
            <p className="text-slate-500">Built for Enterprise Freight & Supply Chain Management</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({ icon, title, description, color }) => {
  const colorMap: Record<string, string> = {
    cyan: 'group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/50 text-cyan-400',
    purple: 'group-hover:shadow-purple-500/20 group-hover:border-purple-500/50 text-purple-400',
    blue: 'group-hover:shadow-blue-500/20 group-hover:border-blue-500/50 text-blue-400',
    green: 'group-hover:shadow-green-500/20 group-hover:border-green-500/50 text-green-400',
    red: 'group-hover:shadow-red-500/20 group-hover:border-red-500/50 text-red-400',
    orange: 'group-hover:shadow-orange-500/20 group-hover:border-orange-500/50 text-orange-400',
  };

  return (
    <div className={`group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>
      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${colorMap[color].split(' ').pop()}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
