'use client';

import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function LanguageSelector() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Define the callback function
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        const container = document.getElementById('google_translate_element');
        if (!container || container.childElementCount > 0) return;

        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'af,ar,zh-CN,zh-TW,nl,en,fr,de,hi,id,it,ja,ko,ms,pt,ru,es,sw,th,tr,vi,zu',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setIsLoaded(true);
        setLoadError(false);
      }
    };

    // Load Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => setLoadError(true);
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }

    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    if (showDropdown && window.google?.translate) {
      window.googleTranslateElementInit();
    }
  }, [showDropdown]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
        title="Translate Page"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">Translate</span>
      </button>
      
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-2">
            <div id="google_translate_element" className="translate-dropdown" />
            {!isLoaded && !loadError && (
              <p className="text-xs text-gray-500 text-center py-2">Loading translator...</p>
            )}
            {loadError && (
              <p className="text-xs text-red-600 text-center py-2">
                Translator unavailable. Please check your connection and try again.
              </p>
            )}
          </div>
        </>
      )}
      
      {/* Hide Google's default styling */}
      <style jsx global>{`
        .goog-te-banner-frame {
          display: none !important;
        }
        .goog-te-menu-value {
          color: #374151 !important;
          font-size: 14px !important;
        }
        .goog-te-gadget {
          font-family: inherit !important;
          font-size: 14px !important;
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-size: 14px !important;
        }
        .goog-te-gadget-icon {
          display: none !important;
        }
        .goog-te-menu2 {
          max-width: 100% !important;
        }
        body {
          top: 0 !important;
        }
        body > .skiptranslate {
          display: none !important;
        }
        .translate-dropdown .goog-te-gadget-simple {
          display: block !important;
          width: 100% !important;
        }
        .VIpgJd-ZVi9od-l4eHX-hSRGPd {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
