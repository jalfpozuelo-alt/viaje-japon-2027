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
  const legacy: Record<string, string[]> = {
    '17': ['Kiyomizu-dera in Kyoto-r.jpg'],
    '20': ['Osaka castle.jpg'],
    '21': ['Arashiyama Bamboo Grove.jpg'],
    '22': ['Kiyomizu-dera in Kyoto-r.jpg'],
    '23': ['Arashiyama Bamboo Grove.jpg'],
    '24': ['Osaka Dotonbori Canal.jpg'],
    '25': ['Tokyo Station Marunouchi Building 2016.jpg', 'Tokyo Station Marunouchi.jpg'],
  };
  let changed = false;
  const days = trip.days.map(day => {
    const currentDefault = defaultTrip.days.find(item => item.id === day.id);
    if (!currentDefault) return day;
    let next = day;
    if (!next.guideSteps && currentDefault.guideSteps) {
      next = { ...next, guideSteps: currentDefault.guideSteps };
      changed = true;
    }
    if (!next.foodTips && currentDefault.foodTips) {
      next = { ...next, foodTips: currentDefault.foodTips };
      changed = true;
    }
    const oldFiles = legacy[day.id] || [];
    if (oldFiles.some(file => day.image.includes(encodeURIComponent(file)))) {
      next = { ...next, image: currentDefault.image };
      changed = true;
    } else if (day.image.includes('commons.wikimedia.org/')) {
      const smaller = day.image.replace(/([?&]width=)1200(?=&|$)/, (_match, prefix: string) => `${prefix}900`);
      if (smaller !== day.image) {
        next = { ...next, image: smaller };
        changed = true;
      }
    }

    if (day.id === '15') {
      const existingPlaceIds = new Set(next.places.map(place => place.id));
      const additions = currentDefault.places.filter(place =>
        ['mizunomi', 'fushiogami', 'haraido', 'oyunohara', 'tanabe-credential', 'hongu-heritage'].includes(place.id) &&
        !existingPlaceIds.has(place.id));
      const existingTransportIds = new Set(next.transports.map(transport => transport.id));
      const busToTrailhead = currentDefault.transports.filter(transport =>
        transport.id === 'kawayu-hosshinmon' && !existingTransportIds.has(transport.id));
      const oldCredentialNote = 'Preguntar por la credencial Dual Pilgrim y sellos vigentes en Tanabe Tourist Information o Kumano Hongu Heritage Center.';
      const updatedCredentialNotes = currentDefault.notes.filter(note =>
        note.startsWith('Credencial Dual Pilgrim:') || note.startsWith('El sello de finalización') || note.startsWith('Objetivo Dual Pilgrim'));
      let notes = next.notes;
      if (notes.includes(oldCredentialNote)) {
        notes = notes.filter(note => note !== oldCredentialNote);
        for (const note of updatedCredentialNotes) if (!notes.includes(note)) notes.push(note);
      }
      if (additions.length || busToTrailhead.length || notes !== next.notes) {
        next = { ...next, places: [...next.places, ...additions], transports: [...next.transports, ...busToTrailhead], notes };
        changed = true;
      }
    }

    if (day.id === '16') {
      const previousHayatamaDetail = 'Parada opcional en Shingu. Omitir sin dudar si ajusta demasiado el día.';
      const updatedHayatama = currentDefault.places.find(place => place.id === 'hayatama');
      if (updatedHayatama && next.places.some(place => place.id === 'hayatama' && place.detail === previousHayatamaDetail)) {
        next = { ...next, places: next.places.map(place => place.id === 'hayatama' ? updatedHayatama : place) };
        changed = true;
      }
    }
    return next;
  });
  const preparation = trip.preparation === undefined ? defaultTrip.preparation : trip.preparation;
  const manners = trip.manners === undefined ? defaultTrip.manners : trip.manners;
  if (preparation !== trip.preparation || manners !== trip.manners) changed = true;
  return changed ? { ...trip, days, preparation, manners } : trip;
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
