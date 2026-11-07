const providers = [
  ['JR West', 'Kuroshio · Kii-Katsuura · Kyoto · ICOCA', 'https://www.westjr.co.jp/global/en/'],
  ['JR Central', 'Shinkansen Tokaido · Limited Express Hida', 'https://global.jr-central.co.jp/en/'],
  ['Nankai Railway', 'Aeropuerto KIX ↔ Namba · Rapi:t y Airport Express', 'https://www.nankai.co.jp/en_railway/'],
  ['Kumano Travel', 'Autobuses de Kawayu, Hongu, Shingu y Nachi', 'https://www.kumano-travel.com/en'],
  ['Osaka Metro', 'Tarifas y planificación urbana', 'https://subway-tr.osakametro.co.jp/guide/fare/fare/price.php'],
];

function attachPanel() {
  const journey = document.querySelector('.journey');
  if (!journey || document.querySelector('.booking-panel')) return;
  const panel = document.createElement('section');
  panel.className = 'booking-panel';
  panel.innerHTML = `<p class="eyebrow">BILLETES Y VERIFICACIÓN</p><h2>Antes de reservar</h2><p class="booking-copy">Las frecuencias de mayo de 2027 aún no están publicadas. Estas son las fuentes oficiales para comprar cuando se abran ventas, consultar horarios y validar los enlaces.</p><div class="provider-grid">${providers.map(([name, description, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><b>${name}</b><span>${description}</span><em>Consultar ↗</em></a>`).join('')}</div><p class="booking-note">Para los trayectos de Kumano, priorizad Kumano Travel y confirmad la parada exacta, el último bus útil y el espacio para equipaje. No se muestran como reservas los horarios que el documento deja pendientes.</p>`;
  journey.parentElement?.prepend(panel);
}

new MutationObserver(attachPanel).observe(document.body, { childList: true, subtree: true });
document.addEventListener('click', () => setTimeout(attachPanel, 0));
