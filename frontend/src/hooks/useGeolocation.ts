import { useState, useEffect } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationHook {
  coordinates: Coordinates | null;
  address: string | null;
  error: string | null;
  loading: boolean;
  getLocation: () => Promise<{ address: string | null; coordinates: Coordinates } | null>;
}

export const useGeolocation = (): GeolocationHook => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setAddress(data.display_name);
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      return null;
    }
  };

  const getLocation = async (): Promise<{ address: string | null; coordinates: Coordinates } | null> => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      setLoading(false);
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const newCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setCoordinates(newCoordinates);
      const addr = await reverseGeocode(newCoordinates.latitude, newCoordinates.longitude);
      
      return {
        address: addr,
        coordinates: newCoordinates
      };
    } catch (err) {
      setError('Impossible d\'obtenir votre position');
      console.error('Erreur de géolocalisation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { coordinates, address, error, loading, getLocation };
};