import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // 1. While checking if an HttpOnly session cookie exists
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Authenticating session...
          </span>
        </div>
      </div>
    );
  }

  // 2. If cookie check finished and no user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. User is valid and logged in -> Render the protected page
  return <>{children}</>;
}
