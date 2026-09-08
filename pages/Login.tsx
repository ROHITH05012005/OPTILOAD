import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, User, Shield, Package, ArrowLeft, Briefcase, Building, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  db, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from '../services/firebase';

type RoleType = 'admin' | 'manager' | 'dealer' | 'driver';

export const Login: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<RoleType>('dealer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any existing session on page mount
  useEffect(() => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhoto');
    localStorage.removeItem('username');
  }, []);

  const completeUserSession = async (user: any, fallbackRole: RoleType) => {
    let finalRole = fallbackRole;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data()?.role) {
        finalRole = userSnap.data().role as RoleType;
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || name || user.email?.split('@')[0],
          photoURL: user.photoURL || '',
          role: finalRole,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore user profile sync warning:', e);
    }

    localStorage.setItem('userRole', finalRole);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', user.displayName || name || user.email?.split('@')[0] || 'User');
    localStorage.setItem('userEmail', user.email || '');
    if (user.photoURL) localStorage.setItem('userPhoto', user.photoURL);

    if (finalRole === 'driver') {
      localStorage.setItem('driverId', user.uid);
      localStorage.setItem('driverName', user.displayName || 'Driver');
      navigate('/driver');
    } else {
      navigate('/admin');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'signup') {
        if (!name.trim()) {
          setError('Please provide your full name');
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        await completeUserSession(cred.user, selectedRole);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await completeUserSession(cred.user, selectedRole);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you do not have an account, click "Create Account".');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await completeUserSession(result.user, selectedRole);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console -> Authentication -> Authorized Domains.');
      } else {
        setError(err.message || 'Failed to authenticate with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  // All roles available for sign-in
  const allRoles: { key: RoleType; label: string; icon: any; color: string }[] = [
    { key: 'admin', label: 'Admin', icon: Shield, color: 'from-red-500 to-orange-500' },
    { key: 'manager', label: 'Manager', icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
    { key: 'dealer', label: 'Dealer', icon: Building, color: 'from-purple-500 to-pink-500' },
    { key: 'driver', label: 'Driver', icon: User, color: 'from-emerald-500 to-teal-500' },
  ];

  // Only public roles available for registration (Admin/Manager are invite-only)
  const publicRoles: { key: RoleType; label: string; icon: any; color: string }[] = [
    { key: 'dealer', label: 'Dealer', icon: Building, color: 'from-purple-500 to-pink-500' },
    { key: 'driver', label: 'Driver', icon: User, color: 'from-emerald-500 to-teal-500' },
  ];

  const roles = authMode === 'signup' ? publicRoles : allRoles;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Form Section */}
        <div className="w-full lg:w-1/2 bg-slate-900 p-8 lg:p-12 relative flex flex-col justify-between">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            {/* Auth Mode Toggle (Sign In vs Sign Up) */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  authMode === 'signin' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { 
                  setAuthMode('signup'); 
                  setError(''); 
                  // Reset to a public role when switching to registration
                  if (selectedRole === 'admin' || selectedRole === 'manager') {
                    setSelectedRole('dealer');
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  authMode === 'signup' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" /> Create Account
              </button>
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                {authMode === 'signin' ? 'Sign in to OptiLoad' : 'Create your OptiLoad account'}
              </h2>
              <p className="text-slate-400 text-sm mb-5">
                {authMode === 'signin' 
                  ? 'Access multi-modal routing, 3D cargo planning & fleet analytics' 
                  : 'Get started with real-time logistics intelligence'}
              </p>
            </div>

            {/* Role Picker (Sets role in Firebase Firestore) */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {authMode === 'signup' ? 'I am registering as a' : 'Sign in as'}
              </label>
              <div className={`grid gap-2 ${authMode === 'signup' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setSelectedRole(r.key)}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all text-xs font-medium ${
                        isSelected 
                          ? 'bg-purple-500/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500' 
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                      {r.label}
                    </button>
                  );
                })}
              </div>
              {authMode === 'signup' && (
                <p className="text-xs text-slate-500 mt-2">
                  🔒 Admin &amp; Manager accounts are created by invitation only.
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 mb-4">
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Real Firebase Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                      placeholder="Rohith Kumar"
                      required={authMode === 'signup'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                    placeholder="user@optiload.in"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing with Firebase...</span>
                  </div>
                ) : (
                  authMode === 'signin' ? `Sign In as ${selectedRole.toUpperCase()}` : `Create Account`
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Real Google Auth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500">
              Firebase Auth & Cloud Firestore Active • OptiLoad India
            </p>
          </div>
        </div>

        {/* Right Side - Brand Banner */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">OptiLoad India</span>
          </div>

          <div className="relative z-10 my-auto py-8">
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
              Enterprise Cloud
            </div>
            <h3 className="text-3xl font-extrabold mb-4 leading-tight">
              AI Multi-Modal Load Optimization & Logistics
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed max-w-md">
              Secure access for fleet administrators, depot managers, registered dealerships, and mobile drivers with real-time GPS telemetry and cloud sync.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-4">
            <span>Production v2.4</span>
            <span>Project: optiload-3d</span>
          </div>
        </div>
      </div>
    </div>
  );
};
