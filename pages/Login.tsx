import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, User, Shield, Package, MapPin, BarChart3, Briefcase, Building, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle } from '../services/firebase';
import { syncUserProfile, UserRole } from '../services/firestore';

export const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize login view without destructive wipe
  useEffect(() => {
    setError('');
  }, []);

  const handleDemoLogin = (roleToUse: UserRole = selectedRole) => {
    localStorage.setItem('userRole', roleToUse);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userUid', `demo_${roleToUse}_99`);
    localStorage.setItem('userName', `Demo ${roles.find(r => r.id === roleToUse)?.title || 'User'}`);
    localStorage.setItem('userEmail', `demo.${roleToUse}@optiload.io`);
    
    if (roleToUse === 'driver') {
      localStorage.setItem('driverId', 'demo_driver_99');
      localStorage.setItem('driverName', 'Demo Driver');
      navigate('/driver');
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      if (user) {
        // Sync with Firestore database to get or create verified profile
        const profile = await syncUserProfile(
          user.uid,
          user.email || '',
          user.displayName || '',
          user.photoURL || '',
          selectedRole
        );

        const activeRole = profile.role || selectedRole;
        localStorage.setItem('userRole', activeRole);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userUid', user.uid);
        localStorage.setItem('userName', profile.displayName || user.displayName || 'User');
        localStorage.setItem('userEmail', user.email || '');
        if (profile.photoURL) {
          localStorage.setItem('userPhoto', profile.photoURL);
        }

        // Role-based redirect
        if (activeRole === 'driver') {
          localStorage.setItem('driverId', user.uid);
          localStorage.setItem('driverName', profile.displayName || 'Driver');
          navigate('/driver');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Firebase Auth is not yet configured. You can use the 1-Click Demo Login below!');
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please select your Google account in the popup.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setError('Sign-in in progress. Please check your popup windows.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError(`Domain '${window.location.hostname}' is not authorized in Firebase. Add '${window.location.hostname}' to Firebase Console > Authentication > Settings > Authorized domains, or use the 1-Click Demo Login below.`);
      } else {
        setError(err?.message || 'Google Sign-In failed. Try the 1-Click Demo Login below.');
      }
    } finally {
      setLoading(false);
    }
  };


  const roles = [
    {
      id: 'admin' as UserRole,
      title: 'Administrator',
      desc: 'Full fleet control, packing algorithms & financials',
      icon: Shield,
      color: 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400',
      activeColor: 'border-red-500 ring-2 ring-red-500/50 bg-red-500/10'
    },
    {
      id: 'manager' as UserRole,
      title: 'Logistics Manager',
      desc: 'Multi-modal dispatching & route optimization',
      icon: Briefcase,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
      activeColor: 'border-blue-500 ring-2 ring-blue-500/50 bg-blue-500/10'
    },
    {
      id: 'dealer' as UserRole,
      title: 'Dealer / Shipper',
      desc: 'Cargo booking, load planning & live tracking',
      icon: Building,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      activeColor: 'border-purple-500 ring-2 ring-purple-500/50 bg-purple-500/10'
    },
    {
      id: 'driver' as UserRole,
      title: 'Fleet Driver',
      desc: 'Turn-by-turn navigation & load manifests',
      icon: User,
      color: 'from-green-500/20 to-teal-500/20 border-green-500/30 text-green-400',
      activeColor: 'border-green-500 ring-2 ring-green-500/50 bg-green-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Auth & Role Selection */}
        <div className="w-full lg:w-1/2 bg-gray-900 p-8 lg:p-12 relative flex flex-col justify-between">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Sign In to OptiLoad 3D</h2>
              <p className="text-gray-400 mb-6">Choose your workspace role and authenticate securely</p>
            </div>

            {error && (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 mb-6">
                <p className="text-amber-400 text-sm">{error}</p>
              </div>
            )}

            {/* Role Grid */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Select Your Workspace Role:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? r.activeColor
                          : 'bg-gray-800/60 border-gray-700/60 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                          {r.title}
                        </p>
                        <p className="text-[11px] text-gray-400 line-clamp-1">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-3.5 px-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg border border-gray-200 active:scale-[0.99] mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {loading ? 'Authenticating with Google...' : `Sign in with Google as ${roles.find(r => r.id === selectedRole)?.title}`}
            </button>

            {/* Instant Demo Login Button */}
            <button
              onClick={() => handleDemoLogin(selectedRole)}
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.99]"
            >
              <span>⚡</span> 1-Click Instant Demo as {roles.find(r => r.id === selectedRole)?.title}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Secured with Google Cloud Firestore & Firebase Auth • © {new Date().getFullYear()} OptiLoad 3D
            </p>
          </div>
        </div>

        {/* Right Side - Visual Showcase */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]"></div>
          <div className="relative z-10 text-center max-w-md">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Enterprise Cloud Logistics</h1>
            <p className="text-sm text-white/90 mb-8">
              Multi-modal 3D bin packing, aircraft balance HUD & real-time dispatching.
            </p>

            <div className="space-y-3.5 text-left bg-black/20 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Real-Time Firestore Sync</p>
                  <p className="text-[11px] text-white/80">User roles and manifests backed up to cloud</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Role-Based Access Control</p>
                  <p className="text-[11px] text-white/80">Admins, Managers, Dealers, and Drivers</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Zero Password Weakness</p>
                  <p className="text-[11px] text-white/80">Protected by Google OAuth 2.0 Security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
