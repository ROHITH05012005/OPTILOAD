import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  userRole: string | null;
  username: string | null;
}

interface AuthContextType extends AuthState {
  /** Call this to pop open the sign-in modal from anywhere in the app */
  showAuthModal: () => void;
  hideAuthModal: () => void;
  isAuthModalOpen: boolean;
  /** Call after a successful login to refresh context state */
  refreshAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    userRole: null,
    username: null,
  });

  const readAuth = useCallback((): AuthState => {
    // Check clean session state (defaults to false for any new/guest visitor)
    const isAuth = localStorage.getItem('optiload_authenticated') === 'true';
    return {
      isLoggedIn: isAuth,
      userRole: isAuth ? localStorage.getItem('userRole') : null,
      username: isAuth ? localStorage.getItem('username') : null,
    };
  }, []);

  useEffect(() => {
    // Clear any stale legacy keys from old builds so all visitors start as clean guests
    localStorage.removeItem('isLoggedIn');

    setAuth(readAuth());

    // Listen for storage events (cross-tab login/logout)
    const handleStorage = () => setAuth(readAuth());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [readAuth]);

  const refreshAuth = useCallback(() => {
    setAuth(readAuth());
    setIsAuthModalOpen(false);
  }, [readAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('optiload_authenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    localStorage.removeItem('logiload_jwt_token');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhoto');
    localStorage.removeItem('isLoggedIn');
    setAuth({ isLoggedIn: false, userRole: null, username: null });
  }, []);

  const showAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const hideAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        isAuthModalOpen,
        showAuthModal,
        hideAuthModal,
        refreshAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
