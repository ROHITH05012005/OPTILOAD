import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Lock, Sparkles, Mail, User, Shield, Briefcase,
  Building, LogIn, UserPlus, Truck, Compass, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  auth, googleProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, db, doc, setDoc, getDoc, serverTimestamp
} from '../services/firebase';

type RoleType = 'admin' | 'driver'; // | 'manager' | 'dealer';

const rbacRoles: { key: RoleType; label: string; desc: string; icon: any; color: string }[] = [
  { key: 'admin',   label: 'Fleet Admin',    desc: 'Full control & command center', icon: Shield,    color: 'from-red-500 to-orange-500' },
  // { key: 'manager', label: 'Depot Manager',  desc: 'Dispatch & warehouse telemetry', icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
  // { key: 'dealer',  label: 'Dealership',     desc: 'Shipment booking & stock items', icon: Building,  color: 'from-purple-500 to-pink-500' },
  { key: 'driver',  label: 'Driver Console', desc: 'Turn-by-turn routes & delivery', icon: Compass,   color: 'from-emerald-500 to-teal-500' },
];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, hideAuthModal, refreshAuth } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<RoleType>('admin');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (!isAuthModalOpen) return null;

  const completeSession = async (user: any, roleToUse: RoleType) => {
    let finalRole = roleToUse;
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data()?.role) {
        finalRole = snap.data().role as RoleType;
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
      console.warn('Firestore sync notice:', e);
    }

    localStorage.setItem('userRole', finalRole);
    localStorage.setItem('optiload_authenticated', 'true');
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

    refreshAuth();
    hideAuthModal();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (authMode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        await completeSession(cred.user, selectedRole);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await completeSession(cred.user, selectedRole);
      }
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential')
        setError('Invalid email or password.');
      else if (code === 'auth/email-already-in-use') setError('Email already registered. Sign in instead.');
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else if (code === 'auth/invalid-email') setError('Please enter a valid email address.');
      else setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await completeSession(result.user, selectedRole);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') setError('Popup closed. Please try again.');
      else setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(14px)', background: 'rgba(2,6,23,0.80)' }}
      onClick={(e) => { if (e.target === e.currentTarget) hideAuthModal(); }}
    >
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden animate-modal-in max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Top Accent Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-brand-500" />

        {/* Close button */}
        <button
          onClick={hideAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-purple-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Enterprise RBAC Access</span>
              </div>
              <p className="text-white font-bold text-lg leading-tight">
                {authMode === 'signin' ? 'Sign in to OptiLoad Pro' : 'Create Enterprise Account'}
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-xs mb-5 leading-relaxed">
            Unlocks the left sidebar navigation, multi-modal air/sea optimizers, reinforcement learning route planner, and live fleet telemetry.
          </p>

          {/* Mode Toggle */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 mb-5">
            {(['signin', 'signup'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setAuthMode(mode); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  authMode === mode
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'signin' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* RBAC Role Selector */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Your Operational Role (RBAC)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {rbacRoles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedRole(r.key)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight text-white">{r.label}</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3 mb-4">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {authMode === 'signup' && (
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Full Name"
                  required={authMode === 'signup'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Work Email address"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password (min. 6 characters)"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg disabled:opacity-60 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : authMode === 'signin' ? (
                `Sign In as ${selectedRole.toUpperCase()}`
              ) : (
                `Register as ${selectedRole.toUpperCase()}`
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-slate-900 px-2 text-slate-500 uppercase">or</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Just testing basic tools?{' '}
            <button onClick={hideAuthModal} className="text-purple-400 hover:underline font-medium">
              Continue as Free Guest
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.22s ease-out both; }
      `}</style>
    </div>
  );
};
