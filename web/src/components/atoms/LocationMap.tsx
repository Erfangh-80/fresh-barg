'use client';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FieldPath, FieldValues, UseFormRegister, Controller, Control } from 'react-hook-form';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps<T extends FieldValues> {
  control: Control<T>;
  latitudeName: FieldPath<T>;
  longitudeName: FieldPath<T>;
  label: string;
  errMsg?: string;
  defaultLat?: number;
  defaultLng?: number;
}

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  const map = useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  
  return null;
};

export const LocationMap = <T extends FieldValues>({
  control,
  latitudeName,
  longitudeName,
  label,
  errMsg,
  defaultLat = 35.6892, // Tehran default latitude
  defaultLng = 51.3890, // Tehran default longitude
}: LocationMapProps<T>) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // Initialize with default position
  useEffect(() => {
    setSelectedPosition([defaultLat, defaultLng]);
  }, [defaultLat, defaultLng]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedPosition) {
      const newLat = parseFloat(e.target.value);
      if (!isNaN(newLat)) {
        setSelectedPosition([newLat, selectedPosition[1]]);
      }
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedPosition) {
      const newLng = parseFloat(e.target.value);
      if (!isNaN(newLng)) {
        setSelectedPosition([selectedPosition[0], newLng]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-300 text-right flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        {label}
      </label>
      
      <div className="w-full h-80 rounded-xl overflow-hidden border border-white/20 bg-white/5">
        <MapContainer 
          center={selectedPosition || [defaultLat, defaultLng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationPicker 
            onLocationSelect={(lat, lng) => {
              handleLocationSelect(lat, lng);
            }} 
          />
          {selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>مکان انتخاب شده</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      {/* Temporary text inputs for latitude and longitude */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col gap-3">
          <label 
            htmlFor={latitudeName}
            className="text-sm font-medium text-slate-300 text-right flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            عرض جغرافیایی
          </label>
          <input
            id={latitudeName}
            type="number"
            value={selectedPosition ? selectedPosition[0] : defaultLat}
            onChange={handleLatChange}
            step="any"
            className={`
              w-full px-4 py-3 bg-white/5 border rounded-xl
              placeholder:text-slate-400 text-right text-white
              transition-all duration-300 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
              hover:bg-white/10 hover:border-white/30
              ${errMsg
                ? "border-red-400/60 bg-red-500/10 focus:ring-red-500"
                : "border-white/20 focus:border-transparent"
              }
              text-left direction-ltr
            `}
          />
        </div>
        
        <div className="flex flex-col gap-3">
          <label 
            htmlFor={longitudeName}
            className="text-sm font-medium text-slate-300 text-right flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            طول جغرافیایی
          </label>
          <input
            id={longitudeName}
            type="number"
            value={selectedPosition ? selectedPosition[1] : defaultLng}
            onChange={handleLngChange}
            step="any"
            className={`
              w-full px-4 py-3 bg-white/5 border rounded-xl
              placeholder:text-slate-400 text-right text-white
              transition-all duration-300 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
              hover:bg-white/10 hover:border-white/30
              ${errMsg
                ? "border-red-400/60 bg-red-500/10 focus:ring-red-500"
                : "border-white/20 focus:border-transparent"
              }
              text-left direction-ltr
            `}
          />
        </div>
      </div>
      
      <Controller
        name={latitudeName}
        control={control}
        render={({ field }) => (
          <input
            type="hidden"
            value={selectedPosition ? selectedPosition[0] : defaultLat}
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value);
              // Update state if user typed directly in the hidden field
              if (selectedPosition) {
                const newLat = parseFloat(value);
                if (!isNaN(newLat)) {
                  setSelectedPosition([newLat, selectedPosition[1]]);
                }
              }
            }}
          />
        )}
      />
      
      <Controller
        name={longitudeName}
        control={control}
        render={({ field }) => (
          <input
            type="hidden"
            value={selectedPosition ? selectedPosition[1] : defaultLng}
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value);
              // Update state if user typed directly in the hidden field
              if (selectedPosition) {
                const newLng = parseFloat(value);
                if (!isNaN(newLng)) {
                  setSelectedPosition([selectedPosition[0], newLng]);
                }
              }
            }}
          />
        )}
      />
      
      {errMsg && (
        <span className="text-red-400 text-xs font-medium text-right mt-1 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-400 rounded-full shrink-0"></div>
          {errMsg}
        </span>
      )}
    </div>
  );
};