import { useEffect, useState } from 'react';
import { defaultTrip } from './data/defaultTrip';
import type { Trip } from './types';
const KEY='japan-trip-data-v2'; const META='japan-trip-meta-v2';
export function validateTrip(value:unknown): value is Trip {const t=value as Trip;return !!t&&t.schemaVersion===1&&typeof t.title==='string'&&Array.isArray(t.days)&&Array.isArray(t.hotels)&&t.days.every(d=>d&&typeof d.id==='string'&&typeof d.date==='string'&&Array.isArray(d.places)&&Array.isArray(d.transports));}
export function useTrip(){const[trip,setTrip]=useState<Trip>(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'');return validateTrip(saved)?saved:defaultTrip}catch{return defaultTrip}});const[dirty,setDirty]=useState(()=>localStorage.getItem(META)!=='exported');useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(trip));localStorage.setItem(META,'changed');setDirty(true)},[trip]);return{trip,setTrip,dirty,markExported:()=>{localStorage.setItem(META,'exported');setDirty(false)}}}
export const stamp=(trip:Trip):Trip=>({...trip,updatedAt:new Date().toISOString()});
