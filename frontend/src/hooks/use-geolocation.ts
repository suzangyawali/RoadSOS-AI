"use client";

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation not supported",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();

    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      undefined,
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation?.clearWatch(watchId);
    };
  }, [requestLocation]);

  return { ...state, requestLocation };
}
