import React from 'react';
import type { Transport } from './types';
import { transportGuide } from './data/transportGuide';

export function TransportCoverage({ transport }: { transport: Transport }) {
  const info = transportGuide[transport.id];
  return <>
    {info && <div className="coverage-note">
      <span>{info.badge}</span><p>{info.explanation}</p>
      {info.action && <p className="coverage-action"><b>Siguiente paso:</b> {info.action}</p>}
      {info.url && <a href={info.url} target="_blank" rel="noreferrer">Fuente oficial / gestión ↗</a>}
    </div>}
  </>;
}
