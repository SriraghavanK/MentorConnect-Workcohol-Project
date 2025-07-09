"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import AuthProvider to reduce initial bundle size
const AuthProvider = dynamic(() => import('../contexts/AuthContext').then(mod => ({ default: mod.AuthProvider })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

export default function AuthProviderWrapper({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Suspense>
  );
} 