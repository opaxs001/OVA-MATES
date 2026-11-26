<template>
  <button
    class="etiqueta"
    :class="{ 'is-hover': resaltado }"
    :style="{ '--acento': acento }"
    type="button"
    :aria-label="`Abrir ${dato.titulo}: ${dato.subtitulo}${puntaje !== undefined ? `. Resultado ${puntaje} de 10` : ''}`"
    @click="$emit('seleccionar', dato.id)"
    @pointerenter="$emit('entrar', dato.id)"
    @pointerleave="$emit('salir')"
    @focus="$emit('entrar', dato.id)"
    @blur="$emit('salir')"
  >
    <span class="tarjeta">
      <span class="icono" aria-hidden="true">{{ dato.icono.normalize('NFKC') }}</span>
      <span class="textos">
        <strong>{{ dato.titulo }}</strong>
        <small>{{ dato.subtitulo }}</small>
      </span>
      <span v-if="puntaje !== undefined" class="logro" aria-hidden="true">★ {{ puntaje }}/10</span>
    </span>
    <span class="tallo" aria-hidden="true"></span>
  </button>
</template>

<script setup lang="ts">
import type { PlanetaDato } from '../../utils/galaxia/tipos'

defineProps<{
  dato: PlanetaDato
  acento: string
  puntaje?: number
  resaltado?: boolean
}>()
defineEmits<{ seleccionar: [id: string]; entrar: [id: string]; salir: [] }>()
</script>

<style scoped>
/* El motor 3D controla `transform`, `z-index` y `data-visible` de este elemento. */
.etiqueta { position: absolute; top: 0; left: 0; display: flex; flex-direction: column; align-items: center; padding: 0; border: 0; background: transparent; color: #f8f8ff; font: inherit; cursor: pointer; pointer-events: auto; transform-origin: 50% 100%; will-change: transform; transition: opacity .45s ease, visibility 0s linear 0s; outline: none; }
.etiqueta:not([data-visible='true']) { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .35s ease, visibility 0s linear .35s; }
.tarjeta { display: flex; align-items: center; gap: 9px; max-width: 250px; padding: 7px 13px 7px 8px; border: 1px solid color-mix(in srgb, var(--acento) 34%, #c6d3ff22); border-radius: 15px; background: linear-gradient(135deg, #0d1330e6, #171d45d6); box-shadow: 0 8px 26px #02061566, 0 0 0 0 var(--acento); backdrop-filter: blur(8px); text-align: left; transition: transform .25s cubic-bezier(.2, .8, .2, 1), border-color .25s ease, box-shadow .25s ease, background .25s ease; }
.icono { display: grid; flex: 0 0 auto; width: 34px; height: 34px; place-items: center; border-radius: 11px; background: radial-gradient(circle at 30% 25%, #ffffff55, color-mix(in srgb, var(--acento) 70%, #1b2260)); box-shadow: 0 0 14px color-mix(in srgb, var(--acento) 55%, transparent); color: #fff; font-family: 'Orbitron', 'Nunito', sans-serif; font-size: 1.1rem; font-weight: 900; text-shadow: 0 1px 6px #10133290; }
.textos { display: flex; min-width: 0; flex-direction: column; gap: 2px; }
.textos strong { font-size: .84rem; font-weight: 900; line-height: 1.2; }
.textos small { color: #b3bfe8; font-size: .7rem; line-height: 1.2; }
.logro { align-self: flex-start; padding: 2px 7px; border-radius: 999px; background: #ffd66b26; color: #ffe29a; font-size: .64rem; font-weight: 900; white-space: nowrap; }
.tallo { width: 1px; height: 14px; background: linear-gradient(to bottom, var(--acento), transparent); opacity: .8; }
.etiqueta:hover .tarjeta, .etiqueta.is-hover .tarjeta, .etiqueta:focus-visible .tarjeta { transform: translateY(-4px) scale(1.05); border-color: var(--acento); background: linear-gradient(135deg, #1b2457f2, #232b66ec); box-shadow: 0 12px 30px #02061577, 0 0 22px color-mix(in srgb, var(--acento) 45%, transparent); }
.etiqueta:focus-visible .tarjeta { outline: 2px solid #fff; outline-offset: 3px; }
@media (max-width: 760px) { .tarjeta { max-width: 170px; gap: 7px; padding: 5px 10px 5px 6px; } .icono { width: 28px; height: 28px; font-size: .95rem; } .textos strong { font-size: .72rem; } .textos small { display: none; } .logro { display: none; } }
@media (prefers-reduced-motion: reduce) { .tarjeta, .etiqueta { transition-duration: .01ms !important; } }
</style>
