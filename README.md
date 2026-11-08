# Japón · mayo de 2027

Agenda de viaje como PWA, preparada para iPhone y GitHub Pages.

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Publicación en GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` publica automáticamente la carpeta de producción al hacer push a `main` o `master`.

1. En GitHub, abre **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions** como fuente.
3. Haz push a la rama principal.
4. La URL será `https://USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

La aplicación detecta GitHub Actions y ajusta su ruta base automáticamente.

## Gestionar el itinerario

Pulsa el botón `⌘` de la cabecera y usa el PIN inicial `japon2027`. El bloqueo evita cambios accidentales durante el viaje, pero no es seguridad real: no hay servidor ni cuentas de usuario.

Los datos base viven en `src/data/defaultTrip.ts`; la interfaz solo los lee. Al editar desde la app, la versión personalizada se guarda en `localStorage` del navegador (`japan-trip-data-v2`), por lo que permanece al cerrar la PWA, pero no se sincroniza entre dispositivos.

Desde **Gestionar viaje** se puede editar o eliminar una jornada, crear una nueva, moverla arriba o abajo, modificar visitas, enlaces, horarios, tarifas y estados, y cambiar el detalle de los transportes. Los cambios se reflejan al instante en la agenda, ruta, alojamientos y mapa.

### Copias de seguridad

- **Exportar JSON** descarga una copia completa con fecha de actualización.
- **Importar JSON** analiza primero el archivo. Solo acepta el esquema de viaje, muestra el número de jornadas y hoteles que sustituirá, y exige una confirmación explícita.
- Si una importación no es válida, los datos actuales no se modifican.
- Antes de importar una guía nueva, exporta la versión actual; para recuperarla, impórtala de nuevo desde el mismo panel.

Para incorporar futuras revisiones del Word, actualiza o genera un JSON que conserve `schemaVersion: 1`, `days` y `hotels`, y revísalo en la pantalla de importación antes de confirmarlo. La importación nunca debe utilizarse para reemplazar datos confirmados con información ambigua.
