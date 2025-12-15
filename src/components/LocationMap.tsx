'use client';

import { useState } from 'react';
import { MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getApproximateLocation } from '@/lib/utils';

interface LocationMapProps {
  location: string | null | undefined;
  showMap?: boolean;
  className?: string;
}

export default function LocationMap({ location, showMap = true, className = '' }: LocationMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const approximateLocation = getApproximateLocation(location);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!location || approximateLocation === 'Location not specified') {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <MapPin className="w-4 h-4" />
        <span>Location not specified</span>
      </div>
    );
  }

  const encodedLocation = encodeURIComponent(approximateLocation);
  const mapEmbedUrl = apiKey 
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedLocation}&zoom=11`
    : null;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

  return (
    <div className={`${className}`}>
      {/* Location Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-primary-500" />
          <span className="font-medium">{approximateLocation}</span>
        </div>
        
        {showMap && mapEmbedUrl && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Hide map</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>View map</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Expandable Map */}
      {showMap && isExpanded && mapEmbedUrl && (
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-fadeIn">
          <div className="relative aspect-video bg-gray-100">
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoaded(true)}
              className={`transition-opacity duration-300 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
          
          {/* Open in Google Maps link */}
          <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Approximate location shown for privacy
            </span>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Open in Google Maps
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact location display - just shows approximate location text
 */
export function LocationText({ location, className = '' }: { location: string | null | undefined; className?: string }) {
  const approximateLocation = getApproximateLocation(location);
  
  return (
    <span className={className}>
      {approximateLocation}
    </span>
  );
}
