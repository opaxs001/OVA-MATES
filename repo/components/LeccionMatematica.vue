<template>
  <section class="lesson">
    <div class="hero">
      <div><p class="eyebrow">BITÁCORA DE EXPLORACIÓN</p><h2>{{ mundo.titulo }}</h2><p>{{ mundo.intro }}</p></div>
      <div class="planet-art" aria-hidden="true"><span>{{ mundo.icono }}</span><i></i><b>✦</b></div>
    </div>
    <h3>Conceptos para tu misión</h3>
    <div class="concept-grid">
      <article v-for="(concepto, i) in mundo.conceptos" :key="concepto[0]" class="concept">
        <span class="concept-number">{{ i + 1 }}</span><h4>{{ concepto[0] }}</h4><p>{{ concepto[1] }}</p>
      </article>
    </div>
    <div class="example"><span class="example-icon">💡</span><div><strong>Ejemplo ilustrado</strong><p>{{ mundo.ejemplo }}</p></div></div>
    <div class="visual-strip" aria-label="Ilustración espacial">
      <span v-for="symbol in symbols" :key="symbol">{{ symbol }}</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ mundo: { type: Object, required: true } })
const symbols = computed(() => props.mundo.id === 'multiplicacion' ? ['🛰️','🛰️','🛰️','🛰️','×','📦','📦','📦'] : props.mundo.id === 'division' ? ['💎','💎','💎','💎','÷','🪐','🪐','🪐'] : props.mundo.id === 'patrones' ? ['⭐','🌙','⭐','🌙','⭐','🌙','⭐'] : props.mundo.id === 'problemas' ? ['🚀','🧑‍🚀','🪐','🔭','🧩'] : ['⭐','⭐','＋','🌟','−','✨'])
</script>

<style scoped>
.lesson{display:grid;gap:22px;color:#f5f6ff}.hero{display:flex;align-items:center;justify-content:space-between;gap:22px;padding:24px;border:1px solid #aebfff35;border-radius:24px;background:linear-gradient(120deg,#202b62b8,#6d58a533)}.eyebrow{margin:0 0 8px;color:#9edfff;font-size:.7rem;font-weight:900;letter-spacing:.18em}.hero h2{margin:0 0 10px;font-size:clamp(1.5rem,3vw,2.2rem)}.hero p:last-child{max-width:680px;margin:0;color:#d1daf8;line-height:1.7}.planet-art{position:relative;display:grid;flex:0 0 116px;aspect-ratio:1;place-items:center;border:1px solid #dbe5ff88;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff,#83a9ff 25%,#6457d8 60%,#242b70);box-shadow:0 0 42px #7c8dff66,inset -12px -12px 20px #11194388}.planet-art span{font-size:2.4rem}.planet-art i{position:absolute;width:135%;height:35%;border:3px solid #d6e5ffb0;border-radius:50%;transform:rotate(-25deg)}.planet-art b{position:absolute;top:-4px;right:2px;color:#fff3a8}.lesson h3{margin:0;font-size:1.2rem}.concept-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.concept{position:relative;padding:19px 18px 17px 54px;border:1px solid #b8c8ff28;border-radius:18px;background:#ffffff0b}.concept-number{position:absolute;top:17px;left:16px;display:grid;width:27px;height:27px;place-items:center;border-radius:9px;background:#7c83ff40;color:#dce5ff;font-weight:900}.concept h4{margin:0 0 7px;color:#c9d7ff}.concept p{margin:0;color:#d7def5;line-height:1.6;font-size:.92rem}.example{display:flex;gap:15px;padding:20px;border:1px solid #f4d58c55;border-radius:18px;background:linear-gradient(110deg,#d59b3520,#ffffff08)}.example-icon{font-size:1.7rem}.example strong{color:#ffe3a4}.example p{margin:7px 0 0;color:#f1e8d5;line-height:1.65}.visual-strip{display:flex;justify-content:center;flex-wrap:wrap;gap:clamp(10px,3vw,28px);padding:17px;border-radius:18px;background:#101a3d99;font-size:clamp(1.5rem,4vw,2.5rem)}.visual-strip span{animation:float 3.5s ease-in-out infinite alternate}.visual-strip span:nth-child(even){animation-delay:-1.4s}@keyframes float{to{transform:translateY(-7px) rotate(8deg)}}@media(max-width:600px){.hero{padding:18px}.planet-art{flex-basis:76px}.planet-art span{font-size:1.7rem}.concept-grid{grid-template-columns:1fr}}
</style>
