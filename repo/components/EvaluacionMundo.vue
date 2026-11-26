<template>
  <section class="assessment">
    <div class="assessment-head"><div><p class="eyebrow">CONTROL DE LA MISIÓN</p><h3>Evaluación del mundo</h3><p>Responde las diez preguntas. Puedes revisar tus resultados y volver a intentarlo.</p></div><div class="counter">{{ respondidas }}/10</div></div>
    <div class="progress-track"><span :style="{width:`${respondidas*10}%`}"></span></div>
    <article v-for="(pregunta,index) in preguntas" :key="index" class="question-card">
      <h4><span>{{ index+1 }}.</span> {{ pregunta[0] }}</h4>
      <div class="options">
        <button v-for="(opcion,i) in pregunta[1]" :key="i" type="button" :disabled="terminada" :class="{chosen:respuestas[index]===i, right:terminada&&i===pregunta[2], wrong:terminada&&respuestas[index]===i&&i!==pregunta[2]}" @click="seleccionar(index,i)" @keydown="moverFoco($event)">
          <b>{{ String.fromCharCode(65+i) }}</b>{{ opcion }}
        </button>
      </div>
      <p v-if="terminada" class="explanation" :class="{good:respuestas[index]===pregunta[2]}">{{ respuestas[index]===pregunta[2]?'✓ Correcta':'✕ Revisa' }} — {{ pregunta[3] }}</p>
    </article>
    <div class="assessment-actions">
      <button v-if="!terminada" type="button" :disabled="respondidas!==10" @click="calificar">Calificar evaluación</button>
      <div v-else class="result"><strong>Resultado: {{ puntaje }}/10</strong><span>{{ puntaje>=8?'¡Excelente exploración!':puntaje>=6?'¡Buen trabajo, sigue practicando!':'Cada intento te ayuda a aprender. ¡Puedes repetir!' }}</span><button type="button" @click="reiniciar">Reintentar evaluación</button></div>
    </div>
  </section>
</template>
<script setup>
import {ref,computed,watch} from 'vue'
import { useCompletionSound } from '../composables/useCompletionSound'
const { playCompletionSound } = useCompletionSound()
const props=defineProps({preguntas:{type:Array,required:true},mundoId:{type:String,required:true}})
const emit=defineEmits(['completada'])
const respuestas=ref({})
const terminada=ref(false)
const respondidas=computed(()=>Object.keys(respuestas.value).length)
const puntaje=computed(()=>props.preguntas.reduce((total,p,i)=>total+(respuestas.value[i]===p[2]?1:0),0))
function seleccionar(i,opcion){if(!terminada.value)respuestas.value={...respuestas.value,[i]:opcion}}
function calificar(){
  if(respondidas.value===10){
    terminada.value=true
    playCompletionSound()
    emit('completada',{mundoId:props.mundoId,puntaje:puntaje.value,total:10})
  }
}
function moverFoco(event) {
  const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']
  if (!keys.includes(event.key)) return
  const botones = Array.from(event.currentTarget.parentElement.querySelectorAll('button:not(:disabled)'))
  const actual = botones.indexOf(event.currentTarget)
  if (actual < 0) return
  event.preventDefault()
  const siguiente = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    ? (actual + 1) % botones.length
    : (actual - 1 + botones.length) % botones.length
  botones[siguiente]?.focus()
}
function reiniciar(){respuestas.value={};terminada.value=false}
watch(()=>props.mundoId,reiniciar)
</script>
<style scoped>
.assessment{display:grid;gap:15px;color:#f5f7ff}.assessment-head{display:flex;justify-content:space-between;align-items:center;gap:15px}.eyebrow{margin:0 0 5px;color:#a8c5ff;font-size:.68rem;font-weight:900;letter-spacing:.16em}.assessment-head h3{margin:0;font-size:1.25rem}.assessment-head p:last-child{margin:7px 0 0;color:#c7d1ee;line-height:1.5}.counter{display:grid;flex:0 0 54px;aspect-ratio:1;place-items:center;border-radius:50%;background:#8b79ff30;border:1px solid #b8b1ff77;font-weight:900}.progress-track{height:7px;overflow:hidden;border-radius:9px;background:#ffffff18}.progress-track span{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#55d9c1,#8d85ff);transition:width .3s}.question-card{padding:17px;border:1px solid #b5c6ff28;border-radius:17px;background:#ffffff09}.question-card h4{margin:0 0 13px;font-size:.98rem;line-height:1.5}.question-card h4 span{color:#9edfff}.options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.options button{display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid #b7c7ff30;border-radius:12px;background:#111b3b;color:#eaf0ff;text-align:left;cursor:pointer;transition:transform .22s cubic-bezier(.2,.8,.2,1),border-color .22s ease,background .22s ease,box-shadow .22s ease}.options button:hover:not(:disabled),.options button:focus-visible,.options button.chosen{border-color:#a8a0ff;background:#554a9c55}.options button:hover:not(:disabled),.options button:focus-visible{transform:translateY(-3px) scale(1.015);box-shadow:0 8px 20px #02061555}.options button:focus-visible{outline:2px solid #b9eaff;outline-offset:3px}.options button b{display:grid;width:24px;height:24px;flex:0 0 24px;place-items:center;border-radius:8px;background:#ffffff17}.options button.right{border-color:#59e4b2;background:#1a88664d}.options button.wrong{border-color:#ff8c9c;background:#a83c5655}.options button:disabled{cursor:default}.explanation{margin:11px 0 0;color:#ffd4a2;font-size:.88rem;line-height:1.5}.explanation.good{color:#8af0c9}.assessment-actions>button,.result button{padding:13px 20px;border:0;border-radius:13px;background:linear-gradient(120deg,#8b68ff,#4f73f6);color:white;font-weight:900;cursor:pointer}.assessment-actions>button:disabled{opacity:.4;cursor:not-allowed}.result{display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding:17px;border-radius:16px;background:#ffffff12}.result strong{font-size:1.3rem;color:#ffe5a5}.result span{flex:1;min-width:190px;color:#dce4ff}.result button{background:#ffffff20;border:1px solid #ffffff35}@media(max-width:520px){.options{grid-template-columns:1fr}.assessment-head{align-items:flex-start}}
</style>
