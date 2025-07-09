"use client";

import { useEffect, useState } from 'react';

export default function LoadingSpinner({ 
  size = "large", 
  message = "Loading...", 
  showProgress = false,
  className = "",
  fullscreen = false
}) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Simulate progress if enabled
  useEffect(() => {
    if (!showProgress) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [showProgress]);

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-16 h-16",
    xlarge: "w-24 h-24"
  };

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-[9999]' : ''} flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 ${className}`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Main spinner */}
        <div className={`relative ${sizeClasses[size]}`}>
          {/* Outer ring */}
          <div className={`absolute inset-0 border-4 border-slate-700 rounded-full ${sizeClasses[size]}`}></div>
          
          {/* Animated ring */}
          <div className={`absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full ${sizeClasses[size]} animate-spin`}></div>
          
          {/* Inner glow */}
          <div className={`absolute inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full ${sizeClasses[size === 'xlarge' ? 'w-20 h-20' : size === 'large' ? 'w-12 h-12' : size === 'medium' ? 'w-8 h-8' : 'w-6 h-6']} animate-pulse`}></div>
          
          {/* Center dot */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full animate-ping`}></div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {message}{dots}
          </h2>
          <p className="text-slate-400 text-sm">Please wait while we prepare everything for you</p>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Loading</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-bounce"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Page loading wrapper
export function PageLoading({ message = "Loading page...", showProgress = true, fullscreen = true }) {
  return <LoadingSpinner size="large" message={message} showProgress={showProgress} fullscreen={fullscreen} />;
}

// Component loading wrapper  
export function ComponentLoading({ message = "Loading...", size = "medium" }) {
  return <LoadingSpinner size={size} message={message} showProgress={false} />;
} 