<template>
  <main class="galaxy-screen" aria-label="Selección de contenidos">
    <!-- Entorno 3D de fondo: permanece montado y la cámara vuela al planeta elegido -->
    <GalaxiaEscena3D
      class="galaxy-3d"
      :planetas="contenidos"
      :registro="registro"
      :planeta-activo="contenidoSeleccionado ? contenidoSeleccionado.id : null"
      @seleccionar="seleccionarPorId"
    />

    <header class="galaxy-header">
      <button class="home-button" type="button" @click="regresarInicio" aria-label="Volver a la pantalla de entrada">
        <span aria-hidden="true">←</span> Inicio
      </button>
      <div class="header-copy">
        <p class="eyebrow"><span class="eyebrow-dot"></span> CENTRO DE EXPLORACIÓN</p>
        <h1>Elige tu planeta</h1>
        <p class="subtitle">Cada mundo guarda un espacio para un nuevo contenido.</p>
      </div>
      <div class="header-orbit" aria-hidden="true">✦</div>
    </header>

    <div class="galaxy-stage">
      <Transition name="topic-panel" mode="out-in">
        <div v-if="contenidoSeleccionado" :key="contenidoSeleccionado.id" class="world-shell">
          <MundoAprendizaje
            :mundo="contenidoSeleccionado"
            :mundos="contenidos"
            :registro="registro"
            @volver="volverPlanetas"
            @completada="guardarResultado"
          />
        </div>
        <div v-else key="vista-galaxia" class="stage-spacer" aria-hidden="true"></div>
      </Transition>
    </div>

    <footer class="galaxy-footer">
      <span class="footer-star" aria-hidden="true">✦</span>
      <span>{{ contenidoSeleccionado ? 'Tu próxima aventura te espera en la galaxia.' : 'Pulsa un planeta para viajar hasta él y explorar su contenido.' }}</span>
      <span class="footer-star" aria-hidden="true">✦</span>
    </footer>
  </main>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import MundoAprendizaje from './MundoAprendizaje.vue'
import GalaxiaEscena3D from './galaxia/GalaxiaEscena3D.vue'
import { mundos } from '../data/mundos.js'

const emit = defineEmits(['volverInicio'])
const contenidoSeleccionado = ref(null)
const audio = inject('audio', null)
const registro = ref({})
onMounted(() => {
  try { registro.value = JSON.parse(localStorage.getItem('astromat-progreso') || '{}') } catch { registro.value = {} }
})
function guardarResultado(resultado) {
  registro.value = { ...registro.value, [resultado.mundoId]: resultado.puntaje }
  localStorage.setItem('astromat-progreso', JSON.stringify(registro.value))
}

const contenidos = mundos

function seleccionarPorId(id) {
  const contenido = contenidos.find(c => c.id === id)
  if (contenido) abrirContenido(contenido)
}

function abrirContenido(contenido) {
  audio?.playUiSound(`planet-${contenido.id}`)
  contenidoSeleccionado.value = contenido
}

function volverPlanetas() {
  audio?.playUiSound('back')
  contenidoSeleccionado.value = null
}

function regresarInicio() {
  emit('volverInicio')
}
</script>

