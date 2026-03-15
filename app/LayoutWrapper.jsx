'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Create context for sharing data with child components
const LayoutContext = createContext();

// Export hook for easy access to layout data
export const useLayoutData = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutData must be used within a LayoutProvider');
  }
  return context;
};

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      <p className="text-white text-sm">Loading...</p>
    </div>
  </div>
);

const LayoutContent = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Use user's role from auth context, with fallback
  const [role, setRole] = useState(user?.role || "user");

  // List of public routes that don't require authentication
  const publicRoutes = ['/login'];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    let shouldRedirect = false;
    let redirectPath = '';

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      shouldRedirect = true;
      redirectPath = '/login';
    }

    // If user is authenticated and trying to access login page, redirect to dashboard
    if (isAuthenticated && pathname === '/login') {
      shouldRedirect = true;
      redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    }

    if (shouldRedirect) {
      // Add a small delay to prevent flash and allow components to unmount properly
      const timer = setTimeout(() => {
        router.replace(redirectPath);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, pathname, router, user, isPublicRoute]);

  const layoutData = {
    role, // admin, user
    setRole,
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Allow access to public routes regardless of auth status
  if (isPublicRoute) {
    return (
      <LayoutContext.Provider value={layoutData}>
        {children}
      </LayoutContext.Provider>
    );
  }

  // If user is not authenticated and trying to access protected route, return null
  // (they will be redirected by useEffect)
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  // If user is authenticated and trying to access login, return null
  // (they will be redirected by useEffect)
  if (isAuthenticated && pathname === '/login') {
    return null;
  }

  return (
    <LayoutContext.Provider value={layoutData}>
      {children}
    </LayoutContext.Provider>
  );
};

export const LayoutWrapper = ({ children }) => {
  return (
    <AuthProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </AuthProvider>
  )
}
