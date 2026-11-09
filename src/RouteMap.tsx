import React from 'react';
import './route.css';
import type { Day } from './types';
import { routeStages } from './data/routeOverview';

const extent = { west: 129, east: 146, south: 30, north: 46 };
const project = (lat: number, lon: number) => ({ x: (lon - extent.west) / (extent.east - extent.west) * 100, y: (extent.north - lat) / (extent.north - extent.south) * 100 });
const points = routeStages.map((stage, index) => ({ ...stage, ...project(stage.latitude, stage.longitude), index }));
const regionalKumano = { x: (points[1].x + points[2].x) / 2, y: (points[1].y + points[2].y) / 2 };
// Callout labels are offset for legibility; tiny anchor dots stay on the exact coordinates.
const mainMarkers = [
  { number: '1', name: 'Osaka', dayIds: routeStages[0].dayIds, x: 30, y: 70, anchors: [points[0]] },
  { number: '2–3', name: 'Kumano', dayIds: [...routeStages[1].dayIds, ...routeStages[2].dayIds], x: regionalKumano.x, y: regionalKumano.y, anchors: [] },
  { number: '4', name: 'Kioto', dayIds: routeStages[3].dayIds, x: 47, y: 63, anchors: [points[3]] },
  { number: '5', name: 'Takayama', dayIds: routeStages[4].dayIds, x: 53, y: 56.5, anchors: [points[4]] },
  { number: '6', name: 'Tokio', dayIds: routeStages[5].dayIds, x: 61, y: 65.5, anchors: [points[5]] },
];

export function RouteMap({ days, onSelect }: { days: Day[]; onSelect: (id: string) => void }) {
  const selectStage = (dayIds: string[]) => {
    const day = dayIds.map(id => days.find(item => item.id === id)).find(Boolean);
    if (day) onSelect(day.id);
  };
  const mainPath = points.map((point, i) => `${i ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  const kumano = [points[1], points[2]];
  const insetProject = (point: typeof kumano[number]) => ({ x: (point.longitude - 135.4) / .9 * 100, y: (34 - point.latitude) / .55 * 100 });
  const insetPoints = kumano.map(point => ({ ...point, ...insetProject(point) }));
  const insetPath = insetPoints.map((point, i) => `${i ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  return <main className="page route-page">
    <header className="route-heading"><p className="eyebrow">13—25 MAYO · 2027</p><h1>Nuestra ruta por Japón</h1><p>De Osaka a Tokio, con una travesía por Kumano y los Alpes japoneses.</p></header>
    <section className="route-atlas" aria-label="Recorrido geográfico por Japón">
      <div className="atlas-map">
        <img className="atlas-land" src={`${import.meta.env.BASE_URL}japan-geographic.svg`} alt="Mapa geográfico de las islas de Japón" />
        <svg className="atlas-paths" viewBox="0 0 100 100" aria-hidden="true">
          <defs><marker id="atlas-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs>
          <path className="atlas-route-line" d={mainPath} markerEnd="url(#atlas-arrow)" />
          {points.map(point => <circle className="atlas-location-dot" key={point.name} cx={point.x} cy={point.y} r=".8"/>)}
          {mainMarkers.flatMap(marker => marker.anchors.map(anchor => <line className="atlas-leader" key={`${marker.number}-${anchor.name}`} x1={anchor.x} y1={anchor.y} x2={marker.x} y2={marker.y}/>))}
        </svg>
        {mainMarkers.map(marker => <button className={`atlas-marker ${marker.number === '2–3' ? 'regional-marker' : ''}`} key={marker.number} style={{ left: `${marker.x}%`, top: `${marker.y}%` }} onClick={() => selectStage(marker.dayIds)} aria-label={`Etapa ${marker.number}: ${marker.name}. Abrir jornada`}><span>{marker.number}</span><b>{marker.name}</b></button>)}
        <span className="atlas-north" aria-hidden="true">N ↑</span>
        <span className="atlas-ocean-label atlas-ocean-pacific">OCÉANO PACÍFICO</span><span className="atlas-ocean-label atlas-ocean-japan">MAR DE JAPÓN</span>
      </div>
      <p className="atlas-caption">Las líneas indican el orden del viaje, no el trazado exacto de trenes o carreteras.</p>
    </section>
    <section className="kumano-inset" aria-label="Detalle geográfico de Kumano">
      <div className="kumano-inset-copy"><p className="eyebrow">PENÍNSULA DE KII · DETALLE</p><h2>Kumano, más de cerca</h2><p>El recorrido pasa primero por Kawayu/Hongu y continúa hacia Nachi y Kii-Katsuura.</p></div>
      <div className="kumano-inset-map">
        <img src={`${import.meta.env.BASE_URL}kumano-geographic.svg`} alt="Contorno regional de Kumano y la península de Kii" />
        <svg viewBox="0 0 100 100" aria-hidden="true"><defs><marker id="kumano-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs><path d={insetPath} markerEnd="url(#kumano-arrow)" /></svg>
        {insetPoints.map((point, i) => <button key={point.name} className={`kumano-dot kumano-dot-${i}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => selectStage(routeStages[i + 1].dayIds)} aria-label={`Abrir etapa ${i + 2}: ${i === 0 ? 'Kawayu y Hongu' : 'Nachi y Kii-Katsuura'}`}><b>{i + 2}</b><small>{i === 0 ? 'Kawayu / Hongu' : 'Nachi / Kii-Katsuura'}</small></button>)}
      </div>
    </section>
    <section className="route-timeline"><p className="eyebrow">ETAPAS Y JORNADAS</p><h2>El viaje, día a día</h2>
      {routeStages.map((stage, index) => {
        const group = stage.dayIds.map(id => days.find(day => day.id === id)).filter((day): day is Day => Boolean(day));
        if (!group.length) return null;
        return <React.Fragment key={stage.name}>
          <article className="route-stage-card">
            <button className="stage-start" onClick={() => selectStage(stage.dayIds)} aria-label={`Abrir etapa ${index + 1}: ${stage.name}`}><span>{index + 1}</span></button>
            <div className="stage-content"><small>{stage.area} · {group[0].date}</small><h3>{stage.name}</h3><div className="stage-day-buttons">{group.map(day => <button key={day.id} onClick={() => onSelect(day.id)} aria-label={`Abrir día ${days.indexOf(day) + 1}: ${day.date} · ${day.title}`}>Día {String(days.indexOf(day) + 1).padStart(2, '0')}<small>{day.date.split('·')[1]?.trim()}</small></button>)}</div></div>
          </article>
          {stage.onward && <div className="route-segment"><span className="segment-arrow">↓</span><div><small>{stage.onward.date} · hacia {routeStages[index + 1].name}</small><b>{stage.onward.route}</b><em>{stage.onward.coverage}</em></div></div>}
        </React.Fragment>;
      })}
    </section>
  </main>;
}
