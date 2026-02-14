'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface GeolocationData {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  language?: string;
  isLoading: boolean;
  error?: string;
}

interface GeolocationContextType {
  location: GeolocationData;
  refetch: () => Promise<void>;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

/**
 * GeolocationProvider Component
 * 
 * Provides geolocation data to the entire app using IP-based detection.
 * Falls back to default values if detection fails.
 * 
 * @example
 * ```tsx
 * <GeolocationProvider>
 *   <App />
 * </GeolocationProvider>
 * ```
 */
export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<GeolocationData>({
    isLoading: true,
  });

  const fetchGeolocation = async () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Try multiple free geolocation APIs
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Geolocation API failed');
      }

      const data = await response.json();

      setLocation({
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        continent: data.continent_code,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        currency: data.currency,
        language: data.languages?.split(',')[0],
        isLoading: false,
      });
    } catch (error) {
      console.error('Geolocation detection failed:', error);
      
      // Fallback to default (global)
      setLocation({
        city: undefined,
        region: undefined,
        country: 'Global',
        countryCode: 'GLOBAL',
        continent: undefined,
        isLoading: false,
        error: 'Could not detect location',
      });
    }
  };

  useEffect(() => {
    // Only fetch on client side
    if (typeof window !== 'undefined') {
      fetchGeolocation();
    }
  }, []);

  return (
    <GeolocationContext.Provider value={{ location, refetch: fetchGeolocation }}>
      {children}
    </GeolocationContext.Provider>
  );
}

/**
 * useGeolocation Hook
 * 
 * Access user's geolocation data from anywhere in the app.
 * 
 * @example
 * ```tsx
 * const { location } = useGeolocation();
 * 
 * if (location.isLoading) return <div>Loading...</div>;
 * 
 * return <div>Welcome from {location.city}, {location.region}!</div>
 * ```
 */
export function useGeolocation() {
  const context = useContext(GeolocationContext);
  
  if (context === undefined) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  
  return context;
}

/**
 * LocationGreeting Component
 * 
 * Displays a personalized greeting based on user's location.
 * 
 * @example
 * ```tsx
 * <LocationGreeting />
 * // Output: "Welcome, visitor from New York, NY!"
 * ```
 */
export function LocationGreeting({ className = '' }: { className?: string }) {
  const { location } = useGeolocation();

  if (location.isLoading) {
    return <span className={className}>Welcome!</span>;
  }

  if (location.error || !location.city) {
    return <span className={className}>Welcome, global visitor!</span>;
  }

  return (
    <span className={className}>
      Welcome, visitor from {location.city}
      {location.region && `, ${location.region}`}!
    </span>
  );
}

/**
 * Generate location-optimized meta description
 */
export function useLocationMetaDescription(baseDescription: string): string {
  const { location } = useGeolocation();

  if (location.isLoading || location.error || !location.city) {
    return baseDescription;
  }

  return `${baseDescription} Serving ${location.city}, ${location.region || location.country}.`;
}

/**
 * Generate location-optimized keywords
 */
export function useLocationKeywords(baseKeywords: string[]): string[] {
  const { location } = useGeolocation();

  if (location.isLoading || location.error || !location.city) {
    return baseKeywords;
  }

  return [
    ...baseKeywords,
    `${baseKeywords[0]} ${location.city}`,
    `${baseKeywords[0]} ${location.region}`,
    `${baseKeywords[0]} ${location.country}`,
  ];
}
