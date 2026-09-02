import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'driver' | 'manager' | 'dealer' | string;
    allowedRoles?: ('admin' | 'driver' | 'manager' | 'dealer' | string)[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    allowedRoles
}) => {
    const location = useLocation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');

    // If not logged in, strictly redirect to the login portal
    if (!isLoggedIn || !userRole) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Determine allowed roles
    const permittedRoles = allowedRoles || (requiredRole ? [requiredRole] : null);

    // If specific roles are required and user's role is not permitted
    if (permittedRoles && !permittedRoles.includes(userRole)) {
        if (userRole === 'driver') {
            return <Navigate to="/driver" replace />;
        } else if (userRole === 'dealer') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};