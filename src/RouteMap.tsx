import React, { useState } from 'react';
import type { Day } from './types';

const stops = [
  { x: 48, y: 59, city: 'Osaka', ids: ['13', '14'] },
  { x: 52, y: 66, city: 'Kumano', ids: ['15', '16'] },
  { x: 50, y: 58, city: 'Kioto', ids: ['17', '18', '19', '20'] },
  { x: 58, y: 50, city: 'Takayama', ids: ['21'] },
  { x: 72, y: 43, city: 'Tokio', ids: ['22', '23', '24', '25'] },
];

export function RouteMap({ days, onSelect }: { days: Day[]; onSelect: (id: string) => void }) {
  const [large, setLarge] = useState(false);
  return <section className={`japan-route-map ${large ? 'map-large' : ''}`} aria-label="Mapa geográfico de la ruta por Japón">
    <div className="route-layout">
      <div className="route-day-list">
        {stops.map((stop, index) => {
          const group = stop.ids.map(id => days.find(day => day.id === id)).filter((day): day is Day => Boolean(day));
          if (!group.length) return null;
          return <div className="route-day-group" key={stop.city}>
            <span className="route-stage-number">{index + 1}</span>
            <div className="route-day-copy"><b>{stop.city}</b><div className="route-day-buttons">{group.map(day => <button key={day.id} onClick={() => onSelect(day.id)} aria-label={`Abrir día ${days.indexOf(day) + 1}: ${day.title}`}>{String(days.indexOf(day) + 1).padStart(2, '0')}</button>)}</div></div>
          </div>;
        })}
      </div>
      <div className="route-map-art">
        <img src={`${import.meta.env.BASE_URL}japan-main-islands.svg`} alt="Mapa geográfico de las islas principales de Japón" />
        <svg className="route-trajectory" viewBox="0 0 100 100" aria-hidden="true">
          <defs><marker id="route-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs>
          <path d="M48 59 L52 66 L50 58 L58 50 L72 43" markerEnd="url(#route-arrow)" />
        </svg>
        {stops.map((stop, index) => <span className="route-map-point" key={stop.city} style={{ left: `${stop.x}%`, top: `${stop.y}%` }} aria-hidden="true">{index + 1}</span>)}
        <span className="map-north">N</span>
      </div>
    </div>
    <div className="map-controls"><p className="map-caption">13—25 MAYO · RECORRIDO DE SUR A NORTE</p><button aria-expanded={large} onClick={() => setLarge(!large)}>{large ? 'Reducir mapa' : 'Ampliar mapa'} {large ? '−' : '＋'}</button></div>
    <p className="map-note">Los números de etapa de la lista corresponden a los puntos del mapa. Toca el día para abrir su itinerario. La flecha muestra el orden del viaje, no el trazado exacto de trenes o carreteras.</p>
  </section>;
}
