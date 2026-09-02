# NETVISION — versión unificada

Esta versión une las dos bases entregadas:

- **Diseño:** tomado como referencia del concepto NETVISION proporcionado: selección de perfil, menú principal, TV en vivo con lista lateral, reproductor de películas y reproductor de series con episodios.
- **Funcionalidad de reproducción:** basada en PRUEBAS V5, conservando resolución de fuentes, HLS, MP4 y reproductores externos/iframe.
- **TV en vivo:** usa `canales.m3u` y HLS.js.
- **Perfiles:** nombre, avatar, fondo, edición, eliminación y creación de perfiles mediante `localStorage`.
- **Catálogo:** Películas y Series desde PelisPlusHD / LaMovie mediante `api.js`.
- **Diagnóstico de reproducción:** eliminado completamente.
- **Móvil:** el reproductor de contenido utiliza una sola superficie visible; nunca se muestra un segundo reproductor debajo del primero.

## Estructura

Todos los archivos están en la raíz para que sea compatible con la estructura que venías utilizando:

- `index.html`
- `style.css`
- `app.js`
- `api.js`
- `movies.js`
- `reproductor.js`
- `perfiles.js`
- `tv.js`
- `canales.m3u`

## Uso

Abre el proyecto desde un servidor local o publícalo en GitHub Pages. Para `fetch()` de `canales.m3u` y las APIs es recomendable usar HTTP/HTTPS en lugar de abrir `index.html` directamente con `file://`.

La reproducción depende de que la fuente entregada por la API permita CORS, HLS o iframe y de las restricciones del proveedor. No se implementa ningún bypass de DRM.
