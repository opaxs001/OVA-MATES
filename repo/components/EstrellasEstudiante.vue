<template>
  <section class="stars-panel">
    <p class="eyebrow">RECOMPENSAS DE MISIÓN</p>
    <h3>Mis estrellas</h3>
    <div class="star-total" role="status" aria-live="polite">
      <span aria-hidden="true">⭐</span>
      <strong>{{ totalEstrellas }}</strong>
      <span>estrellas ganadas</span>
    </div>
    <p v-if="totalEstrellas === 0" class="empty-message">Responde correctamente en las actividades y evaluaciones para ganar estrellas.</p>
    <ul>
      <li v-for="mundo in mundos" :key="mundo.id">
        <span class="world-name"><span aria-hidden="true">{{ mundo.icono }}</span>{{ mundo.titulo }}</span>
        <strong :aria-label="`${estrellas[mundo.id] || 0} estrellas`">{{ estrellas[mundo.id] || 0 }} <span aria-hidden="true">⭐</span></strong>
      </li>
    </ul>
  </section>
</template>

<script setup>
import {computed} from 'vue'

const props=defineProps({mundos:{type:Array,required:true},estrellas:{type:Object,default:()=>({})}})
const totalEstrellas=computed(()=>props.mundos.reduce((total,mundo)=>total+(props.estrellas[mundo.id]||0),0))
</script>

<style scoped>
.stars-panel{color:#f5f7ff}.eyebrow{margin:0 0 6px;color:#a8c5ff;font-size:.68rem;font-weight:900;letter-spacing:.16em}.stars-panel h3{margin:0 0 18px;font-size:1.3rem}.star-total{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:18px;padding:22px;border:1px solid #ffdf8a66;border-radius:18px;background:linear-gradient(120deg,#ffca5b20,#8e72ff25)}.star-total span:first-child{font-size:2.4rem;filter:drop-shadow(0 0 12px #ffe58a88)}.star-total strong{color:#ffe5a2;font-size:2rem}.star-total span:last-child{color:#e1e7ff}.stars-panel ul{display:grid;gap:8px;margin:0;padding:0;list-style:none}.stars-panel li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid #b9caff24;border-radius:12px;background:#ffffff08}.world-name{display:flex;align-items:center;gap:9px}.stars-panel li strong{color:#ffe5a2;white-space:nowrap}.empty-message{margin:0 0 18px;padding:14px;border:1px solid #b9caff24;border-radius:12px;background:#ffffff08;color:#c7d2ef;text-align:center;line-height:1.5}
</style>
