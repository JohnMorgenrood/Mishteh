'use client';

import { useState } from 'react';
import { Languages, Loader2, X } from 'lucide-react';

interface TranslateButtonProps {
  text: string;
  className?: string;
  showOriginal?: boolean;
}

// Free translation using LibreTranslate or fallback to simple detection
export default function TranslateButton({ text, className = '', showOriginal = true }: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect if text is likely not English
  const detectNonEnglish = (str: string): boolean => {
    // Check for non-ASCII characters (common in non-English languages)
    const nonAsciiRatio = (str.match(/[^\x00-\x7F]/g) || []).length / str.length;
    return nonAsciiRatio > 0.1;
  };

  const translateText = async () => {
    if (translatedText) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      // Use Google Translate API via a simple fetch
      // This uses the unofficial Google Translate endpoint
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Extract translated text from response
        const translated = data[0]?.map((item: any) => item[0]).join('') || text;
        setTranslatedText(translated);
        setShowTranslation(true);
      } else {
        throw new Error('Translation failed');
      }
    } catch (err) {
      console.error('Translation error:', err);
      // Fallback: just show original text with a note
      setError('Translation unavailable');
      setTranslatedText(text);
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  };

  // Only show translate button if text seems non-English or is long enough
  const shouldShowButton = text.length > 20 || detectNonEnglish(text);

  if (!shouldShowButton && !showOriginal) {
    return null;
  }

  return (
    <div className={className}>
      {showTranslation && translatedText && (
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Translated to English
              </p>
              <p className="text-gray-800 text-sm">{translatedText}</p>
            </div>
            <button
              onClick={() => setShowTranslation(false)}
              className="text-blue-400 hover:text-blue-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && (
            <p className="text-xs text-amber-600 mt-1">{error}</p>
          )}
        </div>
      )}
      
      <button
        onClick={translateText}
        disabled={isTranslating}
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors disabled:opacity-50"
      >
        {isTranslating ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Translating...
          </>
        ) : showTranslation ? (
          <>
            <Languages className="w-3 h-3" />
            Hide translation
          </>
        ) : (
          <>
            <Languages className="w-3 h-3" />
            See translation
          </>
        )}
      </button>
    </div>
  );
}

// Simple inline translate link (like Facebook)
export function TranslateLink({ text }: { text: string }) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (translated) {
      setShowTranslated(!showTranslated);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&dt=ld&q=${encodeURIComponent(text)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const translatedText = data[0]?.map((item: any) => item[0]).join('') || text;
        // Get detected language
        const langCode = data[2] || 'unknown';
        setDetectedLanguage(langCode);
        setTranslated(translatedText);
        setShowTranslated(true);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Language code to name mapping
  const languageNames: Record<string, string> = {
    af: 'Afrikaans', zu: 'Zulu', xh: 'Xhosa', st: 'Sesotho', tn: 'Setswana',
    sw: 'Swahili', fr: 'French', pt: 'Portuguese', es: 'Spanish', de: 'German',
    it: 'Italian', nl: 'Dutch', ru: 'Russian', ar: 'Arabic', hi: 'Hindi',
    zh: 'Chinese', ja: 'Japanese', ko: 'Korean', en: 'English',
  };

  const langName = detectedLanguage ? (languageNames[detectedLanguage] || detectedLanguage.toUpperCase()) : null;

  return (
    <div className="translate-widget">
      {showTranslated && translated && translated.toLowerCase() !== text.toLowerCase() && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
            <Languages className="w-3.5 h-3.5" />
            <span className="font-medium">
              Translated from {langName || 'detected language'}
            </span>
          </div>
          <p className="text-gray-800 text-sm">{translated}</p>
        </div>
      )}
      <button
        onClick={handleTranslate}
        disabled={isLoading}
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5 font-medium transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Translating...</span>
          </>
        ) : (
          <>
            <Languages className="w-3.5 h-3.5" />
            <span>{showTranslated ? 'Show original' : 'See translation'}</span>
          </>
        )}
      </button>
    </div>
  );
}
