'use client';

import { useState, useEffect, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Control,
  FieldPath,
  FieldValues,
  UseFormSetValue,
  useWatch,
  Controller,
} from 'react-hook-form';

// Fix Leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationMapProps<T extends FieldValues> {
  control: Control<T> | undefined;
  setValue: UseFormSetValue<T>;
  latitudeName: FieldPath<T>;
  longitudeName: FieldPath<T>;
  label?: string;
  errMsg?: string;
  defaultLat?: number;
  defaultLng?: number;
}

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// این کامپوننت رو memo کردیم که فقط وقتی واقعاً نیازه رندر بشه
const LocationMapInner = <T extends FieldValues>({
  control,
  setValue,
  latitudeName,
  longitudeName,
  label = 'موقعیت مکانی',
  errMsg,
  defaultLat = 35.6892,
  defaultLng = 51.3890,
}: LocationMapProps<T>) => {
  // اگر control نباشه، اصلاً چیزی رندر نکن (جلوگیری از کرش)
  if (!control) {
    return <div className="text-red-400">خطا: فرم لود نشده است.</div>;
  }

  const watchedLat = useWatch({ control, name: latitudeName }) || '';
  const watchedLng = useWatch({ control, name: longitudeName }) || '';

  const [position, setPosition] = useState<[number, number] | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setValue(latitudeName, lat.toFixed(8) as any, { shouldValidate: true, shouldDirty: true });
    setValue(longitudeName, lng.toFixed(8) as any, { shouldValidate: true, shouldDirty: true });
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setValue(latitudeName, '' as any);
      setPosition(null);
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPosition((prev) => [num, prev ? prev[1] : defaultLng]);
      setValue(latitudeName, val as any, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setValue(longitudeName, '' as any);
      setPosition(null);
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPosition((prev) => [prev ? prev[0] : defaultLat, num]);
      setValue(longitudeName, val as any, { shouldValidate: true, shouldDirty: true });
    }
  };

  useEffect(() => {
    if (!position && watchedLat && watchedLng) {
      const lat = parseFloat(watchedLat as string);
      const lng = parseFloat(watchedLng as string);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
      }
    }
  }, [watchedLat, watchedLng, position]);

  const center: [number, number] = position || [
    watchedLat ? parseFloat(watchedLat as string) : defaultLat,
    watchedLng ? parseFloat(watchedLng as string) : defaultLng,
  ];

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium text-slate-300 text-right flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        {label}
      </label>

      <div className="w-full h-96 rounded-xl overflow-hidden border border-white/20 shadow-lg">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <LocationPicker onSelect={handleMapClick} />
          {position && (
            <Marker position={position} draggable={true} eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                handleMapClick(pos.lat, pos.lng);
              }
            }}>
              <Popup>مکان انتخاب‌شده (قابل جابه‌جایی)</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400">عرض جغرافیایی (Latitude)</label>
          <input
            type="text"
            inputMode="decimal"
            value={position ? position[0].toFixed(8) : watchedLat}
            onChange={handleLatChange}
            placeholder={defaultLat.toFixed(8)}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-left text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400">طول جغرافیایی (Longitude)</label>
          <input
            type="text"
            inputMode="decimal"
            value={position ? position[1].toFixed(8) : watchedLng}
            onChange={handleLngChange}
            placeholder={defaultLng.toFixed(8)}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-left text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
      </div>

      {/* فیلدهای مخفی — مهم! */}
      <Controller
        control={control}
        name={latitudeName}
        render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />}
      />
      <Controller
        control={control}
        name={longitudeName}
        render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />}
      />

      {errMsg && (
        <span className="text-red-400 text-sm font-medium text-right flex items-center gap-2">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          {errMsg}
        </span>
      )}
    </div>
  );
};

// memo + displayName برای دیباگ بهتر
export const LocationMap = memo(LocationMapInner) as typeof LocationMapInner;