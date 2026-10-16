# Fondo animado de MaquiFly

Fuente: la imagen existente `public/hero-maquinaria.jpg`, conservada sin cambios.
Es una **animación de una imagen**, no una filmación de maquinaria trabajando:
movimiento suave de cámara y una ligera bruma de luz cálida a la derecha.

| Archivo | Resolución | Duración | Fotogramas |
| --- | --- | --- | --- |
| `maquifly-hero.mp4` | 1600 × 600 | 12 segundos | 24 fps |
| `maquifly-hero-mobile.mp4` | 540 × 720 | 12 segundos | 24 fps |

Ambos usan H.264, `yuv420p`, sin audio y con `faststart` para web. Los
movimientos completan un ciclo de 12 segundos para evitar saltos al repetir.
La versión móvil recorta la imagen hacia el 70 % horizontal para conservar
la maquinaria. El video mantiene el texto y el buscador como elementos HTML.

Para regenerar desde la raíz del repositorio, con FFmpeg y ffprobe instalados:

```sh
bash scripts/generate-hero-video.sh
```

El script no descarga recursos ni modifica la imagen original. Usa dos hilos
para los filtros y dos para el codificador; los archivos finales se sustituyen
solo después de terminar su codificación y comprobarlos con ffprobe.
