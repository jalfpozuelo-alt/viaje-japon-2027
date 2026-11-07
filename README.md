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
