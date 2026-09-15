import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'driver' | 'manager' | 'dealer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isLoggedIn, userRole, showAuthModal } = useAuth();

  // If user is not logged in, pop open the sign-in modal automatically
  useEffect(() => {
    if (!isLoggedIn) {
      showAuthModal();
    }
  }, [isLoggedIn, showAuthModal]);

  // If not logged in, render an elegant locked screen with quick action to open modal
  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Advanced Feature</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            This module (AI 3D Packing, Multi-Modal RL Routing &amp; Telemetry) is an advanced tool. Sign in or create a free account to unlock it.
          </p>

          <div className="space-y-3">
            <button
              onClick={showAuthModal}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/dashboard"
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition"
            >
              <Home className="w-4 h-4" />
              <span>Back to Free Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If a specific role is required and doesn't match
  if (requiredRole && userRole !== requiredRole) {
    if (userRole === 'admin' || userRole === 'manager' || userRole === 'dealer') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'driver') {
      return <Navigate to="/driver" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};