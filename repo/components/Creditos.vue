<template>
  <section class="credits">
    <p class="eyebrow">TRIPULACIÓN DE ASTROMAT</p>
    <h3>Créditos del proyecto</h3>
    <p class="intro">Conoce a las personas que hicieron posible esta misión de aprendizaje.</p>

    <h4 class="section-heading">Integrantes</h4>
    <div class="crew-grid">
      <article v-for="integrante in integrantes" :key="integrante.nombre" class="crew-card">
        <div class="photo-slot">
          <img :src="integrante.foto" :alt="`Fotografía de ${integrante.nombre}`" loading="lazy">
        </div>
        <h5>{{ integrante.nombre }}</h5>
      </article>
    </div>

    <h4 class="section-heading">Docente</h4>
    <div class="teacher-grid">
      <article class="crew-card teacher-card">
        <div class="photo-slot">
          <img :src="docente.foto" :alt="`Fotografía de ${docente.nombre}`" loading="lazy">
        </div>
        <div class="teacher-info">
          <span class="role-badge">Docente responsable</span>
          <h5>{{ docente.nombre }}</h5>
        </div>
      </article>
    </div>

    <h4 class="section-heading">Información institucional</h4>
    <dl class="institution">
      <div class="inst-item">
        <dt>Universidad</dt>
        <dd>Universidad de Córdoba</dd>
      </div>
      <div class="inst-item">
        <dt>Programa</dt>
        <dd>Licenciatura en Informática</dd>
      </div>
      <div class="inst-item">
        <dt>Asignatura</dt>
        <dd>Fundamentos de programación</dd>
      </div>
      <div class="inst-item">
        <dt>Facultad</dt>
        <dd>Facultad de educación y ciencias humanas</dd>
      </div>
      <div class="inst-item">
        <dt>Lugar</dt>
        <dd>Montería</dd>
      </div>
      <div class="inst-item">
        <dt>Año</dt>
        <dd>2026</dd>
      </div>
    </dl>

    <p class="sources">
      <strong>Fuentes de apoyo:</strong> materiales educativos de Mundo Primaria y videos de YouTube enlazados en la biblioteca de recursos. Las fotografías corresponden al equipo del proyecto.
    </p>
  </section>
</template>

<script setup>
const ruta = useRutaPublica()
const integrantes = [
  { nombre: 'Sherik Hernández', foto: ruta('fotos-integrantes/Sherik Hernández.jpeg') },
  { nombre: 'Daniel Galarcio', foto: ruta('fotos-integrantes/Daniel Galarcio.jpeg') },
  { nombre: 'Karol Bustamante', foto: ruta('fotos-integrantes/Karol Bustamante.jpeg') }
]

const docente = {
  nombre: 'Camilo Mendoza',
  foto: ruta('fotos-integrantes/Camilo Mendoza.jpg')
}
</script>

<style scoped>
.credits { color: #f5f7ff; }
.eyebrow { margin: 0 0 6px; color: #a8c5ff; font-size: .68rem; font-weight: 900; letter-spacing: .16em; }
.credits h3 { margin: 0; font-size: 1.35rem; }
.intro { color: #c7d1ee; line-height: 1.5; margin-bottom: 18px; }
.section-heading { margin: 22px 0 12px; color: #b7d4ff; font-size: .95rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
.crew-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.teacher-grid { display: grid; grid-template-columns: minmax(0, 420px); }
.crew-card { padding: 14px; border: 1px solid #b9caff30; border-radius: 17px; background: #ffffff0b; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
.crew-card:hover { transform: translateY(-4px); border-color: #9ec5ff77; box-shadow: 0 12px 26px #03071d55; }
.teacher-card { display: flex; align-items: center; gap: 16px; }
.teacher-card .photo-slot { width: 108px; flex: 0 0 108px; margin-bottom: 0; }
.teacher-info { display: grid; gap: 6px; }
.role-badge { display: inline-block; width: fit-content; padding: 4px 10px; border-radius: 999px; background: #7f6eff38; border: 1px solid #b6abff55; color: #dce3ff; font-size: .72rem; font-weight: 800; }
.photo-slot { display: grid; aspect-ratio: 1; place-items: center; overflow: hidden; margin-bottom: 12px; border: 1px solid #aebfff55; border-radius: 13px; background: #111b3b; }
.photo-slot img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s cubic-bezier(.2, .8, .2, 1); }
.crew-card:hover .photo-slot img { transform: scale(1.055); }
.crew-card h5 { margin: 0; color: #f3f6ff; font-size: 1rem; text-align: center; }
.teacher-card h5 { text-align: left; font-size: 1.08rem; }
.institution { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 18px; border: 1px solid #b9caff30; border-radius: 17px; background: #ffffff09; }
.inst-item { padding: 10px 12px; border-radius: 12px; background: #101a3d99; border: 1px solid #b9caff22; }
.inst-item dt { color: #9ec5ff; font-size: .75rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
.inst-item dd { margin: 4px 0 0; color: #f5f7ff; font-size: .95rem; font-weight: 700; }
.sources { margin: 18px 0 0; color: #c3cde9; font-size: .85rem; line-height: 1.6; }
.sources strong { color: #ffe2a1; }

@media (max-width: 700px) {
  .crew-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 480px) {
  .crew-grid, .institution { grid-template-columns: 1fr; }
  .teacher-card { flex-direction: column; text-align: center; }
  .teacher-card h5 { text-align: center; }
  .role-badge { margin: 0 auto; }
}
@media (prefers-reduced-motion: reduce) {
  .crew-card, .photo-slot img { transition: none !important; }
}
</style>
