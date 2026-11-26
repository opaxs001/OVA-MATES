<template>
  <section class="progress-panel">
    <p class="eyebrow">DIARIO DE VIAJE</p><h3>Tu progreso estelar</h3>
    <div class="summary"><div><strong>{{ completados.length }}/5</strong><span>Mundos completados</span></div><div><strong>{{ puntos }}</strong><span>Puntos obtenidos</span></div><div><strong>{{ porcentaje }}%</strong><span>Avance total</span></div></div>
    <div class="progress-track"><span :style="{width:`${porcentaje}%`}"></span></div>
    <ul><li v-for="mundo in mundos" :key="mundo.id"><span>{{ mundo.icono }} {{ mundo.titulo }}</span><b v-if="registro[mundo.id] !== undefined">{{ registro[mundo.id] }}/10</b><span v-else class="pending">Pendiente</span></li></ul>
    <div v-if="completados.length===5" class="award"><span>🏆</span><strong>¡Explorador/a de AstroMat!</strong><p>Has completado las cinco misiones matemáticas. ¡La galaxia celebra tu esfuerzo!</p></div>
  </section>
</template>
<script setup>
import {computed} from 'vue'
const props=defineProps({mundos:{type:Array,required:true},registro:{type:Object,default:()=>({})}})
const completados=computed(()=>props.mundos.filter(m=>props.registro[m.id]!==undefined))
const puntos=computed(()=>Object.values(props.registro).reduce((a,b)=>a+b,0))
const porcentaje=computed(()=>Math.round(completados.value.length/5*100))
</script>
<style scoped>
.progress-panel{color:#f5f7ff}.eyebrow{margin:0 0 6px;color:#a8c5ff;font-size:.68rem;font-weight:900;letter-spacing:.16em}.progress-panel h3{margin:0 0 18px;font-size:1.3rem}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.summary div{display:grid;gap:5px;padding:14px 8px;text-align:center;border:1px solid #b9caff30;border-radius:15px;background:#ffffff0b}.summary strong{font-size:1.6rem;color:#ffe3a0}.summary span{color:#c7d2ef;font-size:.75rem}.progress-track{height:9px;margin:17px 0;overflow:hidden;border-radius:9px;background:#ffffff1c}.progress-track span{display:block;height:100%;background:linear-gradient(90deg,#53d9c0,#8b79ff);transition:width .4s}.progress-panel ul{display:grid;gap:8px;padding:0;list-style:none}.progress-panel li{display:flex;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid #b9caff24;border-radius:12px;background:#ffffff08}.progress-panel li b{color:#8af0c9}.pending{color:#aebbdc;font-size:.85rem}.award{margin-top:18px;padding:19px;text-align:center;border:1px solid #ffdf8a88;border-radius:18px;background:linear-gradient(120deg,#ffca5b24,#8e72ff25)}.award span{display:block;font-size:2rem}.award strong{color:#ffe5a2;font-size:1.1rem}.award p{margin:7px 0 0;color:#e1e7ff}
</style>
