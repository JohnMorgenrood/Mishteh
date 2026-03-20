'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface LoadingScreenProps {
  minDisplayTime?: number; // Minimum time to show loader in ms
}

const loadingMessages = [
  'Preparing your space with care',
  'Bringing support stories into view',
  'Setting up a calmer, clearer experience',
];

export default function LoadingScreen({ minDisplayTime = 2500 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setIsVisible(true);
    setIsFading(false);
    setMessageIndex((prev) => (prev + 1) % loadingMessages.length);

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, minDisplayTime);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, minDisplayTime + 500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname, minDisplayTime]);

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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/2 -top-1/2 h-full w-full opacity-5">
          <div className="h-[200%] w-[200%] animate-pulse-slow bg-gradient-radial from-primary-400 to-transparent" />
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full opacity-5">
          <div className="h-[200%] w-[200%] animate-pulse-slow bg-gradient-radial from-secondary-400 to-transparent animation-delay-1000" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-primary-400/30 blur-xl animate-pulse-glow" />
          <div className="relative h-24 w-24 animate-logo-entrance">
            <Image
              src="/assets/logo.png"
              alt="Mishteh Logo"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        <h1 className="animate-fade-in-up animation-delay-300 text-4xl font-bold font-display gradient-text">
          MISHTEH
        </h1>

        <p className="animate-fade-in-up animation-delay-500 px-4 text-center text-lg font-medium text-gray-600">
          {loadingMessages[messageIndex]}
        </p>

        <div className="max-w-lg animate-fade-in-up px-6 text-center animation-delay-600">
          <p className="text-sm italic leading-relaxed text-primary-700 md:text-base">
            &ldquo;Learn to do good. Seek justice. Help the oppressed. Defend the cause of orphans. Fight for the rights of widows.&rdquo;
          </p>
          <p className="mt-2 text-xs font-medium text-primary-500 md:text-sm">
            Isaiah 1:17
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 animate-fade-in-up animation-delay-700">
          <div className="flex gap-2">
            <div className="h-2.5 w-2.5 animate-bounce-dot rounded-full bg-primary-500" />
            <div className="h-2.5 w-2.5 animate-bounce-dot rounded-full bg-primary-400 animation-delay-150" />
            <div className="h-2.5 w-2.5 animate-bounce-dot rounded-full bg-primary-300 animation-delay-300" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Loading
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-50/50 to-transparent" />
    </div>
  );
}
