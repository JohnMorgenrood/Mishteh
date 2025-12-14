'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  minDisplayTime?: number; // Minimum time to show loader in ms
}

export default function LoadingScreen({ minDisplayTime = 1500 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if this is the first load using sessionStorage
    const hasLoaded = sessionStorage.getItem('mishteh-loaded');
    
    if (hasLoaded) {
      // Skip loading screen on subsequent navigations
      setIsVisible(false);
      return;
    }

    // Wait for document to be ready and minimum display time
    const handleLoad = () => {
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('mishteh-loaded', 'true');
        }, 500); // Fade out duration
      }, minDisplayTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [minDisplayTime]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full opacity-5">
          <div className="w-[200%] h-[200%] bg-gradient-radial from-primary-400 to-transparent animate-pulse-slow" />
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full opacity-5">
          <div className="w-[200%] h-[200%] bg-gradient-radial from-secondary-400 to-transparent animate-pulse-slow animation-delay-1000" />
        </div>
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 blur-xl bg-primary-400/30 animate-pulse-glow rounded-full scale-150" />
          
          {/* Logo */}
          <div className="relative w-24 h-24 animate-logo-entrance">
            <Image
              src="/assets/logo.png"
              alt="Mishteh Logo"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-display font-bold gradient-text animate-fade-in-up animation-delay-300">
          MISHTEH
        </h1>

        {/* Tagline */}
        <p className="text-lg text-gray-600 font-medium animate-fade-in-up animation-delay-500 text-center px-4">
          Connecting people through kindness
        </p>

        {/* Loading Indicator */}
        <div className="flex items-center gap-3 animate-fade-in-up animation-delay-700">
          {/* Animated Dots */}
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce-dot" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-bounce-dot animation-delay-150" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary-300 animate-bounce-dot animation-delay-300" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-50/50 to-transparent" />
    </div>
  );
}
