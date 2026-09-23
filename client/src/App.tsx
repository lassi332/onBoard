import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center space-y-3 max-w-sm">
                    <h2 className="text-xl font-bold">🎉 Authenticated Route Working!</h2>
                    <p className="text-sm text-zinc-400">
                      Next step: Building the Navbar and Kanban Dashboard.
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
