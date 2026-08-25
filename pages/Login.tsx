import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, User, Shield, Package, MapPin, BarChart3, Briefcase, Building } from 'lucide-react';
import { signInWithGoogle, isFirebaseConfigured } from '../services/firebase';

export const Login: React.FC = () => {
  const [userType, setUserType] = useState<'admin' | 'driver' | 'manager' | 'dealer' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any existing session when accessing login page
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleGoogleLogin = async (selectedRole?: 'admin' | 'driver' | 'manager' | 'dealer') => {
    setLoading(true);
    setError('');
    const roleToAssign = selectedRole || userType || 'admin';
    try {
      const user = await signInWithGoogle();
      if (user) {
        localStorage.setItem('userRole', roleToAssign);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', user.displayName || user.email || 'Google User');
        localStorage.setItem('userEmail', user.email || '');
        if (roleToAssign === 'driver') {
          localStorage.setItem('driverId', user.uid);
          localStorage.setItem('driverName', user.displayName || 'Driver');
          navigate('/driver');
        } else {
          navigate('/admin');
        }
      } else {
        setError('Firebase Auth is not yet configured.');
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        // User just closed popup, no need to show scary error
        setError('Sign-in cancelled. Please select your Google account in the popup.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        // Popup was triggered multiple times
        setError('Sign-in in progress. Please check your popup windows.');
      } else {
        setError(err?.message || 'Google Sign-In failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Form */}
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
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400 mb-6">Sign in securely with your Google Account</p>
            </div>

            {error && (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 mb-6">
                <p className="text-amber-400 text-sm">{error}</p>
              </div>
            )}

            {!userType ? (
              <div className="space-y-4">
                {/* Main Google Sign in */}
                <button
                  onClick={() => handleGoogleLogin('admin')}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-3.5 px-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg border border-gray-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  {loading ? 'Signing in...' : 'Quick Sign-In with Google'}
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-800"></div>
                  <span className="px-3 text-xs text-gray-500 font-semibold uppercase">Or Sign In with Role</span>
                  <div className="flex-1 border-t border-gray-800"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGoogleLogin('admin')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 hover:border-red-500 rounded-xl text-white font-semibold transition-all group hover:scale-[1.02]"
                  >
                    <Shield className="w-5 h-5 text-red-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-red-300">Admin Sign In</span>
                  </button>

                  <button
                    onClick={() => handleGoogleLogin('manager')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 hover:border-blue-500 rounded-xl text-white font-semibold transition-all group hover:scale-[1.02]"
                  >
                    <Briefcase className="w-5 h-5 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-blue-300">Manager Sign In</span>
                  </button>

                  <button
                    onClick={() => handleGoogleLogin('dealer')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500 rounded-xl text-white font-semibold transition-all group hover:scale-[1.02]"
                  >
                    <Building className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-purple-300">Dealer Sign In</span>
                  </button>

                  <button
                    onClick={() => handleGoogleLogin('driver')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 hover:border-green-500 rounded-xl text-white font-semibold transition-all group hover:scale-[1.02]"
                  >
                    <User className="w-5 h-5 text-green-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-green-300">Driver Sign In</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Secured by Google Firebase Authentication • © {new Date().getFullYear()} OptiLoad 3D
            </p>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <Truck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">OptiLoad 3D</h1>
            <p className="text-lg text-white/90 mb-12">
              Master your logistics with AI-powered optimization and real-time tracking
            </p>

            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold">AI-powered load optimization</p>
                  <p className="text-sm text-white/80">Maximize space utilization</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold">Real-time route planning</p>
                  <p className="text-sm text-white/80">Efficient delivery management</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold">Comprehensive analytics</p>
                  <p className="text-sm text-white/80">Track performance metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
