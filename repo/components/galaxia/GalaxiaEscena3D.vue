<template>
  <div class="galaxia-escena" :class="{ 'en-foco': !!planetaActivo, 'esta-lista': estado === 'listo' }">
    <!-- Lienzo WebGL (lo crea y gestiona utils/galaxia/motor.ts) -->
    <div ref="contenedor" class="galaxia-lienzo"></div>

    <!-- Etiquetas HTML: botones reales (accesibles por teclado) que el motor proyecta sobre cada planeta -->
    <div v-if="estado !== 'error'" class="galaxia-etiquetas">
      <PlanetaEtiqueta
        v-for="(planeta, i) in planetas"
        :key="planeta.id"
        :ref="(componente: any) => guardarEtiqueta(planeta.id, componente)"
        :dato="planeta"
        :acento="configDe(planeta.color, i).acento"
        :puntaje="registro[planeta.id]"
        :resaltado="idResaltado === planeta.id"
        @seleccionar="$emit('seleccionar', $event)"
        @entrar="resaltar"
        @salir="resaltar(null)"
      />
    </div>

    <Transition name="carga">
      <div v-if="estado === 'cargando'" class="galaxia-carga" role="status" aria-live="polite">
        <div class="carga-orbita" aria-hidden="true"><span></span></div>
        <p>Preparando la galaxia…</p>
        <div class="carga-barra" aria-hidden="true"><i :style="{ width: `${Math.round(progreso * 100)}%` }"></i></div>
      </div>
    </Transition>

    <GalaxiaControles
      v-if="estado === 'listo' && !planetaActivo"
      @recentrar="recentrar"
      @pausar="pausarOrbitas"
    />

    <GalaxiaListaPlanetas
      v-if="estado === 'error'"
      :planetas="planetas"
      :registro="registro"
      @seleccionar="$emit('seleccionar', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { configDe } from '../../utils/galaxia/config'
import type { PlanetaDato } from '../../utils/galaxia/tipos'
import GalaxiaControles from './GalaxiaControles.vue'
import GalaxiaListaPlanetas from './GalaxiaListaPlanetas.vue'
import PlanetaEtiqueta from './PlanetaEtiqueta.vue'

const props = withDefaults(
  defineProps<{
    planetas: PlanetaDato[]
    registro?: Record<string, number>
    /** Id del planeta abierto: la cámara vuela hacia él. `null` = vista libre. */
    planetaActivo?: string | null
  }>(),
  { registro: () => ({}), planetaActivo: null }
)

const contenedor = ref<HTMLElement | null>(null)
const etiquetas = new Map<string, HTMLElement>()

const emit = defineEmits<{ seleccionar: [id: string] }>()

const { estado, progreso, idResaltado, iniciar, enfocar, liberar, resaltar, recentrar, pausarOrbitas } = useGalaxia3D({
  contenedor,
  planetas: () => props.planetas,
  etiquetas,
  alSeleccionar: id => emit('seleccionar', id)
})

function guardarEtiqueta(id: string, componente: any) {
  const el = componente?.$el as HTMLElement | undefined
  if (el) etiquetas.set(id, el)
  else etiquetas.delete(id)
}

watch(
  () => props.planetaActivo,
  id => (id ? enfocar(id) : liberar()),
  { immediate: false }
)

onMounted(() => {
  iniciar()
  if (props.planetaActivo) enfocar(props.planetaActivo)
})

defineExpose({ recentrar, pausarOrbitas })
</script>

<style scoped>
.galaxia-escena { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(ellipse at 50% 46%, #1b245a 0%, #0d1233 52%, #050818 100%); }
.galaxia-lienzo { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease; }
.esta-lista .galaxia-lienzo { opacity: 1; }
.galaxia-lienzo :deep(canvas) { display: block; width: 100%; height: 100%; outline: none; touch-action: none; }
.galaxia-etiquetas { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.en-foco .galaxia-lienzo { pointer-events: none; }
.en-foco::after { position: absolute; inset: 0; content: ''; background: radial-gradient(ellipse at center, #05081840 0%, #050818c4 100%); animation: velo .9s ease both; pointer-events: none; }
.galaxia-carga { position: absolute; inset: 0; z-index: 6; display: grid; place-content: center; justify-items: center; gap: 16px; background: radial-gradient(ellipse at 50% 46%, #1b245a 0%, #0d1233 52%, #050818 100%); color: #cfd9ff; font-weight: 800; }
.galaxia-carga p { margin: 0; letter-spacing: .06em; }
.carga-orbita { position: relative; width: 74px; height: 74px; border: 1px solid #a4b9ff40; border-radius: 50%; animation: giro 1.6s linear infinite; }
.carga-orbita span { position: absolute; top: -6px; left: 50%; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff, #70cfff); box-shadow: 0 0 14px #70cfff; }
.carga-barra { width: 180px; height: 5px; overflow: hidden; border-radius: 99px; background: #ffffff18; }
.carga-barra i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #70cfff, #b38cff); transition: width .3s ease; }
.carga-leave-active { transition: opacity .8s ease; }
.carga-leave-to { opacity: 0; }
@keyframes giro { to { transform: rotate(360deg); } }
@keyframes velo { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .carga-orbita { animation-duration: 6s; } .galaxia-lienzo, .carga-leave-active { transition-duration: .01ms; } }
</style>
