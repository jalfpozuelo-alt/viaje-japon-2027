import type { Trip } from './types';

export function Prepare({ trip, done, toggle }: { trip: Trip; done: string[]; toggle: (id: string) => void }) {
  const tasks = trip.preparation ?? [];
  const groups = [...new Set(tasks.map(task => task.group))];
  return <main className="page prepare-page">
    <div className="prepare-hero"><p className="eyebrow">GUÍA DE BOLSILLO · JAPÓN 2027</p><h1>Antes de viajar</h1><p>Un paso cada vez. Lo que depende de horarios o reglas futuras queda señalado para volver a comprobarlo.</p></div>
    <section><h2>Lista de preparación</h2><p className="prepare-intro">Marca cada paso al resolverlo. El estado se guarda en este iPhone.</p>
      {groups.map(group => <div className="prep-group" key={group}><h3>{group}</h3>{tasks.filter(task => task.group === group).map(task => <article className="prep-task" key={task.id}>
        <button aria-label={done.includes(task.id) ? 'Marcar pendiente' : 'Marcar completada'} className={done.includes(task.id) ? 'prep-check checked' : 'prep-check'} onClick={() => toggle(task.id)}>{done.includes(task.id) ? '✓' : ''}</button>
        <div><small>{task.status === 'opcional' ? 'OPCIONAL' : 'PENDIENTE DE VERIFICAR'}</small><h4>{task.title}</h4><p>{task.detail}</p><b className="prep-timing">{task.timing}</b>{task.official && <a href={task.official} target="_blank" rel="noreferrer">Consultar fuente oficial ↗</a>}</div>
      </article>)}</div>)}
    </section>
    <section className="manners-section"><p className="eyebrow">UN VIAJE RESPETUOSO</p><h2>Buenas prácticas como visitantes</h2><p>Son pautas para orientarse; las normas concretas del lugar y sus carteles tienen prioridad.</p>
      {(trip.manners ?? []).map(group => <div className="manners-group" key={group.id}><h3>{group.title}</h3>{group.tips.map(tip => <article className="manners-tip" key={tip.id}><h4>{tip.title}</h4><p>{tip.detail}</p>{tip.places?.length ? <small>Especialmente en: {tip.places.join(' · ')}</small> : null}{tip.official && <a href={tip.official} target="_blank" rel="noreferrer">Más información oficial ↗</a>}</article>)}</div>)}
    </section>
  </main>;
}
