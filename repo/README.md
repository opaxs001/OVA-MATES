# AstroMat: Números a Bordo

Proyecto OVA desarrollado con Nuxt 3 y Vue 3. La experiencia mantiene sus contenidos matemáticos, preguntas, ejemplos, recursos y estructura educativa originales.

## Estructura principal

- `app.vue`: pantalla de bienvenida, transición espacial y control de audio.
- `components/PantallaBienvenida.vue`: pantalla inicial.
- `components/BotonPrincipal.vue`: botón reutilizable.
- `components/SeleccionContenidos.vue`: galaxia 3D interactiva y selección de mundos.
- `components/MundoAprendizaje.vue`: navegación por las secciones de cada mundo con transiciones.
- `components/LeccionMatematica.vue`: conceptos, ejemplos e ilustraciones.
- `components/ActividadInteractiva.vue`: práctica con retroalimentación inmediata y efecto sonoro al acertar.
- `components/EvaluacionMundo.vue`: diez preguntas autocorregibles, navegación por flechas entre opciones y sonido al finalizar.
- `components/ProgresoEstudiante.vue`: avance y reconocimiento final.
- `components/RecursosEducativos.vue`: biblioteca de recursos externos.
- `components/Creditos.vue`: fotografías y nombres del equipo; datos institucionales editables.
- `composables/useCompletionSound.ts`: efecto breve generado con Web Audio API al completar actividades.
- `data/mundos.js`: contenido educativo y banco de preguntas, conservados sin cambios.
- `public/audio/`: pistas y efectos originales.
- `public/fotos-integrantes/`: fotografías del equipo mostradas automáticamente en Créditos.

## Galaxia 3D

La selección de planetas es ahora un entorno 3D (three.js) sin Pinia ni base de datos; todo el estado vive en componentes y composables de Vue.

- `components/galaxia/GalaxiaEscena3D.vue`: escena completa; monta el lienzo, las etiquetas y los controles.
- `components/galaxia/PlanetaEtiqueta.vue`: botón accesible (teclado/lector de pantalla) que el motor proyecta sobre cada planeta.
- `components/galaxia/GalaxiaControles.vue`: ayuda de uso, recentrar vista y pausar órbitas.
- `components/galaxia/GalaxiaListaPlanetas.vue`: alternativa automática si el dispositivo no soporta WebGL.
- `composables/useGalaxia3D.ts`: puente Vue ↔ motor (import dinámico solo en cliente, compatible con SSR).
- `composables/useRutaPublica.ts`: rutas de `/public` compatibles con `baseURL`.
- `utils/galaxia/`: motor sin dependencias de Vue (`motor.ts`), `cuerpos.ts` (sol, planetas, órbitas, cinturón, satélite), `fondo.ts` (estrellas, galaxia espiral, nebulosas, símbolos), `texturas.ts` (texturas procedurales, sin imágenes nuevas), `config.ts` y `tipos.ts`.

Interacción: arrastrar para orbitar, rueda/pellizco para acercar, tocar un planeta (o su etiqueta, con Tab + Enter) para que la cámara vuele hasta él y abra su mundo. Al volver, la cámara regresa a la vista libre. Respeta `prefers-reduced-motion`.

## Interacciones añadidas

- Las opciones de evaluación responden al hover y al foco visible con movimiento sutil.
- Las flechas del teclado permiten desplazarse entre opciones de una misma pregunta; Tab sigue disponible para recorrer controles.
- La retroalimentación de la actividad aparece con transición.
- El efecto de finalización es generado por Web Audio API y no requiere archivos de audio adicionales.
- Las fotografías se cargan desde `public/fotos-integrantes/`; los nombres visibles corresponden a los nombres de archivo suministrados.

## Ejecución

```bash
npm install
npm run dev
```

El progreso de las evaluaciones continúa guardándose en el almacenamiento local del navegador.

## Restricción de formatos

No se agregaron archivos `.html` ni `.css`. Los estilos permanecen dentro de los bloques `<style scoped>` de los componentes `.vue`, y toda la nueva lógica está en Vue/Nuxt.
