'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      <p className="text-white text-sm">Loading...</p>
    </div>
  </div>
);

export default function AdminLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't apply admin protection to login-related routes
  const isLoginRoute = pathname === '/admin' || pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !isLoginRoute) {
      let shouldRedirect = false;
      let redirectPath = '';

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        shouldRedirect = true;
        redirectPath = '/login';
      }
      // If authenticated but not admin, redirect to user dashboard
      else if (user?.role !== 'admin') {
        shouldRedirect = true;
        redirectPath = '/dashboard';
      }

      if (shouldRedirect) {
        // Add a small delay to prevent flash and allow components to unmount properly
        const timer = setTimeout(() => {
          router.replace(redirectPath);
        }, 50);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, isAuthenticated, router, isLoginRoute]);

  // For login routes, just render children without protection
  if (isLoginRoute) {
    return children;
  }

  // Show loading while checking auth
  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, return null (let redirect happen)
  if (!isAuthenticated) {
    return null;
  }

  // If not admin, return null (let redirect happen)
  if (user?.role !== 'admin') {
    return null;
  }

  // User is authenticated and is admin, render children
  return children;
}
