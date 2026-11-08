import React from 'react';
import type { Day } from './types';

const stops = [
  { x: 48, y: 59, city: 'Osaka', ids: ['13', '14'] },
  { x: 52, y: 66, city: 'Kumano', ids: ['15', '16'] },
  { x: 50, y: 58, city: 'Kioto', ids: ['17', '18', '19', '20'] },
  { x: 58, y: 50, city: 'Takayama', ids: ['21'] },
  { x: 72, y: 43, city: 'Tokio', ids: ['22', '23', '24', '25'] },
];

export function RouteMap({ days, onSelect }: { days: Day[]; onSelect: (id: string) => void }) {
  return <section className="japan-route-map" aria-label="Mapa geográfico de la ruta por Japón">
    <div className="route-map-art">
      <img src={`${import.meta.env.BASE_URL}japan-main-islands.svg`} alt="Mapa geográfico de las islas principales de Japón" />
      <svg className="route-trajectory" viewBox="0 0 100 100" aria-hidden="true">
        <defs><marker id="route-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs>
        <path d="M48 59 L52 66 L50 58 L58 50 L72 43" markerEnd="url(#route-arrow)" />
      </svg>
      {stops.map((stop, n) => <div className={`route-stop route-stop-${n}`} key={stop.city} style={{ left: `${stop.x}%`, top: `${stop.y}%` }}>
        <span className="route-city-label">{stop.city}</span>
        <span className="route-stage-pin" aria-hidden="true">{n + 1}</span>
      </div>)}
      <span className="map-north">N</span>
    </div>
    <p className="map-caption">13—25 MAYO · OSAKA → KUMANO → KIOTO → TAKAYAMA → TOKIO</p>
    <p className="map-note">Mapa geográfico orientativo. La línea indica el orden del viaje, no el trazado exacto de trenes o carreteras.</p>
    <div className="map-day-groups"><h2>Elige una jornada</h2>{stops.map(stop=>{
      const group=stop.ids.map(id=>days.find(d=>d.id===id)).filter((day):day is Day=>Boolean(day));
      if(!group.length)return null;
      return <div className="map-day-group" key={stop.city}><span>{stop.city}</span><div>{group.map(day=><button key={day.id} onClick={()=>onSelect(day.id)} aria-label={`Abrir día ${days.indexOf(day)+1}: ${day.title}`}>{String(days.indexOf(day)+1).padStart(2,'0')}</button>)}</div></div>;
    })}</div>
  </section>;
}
