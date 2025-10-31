import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface LocationPickerProps {
  onLocationSelect: (address: string, coordinates?: { latitude: number; longitude: number }) => void;
  label: string;
  placeholder?: string;
  defaultValue?: string;
}

export default function LocationPicker({ 
  onLocationSelect, 
  label, 
  placeholder = "Entrez une adresse",
  defaultValue = ""
}: LocationPickerProps) {
  const [address, setAddress] = useState(defaultValue);
  const { loading, getLocation } = useGeolocation();

  const handleGeolocation = async () => {
    try {
      const loc = await getLocation();
      if (loc?.address) {
        setAddress(loc.address);
        onLocationSelect(loc.address, loc.coordinates);
      }
    } catch (error) {
      console.error('Erreur lors de la géolocalisation:', error);
    }
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    onLocationSelect(e.target.value);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={address}
            onChange={handleManualInput}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder={placeholder}
          />
        </div>
        <button
          type="button"
          onClick={handleGeolocation}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}