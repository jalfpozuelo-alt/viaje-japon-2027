import { useEffect, useState } from 'react';
import { defaultTrip } from './data/defaultTrip';
import type { Trip } from './types';

const KEY = 'japan-trip-data-v2';
const META = 'japan-trip-meta-v2';

export function validateTrip(value: unknown): value is Trip {
  const t = value as Trip;
  return !!t && t.schemaVersion === 1 && typeof t.title === 'string' &&
    Array.isArray(t.days) && Array.isArray(t.hotels) &&
    t.days.every(d => d && typeof d.id === 'string' && typeof d.date === 'string' &&
      Array.isArray(d.places) && Array.isArray(d.transports));
}

// Replace only the known cover URLs shipped by the previous release. Custom URLs
// from the private editor are left untouched.
function migrateLegacyCoverImages(trip: Trip): Trip {
  const legacy: Record<string, string> = {
    '20': 'Osaka castle.jpg',
    '21': 'Arashiyama Bamboo Grove.jpg',
    '22': 'Kiyomizu-dera in Kyoto-r.jpg',
    '23': 'Arashiyama Bamboo Grove.jpg',
    '24': 'Osaka Dotonbori Canal.jpg',
    '25': 'Tokyo Station Marunouchi Building 2016.jpg',
  };
  let changed = false;
  const days = trip.days.map(day => {
    const previous = legacy[day.id];
    if (!previous || !day.image.includes(encodeURIComponent(previous))) return day;
    const current = defaultTrip.days.find(item => item.id === day.id)?.image;
    if (!current) return day;
    changed = true;
    return { ...day, image: current };
  });
  return changed ? { ...trip, days } : trip;
}

export function useTrip() {
  const [trip, setTrip] = useState<Trip>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '');
      return validateTrip(saved) ? migrateLegacyCoverImages(saved) : defaultTrip;
    } catch {
      return defaultTrip;
    }
  });
  const [dirty, setDirty] = useState(() => localStorage.getItem(META) !== 'exported');
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(trip));
    localStorage.setItem(META, 'changed');
    setDirty(true);
  }, [trip]);
  return {
    trip,
    setTrip,
    dirty,
    markExported: () => {
      localStorage.setItem(META, 'exported');
      setDirty(false);
    },
  };
}

export const stamp = (trip: Trip): Trip => ({ ...trip, updatedAt: new Date().toISOString() });

