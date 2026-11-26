<template>
  <div class="controles" role="group" aria-label="Controles de la galaxia">
    <p class="pista">
      <span class="pista-item"><b aria-hidden="true">✥</b> Arrastra para girar</span>
      <span class="pista-item"><b aria-hidden="true">⌕</b> Rueda o pellizca para acercar</span>
      <span class="pista-item"><b aria-hidden="true">☉</b> Toca un planeta</span>
    </p>
    <div class="botones">
      <button type="button" @click="$emit('recentrar')"><span aria-hidden="true">⟲</span> Recentrar vista</button>
      <button type="button" :aria-pressed="pausado" @click="alternar">
        <span aria-hidden="true">{{ pausado ? '▶' : '‖' }}</span> {{ pausado ? 'Reanudar órbitas' : 'Pausar órbitas' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ recentrar: []; pausar: [pausa: boolean] }>()
const pausado = ref(false)

function alternar() {
  pausado.value = !pausado.value
  emit('pausar', pausado.value)
}
</script>

<style scoped>
.controles { position: absolute; z-index: 5; left: 50%; bottom: 58px; display: flex; flex-direction: column; align-items: center; gap: 9px; width: max-content; max-width: calc(100% - 24px); transform: translateX(-50%); pointer-events: none; }
.pista { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 16px; margin: 0; color: #9fb0e6; font-size: .74rem; font-weight: 700; text-shadow: 0 1px 8px #020615; }
.pista b { margin-right: 4px; color: #8edbff; }
.botones { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; }
.botones button { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 8px 14px; border: 1px solid #d8e4ff30; border-radius: 999px; background: #0f1738cc; color: #e6ecff; font-size: .78rem; font-weight: 800; cursor: pointer; pointer-events: auto; backdrop-filter: blur(10px); transition: transform .25s ease, background .25s ease, border-color .25s ease; }
.botones button:hover, .botones button:focus-visible { transform: translateY(-2px); border-color: #9bb6ffa0; background: #26306aee; outline: none; }
.botones button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.botones button[aria-pressed='true'] { border-color: #ffd98a99; color: #ffe4a6; }
@media (max-width: 760px) { .controles { bottom: 52px; } .pista { font-size: .68rem; gap: 2px 10px; } .pista-item:nth-child(2) { display: none; } }
</style>
