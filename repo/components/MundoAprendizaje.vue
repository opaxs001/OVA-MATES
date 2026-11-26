<template>
  <section class="learning-world">
    <div class="world-top">
      <button type="button" class="back" @click="$emit('volver')">← Volver a los planetas</button>
      <div class="world-title"><span>{{ mundo.icono }}</span><div><p>DESTINO ACTUAL</p><h2>{{ mundo.titulo }}</h2></div></div>
    </div>
    <nav class="tabs" aria-label="Secciones del mundo">
      <button v-for="tab in tabs" :key="tab.id" :class="{active:seccion===tab.id}" @click="seccion=tab.id">{{ tab.icon }} {{ tab.nombre }}</button>
    </nav>
    <Transition name="fade" mode="out-in">
      <LeccionMatematica v-if="seccion==='contenido'" :key="`lesson-${mundo.id}`" :mundo="mundo"/>
      <ActividadInteractiva v-else-if="seccion==='actividad'" :key="`activity-${mundo.id}`" :mundo-id="mundo.id" :actividad="mundo.actividad"/>
      <EvaluacionMundo v-else-if="seccion==='evaluacion'" :key="`test-${mundo.id}`" :mundo-id="mundo.id" :preguntas="mundo.preguntas" @completada="$emit('completada',$event)"/>
      <ProgresoEstudiante v-else-if="seccion==='progreso'" :mundos="mundos" :registro="registro"/>
      <RecursosEducativos v-else-if="seccion==='recursos'" :mundos="mundos"/>
      <Creditos v-else/>
    </Transition>
  </section>
</template>
<script setup>
import {ref} from 'vue'
import LeccionMatematica from './LeccionMatematica.vue'
import ActividadInteractiva from './ActividadInteractiva.vue'
import EvaluacionMundo from './EvaluacionMundo.vue'
import ProgresoEstudiante from './ProgresoEstudiante.vue'
import RecursosEducativos from './RecursosEducativos.vue'
import Creditos from './Creditos.vue'
defineProps({mundo:{type:Object,required:true},mundos:{type:Array,required:true},registro:{type:Object,default:()=>({})}})
defineEmits(['volver','completada'])
const seccion=ref('contenido')
const tabs=[{id:'contenido',nombre:'Contenido',icon:'📘'},{id:'actividad',nombre:'Actividad',icon:'🧩'},{id:'evaluacion',nombre:'Evaluación',icon:'📝'},{id:'progreso',nombre:'Avance',icon:'🚀'},{id:'recursos',nombre:'Recursos',icon:'📚'},{id:'creditos',nombre:'Créditos',icon:'👩‍🚀'}]
</script>
<style scoped>
.learning-world{width:min(100%,980px);margin:0 auto;padding:18px 0 8px}.world-top{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:20px}.back{padding:10px 14px;border:1px solid #d3deff36;border-radius:12px;background:#ffffff0b;color:#e6ebff;font-weight:800;cursor:pointer}.world-title{display:flex;align-items:center;gap:12px}.world-title>span{display:grid;width:48px;height:48px;place-items:center;border-radius:15px;background:#a8c4ff20;font-size:1.7rem}.world-title p{margin:0 0 3px;color:#9fb8ff;font-size:.62rem;font-weight:900;letter-spacing:.16em}.world-title h2{margin:0;font-size:1.25rem}.tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px;padding:8px;border:1px solid #b8caff25;border-radius:16px;background:#080f2b99}.tabs button{flex:1;min-width:110px;padding:11px 9px;border:1px solid transparent;border-radius:11px;background:transparent;color:#cbd5f4;font-weight:800;cursor:pointer;transition:.2s}.tabs button:hover,.tabs button.active{border-color:#b3a9ff66;background:#7a6be94a;color:white}.fade-enter-active,.fade-leave-active{transition:opacity .2s ease,transform .2s ease}.fade-enter-from,.fade-leave-to{opacity:0;transform:translateY(7px)}@media(max-width:600px){.world-top{align-items:flex-start;flex-direction:column-reverse}.tabs button{min-width:calc(50% - 8px)}}
</style>
