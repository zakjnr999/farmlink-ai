'use client';

import { useCallback, useEffect, useState } from 'react';

export type GeolocationPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoRequest?: boolean;
}

export interface UseGeolocationResult {
  coordinates: GeolocationCoordinates | null;
  error: string | null;
  permission: GeolocationPermission;
  isLoading: boolean;
  isSupported: boolean;
  requestLocation: () => Promise<GeolocationCoordinates | null>;
  clearLocation: () => void;
}

const DEFAULT_OPTIONS: Required<Omit<UseGeolocationOptions, 'autoRequest'>> = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000,
};

export function useGeolocation(
  options: UseGeolocationOptions = {},
): UseGeolocationResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const isSupported =
    typeof window !== 'undefined' && 'geolocation' in navigator;

  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<GeolocationPermission>(
    isSupported ? 'prompt' : 'unsupported',
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isSupported || !navigator.permissions?.query) return;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        setPermission(status.state as GeolocationPermission);
        status.onchange = () => {
          setPermission(status.state as GeolocationPermission);
        };
      })
      .catch(() => undefined);
  }, [isSupported]);

  const requestLocation = useCallback(async () => {
    if (!isSupported) {
      setError('Location is not supported on this device.');
      setPermission('unsupported');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise<GeolocationCoordinates | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCoordinates(next);
          setPermission('granted');
          setIsLoading(false);
          resolve(next);
        },
        (positionError) => {
          if (positionError.code === positionError.PERMISSION_DENIED) {
            setPermission('denied');
            setError(
              'Location access was denied. You can enter your town manually instead.',
            );
          } else if (positionError.code === positionError.TIMEOUT) {
            setError(
              'Finding your location took too long. Try again or enter your town manually.',
            );
          } else {
            setError(
              'We could not find your location. You can enter your town manually instead.',
            );
          }
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: mergedOptions.enableHighAccuracy,
          timeout: mergedOptions.timeout,
          maximumAge: mergedOptions.maximumAge,
        },
      );
    });
  }, [isSupported, mergedOptions]);

  useEffect(() => {
    if (options.autoRequest) {
      void requestLocation();
    }
  }, [options.autoRequest, requestLocation]);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
  }, []);

  return {
    coordinates,
    error,
    permission,
    isLoading,
    isSupported,
    requestLocation,
    clearLocation,
  };
}