<style scoped>
.galaxy-screen { position: relative; display: flex; min-height: 100svh; flex-direction: column; overflow: hidden; isolation: isolate; padding: clamp(18px, 3vw, 34px) clamp(16px, 4vw, 54px) 22px; color: #f8f8ff; background: radial-gradient(ellipse at 50% 44%, #1b245a 0%, #101536 49%, #070b22 100%); }
.galaxy-3d { position: fixed; z-index: -1; inset: 0; }
.galaxy-header { position: relative; display: grid; grid-template-columns: minmax(105px, 1fr) minmax(0, 3fr) minmax(105px, 1fr); align-items: start; width: min(100%, 1320px); margin: 0 auto; pointer-events: none; }
.galaxy-header > * { pointer-events: auto; }
.header-copy { pointer-events: none; }
.home-button { justify-self: start; display: inline-flex; align-items: center; gap: 9px; padding: 10px 15px; border: 1px solid #d8e4ff2b; border-radius: 14px; background: #0a1030a8; color: #e2e8ff; font-weight: 800; cursor: pointer; backdrop-filter: blur(8px); transition: transform .25s ease, background .25s ease, border-color .25s ease; }
.home-button span { font-size: 1.3rem; line-height: .8; }
.home-button:hover { transform: translateX(-3px); border-color: #9bb6ff8c; background: #ffffff17; }
.header-copy { text-align: center; }
.eyebrow { display: flex; align-items: center; justify-content: center; gap: 9px; margin: 0 0 12px; color: #a6b7ff; font-size: .72rem; font-weight: 900; letter-spacing: .2em; }
.eyebrow-dot { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: #77f2f2; box-shadow: 0 0 12px #6af3ff; }
.header-copy h1 { margin: 0; font-family: 'Orbitron', 'Nunito', sans-serif; font-size: clamp(1.6rem, 4vw, 2.8rem); font-weight: 800; letter-spacing: -.035em; text-shadow: 0 0 28px #728bff80, 0 2px 14px #020615; }
.subtitle { margin: 12px 0 0; color: #c3cdef; font-size: clamp(.86rem, 1.5vw, 1rem); text-shadow: 0 1px 10px #020615; }
.header-orbit { justify-self: end; display: grid; width: 42px; aspect-ratio: 1; place-items: center; border: 1px solid #9bafff35; border-radius: 50%; color: #d5ddff; font-size: 1.35rem; box-shadow: 0 0 25px #7d88ff15; animation: header-orbit 8s linear infinite; }

/* Escenario: en vista de galaxia es un espaciador transparente (los clics atraviesan hasta el 3D) */
.galaxy-stage { position: relative; display: flex; flex: 1; flex-direction: column; width: min(100%, 1020px); margin: 0 auto; pointer-events: none; }
.stage-spacer { flex: 1; min-height: 380px; }
.world-shell { width: 100%; margin: 14px 0 6px; padding: 8px clamp(14px, 3vw, 28px) 18px; border: 1px solid #b9caff24; border-radius: 26px; background: linear-gradient(160deg, #0a1033d9, #070b24ca); box-shadow: 0 30px 90px #02061599, inset 0 1px 0 #ffffff12; backdrop-filter: blur(14px); pointer-events: auto; }

.galaxy-footer { position: relative; display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 4px; color: #aab7e8; font-size: .82rem; text-align: center; text-shadow: 0 1px 8px #020615; pointer-events: none; }
.footer-star { color: #a4d8ff; text-shadow: 0 0 12px #8edbff; }
.topic-panel-enter-active, .topic-panel-leave-active { transition: opacity .35s ease, transform .35s ease; }
.topic-panel-enter-active { transition-delay: .35s; }
.topic-panel-enter-from { opacity: 0; transform: translateY(14px) scale(.98); }
.topic-panel-leave-to { opacity: 0; transform: translateY(-8px) scale(.99); }
@keyframes header-orbit { to { transform: rotate(360deg); } }
@media (max-width: 760px) { .galaxy-header { grid-template-columns: 1fr auto; gap: 16px 8px; } .home-button { grid-column: 1; grid-row: 1; } .header-orbit { grid-column: 2; grid-row: 1; } .header-copy { grid-column: 1 / -1; grid-row: 2; } .stage-spacer { min-height: 460px; } }
@media (max-width: 440px) { .galaxy-screen { padding: 16px 12px 18px; } .header-copy h1 { font-size: 1.55rem; } .subtitle { max-width: 290px; margin-left: auto; margin-right: auto; font-size: .8rem; } .galaxy-footer { padding: 0 6px; font-size: .72rem; } .world-shell { border-radius: 20px; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; transition-delay: 0s !important; scroll-behavior: auto !important; } }
</style>
