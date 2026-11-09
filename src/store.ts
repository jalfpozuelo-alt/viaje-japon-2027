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
    const defaultTransportById = new Map(currentDefault.transports.map(transport => [transport.id, transport]));
    const migratedTransports = next.transports.map(transport => {
      const current = defaultTransportById.get(transport.id);
      if (!current) return transport;
      let migrated = transport;
      if (!migrated.map && current.map) migrated = { ...migrated, map: current.map };
      if (day.id === '25' && transport.id === 'airport-return' && /Pendiente HND|Haneda|Narita/i.test(`${transport.route} ${transport.detail}`)) {
        migrated = { ...current, status: transport.status };
      }
      return migrated;
    });
    const newTransports = currentDefault.transports.filter(transport => !next.transports.some(existing => existing.id === transport.id));
    if (migratedTransports.some((transport, index) => transport !== next.transports[index]) || newTransports.length) {
      next = { ...next, transports: [...migratedTransports, ...newTransports] };
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
        ['mizunomi', 'fushiogami', 'haraido', 'oyunohara', 'tanabe-credential', 'hongu-heritage', 'yunomine-tsuboyu'].includes(place.id) &&
        !existingPlaceIds.has(place.id));
      const existingTransportIds = new Set(next.transports.map(transport => transport.id));
      const busToTrailhead = currentDefault.transports.filter(transport =>
        transport.id === 'kawayu-hosshinmon' && !existingTransportIds.has(transport.id));
      const oldCredentialNote = 'Preguntar por la credencial Dual Pilgrim y sellos vigentes en Tanabe Tourist Information o Kumano Hongu Heritage Center.';
      const updatedCredentialNotes = currentDefault.notes.filter(note =>
        note.startsWith('Credencial Dual Pilgrim:') || note.startsWith('El sello de finalización') || note.startsWith('Objetivo Dual Pilgrim'));
      const daySplitNotes = currentDefault.notes.filter(note =>
        note.startsWith('Reunión de ambos grupos:') || note.startsWith('Alternativa para el grupo que no camina:'));
      const defaultSteps = new Map((currentDefault.guideSteps || []).map(step => [step.id, step]));
      const migratedSteps = (next.guideSteps || []).map(step => {
        const latest = defaultSteps.get(step.id);
        if (!latest) return step;
        const knownOutdatedStep = step.id === 'osaka-to-tanabe' && step.detail.startsWith('Desde Namba toma Osaka Metro Midosuji Line') ||
          step.id === 'tanabe-bus' && step.detail.startsWith('Al salir de JR Kii-Tanabe Station') ||
          step.id === 'trail-start' && (step.detail.startsWith('Desde el hotel, pregunta en recepción') || step.detail.startsWith('El recorrido no empieza en el hotel.')) ||
          step.id === 'trail-return' && step.detail.startsWith('El sendero termina junto a Kumano Hongu Taisha') ||
          step.id === 'credential' && step.detail.startsWith('Es gratuita. Si llegas con tiempo en Kii-Tanabe');
        if (knownOutdatedStep) return { ...latest, status: step.status };
        return step;
      });
      const addedTrailSteps = (currentDefault.guideSteps || []).filter(step => !migratedSteps.some(existing => existing.id === step.id));
      if (addedTrailSteps.length || migratedSteps.some((step, i) => step !== next.guideSteps?.[i])) {
        next = { ...next, guideSteps: [...migratedSteps, ...addedTrailSteps] };
        changed = true;
      }
      const oldSchedule = next.schedule.some(item => item.includes('Caminata solo si hay margen'));
      if (oldSchedule) { next = { ...next, schedule: currentDefault.schedule }; changed = true; }
      const defaultTransportById = new Map(currentDefault.transports.map(transport => [transport.id, transport]));
      const refreshedTransports = next.transports.map(transport => {
        const latest = defaultTransportById.get(transport.id);
        if (!latest) return transport;
        const outdated = transport.id === 'kuroshio' && transport.detail.includes('suele requerir 2 h 15') ||
          transport.id === 'kumano-bus' && transport.detail.includes('confirmar enlace real') ||
          transport.id === 'kawayu-hosshinmon' && transport.detail.includes('Coordinar con la llegada desde Osaka') ||
          transport.id === 'hongu-kawayu-return' && transport.detail.includes('varios servicios de Ryujin Bus hacia Kawayu');
        return outdated ? { ...latest, status: transport.status } : transport;
      });
      const addedTransports = currentDefault.transports.filter(transport => !refreshedTransports.some(existing => existing.id === transport.id));
      if (addedTransports.length || refreshedTransports.some((transport, index) => transport !== next.transports[index])) {
        next = { ...next, transports: [...refreshedTransports, ...addedTransports] };
        changed = true;
      }
      let notes = next.notes;
      if (notes.includes(oldCredentialNote)) {
        notes = notes.filter(note => note !== oldCredentialNote);
        for (const note of updatedCredentialNotes) if (!notes.includes(note)) notes.push(note);
      }
      for (const note of daySplitNotes) if (!notes.includes(note)) notes = [...notes, note];
      const obsoleteWalkWarning = notes.find(note => note.startsWith('La caminata del día 15 puede no ser viable tras el traslado desde Osaka.'));
      if (obsoleteWalkWarning) {
        notes = notes.filter(note => note !== obsoleteWalkWarning);
        for (const note of currentDefault.notes.filter(item => item.startsWith('Plan caminante de referencia:'))) if (!notes.includes(note)) notes.push(note);
      }
      const currentKawayu = currentDefault.places.find(place => place.id === 'kawayu');
      if (currentKawayu && next.places.some(place => place.id === 'kawayu' && place.name === 'Kawayu Onsen / Yunomine Onsen')) {
        next = { ...next, places: next.places.map(place => place.id === 'kawayu' ? currentKawayu : place) };
        changed = true;
      }
      if (additions.length || busToTrailhead.length || notes !== next.notes) {
        next = { ...next, places: [...next.places, ...additions], transports: [...next.transports, ...busToTrailhead], notes };
        changed = true;
      }
    }

    if (day.id === '16') {
      const previousHayatamaDetails = [
        'Parada opcional en Shingu. Omitir sin dudar si ajusta demasiado el día.',
        'Parada opcional en Shingu si no se busca completar la opción Dual Pilgrim de Hosshinmon–Hongu. Para ese objetivo, la fuente oficial vigente exige también visitar este santuario y Kumano Nachi Taisha; comprobar horario de bus y sellos antes de decidir.',
      ];
      const updatedHayatama = currentDefault.places.find(place => place.id === 'hayatama');
      if (updatedHayatama && next.places.some(place => place.id === 'hayatama' && previousHayatamaDetails.includes(place.detail))) {
        next = { ...next, places: next.places.map(place => place.id === 'hayatama' ? updatedHayatama : place) };
        changed = true;
      }
      const currentTransportById = new Map(currentDefault.transports.map(item => [item.id, item]));
      const day16Transports = next.transports.map(item => {
        const latest = currentTransportById.get(item.id);
        if (!latest) return item;
        const oldDetail = item.id === 'kawayu-shingu' && item.detail.includes('La parada en Hayatama Taisha solo entra') ||
          item.id === 'nachi-bus' && item.detail === 'Confirmar parada de subida/bajada y último regreso antes de salir.';
        return oldDetail ? { ...latest, status: item.status } : item;
      });
      if (day16Transports.some((item, i) => item !== next.transports[i])) {
        next = { ...next, transports: day16Transports };
        changed = true;
      }
      if (next.schedule.includes('Bus Kawayu → Shingu')) {
        next = { ...next, schedule: currentDefault.schedule };
        changed = true;
      }
      const dualPilgrimNote = currentDefault.notes.find(note => note.startsWith('Dual Pilgrim — sellos y trámite:'));
      if (dualPilgrimNote && !next.notes.some(note => note.startsWith('Dual Pilgrim — sellos y trámite:'))) {
        next = { ...next, notes: [...next.notes, dualPilgrimNote] };
        changed = true;
      }
    }
    if (day.id === '16' || day.id === '18' || day.id === '21' || day.id === '22' || day.id === '23' || day.id === '24' || day.id === '25') {
      const defaultSteps = new Map((currentDefault.guideSteps || []).map(step => [step.id, step]));
      const refreshedIds = new Set(day.id === '16' ? ['kawayu-shingu', 'shingu-katsuura', 'nachisan-bus', 'dual-credential-katsuura'] : day.id === '18' ? ['kiyomizu-access'] : day.id === '21' ? ['takayama-hotel'] : day.id === '22' ? ['tokyo-hotel'] : day.id === '23' ? ['yanaka-start'] : day.id === '24' ? ['meiji', 'shinjuku-return'] : ['airport-return', 'airport-route']);
      const refreshedSteps = (next.guideSteps || []).map(step => {
        const latest = defaultSteps.get(step.id);
        if (!latest || !refreshedIds.has(step.id)) return step;
        const oldVague = /aún no está identificado|dirección aún pendiente|dependerá de la dirección|Pendiente decidir aeropuerto|HND y NRT son distintos|Cuando se confirme el hotel|Confirma en la tabla oficial|Desde Shingu usa el tren JR|bus\/taxi\/recorrido urbano por decidir/i.test(step.detail) || day.id === '16' && (step.id === 'kawayu-shingu' && step.detail.startsWith('Desde la parada de Kawayu que indique el hotel') || step.id === 'shingu-katsuura' && step.detail.startsWith('En Shingu Station sigue los carteles JR') || step.id === 'nachisan-bus' && step.detail.startsWith('Desde Kii-Katsuura Station sal por la salida') || step.id === 'dual-credential-katsuura' && step.detail.startsWith('Sí pasáis por Tanabe el día 15:'));
        return oldVague ? latest : step;
      });
      const addedSteps = day.id === '16' ? (currentDefault.guideSteps || []).filter(step => !refreshedSteps.some(existing => existing.id === step.id)) : [];
      if (addedSteps.length || refreshedSteps.some((step, i) => step !== next.guideSteps?.[i])) {
        next = { ...next, guideSteps: [...refreshedSteps, ...addedSteps] };
        changed = true;
      }
    }
    if (day.id === '25') {
      const defaultDeparture = currentDefault.places.find(place => place.id === 'departure');
      const refreshedPlaces = next.places.map(place => place.id === 'departure' && /Pendiente decidir|Pendiente aeropuerto/i.test(place.detail) && defaultDeparture ? { ...place, ...defaultDeparture } : place);
      const oldSchedule = next.schedule.join('|').includes('Facturación') && next.schedule.join('|').includes('Vuelo de regreso');
      if (refreshedPlaces.some((place, i) => place !== next.places[i]) || oldSchedule) {
        next = { ...next, places: refreshedPlaces, schedule: oldSchedule ? currentDefault.schedule : next.schedule, notes: [...next.notes.filter(note => !note.startsWith('No programar visitas turísticas')), ...currentDefault.notes.filter(note => !next.notes.includes(note))] };
        changed = true;
      }
    }
    return next;
  });
  const hotels = trip.hotels.map(hotel => {
    const latest = defaultTrip.hotels.find(item => item.id === hotel.id);
    if (!latest) return hotel;
    const isOldPlaceholder = hotel.id === 'takayama' && hotel.name === 'Alojamiento de Takayama' || hotel.id === 'tokyo' && hotel.name === 'Alojamiento de Tokio';
    return isOldPlaceholder ? { ...latest, dates: hotel.dates || latest.dates } : hotel;
  });
  if (hotels.some((hotel, index) => hotel !== trip.hotels[index])) changed = true;
  const existingProviders = trip.providers || [];
  const knownProviderNames = new Set(existingProviders.map(provider => provider.name));
  const providers = [...existingProviders, ...defaultTrip.providers.filter(provider => !knownProviderNames.has(provider.name))];
  if (providers.length !== existingProviders.length) changed = true;
  const defaultTasks = new Map((defaultTrip.preparation || []).map(task => [task.id, task]));
  let preparationChanged = trip.preparation === undefined;
  let preparation: NonNullable<Trip['preparation']> = trip.preparation === undefined ? (defaultTrip.preparation || []) : trip.preparation.map(task => {
    const latest = defaultTasks.get(task.id);
    if (!latest) return task;
    const obsolete = task.id === 'lodging-details' && /no identifica todavía|aún no|cuando tengáis/i.test(task.detail) || task.id === 'flight-details' && /no fija Haneda|cuando tengáis el billete/i.test(task.detail) || task.id === 'kuroshio-out' && task.detail.startsWith('Elegir un Kuroshio compatible') || task.id === 'kumano-day15' && task.detail.startsWith('La caminata comienza en la parada Hosshinmon-oji');
    if (obsolete) { preparationChanged = true; return { ...latest, status: task.status }; }
    return task;
  });
  const existingPreparationIds = new Set(preparation.map(task => task.id));
  const addedPreparation = (defaultTrip.preparation || []).filter(task => !existingPreparationIds.has(task.id));
  if (addedPreparation.length) { preparation = [...preparation, ...addedPreparation]; preparationChanged = true; }
  const manners = trip.manners === undefined ? defaultTrip.manners : trip.manners;
  if (preparationChanged || manners !== trip.manners) changed = true;
  return changed ? { ...trip, days, hotels, providers, preparation, manners, updatedAt: new Date().toISOString() } : trip;
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

