<template>
  <div class="lista-respaldo">
    <p class="aviso">Tu dispositivo no puede mostrar la galaxia en 3D. Elige un planeta de la lista:</p>
    <ul>
      <li v-for="(planeta, i) in planetas" :key="planeta.id">
        <button type="button" :style="{ '--acento': acento(planeta.color, i) }" @click="$emit('seleccionar', planeta.id)">
          <span class="icono" aria-hidden="true">{{ planeta.icono.normalize('NFKC') }}</span>
          <span class="textos">
            <strong>{{ planeta.titulo }}</strong>
            <small>{{ planeta.subtitulo }}</small>
          </span>
          <span v-if="registro[planeta.id] !== undefined" class="logro">★ {{ registro[planeta.id] }}/10</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { configDe } from '../../utils/galaxia/config'
import type { PlanetaDato } from '../../utils/galaxia/tipos'

defineProps<{ planetas: PlanetaDato[]; registro: Record<string, number> }>()
defineEmits<{ seleccionar: [id: string] }>()

const acento = (color: string, indice: number) => configDe(color, indice).acento
</script>

<style scoped>
.lista-respaldo { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: 16px; padding: 110px 18px 70px; overflow: auto; }
.aviso { margin: 0; color: #c3cff2; text-align: center; }
ul { display: grid; width: min(100%, 480px); gap: 10px; margin: 0; padding: 0; list-style: none; }
button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--acento) 45%, transparent); border-radius: 16px; background: #111838dd; color: #f8f8ff; font: inherit; text-align: left; cursor: pointer; transition: transform .25s ease, background .25s ease; }
button:hover, button:focus-visible { transform: translateY(-2px); background: #1f2858ee; }
.icono { display: grid; flex: 0 0 auto; width: 42px; height: 42px; place-items: center; border-radius: 50%; background: radial-gradient(circle at 30% 25%, #ffffff66, var(--acento)); font-family: 'Orbitron', sans-serif; font-size: 1.3rem; font-weight: 900; }
.textos { display: flex; flex: 1; flex-direction: column; gap: 3px; }
.textos small { color: #b3bfe8; }
.logro { color: #ffe29a; font-size: .8rem; font-weight: 900; }
</style>
