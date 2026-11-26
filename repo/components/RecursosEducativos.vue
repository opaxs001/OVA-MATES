<template>
  <section class="resources">
    <p class="eyebrow">BIBLIOTECA ESTELAR</p><h3>Recursos para seguir explorando</h3>
    <p class="intro">Material complementario para reforzar lo aprendido en cada mundo.</p>
    <div class="resource-grid">
      <article v-for="(item,i) in recursos" :key="item[0]" class="resource-card">
        <span class="resource-icon">{{ i%2===0?'▶':'🎮' }}</span><div><h4>{{ item[0] }}</h4><p>{{ item[1] }}</p><a :href="item[2]" target="_blank" rel="noopener noreferrer">Abrir recurso ↗</a></div>
      </article>
    </div>
  </section>
</template>
<script setup>
import {computed} from 'vue'
const props=defineProps({mundos:{type:Array,required:true}})
const recursos=computed(()=>props.mundos.flatMap(m=>m.recursos.map(r=>[r[0],`${m.titulo}: ${r[1]}`,r[2]])))
</script>
<style scoped>
.resources{color:#f5f7ff}.eyebrow{margin:0 0 6px;color:#a8c5ff;font-size:.68rem;font-weight:900;letter-spacing:.16em}.resources h3{margin:0;font-size:1.3rem}.intro{color:#c7d1ee}.resource-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}.resource-card{display:flex;gap:13px;padding:17px;border:1px solid #b9caff30;border-radius:17px;background:#ffffff0b}.resource-icon{display:grid;width:40px;height:40px;flex:0 0 40px;place-items:center;border-radius:13px;background:#817aff35}.resource-card h4{margin:0 0 6px;color:#dce5ff}.resource-card p{margin:0 0 10px;color:#c4cfea;font-size:.9rem;line-height:1.5}.resource-card a{color:#9ce6ff;font-weight:800;text-decoration:none}.resource-card a:hover{text-decoration:underline}@media(max-width:620px){.resource-grid{grid-template-columns:1fr}}
</style>
