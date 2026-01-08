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
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Define the callback function
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
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
      }
    };

    // Load Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }

    return () => {
      // Cleanup
    };
  }, []);

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
            {!isLoaded && (
              <p className="text-xs text-gray-500 text-center py-2">Loading translator...</p>
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
        .skiptranslate {
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
