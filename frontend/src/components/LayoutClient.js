"use client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AuthProvider } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoading } from "./LoadingSpinner";

export default function LayoutClient({ children }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleComplete);
    router.events?.on("routeChangeError", handleComplete);

    return () => {
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleComplete);
      router.events?.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return loading ? (
    <PageLoading message="Loading MentorConnect..." fullscreen />
  ) : (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">Skip to main content</a>
      <AuthProvider>
        <Navbar aria-label="Main navigation" />
        <main id="main-content" tabIndex={-1} aria-label="Main content" className="flex-1">
          {children}
        </main>
        <Footer aria-label="Site footer" />
      </AuthProvider>
    </div>
  );
} 