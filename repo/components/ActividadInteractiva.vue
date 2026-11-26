<template>
  <section class="activity">
    <div class="section-title"><span>🧪</span><div><p class="eyebrow">LABORATORIO DE PRÁCTICA</p><h3>Resuelve la misión</h3></div></div>
    <p class="question">{{ actividad.pregunta }}</p>
    <form class="answer-row" @submit.prevent="comprobar">
      <label class="sr-only" for="respuesta-mision">Tu respuesta</label>
      <input id="respuesta-mision" v-model="respuesta" type="number" inputmode="numeric" placeholder="Escribe tu respuesta" :disabled="comprobado">
      <button type="submit" :disabled="respuesta === '' || comprobado">Comprobar</button>
    </form>
    <Transition name="feedback-pop"><div v-if="comprobado" class="feedback" :class="{correct: acierto}">
      <strong>{{ acierto ? '¡Misión cumplida! ✨' : '¡Sigue intentando! 🚀' }}</strong>
      <p>{{ acierto ? 'Tu respuesta es correcta.' : `La respuesta correcta es ${actividad.respuesta}.` }} {{ actividad.ayuda }}</p>
      <button type="button" @click="reiniciar">{{ acierto ? 'Practicar otra vez' : 'Volver a intentar' }}</button>
    </div></Transition>
  </section>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useCompletionSound } from '../composables/useCompletionSound'
const { playCompletionSound } = useCompletionSound()
const props=defineProps({actividad:{type:Object,required:true},mundoId:{type:String,required:true}})
const respuesta=ref('')
const comprobado=ref(false)
const acierto=computed(()=>Number(respuesta.value)===Number(props.actividad.respuesta))
function comprobar(){comprobado.value=true;if(acierto.value)playCompletionSound()}
function reiniciar(){respuesta.value='';comprobado.value=false}
watch(()=>props.mundoId,reiniciar)
</script>
<style scoped>
.activity{padding:22px;border:1px solid #8dd8ff3d;border-radius:22px;background:linear-gradient(135deg,#173b6380,#29275a70);color:#f7f8ff}.section-title{display:flex;align-items:center;gap:12px}.section-title>span{font-size:2rem}.eyebrow{margin:0 0 4px;color:#9edfff;font-size:.68rem;font-weight:900;letter-spacing:.16em}.section-title h3{margin:0;font-size:1.2rem}.question{margin:20px 0;font-size:1.05rem;line-height:1.65}.answer-row{display:flex;gap:10px}.answer-row input{min-width:0;flex:1;padding:13px 15px;border:1px solid #c8d7ff55;border-radius:13px;background:#101a3d;color:white;font:inherit}.answer-row button,.feedback button{padding:12px 18px;border:0;border-radius:13px;background:linear-gradient(120deg,#8a68ff,#4f73f6);color:white;font-weight:900;cursor:pointer}.answer-row button:disabled{opacity:.5;cursor:not-allowed}.feedback-pop-enter-active,.feedback-pop-leave-active{transition:opacity .24s ease,transform .24s ease}.feedback-pop-enter-from,.feedback-pop-leave-to{opacity:0;transform:translateY(10px) scale(.98)}.feedback{margin-top:17px;padding:15px;border-radius:15px;background:#ffbd6740;border:1px solid #ffcb7b66}.feedback.correct{background:#2bd5a52a;border-color:#5be4bd77}.feedback p{margin:7px 0 12px;line-height:1.5}.feedback button{background:#ffffff1c;border:1px solid #ffffff35}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:480px){.answer-row{flex-direction:column}}
</style>
