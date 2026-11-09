import React, { useState } from 'react';
import type { Day } from './types';

const stops = [
  { lat: 34.69379, lon: 135.50107, city: 'Osaka', ids: ['13', '14'] },
  { lat: 33.84000, lon: 135.77389, city: 'Kumano', ids: ['15', '16'] },
  { lat: 35.01161, lon: 135.76811, city: 'Kioto', ids: ['17', '18', '19', '20'] },
  { lat: 36.141062, lon: 137.251454, city: 'Takayama', ids: ['21'] },
  { lat: 35.6895, lon: 139.69171, city: 'Tokio', ids: ['22', '23', '24', '25'] },
];
const projected = stops.map((stop, index) => {
  const offsets = [ [5.0, 3.2], [8.0, 2.2], [6.0, -3.0], [2.3, -2.0], [3.2, 1.0] ];
  const [dx, dy] = offsets[index];
  return { ...stop, x: (stop.lon - 129) / (146 - 129) * 100, y: (46 - stop.lat) / (46 - 30) * 100, labelX: (stop.lon - 129) / (146 - 129) * 100 + dx, labelY: (46 - stop.lat) / (46 - 30) * 100 + dy };
});

export function RouteMap({ days, onSelect }: { days: Day[]; onSelect: (id: string) => void }) {
  const [large, setLarge] = useState(false);
  return <section className={`japan-route-map ${large ? 'map-large' : ''}`} aria-label="Mapa geográfico de la ruta por Japón">
    <div className="route-layout">
      <div className="route-map-art" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}japan-geographic.svg`} alt="" />
        <svg className="route-trajectory" viewBox="0 0 100 100">
          <defs><marker id="route-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs>
          <path className="route-line" d={projected.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')} markerEnd="url(#route-arrow)" />
          {projected.map(stop => <g className="route-leader" key={stop.city}><line x1={stop.x} y1={stop.y} x2={stop.labelX} y2={stop.labelY}/><circle cx={stop.x} cy={stop.y} r=".8"/></g>)}
        </svg>
        {projected.map((stop, index) => <span className="route-map-point" key={stop.city} style={{ left: `${stop.labelX}%`, top: `${stop.labelY}%` }} title={`${stop.city} · ${stop.lat.toFixed(4)}, ${stop.lon.toFixed(4)}`}>{index + 1}</span>)}
      </div>
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
    </div>
    <div className="map-controls"><p className="map-caption">13—25 MAYO · OSAKA → KUMANO → KIOTO → TAKAYAMA → TOKIO</p><button aria-expanded={large} onClick={() => setLarge(!large)}>{large ? 'Reducir mapa' : 'Ampliar mapa'} {large ? '−' : '＋'}</button></div>
    <p className="map-note">El punto pequeño indica la coordenada de referencia; la cifra se desplaza un poco para que no se monten. Toca un día para abrirlo. La línea orienta, no representa las vías exactas.</p>
  </section>;
}
