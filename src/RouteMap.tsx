import React, { useState } from 'react';
import type { Day } from './types';

const stops = [
  { lat: 34.69379, lon: 135.50107, city: 'Osaka', ids: ['13', '14'] },
  { lat: 33.84000, lon: 135.77389, city: 'Kumano', ids: ['15', '16'] },
  { lat: 35.01161, lon: 135.76811, city: 'Kioto', ids: ['17', '18', '19', '20'] },
  { lat: 36.141062, lon: 137.251454, city: 'Takayama', ids: ['21'] },
  { lat: 35.6895, lon: 139.69171, city: 'Tokio', ids: ['22', '23', '24', '25'] },
];
const projected = stops.map(stop => ({ ...stop, x: (stop.lon - 129) / (146 - 129) * 100, y: (46 - stop.lat) / (46 - 30) * 100 }));

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
        <img src={`${import.meta.env.BASE_URL}japan-geographic.svg`} alt="Mapa geográfico de Japón con posiciones calculadas a partir de coordenadas" />
        <svg className="route-trajectory" viewBox="0 0 100 100" aria-hidden="true">
          <defs><marker id="route-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs>
          <path d={projected.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')} markerEnd="url(#route-arrow)" />
        </svg>
        {projected.map((stop, index) => <span className="route-map-point" key={stop.city} style={{ left: `${stop.x}%`, top: `${stop.y}%` }} aria-hidden="true" title={`${stop.city} · ${stop.lat.toFixed(4)}, ${stop.lon.toFixed(4)}`}>{index + 1}</span>)}
        <span className="map-north">N</span>
      </div>
    </div>
    <div className="map-controls"><p className="map-caption">13—25 MAYO · RECORRIDO DE SUR A NORTE</p><button aria-expanded={large} onClick={() => setLarge(!large)}>{large ? 'Reducir mapa' : 'Ampliar mapa'} {large ? '−' : '＋'}</button></div>
    <p className="map-note">Los números de etapa de la lista corresponden a los puntos del mapa. Toca el día para abrir su itinerario. La flecha muestra el orden del viaje, no el trazado exacto de trenes o carreteras.</p>
  </section>;
}
